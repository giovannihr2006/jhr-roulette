import React, { useState, useEffect } from 'react'
import { soundManager } from '../utils/SoundManager'
import { dealer, PERSONALITIES } from '../utils/DealerVoice'

export const AudioSettingsModal = ({ onClose }) => {
    // Local State reflecting System State (persisted volume configs)
    const [volumes, setVolumes] = useState({
        master: soundManager.masterVol !== undefined ? soundManager.masterVol : 0.4,
        sfx: soundManager.sfxVol !== undefined ? soundManager.sfxVol : 1.0,
        ambience: soundManager.ambienceVol !== undefined ? soundManager.ambienceVol : 0.5
    })

    const [dealerConfig, setDealerConfig] = useState({
        gender: dealer.gender,
        personality: dealer.personality
    })

    const updateVolume = (channel, val) => {
        soundManager.setVolume(channel, parseFloat(val))
        setVolumes(prev => ({ ...prev, [channel.toLowerCase()]: val }))
    }

    const updateDealer = (key, val) => {
        if (key === 'gender') dealer.setGender(val)
        if (key === 'personality') dealer.setPersonality(val)

        setDealerConfig(prev => ({ ...prev, [key]: val }))

        // Preview
        if (key === 'personality') {
            setTimeout(() => dealer.speak(dealer.getLine('welcome'), true), 500)
        } else {
            // Just say something simple to test voice
            setTimeout(() => dealer.speak("Prueba de audio.", true), 500)
        }
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: 12000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div style={{
                background: '#1a1a1a',
                padding: '40px',
                borderRadius: '20px',
                width: '600px',
                maxWidth: '95vw',
                border: '1px solid #d4af37',
                boxShadow: '0 0 50px rgba(0,0,0,0.9)',
                color: '#ddd',
                fontFamily: 'Inter, sans-serif'
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ margin: 0, color: '#d4af37', fontSize: '1.8rem', textTransform: 'uppercase' }}>Configuración de Audio</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: '1px solid #666', color: '#888',
                        width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer'
                    }}>✕</button>
                </div>

                {/* MIXER SECTION */}
                <div style={{ marginBottom: '30px', background: '#222', padding: '20px', borderRadius: '10px' }}>
                    <h3 style={{ marginTop: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Mezclador (Mixer)</h3>

                    {['MASTER', 'SFX', 'AMBIENCE'].map(ch => (
                        <div key={ch} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ width: '100px', fontSize: '0.9rem', fontWeight: 'bold', color: '#ccc' }}>{ch}</div>
                            <input
                                type="range"
                                min="0" max="1" step="0.05"
                                value={volumes[ch.toLowerCase()]}
                                onChange={(e) => updateVolume(ch, e.target.value)}
                                style={{ flex: 1, accentColor: '#d4af37', cursor: 'pointer' }}
                            />
                            <div style={{ width: '40px', textAlign: 'right', fontSize: '0.8rem', color: '#666' }}>
                                {Math.round(volumes[ch.toLowerCase()] * 100)}%
                            </div>
                        </div>
                    ))}
                    <div style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic', marginTop: '10px' }}>
                        * Ambience genera un entorno de casino procedural (sin descargas).
                    </div>
                </div>

                {/* DEALER SECTION */}
                <div style={{ background: '#222', padding: '20px', borderRadius: '10px' }}>
                    <h3 style={{ marginTop: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Personalización del Dealer</h3>

                    {/* GENDER */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Voz / Género</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['FEMALE', 'MALE'].map(g => (
                                <button key={g}
                                    onClick={() => updateDealer('gender', g)}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                        background: dealerConfig.gender === g ? '#d4af37' : '#333',
                                        color: dealerConfig.gender === g ? '#000' : '#888',
                                        fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {g === 'FEMALE' ? '👩 Lucía (Mujer)' : '👨 Mateo (Hombre)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PERSONALITY */}
                    <div>
                        <div style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Personalidad</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {Object.keys(PERSONALITIES).map(p => (
                                <button key={p}
                                    onClick={() => updateDealer('personality', p)}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                        background: dealerConfig.personality === p ? '#4caf50' : '#333',
                                        color: dealerConfig.personality === p ? '#fff' : '#888',
                                        fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem'
                                    }}
                                >
                                    {p === 'FORMAL' && '👔 Formal'}
                                    {p === 'COACH' && '🧢 Coach'}
                                    {p === 'FRIENDLY' && '😊 Amistoso'}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '5px', fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic' }}>
                            {dealerConfig.personality === 'FORMAL' && "Estilo casino clásico. Profesional, serio y directo."}
                            {dealerConfig.personality === 'COACH' && "Enérgico. Te anima a ganar, te regaña si arriesgas mucho. Alta intensidad."}
                            {dealerConfig.personality === 'FRIENDLY' && "Relajado. Charlas casuales, como jugar con un amigo."}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
