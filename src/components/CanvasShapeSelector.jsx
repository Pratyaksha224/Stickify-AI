import React, { useState, useRef, useEffect, useContext } from 'react';
import { SHAPES, ShapesPanel } from './ShapesMenu';
import { NoteContext } from '../context/NoteContext';

const CanvasShapeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { setCanvasShapes, db } = useContext(NoteContext);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleInsert = async (shape) => {
    if (!shape.isSticker) return; // Only allow SVGs for standalone canvas
    
    // Add to DB
    const newDoc = await db.canvasShapes.create({
      shapeId: shape.label, // Just an identifier
      html: shape.html,
      position: JSON.stringify({ x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 }),
      size: JSON.stringify({ width: 100, height: 100 }),
    });

    setCanvasShapes((prev) => [...prev, newDoc]);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
        }}
        title="Add Shape to Canvas"
        className="ctrl-btn"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          border: isOpen ? '1px solid rgba(140,100,255,0.8)' : 'none',
          background: isOpen ? 'rgba(140,100,255,0.2)' : 'rgba(255,255,255,0.05)',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          position: 'relative',
        }}
      >
        ⬡
      </button>
      
      <ShapesPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onInsert={handleInsert} 
        style={{ 
            bottom: '-10px', 
            left: '50px', 
            top: 'auto', 
            transform: 'none',
            minWidth: '220px'
        }}
      />
    </div>
  );
};

export default CanvasShapeSelector;
