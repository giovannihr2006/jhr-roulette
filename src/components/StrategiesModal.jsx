import React from 'react'
import { BETTING_STRATEGIES } from '../logic/BettingStrategies'
import { Z_LAYERS } from '../config/Theme' // NEW

export const StrategiesModal = ({ onClose, onApply }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: Z_LAYERS.MODAL_CONTENT,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: '#151515', width: '500px',
                borderRadius: '15px', border: '2px solid #d4af37',
                padding: '25px', boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#d4af37', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        🧠 Estrategias Maestras
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', color: '#888',
                        fontSize: '24px', cursor: 'pointer'
                    }}>×</button>
                </div>


                {/* Automation Section (Moved to Top) */}
                <div style={{
                    marginBottom: '20px', padding: '15px', background: '#111',
                    border: '1px solid #444', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
                        ⚡ <strong>Modo Automático:</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#777', fontSize: '0.8rem' }}>Giros:</span>
                        <input
                            type="number"
                            id="autoSpinCount"
                            defaultValue="480"
                            min="1"
                            max="10000"
                            style={{
                                width: '70px', background: '#222', border: '1px solid #555',
                                color: '#d4af37', padding: '5px', textAlign: 'center', borderRadius: '4px'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {Object.entries(BETTING_STRATEGIES).map(([key, strat]) => (
                        <div key={key} style={{
                            background: '#222', padding: '15px', borderRadius: '10px',
                            border: '1px solid #333', transition: 'all 0.2s',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ flex: 1, paddingRight: '15px' }}>
                                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.0rem', marginBottom: '5px' }}>
                                    {strat.label}
                                </div>
                                <div style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: '1.3' }}>
                                    {strat.description}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const spinCount = document.getElementById('autoSpinCount').value
                                    onApply(key, parseInt(spinCount) || 0)
                                    onClose()
                                }}
                                style={{
                                    background: '#d4af37', color: '#000', border: 'none',
                                    padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold',
                                    cursor: 'pointer', whiteSpace: 'nowrap'
                                }}
                            >
                                APLICAR
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center', color: '#555', fontSize: '0.8rem' }}>
                    Nota: Las estrategias aplican fichas según el valor de ficha seleccionado.
                </div>
            </div>
        </div>
    )
}
