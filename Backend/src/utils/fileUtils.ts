import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Deletes all files and subdirectories within the specified directory.
 * The directory itself is not removed. If the directory does not exist,
 * it will be created.
 * @param directoryPath The absolute path to the directory whose contents need to be emptied.
 */
export async function emptyDirectoryContents(directoryPath: string): Promise<void> {
    try {
        await fs.access(directoryPath);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.log(`Directory ${directoryPath} not found. Creating it.`);
            try {
                await fs.mkdir(directoryPath, { recursive: true });
                console.log(`Directory ${directoryPath} created.`);
                return; // Directory is new, so it's empty.
            } catch (mkdirError) {
                console.error(`Failed to create directory ${directoryPath}:`, mkdirError);
                return; // Cannot proceed if directory cannot be accessed or created.
            }
        } else {
            console.error(`Error accessing directory ${directoryPath}:`, error);
            return; // Cannot proceed.
        }
    }

    try {
        const items = await fs.readdir(directoryPath);
        if (items.length === 0) {
            console.log(`Directory is already empty: ${directoryPath}`);
            return;
        }

        const deletePromises = items.map(item => {
            const itemPath = path.join(directoryPath, item);
            // fs.rm can delete files and directories (recursively if it's a dir)
            // force:true to not error if item is gone due to parallel op or permissions.
            return fs.rm(itemPath, { recursive: true, force: true })
                .catch(err => {
                    // Log error for individual item deletion but continue
                    console.error(`Failed to delete item ${itemPath}:`, err);
                });
        });
        await Promise.all(deletePromises);
        console.log(`Successfully emptied contents of directory: ${directoryPath}`);
    } catch (error: any) {
        console.error(`Error reading directory contents for ${directoryPath}:`, error);
    }
}
