import React, { useRef, useState, useCallback, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { NoteContext } from '../context/NoteContext';
import { setZIndex } from '../utils';

const CanvasImage = ({ image, onDelete }) => {
  const { db } = useContext(NoteContext);
  const pos = JSON.parse(image.position);
  const sz = JSON.parse(image.size);

  const [position, setPosition] = useState({ x: pos.x, y: pos.y });
  const [size, setSize] = useState({ width: sz.width || 300, height: sz.height || 200 });
  const [hovered, setHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const imgRef = useRef(null);
  const dragStart = useRef(null);
  const resizeStart = useRef(null);

  // Global listeners
  useEffect(() => {
    const handleGlobalDelete = () => {
      if (isSelected) onDelete(image.$id);
    };
    const handleGlobalDeselect = () => {
      setIsSelected(false);
    };
    window.addEventListener('globalDelete', handleGlobalDelete);
    window.addEventListener('globalDeselect', handleGlobalDeselect);
    return () => {
      window.removeEventListener('globalDelete', handleGlobalDelete);
      window.removeEventListener('globalDeselect', handleGlobalDeselect);
    };
  }, [isSelected, image.$id, onDelete]);

  // ── Drag ────────────────────────────────────────────
  const onMouseDownDrag = (e) => {
    if (e.target.closest('.ci-resize') || e.target.closest('.ci-delete')) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Selecting
    window.dispatchEvent(new Event('globalDeselect')); // deselect others
    setTimeout(() => setIsSelected(true), 0); // select this

    setZIndex(imgRef.current);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragUp);
  };

  const onDragMove = useCallback((e) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.mouseX;
    const dy = e.clientY - dragStart.current.mouseY;
    setPosition({ x: dragStart.current.startX + dx, y: dragStart.current.startY + dy });
  }, []);

  const onDragUp = useCallback(async () => {
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragUp);
    if (!dragStart.current) return;
    const dx = 0; // already applied via state
    const newPos = {
      x: imgRef.current.offsetLeft,
      y: imgRef.current.offsetTop,
    };
    await db.canvasImages.update(image.$id, { position: JSON.stringify(newPos) });
    dragStart.current = null;
  }, [onDragMove, image.$id]);

  // ── Resize ──────────────────────────────────────────
  const onMouseDownResize = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure selected on resize
    window.dispatchEvent(new Event('globalDeselect'));
    setTimeout(() => setIsSelected(true), 0);

    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: size.width,
      startH: size.height,
      dir,
    };
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeUp);
  };

  const onResizeMove = useCallback((e) => {
    if (!resizeStart.current) return;
    const { mouseX, mouseY, startW, startH, dir } = resizeStart.current;
    const dx = e.clientX - mouseX;
    const dy = e.clientY - mouseY;
    setSize({
      width: dir.includes('e') ? Math.max(80, startW + dx) : (dir === 'w' ? Math.max(80, startW - dx) : startW),
      height: dir.includes('s') ? Math.max(60, startH + dy) : (dir === 'n' ? Math.max(60, startH - dy) : startH),
    });
  }, []);

  const onResizeUp = useCallback(async () => {
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeUp);
    if (!resizeStart.current) return;
    await db.canvasImages.update(image.$id, {
      size: JSON.stringify({ width: imgRef.current.offsetWidth, height: imgRef.current.offsetHeight }),
    });
    resizeStart.current = null;
  }, [onResizeMove, image.$id]);

  // ── Save position from state whenever it changes ──
  // (drag is tracked in dragStart.current, save on mouseUp)

  const showHandles = hovered || isSelected;

  return (
    <motion.div
      ref={imgRef}
      className="canvas-image"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: 'grab',
        userSelect: 'none',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onMouseDown={onMouseDownDrag}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <img
        src={image.src}
        alt="Canvas image"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '8px',
          boxShadow: showHandles
            ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 2px rgba(140,100,255,0.6)'
            : '0 4px 16px rgba(0,0,0,0.35)',
          transition: 'box-shadow 0.2s',
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {/* Delete button */}
      {showHandles && (
        <button
          className="ci-delete"
          onClick={(e) => { e.stopPropagation(); onDelete(image.$id); }}
          title="Delete image"
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(220,50,50,0.9)',
            border: '2px solid white',
            color: 'white',
            fontSize: '13px',
            lineHeight: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            zIndex: 10,
            padding: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          ×
        </button>
      )}

      {/* Resize handles — shown on hover/select */}
      {showHandles && (
        <>
          {/* Corners */}
          {[
            { dir: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
            { dir: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
            { dir: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
            { dir: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
          ].map(({ dir, style }) => (
            <div
              key={dir}
              className="ci-resize"
              onMouseDown={(e) => onMouseDownResize(e, dir)}
              style={{
                position: 'absolute',
                width: 12,
                height: 12,
                background: 'white',
                border: '2px solid rgba(140,100,255,0.9)',
                borderRadius: '50%',
                zIndex: 20,
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                ...style,
              }}
            />
          ))}
          {/* Edge handles */}
          {[
            { dir: 'e', style: { right: -4, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize', width: 8, height: 32 } },
            { dir: 's', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize', width: 32, height: 8 } },
          ].map(({ dir, style }) => (
            <div
              key={dir}
              className="ci-resize"
              onMouseDown={(e) => onMouseDownResize(e, dir)}
              style={{
                position: 'absolute',
                background: 'rgba(140,100,255,0.7)',
                borderRadius: '4px',
                zIndex: 20,
                ...style,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export default CanvasImage;
