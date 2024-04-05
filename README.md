# Folder By Tags Distributor
Tired of sorting your Obsidian notes through folders manually?
Here is exactly what you have looked for.
**Folder By Tags Distributor** Obsidian plugin automatically moves your notes to directories based on the tags
specified in your notes. 

## How to use
Install this plugin. Do **one of the** following.
- Click `Redistribute all notes to folder by tags` button (with "sync" icon) on the left panel.
- Run `Redistribute all notes to folder by tags` command.

**Note:** This plugin **does not** create a new folders.
It redistributes notes between existing folder structure.
If there is a demand for such a feature, feel free to discuss it on GitHub.

**Warning!**
This plugin puts a notes without matched directories to the root of your vault.
Be careful!
If there is a demand to configure such things with settings, feel free to discuss it on GitHub.

**Warning!**
If you use Obsidian Templates, please,
add a folder containing your templates to list of excluded folders in setting of this plugin.

**Please read carefully next sections to avoid incorrect expectations.
Backup your vault before usage to avoid disappointment.**

## How does it work?
Here is what happens under the hood when you trigger redistribution command.
Plugin looks for a tags in a note.
For each tag, plugin finds a similar folder name starting from the root of the vault.
If a folder with tag name similar to tag is missing, plugin skips that tag. It continues search starting from the subsequent tags.

**For example**, your note have multiple tags: `book`,`science` and you vault root has one folder named `/Science`.
By clicking `Redistribute all notes to folder by tags` button your note will be moved to `/Science` directory.
If your folder structure would be `/Science/Book`, your note will still be moved to that directory.
The same goes with `/Book/Science`.
But, if you have one directory named `/Other/Book/Science`, your note will be place in the root (`/`) of your vault. 

The following transformation of **tag name** to **folder name** is supported:
- Exact Folder  (book => book) 
- Upper Letter Folder  (book => Book)  
- Capitalized Folder (book => BOOK)
- Underscore Folder (my_books => My Books)
- 
## Settings
Settings description is replicated from setting tab.

| Name                                        | Description                                                                                                                                                                                                                                                                 | Type     | Default  |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|----------|
| Enable left bar button                      | Display the Sync button on the left **Heads up!** Reload Obsidian to apply the changes.                                                                                                                                                                                     | checkbox | enabled  |
| Use FrontMatter tags for folder resolver    | Use tags specifies in 'tags' property of markdown file for distribution between folders                                                                                                                                                                                     | checkbox | enabled  |
| Use content tags for folder resolver        | Use tags specified inside note content for distribution between folders                                                                                                                                                                                                     | checkbox | disabled |
| Force sequential tag to directory structure | By default, plugin will distribute notes between folders until all tags used. By enabling this setting tag order will matter. For example, tags 'book, science' will not be placed to 'Science/Book' directory hierarchy. It means only 'Book/Science' structure will work. | checkbox | disabled |
| Excluded folders                            | Add a folder list to exclude notes from being moved by plugin                                                                                                                                                                                                               | checkbox | empty    |


## Community
**Feel free to:**
- Discuss plugin improvement through [GitHub discussions](https://github.com/RevoTale/obsidian-folder-by-tags-distributor-plugin/discussions). Your opinion matters!
- Open an [issue ticket](https://github.com/RevoTale/obsidian-folder-by-tags-distributor-plugin/issues) in case you found a bug or encounter an unexpected plugin behavior.
- Email me with suggestions and offers
- Open a PR in case you want to make this plugin better. **Note:** please, discuss the improvement you provide through the [GitHub discussions](https://github.com/RevoTale/obsidian-folder-by-tags-distributor-plugin/discussions) or [GitHub issues](https://github.com/RevoTale/obsidian-folder-by-tags-distributor-plugin/issues) before making a PR.


