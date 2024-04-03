import {debounce, getAllTags, MarkdownView, normalizePath, Notice, Plugin, TAbstractFile, TFile} from 'obsidian';
import {FileMetadata, Rule, RuleProcessor} from 'src/RuleProcessor'
import {
	AutoFileGrouperSettingTab,
	DEFAULT_SETTINGS,
	FolderByTagGroupingSettings,
	FolderGroupPattern,
	pluginName
} from './src/settings';
import {fileMove, getTriggerIndicator, isFmDisable} from 'src/utils';

export default class FolderByTagGrouping extends Plugin {
	settings: FolderByTagGroupingSettings;

	async onload() {
		await this.loadSettings();
		const folderTagPattern = this.settings.groupingPatters;
		const excludedFolder = this.settings.excludedFolder;


		const fileCheck = (file: TAbstractFile, oldPath?: string, caller?: string) => {
			if (!this.settings.autoTrigger && caller !== 'cmd') {
				return;
			}
			if (!(file instanceof TFile)) return;

			// The rename event with no basename change will be terminated.
			if (oldPath && oldPath.split('/').pop() === file.basename + '.' + file.extension) {
				return;
			}

			// Excluded Folder check
			const excludedFolderLength = excludedFolder.length;
			for (let i = 0; i < excludedFolderLength; i++) {
				if (
					!this.settings.regexExcludedTagChecker &&
					excludedFolder[i].folder &&
					file.parent?.path === normalizePath(excludedFolder[i].folder)
				) {
					return;
				} else if (this.settings.regexExcludedTagChecker && excludedFolder[i].folder) {
					const regex = new RegExp(excludedFolder[i].folder);
					if (file.parent) {
						if (regex.test(file.parent.path)) {
							return;
						}
					}
				}
			}

			const fileCache = this.app.metadataCache.getFileCache(file);
			if (null === fileCache || isFmDisable(fileCache)) {
				return;
			}

			// transform pattern settings to Rules
			const rules: Rule[] = folderTagPattern.map((ftp:FolderGroupPattern) => ({
				tagMatch: ftp.tag,
				pathSpec: ftp.folder
			}));

			const rp = new RuleProcessor(rules);

			const fileName = file.basename;
			const fileFullName = file.basename + '.' + file.extension;

			const fileMetadata: FileMetadata = {
				tags: getAllTags(fileCache)??[],
				title: fileName,
				frontMatter: fileCache.frontmatter ?? {}
			}

			const movePath = rp.getDestinationPath(fileMetadata);
			if (movePath) {
				console.log('movePath', movePath);
				fileMove(this, movePath, fileFullName, file);
			}
		};

		// Show trigger indicator on status bar
		let triggerIndicator: HTMLElement;
		const setIndicator = () => {
			if (!this.settings.triggerStatusBarIndicator) return;
			triggerIndicator.setText(getTriggerIndicator(this.settings.autoTrigger));
		};
		if (this.settings.triggerStatusBarIndicator) {
			triggerIndicator = this.addStatusBarItem();
			setIndicator();
			// TODO: Find a better way
			this.registerDomEvent(window, 'change', setIndicator);
		}

		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(this.app.vault.on('create', (file) => debounce(fileCheck, 200, true)(file)));
			this.registerEvent(this.app.metadataCache.on('changed', (file) => debounce(fileCheck, 200, true)(file)));
			this.registerEvent(this.app.vault.on('rename', (file, oldPath) => debounce(fileCheck, 200, true)(file, oldPath)));
		});

		const moveNoteCommand = (view: MarkdownView) => {
			const {file} = view
			if (null === file) {
				throw new Error(`${pluginName} no file specified`)
			}
			const data = this.app.metadataCache.getFileCache(file)
			if (null ===data) {
				throw new Error(`${pluginName} No file metadata found`)
			}
			if (isFmDisable(data)) {
				new Notice(`${pluginName} is disabled in the frontmatter.`);
				return;
			}
			fileCheck(file, undefined, 'cmd');
		};

		const moveAllNotesCommand = () => {
			const files = this.app.vault.getMarkdownFiles();
			const filesLength = files.length;
			for (let i = 0; i < filesLength; i++) {
				fileCheck(files[i], undefined, 'cmd');
			}
			new Notice(`All ${filesLength} notes have been moved.`);
		};

		this.addCommand({
			id: 'Move-the-note',
			name: 'Move the note',
			checkCallback: (checking: boolean) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						moveNoteCommand(markdownView);
					}
					return true;
				}
			},
		});

		this.addCommand({
			id: 'Move-all-notes',
			name: 'Move all notes',
			callback: () => {
				moveAllNotesCommand();
			},
		});

		this.addCommand({
			id: 'Toggle-Auto',
			name: 'Toggle Auto',
			callback: () => {
				if (this.settings.autoTrigger) {
					this.settings.autoTrigger = false;
					this.saveData(this.settings);
					new Notice(`[${pluginName}] Trigger is Manual.`);
				} else if (!this.settings.autoTrigger) {
					this.settings.autoTrigger = true;
					this.saveData(this.settings);
					new Notice(`[${pluginName}]
Trigger is Automatic.`);
				}
				setIndicator();
			},
		});

		this.addSettingTab(new AutoFileGrouperSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
