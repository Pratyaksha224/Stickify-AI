import AddButton from "./AddButton";
import ExportImport from "./ExportImport";
import StyleControl from "./StyleControl";
import BackgroundSelector from "./BackgroundSelector";
import ColorPicker from "./ColorPicker";
import CanvasImageUploader from "./CanvasImageUploader";
import CanvasShapeSelector from "./CanvasShapeSelector";
import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NoteContext } from "../context/NoteContext";
import { BarChart2, PenTool, Trash2, LogOut } from "lucide-react";

const Controls = () => {
    const navigate = useNavigate();
    const { isGlobalDrawing, setIsGlobalDrawing } = useContext(NoteContext);
            const [showProfile, setShowProfile] = useState(false);
    const popupRef = useRef(null);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setShowProfile(false);
            }
        };
        if (showProfile) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfile]);

    // Get user initials as fallback avatar
    const getInitials = () => {
        if (!user) return '?';
        const name = user.name || user.email || '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    };

    // Google profile photo stored in prefs by Appwrite (if available)
    const avatarUrl = user?.prefs?.avatar || null;

    return (
        <div id="controls">
            <AddButton />
            <ColorPicker />
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', margin: '4px 0' }}></div>
            <StyleControl />
            <CanvasImageUploader />
            <CanvasShapeSelector />

            {/* Dashboard */}
            <button
                onClick={() => navigate('/dashboard')}
                title="AI Dashboard"
                className="ctrl-btn"
                style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(50, 205, 50, 0.2)',
                    border: '1px solid rgba(50, 205, 50, 0.4)',
                    color: '#32CD32', fontSize: '18px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', marginTop: '4px'
                }}
            >
                <BarChart2 size={18} />
            </button>

                        {/* Freehand Draw */}
            <button
                onClick={() => setIsGlobalDrawing(v => !v)}
                title="Freehand Draw"
                className={`ctrl-btn ${isGlobalDrawing ? 'active' : ''}`}
                style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: isGlobalDrawing ? 'rgba(140, 100, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${isGlobalDrawing ? 'rgba(140, 100, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: 'white', fontSize: '18px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', marginTop: '4px'
                }}
            >
                <PenTool size={18} />
            </button>

            {/* Delete */}
            <button
                onClick={() => window.dispatchEvent(new Event('globalDelete'))}
                title="Delete Selected Item"
                className="ctrl-btn"
                style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(255, 60, 60, 0.15)',
                    border: '1px solid rgba(255, 60, 60, 0.4)',
                    color: '#ff6666', fontSize: '18px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', marginTop: '4px'
                }}
            >
                <Trash2 size={18} />
            </button>

            <BackgroundSelector />

            {/* Bottom section: Export + Profile */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5em',
                display: 'flex', flexDirection: 'column', gap: '0.5em',
                alignItems: 'center', marginTop: '4px', width: '100%'
            }}>
                <ExportImport />

                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 12px' }} />

                            {/* Sign Out button */}
                            <button
                                onClick={() => { setShowProfile(false); logoutUser(); }}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 12px', borderRadius: '10px',
                                    background: 'rgba(255, 80, 80, 0.1)',
                                    border: '1px solid rgba(255, 80, 80, 0.25)',
                                    color: '#ff6b6b', fontSize: '13px', fontWeight: 600,
                                    fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,80,80,0.22)';
                                    e.currentTarget.style.borderColor = 'rgba(255,80,80,0.5)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,80,80,0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(255,80,80,0.25)';
                                }}
                            >
                                <LogOut size={15} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Controls;