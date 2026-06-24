import React from 'react'

const DebugCurrentBets = ({ currentBets }) => {
    // Only show if there are bets or for debug purposes
    const betIds = Object.keys(currentBets)
    if (betIds.length === 0) return null

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid #0f0',
            color: '#0f0',
            fontFamily: 'monospace',
            padding: '10px',
            zIndex: 99999,
            maxWidth: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            fontSize: '12px',
            pointerEvents: 'none' // Don't block clicks
        }}>
            <h3 style={{ margin: '0 0 5px', borderBottom: '1px solid #0f0' }}>MONITOR DE VERDAD</h3>
            <div>Total Apuestas: {betIds.length}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {betIds.map(id => (
                    <li key={id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{id}:</span>
                        <span>{currentBets[id]}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default DebugCurrentBets
