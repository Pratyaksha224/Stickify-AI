import React, { useContext, useState } from "react";
import { NoteContext } from "../context/NoteContext";
import { TEMPLATES } from "./TemplateSelector";
import colors from "../assets/colors.json";

// Group templates for display in rows of 5
const TEMPLATE_GROUPS = [
    TEMPLATES.slice(0, 5),
    TEMPLATES.slice(5, 10),
    TEMPLATES.slice(10, 15),
];

// Starting position counter for new notes created via style picker
let styleNotePos = 60;

const StyleControl = () => {
    const { selectedNote, notes, setNotes, setSelectedNote } = useContext(NoteContext);
    const [open, setOpen] = useState(false);

    const changeTemplate = async (templateId) => {
        setOpen(false);

        if (selectedNote) {
            // Apply template to existing selected note
            const idx = notes.findIndex(n => n.$id === selectedNote.$id);
            if (idx === -1) return;

            const updatedNote = { ...notes[idx], template: templateId };
            const newNotes = [...notes];
            newNotes[idx] = updatedNote;
            setNotes(newNotes);

            try {
                await db.notes.update(selectedNote.$id, { template: templateId });
            } catch (err) {
                console.error("Failed to save style:", err);
            }
        } else {
            // No note selected → create a new note with this template
            styleNotePos += 20;
            const payload = {
                position: JSON.stringify({ x: styleNotePos, y: styleNotePos }),
                colors: JSON.stringify(colors[0]),
                body: JSON.stringify(""),
                template: templateId,
            };
            try {
                const response = await db.notes.create(payload);
                setNotes(prev => [response, ...prev]);
                setSelectedNote(response);
            } catch (err) {
                console.error("Failed to create note:", err);
            }
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div
                className="color"
                onClick={() => setOpen(!open)}
                title={selectedNote ? "Change note style" : "Create note with style"}
                style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                }}
            >
                🎭
            </div>

            {open && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '120%',
                        transform: 'translateY(-50%)',
                        zIndex: 99999,
                        background: 'rgba(12,14,22,0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '18px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 16px 56px rgba(0,0,0,0.7)',
                    }}
                >
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '0 0 2px 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {selectedNote ? 'Change Style' : 'Create Note With Style'}
                    </p>
                    {TEMPLATE_GROUPS.map((group, gi) => (
                        <div key={gi} style={{ display: 'flex', gap: '6px' }}>
                            {group.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => changeTemplate(t.id)}
                                    title={t.label}
                                    style={{
                                        background: selectedNote?.template === t.id
                                            ? 'rgba(140,100,255,0.4)'
                                            : 'rgba(255,255,255,0.06)',
                                        border: selectedNote?.template === t.id
                                            ? '1px solid rgba(140,100,255,0.8)'
                                            : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        padding: '7px 10px',
                                        cursor: 'pointer',
                                        color: 'white',
                                        fontSize: '14px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '3px',
                                        transition: 'all 0.2s',
                                        minWidth: '52px',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(140,100,255,0.25)';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = selectedNote?.template === t.id
                                            ? 'rgba(140,100,255,0.4)' : 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <span style={{ fontSize: '20px' }}>{t.emoji}</span>
                                    <span style={{ fontSize: '9px', opacity: 0.65, whiteSpace: 'nowrap' }}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                    {!selectedNote && (
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px', margin: '4px 4px 0', textAlign: 'center' }}>
                            ✦ Click any style to instantly create a note
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default StyleControl;


