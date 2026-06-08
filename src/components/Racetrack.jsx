import React, { useState, useEffect, useMemo } from 'react'
import './Racetrack.css'
import { WHEEL_ORDER, getNeighbours } from '../utils/rouletteUtils'
import JustificationModal from './JustificationModal'
import { ELEMENT_DESCRIPTIONS } from '../config/ElementDescriptions'
import { optimizeBets } from '../logic/RouletteUtils'
import { useFinancialStore } from '../logic/FinancialSimulator'

// CONFIGURATION
const CX = 300
const CY = 120
const RX = 280 // Outer radius
const RY = 60
const RX_NUM = 240 // Radius for numbers
const RY_NUM = 50

export const Racetrack = ({ onBatchBets, onHoverNumbers, neighborCount = 3, setNeighborCount, highlightedNumbers = [] }) => {

    const history = useFinancialStore(state => state.numberHistory || [])
    const [manualNumber, setManualNumber] = useState('')
    const [showHelp, setShowHelp] = useState(false)
    const [isOptimized, setIsOptimized] = useState(false)

    // --- BET CONFIGURATION ---
    const VOISINS_NUMBERS = [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25]
    const TIERS_NUMBERS = [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33]
    const ORPHELINS_NUMBERS = [1, 20, 14, 31, 9, 17, 34, 6]

    // Exact bet lists
    const getVoisins = () => [
        'TRIO_0_2_3', 'TRIO_0_2_3', 'SPLIT_4_7', 'SPLIT_12_15',
        'SPLIT_18_21', 'SPLIT_19_22', 'CORNER_25_26_28_29', 'CORNER_25_26_28_29', 'SPLIT_32_35'
    ]
    const getTiers = () => [
        'SPLIT_5_8', 'SPLIT_10_11', 'SPLIT_13_16', 'SPLIT_23_24', 'SPLIT_27_30', 'SPLIT_33_36'
    ]
    const getOrphelins = () => ['1', 'SPLIT_6_9', 'SPLIT_14_17', 'SPLIT_17_20', 'SPLIT_31_34']

    // Compute recency for all 37 numbers
    const recencyMap = useMemo(() => {
        const map = {}
        for (let i = 0; i <= 36; i++) {
            map[i] = -1
        }
        for (let idx = 0; idx <= 36; idx++) {
            let foundIdx = -1
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i] === idx) {
                    foundIdx = history.length - 1 - i
                    break
                }
            }
            map[idx] = foundIdx === -1 ? history.length : foundIdx
        }
        return map
    }, [history])

    const getRecencyColor = (misses) => {
        if (misses === 0) return '#4caf50' // Just hit
        if (misses > 100) return '#ff3d00' // Very cold
        if (misses > 50) return '#ffc107' // Cold
        return 'rgba(255, 255, 255, 0.4)'
    }

    // Compute expected value (EV) for all 37 numbers
    const evMap = useMemo(() => {
        const map = {}
        const total = history.length
        if (total === 0) {
            for (let i = 0; i <= 36; i++) map[i] = -0.027
            return map
        }

        const hits = Array(37).fill(0)
        history.forEach(num => {
            if (num >= 0 && num <= 36) hits[num]++
        })

        for (let i = 0; i <= 36; i++) {
            const p = hits[i] / total
            map[i] = (p * 36) - 1
        }
        return map
    }, [history])

    const getEvColor = (ev) => {
        if (ev > 0.1) return 'rgba(76, 175, 80, 0.45)' // Strong Positive EV (Green)
        if (ev > 0.0) return 'rgba(76, 175, 80, 0.2)'  // Mild Positive EV (Light Green)
        if (ev < -0.15) return 'rgba(255, 23, 68, 0.15)' // Strong Negative EV (Red)
        return 'transparent'
    }

    // Compute zone hit ratios
    const zoneHits = useMemo(() => {
        if (history.length === 0) return { voisins: 0.459, tiers: 0.324, orphelins: 0.216 }
        let vHits = 0, tHits = 0, oHits = 0
        history.forEach(num => {
            if (VOISINS_NUMBERS.includes(num)) vHits++
            else if (TIERS_NUMBERS.includes(num)) tHits++
            else if (ORPHELINS_NUMBERS.includes(num)) oHits++
        })
        const total = history.length
        return {
            voisins: vHits / total,
            tiers: tHits / total,
            orphelins: oHits / total
        }
    }, [history])

    const getZoneFill = (actual, theoretical) => {
        const deviation = actual - theoretical
        if (deviation > 0) {
            const opacity = Math.min(0.5, deviation * 3)
            return `rgba(212, 175, 55, ${0.1 + opacity})`
        } else {
            const opacity = Math.min(0.5, Math.abs(deviation) * 3)
            return `rgba(33, 150, 243, ${0.05 + opacity})`
        }
    }

    // --- HELPERS ---

    let rotationShift = 0
    if (manualNumber !== '') {
        const num = parseInt(manualNumber)
        if (!isNaN(num)) {
            const index = WHEEL_ORDER.indexOf(num)
            if (index !== -1) {
                rotationShift = - (index * (360 / 37))
            }
        }
    }

    const getAngle = (index) => {
        const degrees = ((index * (360 / 37)) - 90) + rotationShift
        return degrees * (Math.PI / 180)
    }

    const getPoint = (rx, ry, angleRad) => ({
        x: CX + rx * Math.cos(angleRad),
        y: CY + ry * Math.sin(angleRad)
    })

    const createSectorPath = (startNum, endNum) => {
        const idxStart = WHEEL_ORDER.indexOf(startNum)
        const idxEnd = WHEEL_ORDER.indexOf(endNum)

        const SLICE = (360 / 37) * (Math.PI / 180)
        const startCurrentAngle = getAngle(idxStart)
        const endCurrentAngle = getAngle(idxEnd)

        const sAngle = startCurrentAngle - (SLICE / 2)
        const eAngle = endCurrentAngle + (SLICE / 2)

        const pStartOuter = getPoint(RX, RY, sAngle)
        const pEndOuter = getPoint(RX, RY, eAngle)
        const pStartInner = getPoint(RX - 100, RY - 30, sAngle)
        const pEndInner = getPoint(RX - 100, RY - 30, eAngle)

        let span = 0
        if (idxEnd >= idxStart) span = idxEnd - idxStart
        else span = (37 - idxStart) + idxEnd

        const isLarge = span > 18 ? 1 : 0

        return [
            `M ${pStartOuter.x} ${pStartOuter.y}`,
            `A ${RX} ${RY} 0 ${isLarge} 1 ${pEndOuter.x} ${pEndOuter.y}`,
            `L ${pEndInner.x} ${pEndInner.y}`,
            `A ${RX - 100} ${RY - 30} 0 ${isLarge} 0 ${pStartInner.x} ${pStartInner.y}`,
            'Z'
        ].join(' ')
    }

    // --- HANDLERS ---
    const handleZoneClick = (e, betFn) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        if (onBatchBets && betFn) {
            const bets = betFn()
            onBatchBets(bets)
        }
    }

    const handleManualChange = (e) => {
        const val = e.target.value
        setManualNumber(val)
        if (val === '') {
            onHoverNumbers([])
        } else {
            const num = parseInt(val)
            if (!isNaN(num) && num >= 0 && num <= 36) {
                const nums = getNeighbours(num, neighborCount).map(n => parseInt(n))
                onHoverNumbers(nums)
            }
        }
    }

    useEffect(() => {
        if (!manualNumber) return
        const num = parseInt(manualNumber)
        if (!isNaN(num)) {
            onHoverNumbers(getNeighbours(num, neighborCount).map(n => parseInt(n)))
        }
    }, [neighborCount])


    return (
        <div className="racetrack-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>

            {/* CONTROLS */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
                background: 'linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%)',
                padding: '8px 12px',
                borderRadius: '12px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(212, 175, 55, 0.05)',
                width: '100%',
                boxSizing: 'border-box',
                zIndex: 10
            }}>
                {/* ROW 1: ACTIONS & QUICK JEU-ZERO/NUCLEOS */}
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                    <button onClick={(e) => { e.stopPropagation(); onBatchBets && onBatchBets(getTiers()) }}
                        onMouseEnter={() => onHoverNumbers(TIERS_NUMBERS)} onMouseLeave={() => onHoverNumbers([])}
                        style={{ ...btnStyle, width: '22%', height: '24px', fontSize: '9px', fontWeight: 'bold', background: '#2c2c2c', borderColor: 'rgba(212,175,55,0.4)', color: '#fff' }}
                        title="Apostar Tercios del Cilindro (12 Números, 6 Fichas)">
                        TIERS
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onBatchBets && onBatchBets(getVoisins()) }}
                        onMouseEnter={() => onHoverNumbers(VOISINS_NUMBERS)} onMouseLeave={() => onHoverNumbers([])}
                        style={{ ...btnStyle, width: '25%', height: '24px', fontSize: '9px', fontWeight: 'bold', background: '#2c2c2c', borderColor: 'rgba(212,175,55,0.4)', color: '#fff' }}
                        title="Apostar Vecinos del Cero (17 Números, 9 Fichas)">
                        VOISINS
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onBatchBets && onBatchBets(getOrphelins()) }}
                        onMouseEnter={() => onHoverNumbers(ORPHELINS_NUMBERS)} onMouseLeave={() => onHoverNumbers([])}
                        style={{ ...btnStyle, width: '22%', height: '24px', fontSize: '9px', fontWeight: 'bold', background: '#2c2c2c', borderColor: 'rgba(212,175,55,0.4)', color: '#fff' }}
                        title="Apostar Huérfanos (8 Números, 5 Fichas)">
                        ORPH
                    </button>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        if (onBatchBets) {
                            onBatchBets(['SPLIT_0_3', 'SPLIT_12_15', 'SPLIT_32_35', '26'])
                        }
                    }}
                        onMouseEnter={() => onHoverNumbers([0, 3, 12, 15, 26, 32, 35])} onMouseLeave={() => onHoverNumbers([])}
                        style={{ ...btnStyle, width: '25%', height: '24px', fontSize: '9px', fontWeight: 'bold', background: 'linear-gradient(135deg, #3d2a04, #1c1301)', borderColor: '#d4af37', color: '#ffd700' }}
                        title="Apostar Juego Cero (7 Números, 4 Fichas • NÚCLEO 26)">
                        👑 JEU 0
                    </button>
                </div>

                {/* ROW 2: NEIGHBORS, OPTIMIZE, AND INPUT */}
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#aaa', fontSize: '9px', fontWeight: 'bold' }}>VECINOS:</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setNeighborCount(Math.max(1, neighborCount - 1)) }}
                            style={{ ...btnStyle, width: '18px', height: '18px', fontSize: '10px' }}
                        >-</button>
                        <span style={{ color: '#00f3ff', fontWeight: 'bold', fontSize: '11px', minWidth: '10px', textAlign: 'center', fontFamily: 'monospace' }}>{neighborCount}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setNeighborCount(Math.min(9, neighborCount + 1)) }}
                            style={{ ...btnStyle, width: '18px', height: '18px', fontSize: '10px' }}
                        >+</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#aaa', fontSize: '9px', fontWeight: 'bold' }}>PÍVOTE:</span>
                        <input
                            type="number"
                            min="0" max="36"
                            placeholder="#"
                            value={manualNumber}
                            onChange={handleManualChange}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '38px', height: '20px',
                                background: '#111', border: '1px solid rgba(212, 175, 55, 0.4)',
                                color: '#fff', borderRadius: '4px', textAlign: 'center',
                                fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace'
                            }}
                        />
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOptimized(!isOptimized) }}
                        style={{
                            ...btnStyle,
                            width: 'auto',
                            padding: '0 8px',
                            height: '20px',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            border: isOptimized ? '1px solid #00f3ff' : '1px solid #444',
                            background: isOptimized
                                ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.2) 0%, rgba(0, 100, 255, 0.25) 100%)'
                                : 'rgba(30, 30, 30, 0.7)',
                            color: isOptimized ? '#00f3ff' : '#aaa',
                            boxShadow: isOptimized ? '0 0 5px rgba(0, 243, 255, 0.3)' : 'none',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}
                        title="Consolidar apuestas de vecinos usando caballos y cuadros para máximo ahorro de fichas (Eficiencia)"
                    >
                        🎯 {isOptimized ? 'OPTIMIZADO' : 'ESTÁNDAR'}
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); setShowHelp(!showHelp) }}
                        style={{
                            ...btnStyle,
                            background: showHelp ? '#ffd700' : '#222',
                            borderColor: showHelp ? '#ffd700' : '#444',
                            color: showHelp ? '#000' : '#fff',
                            width: '18px',
                            height: '18px',
                            fontSize: '9px',
                            fontWeight: 'bold'
                        }}
                        title="Ayuda Racetrack"
                    >
                        ?
                    </button>
                </div>
            </div>

            {/* HELP OVERLAY (Justification Modal E7) */}
            {showHelp && <JustificationModal {...ELEMENT_DESCRIPTIONS[7]} onClose={() => setShowHelp(false)} />}

            {/* SVG TRACK */}
            <svg viewBox="0 0 600 220" className="racetrack-svg" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>

                {/* 1. Track Background */}
                <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="#222" strokeWidth="42" />

                {/* 2. ZONES (Clickable areas with HEATMAP Fills) */}

                {/* TIERS (5/8) - 27 to 33 */}
                <path
                    d={createSectorPath(27, 33)}
                    fill={getZoneFill(zoneHits.tiers, 0.324)}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    className="rt-zone"
                    onClick={(e) => handleZoneClick(e, getTiers)}
                    onMouseEnter={() => onHoverNumbers(TIERS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={300} y={150} className="rt-label" style={{ pointerEvents: 'none' }}>TIERS (#12)</text>


                {/* VOISINS (0/2/3) - 22 to 25 */}
                <path
                    d={createSectorPath(22, 25)}
                    fill={getZoneFill(zoneHits.voisins, 0.459)}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    className="rt-zone"
                    onClick={(e) => handleZoneClick(e, getVoisins)}
                    onMouseEnter={() => onHoverNumbers(VOISINS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={300} y={80} className="rt-label" style={{ pointerEvents: 'none' }}>VOISINS (#17)</text>


                {/* ORPHELINS (1) - 17 to 6 */}
                <path
                    d={createSectorPath(17, 6)}
                    fill={getZoneFill(zoneHits.orphelins, 0.216)}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    className="rt-zone"
                    onClick={(e) => handleZoneClick(e, getOrphelins)}
                    onMouseEnter={() => onHoverNumbers(ORPHELINS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={180} y={120} className="rt-label" style={{ pointerEvents: 'none' }}>ORPH (#8)</text>

                {/* ORPHELINS (2) - 1 to 9 */}
                <path
                    d={createSectorPath(1, 9)}
                    fill={getZoneFill(zoneHits.orphelins, 0.216)}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    className="rt-zone"
                    onClick={(e) => handleZoneClick(e, getOrphelins)}
                    onMouseEnter={() => onHoverNumbers(ORPHELINS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={420} y={120} className="rt-label" style={{ pointerEvents: 'none' }}>ORPH (#8)</text>


                {/* 3. NUMBERS LAYER (On Top with Dormancy Markers) */}
                {WHEEL_ORDER.map((num, i) => {
                    const angle = getAngle(i)
                    const p = getPoint(RX_NUM, RY_NUM, angle)
                    const isManualTarget = parseInt(manualNumber) === num
                    const isHighlighted = highlightedNumbers.includes(num)
                    const misses = recencyMap[num]

                    return (
                        <g key={num}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log(`DEBUG: Clicked Number ${num}`)
                                const neighbors = getNeighbours(num, neighborCount).map(Number)
                                let bets = neighbors.map(String)
                                if (isOptimized) {
                                    bets = optimizeBets(neighbors)
                                    console.log("DEBUG: Optimized Bets:", bets)
                                } else {
                                    console.log("DEBUG: Placing Bets (Standard):", bets)
                                }
                                if (onBatchBets) {
                                    onBatchBets(bets)
                                } else {
                                    console.error("DEBUG: onBatchBets is missing!")
                                }
                            }}
                            onMouseEnter={() => {
                                const nums = getNeighbours(num, neighborCount).map(n => parseInt(n))
                                onHoverNumbers(nums)
                            }}
                            onMouseLeave={() => onHoverNumbers([])}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Hit box for number */}
                            <circle cx={p.x} cy={p.y} r={13}
                                fill={isHighlighted ? "rgba(255, 215, 0, 0.4)" : getEvColor(evMap[num])}
                                stroke={isHighlighted ? "#ffd700" : (evMap[num] > 0 ? "#4caf50" : "none")}
                                strokeWidth={isHighlighted ? "2" : (evMap[num] > 0 ? "1" : "0")}
                            />

                            {/* Number text */}
                            <text
                                x={p.x}
                                y={p.y - 1}
                                className="rt-number"
                                style={{
                                    fontSize: '9px',
                                    fill: isHighlighted ? '#ffd700' : (isManualTarget ? '#00f3ff' : '#fff'),
                                    fontWeight: isHighlighted || isManualTarget ? 'bold' : 'normal',
                                    textShadow: isHighlighted ? '0 0 10px #ffd700' : (isManualTarget ? '0 0 10px #00f3ff' : 'none')
                                }}
                            >
                                {num}
                            </text>

                            {/* Recency count (dormancy indicator) */}
                            <text
                                x={p.x}
                                y={p.y + 8}
                                style={{
                                    fontSize: '6.5px',
                                    fill: getRecencyColor(misses),
                                    fontWeight: 'bold',
                                    textAnchor: 'middle',
                                    pointerEvents: 'none',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {misses}
                            </text>
                        </g>
                    )
                })}

            </svg>
        </div>
    )
}

const btnStyle = {
    background: '#333', color: '#fff', border: '1px solid #555',
    borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '20px', height: '20px'
}
