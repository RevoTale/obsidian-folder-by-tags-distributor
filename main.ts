import {Notice, parseFrontMatterTags, Plugin, TFile, TFolder} from 'obsidian';
import {PluginSettingsTab} from "./src/PluginSettingsTab";

export const DEFAULT_SETTINGS: FolderByTagsDistributorSettings = {
	addRibbon: false,
	useContentTags: false,
	useFrontMatterTags: true,
	forceSequentialTags: false
}
export type FolderByTagsDistributorSettings = {
	addRibbon: boolean
	useFrontMatterTags: boolean
	useContentTags: boolean
	forceSequentialTags: boolean
}
const stripTag = (tag: string): string => {
	return tag.replace(/^#/, '');
}
const normalizeFolderPath = (name: string) => {
	if (name === '/') {
		return ''
	}
	return name
}
const capitalizeFirstLetter = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
export default class FolderByTagsDistributor extends Plugin {
	settings: FolderByTagsDistributorSettings;

	private getExactFolder(tag: string): string {
		return stripTag(tag)
	}

	private getUpperLetterFolder(tag: string): string {
		return capitalizeFirstLetter(stripTag(tag))

	}

	private getCapitalizedFolder(tag: string): string {
		return stripTag(tag).toUpperCase()
	}

	private getUnderScoreFolder(tag: string): string {
		return stripTag(tag).split('_').map(word => capitalizeFirstLetter(word)).join(' ')
	}

	private resolveFolderName(currentFolder: TFolder, tag: string): TFolder | null {
		for (const func of [this.getExactFolder, this.getUpperLetterFolder, this.getCapitalizedFolder, this.getUnderScoreFolder]) {
			const strippedTag = stripTag(tag)
			const currenFolderPath = normalizeFolderPath(currentFolder.path)
			const childFolderName = func(strippedTag)
			const folderPath = currenFolderPath === '' ? childFolderName : `${currenFolderPath}/${childFolderName}`
			const folder = this.app.vault.getFolderByPath(folderPath)
			if (folder) {
				return folder
			}

		}
		return null
	}

	private fulfilAlgo(tags: string[]): TFolder {
		let currentFolder = this.app.vault.getRoot()
		const remainingTags = [...tags]
		let i = 0
		while (i < remainingTags.length) {
			const currentTag = remainingTags[i]
			if (!currentTag) {
				console.error(`Accessed bad index ${i}`)
				break
			}
			const folder = this.resolveFolderName(currentFolder, currentTag);
			if (folder) {
				currentFolder = folder
				remainingTags.remove(currentTag)
				i = 0
			} else {
				i++
			}

		}
		return currentFolder
	}

	private sequentialAlgo(tags: string[]): TFolder {
		let currentFolder = this.app.vault.getRoot()
		for (const tag of tags) {
			const folder = this.resolveFolderName(currentFolder, tag);
			if (folder) {
				currentFolder = folder
			}
		}
		return currentFolder
	}

	private getExistingFolderForTags(tags: string[]): TFolder | null {
		if (this.settings.forceSequentialTags) {
			this.sequentialAlgo(tags)
		}
		return this.fulfilAlgo(tags)
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
			if (tags && tags.length > 0) {
				const folderForTags = this.getExistingFolderForTags(tags)
				if (folderForTags) {
					if (file.parent?.path !== folderForTags.path) {
						new Notice(`Moving file "${file.name}" to "${folderForTags.path}" folder`)
						await this.app.vault.rename(file, `${normalizeFolderPath(folderForTags.path)}/${file.name}`)
					}
				}
			}
		}
	}

	private loadLayout() {
		this.addCommand({
			id: 'redistribute-all-notes-between-the-folders-by-tags',
			name: "Redistribute all notes to folder by tags",
			callback: () => {
				void this.redistributeAllNotes()
			},
		});
		if (this.settings.addRibbon) {
			this.addRibbonIcon("sync", "Redistribute all notes to folder by tags", () => {
				void this.redistributeAllNotes()
			});
		}
		this.addSettingTab(new PluginSettingsTab(this.app, this));
	}

	async onload() {
		await this.loadSettings();
		this.loadLayout()
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
