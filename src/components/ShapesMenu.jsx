import React from 'react';

export const SHAPES = [
  { label: '— Line', title: 'Line', html: '<hr style="border:none;border-top:3px solid currentColor;opacity:0.5;margin:8px 0;width:100%"/>' },
  { label: '〰 Zigzag', title: 'Zigzag', isSticker: true, html: '<svg viewBox="0 0 100 20" style="display:block;margin:0" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path d="M0,10 L10,0 L30,20 L50,0 L70,20 L90,0 L100,10" fill="none" stroke="currentColor" strokeWidth="3"/></svg>' },
  { label: '● Circle', title: 'Filled circle', isSticker: true, html: '<svg viewBox="0 0 40 40" style="display:block;margin:0" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="16" fill="rgba(140,100,255,0.7)"/></svg>' },
  { label: '■ Square', title: 'Filled square', isSticker: true, html: '<svg viewBox="0 0 40 40" style="display:block;margin:0" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="32" height="32" rx="4" fill="rgba(80,180,255,0.7)"/></svg>' },
  { label: '▬ Rectangle', title: 'Rectangle', isSticker: true, html: '<svg viewBox="0 0 60 30" style="display:block;margin:0" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="52" height="22" rx="4" fill="rgba(255,120,80,0.7)"/></svg>' },
  { label: '▲ Triangle', title: 'Triangle', isSticker: true, html: '<svg viewBox="0 0 40 40" style="display:block;margin:0" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><polygon points="20,4 36,36 4,36" fill="rgba(255,210,0,0.85)"/></svg>' },
  { label: '★ Star', title: 'Star shape', isSticker: true, html: '<svg viewBox="0 0 44 44" style="display:block;margin:0" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><polygon points="22,2 27,17 43,17 30,27 35,42 22,33 9,42 14,27 1,17 17,17" fill="rgba(255,80,120,0.8)"/></svg>' },
  { label: '♥ Heart', title: 'Heart shape', isSticker: true, html: '<svg viewBox="0 0 44 40" style="display:block;margin:0" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path d="M22 36 C22 36 4 24 4 13 A9 9 0 0 1 22 10 A9 9 0 0 1 40 13 C40 24 22 36 22 36Z" fill="rgba(255,100,100,0.8)"/></svg>' },
  { label: '☑ Task', title: 'Checkbox task', html: '<div style="display:flex;align-items:center;gap:6px;margin:4px 0"><input type="checkbox" style="width:16px;height:16px;cursor:pointer"><span>Task item</span></div>' },
  { label: '💡 Idea', title: 'Idea callout', html: '<div style="background:rgba(255,220,50,0.2);border-left:3px solid #ffd700;padding:6px 10px;border-radius:4px;margin:4px 0">💡 Idea: </div>' },
  { label: '⚠️ Note', title: 'Warning callout', html: '<div style="background:rgba(255,100,50,0.15);border-left:3px solid #ff6432;padding:6px 10px;border-radius:4px;margin:4px 0">⚠️ Note: </div>' },
  { label: '✅ Done', title: 'Done callout', html: '<div style="background:rgba(50,200,100,0.15);border-left:3px solid #32c864;padding:6px 10px;border-radius:4px;margin:4px 0">✅ Done: </div>' },
];

export const ShapesPanel = ({ onInsert, isOpen, onClose, style = {} }) => {
  if (!isOpen) return null;
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 99999,
        background: 'rgba(12,14,22,0.98)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '5px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
        minWidth: '220px',
        ...style
      }}
    >
      <p style={{ gridColumn: '1/-1', color: 'rgba(255,255,255,0.4)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 2px' }}>Insert</p>
      {SHAPES.map((s, i) => (
        <button
          key={i}
          title={s.title}
          onMouseDown={(e) => { e.preventDefault(); onInsert(s); onClose(); }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '7px',
            color: 'white',
            fontSize: '10px',
            padding: '6px 4px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(140,100,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(140,100,255,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};
