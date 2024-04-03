import { App, CachedMetadata, normalizePath, Notice, parseFrontMatterEntry, TFile, TFolder } from 'obsidian';
import FolderByTagGrouping from "../main";
import {pluginName} from "./settings";
export const isFmDisable = (fileCache: CachedMetadata) => {
	const fm = parseFrontMatterEntry(fileCache.frontmatter, 'FolderByTagGrouping');
	return fm === 'disable';
};

const folderOrFile = (app: App, path: string) => {
	const F = app.vault.getAbstractFileByPath(path);
	if (F instanceof TFile) {
		return TFile;
	} else if (F instanceof TFolder) {
		return TFolder;
	}
};

const isTFExists = (app: App, path: string, F: typeof TFile | typeof TFolder) => {
	return folderOrFile(app, normalizePath(path)) === F;
};

export const fileMove = async (plugin: FolderByTagGrouping, settingFolder: string, fileFullName: string, file: TFile) => {
	const { app, settings } = plugin;
	// Does the destination folder exist?
	if (!isTFExists(app, settingFolder, TFolder)) {
		if (settings.createFolders) {
			console.log(`[${pluginName}] Creating folder: ${settingFolder}`);
			await app.vault.createFolder(normalizePath(settingFolder));
		} else {
			console.error(`[${pluginName}] The destination folder "${settingFolder}" does not exist.`);
			new Notice(`[${pluginName}] "Error: The destination folder\n"${settingFolder}"\ndoes not exist.`);
			return;
		}
	}
	// Does the file with the same name exist in the destination folder?
	const newPath = normalizePath(settingFolder + '/' + fileFullName);
	if (isTFExists(app, newPath, TFile) && newPath !== file.path) {
		console.error(
			`${pluginName} Error: A file with the same name "${fileFullName}" exists at the destination folder.`
		);
		new Notice(
			`${pluginName} Error: A file with the same name\n"${fileFullName}"\nexists at the destination folder.`
		);
		return;
	}
	// Is the destination folder the same path as the current folder?
	if (newPath === file.path) {
		return;
	}
	// Move file
	await app.fileManager.renameFile(file, newPath);
	console.log(`[${pluginName}] Moved the note "${fileFullName}" to the "${settingFolder}".`);
	new Notice(`[${pluginName}] Moved the note "${fileFullName}"\nto the "${settingFolder}".`);
};

export const arrayMove = <T>(array: T[], fromIndex: number, toIndex: number): void => {
	if (toIndex < 0 || toIndex === array.length) {
		return;
	}
	const temp = array[fromIndex];
	array[fromIndex] = array[toIndex];
	array[toIndex] = temp;
};

export const getTriggerIndicator = (trigger: boolean) => {
	if (trigger) {
		return `[A]`;
	} else {
		return `[M]`;
	}
};
