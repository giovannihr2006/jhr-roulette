import React, { useMemo, useState } from 'react'
import './RouletteWheel.css'
import { useFinancialStore } from '../logic/FinancialSimulator'

// European Sequence (Clockwise from 0)
const NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

import { LiveInputControl } from './LiveInputControl'
import { ForensicBadge } from './ForensicBadge'

export const RouletteWheel = ({ wheelRotation = 0, ballRotation = 0, showBall = false, highlightedNumbers = [], placedNumbers = [], bestPayoutNumbers = [], size = 600, lastWin = null, isLiveMode = false, onManualWin, isTurboMode = false, isSpinning = false }) => {
    const [showJustification, setShowJustification] = useState(false)
    const history = useFinancialStore(state => state.numberHistory || [])

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

    // SVG CONFIG
    // SVG CONFIG - INTERNAL RESOLUTION FIXED TO 600
    const baseSize = 600
    const center = baseSize / 2
    const scale = 1 // Fixed scale for internal logic
    const radius = 280 * scale
    const innerRadius = 180 * scale
    const textRadius = 240 * scale
    const currentBallTrackRadius = isSpinning ? 280 * scale : 235 * scale
    const currentBallSize = isSpinning ? 16 * scale : 12 * scale

    // GEOMETRY GENERATOR
    const sectors = useMemo(() => {
        const angleStep = 360 / 37

        return NUMBERS.map((num, i) => {
            // Calculate start and end angles for the arc
            // Correcting orientation: -90deg so 0 is at top
            const startAngleDeg = (i * angleStep) - 90 - (angleStep / 2)
            const endAngleDeg = startAngleDeg + angleStep

            // Polar to Cartesian for Arc
            const x1 = center + radius * Math.cos(Math.PI * startAngleDeg / 180)
            const y1 = center + radius * Math.sin(Math.PI * startAngleDeg / 180)
            const x2 = center + radius * Math.cos(Math.PI * endAngleDeg / 180)
            const y2 = center + radius * Math.sin(Math.PI * endAngleDeg / 180)

            // Color Logic
            let color = '#111' // Black
            if (num === 0) color = '#008f39' // Green
            else if (REDS.includes(num)) color = '#b31b1b' // Red

            // Highlight Logic
            const isHovered = highlightedNumbers.includes(num)
            const isBestPayout = bestPayoutNumbers.includes(num)
            const isPlaced = placedNumbers.includes(num)

            if (isHovered) {
                color = '#ffd700'
            } else if (isBestPayout) {
                color = "url(#cyan-best-enamel)"
            } else if (isPlaced) {
                color = "url(#cyan-placed-enamel)"
            }

            // Text Position (Outer radius)
            const textAngleDeg = (i * angleStep) - 90
            const tx = center + textRadius * Math.cos(Math.PI * textAngleDeg / 180)
            const ty = center + textRadius * Math.sin(Math.PI * textAngleDeg / 180)

            // Recency position (Inner radius pocket)
            const rxText = center + 205 * Math.cos(Math.PI * textAngleDeg / 180)
            const ryText = center + 205 * Math.sin(Math.PI * textAngleDeg / 180)

            return {
                num,
                color,
                path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`,
                textX: tx,
                textY: ty,
                recencyX: rxText,
                recencyY: ryText,
                rotation: textAngleDeg + 90, // Rotate text to readable orientation
                isPlaced, // Keep track for maybe extra stroke?
                isBestPayout // NEW
            }
        })
    }, [highlightedNumbers, placedNumbers, bestPayoutNumbers, center, radius, textRadius])

    return (
        <div className="wheel-container" style={{ width: 'calc(100% - 70px)', height: 'calc(100% - 70px)', margin: '35px', position: 'relative' }}>
            {/* Header Removed - Moved to Parent */}
            {/* 1. THE WHEEL SVG */}
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 600 600"
                style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: `transform ${isTurboMode ? '1s' : '12s'} cubic-bezier(0.1, 0.8, 0.3, 1)`,
                    willChange: 'transform'
                }}
                className="wheel-svg"
            >
                <defs>
                    {/* RED SECTOR GRADIENT (Deep Velvet) */}
                    <radialGradient id="red-enamel" cx="0.5" cy="0.5" r="0.8">
                        <stop offset="40%" stopColor="#d32f2f" />
                        <stop offset="90%" stopColor="#8b0000" />
                        <stop offset="100%" stopColor="#500" />
                    </radialGradient>
                    {/* BLACK SECTOR GRADIENT (Deep Onyx) */}
                    <radialGradient id="black-enamel" cx="0.5" cy="0.5" r="0.8">
                        <stop offset="40%" stopColor="#2c2c2c" />
                        <stop offset="90%" stopColor="#111" />
                        <stop offset="100%" stopColor="#000" />
                    </radialGradient>
                    {/* GREEN ZERO GRADIENT */}
                    <radialGradient id="green-enamel" cx="0.5" cy="0.5" r="0.8">
                        <stop offset="40%" stopColor="#2e7d32" />
                        <stop offset="90%" stopColor="#1b5e20" />
                    </radialGradient>
                    {/* RICH GOLD METAL (Polished) */}
                    <linearGradient id="gold-metal" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#bf953f" />
                        <stop offset="20%" stopColor="#fcf6ba" />
                        <stop offset="40%" stopColor="#b38728" />
                        <stop offset="60%" stopColor="#fbf5b7" />
                        <stop offset="80%" stopColor="#aa771c" />
                        <stop offset="100%" stopColor="#bf953f" />
                    </linearGradient>
                    {/* DARK MAHOGANY WOOD */}
                    <radialGradient id="mahogany-wood" cx="0.5" cy="0.5" r="0.7" fx="0.4" fy="0.4">
                        <stop offset="0%" stopColor="#5d4037" />
                        <stop offset="60%" stopColor="#3e2723" />
                        <stop offset="100%" stopColor="#1b100d" />
                    </radialGradient>
                    {/* TURRET SHADOW */}
                    <radialGradient id="turret-shadow">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="80%" stopColor="rgba(0,0,0,0.5)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
                    </radialGradient>

                    {/* CYAN PLACED ENAMEL */}
                    <radialGradient id="cyan-placed-enamel" cx="0.5" cy="0.5" r="0.8">
                        <stop offset="0%" stopColor="rgba(0, 206, 209, 0.9)" />
                        <stop offset="70%" stopColor="rgba(0, 139, 139, 0.8)" />
                        <stop offset="100%" stopColor="rgba(0, 70, 70, 0.9)" />
                    </radialGradient>
                    {/* CYAN BEST ENAMEL */}
                    <radialGradient id="cyan-best-enamel" cx="0.5" cy="0.5" r="0.8">
                        <stop offset="0%" stopColor="rgba(0, 255, 255, 1)" />
                        <stop offset="50%" stopColor="rgba(0, 200, 200, 0.9)" />
                        <stop offset="100%" stopColor="rgba(0, 100, 100, 1)" />
                    </radialGradient>

                    {/* PREMIUM 3D IVORINE BALL GRADIENT */}
                    <radialGradient id="ball-3d" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="40%" stopColor="#fffff0" />
                        <stop offset="85%" stopColor="#e5e5d5" />
                        <stop offset="100%" stopColor="#b5b5a5" />
                    </radialGradient>

                    {/* SHADOW FOR 3D BALL */}
                    <filter id="ball-shadow-svg" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="3" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.6"/>
                    </filter>
                </defs>

                {/* 1. OUTER CHASSIS (Dark Base) */}
                <circle cx={center} cy={center} r={center - 2} fill="#1a1a1a" stroke="url(#gold-metal)" strokeWidth={4} />

                {/* 2. GOLD BEZEL & BALL TRACK */}
                <circle cx={center} cy={center} r={center - 15} fill="url(#mahogany-wood)" /> {/* Wood Track Background */}
                <circle cx={center} cy={center} r={radius + 10} fill="none" stroke="url(#gold-metal)" strokeWidth={6} /> {/* Outer Ring Separator */}

                {/* 3. NUMBER RING BACKGROUND */}
                <circle cx={center} cy={center} r={radius} fill="#000" />

                {/* 4. NUMBER SECTORS */}
                <g>
                    {sectors.map((sector, i) => {
                        let fill = sector.color
                        if (sector.num === 0 && !sector.isPlaced && !sector.isBestPayout && sector.color !== '#ffd700') fill = "url(#green-enamel)"
                        if (REDS.includes(sector.num) && !sector.isPlaced && !sector.isBestPayout && sector.color !== '#ffd700') fill = "url(#red-enamel)"
                        if (!REDS.includes(sector.num) && sector.num !== 0 && !sector.isPlaced && !sector.isBestPayout && sector.color !== '#ffd700') fill = "url(#black-enamel)"

                        return (
                            <g key={i}>
                                <path
                                    d={sector.path}
                                    fill={fill}
                                    stroke="url(#gold-metal)"
                                    strokeWidth={1} // Gold separators
                                    className={sector.isBestPayout ? 'best-payout-sector' : ''}
                                />
                                <text
                                    x={sector.textX}
                                    y={sector.textY}
                                    fill={sector.color === '#ffd700' ? '#000' : '#fff'} // Contrast text
                                    fontSize={22 * scale}
                                    fontWeight="bold"
                                    fontFamily="'Cinzel', 'Times New Roman', serif" // More classic font
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    style={{
                                        transformBox: 'fill-box',
                                        transformOrigin: 'center',
                                        transform: `rotate(${sector.rotation}deg)`,
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {sector.num}
                                </text>

                                {/* Pocket Dormancy Indicator */}
                                <text
                                    x={sector.recencyX}
                                    y={sector.recencyY}
                                    fill={getRecencyColor(recencyMap[sector.num])}
                                    fontSize={10 * scale}
                                    fontWeight="bold"
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    style={{
                                        transformBox: 'fill-box',
                                        transformOrigin: 'center',
                                        transform: `rotate(${sector.rotation}deg)`,
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                        opacity: 0.85
                                    }}
                                >
                                    {recencyMap[sector.num]}
                                </text>
                            </g>
                        )
                    })}
                </g>

                {/* 5. CENTER BOWL (The "Wood" look) */}
                {/* Inner Bezel Separator */}
                <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="url(#gold-metal)" strokeWidth={8} />

                {/* The Concave Bowl */}
                <circle cx={center} cy={center} r={innerRadius - 4} fill="url(#mahogany-wood)" />
                <circle cx={center} cy={center} r={innerRadius - 4} fill="url(#turret-shadow)" opacity="0.6" /> {/* Inner Shadow for depth */}

                {/* 6. CENTRAL TURRET (Gold) */}
                <g>
                    {/* Turret Base Ring */}
                    <circle cx={center} cy={center} r={80 * scale} fill="none" stroke="url(#gold-metal)" strokeWidth={2} opacity="0.5" />
                    <circle cx={center} cy={center} r={70 * scale} fill="none" stroke="url(#gold-metal)" strokeWidth={2} opacity="0.3" />

                    {/* Turret Hub */}
                    <circle cx={center} cy={center} r={45 * scale} fill="url(#gold-metal)" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))' }} />
                    <circle cx={center} cy={center} r={15 * scale} fill="#3e2723" /> {/* Top screw */}
                </g>

                {/* 7. WINNER DISPLAY (Floating Overlay - Maintaining Logic) */}
                {isLiveMode ? (
                    <g transform={`rotate(${-wheelRotation}, ${center}, ${center})`}>
                        <foreignObject x={center - 60} y={center - 60} width={120} height={120}>
                            <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%' }}>
                                <foreignObject x={0} y={0} width={120} height={120} style={{ pointerEvents: 'auto' }}>
                                    <LiveInputControl onSubmit={onManualWin} lastWin={lastWin} />
                                </foreignObject>
                            </div>
                        </foreignObject>
                    </g>
                ) : (
                    lastWin !== null && (
                        <g transform={`rotate(${-wheelRotation}, ${center}, ${center})`} style={{ transition: 'all 0.5s ease-out' }}>
                            {/* Glassy Background for numbers */}
                            <circle cx={center} cy={center} r={65 * scale} fill="rgba(0,0,0,0.85)" stroke="url(#gold-metal)" strokeWidth={4 * scale}
                                style={{ boxShadow: '0 0 20px rgba(0,0,0,1)' }} />

                            {/* The Number */}
                            <text
                                x={center}
                                y={center}
                                dy={22 * scale}
                                textAnchor="middle"
                                fill={lastWin === 0 ? '#4f4' : (REDS.includes(lastWin) ? '#ff4444' : '#fff')}
                                fontSize={80 * scale}
                                fontWeight="bold"
                                fontFamily="'Roboto Condensed', sans-serif"
                                style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                            >
                                {lastWin}
                            </text>

                            {/* Color Indicator Ring (Thin) */}
                            <circle cx={center} cy={center} r={68 * scale} fill="none" stroke={
                                lastWin === 0 ? '#4f4' : (REDS.includes(lastWin) ? '#f00' : '#fff')
                            } strokeWidth={2} opacity="0.5" />
                        </g>
                    )
                )}

                {/* 8. REFLECTIONS / GLOSS OVERLAY */}
                <circle cx={center} cy={center} r={radius} fill="url(#turret-shadow)" opacity="0.1" pointerEvents="none" />

                {/* 9. PREMIUM SVG 3D BALL */}
                {showBall && (
                    <g
                        transform={`rotate(${ballRotation - wheelRotation}, ${center}, ${center})`}
                        style={{
                            transition: `transform ${isTurboMode ? '1s' : '12s'} cubic-bezier(0.1, 0.8, 0.3, 1)`,
                            willChange: 'transform'
                        }}
                    >
                        <circle
                            cx={center}
                            cy={center - currentBallTrackRadius}
                            r={currentBallSize}
                            fill="url(#ball-3d)"
                            filter="url(#ball-shadow-svg)"
                            style={{
                                transition: 'cy 2s cubic-bezier(0.1, 0.8, 0.3, 1), r 2s ease-out'
                            }}
                        />
                    </g>
                )}
            </svg>
        </div>
    )
}
