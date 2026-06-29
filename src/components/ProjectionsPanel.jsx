import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { calculateWinnings } from '../logic/RouletteUtils'
import { ForensicBadge } from './ForensicBadge'
import { ProfitGraph } from './ProfitGraph'
import './CasinoTable.css'

// --- CONSTANTS & CONFIG ---
const RATES = { COL: 100, USA: 0.0266666, EUR: 0.0245333 }

const JUSTIFICATION_TEXT = `
ANALISIS CRITICO (ELEMENTO 9: PROYECCIONES INTELIGENTES):

1. LA FALACIA DEL RÉCORD (VANIDAD vs REALIDAD operativa):
   Proyectar ganancias basándose en el "Saldo Máximo Histórico" es un error de novato que ignora el "Drawdown" (caída) actual.
   • El Récord es una métrica de Vanidad.
   • El Saldo Real es una métrica Operativa.
   Este panel fuerza la realidad al calcular proyecciones solo sobre el dinero que TIENES AHORA, no el que tuviste.

2. EL COSTO DEL TIEMPO MUERTO (EFICIENCIA REAL):
   Si pasas 3 horas frente a la mesa pero solo apuestas 15 minutos, tu "Promedio por Hora" real es desastroso.
   • La mayoría de calculadoras mienten porque no filtran el tiempo pasivo.
   • Este sistema usa 'Tiempo Activo' (Smart Time) para decirte cuánto ganas REALMENTE por cada minuto de trabajo efectivo.

3. TENDENCIA DINÁMICA (MOMENTUM vs PROMEDIO):
   El "Promedio Histórico" es lento y miente sobre el presente.
   • Puedes tener un promedio positivo histórico pero estar perdiendo dinero en la última hora.
   • La metrica "TENDENCIA (50)" analiza el Momentum de corto plazo. Si tu Tendencia es negativa aunque tu Promedio sea positivo, DETENTE. El mercado ha cambiado.

4. ESTRATEGIA DE USO TÁCTICO:
   No uses este panel para soñar con "cuánto ganaré en un año". Úsalo como un VELOCÍMETRO de eficiencia inmediata.
   Si tu "Proyección Hora" cae por debajo de tu objetivo, tu estrategia actual está perdiendo fuerza (Alpha Decay). Re-calibra o retírate.
`.trim();

// --- SUB-COMPONENT: Justification Modal (PORTAL) ---
const JustificationModal = ({ onClose }) => {
    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(5, 5, 5, 0.96)', // Almost solid black for focus
            zIndex: 2147483647,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(15px)'
        }} onClick={onClose}>
            <div style={{
                width: '95%', maxWidth: '1000px', // IMPACT SIZE: Much wider
                background: 'linear-gradient(145deg, #121212, #0a0a0a)',
                border: '1px solid #d4af37',
                borderRadius: '8px', // Sharper corners for forensic look
                padding: '50px', // More breathing room
                boxShadow: '0 0 150px rgba(212, 175, 55, 0.15)',
                display: 'flex', flexDirection: 'column', gap: '30px',
                animation: 'fadeIn 0.3s ease-out',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #333', paddingBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 10px gold)' }}>⚖</span>
                        <div>
                            <h2 style={{ margin: 0, color: '#d4af37', fontFamily: 'Cinzel, serif', fontSize: '2.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                Justificación Técnica
                            </h2>
                            <span style={{ color: '#aaa', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 'bold' }}>
                                Elemento 9: Auditoría de Proyecciones
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none', border: '1px solid #555', color: '#888',
                        width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                        fontSize: '1.2rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#888' }}
                    >✕</button>
                </div>

                {/* Body */}
                <div style={{
                    color: '#e0e0e0', fontSize: '1.15rem', lineHeight: '1.8',
                    whiteSpace: 'pre-line', fontFamily: 'Roboto, sans-serif', padding: '10px'
                }}>
                    {JUSTIFICATION_TEXT}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>,
        document.body // Target Container
    )
}

// --- MAIN COMPONENT ---
const ProjectionsPanel = ({ viewCurrency = 'COL', currentBets = {}, onExpand }) => {
    // Store Hooks
    const sessionStart = useFinancialStore(state => state.sessionStart)
    const initialCapital = useFinancialStore(state => state.initialCapital) || 0
    const balance = useFinancialStore(state => state.balance)
    const peakCapital = useFinancialStore(state => state.peakCapital) || 0
    const roundHistory = useFinancialStore(state => state.roundHistory) || []
    const totalIdleTime = useFinancialStore(state => state.totalIdleTime) || 0

    // Local State
    const [useRealBalance, setUseRealBalance] = useState(false) // Default to Historical (MÁXIMO)
    const [workHours, setWorkHours] = useState(8)
    const [now, setNow] = useState(() => Date.now())
    const [showJustification, setShowJustification] = useState(false)
    const [simStats, setSimStats] = useState(null)
    const [isSimulating, setIsSimulating] = useState(false)

    // Ticker
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(interval)
    }, [])

    // --- CALCULATIONS ---
    const rawDurationMs = now - sessionStart
    const activeDurationMs = Math.max(0, rawDurationMs - totalIdleTime) // Smart Time
    const activeMins = Math.max(roundHistory.length, activeDurationMs / 60000, 0.1) // Stabilized floor based on spins

    const currentProfit = balance - initialCapital
    const peakProfit = peakCapital - initialCapital
    const baseProfit = useRealBalance ? currentProfit : peakProfit

    const profitPerMin = baseProfit / activeMins
    const profitPerHour = profitPerMin * 60
    const profitPerDay = profitPerHour * workHours
    const profitPerWeek = profitPerDay * 7
    const profitPerMonth = profitPerDay * 30
    const profitPerYear = profitPerDay * 360

    // Trend (Last 50)
    const trendProfit = (() => {
        if (!roundHistory || roundHistory.length < 2) return 0;
        const recent = roundHistory.slice(0, 50);
        const latest = recent[0];
        const oldest = recent[recent.length - 1];
        return latest.balanceAfter - oldest.balanceAfter;
    })();
    const isTrendPositive = trendProfit > 0;

    // --- UTILS ---
    const formatValueExact = (creditValue, showDecimals = false) => {
        const val = creditValue * (RATES[viewCurrency] || 1)
        const digits = showDecimals ? 2 : 0
        if (viewCurrency === 'COL') return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
        return val.toLocaleString('en-US', { style: 'currency', currency: viewCurrency === 'USA' ? 'USD' : 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits })
    }

    const runSimulation = () => {
        if (!currentBets || Object.keys(currentBets).length === 0) return
        setIsSimulating(true)
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
            setSimStats({ ev: totalProfit / iterations, winRate: (wins / iterations) * 100 })
            setIsSimulating(false)
        }, 50)
    }

    const items = [
        { label: 'Minuto Activo', val: profitPerMin },
        { label: 'Hora', val: profitPerHour, isHighlight: true },
        { label: `Día (${workHours}h)`, val: profitPerDay },
        { label: 'Semana (7d)', val: profitPerWeek },
        { label: 'Mes (30d)', val: profitPerMonth, isGold: true },
        { label: 'Año (360d)', val: profitPerYear },
    ]

    return (
        <div style={{
            width: '100%', height: '100%', overflowY: 'auto',
            background: 'linear-gradient(135deg, #121212 0%, #050505 100%)',
            border: useRealBalance ? '2px solid #00bcd4' : '2px solid #d4af37',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(0,0,0,0.8)',
            color: '#e0e0e0', fontFamily: 'Roboto, sans-serif',
            display: 'flex', flexDirection: 'column'
        }}>

            {/* Header */}
            {/* Header */}
            <div style={{
                padding: '8px 10px', background: '#1a1a1a', borderBottom: '1px solid #333',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ForensicBadge id="graphLauncher" />
                            <span style={{ color: '#fff' }}>PROYECCIONES</span>
                        </span>
                        {/* FORENSIC ICON BUTTON */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                            title="Ver Justificación Forense"
                            style={{
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#666', fontSize: '1rem', transition: 'color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                            onMouseLeave={e => e.currentTarget.style.color = '#666'}
                        >
                            ⚖
                        </button>
                    </div>
                    <span style={{ fontSize: '0.6rem', color: useRealBalance ? '#00bcd4' : '#d4af37' }}>
                        {useRealBalance ? 'MODO: OPERATIVO (ACTUAL)' : 'MODO: HISTÓRICO (MÁXIMO)'}
                    </span>
                </div>

                {/* RIGHT SIDE CONTROLS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* EXPAND BUTTON (PROY) - VISUAL MATCH */}
                    {onExpand && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onExpand(); }}
                            title="Expandir Proyecciones (PROY)"
                            style={{
                                background: '#d4af37', color: '#000', border: 'none', borderRadius: '4px',
                                fontSize: '0.7rem', cursor: 'pointer', padding: '2px 8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', textTransform: 'uppercase', gap: '4px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            📈 PROY
                        </button>
                    )}

                    {/* SEGMENTED CONTROL SWITCH */}
                    <div style={{ display: 'flex', background: '#111', borderRadius: '12px', padding: '2px', border: '1px solid #333' }}>
                        <button
                            onClick={() => setUseRealBalance(true)}
                            style={{
                                background: useRealBalance ? '#00bcd4' : 'transparent',
                                color: useRealBalance ? '#000' : '#666',
                                borderRadius: '10px', border: 'none', padding: '4px 10px',
                                fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            ACTUAL
                        </button>
                        <button
                            onClick={() => setUseRealBalance(false)}
                            style={{
                                background: !useRealBalance ? '#d4af37' : 'transparent',
                                color: !useRealBalance ? '#000' : '#666',
                                borderRadius: '10px', border: 'none', padding: '4px 10px',
                                fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            MÁXIMO
                        </button>
                    </div>
                </div>
            </div>


            {/* Scrollable Content */}
            < div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>

                {/* Stats Bar */}
                < div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px' }}>
                    <div style={{ background: '#222', padding: '5px', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#888' }}>TIEMPO ACTIVO</div>
                        <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>
                            {activeMins < 60 ? `${activeMins.toFixed(1)}m` : `${(activeMins / 60).toFixed(1)}h`}
                        </div>
                    </div>
                    <div style={{ background: '#222', padding: '7px 5px', borderRadius: '4px', textAlign: 'center', border: isTrendPositive ? '1px solid #4f4' : '1px solid #f44' }}>
                        <div style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 'bold', letterSpacing: '0.2px' }}>TENDENCIA (50)</div>
                        <div style={{ fontSize: '1.15rem', color: isTrendPositive ? '#4f4' : '#f44', fontWeight: 'bold', lineHeight: 1.15 }}>
                            {trendProfit > 0 ? '+' : ''}{formatValueExact(trendProfit)}
                        </div>
                    </div>
                </div >

                {/* Main Table */}
                < div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px' }}>
                    {
                        items.map((item, idx) => (
                            <React.Fragment key={idx}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', padding: '6px',
                                    background: item.isGold ? 'rgba(255, 215, 0, 0.1)' : (item.isHighlight ? 'rgba(0, 188, 212, 0.1)' : 'transparent'),
                                    borderLeft: item.isGold ? '2px solid gold' : (item.isHighlight ? '2px solid cyan' : '1px solid #333')
                                }}>
                                    <span style={{ fontSize: '0.75rem', color: '#ccc' }}>
                                        {item.label === `Día (${workHours}h)` ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Día
                                                <input
                                                    type="number" value={workHours} onChange={e => setWorkHours(Number(e.target.value))}
                                                    style={{ width: '30px', background: '#333', border: 'none', color: '#fff', textAlign: 'center', fontSize: '0.7rem', borderRadius: '2px' }}
                                                />h
                                            </div>
                                        ) : item.label}
                                    </span>
                                </div>
                                <div style={{
                                    textAlign: 'right', padding: '6px',
                                    background: item.isGold ? 'rgba(255, 215, 0, 0.1)' : (item.isHighlight ? 'rgba(0, 188, 212, 0.1)' : 'transparent'),
                                    color: item.val > 0 ? (item.isHighlight ? '#00e5ff' : '#4f4') : '#f44',
                                    fontWeight: 'bold', fontFamily: 'monospace', fontSize: '0.95rem'
                                }}>
                                    {formatValueExact(item.val)}
                                </div>
                            </React.Fragment>
                        ))
                    }
                </div >

                {/* INLINE TENDENCIA FINANCIERA EN VIVO */}
                <div style={{
                    marginTop: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                        paddingBottom: '4px'
                    }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#ffd700', letterSpacing: '0.5px' }}>
                            TENDENCIA FINANCIERA EN VIVO
                        </span>
                        <span style={{ fontSize: '0.6rem', color: '#888' }}>
                            (1 Giro = 1 Min)
                        </span>
                    </div>
                    <div style={{
                        height: '180px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid #222',
                        borderRadius: '6px',
                        padding: '6px',
                        boxSizing: 'border-box'
                    }}>
                        <ProfitGraph
                            history={roundHistory}
                            balance={balance}
                            startBalance={initialCapital}
                            startTime={sessionStart}
                            viewCurrency={viewCurrency}
                            rates={RATES}
                            isWidgetMode={true}
                            workHours={workHours}
                        />
                    </div>
                    <div style={{
                        textAlign: 'center',
                        fontSize: '0.6rem',
                        color: '#666',
                        fontStyle: 'italic',
                        marginTop: '2px'
                    }}>
                        Tip: Presiona el botón dorado <strong style={{ color: '#d4af37' }}>📈 PROY</strong> arriba para expandir a pantalla completa.
                    </div>
                </div>

                {/* Actions */}
                < div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentBets && Object.keys(currentBets).length > 0 && (
                        <div>
                            <button
                                onClick={runSimulation}
                                disabled={isSimulating}
                                style={{
                                    width: '100%', background: '#252525', border: '1px solid #444', color: '#ccc',
                                    fontSize: '0.7rem', padding: '6px', borderRadius: '4px', cursor: 'pointer', textTransform: 'uppercase'
                                }}
                            >
                                {isSimulating ? 'Simulando...' : 'Simular Monte Carlo (1k)'}
                            </button>
                            {simStats && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.75rem', padding: '0 5px' }}>
                                    <span>EV: <strong style={{ color: simStats.ev >= 0 ? '#4f4' : '#f44' }}>{formatValueExact(simStats.ev)}</strong></span>
                                    <span>Win%: <strong style={{ color: '#fff' }}>{simStats.winRate.toFixed(1)}%</strong></span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Justification Trigger REMOVED */}
                </div >
            </div >

            {/* Render Modal via Portal if active */}
            {showJustification && <JustificationModal onClose={() => setShowJustification(false)} />}

        </div >
    )
}

export default ProjectionsPanel
