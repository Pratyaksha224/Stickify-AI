import React, { useState, useEffect, useContext } from 'react';
import { NoteContext } from '../context/NoteContext';

const parseTasks = (raw) => {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map(t => typeof t === 'string' ? { text: t, done: false } : t);
};

const TaskList = ({ noteId, initialTasks }) => {
  const [tasks, setTasks] = useState(() => parseTasks(initialTasks));
  const { db, aiMeta, setAiMeta } = useContext(NoteContext);

  // Sync if initialTasks changes from a new AI extraction
  useEffect(() => {
    setTasks(parseTasks(initialTasks));
  }, [initialTasks]);

  const toggleTask = async (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);

    // Save to DB
    const currentMeta = aiMeta[noteId] || {};
    const updatedMeta = { ...currentMeta, tasks: newTasks };
    
    setAiMeta(prev => ({ ...prev, [noteId]: updatedMeta }));
    
    try {
      await db.aiMeta.update(noteId, { tasks: JSON.stringify(newTasks) });
    } catch (err) {
      // If it doesn't exist, create it
      try {
        await db.aiMeta.create({ noteId, tasks: JSON.stringify(newTasks) }, noteId);
      } catch (e) {
        console.error("Failed to save tasks", e);
      }
    }
  };

  if (!Array.isArray(tasks) || tasks.length === 0) return null;

  return (
    <div className="task-list-panel" style={{
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', opacity: 0.8 }}>Action Items</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {tasks.map((task, i) => (
          <label key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '13px',
            cursor: 'pointer',
            opacity: task.done ? 0.6 : 1,
            textDecoration: task.done ? 'line-through' : 'none'
          }}>
            <input 
              type="checkbox" 
              checked={task.done || false} 
              onChange={() => toggleTask(i)} 
              style={{ marginTop: '2px' }}
            />
            <span>{task.text || task}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
