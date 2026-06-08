import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { ALL_SPLITS, ALL_STREETS, ALL_CORNERS, ALL_LINES, optimizeBets } from '../logic/RouletteUtils'
import { soundManager } from '../utils/SoundManager';
import { ForensicBadge } from './ForensicBadge';

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const EMPTY_ARRAY = [];

const JUSTIFICATION_TEXT_E18 = `
TUTORIAL FORENSE: ESTRATEGIA DE FRECUENCIA (ELEMENTO 17)

1. LA BASE DE ESPERA (EL VALOR 300):
   ¿Por qué 300? Un ciclo completo de ruleta es 37 giros.
   • Para confirmar una desviación real, necesitamos ver ~8 ciclos (37 x 8 = 296).
   • 300 es el estándar de industria para separar "Mala Suerte" de "Anomalía Estadística".

2. LÍMITES DINÁMICOS (LA TABLA):
   El sistema no espera lo mismo para un Pleno que para un Color.
   • Pleno (1/37): Necesita 300 giros para madurar.
   • Color (1/2): Con 18 giros de retraso ya es anómalo (Base / 18).
   Esta tabla ajusta automáticamente la sensibilidad de todos los sensores del tablero.

3. CAZADOR DE SECTORES DURMIENTES:
   Abajo verás el escáner de "Sectores Durmientes".
   • Si un sector supera el 100% de su límite, entra en "Zona de Disparo".
   • Ejemplo: Si una "Calle" no sale en 100 giros (Límite 100), está lista para ser atacada.

4. GESTIÓN DE RIESGO:
   Si bajas la Base de Espera (ej. a 100), tendrás más alertas, pero más falsos positivos (suicidio financiero).
   Si la subes (ej. a 500), tendrás precisión de cirujano, pero dispararás una vez al día.
   • RECOMENDACIÓN: Mantén 300 para equilibrio profesional.

5. FÓRMULA DE DORMANCIA MÁXIMA DE GIOVANNI (EXTREMA):
   Giovanni predijo matemáticamente que el producto del tamaño del sector (k) por el retraso máximo (Tmax) es notablemente estable.
   La Fórmula Empírica de Dormancia Extrema es:
   Tmax = [37 * ln(N * k / 37)] / k
   Donde N es el largo del historial analizado (mínimo 1000 giros).
   • N = 1,000 giros (Sesión Real Corta): Tmax = 160 / k
   • N = 100,000 giros (Gran Historial): Tmax = 340 / k
   • N = 1,000,000 giros (Límite Absoluto): Tmax = 400 / k
   Cuando un sector supera su Tmax calculado empíricamente, el sistema entra en "Dormancia Crítica" (alerta roja), indicando un Breakout altamente inminente.
`.trim();

// --- SUB-COMPONENT: Justification Modal (PORTAL) ---
const JustificationModal = ({ onClose }) => {
    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(5, 5, 5, 0.96)', // Almost solid black
            zIndex: 2147483647,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(15px)'
        }} onClick={onClose}>
            <div style={{
                width: '95%', maxWidth: '1000px',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'linear-gradient(145deg, #121212, #0a0a0a)',
                border: '1px solid #d4af37',
                borderRadius: '8px',
                padding: '50px',
                boxShadow: '0 0 150px rgba(212, 175, 55, 0.15)',
                display: 'flex', flexDirection: 'column', gap: '30px',
                animation: 'fadeIn 0.3s ease-out',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #333', paddingBottom: '25px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 10px gold)' }}>📊</span>
                        <div>
                            <h2 style={{ margin: 0, color: '#d4af37', fontFamily: 'Cinzel, serif', fontSize: '2.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                Tutorial de Estrategia
                            </h2>
                            <span style={{ color: '#aaa', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 'bold' }}>
                                Elemento 17: Calibración de Sensores
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none', border: '1px solid #555', color: '#888',
                        width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer',
                        fontSize: '1.5rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#888' }}
                    >✕</button>
                </div>

                {/* Body */}
                <div style={{
                    color: '#e0e0e0', fontSize: '1.2rem', lineHeight: '1.8', // Larger readable font
                    whiteSpace: 'pre-line', fontFamily: 'Roboto, sans-serif', padding: '10px'
                }}>
                    {JUSTIFICATION_TEXT_E18}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>,
        document.body
    )
}



export const StatisticsPanel = ({ onBet, onHoverNumbers }) => {
    const history = useFinancialStore(state => state.numberHistory || EMPTY_ARRAY)
    const baseWaitThreshold = useFinancialStore(state => state.baseWaitThreshold) || 300
    const runFastSimulation = useFinancialStore(state => state.runFastSimulation)
    const [clickedId, setClickedId] = useState(null) // Flash Effect State
    const [showJustification, setShowJustification] = useState(false); // Tutorial Modal State

    // Compute stats for SVG charts
    const counts = useMemo(() => {
        const stats = {
            red: 0, black: 0, zero: 0,
            even: 0, odd: 0,
            low: 0, high: 0,
            doz1: 0, doz2: 0, doz3: 0,
            col1: 0, col2: 0, col3: 0
        }
        history.forEach(num => {
            if (num === 0) {
                stats.zero++
            } else {
                if (REDS.includes(num)) stats.red++
                else stats.black++

                if (num % 2 === 0) stats.even++
                else stats.odd++

                if (num <= 18) stats.low++
                else stats.high++

                if (num <= 12) stats.doz1++
                else if (num <= 24) stats.doz2++
                else stats.doz3++

                if (num % 3 === 1) stats.col1++
                else if (num % 3 === 2) stats.col2++
                else stats.col3++
            }
        })
        return stats
    }, [history])

    const renderSvgBar = (label, count, total, color) => {
        const percentage = total > 0 ? (count / total) * 100 : 0
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', margin: '4px 0' }}>
                <span style={{ width: '70px', color: '#aaa', fontWeight: 'bold' }}>{label}</span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '3px', height: '14px', overflow: 'hidden' }}>
                    <svg width="100%" height="100%">
                        <rect
                            width={`${percentage}%`}
                            height="100%"
                            fill={color}
                            rx="2"
                            ry="2"
                        >
                            <animate attributeName="width" from="0%" to={`${percentage}%`} dur="0.5s" fill="freeze" />
                        </rect>
                    </svg>
                </div>
                <span style={{ width: '55px', textAlign: 'right', fontFamily: 'monospace', color: '#fff', fontWeight: 'bold' }}>
                    {count} ({percentage.toFixed(0)}%)
                </span>
            </div>
        )
    }

    // --- HELPERS (Centralized) ---
    const countMisses = (numbersOrPredicate) => {
        let misses = 0
        const isArray = Array.isArray(numbersOrPredicate)
        for (let i = history.length - 1; i >= 0; i--) {
            const val = history[i]
            if (isArray ? numbersOrPredicate.includes(val) : numbersOrPredicate(val)) return misses
            misses++
        }
        return misses
    }

    // --- OPPORTUNITY ANALYZER (SMART COMPARISONS) ---
    const opportunities = useMemo(() => {
        try {
            const base = baseWaitThreshold
            if (history.length === 0) return []
            const allOps = []

            // 1. Plenos (Straight Up)
            const tPleno = base
            for (let i = 0; i <= 36; i++) {
                const m = countMisses([i])
                if (m > tPleno * 0.3) {
                    allOps.push({
                        type: 'Pleno',
                        name: i.toString(),
                        misses: m,
                        limit: tPleno,
                        ratio: m / tPleno,
                        nums: [i],
                        id: i.toString()
                    })
                }
            }

            // 2. Medios (Splits)
            const tMedio = Math.round(base / 2)
            ALL_SPLITS.forEach(bet => {
                const m = countMisses(bet.numbers)
                if (m > tMedio * 0.3) {
                    const sorted = [...bet.numbers].sort((a, b) => a - b)
                    allOps.push({
                        type: 'Medio',
                        name: bet.name.replace('Medio ', ''),
                        misses: m,
                        limit: tMedio,
                        ratio: m / tMedio,
                        nums: bet.numbers,
                        id: `SPLIT_${sorted.join('_')}`
                    })
                }
            })

            // 3. Calles (Streets)
            const tCalle = Math.round(base / 3)
            ALL_STREETS.forEach(bet => {
                const m = countMisses(bet.numbers)
                if (m > tCalle * 0.3) {
                    const sorted = [...bet.numbers].sort((a, b) => a - b)
                    let id = `STREET_${sorted[0]}`
                    if (bet.numbers.includes(0)) id = `TRIO_${sorted.join('_')}`

                    allOps.push({
                        type: 'Calle',
                        name: bet.name.replace('Calle ', ''),
                        misses: m,
                        limit: tCalle,
                        ratio: m / tCalle,
                        nums: bet.numbers,
                        id: id
                    })
                }
            })

            // 4. Lineas
            const tLine = Math.round(base / 6)
            ALL_LINES.forEach(bet => {
                const m = countMisses(bet.numbers)
                if (m > tLine * 0.3) {
                    const sorted = [...bet.numbers].sort((a, b) => a - b)
                    // FIX: Ensure ID matches BettingBoard format (LINE_Start_NextStart)
                    // bet.numbers is [1,2,3,4,5,6]. Start=1. NextStart=4.
                    const start = sorted[0]
                    const nextStart = sorted[3] // The 4th number is the start of the second street
                    allOps.push({
                        type: 'Linea',
                        name: bet.name.replace('Linea ', ''),
                        misses: m,
                        limit: tLine,
                        ratio: m / tLine,
                        nums: bet.numbers,
                        id: `LINE_${start}_${nextStart}`
                    })
                }
            })

            // 5. Cuadros (Corners)
            const tCorner = Math.round(base / 4)
            ALL_CORNERS.forEach(bet => {
                const m = countMisses(bet.numbers)
                if (m > tCorner * 0.3) {
                    const sorted = [...bet.numbers].sort((a, b) => a - b)
                    let id = `CORNER_${sorted.join('_')}`
                    if (bet.numbers.includes(0)) id = `BASKET_${sorted.join('_')}`
                    allOps.push({
                        type: 'Cuadro',
                        name: bet.name.replace('Cuadro ', ''),
                        misses: m,
                        limit: tCorner,
                        ratio: m / tCorner,
                        nums: bet.numbers,
                        id: id
                    })
                }
            })

            // --- FORENSIC SECTORS INTEGRATION ---
            const WHEEL = [
                0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
                10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
            ];

            const getSlice = (centerIdx, startOffset, endOffset) => {
                const nums = [];
                for (let offset = startOffset; offset <= endOffset; offset++) {
                    let idx = (centerIdx + offset) % 37;
                    if (idx < 0) idx += 37;
                    nums.push(WHEEL[idx]);
                }
                return nums;
            }

            // 6. NÚCLEOS (7)
            const tNucleo = Math.round(base / 7);
            for (let i = 0; i <= 36; i++) {
                const centerIdx = WHEEL.indexOf(i);
                const nums = getSlice(centerIdx, -4, 2);
                const m = countMisses(nums);
                if (m > tNucleo * 0.3) {
                    allOps.push({ type: 'Núcleo', name: i.toString(), misses: m, limit: tNucleo, ratio: m / tNucleo, nums: nums, id: null });
                }
            }

            // 7. VECINOS (17)
            const tVecinos = Math.round(base / 17);
            for (let i = 0; i <= 36; i++) {
                const centerIdx = WHEEL.indexOf(i);
                const nums = getSlice(centerIdx, -9, 7);
                const m = countMisses(nums);
                if (m > tVecinos * 0.3) {
                    allOps.push({ type: 'Vecinos', name: i.toString(), misses: m, limit: tVecinos, ratio: m / tVecinos, nums: nums, id: null });
                }
            }

            // 8. TERCIOS (12)
            const tTiers = Math.round(base / 12);
            for (let i = 0; i <= 36; i++) {
                const centerIdx = WHEEL.indexOf(i);
                const nums = getSlice(centerIdx, 11, 22);
                const m = countMisses(nums);
                if (m > tTiers * 0.3) {
                    allOps.push({ type: 'Tercio', name: i.toString(), misses: m, limit: tTiers, ratio: m / tTiers, nums: nums, id: null });
                }
            }

            // 9. HUÉRFANOS (8)
            const tOrph = Math.round(base / 8);
            for (let i = 0; i <= 36; i++) {
                const centerIdx = WHEEL.indexOf(i);
                const nums1 = getSlice(centerIdx, 8, 10);
                const nums2 = getSlice(centerIdx, 23, 27);
                const nums = [...nums1, ...nums2];
                const m = countMisses(nums);
                if (m > tOrph * 0.3) {
                    allOps.push({ type: 'Huérfanos', name: i.toString(), misses: m, limit: tOrph, ratio: m / tOrph, nums: nums, id: null });
                }
            }

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

            const createCategory = (id, title, divisor, items) => {
                const limit = Math.round(base / divisor)
                const processed = items.map(item => {
                    const count = countMisses(item.nums)
                    const ratio = limit > 0 ? count / limit : 0
                    return {
                        ...item,
                        count,
                        limit,
                        ratio,
                        percentage: Math.round(ratio * 100)
                    }
                }).sort((a, b) => b.count - a.count)
                return { id, title, divisor, limit, items: processed }
            }

            const categories = []

            // 1. PLENOS
            const plenos = []
            for (let i = 0; i <= 36; i++) {
                plenos.push({ name: `Pleno ${i}`, nums: [i] })
            }
            categories.push(createCategory('plenos', 'PLENOS (1 NÚMERO)', 1, plenos))

            // 2. MEDIOS
            const splits = []
            ALL_SPLITS.forEach(s => splits.push({ name: s.name.replace('Medio ', 'Med '), nums: s.numbers }))
            categories.push(createCategory('splits', 'MEDIOS (2 NÚMEROS)', 2, splits))

            // 3. CALLES
            const streets = []
            ALL_STREETS.forEach(s => streets.push({ name: s.name.replace('Calle ', 'Cal '), nums: s.numbers }))
            categories.push(createCategory('streets', 'CALLES (3 NÚMEROS)', 3, streets))

            // 4. CUADROS
            const corners = []
            ALL_CORNERS.forEach(s => corners.push({ name: s.name.replace('Cuadro ', 'Cua '), nums: s.numbers }))
            categories.push(createCategory('corners', 'CUADROS (4 NÚMEROS)', 4, corners))

            // 5. LÍNEAS
            const lines = []
            ALL_LINES.forEach(s => lines.push({ name: s.name.replace('Linea ', 'Ln '), nums: s.numbers }))
            categories.push(createCategory('lines', 'LÍNEAS (6 NÚMEROS)', 6, lines))

            // 6. DOCENAS Y COLUMNAS
            const dozCol = [
                { name: '1ª Docena', nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
                { name: '2ª Docena', nums: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] },
                { name: '3ª Docena', nums: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36] },
                { name: '1ª Col', nums: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34] },
                { name: '2ª Col', nums: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35] },
                { name: '3ª Col', nums: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36] }
            ]
            categories.push(createCategory('dozens_cols', 'DOCENAS Y COLUMNAS', 12, dozCol))

            // 7. SIMPLES
            const simples = [
                { name: 'Rojo', nums: REDS },
                { name: 'Negro', nums: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35] },
                { name: 'Par', nums: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36] },
                { name: 'Impar', nums: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35] },
                { name: 'Bajo', nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
                { name: 'Alto', nums: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36] }
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
            if (roundHistory.length < 3) return { name: "Calibrando Sensores...", desc: "Inicia la secuencia de disparos para triangulación.", color: "#888" }

            const lastRounds = roundHistory.slice(0, 10) // analyze last 10

            let totalBetVol = 0
            let doubleDownCount = 0
            let flatBetCount = 0
            let varianceCount = 0

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
                // Variance High
                if (Math.abs(current.totalBet - prev.totalBet) > prev.totalBet * 2) {
                    varianceCount++
                }
            }

            if (flatBetCount >= 3) return {
                name: "Gestión de Varianza Constante",
                desc: "Patrón de sostenimiento detectado. A la espera de la ventana de oportunidad.",
                color: "#44ff44"
            }
            const avgBet = totalBetVol / lastRounds.length
            const lastBet = lastRounds[0].totalBet

            // Sniper Logic
            if (lastBet > avgBet * 3) return {
                name: "Ejecución de Alta Precisión (Sniper)",
                desc: "Disparo masivo detectado. Probable captura de sector durmiente.",
                color: "#ffaa00"
            }

            if (doubleDownCount >= 1) return {
                name: "Recuperación Agresiva (Martingala)",
                desc: "Escalada de capital tras fallo. Alerta de riesgo exponente.",
                color: "#ff4444"
            }

            return {
                name: "Cazador de Sectores Durmientes",
                desc: "Buscando anomalías estadísticas en el cilindro. Escaneo Forense Activo.",
                color: "#00e676" // Green success
            }
        } catch (e) {
            console.error("Strategy Analysis Error", e)
            return { name: "Error", desc: "Fallo en telemetría.", color: "#888" }
        }
    }, [roundHistory])

    // --- THRESHOLDS LOGIC ---

    const setBaseThreshold = useFinancialStore(state => state.setBaseThreshold)

    const thresholds = useMemo(() => [
        { name: 'Pleno (37)', div: 1, val: baseWaitThreshold },
        { name: 'Medios (18.5)', div: 2, val: Math.round(baseWaitThreshold / 2) },
        { name: 'Calle (12.3)', div: 3, val: Math.round(baseWaitThreshold / 3) },
        { name: 'Cuadro (9.2)', div: 4, val: Math.round(baseWaitThreshold / 4) },
        { name: 'Linea (6.1)', div: 6, val: Math.round(baseWaitThreshold / 6) },

        // --- FORENSIC SECTORS ---
        { name: 'Núcleo (5.2)', div: 7, val: Math.round(baseWaitThreshold / 7) },
        { name: 'Huérfanos (4.6)', div: 8, val: Math.round(baseWaitThreshold / 8) },
        { name: 'Tercio/Doc (3.0)', div: 12, val: Math.round(baseWaitThreshold / 12) }, // Combined with Dozen
        { name: 'Vecinos (2.1)', div: 17, val: Math.round(baseWaitThreshold / 17) }, // Close to Simple

        { name: 'Simple (2.0)', div: 18, val: Math.round(baseWaitThreshold / 18) }
    ], [baseWaitThreshold])

    // HELPER_HANDLER (Moved outside useMemo for clarity)
    const handleStatClick = (item, uniqueKey) => {
        if (onBet) {
            // 1. Audio Feedback
            soundManager.playChip();

            // 2. Visual Feedback (Flash)
            setClickedId(uniqueKey);
            setTimeout(() => setClickedId(null), 150); // Short flash

            if (item.id) {
                // Direct ID available (Standard bets)
                onBet([item.id])
            } else if (item.nums) {
                // No ID (sectors like Nucleo/Vecinos), rely on optimizer
                const opts = optimizeBets(item.nums)
                if (opts.length) onBet(opts)
            }
        }
    }

    return (
        <div className="panel-tray-dark" style={{
            width: '100%',
            height: '100%',
            overflowY: 'auto'
        }}>
            {/* HEADER */}
            <div className="panel-tray-header" style={{ justifyContent: 'center', fontSize: '0.9rem', padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ForensicBadge id="statistics" />
                    <span style={{ color: '#fff' }}>ESTADÍSTICAS</span>
                </span>
                {/* FORENSIC ICON BUTTON */}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                    title="Ver Tutorial Estratégico (E17)"
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#666', fontSize: '1rem', transition: 'color 0.2s',
                        zIndex: 10
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                    onMouseLeave={e => e.currentTarget.style.color = '#666'}
                >
                    ⚖
                </button>
            </div>
            <div className="panel-tray-content">
                {/* MODAL PORTAL */}
                {useState && showJustification && <JustificationModal onClose={() => setShowJustification(false)} />}

                {/* BOTÓN CALIBRACIÓN RÁPIDA */}
                <button
                    onClick={() => {
                        if (window.confirm("¿Deseas simular 100 giros instantáneos en segundo plano para calibrar las tendencias?")) {
                            runFastSimulation(100);
                        }
                    }}
                    style={{
                        background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        width: '100%',
                        marginBottom: '15px',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                        transition: 'transform 0.1s',
                        fontFamily: 'sans-serif',
                        letterSpacing: '1px'
                    }}
                >
                    ⚡ CALIBRACIÓN RÁPIDA (100 GIROS)
                </button>

                {/* GRÁFICOS SVG NATIVOS */}
                <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                    <div style={{ fontSize: '0.9rem', color: '#ffd700', fontWeight: 'bold', marginBottom: '10px', borderLeft: '3px solid #ffd700', paddingLeft: '8px' }}>
                        FRECUENCIA DE ACUMULADOS (SVG)
                    </div>
                    {history.length === 0 ? (
                        <div style={{ color: '#666', fontSize: '0.75rem', textAlign: 'center', padding: '10px' }}>
                            Sin datos en el historial. Gira la ruleta o calibra para ver gráficos.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Colores</div>
                                {renderSvgBar('Rojo', counts.red, history.length, '#ff4444')}
                                {renderSvgBar('Negro', counts.black, history.length, '#333')}
                                {renderSvgBar('Cero', counts.zero, history.length, '#00e676')}
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Docenas</div>
                                {renderSvgBar('1ª Docena', counts.doz1, history.length, '#ffd700')}
                                {renderSvgBar('2ª Docena', counts.doz2, history.length, '#ffd700')}
                                {renderSvgBar('3ª Docena', counts.doz3, history.length, '#ffd700')}
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Columnas</div>
                                {renderSvgBar('Columna 1', counts.col1, history.length, '#4169e1')}
                                {renderSvgBar('Columna 2', counts.col2, history.length, '#4169e1')}
                                {renderSvgBar('Columna 3', counts.col3, history.length, '#4169e1')}
                            </div>
                        </div>
                    )}
                </div>

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
                                        <th style={{ padding: '4px', textAlign: 'right' }}>% MADUREZ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {opportunities.map((op, i) => {
                                        const uniqueKey = `op-${i}`;
                                        const isClicked = clickedId === uniqueKey;
                                        return (
                                            <tr
                                                key={i}
                                                onClick={() => handleStatClick(op, uniqueKey)}
                                                style={{
                                                    borderBottom: '1px solid #333',
                                                    backgroundColor: isClicked ? '#ffffff' : (i === 0 ? 'rgba(255, 215, 0, 0.15)' : 'transparent'), // Flash white
                                                    boxShadow: i === 0 ? '0 0 15px rgba(255, 215, 0, 0.1) inset' : 'none',
                                                    borderLeft: i === 0 ? '4px solid #ffd700' : 'none',
                                                    cursor: onBet ? 'pointer' : 'default',
                                                    transition: isClicked ? 'none' : 'background 0.3s ease-out' // Immediate flash, slow fade
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                                                    if (onHoverNumbers && op.nums) onHoverNumbers(op.nums)
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.backgroundColor = i === 0 ? 'rgba(255, 215, 0, 0.15)' : 'transparent'
                                                    if (onHoverNumbers) onHoverNumbers([])
                                                }}
                                                title="Click para apostar"
                                            >
                                                <td style={{ padding: '8px 6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        {i === 0 && <span style={{ fontSize: '1rem' }}>🏆</span>}
                                                        <div>
                                                            <div style={{
                                                                color: i === 0 ? '#ffd700' : '#eee',
                                                                fontWeight: i === 0 ? '900' : 'bold',
                                                                textShadow: i === 0 ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {op.type} (#{op.nums?.length || 0}) {i === 0 && <span style={{ fontSize: '0.7rem', background: '#ffd700', color: '#000', padding: '1px 3px', borderRadius: '3px', marginLeft: '5px' }}>MEJOR</span>}
                                                            </div>
                                                            <div style={{ color: i === 0 ? '#fff' : '#aaa', fontSize: '0.75rem' }}>{op.name} (#{op.nums?.length || 0})</div>
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
                                        )
                                    })}
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
                                    {cat.items.slice(0, 5).map((item, i) => {
                                        const uniqueKey = `sleep-${cat.id}-${item.name}`;
                                        const isClicked = clickedId === uniqueKey;
                                        return (
                                            <tr key={item.name}
                                                onClick={() => handleStatClick(item, uniqueKey)}
                                                onMouseEnter={() => {
                                                    if (onHoverNumbers && item.nums) onHoverNumbers(item.nums)
                                                }}
                                                onMouseLeave={() => {
                                                    if (onHoverNumbers) onHoverNumbers([])
                                                }}
                                                style={{
                                                    background: isClicked ? '#ffffff' : (item.ratio >= 1 ? 'rgba(255, 68, 68, 0.15)' : (i === 0 ? 'rgba(77, 171, 247, 0.1)' : 'transparent')),
                                                    borderBottom: '1px solid #333',
                                                    cursor: onBet ? 'pointer' : 'default',
                                                    transition: isClicked ? 'none' : 'background 0.3s ease-out'
                                                }}>
                                                <td style={{
                                                    padding: '3px 5px',
                                                    color: item.ratio >= 1 ? '#ff8888' : (i === 0 ? '#4dabf7' : '#ddd'),
                                                    fontWeight: item.ratio >= 1 ? 'bold' : 'normal',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {item.name} (#{item.nums?.length || 0}) {item.ratio >= 1 && '🔥'}
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
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
