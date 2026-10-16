import React from 'react';

const PriorityIndicator = ({ priority, reason }) => {
  if (!priority || priority === 'LOW') return null;

  const config = {
    HIGH: { color: '#FF3B30', label: '🔴 High Priority' },
    MEDIUM: { color: '#FF9500', label: '🟡 Medium Priority' },
  };

  const { color, label } = config[priority] || config.MEDIUM;

  return (
    <div
      className="priority-indicator"
      title={reason || label}
      style={{
        position: 'absolute',
        top: '-12px',
        left: '10px',
        backgroundColor: '#fff',
        color: color,
        border: `1px solid ${color}`,
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {label}
    </div>
  );
};

export default PriorityIndicator;
