import NoteCard from "../components/NoteCard";
import CanvasImage from "../components/CanvasImage";
import CanvasShape from "../components/CanvasShape";
import Controls from "../components/Controls";
import DrawingOverlay from "../components/DrawingOverlay";
import { useContext, useCallback } from "react";
import { NoteContext } from "../context/NoteContext";

const NotesPage = () => {
  const { notes, background, canvasImages, setCanvasImages, canvasShapes, setCanvasShapes, isGlobalDrawing, setIsGlobalDrawing, db } = useContext(NoteContext);

  const handleDeleteCanvasImage = useCallback(async (id) => {
    setCanvasImages(prev => prev.filter(img => img.$id !== id));
    try {
      await db?.canvasImages?.delete(id);
    } catch (err) {
      console.error('Failed to delete canvas image:', err);
    }
  }, [setCanvasImages, db]);

  const handleDeleteCanvasShape = useCallback(async (id) => {
    setCanvasShapes(prev => prev.filter(shape => shape.$id !== id));
    try {
      await db?.canvasShapes?.delete(id);
    } catch (err) {
      console.error('Failed to delete canvas shape:', err);
    }
  }, [setCanvasShapes, db]);

  const handleSaveGlobalDrawing = async (drawData) => {
    setIsGlobalDrawing(false);
    try {
      const payload = {
        html: drawData.html,
        position: JSON.stringify({ x: drawData.position.x, y: drawData.position.y }),
        size: JSON.stringify({ width: drawData.size.width, height: drawData.size.height }),
        isSticker: drawData.isSticker
      };
      if (db?.canvasShapes) {
        const response = await db.canvasShapes.create(payload);
        setCanvasShapes(prev => [...prev, response]);
      }
    } catch (err) {
      console.error('Failed to save drawing:', err);
    }
  };

  const strokeColor = background === 'dark' ? '#ffffff' : '#000000';

  return (
    <div 
        id="app" 
        className={`bg-${background || 'dark'}`}
        onClick={(e) => {
            if (e.target.id === 'app') {
                window.dispatchEvent(new Event('globalDeselect'));
            }
        }}
    >
      <DrawingOverlay isActive={isGlobalDrawing} onSave={handleSaveGlobalDrawing} strokeColor={strokeColor} />
      
      {notes.map(note => (
        <NoteCard key={note.$id} note={note} />
      ))}
      {canvasImages.map(img => (
        <CanvasImage key={img.$id} image={img} onDelete={handleDeleteCanvasImage} />
      ))}
      {canvasShapes.map(shape => (
        <CanvasShape key={shape.$id} shape={shape} onDelete={handleDeleteCanvasShape} />
      ))}
      <Controls />
    </div>
  );
};

export default NotesPage;
