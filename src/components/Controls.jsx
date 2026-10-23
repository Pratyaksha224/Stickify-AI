import AddButton from "./AddButton";
import ExportImport from "./ExportImport";
import StyleControl from "./StyleControl";
import BackgroundSelector from "./BackgroundSelector";
import ColorPicker from "./ColorPicker";
import CanvasImageUploader from "./CanvasImageUploader";
import CanvasShapeSelector from "./CanvasShapeSelector";
import { useContext, useState, useRef, useEffect } from "react";
import { NoteContext } from "../context/NoteContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BarChart2, PenTool, Trash2, LogOut } from "lucide-react";

const Controls = () => {
    const { isGlobalDrawing, setIsGlobalDrawing } = useContext(NoteContext);
    const { logoutUser, user } = useAuth();
    const navigate = useNavigate();
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

                {/* Profile Avatar with popup */}
                <div style={{ position: 'relative' }} ref={popupRef}>
                    <button
                        onClick={() => setShowProfile(v => !v)}
                        title={user?.name || user?.email || 'Profile'}
                        style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            padding: 0, cursor: 'pointer',
                            border: showProfile ? '2px solid #a78bfa' : '2px solid rgba(255,255,255,0.2)',
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                            boxShadow: showProfile ? '0 0 0 3px rgba(167,139,250,0.3)' : 'none',
                            flexShrink: 0,
                        }}
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>
                                {getInitials()}
                            </span>
                        )}
                    </button>

                    {/* Profile Popup */}
                    {showProfile && (
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '52px',
                            background: 'rgba(18, 18, 30, 0.98)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '16px',
                            padding: '16px',
                            minWidth: '220px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                            zIndex: 9999,
                        }}>
                            {/* User info row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden', flexShrink: 0,
                                    border: '2px solid rgba(167,139,250,0.5)',
                                }}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>{getInitials()}</span>
                                    )}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{
                                        color: '#fff', fontSize: '13px', fontWeight: 600,
                                        fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                                        overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px'
                                    }}>
                                        {user?.name || 'User'}
                                    </div>
                                    <div style={{
                                        color: 'rgba(255,255,255,0.45)', fontSize: '11px',
                                        fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                                        overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px',
                                        marginTop: '2px'
                                    }}>
                                        {user?.email || ''}
                                    </div>
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