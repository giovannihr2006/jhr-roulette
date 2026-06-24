import React, { useState, useEffect } from 'react'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { calculateWinnings } from '../logic/RouletteUtils'
import './CasinoTable.css'

const ProjectionsPanel = ({ viewCurrency = 'COL', currentBets = {} }) => {
    const sessionStart = useFinancialStore(state => state.sessionStart)
    const initialCapital = useFinancialStore(state => state.initialCapital) || 0
    const balance = useFinancialStore(state => state.balance)
    const peakCapital = useFinancialStore(state => state.peakCapital) || 0


    // Currency Exchange Rates (Base: 1 Logic Unit = 1 USD)
    const RATES = {
        COL: 100,
        USA: 0.0266666, // Real USD Conversion
        EUR: 0.0245333  // Real EUR Conversion
    }

    // --- MONTE CARLO SIMULATION ---
    const [simStats, setSimStats] = useState(null)
    const [isSimulating, setIsSimulating] = useState(false)

    // --- WORK HOURS STATE ---
    const [workHours, setWorkHours] = useState(8)

    // Local ticker to update time
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(interval)
    }, [])

    // Reset stats when bets change
    useEffect(() => {
        setSimStats(null)
    }, [currentBets])

    const runSimulation = () => {
        if (!currentBets || Object.keys(currentBets).length === 0) return

        setIsSimulating(true)
        // Set timeout to allow UI to show loading state
        setTimeout(() => {
            let totalProfit = 0
            let wins = 0
            const iterations = 1000

            for (let i = 0; i < iterations; i++) {
                const winningNumber = Math.floor(Math.random() * 37)
                const winnings = calculateWinnings(winningNumber, currentBets)
                const betCost = Object.values(currentBets).reduce((a, b) => a + b, 0)

                if (winnings > 0) wins++
                totalProfit += (winnings - betCost)
            }

            setSimStats({
                ev: totalProfit / iterations,
                winRate: (wins / iterations) * 100
            })
            setIsSimulating(false)
        }, 100)
    }

    // Safety check - MUST BE AFTER HOOKS
    // Safety check - MUST BE AFTER HOOKS
    // if (initialCapital === 0 && balance === 0) return null // REMOVED: User wants to see it always

    // STRICT FORMULA COPY FROM BANKING HUD
    // Profit = Record - Initial
    const profit = peakCapital - initialCapital

    // Time calculation
    const durationMs = now - sessionStart
    const durationMins = Math.max(0.1, durationMs / 60000)

    const profitPerMin = profit / durationMins
    const profitPerHour = profitPerMin * 60
    const profitPerDay = profitPerHour * workHours // User customized hours
    const profitPerMonth = profitPerDay * 30 // User asked for "Month of 30 Days"
    const profitPerYear = profitPerDay * 360 // User asked for "Year of 360 Days"

    // REVISING FORMATTER TO MATCH CASINO TABLE EXACTLY
    const formatValueExact = (creditValue) => {
        const val = creditValue * (RATES[viewCurrency] || 1)
        if (viewCurrency === 'COL') return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
        if (viewCurrency === 'USA') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
        if (viewCurrency === 'EUR') return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
        return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    }

    const items = [
        { label: 'Minuto', val: profitPerMin },
        { label: 'Hora', val: profitPerHour },
        { label: `Día (${workHours}h)`, val: profitPerDay },
        { label: 'Mes (30d)', val: profitPerMonth },
        { label: 'Año (360d)', val: profitPerYear },
    ]

    return (
        <div style={{
            width: '320px',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
            border: '2px solid #d4af37',
            borderTop: '2px solid #fecb00',
            borderBottom: '2px solid #8a6e20',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.2)',
            color: '#e0e0e0',
            fontFamily: 'Roboto, sans-serif',
            position: 'relative',
            zIndex: 10,
            padding: '0'
        }}>
            <style>{`
                @keyframes pulse-blue {
                    0% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(0, 229, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0); }
                }
                @keyframes pulse-gold {
                    0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); transform: scale(1); }
                    50% { transform: scale(1.02); }
                    70% { box-shadow: 0 0 0 15px rgba(255, 215, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); transform: scale(1); }
                }
            `}</style>
            <div style={{
                background: 'linear-gradient(to bottom, #2a2a2a, #151515)',
                borderBottom: '1px solid #443a22',
                padding: '8px 12px',
                borderRadius: '6px 6px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                color: '#d4af37', fontFamily: 'Cinzel, serif', fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>Proyecciones</span>
                </div>
                {/* Simulation Button */}
                {currentBets && Object.keys(currentBets).length > 0 && (
                    <button
                        onClick={runSimulation}
                        disabled={isSimulating}
                        style={{
                            background: isSimulating ? '#444' : '#222',
                            border: '1px solid #d4af37',
                            color: '#d4af37',
                            fontSize: '0.65rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                    >
                        {isSimulating ? '...' : 'Simular 1k'}
                    </button>
                )}
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px' }}>

                {/* MONTE CARLO RESULTS */}
                {simStats && (
                    <div style={{
                        marginBottom: '15px', padding: '10px', background: 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '5px', border: '1px solid #d4af37'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#d4af37', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            Análisis Monte Carlo (1000 giros)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#aaa' }}>Retorno Esp. (EV)</div>
                                <div style={{
                                    color: simStats.ev >= 0 ? '#4f4' : '#f44',
                                    fontWeight: 'bold', fontFamily: 'monospace'
                                }}>
                                    {formatValueExact(simStats.ev)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#aaa' }}>Probabilidad</div>
                                <div style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                    {simStats.winRate.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EXISTING PROJECTIONS HEADER */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.2fr 1fr',
                    gap: '10px',
                    paddingBottom: '10px',
                    borderBottom: '2px solid #555',
                    marginBottom: '5px',
                    fontSize: '0.75rem',
                    color: '#888',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    <div>Tiempo</div>
                    <div style={{ textAlign: 'right' }}>Ganancia</div>
                    <div style={{ textAlign: 'right' }}>Interés</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map((item) => {
                        // Calculate Interest % relative to Initial Capital
                        const interest = initialCapital > 0 ? (item.val / initialCapital) * 100 : 0
                        const isDayRow = item.label.includes('Día')
                        const isHourRow = item.label === 'Hora'
                        const isMonthRow = item.label.includes('Mes')

                        // DYNAMIC STYLING
                        let bg = 'transparent'
                        let border = 'none'
                        let shadow = 'none'
                        let anim = 'none'
                        let radius = '0'
                        let fontColor = '#aaa'
                        let valueColor = item.val > 0 ? '#4f4' : (item.val < 0 ? '#f44' : '#888')
                        let fontWeight = 'normal'
                        let fontSize = '0.95rem'
                        let textShadow = 'none'

                        if (isHourRow) {
                            bg = 'rgba(0, 229, 255, 0.15)'
                            border = '1px solid #00e5ff'
                            shadow = '0 0 10px rgba(0, 229, 255, 0.3)'
                            anim = 'pulse-blue 1s infinite'
                            radius = '6px'
                            fontColor = '#fff'
                            valueColor = '#fff'
                            fontWeight = 'bold'
                            fontSize = '1.2rem'
                            textShadow = '0 0 8px #fff'
                        }

                        if (isMonthRow) {
                            bg = 'rgba(255, 215, 0, 0.15)' // Gold tint
                            border = '1px solid #ffd700'
                            shadow = '0 0 15px rgba(255, 215, 0, 0.4)'
                            anim = 'pulse-gold 1.5s infinite' // Slower, heavier pulse
                            radius = '8px'
                            fontColor = '#ffd700'
                            valueColor = '#ffd700'
                            fontWeight = 'bold'
                            fontSize = '1.3rem' // Even bigger
                            textShadow = '0 0 10px #ffd700'
                        }

                        return (
                            <div key={item.label} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1.2fr 1fr', // Match header
                                gap: '10px',
                                padding: '12px 0',
                                borderBottom: '1px solid #333',
                                alignItems: 'center',
                                background: bg,
                                boxShadow: shadow,
                                border: border,
                                animation: anim,
                                borderRadius: radius,
                                marginTop: (isHourRow || isMonthRow) ? '5px' : '0',
                                marginBottom: (isHourRow || isMonthRow) ? '5px' : '0'
                            }}>
                                <div style={{
                                    color: fontColor,
                                    fontSize: isHourRow ? '1rem' : '0.85rem',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    fontWeight: fontWeight,
                                    textShadow: isHourRow ? '0 0 5px #00e5ff' : (isMonthRow ? '0 0 5px #ffd700' : 'none')
                                }}>
                                    {isDayRow ? (
                                        <>
                                            <span>Día</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="24"
                                                value={workHours}
                                                onChange={(e) => setWorkHours(Number(e.target.value))}
                                                style={{
                                                    width: '35px',
                                                    background: '#222',
                                                    border: '1px solid #555',
                                                    color: '#fff',
                                                    fontSize: '0.8rem',
                                                    padding: '1px',
                                                    textAlign: 'center',
                                                    borderRadius: '3px'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span style={{ fontSize: '0.7rem' }}>h</span>
                                        </>
                                    ) : item.label}
                                </div>
                                <div style={{
                                    color: valueColor,
                                    fontWeight: 'bold',
                                    textAlign: 'right',
                                    fontFamily: 'monospace',
                                    fontSize: fontSize,
                                    textShadow: textShadow
                                }}>
                                    {formatValueExact(item.val)}
                                </div>
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: (isHourRow || isMonthRow) ? fontColor : (interest >= 0 ? '#4f4' : '#f44'),
                                    fontFamily: 'Roboto Mono, monospace',
                                    textAlign: 'right',
                                    fontWeight: fontWeight
                                }}>
                                    {(isDayRow || isMonthRow || item.label.includes('Año'))
                                        ? `${Math.round(Math.abs(interest))}%`
                                        : `${Math.abs(interest).toFixed(2)}%`
                                    }
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div style={{
                    marginTop: '10px',
                    fontSize: '0.7rem',
                    color: '#555',
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                    (Récord - Inicial) / Tiempo
                </div>
            </div>
        </div>
    )

}

export default ProjectionsPanel
