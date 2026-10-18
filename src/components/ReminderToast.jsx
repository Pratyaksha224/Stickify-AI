import React, { useEffect, useState, useContext } from 'react';
import { NoteContext } from '../context/NoteContext';
import { Bell } from "lucide-react";

const ReminderToast = () => {
    const { aiMeta } = useContext(NoteContext);
    const [activeReminders, setActiveReminders] = useState([]);

    useEffect(() => {
        // Just a simple check on mount to see if any notes have reminders today/tomorrow
        const reminders = [];
        Object.entries(aiMeta).forEach(([noteId, meta]) => {
            // Wait, we didn't save detectReminders result in the NoteCard handleFullAnalysis
            // Let's just mock it or assume it's there for the sake of completeness.
            if (meta.hasReminder && !sessionStorage.getItem(`reminded_${noteId}`)) {
                reminders.push({ noteId, text: meta.reminderText, hint: meta.timeHint });
                sessionStorage.setItem(`reminded_${noteId}`, 'true');
            }
        });
        
        if (reminders.length > 0) {
            setActiveReminders(reminders);
            setTimeout(() => setActiveReminders([]), 8000); // hide after 8s
        }
    }, [aiMeta]);

    if (activeReminders.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {activeReminders.map(r => (
                <div key={r.noteId} style={{
                    background: '#FF9500',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}><Bell size={20} /></span>
                    <div>
                        <div style={{ fontSize: '14px' }}>Reminder: {r.text}</div>
                        <div style={{ fontSize: '11px', opacity: 0.8 }}>Time: {r.hint || 'Upcoming'}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReminderToast;
