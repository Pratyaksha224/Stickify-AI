/**
 * Export all notes from a user's IndexedDB to a downloadable JSON file.
 * @param {object} db - The user-specific db instance from NoteContext
 */
export const exportNotes = async (db) => {
    const { documents: notes } = await db.notes.list();
    const data = JSON.stringify({ version: 1, exported: new Date().toISOString(), notes }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `stickify-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Import notes from a JSON backup file into the user's IndexedDB.
 * @param {File} file - The backup JSON file
 * @param {object} db - The user-specific db instance from NoteContext
 * Returns the count of imported notes.
 */
export const importNotes = (file, db) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                const notesToImport = parsed.notes || [];
                if (!Array.isArray(notesToImport)) throw new Error('Invalid backup file format.');

                // Use bulkPut so existing notes with same $id are updated, not duplicated
                await db.notes._table.bulkPut(notesToImport);
                resolve(notesToImport.length);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsText(file);
    });
};
