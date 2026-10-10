import { createContext, useState, useEffect, useMemo } from "react";
import Spinner from "../icons/Spinner";
import { createUserDb } from "../appwrite/databases";
 
export const NoteContext = createContext();
 
const NotesProvider = ({ children, userId }) => {
    const [notes, setNotes] = useState([]);
    const [canvasImages, setCanvasImages] = useState([]);
    const [canvasShapes, setCanvasShapes] = useState([]);
    const [aiMeta, setAiMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGlobalDrawing, setIsGlobalDrawing] = useState(false);
    
    // Background state persisting to localStorage (per user)
    const [background, setBackground] = useState(
        localStorage.getItem(`stickify_background_${userId}`) || 'dark'
    );

    // Create a user-specific database instance (only when userId is available)
    const db = useMemo(() => userId ? createUserDb(userId) : null, [userId]);
 
    useEffect(() => {
        if (userId) {
            setLoading(true);
            // Safety timeout — if DB never responds, show empty workspace after 8s
            const timeout = setTimeout(() => {
                console.warn('DB init timed out — showing empty workspace');
                setLoading(false);
            }, 8000);
            init().finally(() => clearTimeout(timeout));
        } else {
            setLoading(false);
        }
    }, [userId, db]);

    useEffect(() => {
        localStorage.setItem(`stickify_background_${userId}`, background);
    }, [background, userId]);
 
    const init = async () => {
        try {
            const response = await db.notes.list();
            setNotes(response.documents);
        } catch(e) {
            console.error('Failed to load notes:', e);
            setNotes([]);
        }
        try {
            const imgResp = await db.canvasImages.list();
            setCanvasImages(imgResp.documents);
        } catch(e) {
            setCanvasImages([]);
        }
        try {
            const shapeResp = await db.canvasShapes.list();
            setCanvasShapes(shapeResp.documents);
        } catch(e) {
            setCanvasShapes([]);
        }
        try {
            const metaResp = await db.aiMeta.list();
            const metaMap = {};
            metaResp.documents.forEach(doc => {
                // Key by noteId if available, otherwise by $id
                const key = doc.noteId || doc.$id;
                metaMap[key] = doc;
            });
            setAiMeta(metaMap);
        } catch(e) {
            setAiMeta({});
        }
        setLoading(false);
    };

    const contextData = {
        notes,
        setNotes,
        canvasImages,
        setCanvasImages,
        canvasShapes,
        setCanvasShapes,
        aiMeta,
        setAiMeta,
        selectedNote,
        setSelectedNote,
        searchQuery,
        setSearchQuery,
        background,
        setBackground,
        isGlobalDrawing,
        setIsGlobalDrawing,
        db, // expose db so components can use the user-specific instance
    };
 
    return (
        <NoteContext.Provider value={contextData}>
            {loading ? (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100vh",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >
                    <Spinner size="60" />
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: 0 }}>Loading your notes...</p>
                </div>
            ) : (
                children
            )}
        </NoteContext.Provider>
    );
};

export default NotesProvider;