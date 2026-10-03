import React, { useState } from 'react';

export const TEMPLATES = [
    // Original 5
    { id: 'classic',   label: 'Classic',    emoji: '🌑' },
    { id: 'lined',     label: 'Lined',      emoji: '📝' },
    { id: 'nature',    label: 'Nature',     emoji: '🌿' },
    { id: 'quote',     label: 'Quote',      emoji: '❝'  },
    { id: 'scrapbook', label: 'Scrapbook',  emoji: '📌' },
    // New 10
    { id: 'garden',    label: 'Garden',     emoji: '🌳' },
    { id: 'stars',     label: 'Be Happy',   emoji: '🌙' },
    { id: 'fruit',     label: 'Fruity',     emoji: '🍓' },
    { id: 'todo',      label: 'To-Do',      emoji: '✅' },
    { id: 'sweetday',  label: 'Sweet Day',  emoji: '☀️' },
    { id: 'rainbow',   label: 'Rainbow',    emoji: '🌈' },
    { id: 'torn',      label: 'Torn Paper', emoji: '📄' },
    { id: 'idea',      label: 'Idea',       emoji: '💡' },
    { id: 'grid',      label: 'Grid',       emoji: '📐' },
    { id: 'heartplan', label: 'My Plans',   emoji: '💗' },
];

// Group templates for display in rows of 5
const TEMPLATE_GROUPS = [
    TEMPLATES.slice(0, 5),
    TEMPLATES.slice(5, 10),
    TEMPLATES.slice(10, 15),
];

const TemplateSelector = ({ currentTemplate, onSelect, textColor }) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (templateId) => {
        onSelect(templateId);
        setOpen(false);
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                title="Change note style"
                style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: textColor || '#333',
                    fontWeight: 500,
                }}
            >
                🎨
            </button>

            {open && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        top: '110%',
                        right: 0,
                        zIndex: 99999,
                        background: 'rgba(15,17,26,0.97)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '16px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
                    }}
                >
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '0 0 4px 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Choose Style</p>
                    {TEMPLATE_GROUPS.map((group, gi) => (
                        <div key={gi} style={{ display: 'flex', gap: '6px' }}>
                            {group.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleSelect(t.id)}
                                    title={t.label}
                                    style={{
                                        background: currentTemplate === t.id
                                            ? 'rgba(140,100,255,0.4)'
                                            : 'rgba(255,255,255,0.06)',
                                        border: currentTemplate === t.id
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
                                >
                                    <span style={{ fontSize: '20px' }}>{t.emoji}</span>
                                    <span style={{ fontSize: '9px', opacity: 0.65, whiteSpace: 'nowrap' }}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TemplateSelector;
