import {Notice, parseFrontMatterTags, Plugin, TFile, TFolder} from 'obsidian';
import {PluginSettingsTab} from "./src/PluginSettingsTab";

export const DEFAULT_SETTINGS: FolderByTagsDistributorSettings = {
	addRibbon: false,
	useContentTags: false,
	useFrontMatterTags: true,
	forceSequentialTags:false
}
export type FolderByTagsDistributorSettings = {
	addRibbon: boolean
	useFrontMatterTags: boolean
	useContentTags: boolean
	forceSequentialTags:boolean
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

	private getExactFolder(currentFolder: TFolder, tag: string): TFolder | null {
		const newPath = `${normalizeFolderPath(currentFolder.path)}${stripTag(tag)}`

		return this.app.vault.getFolderByPath(newPath)
	}

	private getUpperLetterFolder(currentFolder: TFolder, tag: string): TFolder | null {
		const newPath = `${normalizeFolderPath(currentFolder.path)}${capitalizeFirstLetter(stripTag(tag))}`

		return this.app.vault.getFolderByPath(newPath)
	}

	private getCapitalizedFolder(currentFolder: TFolder, tag: string): TFolder | null {
		const newPath = `${normalizeFolderPath(currentFolder.path)}${(stripTag(tag).toUpperCase())}`

		return this.app.vault.getFolderByPath(newPath)
	}

	private getUnderScoreFolder(currentFolder: TFolder, tag: string): TFolder | null {
		tag = stripTag(tag)
		const words = tag.split('_').map(word => capitalizeFirstLetter(word))
		const newPath = `${normalizeFolderPath(currentFolder.path)}${(words.join(' '))}`

		return this.app.vault.getFolderByPath(newPath)
	}

	private resolveFolderName(currentFolder: TFolder, tag: string): TFolder | null {
		return  this.getExactFolder(currentFolder, tag)
			|| this.getUpperLetterFolder(currentFolder, tag)
			|| this.getCapitalizedFolder(currentFolder, tag)
			|| this.getUnderScoreFolder(currentFolder, tag)
	}

	private getExistingFolderForTags(tags: string[]): TFolder | null {
		let currentFolder = this.app.vault.getRoot()
		if (this.settings.forceSequentialTags) {
			for (const tag of tags) {
				const folder = this.resolveFolderName(currentFolder,tag);
				if (folder) {
					currentFolder = folder
				}
			}
		} else {
			const remainingTags =  [...tags]
			for (let i=0;i<remainingTags.length;i++) {
				const currentTag = remainingTags[i]
				if (!currentTag) {
					console.error(`Accessed bad index ${i}`)
					break
				}
				const folder = this.resolveFolderName(currentFolder,currentTag);
				if (folder) {
					currentFolder = folder
					remainingTags.remove(currentTag)
					i = 0
				}
			}
		}
		console.log(`Found folder ${currentFolder.path} for tags ${tags.join(', ')}`)
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
