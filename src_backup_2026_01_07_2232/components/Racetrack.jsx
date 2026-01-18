import React, { useState } from 'react'
import './Racetrack.css'

// Standard European Wheel Order (Clockwise from 0)
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

export const Racetrack = ({ onBatchBets, onHoverNumbers }) => {

    // --- BET LOGIC DEFINITIONS ---

    // 1. Voisins du Zéro (Vecinos del Cero) - 9 Chips
    const getVoisins = () => [
        'TRIO_0_2_3', 'TRIO_0_2_3', // 2 chips
        'SPLIT_4_7',
        'SPLIT_12_15',
        'SPLIT_18_21',
        'SPLIT_19_22',
        'CORNER_25_26_28_29', 'CORNER_25_26_28_29', // 2 chips
        'SPLIT_32_35'
    ]
    const VOISINS_NUMBERS = [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25]


    // 2. Tiers du Cylindre (Tercio del Cilindro) - 6 Chips (Splits)
    const getTiers = () => [
        'SPLIT_5_8',
        'SPLIT_10_11',
        'SPLIT_13_16',
        'SPLIT_23_24',
        'SPLIT_27_30',
        'SPLIT_33_36'
    ]
    const TIERS_NUMBERS = [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33]


    // 3. Orphelins (Huérfanos) - 5 Chips
    const getOrphelins = () => [
        '1', // Straight
        'SPLIT_6_9',
        'SPLIT_14_17',
        'SPLIT_17_20',
        'SPLIT_31_34'
    ]
    const ORPHELINS_NUMBERS = [1, 20, 14, 31, 9, 17, 34, 6]


    // 4. Jeu 0 (Juego Cero) - 4 Chips
    const getJeuZero = () => [
        'SPLIT_0_3',
        'SPLIT_12_15',
        'SPLIT_32_35',
        '26'
    ]
    const ZERO_NUMBERS = [12, 35, 3, 26, 0, 32, 15]


    // --- SVG GEOMETRY CONSTANTS ---
    const CX = 300
    const CY = 100
    const RX = 280
    const RY = 60

    // --- NEIGHBOR LOGIC ---
    const [neighborCount, setNeighborCount] = useState(2)

    const getNeighbours = (number, count) => {
        const index = WHEEL_ORDER.indexOf(number)
        if (index === -1) return []

        let indices = []
        // Center
        indices.push(index)

        // Neighbors
        for (let i = 1; i <= count; i++) {
            indices.push((index + i) % 37) // Clockwise
            indices.push((index - i + 37) % 37) // Counter-Clockwise
        }

        return indices.map(i => WHEEL_ORDER[i].toString())
    }

    // Geometry for Numbers on Track
    const renderTrackNumbers = () => {
        const total = 37
        const rx = 240 // Slightly inside the track
        const ry = 50

        return WHEEL_ORDER.map((num, i) => {
            // Angle mapping: i=0 is number 0, at top (12 o'clock / -90 deg)
            const angle = ((i * (360 / total)) - 90) * (Math.PI / 180)
            const x = CX + rx * Math.cos(angle)
            const y = CY + ry * Math.sin(angle)

            return (
                <text
                    key={num}
                    x={x}
                    y={y}
                    className="rt-number"
                    style={{
                        fontSize: '12px',
                        fill: '#fff',
                        textAnchor: 'middle',
                        dominantBaseline: 'middle',
                        cursor: 'pointer'
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        const bets = getNeighbours(num, neighborCount)
                        onBatchBets(bets)
                    }}
                    onMouseEnter={() => {
                        const nums = getNeighbours(num, neighborCount).map(n => parseInt(n))
                        onHoverNumbers(nums)
                    }}
                    onMouseLeave={() => onHoverNumbers([])}
                >
                    {num}
                </text>
            )
        })
    }

    return (
        <div className="racetrack-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* NEIGHBOR SELECTOR */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px',
                background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px'
            }}>
                <span style={{ color: '#aaa', fontSize: '12px' }}>VECINOS:</span>
                <button onClick={() => setNeighborCount(Math.max(1, neighborCount - 1))} style={btnStyle}>-</button>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{neighborCount}</span>
                <button onClick={() => setNeighborCount(Math.min(9, neighborCount + 1))} style={btnStyle}>+</button>
            </div>

            <svg viewBox="0 0 600 220" className="racetrack-svg" style={{ width: '500px' }}>
                {/* TRACK BACKGROUND */}
                <ellipse cx={CX} cy={CY + 20} rx={RX} ry={RY} fill="transparent" stroke="#2a2a2a" strokeWidth="40" />

                {/* NUMBERS */}
                {renderTrackNumbers()}

                {/* ZONES (Overlay labels inside) */}
                {/* Tiers (Bottom) */}
                <path
                    d={`M ${CX - 150} ${CY + 40} Q ${CX} ${CY + 100} ${CX + 150} ${CY + 40} L ${CX + 150} ${CY + 80} Q ${CX} ${CY + 140} ${CX - 150} ${CY + 80} Z`}
                    className="rt-zone"
                    onClick={() => onBatchBets(getTiers())}
                    onMouseEnter={() => onHoverNumbers(TIERS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={CX} y={CY + 85} className="rt-label" style={{ fill: '#aaa', fontSize: '10px' }}>TIERS</text>

                {/* Voisins (Top) */}
                <path
                    d={`M ${CX - 180} ${CY} Q ${CX} ${CY - 60} ${CX + 180} ${CY} L ${CX + 180} ${CY - 40} Q ${CX} ${CY - 120} ${CX - 180} ${CY - 40} Z`}
                    className="rt-zone"
                    onClick={() => onBatchBets(getVoisins())}
                    onMouseEnter={() => onHoverNumbers(VOISINS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={CX} y={CY - 25} className="rt-label" style={{ fill: '#aaa', fontSize: '10px' }}>VOISINS</text>

                {/* Orphelins (Left & Right) */}
                <path
                    d={`M ${CX - 190} ${CY + 10} Q ${CX - 290} ${CY + 20} ${CX - 190} ${CY + 30} L ${CX - 220} ${CY + 60} Q ${CX - 330} ${CY + 20} ${CX - 220} ${CY - 20} Z`}
                    className="rt-zone"
                    onClick={() => onBatchBets(getOrphelins())}
                    onMouseEnter={() => onHoverNumbers(ORPHELINS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={CX - 240} y={CY + 25} className="rt-label" style={{ fontSize: '9px', fill: '#aaa' }}>ORPH</text>

                <path
                    d={`M ${CX + 190} ${CY + 10} Q ${CX + 290} ${CY + 20} ${CX + 190} ${CY + 30} L ${CX + 220} ${CY + 60} Q ${CX + 330} ${CY + 20} ${CX + 220} ${CY - 20} Z`}
                    className="rt-zone"
                    onClick={() => onBatchBets(getOrphelins())}
                    onMouseEnter={() => onHoverNumbers(ORPHELINS_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={CX + 240} y={CY + 25} className="rt-label" style={{ fontSize: '9px', fill: '#aaa' }}>ORPH</text>

                {/* Jeu 0 (Top Center overlay) */}
                <path
                    d={`M ${CX - 40} ${CY - 15} Q ${CX} ${CY - 30} ${CX + 40} ${CY - 15} L ${CX + 40} ${CY - 45} Q ${CX} ${CY - 60} ${CX - 40} ${CY - 45} Z`}
                    className="rt-zone"
                    style={{ stroke: 'none', fill: 'rgba(0,255,255,0.1)' }}
                    onClick={(e) => { e.stopPropagation(); onBatchBets(getJeuZero()) }}
                    onMouseEnter={() => onHoverNumbers(ZERO_NUMBERS)}
                    onMouseLeave={() => onHoverNumbers([])}
                />
                <text x={CX} y={CY - 30} className="rt-label" style={{ fontSize: '9px', fill: 'cyan' }}>ZERO</text>

            </svg>
        </div>
    )
}

const btnStyle = {
    background: '#333', color: '#fff', border: '1px solid #555',
    borderRadius: '4px', width: '20px', height: '20px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
}
