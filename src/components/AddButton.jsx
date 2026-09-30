import React, { useContext, useRef } from 'react';
import Plus from "../icons/Plus";
import colors from "../assets/colors.json";
import {NoteContext} from '../context/NoteContext'


const AddButton = () => {
    const { setNotes, db } = useContext(NoteContext);
 
    const addNote = async () => {
        // Find the current scroll position so new notes appear where the user is looking
        const scrollX = document.getElementById('app')?.scrollLeft || window.scrollX || 0;
        const scrollY = document.getElementById('app')?.scrollTop || window.scrollY || 0;
        
        // Randomly place the new note within the visible center area
        // Card is ~360px wide, so we keep it within bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const randomX = scrollX + (viewportWidth * 0.1) + Math.random() * (viewportWidth * 0.5 - 360);
        const randomY = scrollY + (viewportHeight * 0.1) + Math.random() * (viewportHeight * 0.5 - 200);

        const payload = {
            position: JSON.stringify({
                x: Math.max(10, randomX),
                y: Math.max(10, randomY),
            }),
            colors: JSON.stringify(colors[Math.floor(Math.random() * colors.length)]),
            body: JSON.stringify(""),
            template: 'classic',
        };
        
        try {
            const response = await db.notes.create(payload);
            setNotes((prevState) => [response, ...prevState]);
        } catch (err) {
            console.error('Failed to create note:', err);
            alert('Error creating note: ' + (err?.message || JSON.stringify(err)));
        }
    };

    return (
        <div id="add-btn" onClick={addNote}>
            <Plus />
        </div>
    );
};

export default AddButton;