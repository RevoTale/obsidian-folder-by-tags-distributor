import {Menu, Plugin} from 'obsidian';
export const DEFAULT_SETTINGS:FolderByTagsDistributorSettings = {
	addRibbon:false
}
export type FolderByTagsDistributorSettings = {
	addRibbon:boolean
}
export default class FolderByTagsDistributor extends Plugin {
	settings: FolderByTagsDistributorSettings;

	public redistributeAllNotes(){
		const files = this.app.vault.getMarkdownFiles()
		for (const file of files) {
			this.app.vault.rename(file,'')
		}
	}
	async onload() {
		const{redistributeAllNotes} = this
		await this.loadSettings();
		this.addCommand({
			id: 'redistribute-all-notes-between-the-folders-by-tags',
			name: "Redistribute All Notes Between The Folders By Tags",
			callback: () => {
				redistributeAllNotes()
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
							redistributeAllNotes()
						})
				);


				menu.showAtMouseEvent(event);
			});
		}
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
