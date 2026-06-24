import React from 'react'
import { SessionClock } from './SessionClock'
import SpinCounter from './SpinCounter'

export const TopBar = ({
    viewMode3D, setViewMode3D,
    setShowAudioSettings,
    setShowHistory,
    setShowHelp,
    setShowManual, // Códice GHR
    setShowForensicManual, // NEW
    isEditMode, setIsEditMode,
    onResetLayout // New Prop
}) => {

    const containerStyle = {
        position: 'absolute', // Fixed at top
        top: 0, left: 0, width: '100%',
        height: '70px',
        background: 'linear-gradient(to bottom, #111, rgba(20,20,20,0.8))',
        borderBottom: '1px solid #d4af37',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 5000,
        boxShadow: '0 5px 20px rgba(0,0,0,0.8)',
        backdropFilter: 'blur(5px)'
    }

    const sectionStyle = { display: 'flex', alignItems: 'center', gap: '15px' }

    return (
        <div style={containerStyle}>
            {/* LEFT: BRANDING & SYSTEM */}
            <div style={sectionStyle}>
                {/* LOGO TITLE */}
                <div style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '1.8rem', // Increased visibility
                    color: '#d4af37',
                    fontWeight: 'bold',
                    textShadow: '0 0 15px rgba(212,175,55,0.6)', // Stronger Glow
                    letterSpacing: '2px',
                    marginRight: '20px',
                    whiteSpace: 'nowrap'
                }}>
                    GHR <span style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 'bold' }}>RULETA ROYALE</span>
                </div>

                {/* EDIT MODE TOGGLE */}
                <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    style={{
                        background: isEditMode ? '#ff4444' : 'transparent',
                        color: isEditMode ? '#fff' : '#666',
                        border: isEditMode ? '1px solid #ff4444' : '1px solid #444',
                        padding: '5px 15px', borderRadius: '4px', cursor: 'pointer',
                        fontSize: '0.8rem', fontWeight: 'bold'
                    }}
                    title="Desbloquear para mover elementos"
                >
                    {isEditMode ? '🔓 EDITANDO' : '🔒 LOCKED'}
                </button>

                {/* RESET LAYOUT (Panic Button) */}
                {isEditMode && (
                    <button
                        onClick={onResetLayout}
                        style={{
                            background: '#444', color: '#fff', border: '1px solid #fff',
                            padding: '5px 15px', borderRadius: '4px', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: 'bold'
                        }}
                        title="Restaurar Posiciones Originales"
                    >
                        ↺ REINICIAR DISEÑO
                    </button>
                )}
            </div>

            {/* CENTER: INFO WIDGETS (MOVED TO DRAGGABLE) */}
            <div style={sectionStyle}>
                {/* Widgets now free floating */}
            </div>

            {/* RIGHT: CONTROLS */}
            <div style={sectionStyle}>
                {/* Clock moved to Draggable */}

                <div style={{ width: '1px', height: '30px', background: '#333' }}></div> {/* Separator */}

                {/* MANUAL / HELP */}
                <button onClick={() => setShowForensicManual(true)} title="Tutorial Forense (Certificación)" className="icon-btn" style={{ fontSize: '1.8rem', color: '#d4af37' }}>🎓</button>
                <div style={{ width: '1px', height: '20px', background: '#333' }}></div>
                <button onClick={() => setShowManual(true)} title="Códice GHR" className="icon-btn">📖</button>
                <button onClick={() => setShowHelp(true)} title="Ayuda" className="icon-btn">?</button>

                <div style={{ width: '1px', height: '30px', background: '#333' }}></div> {/* Separator */}

                {/* 3D TOGGLE */}
                <button onClick={() => setViewMode3D(!viewMode3D)} title="Vista 3D"
                    style={{
                        color: viewMode3D ? '#00CED1' : '#555',
                        textShadow: viewMode3D ? '0 0 10px #00CED1' : 'none',
                        background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer'
                    }}
                >
                    🎲
                </button>

                {/* AUDIO */}
                <button onClick={() => setShowAudioSettings(true)} title="Audio" className="icon-btn">🔊</button>

                {/* HISTORY */}
                <button
                    onClick={() => setShowHistory(true)}
                    style={{
                        background: '#6610f2', color: '#fff', padding: '5px 20px',
                        border: '1px solid #888', borderRadius: '4px', cursor: 'pointer',
                        fontWeight: 'bold', marginLeft: '10px', whiteSpace: 'nowrap', minWidth: '100px'
                    }}
                >
                    HISTORIAL
                </button>
            </div>

            {/* INLINE STYLES FOR HOVER EFFECTS (Basic) */}
            <style>{`
                .icon-btn {
                    background: transparent; border: none; font-size: 1.5rem; cursor: pointer;
                    color: #aaa; transition: transform 0.2s, color 0.2s;
                }
                .icon-btn:hover { color: #fff; transform: scale(1.1); }
            `}</style>
        </div>
    )
}
