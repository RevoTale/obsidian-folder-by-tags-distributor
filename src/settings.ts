import {App, ButtonComponent, PluginSettingTab, Setting} from 'obsidian';

import {FolderSuggest} from 'src/file-suggest';
import {arrayMove} from 'src/utils';
import FolderByTagGrouping from "../main";
export const pluginName = 'Folder By Tag Grouping'
export type FolderGroupPattern = {
	folder: string;
	tag: string;
	pattern: string;
}

export type ExcludedFolder = {
	folder: string;
}

export interface FolderByTagGroupingSettings {
	autoTrigger: boolean;
	regexTagChecker: boolean;
	triggerStatusBarIndicator: boolean;
	groupingPatters: Array<FolderGroupPattern>;
	regexExcludedTagChecker: boolean;
	excludedFolder: Array<ExcludedFolder>;
	createFolders: boolean;
}

export const DEFAULT_SETTINGS: FolderByTagGroupingSettings = {
	autoTrigger: true,
	regexTagChecker: false,
	triggerStatusBarIndicator: true,
	groupingPatters: [{folder: '', tag: '', pattern: ''}],
	regexExcludedTagChecker: false,
	excludedFolder: [{folder: ''}],
	createFolders: false,
};

export class AutoFileGrouperSettingTab extends PluginSettingTab {

	constructor(app: App, public plugin: FolderByTagGrouping) {
		super(app, plugin);
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		this.containerEl.empty();
		this.addPluginSettings();
	}

	protected addPluginSettings(): void {
		this.containerEl.createEl('h2', {text: 'Folder By Tag Grouping'});

		const descEl = document.createDocumentFragment();

		new Setting(this.containerEl).setDesc(
			'Folder grouping by notes will automatically move the active notes to their respective folders according to the rules.'
		);

		const triggerDesc = document.createDocumentFragment();
		triggerDesc.append(
			'Choose how the trigger will be activated.',
			descEl.createEl('br'),
			descEl.createEl('strong', {text: 'Auto '}),
			'is triggered when you create, edit, or rename a note, and moves the note if it matches the rules.',
			descEl.createEl('br'),
			'You can also activate the trigger with a command.',
			descEl.createEl('br'),
			descEl.createEl('strong', {text: 'Manual '}),
			'will not automatically move notes.',
			descEl.createEl('br'),
			'You can trigger by command.'
		);
		new Setting(this.containerEl)
			.setName('Auto trigger')
			.setDesc(triggerDesc)
			.addToggle((component) => {
					component.setValue(this.plugin.settings.autoTrigger).onChange((value) => {
						this.plugin.settings.autoTrigger = value;
						void this.plugin.saveData(this.plugin.settings);
						this.display();
					})
				}
			);

		const ruleDesc = document.createDocumentFragment();
		ruleDesc.append(
			'1. Set the destination folder.',
			descEl.createEl('br'),
			'2. Create an expression that matches the note you want to move. ',
			descEl.createEl('strong', {text: 'use and(&) or(|) not(!) and parens(()). use [] for values. `example: tag[nohash]&project[myproj]'}),
			descEl.createEl('br'),
			'3. The rules are checked in order from the top. The notes will be moved to the folder with the ',
			descEl.createEl('strong', {text: 'first matching rule.'}),
			descEl.createEl('br'),
			descEl.createEl('br'),
			'Notice:',
			descEl.createEl('br'),
			'1. Attached files will not be moved, but they will still appear in the note.',
			descEl.createEl('br'),
			'2. FolderByTagGrouping will not move notes that have "',
			descEl.createEl('strong', {text: 'FolderByTagGrouping: disable'}),
			'" in the frontmatter.'
		);
		new Setting(this.containerEl)

			.setName('Add new rule')
			.setDesc(ruleDesc)
			.addButton((button: ButtonComponent) => {
				button
					.setTooltip('Add new rule')
					.setButtonText('+')
					.setCta()
					.onClick(async () => {
						this.plugin.settings.groupingPatters.push({
							folder: '',
							tag: '',
							pattern: '',
						});
						await this.plugin.saveSettings();
						this.display();
					});
			});

		this.plugin.settings.groupingPatters.forEach((groupingPatters, index) => {
const {containerEl} = this
			const s = new Setting(containerEl)
				.addSearch((cb) => {
					new FolderSuggest(this.app,containerEl, cb.inputEl);
					cb.setPlaceholder('Folder')
						.setValue(groupingPatters.folder)
						.onChange(async (newFolder) => {
							this.plugin.settings.groupingPatters[index].folder = newFolder.trim();
							await this.plugin.saveSettings();
						});
				})

				.addText((cb) => {
					// new TagSuggest(this.app, cb.inputEl);

					cb.setPlaceholder('Condition')
						.setValue(groupingPatters.tag)
						.onChange(async (newTag) => {
							this.plugin.settings.groupingPatters[index].tag = newTag.trim();
							await this.plugin.saveSettings();
						});
				})

				.addExtraButton((cb) => {
					cb.setIcon('up-chevron-glyph')
						.setTooltip('Move up')
						.onClick(async () => {
							arrayMove(this.plugin.settings.groupingPatters, index, index - 1);
							await this.plugin.saveSettings();
							this.display();
						});
				})
				.addExtraButton((cb) => {
					cb.setIcon('down-chevron-glyph')
						.setTooltip('Move down')
						.onClick(async () => {
							arrayMove(this.plugin.settings.groupingPatters, index, index + 1);
							await this.plugin.saveSettings();
							this.display();
						});
				})
				.addExtraButton((cb) => {
					cb.setIcon('cross')
						.setTooltip('Delete')
						.onClick(async () => {
							this.plugin.settings.groupingPatters.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						});
				});
			s.infoEl.remove();
		});

		new Setting(this.containerEl)
			.setName('Create Folders if they don\'t exist')
			.setDesc('This can be especially useful when using capture groups in the destination folder.')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.createFolders).onChange(async (value) => {
					this.plugin.settings.createFolders = value;
					await this.plugin.saveSettings();
					this.display();
				});
			});

		const useRegexToCheckForExcludedFolder = document.createDocumentFragment();
		useRegexToCheckForExcludedFolder.append(
			'If enabled, excluded folder will be checked with regular expressions.'
		);

		new Setting(this.containerEl)
			.setName('Use regular expressions to check for excluded folder')
			.setDesc(useRegexToCheckForExcludedFolder)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.regexExcludedTagChecker).onChange(async (value) => {
					this.plugin.settings.regexExcludedTagChecker = value;
					await this.plugin.saveSettings();
					this.display();
				});
			});

		const excludedFolderDesc = document.createDocumentFragment();
		excludedFolderDesc.append(
			'Notes in the excluded folder will not be moved.',
			descEl.createEl('br'),
			'This takes precedence over the notes movement rules.'
		);
		new Setting(this.containerEl)

			.setName('Add Excluded Folder')
			.setDesc(excludedFolderDesc)
			.addButton((button: ButtonComponent) => {
				button
					.setTooltip('Add Excluded Folders')
					.setButtonText('+')
					.setCta()
					.onClick(async () => {
						this.plugin.settings.excludedFolder.push({
							folder: '',
						});
						await this.plugin.saveSettings();
						this.display();
					});
			});

		this.plugin.settings.excludedFolder.forEach((excludedFolder, index) => {
			const {containerEl} = this
			const s = new Setting(containerEl)
				.addSearch((cb) => {
					new FolderSuggest(this.app, containerEl,cb.inputEl);
					cb.setPlaceholder('Folder')
						.setValue(excludedFolder.folder)
						.onChange(async (newFolder) => {
							this.plugin.settings.excludedFolder[index].folder = newFolder;
							await this.plugin.saveSettings();
						});
				})

				.addExtraButton((cb) => {
					cb.setIcon('up-chevron-glyph')
						.setTooltip('Move up')
						.onClick(async () => {
							arrayMove(this.plugin.settings.excludedFolder, index, index - 1);
							await this.plugin.saveSettings();
							this.display();
						});
				})
				.addExtraButton((cb) => {
					cb.setIcon('down-chevron-glyph')
						.setTooltip('Move down')
						.onClick(async () => {
							arrayMove(this.plugin.settings.excludedFolder, index, index + 1);
							await this.plugin.saveSettings();
							this.display();
						});
				})
				.addExtraButton((cb) => {
					cb.setIcon('cross')
						.setTooltip('Delete')
						.onClick(async () => {
							this.plugin.settings.excludedFolder.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						});
				});
			s.infoEl.remove();
		});

		const statusBarTriggerIndicatorDesc = document.createDocumentFragment();
		statusBarTriggerIndicatorDesc.append(
			'The status bar will display [A] if the trigger is Auto, and [M] for Manual.',
			descEl.createEl('br'),
			'To change the setting, you need to restart Obsidian.',
			descEl.createEl('br'),
			'Desktop only.'
		);
		new Setting(this.containerEl)
			.setName('Status Bar Trigger Indicator')
			.setDesc(statusBarTriggerIndicatorDesc)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.triggerStatusBarIndicator).onChange(async (value) => {
					this.plugin.settings.triggerStatusBarIndicator = value;
					await this.plugin.saveSettings();
					this.display();
				});
			});
	}
}
