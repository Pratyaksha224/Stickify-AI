import React from "react";
import { useContext } from "react";
import { NoteContext } from "../context/NoteContext";

const Color = ({ color }) => {
    const { selectedNote, notes, setNotes, db } = useContext(NoteContext);

    const changeColor = async () => {
        if (!selectedNote) {
            alert("You must select a note before changing colors");
            return;
        }
     
        const currentNoteIndex = notes.findIndex(
            (note) => note.$id === selectedNote.$id
        );

        if (currentNoteIndex === -1) return;
     
        const updatedNote = {
            ...notes[currentNoteIndex],
            colors: JSON.stringify(color),
        };
     
        const newNotes = [...notes];
        newNotes[currentNoteIndex] = updatedNote;
        setNotes(newNotes);
     
        try {
            await db.notes.update(selectedNote.$id, {
                colors: JSON.stringify(color),
            });
        } catch (error) {
            console.error("Failed to save color change:", error);
        }
    };

    return (
        <div
            onClick={changeColor}
            className="color"
            style={{ backgroundColor: color.colorHeader }}
        ></div>
    );
};

export default Color;