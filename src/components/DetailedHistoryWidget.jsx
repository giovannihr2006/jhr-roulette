import React from 'react'
import { ForensicBadge } from './ForensicBadge'

export const DetailedHistoryWidget = ({ onClick, onShowTutorial }) => {
    return (
        <div
            onClick={onClick}
            style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
                border: '2px solid #d4af37',
                borderTop: '2px solid #fecb00',
                borderBottom: '2px solid #8a6e20',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 15px rgba(212, 175, 55, 0.2)',
                color: '#e0e0e0',
                fontFamily: 'Roboto, sans-serif',
                width: '100%', height: '100%',
                boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                padding: '10px',
                position: 'relative'
            }}
        >
            <button
                onClick={(e) => { e.stopPropagation(); onShowTutorial(); }}
                title="Ver Justificación Forense (E21)"
                style={{
                    position: 'absolute',
                    top: '5px', right: '5px',
                    width: '18px', height: '18px',
                    borderRadius: '50%',
                    border: '1px solid #d4af37',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#d4af37',
                    fontSize: '0.6rem',
                    cursor: 'help',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                ⚖
            </button>
            <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>📜</div>
            <div style={{
                fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                textAlign: 'center', lineHeight: '1.2',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
            }}>
                <ForensicBadge id="detailedHistory" />
                HISTORIAL DETALLADO
            </div>
        </div>
    )
}
