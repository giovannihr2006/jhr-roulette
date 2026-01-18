import React, { useState, useEffect } from 'react'
import './Racetrack.css'
import { WHEEL_ORDER, getNeighbours } from '../utils/rouletteUtils'

// CONFIGURATION
const CX = 300
const CY = 120
const RX = 280 // Outer radius
const RY = 60
const RX_NUM = 240 // Radius for numbers
const RY_NUM = 50

export const Racetrack = ({ onBatchBets, onHoverNumbers, neighborCount = 2, setNeighborCount }) => {

    const [manualNumber, setManualNumber] = useState('')

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


    // --- HELPERS ---

    // Get angle in radians for a wheel index (0-36) where 0 (num 26) is near top?
    // WHEEL_ORDER starts with 0. 
    // We want 0 at top (-90 deg).
    // angle = i * (360/37) - 90
    // BUT we need to support manual rotation shift? The original code had logic for it.
    // Let's assume standard static view first unless requested.
    // The previous code had "rotationShift" based on manualNumber. Let's keep it for visual centering.

    let rotationShift = 0
    if (manualNumber !== '') {
        const num = parseInt(manualNumber)
        if (!isNaN(num)) {
            const index = WHEEL_ORDER.indexOf(num)
            if (index !== -1) {
                // Goal: Move index to top (-90 deg)
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

    // Generate Path for a range of numbers (Start -> End clockwise)
    const createSectorPath = (startNum, endNum) => {
        const idxStart = WHEEL_ORDER.indexOf(startNum)
        const idxEnd = WHEEL_ORDER.indexOf(endNum)

        const SLICE = (360 / 37) * (Math.PI / 180)
        const startCurrentAngle = getAngle(idxStart)
        const endCurrentAngle = getAngle(idxEnd)

        // Adjust to cover full slices (Start - half width, End + half width)
        const sAngle = startCurrentAngle - (SLICE / 2)
        const eAngle = endCurrentAngle + (SLICE / 2)

        const pStartOuter = getPoint(RX, RY, sAngle)
        const pEndOuter = getPoint(RX, RY, eAngle)
        const pStartInner = getPoint(RX - 100, RY - 30, sAngle)
        const pEndInner = getPoint(RX - 100, RY - 30, eAngle)

        // Calculate span for large-arc-flag
        // If idxEnd < idxStart (wrapping), span is (37 - start) + end
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

    // Effect to update highlighting if manual number changes
    useEffect(() => {
        if (!manualNumber) return
        const num = parseInt(manualNumber)
        if (!isNaN(num)) {
            onHoverNumbers(getNeighbours(num, neighborCount).map(n => parseInt(n)))
        }
    }, [neighborCount])


    return (
        <div className="racetrack-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* CONTROLS */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px',
                background: 'rgba(0,0,0,0.8)', padding: '5px 10px', borderRadius: '8px',
                border: '1px solid #333',
                zIndex: 10
            }}>
                {/* FAIL-SAFE BET BUTTONS */}
                <button onClick={(e) => { e.stopPropagation(); onBatchBets && onBatchBets(getTiers()) }}
                    onMouseEnter={() => onHoverNumbers(TIERS_NUMBERS)} onMouseLeave={() => onHoverNumbers([])}
                    style={{ ...btnStyle, width: 'auto', padding: '0 8px', fontSize: '10px', background: '#444', borderColor: '#888' }}>
                    TIERS
                </button>
                <button onClick={(e) => { e.stopPropagation(); onBatchBets && onBatchBets(getVoisins()) }}
                    onMouseEnter={() => onHoverNumbers(VOISINS_NUMBERS)} onMouseLeave={() => onHoverNumbers([])}
                    style={{ ...btnStyle, width: 'auto', padding: '0 8px', fontSize: '10px', background: '#444', borderColor: '#888' }}>
                    VOISINS
                </button>
                <button onClick={(e) => { e.stopPropagation(); onBatchBets && onBatchBets(getOrphelins()) }}
                    onMouseEnter={() => onHoverNumbers(ORPHELINS_NUMBERS)} onMouseLeave={() => onHoverNumbers([])}
                    style={{ ...btnStyle, width: 'auto', padding: '0 8px', fontSize: '10px', background: '#444', borderColor: '#888' }}>
                    ORPH
                </button>

                <div style={{ width: '1px', height: '15px', background: '#555', margin: '0 2px' }}></div>

                <span style={{ color: '#aaa', fontSize: '10px' }}>VECINOS:</span>
                <button
                    onClick={(e) => { e.stopPropagation(); setNeighborCount(Math.max(1, neighborCount - 1)) }}
                    style={btnStyle}
                >-</button>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{neighborCount}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); setNeighborCount(Math.min(9, neighborCount + 1)) }}
                    style={btnStyle}
                >+</button>

                <div style={{ width: '1px', height: '15px', background: '#555', margin: '0 5px' }}></div>

                <input
                    type="number"
                    min="0" max="36"
                    placeholder="#"
                    value={manualNumber}
                    onChange={handleManualChange}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '60px', height: '30px',
                        background: '#222', border: '1px solid #00f3ff',
                        color: '#fff', borderRadius: '4px', textAlign: 'center',
                        fontSize: '16px', fontWeight: 'bold'
                    }}
                />
            </div>

            {/* SVG TRACK */}
            <svg viewBox="0 0 600 220" className="racetrack-svg" style={{ width: '500px', overflow: 'visible' }}>

                {/* 1. Track Background */}
                <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="#222" strokeWidth="42" />

                {/* 2. ZONES (Clickable areas) */}

                {/* TIERS (5/8) - 27 to 33 */}
                <path
                    d={createSectorPath(27, 33)}
                    fill="rgba(255, 255, 255, 0.08)" // Visible fill for hit detection
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    className="rt-zone"
                    onClick={(e) => handleZoneClick(e, getTiers)}
                    onMouseEnter={() => onHoverNumbers(TIERS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={300} y={150} className="rt-label" style={{ pointerEvents: 'none' }}>TIERS</text>


                {/* VOISINS (0/2/3) - 22 to 25 */}
                <path
                    d={createSectorPath(22, 25)}
                    fill="rgba(255, 255, 255, 0.08)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    className="rt-zone"
                    onClick={(e) => handleZoneClick(e, getVoisins)}
                    onMouseEnter={() => onHoverNumbers(VOISINS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                {/* Voisins Label needs to be at top, so manual pos */}
                <text x={300} y={80} className="rt-label" style={{ pointerEvents: 'none' }}>VOISINS</text>


                {/* ORPHELINS (1) - 17 to 6 */}
                <path
                    d={createSectorPath(17, 6)}
                    fill="rgba(255, 255, 255, 0.08)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    className="rt-zone"
                    onClick={(e) => handleZoneClick(e, getOrphelins)}
                    onMouseEnter={() => onHoverNumbers(ORPHELINS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={180} y={120} className="rt-label" style={{ pointerEvents: 'none' }}>ORPH</text>

                {/* ORPHELINS (2) - 1 to 9 */}
                <path
                    d={createSectorPath(1, 9)}
                    fill="rgba(255, 255, 255, 0.08)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    className="rt-zone"
                    onClick={(e) => handleZoneClick(e, getOrphelins)}
                    onMouseEnter={() => onHoverNumbers(ORPHELINS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={420} y={120} className="rt-label" style={{ pointerEvents: 'none' }}>ORPH</text>


                {/* 3. NUMBERS LAYER (On Top) */}
                {WHEEL_ORDER.map((num, i) => {
                    const angle = getAngle(i)
                    const p = getPoint(RX_NUM, RY_NUM, angle)
                    const isManualTarget = parseInt(manualNumber) === num

                    return (
                        <g key={num}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                const bets = getNeighbours(num, neighborCount)
                                if (onBatchBets) {
                                    onBatchBets(bets)
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
                                fill={num === 23 ? "rgba(255, 0, 255, 0.5)" : "transparent"}
                                stroke={num === 23 ? "#ff00ff" : "none"}
                                strokeWidth="2"
                            />
                            <text
                                x={p.x}
                                y={p.y}
                                className="rt-number"
                                style={{
                                    fontSize: '11px',
                                    fill: isManualTarget || num === 23 ? '#00f3ff' : '#fff', // Keep 23 visible
                                    fontWeight: isManualTarget || num === 23 ? 'bold' : 'normal',
                                    textShadow: isManualTarget || num === 23 ? '0 0 10px #00f3ff' : 'none'
                                }}
                            >
                                {num}
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
