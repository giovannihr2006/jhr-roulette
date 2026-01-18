import React from 'react'

export const CompactBanking = ({
    balance,
    maxBalance,
    bestPayout,
    currentRoundBet,
    formatBalance,
    formatValue,
    setShowReloadModal,
    setShowResetModal,
    setShowWithdrawModal,
    setShowProjectionsModal,
    isNewRecord
}) => {

    // Derived values for Difference Record
    const potentialTotal = balance - currentRoundBet + bestPayout.amount
    const diffRecord = potentialTotal - maxBalance
    const isRecordBreaking = diffRecord > 0

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row', // Horizontal
            alignItems: 'center',
            gap: '15px',
            background: 'rgba(10, 10, 10, 0.95)',
            padding: '10px 20px',
            borderRadius: '12px',
            border: '1px solid #444',
            boxShadow: '0 5px 20px rgba(0,0,0,0.8)',
            minWidth: '700px', // Wide but short
            backdropFilter: 'blur(5px)'
        }}>
            {/* 1. CONTROLS (Mini) */}
            <div style={{ display: 'flex', gap: '5px', borderRight: '1px solid #333', paddingRight: '15px' }}>
                <button onClick={(e) => { e.stopPropagation(); setShowReloadModal(true) }}
                    title="Recargar" style={btnStyle('#2e7d32', '#fff')}>💲</button>
                <button onClick={(e) => { e.stopPropagation(); setShowResetModal(true) }}
                    title="Reiniciar" style={btnStyle('#3e1a1a', '#ff4444')}>⚠</button>
                <button onClick={() => setShowWithdrawModal(true)}
                    title="Retirar" style={btnStyle('#333', '#aaa')}>⬇</button>
                <button onClick={() => setShowProjectionsModal(true)}
                    title="Proyecciones" style={btnStyle('#d4af37', '#000')}>📈</button>
            </div>

            {/* 2. REAL BALANCE (Main) */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
                <span style={labelStyle}>SALDO ACTUAL</span>
                <span style={{ fontSize: '1.4rem', color: '#ffd700', fontFamily: 'Roboto Mono', fontWeight: 'bold' }}>
                    {formatBalance(balance)}
                </span>
            </div>

            {/* 3. MAX BALANCE */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px', borderLeft: '1px solid #333', paddingLeft: '15px' }}>
                <span style={labelStyle}>RÉCORD</span>
                <span style={{
                    fontSize: '1.2rem', color: isNewRecord ? '#fff' : '#d4af37',
                    fontFamily: 'Roboto Mono', opacity: 0.8,
                    textShadow: isNewRecord ? '0 0 10px gold' : 'none'
                }}>
                    {formatBalance(maxBalance)}
                </span>
            </div>

            {/* 4. POTENTIAL WIN (Dynamic) */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px', borderLeft: '1px solid #333', paddingLeft: '15px' }}>
                <span style={labelStyle}>MEJOR PAGO</span>
                <span style={{ fontSize: '1.2rem', color: bestPayout.amount > 0 ? '#ffcc00' : '#444', fontFamily: 'Roboto Mono' }}>
                    {bestPayout.amount > 0 ? formatValue(bestPayout.amount) : '-'}
                </span>
            </div>

            {/* 5. DIFFERENCE RECORD (The Most Important Metric) */}
            {bestPayout.amount > 0 && (
                <div style={{
                    display: 'flex', flexDirection: 'column', minWidth: '140px',
                    borderLeft: '1px solid #333', paddingLeft: '15px',
                    background: isRecordBreaking ? 'rgba(67, 160, 71, 0.2)' : 'rgba(229, 57, 53, 0.1)',
                    borderRadius: '4px', padding: '5px'
                }}>
                    <span style={{ ...labelStyle, color: isRecordBreaking ? '#4caf50' : '#e53935' }}>DIF. RECORD (DR)</span>
                    <span style={{
                        fontSize: '1.3rem',
                        color: isRecordBreaking ? '#4caf50' : '#e53935',
                        fontFamily: 'Roboto Mono', fontWeight: 'bold'
                    }}>
                        {diffRecord > 0 ? '+' + formatBalance(diffRecord) : formatBalance(diffRecord)}
                    </span>
                    {/* DOBLA APUESTA TIP */}
                    {!isRecordBreaking && (
                        <div style={{ fontSize: '0.6rem', color: '#aaa', marginTop: '2px' }}>
                            DOBLA APUESTA ⤴
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}

// STYLES
const labelStyle = { fontSize: '0.7rem', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }

const btnStyle = (bg, color) => ({
    background: bg, color: color, border: 'none', borderRadius: '4px',
    width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '1rem'
})
