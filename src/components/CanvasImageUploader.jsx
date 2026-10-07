import React, { useRef, useContext } from 'react';
import { NoteContext } from '../context/NoteContext';

let imgPos = 100;

const CanvasImageUploader = () => {
    const { setCanvasImages, db } = useContext(NoteContext);
    const fileInputRef = useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            imgPos += 30;
            const payload = {
                src: ev.target.result,
                position: JSON.stringify({ x: imgPos, y: imgPos }),
                size: JSON.stringify({ width: 320, height: 220 }),
            };
            try {
                const img = await db.canvasImages.create(payload);
                setCanvasImages(prev => [...prev, img]);
            } catch (err) {
                console.error('Failed to create canvas image:', err);
                alert('Image upload failed: ' + (err?.message || String(err)));
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    return (
        <>
            <div
                className="color"
                onClick={() => fileInputRef.current?.click()}
                title="Place image on canvas"
                style={{
                    background: 'rgba(255,255,255,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    border: '1px solid rgba(255,255,255,0.18)',
                    cursor: 'pointer',
                }}
            >
                🖼️
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
            />
        </>
    );
};

export default CanvasImageUploader;
