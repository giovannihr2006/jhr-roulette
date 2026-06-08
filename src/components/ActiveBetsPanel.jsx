import React, { useState, useMemo } from 'react'
import { CHIP_RATES } from '../config/GameLimits'
import { calculateWinnings, getCoveredNumbers } from '../logic/RouletteUtils'
import { ForensicBadge } from './ForensicBadge'

export const ActiveBetsPanel = ({ currentBets = {}, onClose, onHoverNumbers, onShowTutorial, viewCurrency = 'USD' }) => {
    const [sortField, setSortField] = useState('amount') // 'amount' | 'potential'
    const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'

    // Helper: Calculate Potential Payout Multiplier based on Bet Key
    const getMultiplier = (key) => {
        // Numbers 0-36
        if (!isNaN(parseInt(key)) && parseInt(key) >= 0 && parseInt(key) <= 36) return 36

        // Dozens / Columns: 3x
        if (key.startsWith('DOZ') || key.startsWith('COL')) return 3

        // Simple Chances: 2x
        if (['RED', 'BLACK', 'EVEN', 'ODD', 'LOW', 'HIGH'].includes(key)) return 2

        // Complex Bets
        if (key.includes('SPLIT')) return 18
        if (key.includes('STREET') || key.includes('TRIO')) return 12
        if (key.includes('CORNER') || key.includes('BASKET')) return 9
        if (key.includes('LINE')) return 6

        return 0
    }

    const processedBets = useMemo(() => {
        return Object.entries(currentBets).map(([key, amount]) => {
            const multiplier = getMultiplier(key)
            const potential = amount * multiplier

            // Format Label
            let label = key
            if (!isNaN(parseInt(key))) label = `Apostado: ${key}`
            else if (key === 'DOZ1') label = '1ra Docena'
            else if (key === 'DOZ2') label = '2da Docena'
            else if (key === 'DOZ3') label = '3ra Docena'
            else if (key === 'COL1') label = 'Columna 1'
            else if (key === 'COL2') label = 'Columna 2'
            else if (key === 'COL3') label = 'Columna 3'
            else if (key === 'RED') label = 'Rojo'
            else if (key === 'BLACK') label = 'Negro'
            else if (key === 'EVEN') label = 'Par'
            else if (key === 'ODD') label = 'Impar'
            else if (key === 'LOW') label = 'Bajos (1-18)'
            else if (key === 'HIGH') label = 'Altos (19-36)'
            else if (key === 'ZERO') label = 'Cero (0)'
            else if (key.includes('SPLIT')) label = `Split ${key.replace('SPLIT_', '')}`
            else if (key.includes('STREET')) label = `Calle ${key.replace('STREET_', '')}`
            else if (key.includes('CORNER')) label = `Cuadro ${key.replace('CORNER_', '')}`
            else if (key.includes('LINE')) label = `Linea ${key.replace('LINE_', '')}`

            return {
                key,
                label,
                amount,
                potential,
                type: 'bet'
            }
        })
    }, [currentBets])

    const sortedBets = useMemo(() => {
        return [...processedBets].sort((a, b) => {
            const valA = a[sortField]
            const valB = b[sortField]
            if (sortDir === 'asc') return valA - valB
            return valB - valA
        })
    }, [processedBets, sortField, sortDir])

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('desc')
        }
    }

    const formatMoney = (val) => {
        if (viewCurrency === 'COL') {
            const realVal = val * (CHIP_RATES.COL || 100)
            return '$' + realVal.toLocaleString()
        }
        return '$' + val.toLocaleString()
    }

    return (
        <div className="active-bets-panel" style={{
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(15px)',
            border: '2px solid #555',
            borderRadius: '12px',
            padding: '20px',
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
            zIndex: 1000,
            gap: '10px'
        }}
            onMouseLeave={() => onHoverNumbers && onHoverNumbers([])}
        >
            {/* HEADER GOLD STANDARD */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap', // Responsive Header
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
                borderBottom: '1px solid #444',
                paddingBottom: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ForensicBadge id="activeBets" />
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>
                        RESUMEN DE APUESTAS
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onShowTutorial && onShowTutorial(); }}
                        style={{
                            background: 'transparent', border: 'none', color: '#666',
                            fontSize: '1.2rem', cursor: 'pointer', transition: 'color 0.2s', padding: '0 5px'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ffd700'}
                        onMouseLeave={e => e.currentTarget.style.color = '#666'}
                        title="Ver Tutorial Forense (E8)"
                    >
                        ⚖
                    </button>
                </div>
                <button onClick={onClose} style={{
                    background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.8rem', padding: '0 5px'
                }}>×</button>
            </div>

            {/* TABLE HEADER - RESPONSIVE */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px 10px',
                padding: '10px',
                fontSize: '0.8rem',
                color: '#aaa',
                fontWeight: 'bold',
                borderBottom: '1px solid #333',
                justifyContent: 'center'
            }}>
                <div style={{ flex: '1 1 120px' }}>APUESTA</div>
                <div onClick={() => handleSort('amount')} style={{ flex: '1 1 60px', cursor: 'pointer', textAlign: 'center', color: sortField === 'amount' ? '#ffd700' : '#aaa' }}>
                    MONTO {sortField === 'amount' && (sortDir === 'asc' ? '↑' : '↓')}
                </div>
                <div onClick={() => handleSort('potential')} style={{ flex: '1 1 60px', cursor: 'pointer', textAlign: 'center', color: sortField === 'potential' ? '#4caf50' : '#aaa' }}>
                    PAGO {sortField === 'potential' && (sortDir === 'asc' ? '↑' : '↓')}
                </div>
            </div>

            {/* SCROLLABLE LIST */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                {sortedBets.length === 0 ? (
                    <div style={{
                        padding: '40px 20px', textAlign: 'center', color: '#666',
                        fontSize: '1.2rem', fontStyle: 'italic', border: '1px dashed #333',
                        borderRadius: '8px', marginTop: '20px'
                    }}>
                        No hay apuestas activas
                    </div>
                ) : (
                    <>
                        {/* DIRECT BETS */}
                        {sortedBets.map((bet) => (
                            <div
                                key={bet.key}
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap', // Responsive Row
                                    gap: '8px 10px',
                                    padding: '12px 10px',
                                    fontSize: '1.0rem',
                                    borderBottom: '1px solid #222',
                                    color: '#eee',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'default',
                                    transition: 'background 0.2s',
                                    background: 'rgba(255,255,255,0.02)'
                                }}
                                onMouseEnter={() => {
                                    if (onHoverNumbers) {
                                        onHoverNumbers(getCoveredNumbers({ [bet.key]: bet.amount }))
                                    }
                                }}
                                onMouseLeave={() => {
                                    if (onHoverNumbers) onHoverNumbers([])
                                }}
                            >
                                <div style={{ flex: '1 1 120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold', color: '#d4af37' }}>{bet.label}</div>
                                <div style={{ flex: '1 1 70px', textAlign: 'center', color: '#fff', fontWeight: 'bold', background: 'rgba(255,215,0,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{formatMoney(bet.amount)}</div>
                                <div style={{ flex: '1 1 70px', textAlign: 'center', color: '#4caf50', fontWeight: 'bold', background: 'rgba(76,175,80,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{formatMoney(bet.potential)}</div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* FOOTER TOTAL */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '15px',
                borderTop: '2px solid #444',
                display: 'flex',
                flexWrap: 'wrap', // Responsive Footer
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1.2rem',
                fontWeight: 'bold'
            }}>
                <span style={{ color: '#aaa' }}>TOTAL:</span>
                <span style={{ color: '#ffd700', fontSize: '1.4rem', textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
                    {formatMoney(processedBets.reduce((sum, b) => sum + b.amount, 0))}
                </span>
            </div>
        </div>
    )
}
