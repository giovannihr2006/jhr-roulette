import React from 'react'

export const VerticalBanking = ({
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

    // Derived values
    const potentialTotal = balance - currentRoundBet + bestPayout.amount
    const diffRecord = potentialTotal - maxBalance
    const isRecordBreaking = diffRecord > 0

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'rgba(10, 10, 10, 0.95)',
            padding: '20px',
            borderRadius: '16px',
            border: '2px solid #555',
            boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
            width: '240px', // Slimmer than original 320px
            backdropFilter: 'blur(5px)'
        }}>

            {/* HEADER: ACTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={(e) => { e.stopPropagation(); setShowReloadModal(true) }}
                    title="Recargar" style={btnStyle('#2e7d32', '#fff')}>💲 RECARGAR</button>
                <button onClick={(e) => { e.stopPropagation(); setShowResetModal(true) }}
                    title="Reiniciar" style={btnStyle('#3e1a1a', '#ff4444')}>⚠ REINICIAR</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '-5px' }}>
                <button onClick={() => setShowWithdrawModal(true)}
                    title="Retirar" style={btnStyle('#333', '#aaa')}>⬇ RETIRAR</button>
                <button onClick={() => setShowProjectionsModal(true)}
                    title="Proyecciones" style={btnStyle('#d4af37', '#000')}>📈 PROY</button>
            </div>

            <div style={{ height: '1px', background: '#333', margin: '5px 0' }}></div>

            {/* BALANCE (HERO) */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>SALDO ACTUAL</span>
                <span style={{ fontSize: '1.8rem', color: '#ffd700', fontFamily: 'Roboto Mono', fontWeight: 'bold', textAlign: 'right', letterSpacing: '-1px' }}>
                    {formatBalance(balance)}
                </span>
            </div>

            {/* MAX (RECORD) */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>RÉCORD HISTÓRICO</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px' }}>
                    {isNewRecord && <span style={{ fontSize: '1rem' }}>🏆</span>}
                    <span style={{
                        fontSize: '1.2rem', color: isNewRecord ? '#fff' : '#d4af37',
                        fontFamily: 'Roboto Mono', opacity: 0.8,
                        textShadow: isNewRecord ? '0 0 10px gold' : 'none'
                    }}>
                        {formatBalance(maxBalance)}
                    </span>
                </div>
            </div>

            <div style={{ height: '1px', background: '#333', margin: '5px 0' }}></div>

            {/* POTENTIAL WIN */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>MEJOR PAGO</span>
                <span style={{ fontSize: '1.2rem', color: bestPayout.amount > 0 ? '#ffcc00' : '#444', fontFamily: 'Roboto Mono', textAlign: 'right' }}>
                    {bestPayout.amount > 0 ? formatValue(bestPayout.amount) : '-'}
                </span>
            </div>

            {/* DIFFERENCE RECORD (DR) */}
            {bestPayout.amount > 0 && (
                <div style={{
                    display: 'flex', flexDirection: 'column',
                    background: isRecordBreaking ? 'rgba(67, 160, 71, 0.2)' : 'rgba(229, 57, 53, 0.1)',
                    borderRadius: '8px', padding: '10px',
                    marginTop: '5px',
                    border: isRecordBreaking ? '1px solid #2e7d32' : '1px solid #c62828'
                }}>
                    <span style={{ ...labelStyle, color: isRecordBreaking ? '#4caf50' : '#e53935' }}>DIFERENCIA RECORD (DR)</span>
                    <span style={{
                        fontSize: '1.5rem',
                        color: isRecordBreaking ? '#4caf50' : '#e53935',
                        fontFamily: 'Roboto Mono', fontWeight: 'bold',
                        textAlign: 'right'
                    }}>
                        {diffRecord > 0 ? '+' + formatBalance(diffRecord) : formatBalance(diffRecord)}
                    </span>
                    {/* DOBLA APUESTA TIP */}
                    {!isRecordBreaking && (
                        <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '5px', textAlign: 'right', fontStyle: 'italic' }}>
                            DOBLA APUESTA ⤴
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}

// STYLES
const labelStyle = { fontSize: '0.7rem', color: '#666', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }

const btnStyle = (bg, color) => ({
    background: bg, color: color, border: 'none', borderRadius: '4px',
    padding: '8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '0.7rem', transition: 'filter 0.2s'
})
