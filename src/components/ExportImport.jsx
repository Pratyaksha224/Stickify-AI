import React, { useRef, useContext } from 'react';
import { exportNotes, importNotes } from '../services/storage';
import { NoteContext } from '../context/NoteContext';

const ExportImport = () => {
    const fileInputRef = useRef(null);
    const { setNotes, db } = useContext(NoteContext);

    const handleExport = async () => {
        try {
            await exportNotes(db);
        } catch (err) {
            alert('Export failed: ' + err.message);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const count = await importNotes(file, db);
            // Refresh the notes list by re-reading from db
            const response = await db.notes.list();
            setNotes(response.documents);
            alert(`✅ Successfully imported ${count} notes!`);
        } catch (err) {
            alert('Import failed: ' + err.message);
        } finally {
            // Reset input so same file can be imported again
            e.target.value = '';
        }
    };


    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <button
                onClick={handleExport}
                title="Export notes as JSON backup"
                className="export-import-btn"
            >
                📥
            </button>
            <button
                onClick={handleImportClick}
                title="Import notes from JSON backup"
                className="export-import-btn"
            >
                📤
            </button>
        </>
    );
};


export default ExportImport;
