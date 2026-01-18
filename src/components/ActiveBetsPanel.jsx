import React, { useState, useMemo } from 'react'
import { CHIP_RATES } from '../config/GameLimits'
import { calculateWinnings } from '../logic/RouletteUtils'

export const ActiveBetsPanel = ({ currentBets = {}, onClose, viewCurrency = 'USD' }) => {
    const [sortField, setSortField] = useState('amount') // 'amount' | 'potential'
    const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'

    // NEW: Toggle between views or just show all? 
    // User asked "in addition to", implying a unified view or appended list.
    // I will append it with a separator.

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

    // NEW: Calculate Number Breakdown
    const numberBreakdown = useMemo(() => {
        if (Object.keys(currentBets).length === 0) return []
        const data = []

        // Check all 37 numbers
        for (let i = 0; i <= 36; i++) {
            const potentialWin = calculateWinnings(i, currentBets)
            if (potentialWin > 0) {
                data.push({
                    key: `NUM_COVER_${i}`,
                    label: `Si sale el ${i}`,
                    amount: 0, // No direct bet amount to show here, it's a result
                    potential: potentialWin,
                    type: 'coverage'
                })
            }
        }
        return data
    }, [currentBets])

    const sortedBets = useMemo(() => {
        const directBets = [...processedBets].sort((a, b) => {
            const valA = a[sortField]
            const valB = b[sortField]
            if (sortDir === 'asc') return valA - valB
            return valB - valA
        })

        const coverageBets = [...numberBreakdown].sort((a, b) => {
            // For coverage, usually we just want to sort by payout (potential)
            // But if user selected 'amount', coverage has 0 amount.
            if (sortField === 'amount') return 0 // Keep natural order?
            const valA = a.potential
            const valB = b.potential
            if (sortDir === 'asc') return valA - valB
            return valB - valA
        })

        return { directBets, coverageBets }
    }, [processedBets, numberBreakdown, sortField, sortDir])

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

    // if (Object.keys(currentBets).length === 0) return null

    return (
        <div className="active-bets-panel" style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
            border: '2px solid #d4af37',
            borderTop: '2px solid #fecb00',
            borderBottom: '2px solid #8a6e20',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.2)',
            color: '#e0e0e0',
            fontFamily: 'Roboto, sans-serif',
            width: '300px',
            maxHeight: '400px', // Smaller unified height
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
        }}>
            {/* HEADER */}
            <div style={{
                background: 'linear-gradient(to bottom, #2a2a2a, #151515)',
                borderBottom: '1px solid #443a22',
                padding: '8px 12px',
                borderRadius: '6px 6px 0 0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                color: '#d4af37', fontFamily: 'Cinzel, serif', fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
            }}>
                <span>Resumen de Apuestas</span>
                <button onClick={onClose} style={{
                    background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px', lineHeight: '1'
                }}>×</button>
            </div>

            {/* TABLE HEADER */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '8px', fontSize: '0.75rem', color: '#aaa', fontWeight: 'bold', borderBottom: '1px solid #333', background: '#111' }}>
                <div>APUESTA</div>
                <div onClick={() => handleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right', color: sortField === 'amount' ? '#ffd700' : '#aaa' }}>
                    MONTO {sortField === 'amount' && (sortDir === 'asc' ? '↑' : '↓')}
                </div>
                <div onClick={() => handleSort('potential')} style={{ cursor: 'pointer', textAlign: 'right', color: sortField === 'potential' ? '#4caf50' : '#aaa' }}>
                    PAGO {sortField === 'potential' && (sortDir === 'asc' ? '↑' : '↓')}
                </div>
            </div>

            {/* SCROLLABLE LIST */}
            <div style={{ overflowY: 'auto', flex: 1 }}>

                {/* DIRECT BETS */}
                {sortedBets.directBets.map((bet) => (
                    <div key={bet.key} style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                        padding: '6px 8px', fontSize: '0.8rem', borderBottom: '1px solid #222',
                        color: '#eee', alignItems: 'center'
                    }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500', color: '#fff' }}>{bet.label}</div>
                        <div style={{ textAlign: 'right', color: '#ffd700', fontWeight: 'bold' }}>{formatMoney(bet.amount)}</div>
                        <div style={{ textAlign: 'right', color: '#4caf50', fontWeight: 'bold' }}>{formatMoney(bet.potential)}</div>
                    </div>
                ))}

                {/* SEPARATOR */}
                {sortedBets.coverageBets.length > 0 && (
                    <div style={{
                        marginTop: '10px', marginBottom: '5px',
                        borderBottom: '1px solid #443a22',
                        color: '#aaa', fontSize: '0.7rem', padding: '2px 8px', background: '#1a1a1a', fontStyle: 'italic'
                    }}>
                        DESGLOSE POR NÚMERO
                    </div>
                )}

                {/* COVERAGE BETS */}
                {sortedBets.coverageBets.map((bet) => (
                    <div key={bet.key} style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                        padding: '4px 8px', fontSize: '0.75rem', borderBottom: '1px solid #1a1a1a',
                        color: '#aad', alignItems: 'center'
                    }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bet.label}</div>
                        <div style={{ textAlign: 'right', color: '#444' }}>-</div>
                        <div style={{ textAlign: 'right', color: '#00ced1' }}>{formatMoney(bet.potential)}</div>
                    </div>
                ))}

            </div>

            {/* FOOTER TOTAL */}
            <div style={{
                borderTop: '1px solid #443a22',
                padding: '10px',
                background: '#151515',
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.9rem', fontWeight: 'bold',
                borderRadius: '0 0 6px 6px'
            }}>
                <span style={{ color: '#aaa' }}>TOTAL:</span>
                <span style={{ color: '#ffd700' }}>
                    {formatMoney(processedBets.reduce((sum, b) => sum + b.amount, 0))}
                </span>
            </div>
        </div>
    )
}
