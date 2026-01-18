import React, { useState } from 'react'
import { HELP_DICTIONARY } from './HelpData'

export const HelpOverlay = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'absolute', top: 20,
                    right: 640, // Adjust to not overlap Financial HUD
                    background: isOpen ? '#fff' : 'rgba(255,255,255,0.1)',
                    color: isOpen ? '#000' : '#fff',
                    border: '1px solid #fff',
                    borderRadius: '50%',
                    width: '30px', height: '30px',
                    fontSize: '1.2rem', fontWeight: 'bold',
                    cursor: 'pointer', zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title="Abrir Glosario de Ayuda"
            >
                ?
            </button>

            {/* Modal */}
            {isOpen && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '600px', maxHeight: '80vh',
                    background: 'rgba(10, 10, 15, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid #444',
                    borderRadius: '12px',
                    padding: '30px',
                    zIndex: 100,
                    color: '#eee',
                    overflowY: 'auto',
                    boxShadow: '0 0 50px rgba(0,0,0,0.8)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, borderBottom: '2px solid #00ffcc', paddingBottom: '10px', width: '100%' }}>
                            GENESIS: GUÍA DE OPERACIÓN
                        </h2>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                    </div>

                    <p style={{ fontStyle: 'italic', marginBottom: '20px', color: '#aaa' }}>
                        Diccionario de términos técnicos extraídos de hoja 'ENSAYO' y 'com'.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                        {Object.entries(HELP_DICTIONARY).map(([term, def]) => (
                            <div key={term} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px' }}>
                                <div style={{ color: '#00ffcc', fontWeight: 'bold', marginBottom: '4px' }}>{term}</div>
                                <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{def}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px', fontSize: '0.8rem', color: '#888' }}>
                        Desarrollado por Antigravity. Basado en Protocolo Genesis v1.0.
                    </div>
                </div>
            )}
        </>
    )
}
