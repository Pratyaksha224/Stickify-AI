import React, { useState, useRef, useEffect, useCallback } from 'react';

const DrawingOverlay = ({ isActive, onSave, strokeColor = 'currentColor' }) => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const containerRef = useRef(null);

  // When toggled off, save and clear if there's any drawing
  useEffect(() => {
    if (!isActive && paths.length > 0) {
      handleSave();
    }
  }, [isActive]);

  const handleSave = () => {
    // Calculate bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    paths.forEach(path => {
      path.forEach(pt => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      });
    });

    if (minX === Infinity) {
      setPaths([]);
      return; // Nothing drawn
    }

    // Add padding to bbox so strokes aren't cut off
    const pad = 4;
    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;

    const width = maxX - minX;
    const height = maxY - minY;

    // Generate normalized SVG paths
    const svgPaths = paths.map(path => {
      const d = path.map((pt, i) => {
        return (i === 0 ? 'M' : 'L') + ` ${pt.x - minX} ${pt.y - minY}`;
      }).join(' ');
      return `<path d="${d}" stroke="currentColor" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');

    const svgHtml = `<svg viewBox="0 0 ${width} ${height}" style="display:block;width:100%;height:100%;color:${strokeColor}" xmlns="http://www.w3.org/2000/svg">${svgPaths}</svg>`;

    onSave({
      html: svgHtml,
      position: { x: minX, y: minY },
      size: { width, height },
      isSticker: true
    });

    setPaths([]);
  };

  const getCoordinates = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onPointerDown = (e) => {
    if (!isActive) return;
    const pt = getCoordinates(e);
    setCurrentPath([pt]);
  };

  const onPointerMove = (e) => {
    if (!isActive || !currentPath) return;
    const pt = getCoordinates(e);
    setCurrentPath(prev => [...prev, pt]);
  };

  const onPointerUp = () => {
    if (!isActive || !currentPath) return;
    setPaths(prev => [...prev, currentPath]);
    setCurrentPath(null);
  };

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999, // very high to sit on top of everything
        cursor: 'crosshair',
        touchAction: 'none' // prevent scrolling on mobile while drawing
      }}
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onMouseLeave={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
      onTouchCancel={onPointerUp}
    >
      <svg width="100%" height="100%" style={{ pointerEvents: 'none' }}>
        {paths.map((path, idx) => (
          <path
            key={idx}
            d={path.map((pt, i) => (i === 0 ? 'M' : 'L') + ` ${pt.x} ${pt.y}`).join(' ')}
            stroke={strokeColor}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {currentPath && (
          <path
            d={currentPath.map((pt, i) => (i === 0 ? 'M' : 'L') + ` ${pt.x} ${pt.y}`).join(' ')}
            stroke={strokeColor}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      
      {paths.length > 0 && (
        <div 
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            background: 'rgba(12,14,22,0.85)',
            padding: '6px 12px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 10000
          }}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setPaths(prev => prev.slice(0, -1)); }}
            style={{
              background: 'none', border: 'none', color: 'white', cursor: 'pointer',
              fontSize: '12px', padding: '4px 8px', borderRadius: '4px',
              opacity: 0.9
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            ↩️ Undo
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setPaths([]); }}
            style={{
              background: 'none', border: 'none', color: '#ff6666', cursor: 'pointer',
              fontSize: '12px', padding: '4px 8px', borderRadius: '4px',
              opacity: 0.9
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,100,100,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            🗑️ Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default DrawingOverlay;
