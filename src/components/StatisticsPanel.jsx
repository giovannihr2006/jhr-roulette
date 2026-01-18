import React, { useMemo } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { ALL_SPLITS, ALL_STREETS, ALL_CORNERS, ALL_LINES } from '../logic/RouletteUtils'

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const EMPTY_ARRAY = [];



export const StatisticsPanel = () => {
    const history = useFinancialStore(state => state.numberHistory || EMPTY_ARRAY);
    const baseWaitThreshold = useFinancialStore(state => state.baseWaitThreshold) || 300

    // --- OPPORTUNITY ANALYZER (SMART COMPARISONS) ---
    const opportunities = useMemo(() => {
        try {
            // ... logic ...
            const base = baseWaitThreshold

            if (history.length === 0) return []

            const countMisses = (numbers) => {
                let misses = 0
                for (let i = history.length - 1; i >= 0; i--) {
                    if (numbers.includes(history[i])) return misses
                    misses++
                }
                return misses
            }

            const allOps = []

            // 1. Plenos (Straight Up)
            const tPleno = base
            for (let i = 0; i <= 36; i++) {
                const m = countMisses([i])
                if (m > tPleno * 0.3) {
                    allOps.push({ type: 'Pleno', name: i.toString(), misses: m, limit: tPleno, ratio: m / tPleno, nums: [i] })
                }
            }

            // 2. Medios (Splits)
            const tMedio = Math.round(base / 2)
            ALL_SPLITS.forEach(bet => {
                const m = countMisses(bet.numbers)
                if (m > tMedio * 0.3) {
                    allOps.push({ type: 'Medio', name: bet.name.replace('Medio ', ''), misses: m, limit: tMedio, ratio: m / tMedio, nums: bet.numbers })
                }
            })

            // 3. Calles (Streets)
            const tCalle = Math.round(base / 3)
            ALL_STREETS.forEach(bet => {
                const m = countMisses(bet.numbers)
                if (m > tCalle * 0.3) {
                    allOps.push({ type: 'Calle', name: bet.name.replace('Calle ', ''), misses: m, limit: tCalle, ratio: m / tCalle, nums: bet.numbers })
                }
            })

            // 4. Seisenas (Lines)
            const tLine = Math.round(base / 6)
            ALL_LINES.forEach(bet => {
                const m = countMisses(bet.numbers)
                if (m > tLine * 0.3) {
                    allOps.push({ type: 'Seisena', name: bet.name.replace('Seisena ', ''), misses: m, limit: tLine, ratio: m / tLine, nums: bet.numbers })
                }
            })

            // 5. Cuadros (Corners)
            const tCorner = Math.round(base / 4)
            ALL_CORNERS.forEach(bet => {
                const m = countMisses(bet.numbers)
                if (m > tCorner * 0.3) {
                    allOps.push({ type: 'Cuadro', name: bet.name.replace('Cuadro ', ''), misses: m, limit: tCorner, ratio: m / tCorner, nums: bet.numbers })
                }
            })

            // Sort by Ratio DESC
            return allOps.sort((a, b) => b.ratio - a.ratio).slice(0, 10)
        } catch (e) {
            console.error("Stats Opp Error", e)
            return []
        }

    }, [history, baseWaitThreshold])


    // --- SLEEPING SECTORS LOGIC ---
    const sleepingCategories = useMemo(() => {
        try {
            if (!history || history.length === 0) return []

            const base = baseWaitThreshold

            // Helper to count misses
            const countMisses = (predicate) => {
                let misses = 0
                for (let i = history.length - 1; i >= 0; i--) {
                    if (predicate(history[i])) return misses
                    misses++
                }
                return misses
            }

            // Helper to create category with processed items
            const createCategory = (id, title, divisor, items) => {
                const limit = Math.round(base / divisor)
                const processed = items.map(item => {
                    const count = countMisses(item.predicate)
                    const ratio = limit > 0 ? count / limit : 0
                    return {
                        ...item,
                        count,
                        limit,
                        ratio,
                        percentage: Math.round(ratio * 100)
                    }
                }).sort((a, b) => b.count - a.count) // Sort by most sleeping

                return { id, title, divisor, limit, items: processed }
            }

            const categories = []

            // 1. PLENOS (Divisor 1)
            const plenos = []
            for (let i = 0; i <= 36; i++) {
                plenos.push({ name: `Pleno ${i}`, predicate: (n) => n === i })
            }
            categories.push(createCategory('plenos', 'PLENOS (1 NÚMERO)', 1, plenos))

            // 2. MEDIOS (Divisor 2)
            const splits = []
            ALL_SPLITS.forEach(s => splits.push({ name: s.name.replace('Medio ', 'Med '), predicate: (n) => s.numbers.includes(n) }))
            categories.push(createCategory('splits', 'MEDIOS (2 NÚMEROS)', 2, splits))

            // 3. CALLES (Divisor 3)
            const streets = []
            ALL_STREETS.forEach(s => streets.push({ name: s.name.replace('Calle ', 'Cal '), predicate: (n) => s.numbers.includes(n) }))
            categories.push(createCategory('streets', 'CALLES (3 NÚMEROS)', 3, streets))

            // 4. CUADROS (Divisor 4)
            const corners = []
            ALL_CORNERS.forEach(s => corners.push({ name: s.name.replace('Cuadro ', 'Cua '), predicate: (n) => s.numbers.includes(n) }))
            categories.push(createCategory('corners', 'CUADROS (4 NÚMEROS)', 4, corners))

            // 5. LÍNEAS (Divisor 6)
            const lines = []
            ALL_LINES.forEach(s => lines.push({ name: s.name.replace('Seisena ', 'Ln '), predicate: (n) => s.numbers.includes(n) }))
            categories.push(createCategory('lines', 'LÍNEAS (6 NÚMEROS)', 6, lines))

            // 6. DOCENAS Y COLUMNAS (Divisor 12)
            const dozCol = [
                { name: '1ª Docena', predicate: (n) => n >= 1 && n <= 12 },
                { name: '2ª Docena', predicate: (n) => n >= 13 && n <= 24 },
                { name: '3ª Docena', predicate: (n) => n >= 25 && n <= 36 },
                { name: '1ª Col', predicate: (n) => n > 0 && n % 3 === 1 },
                { name: '2ª Col', predicate: (n) => n > 0 && n % 3 === 2 },
                { name: '3ª Col', predicate: (n) => n > 0 && n % 3 === 0 }
            ]
            categories.push(createCategory('dozens_cols', 'DOCENAS Y COLUMNAS', 12, dozCol))

            // 7. SIMPLES (Divisor 18)
            const simples = [
                { name: 'Rojo', predicate: (n) => REDS.includes(n) },
                { name: 'Negro', predicate: (n) => n > 0 && !REDS.includes(n) },
                { name: 'Par', predicate: (n) => n > 0 && n % 2 === 0 },
                { name: 'Impar', predicate: (n) => n > 0 && n % 2 !== 0 },
                { name: 'Bajo', predicate: (n) => n >= 1 && n <= 18 },
                { name: 'Alto', predicate: (n) => n >= 19 && n <= 36 }
            ]
            categories.push(createCategory('simples', 'CHANCES SIMPLES', 18, simples))

            return categories
        } catch (e) {
            console.error("Sleeping Sectors Error", e)
            return []
        }
    }, [history, baseWaitThreshold])

    // --- STRATEGY ANALYSIS ---
    const roundHistory = useFinancialStore(state => state.roundHistory || [])

    // --- STRATEGY ANALYSIS ---
    const strategyAnalysis = useMemo(() => {
        try {
            if (roundHistory.length < 3) return { name: "Recopilando datos...", desc: "Juega más rondas para analizar tu estilo.", color: "#888" }

            const lastRounds = roundHistory.slice(0, 10) // analyze last 10

            let totalBetVol = 0
            let doubleDownCount = 0
            let flatBetCount = 0

            for (let i = 0; i < lastRounds.length - 1; i++) {
                const current = lastRounds[i] // Newest
                const prev = lastRounds[i + 1] // Older

                totalBetVol += current.totalBet

                // Martingale Check
                if (prev.netResult < 0 && current.totalBet >= prev.totalBet * 1.8 && current.totalBet <= prev.totalBet * 2.5) {
                    doubleDownCount++
                }
                // Flat Bet Check
                if (Math.abs(current.totalBet - prev.totalBet) < prev.totalBet * 0.1) {
                    flatBetCount++
                }
            }

            if (flatBetCount >= 3) return {
                name: "Flat Betting (Conservador)",
                desc: "Mantienes tu apuesta constante. Ideal para gestionar el bankroll.",
                color: "#44ff44"
            }
            const avgBet = totalBetVol / lastRounds.length
            const lastBet = lastRounds[0].totalBet
            if (lastBet > avgBet * 3) return {
                name: "Sniper de Alto Riesgo",
                desc: "Has aumentado drásticamente tu apuesta.",
                color: "#ffaa00"
            }
            return {
                name: "Equilibrado / Mixto",
                desc: "Varias tus apuestas según la intuición.",
                color: "#ffd700"
            }
        } catch (e) {
            console.error("Strategy Analysis Error", e)
            return { name: "Error", desc: "No se pudo analizar.", color: "#888" }
        }
    }, [roundHistory])

    // --- THRESHOLDS LOGIC ---

    const setBaseThreshold = useFinancialStore(state => state.setBaseThreshold)

    const thresholds = useMemo(() => [
        { name: 'Pleno (37)', div: 1, val: baseWaitThreshold },
        { name: 'Medios (18.5)', div: 2, val: Math.round(baseWaitThreshold / 2) },
        { name: 'Calle (12.3)', div: 3, val: Math.round(baseWaitThreshold / 3) },
        { name: 'Cuadro (9.2)', div: 4, val: Math.round(baseWaitThreshold / 4) },
        { name: 'Seisena (6.1)', div: 6, val: Math.round(baseWaitThreshold / 6) },
        { name: 'Col/Doc (3.0)', div: 12, val: Math.round(baseWaitThreshold / 12) },
        { name: 'Simple (2.0)', div: 18, val: Math.round(baseWaitThreshold / 18) }
    ], [baseWaitThreshold])

    return (
        <div className="panel-tray-dark" style={{
            width: '300px',
            maxHeight: '80vh',
            overflowY: 'auto'
        }}>
            {/* HEADER */}
            <div className="panel-tray-header">
                Estrategia & Frecuencia
            </div>

            <div className="panel-tray-content">

                {/* CONTROL DE BASE (PLENO) */}
                <div style={{ background: '#333', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>BASE DE ESPERA (PLENO)</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="number"
                            value={baseWaitThreshold}
                            onChange={(e) => setBaseThreshold(parseInt(e.target.value) || 0)}
                            style={{
                                background: '#111', border: '1px solid #555', color: '#fff',
                                padding: '5px', borderRadius: '4px', width: '80px', textAlign: 'center', fontWeight: 'bold'
                            }}
                        />
                        <div style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', lineHeight: '1.2' }}>
                            Modifica este valor para ajustar todas las jugadas
                        </div>
                    </div>
                </div>

                {/* TABLA DE JUGADAS DE ESPERA */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold', marginBottom: '8px', borderLeft: '3px solid #d4af37', paddingLeft: '8px' }}>
                        TABLA DE JUGADAS DE ESPERA
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#444' }}>
                        <div style={{ background: '#222', padding: '5px', fontSize: '0.75rem', color: '#aaa' }}>TIPO</div>
                        <div style={{ background: '#222', padding: '5px', fontSize: '0.75rem', color: '#aaa', textAlign: 'center' }}>LÍMITE SUGERIDO</div>
                        {thresholds.map(t => (
                            <React.Fragment key={t.name}>
                                <div style={{ background: '#1a1a1a', padding: '6px', fontSize: '0.8rem' }}>{t.name}</div>
                                <div style={{ background: '#1a1a1a', padding: '6px', fontSize: '0.9rem', textAlign: 'center', color: '#4f4', fontWeight: 'bold' }}>
                                    {t.val}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* OPPORTUNITY ANALYZER (TOP 10) */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold', marginBottom: '8px', borderLeft: '3px solid #00e676', paddingLeft: '8px' }}>
                        TOP OPORTUNIDADES (Probabilidad)
                    </div>
                    <div style={{ background: '#222', padding: '5px', borderRadius: '5px' }}>
                        {opportunities.length === 0 ? (
                            <div style={{ padding: '10px', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>
                                Juega más para detectar oportunidades...
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                <thead>
                                    <tr style={{ color: '#888', borderBottom: '1px solid #444', textAlign: 'left' }}>
                                        <th style={{ padding: '4px' }}>JUGADA</th>
                                        <th style={{ padding: '4px', textAlign: 'center' }}>ESPERA</th>
                                        <th style={{ padding: '4px', textAlign: 'right' }}>% PROB</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {opportunities.map((op, i) => (
                                        <tr key={i} style={{
                                            borderBottom: '1px solid #333',
                                            backgroundColor: i === 0 ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                                            boxShadow: i === 0 ? '0 0 15px rgba(255, 215, 0, 0.1) inset' : 'none',
                                            borderLeft: i === 0 ? '4px solid #ffd700' : 'none'
                                        }}>
                                            <td style={{ padding: '8px 6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    {i === 0 && <span style={{ fontSize: '1rem' }}>🏆</span>}
                                                    <div>
                                                        <div style={{
                                                            color: i === 0 ? '#ffd700' : '#eee',
                                                            fontWeight: i === 0 ? '900' : 'bold',
                                                            textShadow: i === 0 ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none'
                                                        }}>
                                                            {op.type} {i === 0 && <span style={{ fontSize: '0.7rem', background: '#ffd700', color: '#000', padding: '1px 3px', borderRadius: '3px', marginLeft: '5px' }}>MEJOR</span>}
                                                        </div>
                                                        <div style={{ color: i === 0 ? '#fff' : '#aaa', fontSize: '0.75rem' }}>{op.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                                                <div style={{ color: op.ratio > 1.0 ? '#ff4444' : '#fff', fontWeight: i === 0 ? 'bold' : 'normal' }}>
                                                    {op.misses} / <span style={{ color: '#888' }}>{op.limit}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                                                <div style={{
                                                    color: op.ratio > 1.2 ? '#ff00ff' : (op.ratio > 1.0 ? '#00e676' : '#d4af37'),
                                                    fontWeight: 'bold',
                                                    fontSize: i === 0 ? '1.1rem' : '0.9rem',
                                                    textShadow: i === 0 ? '0 0 10px rgba(0, 230, 118, 0.5)' : 'none'
                                                }}>
                                                    {(op.ratio * 100).toFixed(0)}%
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* STRATEGY CARD */}
                <div style={{
                    background: '#1a1a1a', border: `1px solid ${strategyAnalysis.color}`,
                    borderRadius: '8px', padding: '10px', marginBottom: '15px'
                }}>
                    <div style={{ color: strategyAnalysis.color, fontWeight: 'bold', fontSize: '1rem', marginBottom: '5px' }}>
                        🤖 {strategyAnalysis.name}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        "{strategyAnalysis.desc}"
                    </div>
                </div>



                {/* SECTORES DURMIENTES (CATEGORIZED) */}
                <div style={{ borderTop: '1px solid #444', paddingTop: '10px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#ffd700', marginBottom: '2px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        💤 Sectores Durmientes
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#888', marginBottom: '10px' }}>
                        REF. PLENO: <span style={{ color: '#fff', fontWeight: 'bold' }}>{baseWaitThreshold}</span>
                    </div>

                    {sleepingCategories.map((cat) => (
                        <div key={cat.id} style={{ marginBottom: '15px' }}>
                            <div style={{
                                background: '#222', padding: '4px 8px',
                                color: '#aaa', fontSize: '0.75rem', fontWeight: 'bold',
                                borderLeft: '3px solid #d4af37', marginBottom: '5px',
                                display: 'flex', justifyContent: 'space-between'
                            }}>
                                <span>{cat.title}</span>
                                <span style={{ color: '#666' }}>Lím: {cat.limit}</span>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <tbody>
                                    {cat.items.slice(0, 5).map((item, i) => (
                                        <tr key={item.name} style={{
                                            background: item.ratio >= 1 ? 'rgba(255, 68, 68, 0.15)' : (i === 0 ? 'rgba(77, 171, 247, 0.1)' : 'transparent'),
                                            borderBottom: '1px solid #333'
                                        }}>
                                            <td style={{
                                                padding: '3px 5px',
                                                color: item.ratio >= 1 ? '#ff8888' : (i === 0 ? '#4dabf7' : '#ddd'),
                                                fontWeight: item.ratio >= 1 ? 'bold' : 'normal'
                                            }}>
                                                {item.name} {item.ratio >= 1 && '🔥'}
                                            </td>
                                            <td style={{
                                                padding: '3px 5px',
                                                textAlign: 'right',
                                                fontWeight: 'bold'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <span style={{ color: '#ccc' }}>{item.count}</span>
                                                    <span style={{
                                                        color: item.ratio >= 1.2 ? '#ff00ff' : (item.ratio >= 1 ? '#00e676' : '#d4af37'),
                                                        fontSize: '0.8rem', width: '35px', textAlign: 'right'
                                                    }}>
                                                        {item.percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
