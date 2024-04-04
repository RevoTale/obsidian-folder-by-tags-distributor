import {App, PluginSettingTab, sanitizeHTMLToDom, Setting} from "obsidian";
import FolderByTagsDistributor from "../main";

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
	}
}
