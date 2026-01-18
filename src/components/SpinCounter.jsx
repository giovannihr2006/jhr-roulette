import React from 'react'
import { useFinancialStore } from '../logic/FinancialSimulator'

const SpinCounter = () => {
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
            minWidth: '120px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '10px 15px',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{
                fontSize: '0.7rem',
                color: '#d4af37',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '2px'
            }}>
                JUGADAS
            </div>
            <div style={{
                fontSize: '1.4rem',
                fontWeight: 'bold',
                color: '#fff',
                textShadow: '0 0 5px rgba(255,255,255,0.3)'
            }}>
                {totalSpins}
            </div>
        </div>
    )
}

export default SpinCounter
