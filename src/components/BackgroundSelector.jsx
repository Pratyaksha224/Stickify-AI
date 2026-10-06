import React, { useContext, useState } from "react";
import { NoteContext } from "../context/NoteContext";

export const BACKGROUNDS = [
    { id: 'dark',      label: 'Dark Space',   color: '#141620', icon: '🌌' },
    { id: 'light',     label: 'Light Desk',   color: '#f5f5f5', icon: '☀️' },
    { id: 'corkboard', label: 'Corkboard',    color: '#d4a373', icon: '📌' },
    { id: 'grid',      label: 'Grid Paper',   color: '#e8f0fe', icon: '📐' },
    { id: 'wood',      label: 'Wood Desk',    color: '#8b5a2b', icon: '🪵' },
];

const BackgroundSelector = () => {
    const { background, setBackground } = useContext(NoteContext);
    const [open, setOpen] = useState(false);

    const changeBackground = (bgId) => {
        setBackground(bgId);
        setOpen(false);
    };

    return (
        <div style={{ position: 'relative' }}>
            <div
                className="color"
                onClick={() => setOpen(!open)}
                title="Change canvas background"
                style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer'
                }}
            >
                🌄
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
                        background: 'rgba(15,17,26,0.97)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '16px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
                        width: '180px'
                    }}
                >
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '0 0 4px 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Canvas Background</p>
                    
                    {BACKGROUNDS.map(bg => (
                        <button
                            key={bg.id}
                            onClick={() => changeBackground(bg.id)}
                            style={{
                                background: background === bg.id
                                    ? 'rgba(140,100,255,0.4)'
                                    : 'rgba(255,255,255,0.06)',
                                border: background === bg.id
                                    ? '1px solid rgba(140,100,255,0.8)'
                                    : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                color: 'white',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{bg.icon}</span>
                            <span style={{ flex: 1 }}>{bg.label}</span>
                            
                            {/* Color preview circle */}
                            <div style={{
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: bg.color,
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}></div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BackgroundSelector;
