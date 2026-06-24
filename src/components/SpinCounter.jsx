import React from 'react'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { ForensicBadge } from './ForensicBadge'

const SpinCounter = ({ onShowTutorial }) => {
    const totalSpins = useFinancialStore(state => state.totalSpins) || 0

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
            border: '2px solid #d4af37',
            borderTop: '2px solid #fecb00',
            borderBottom: '2px solid #8a6e20',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.2)',
            color: '#e0e0e0',
            fontFamily: 'monospace',
            textAlign: 'center',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexWrap: 'wrap', // Responsive wrapping
            flexDirection: 'row', // Default to row to allow side-by-side
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center', // Center when wrapped
            gap: '5px 15px', // Gap between label and value
            padding: '10px 15px',
            position: 'relative',
            zIndex: 10,
            overflow: 'hidden',
            boxSizing: 'border-box' // Fix sizing
        }}>
            <button
                onClick={(e) => { e.stopPropagation(); onShowTutorial(); }}
                title="Ver Justificación Forense (E15)"
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 20
                }}
            >
                ⚖
            </button>
            <div style={{
                fontSize: '0.85rem',
                color: '#d4af37',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <ForensicBadge id="spinCounter" />
                JUGADAS
            </div>
            <div style={{
                fontSize: '1.6rem', // Clearer
                fontWeight: 'bold',
                color: '#fff',
                textShadow: '0 0 5px rgba(255,255,255,0.3)',
                lineHeight: '1'
            }}>
                {totalSpins}
            </div>
        </div >
    )
}

export default SpinCounter
