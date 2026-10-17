import React, { useState } from 'react';

const SummaryPanel = ({ summary }) => {
  const [expanded, setExpanded] = useState(false);

  if (!summary) return null;

  return (
    <div className="summary-panel" style={{
      marginTop: '12px',
      padding: '10px',
      backgroundColor: 'rgba(255,255,255,0.4)',
      borderRadius: '8px',
      fontSize: '13px',
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <div 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <strong style={{ opacity: 0.8 }}>✨ AI Summary</strong>
        <span style={{ fontSize: '10px', opacity: 0.6 }}>{expanded ? '▼' : '▶'}</span>
      </div>
      
      {expanded && (
        <div style={{ marginTop: '8px', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
          {summary}
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;
