import {App, PluginSettingTab, sanitizeHTMLToDom, Setting} from "obsidian";
import FolderByTagsDistributor from "../main";
import FolderSuggest from "./FolderSuggest";

export class PluginSettingsTab extends PluginSettingTab {
	plugin: FolderByTagsDistributor;

	constructor(app: App, plugin: FolderByTagsDistributor) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Enable left bar button")
			.setDesc(sanitizeHTMLToDom("Display the Sync button on the left <b>Heads up!</b> Reload Obsidian to apply the changes."))
			.addToggle((component) =>
				component
					.setValue(this.plugin.settings.addRibbon)
					.onChange(async (value) => {
						this.plugin.settings.addRibbon = value;
						await this.plugin.saveSettings();
					})
			)
		;
		new Setting(containerEl)
			.setName("Use FrontMatter tags for folder resolver")
			.setDesc("Use tags specifies in 'tags' property of markdown file for distribution between folders")
			.addToggle((component) =>
				component
					.setValue(this.plugin.settings.useFrontMatterTags)
					.onChange(async (value) => {
						this.plugin.settings.useFrontMatterTags = value;
						await this.plugin.saveSettings();
					})
			)
		;
		new Setting(containerEl)
			.setName("Use content tags for folder resolver")
			.setDesc("Use tags specified inside note content for distribution between folders")
			.addToggle((component) =>
				component
					.setValue(this.plugin.settings.useContentTags)
					.onChange(async (value) => {
						this.plugin.settings.useContentTags = value;
						await this.plugin.saveSettings();
					})
			)
		;
		new Setting(containerEl)
			.setName("Force sequential tag to directory structure")
			.setDesc("By default, plugin will distribute notes between folders until all tags used. By enabling this setting tag order will matter. For example, tags 'book, science' will not be placed to 'Science/Book' directory hierarchy. It means only 'Book/Science' structure will work.")
			.addToggle((component) =>
				component
					.setValue(this.plugin.settings.forceSequentialTags)
					.onChange(async (value) => {
						this.plugin.settings.forceSequentialTags = value;
						await this.plugin.saveSettings();
					})
			)
		;
		new Setting(containerEl)
			.setName("Folder name to place other notes")
			.setDesc("You can specify folder name to put notes that has no more path. Plugin will look for this name in each folder. In case specified name exist, plugin put notes that does not match over there. Make field empty to disable this option.")
			.addText((component) =>
				component
					.setValue(this.plugin.settings.folderNameToPlaceOtherNotes)
					.onChange(async (value) => {
						this.plugin.settings.folderNameToPlaceOtherNotes = value;
						await this.plugin.saveSettings();
					})
			)
		;
		(new Setting(containerEl))
			.setName("Excluded folders")
			.setDesc('Add a folder to exclude notes from being moved by plugin')
			.addButton((component) => {
					component.setButtonText('Add excluded folder');
					component
						.onClick(async () => {
							this.plugin.settings.excludedFolders.push('');
							await this.plugin.saveSettings();
							this.display()
						})
				}
			)
		;
		this.plugin.settings.excludedFolders.forEach((folderPath, index) => {
			const s = new Setting(containerEl)
			s.setName(folderPath?`Excluded folder "${folderPath}"`:'Please, specify the folder name to exclude in the following field.')
			s.addSearch((cb) => {
				new FolderSuggest(cb.inputEl, new Set(this.app.vault.getAllLoadedFiles().filter(file => this.app.vault.getFolderByPath(file.path) !== null).map(file => file.path)), async (value) => {
					this.plugin.settings.excludedFolders[index] = value;
					await this.plugin.saveSettings();
					this.display()
				}, this.app);
				cb.inputEl.addEventListener('blur', () => {
					this.display()
				})
				cb.setPlaceholder('Folder')
					.setValue(folderPath)
					.onChange(async (newFolder) => {
						this.plugin.settings.excludedFolders[index] = newFolder;
						await this.plugin.saveSettings();
					});
			})
				.addExtraButton((cb) => {
					cb.setIcon('cross')
						.setTooltip('Delete')
						.onClick(async () => {
							this.plugin.settings.excludedFolders.splice(index, 1);
							await this.plugin.saveSettings();
							this.display()
						});
				});
		});

	}
}
