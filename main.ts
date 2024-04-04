import {Menu, Notice, parseFrontMatterTags, Plugin, TFile, TFolder} from 'obsidian';
import {PluginSettingsTab} from "./src/PluginSettingsTab";

export const DEFAULT_SETTINGS: FolderByTagsDistributorSettings = {
	addRibbon: false,
	useContentTags: false,
	useFrontMatterTags: true,
}
export type FolderByTagsDistributorSettings = {
	addRibbon: boolean
	useFrontMatterTags: boolean
	useContentTags: boolean
}
export default class FolderByTagsDistributor extends Plugin {
	settings: FolderByTagsDistributorSettings;

	private getExistingFolderForTags(tags: string[]): TFolder | null {
		let currentFolder = this.app.vault.getRoot()
		for (const tag in tags) {
			const newPath = `${currentFolder.path}/${tag}`
			const folder = this.app.vault.getFolderByPath(newPath)
			if (folder) {
				currentFolder = folder
			}
		}
		console.log(`Found folder ${currentFolder.path} for tags ${tags.join(', ')}.`)
		return currentFolder
	}

	private resolveTagsForFolderDistribution(file: TFile) {
		const {useContentTags, useFrontMatterTags} = this.settings
		const cache = this.app.metadataCache.getFileCache(file)
		if (cache) {
			const tags: string[] = []
			if (useContentTags) {
				const contentTags = cache.tags
				if (contentTags) {
					tags.push(...contentTags.map(item => item.tag))
				}
			}
			if (useFrontMatterTags) {
				const frontMatterTags = parseFrontMatterTags(cache.frontmatter)
				if (frontMatterTags) {
					tags.push(...frontMatterTags)
				}
			}
			return tags
		}
		return null
	}

	public async redistributeAllNotes() {
		const files = this.app.vault.getMarkdownFiles()
		for (const file of files) {
			const tags = this.resolveTagsForFolderDistribution(file)
			console.log(`Resolving file ${file.path} for tags ${tags?.join(', ')}`)
			if (tags && tags.length > 0) {
				const folderForTags = this.getExistingFolderForTags(tags)
				if (folderForTags) {
					if (file.parent?.path !== folderForTags.path) {
						new Notice(`Moving file ${file.name} to ${folderForTags.path}`)
						await this.app.vault.rename(file, `${folderForTags.path}/${file.name}`)
					}
				}
			}
		}
	}

	async onload() {
		await this.loadSettings();
		this.addCommand({
			id: 'redistribute-all-notes-between-the-folders-by-tags',
			name: "Redistribute All Notes Between The Folders By Tags",
			callback: () => {
				this.redistributeAllNotes()
			},
		});
		if (this.settings.addRibbon) {
			this.addRibbonIcon("sync", "Redistribute All Notes Between The Folders By Tags", (event) => {
				const menu = new Menu();
				menu.addItem((item) =>
					item
						.setTitle("Redistribute")
						.setIcon("sync")
						.onClick(() => {
							this.redistributeAllNotes()
						})
				);


				menu.showAtMouseEvent(event);
			});
		}
		this.addSettingTab(new PluginSettingsTab(this.app, this));
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
