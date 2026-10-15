import React, { useState, useContext } from 'react';
import { 
  improveWriting, 
  rewriteNote, 
  analyzeNoteFull 
} from '../services/aiService';
import { NoteContext } from '../context/NoteContext';
import Spinner from '../icons/Spinner';
import { Bot, Sparkles, ChevronDown } from "lucide-react";

const AiAssistant = ({ noteId, getText, onTextUpdate, colors }) => {
  const [loadingAction, setLoadingAction] = useState(null);
  const [showToneOptions, setShowToneOptions] = useState(false);
  const { db, aiMeta, setAiMeta } = useContext(NoteContext);

  const handleAction = async (actionId, actionFn) => {
    const text = getText();
    if (!text || !text.trim()) {
      alert('Please type something in the note first!');
      return;
    }
    setLoadingAction(actionId);
    try {
      const newText = await actionFn(text);
      if (newText) onTextUpdate(newText);
    } catch (error) {
      alert(error.message || 'AI request failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFullAnalysis = async () => {
    const text = getText();
    if (!text || !text.trim()) {
      alert('Please write something in the note first!');
      return;
    }
    setLoadingAction('analyze');
    try {
      const meta = await analyzeNoteFull(text);
      
      // Update Context
      const currentMeta = aiMeta[noteId] || {};
      // For tasks, ensure it's an array of objects
      const formattedTasks = meta.tasks.map(t => typeof t === 'string' ? { text: t, done: false } : t);
      
      const updatedMeta = { 
        ...currentMeta, 
        ...meta,
        tasks: formattedTasks
      };

      setAiMeta(prev => ({ ...prev, [noteId]: updatedMeta }));
      
      // Update DB
      const payload = {
        noteId,
        title: meta.title,
        category: meta.category,
        priority: meta.priority,
        priorityReason: meta.priorityReason,
        summary: meta.summary,
        tasks: JSON.stringify(formattedTasks)
      };

      try {
        await db.aiMeta.update(noteId, payload);
      } catch (err) {
        await db.aiMeta.create(payload, noteId);
      }

    } catch (error) {
      alert(error.message || 'Analysis failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const ActionBtn = ({ id, label, icon = <Sparkles size={14} />, onClick, title }) => (
    <button
      className="ai-btn"
      onClick={onClick}
      disabled={loadingAction !== null}
      style={{ color: colors.colorText, opacity: loadingAction && loadingAction !== id ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
      title={title}
    >
      {loadingAction === id ? <Spinner size="12" color={colors.colorText} /> : icon} {label}
    </button>
  );

  return (
    <div className="ai-assistant-panel" style={{
      marginTop: '10px',
      paddingTop: '8px',
      borderTop: `1px solid rgba(0,0,0,0.1)`,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <ActionBtn 
          id="analyze" 
          icon={<Bot size={14} />} 
          label="Analyze Note" 
          title="Auto-detect title, category, priority, and tasks"
          onClick={handleFullAnalysis} 
        />
        <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />
        
        <ActionBtn 
          id="improve" 
          label="Improve" 
          onClick={() => handleAction('improve', t => improveWriting(t, 'improve'))} 
        />
        <ActionBtn 
          id="bullets" 
          label="Bullets" 
          onClick={() => handleAction('bullets', t => improveWriting(t, 'bullets'))} 
        />
        <ActionBtn 
          id="grammar" 
          label="Fix Grammar" 
          onClick={() => handleAction('grammar', t => improveWriting(t, 'grammar'))} 
        />
        <ActionBtn 
          id="tone" 
          label={
            <>Tone <ChevronDown size={14} /></>
          }
          icon={null}
          onClick={() => setShowToneOptions(!showToneOptions)} 
        />
      </div>

      {showToneOptions && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '6px' }}>
          {['professional', 'formal', 'friendly', 'concise', 'detailed'].map(tone => (
            <button
              key={tone}
              className="ai-btn tone-btn"
              onClick={() => {
                setShowToneOptions(false);
                handleAction(`tone_${tone}`, t => rewriteNote(t, tone));
              }}
              style={{ color: colors.colorText, fontSize: '11px', textTransform: 'capitalize' }}
            >
              {tone}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
