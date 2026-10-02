import React, { useContext, useState, useRef } from "react";
import { NoteContext } from "../context/NoteContext";

// Extended palette presets — header, body, text
const PRESET_COLORS = [
    // Warm
    { id: 'yellow',   colorHeader: '#FFEFBE', colorBody: '#FFF5DF', colorText: '#18181A' },
    { id: 'orange',   colorHeader: '#FFD4A3', colorBody: '#FFE4C0', colorText: '#18181A' },
    { id: 'red',      colorHeader: '#FFACAC', colorBody: '#FFD0D0', colorText: '#18181A' },
    { id: 'pink',     colorHeader: '#FED0FD', colorBody: '#FEE5FD', colorText: '#18181A' },
    { id: 'rose',     colorHeader: '#FFBED5', colorBody: '#FFD6E5', colorText: '#18181A' },
    // Cool
    { id: 'green',    colorHeader: '#AFDA9F', colorBody: '#BCDEAF', colorText: '#18181A' },
    { id: 'teal',     colorHeader: '#A0E4D8', colorBody: '#C0EDE6', colorText: '#18181A' },
    { id: 'blue',     colorHeader: '#9BD1DE', colorBody: '#A6DCE9', colorText: '#18181A' },
    { id: 'indigo',   colorHeader: '#B8C4FF', colorBody: '#D0D8FF', colorText: '#18181A' },
    { id: 'purple',   colorHeader: '#C4AAFF', colorBody: '#D8C8FF', colorText: '#18181A' },
    // Neutral / Dark
    { id: 'white',    colorHeader: '#F0F0F0', colorBody: '#FAFAFA', colorText: '#18181A' },
    { id: 'gray',     colorHeader: '#D0D0D0', colorBody: '#E8E8E8', colorText: '#18181A' },
    { id: 'charcoal', colorHeader: '#4A5568', colorBody: '#5A6678', colorText: '#F0F0F0' },
    { id: 'dark',     colorHeader: '#2D3748', colorBody: '#3D4758', colorText: '#F0F0F0' },
    { id: 'black',    colorHeader: '#1A202C', colorBody: '#252D3C', colorText: '#E0E0E0' },
    // Fun
    { id: 'mint',     colorHeader: '#C1F0D2', colorBody: '#D5F5E2', colorText: '#18181A' },
    { id: 'lavender', colorHeader: '#D8C8FF', colorBody: '#E8DCFF', colorText: '#18181A' },
    { id: 'peach',    colorHeader: '#FFDAB0', colorBody: '#FFE8C8', colorText: '#18181A' },
    { id: 'sky',      colorHeader: '#B0E2FF', colorBody: '#C8EDFF', colorText: '#18181A' },
    { id: 'lime',     colorHeader: '#D4F0A0', colorBody: '#E4F7C0', colorText: '#18181A' },
];

const ColorPicker = () => {
    const { selectedNote, notes, setNotes } = useContext(NoteContext);
    const [open, setOpen] = useState(false);
    const [customHeader, setCustomHeader] = useState('#FFEFBE');
    const pickerRef = useRef(null);

    const applyColor = async (colorObj) => {
        if (!selectedNote) {
            alert("Select a note first to change its color!");
            return;
        }

        const idx = notes.findIndex(n => n.$id === selectedNote.$id);
        if (idx === -1) return;

        const updated = { ...notes[idx], colors: JSON.stringify(colorObj) };
        const newNotes = [...notes];
        newNotes[idx] = updated;
        setNotes(newNotes);

        try {
            await db.notes.update(selectedNote.$id, { colors: JSON.stringify(colorObj) });
        } catch (err) {
            console.error("Failed to save color:", err);
        }
        setOpen(false);
    };

    const applyCustom = () => {
        // Derive a slightly lighter body from the header
        const hex = customHeader.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness > 128 ? '#18181A' : '#F0F0F0';

        // Lighten body color slightly
        const lighten = (c) => Math.min(255, c + 28);
        const bodyHex = '#' + [lighten(r), lighten(g), lighten(b)].map(v => v.toString(16).padStart(2, '0')).join('');

        applyColor({ id: 'custom', colorHeader: customHeader, colorBody: bodyHex, colorText: textColor });
    };

    // Group presets into rows of 5
    const rows = [];
    for (let i = 0; i < PRESET_COLORS.length; i += 5) {
        rows.push(PRESET_COLORS.slice(i, i + 5));
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* Palette icon button */}
            <div
                className="color"
                onClick={() => setOpen(o => !o)}
                title="Change note color"
                style={{
                    background: 'conic-gradient(from 0deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #c77dff, #ff6b6b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    border: '2px solid rgba(255,255,255,0.25)',
                    cursor: 'pointer',
                    flexShrink: 0,
                }}
            >
                🎨
            </div>

            {open && (
                <div
                    ref={pickerRef}
                    onClick={e => e.stopPropagation()}
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
                        boxShadow: '0 16px 56px rgba(0,0,0,0.7)',
                        minWidth: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                    }}
                >
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Note Color</p>

                    {/* Preset grid */}
                    {rows.map((row, ri) => (
                        <div key={ri} style={{ display: 'flex', gap: '6px' }}>
                            {row.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => applyColor(c)}
                                    title={c.id}
                                    style={{
                                        width: '28px', height: '28px',
                                        borderRadius: '50%',
                                        background: c.colorHeader,
                                        border: selectedNote && JSON.parse(selectedNote.colors || '{}').id === c.id
                                            ? '2px solid white'
                                            : '2px solid transparent',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                        transition: 'transform 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ))}
                        </div>
                    ))}

                    {/* Divider */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />

                    {/* Custom color row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="color"
                            value={customHeader}
                            onChange={e => setCustomHeader(e.target.value)}
                            style={{
                                width: '36px', height: '36px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                padding: 0,
                                background: 'none',
                            }}
                            title="Pick custom color"
                        />
                        <div style={{ flex: 1 }}>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: '0 0 4px 0' }}>Custom Color</p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', margin: 0 }}>{customHeader}</p>
                        </div>
                        <button
                            onClick={applyCustom}
                            style={{
                                background: 'rgba(140,100,255,0.3)',
                                border: '1px solid rgba(140,100,255,0.6)',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '11px',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPicker;
