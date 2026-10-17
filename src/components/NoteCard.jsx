import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import DeleteButton from './DeleteButton';
import { setNewOffset, setZIndex, bodyParser } from '../utils';
import Spinner from '../icons/Spinner';
import { useContext } from 'react';
import { NoteContext } from '../context/NoteContext';
import AiAssistant from './AiAssistant';
import CategoryBadge from './CategoryBadge';
import PriorityIndicator from './PriorityIndicator';
import TaskList from './TaskList';
import SummaryPanel from './SummaryPanel';
import { SHAPES, ShapesPanel } from './ShapesMenu';
import DrawingOverlay from './DrawingOverlay';
import EmojiPickerBtn from './EmojiPickerBtn';
import { Trash2, Image as ImageIcon, PenTool, Hexagon } from "lucide-react";

// ── Toolbar Button helper ─────────────────────────────────────
const TBtn = ({ onAction, label, title, active }) => (
  <button
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onAction(); }}
    style={{
      background: active ? 'rgba(140,100,255,0.25)' : 'none',
      border: active ? '1px solid rgba(140,100,255,0.5)' : '1px solid transparent',
      cursor: 'pointer',
      padding: '2px 7px',
      fontSize: '12px',
      color: 'inherit',
      opacity: 0.8,
      borderRadius: '4px',
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(128,128,128,0.15)'; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.background = active ? 'rgba(140,100,255,0.25)' : 'none'; }}
  >
    {label}
  </button>
);

// ── Main NoteCard ─────────────────────────────────────────────
const NoteCard = ({ note }) => {
  const [saving, setSaving] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [isLocalDrawing, setIsLocalDrawing] = useState(false);
  const [activeSticker, setActiveSticker] = useState(null); // Track selected in-note sticker
  const keyUpTimer = useRef(null);

  const { setSelectedNote, db, aiMeta } = useContext(NoteContext);
  
  const currentMeta = aiMeta[note.$id] || {};

  const body = bodyParser(note.body);
  
  // Parse position — may include width/height
  const rawPos = JSON.parse(note.position);
  const [position, setPosition] = useState({ x: rawPos.x, y: rawPos.y });
  const [cardSize, setCardSize] = useState({
    width: rawPos.width || 360,
    height: rawPos.height || 'auto'
  });
  
  const colors = JSON.parse(note.colors);
  const template = note.template || 'classic';

  let mouseStartPos = { x: 0, y: 0 };
  const cardRef = useRef(null);
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const resizeStartRef = useRef(null);
  const shapesRef = useRef(null);

  useEffect(() => {
    setZIndex(cardRef.current);
    if (editorRef.current && body) {
      editorRef.current.innerHTML = body;
    }
  }, []);

  // Close shapes panel when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (shapesRef.current && shapesRef.current.contains(e.target)) return;
      setShowShapes(false);
    };
    if (showShapes) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showShapes]);

  // Handle Global Delete
  useEffect(() => {
    const handleGlobalDelete = () => {
      if (activeSticker) {
        activeSticker.remove();
        setActiveSticker(null);
        handleInput();
      }
    };
    window.addEventListener('globalDelete', handleGlobalDelete);
    return () => window.removeEventListener('globalDelete', handleGlobalDelete);
  }, [activeSticker]);

  // Local Delete function
  const handleLocalDelete = () => {
    if (activeSticker) {
      activeSticker.remove();
      setActiveSticker(null);
      handleInput();
    } else {
      document.execCommand('delete');
      handleInput();
    }
  };

  // ── Vanilla JS Drag & Resize for Inline Images/Stickers ────────────
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    let activeEl = null;
    let mode = null; // 'drag' or 'resize'
    let resizeDir = '';
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;
    let startW = 0, startH = 0;

    const onMouseDown = (e) => {
      if (e.target.classList.contains('inline-img-resize')) {
        e.preventDefault();
        e.stopPropagation();
        mode = 'resize';
        activeEl = e.target.parentElement;
        resizeDir = e.target.dataset.dir || 'se';
        setActiveSticker(activeEl);
        startX = e.clientX;
        startY = e.clientY;
        startLeft = activeEl.offsetLeft;
        startTop = activeEl.offsetTop;
        startW = activeEl.offsetWidth;
        startH = activeEl.offsetHeight;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return;
      }
      // If wrapper or image clicked
      else if (e.target.closest('.inline-img-wrapper')) {
        const wrapper = e.target.closest('.inline-img-wrapper');
        // If clicking delete button, let it handle itself
        if (e.target.classList.contains('inline-img-del')) return;
        
        e.preventDefault();
        mode = 'drag';
        
        // Clear previous active
        editor.querySelectorAll('.inline-img-wrapper.active-sticker').forEach(el => el.classList.remove('active-sticker'));
        
        activeEl = wrapper;
        activeEl.classList.add('active-sticker');
        setActiveSticker(activeEl);
        
        startX = e.clientX;
        startY = e.clientY;
        startLeft = activeEl.offsetLeft;
        startTop = activeEl.offsetTop;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      } else {
        // Clicked outside sticker, clear active
        editor.querySelectorAll('.inline-img-wrapper.active-sticker').forEach(el => el.classList.remove('active-sticker'));
        setActiveSticker(null);
      }
    };

    const onMouseMove = (e) => {
      if (!activeEl) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (mode === 'drag') {
        activeEl.style.left = `${startLeft + dx}px`;
        activeEl.style.top = `${startTop + dy}px`;
      } else if (mode === 'resize') {
        if (resizeDir.includes('e')) activeEl.style.width = `${Math.max(40, startW + dx)}px`;
        if (resizeDir.includes('w')) {
          activeEl.style.width = `${Math.max(40, startW - dx)}px`;
          activeEl.style.left = `${startLeft + dx}px`;
        }
        if (resizeDir.includes('s')) activeEl.style.height = `${Math.max(40, startH + dy)}px`;
        if (resizeDir.includes('n')) {
          activeEl.style.height = `${Math.max(40, startH - dy)}px`;
          activeEl.style.top = `${startTop + dy}px`;
        }
      }
    };

    const onMouseUp = () => {
      if (activeEl) {
        handleInput(); // Save state
      }
      activeEl = null;
      mode = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    editor.addEventListener('mousedown', onMouseDown);
    return () => {
      editor.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // ── Drag ──────────────────────────────────────────────────
  const mouseDown = (e) => {
    if (e.target.closest('.card-drag-handle') && !e.target.closest('.card-body') && !e.target.closest('.note-toolbar') && !e.target.closest('.resize-handle')) {
      mouseStartPos.x = e.clientX;
      mouseStartPos.y = e.clientY;
      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
      setZIndex(cardRef.current);
      setSelectedNote(note);
    }
  };

  const mouseMove = (e) => {
    const dir = { x: mouseStartPos.x - e.clientX, y: mouseStartPos.y - e.clientY };
    mouseStartPos.x = e.clientX;
    mouseStartPos.y = e.clientY;
    setPosition(setNewOffset(cardRef.current, dir));
  };

  const mouseUp = () => {
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
    const off = setNewOffset(cardRef.current);
    const pos = { ...off, width: cardRef.current.offsetWidth, height: cardRef.current.offsetHeight };
    saveRaw('position', pos);
  };

  // ── Touch drag ────────────────────────────────────────────
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchStart = (e) => {
    if (e.target.closest('.card-drag-handle') && !e.target.closest('.card-body')) {
      const t = e.touches[0];
      touchStartPos.current = { x: t.clientX, y: t.clientY };
      setZIndex(cardRef.current);
      setSelectedNote(note);
    }
  };
  const touchMove = (e) => {
    if (e.target.closest('.card-body')) return;
    e.preventDefault();
    const t = e.touches[0];
    const dir = { x: touchStartPos.current.x - t.clientX, y: touchStartPos.current.y - t.clientY };
    touchStartPos.current = { x: t.clientX, y: t.clientY };
    setPosition(setNewOffset(cardRef.current, dir));
  };
  const touchEnd = () => {
    const off = setNewOffset(cardRef.current);
    const pos = { ...off, width: cardRef.current.offsetWidth, height: cardRef.current.offsetHeight };
    saveRaw('position', pos);
  };

  // ── Resize ────────────────────────────────────────────────
  const startResize = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: cardRef.current.offsetWidth,
      startH: cardRef.current.offsetHeight,
      dir,
    };
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
  };

  const doResize = useCallback((e) => {
    if (!resizeStartRef.current) return;
    const { mouseX, mouseY, startW, startH, dir } = resizeStartRef.current;
    const dx = e.clientX - mouseX;
    const dy = e.clientY - mouseY;
    setCardSize(prev => ({
      width: dir.includes('e') ? Math.max(240, startW + dx) : prev.width,
      height: dir.includes('s') ? Math.max(160, startH + dy) : prev.height,
    }));
  }, []);

  const stopResize = useCallback(() => {
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
    const off = setNewOffset(cardRef.current);
    const pos = { ...off, width: cardRef.current.offsetWidth, height: cardRef.current.offsetHeight };
    saveRaw('position', pos);
    resizeStartRef.current = null;
  }, [doResize]);

  // ── Persistence ───────────────────────────────────────────
  const saveRaw = async (key, value) => {
    try {
      await db.notes.update(note.$id, { [key]: JSON.stringify(value) });
      setSaving(false);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const saveData = async (key, value) => {
    const payload = { [key]: JSON.stringify(value) };
    try {
      await db.notes.update(note.$id, payload);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const handleInput = useCallback(() => {
    setSaving(true);
    const html = editorRef.current?.innerHTML || '';
    if (keyUpTimer.current) clearTimeout(keyUpTimer.current);
    keyUpTimer.current = setTimeout(() => saveData('body', html), 2000);
  }, []);

  const handleAiResult = (newText) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = newText;
      setSaving(true);
      saveData('body', newText);
    }
  };

  // ── Image handlers ────────────────────────────────────────
  const generateHandles = () => `
    <div class="inline-img-resize" data-dir="se" style="bottom:-6px; right:-6px; cursor:se-resize;"></div>
    <div class="inline-img-resize" data-dir="sw" style="bottom:-6px; left:-6px; cursor:sw-resize;"></div>
    <div class="inline-img-resize" data-dir="ne" style="top:-6px; right:-6px; cursor:ne-resize;"></div>
    <div class="inline-img-resize" data-dir="nw" style="top:-6px; left:-6px; cursor:nw-resize;"></div>
    <div class="inline-img-resize edge" data-dir="e" style="right:-4px; top:50%; transform:translateY(-50%); cursor:ew-resize; width:8px; height:32px; border-radius:4px; background:rgba(140,100,255,0.7); border:none;"></div>
    <div class="inline-img-resize edge" data-dir="s" style="bottom:-4px; left:50%; transform:translateX(-50%); cursor:ns-resize; width:32px; height:8px; border-radius:4px; background:rgba(140,100,255,0.7); border:none;"></div>
  `;

  const insertImageWrapper = (src) => {
    const html = `
      <div class="inline-img-wrapper" contenteditable="false" style="position:absolute; left:20px; top:40px; width:150px; height:150px;">
        <img src="${src}" />
        <button class="inline-img-del" onclick="this.parentElement.remove()" title="Delete Image">×</button>
        ${generateHandles()}
      </div>&nbsp;
    `;
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (ev) => insertImageWrapper(ev.target.result);
        reader.readAsDataURL(item.getAsFile());
        break;
      }
    }
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      editorRef.current?.focus();
      insertImageWrapper(ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const insertShape = (shape) => {
    editorRef.current?.focus();
    if (shape.isSticker) {
      const html = `
        <div class="inline-img-wrapper" contenteditable="false" style="position:absolute; left:20px; top:40px; width:100px; height:100px; display:flex; align-items:center; justify-content:center;">
          ${shape.html.replace(/width="[0-9%]+"/, 'width="100%"').replace(/height="[0-9%]+"/, 'height="100%"')}
          <button class="inline-img-del" onclick="this.parentElement.remove()" title="Delete Shape">×</button>
          ${generateHandles()}
        </div>&nbsp;
      `;
      document.execCommand('insertHTML', false, html);
    } else {
      document.execCommand('insertHTML', false, shape.html);
    }
    handleInput();
  };

  const handleSaveLocalDrawing = (drawData) => {
    setIsLocalDrawing(false);
    insertShape({
      isSticker: true,
      html: drawData.html
    });
  };

  // ── Styles ────────────────────────────────────────────────
  const isColoredTemplate = template === 'classic';
  const cardStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${cardSize.width}px`,
    ...(cardSize.height ? { minHeight: `${cardSize.height}px` } : {}),
    ...(isColoredTemplate ? { backgroundColor: colors.colorBody } : {}),
  };
  const headerStyle = isColoredTemplate ? { backgroundColor: colors.colorHeader } : {};
  const textColor = isColoredTemplate ? colors.colorText : undefined;
  const toolbarColor = isColoredTemplate ? colors.colorText : undefined;

  return (
    <motion.div
      ref={cardRef}
      className={`card tpl-${template}`}
      style={cardStyle}
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onMouseDown={mouseDown}
      onTouchStart={touchStart}
      onTouchMove={touchMove}
      onTouchEnd={touchEnd}
    >
      {/* Header */}
      <CategoryBadge category={currentMeta.category} />
      <PriorityIndicator priority={currentMeta.priority} reason={currentMeta.priorityReason} />
      
      <div className="card-header card-drag-handle" style={headerStyle}>
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: 'bold', marginRight: '8px' }}>
          {currentMeta.title || ''}
        </div>
        <DeleteButton noteId={note.$id} />
        {saving && (
          <div className="card-saving">
            <Spinner color={textColor || '#aaa'} />
            <span style={{ color: textColor || '#aaa', fontSize: '12px' }}>Saving...</span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="note-toolbar" style={toolbarColor ? { color: toolbarColor } : {}}>
        {/* Text formatting */}
        <TBtn onAction={() => document.execCommand('bold')} label={<strong>B</strong>} title="Bold" />
        <TBtn onAction={() => document.execCommand('italic')} label={<em>I</em>} title="Italic" />
        <TBtn onAction={() => document.execCommand('underline')} label={<u>U</u>} title="Underline" />
        <TBtn onAction={() => document.execCommand('strikeThrough')} label={<s>S</s>} title="Strikethrough" />
        
        <span className="toolbar-sep" />

        {/* Lists */}
        <TBtn onAction={() => document.execCommand('insertUnorderedList')} label="• List" title="Bullet list" />
        <TBtn onAction={() => document.execCommand('insertOrderedList')} label="1. List" title="Numbered list" />

        <span className="toolbar-sep" />

        {/* Delete selection */}
        <TBtn onAction={handleLocalDelete} label={<Trash2 size={14} />} title="Delete selection" />

        <span className="toolbar-sep" />

        {/* Emoji picker */}
        <EmojiPickerBtn
          toolbarColor={toolbarColor}
          onSelect={(emoji, savedRange) => {
            const editor = editorRef.current;
            if (!editor) return;
            editor.focus();

            const sel = window.getSelection();
            sel.removeAllRanges();

            // Restore the saved range (cursor position from before picker opened)
            const range = savedRange || (sel.rangeCount > 0 ? sel.getRangeAt(0) : null);

            if (range && editor.contains(range.commonAncestorContainer)) {
              sel.addRange(range);
              range.deleteContents();
              const textNode = document.createTextNode(emoji);
              range.insertNode(textNode);
              range.setStartAfter(textNode);
              range.setEndAfter(textNode);
              sel.removeAllRanges();
              sel.addRange(range);
            } else {
              // Fallback: append to end
              const endRange = document.createRange();
              endRange.selectNodeContents(editor);
              endRange.collapse(false);
              const textNode = document.createTextNode(emoji);
              endRange.insertNode(textNode);
              endRange.setStartAfter(textNode);
              endRange.setEndAfter(textNode);
              sel.removeAllRanges();
              sel.addRange(endRange);
            }
            handleInput();
          }}
        />

        {/* Image upload */}
        <TBtn
          onAction={() => imageInputRef.current?.click()}
          label={<span style={{display:'flex', alignItems:'center', gap:'4px'}}><ImageIcon size={14} /> Image</span>}
          title="Insert image from file"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageFile}
        />

        <TBtn
          onAction={() => setIsLocalDrawing(v => !v)}
          label={<span style={{display:'flex', alignItems:'center', gap:'4px'}}><PenTool size={14} /> Draw</span>}
          title="Freehand Draw"
          active={isLocalDrawing}
        />

        {/* Shapes panel */}
        <div style={{ position: 'relative' }} ref={shapesRef}>
          <TBtn
            onAction={() => setShowShapes(v => !v)}
            label={<span style={{display:'flex', alignItems:'center', gap:'4px'}}><Hexagon size={14} /> Shapes</span>}
            title="Insert shapes & callouts"
            active={showShapes}
          />
          <ShapesPanel
            isOpen={showShapes}
            onInsert={insertShape}
            onClose={() => setShowShapes(false)}
          />
        </div>
      </div>

      {/* Body */}
      <div className="card-body" style={{ color: textColor, position: 'relative' }} onKeyUp={handleInput} onPaste={handlePaste}>
        <DrawingOverlay isActive={isLocalDrawing} onSave={handleSaveLocalDrawing} strokeColor={textColor || '#ffffff'} />
        <div
          ref={editorRef}
          className="note-editor"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => {
            setZIndex(cardRef.current);
            setSelectedNote(note);
          }}
          style={textColor ? { color: textColor } : {}}
          data-placeholder="Write your note..."
        />
        <AiAssistant
          noteId={note.$id}
          getText={() => editorRef.current?.innerText || ''}
          onTextUpdate={handleAiResult}
          colors={colors}
        />
        <SummaryPanel summary={currentMeta.summary} />
        <TaskList noteId={note.$id} initialTasks={currentMeta.tasks} />
      </div>

      {/* ── Resize Handles ── */}
      {/* Right edge */}
      <div
        className="resize-handle resize-e"
        onMouseDown={(e) => startResize(e, 'e')}
        title="Resize width"
      />
      {/* Bottom edge */}
      <div
        className="resize-handle resize-s"
        onMouseDown={(e) => startResize(e, 's')}
        title="Resize height"
      />
      {/* Bottom-right corner */}
      <div
        className="resize-handle resize-se"
        onMouseDown={(e) => startResize(e, 'se')}
        title="Resize"
      />
    </motion.div>
  );
};

export default NoteCard;