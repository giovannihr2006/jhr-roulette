import React from 'react'

export const DetailedHistoryWidget = ({ onClick }) => {
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
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                padding: '10px'
            }}
        >
            <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>📜</div>
            <div style={{
                fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase',
                textAlign: 'center', lineHeight: '1.2'
            }}>
                VER HISTORIAL<br />DETALLADO
            </div>
        </div>
    )
}
