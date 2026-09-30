import React, { useEffect, useRef, useState } from 'react';
import { setNewOffset, autoGrow, setZIndex, bodyParser } from '../utils';

const NoteCard = ({ note }) => {
  const body = bodyParser(note.body);
  const colors = JSON.parse(note.colors);
  const [position, setPosition] = useState(JSON.parse(note.position));
  let mouseStartPos = { x: 0, y: 0 };

  const cardRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    setZIndex(cardRef.current);
    if (textAreaRef.current) {
      autoGrow(textAreaRef);
    }
  }, []);

  const mouseDown = (e) => {
    if (e.target.className === "card-header") {
      setZIndex(cardRef.current);
      mouseStartPos.x = e.clientX;
      mouseStartPos.y = e.clientY;

      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);
    }
  };

  const mouseMove = (e) => {
    const mouseMoveDir = {
      x: mouseStartPos.x - e.clientX,
      y: mouseStartPos.y - e.clientY,
    };

    mouseStartPos.x = e.clientX;
    mouseStartPos.y = e.clientY;

    const newPosition = setNewOffset(cardRef.current, mouseMoveDir);
    setPosition(newPosition);
  };

  const mouseUp = () => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  };

  return (
    <div
      ref={cardRef}
      className="card"
      style={{
        backgroundColor: colors.colorBody,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '320px',
      }}
    >
      <div
        className="card-header"
        onMouseDown={mouseDown}
        style={{ backgroundColor: colors.colorHeader }}
      >
        <span style={{ fontSize: '13px', fontWeight: '600', color: colors.colorText }}>Sticky Note</span>
      </div>
      <div className="card-body">
        <textarea
          ref={textAreaRef}
          defaultValue={body}
          onInput={() => autoGrow(textAreaRef)}
          style={{ color: colors.colorText }}
        />
      </div>
    </div>
  );
};

export default NoteCard;
