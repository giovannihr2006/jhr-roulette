import React, { useMemo } from 'react'
import './RouletteWheel.css'

// European Sequence (Clockwise from 0)
const NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export const RouletteWheel = ({ wheelRotation = 0, ballRotation = 0, showBall = false, highlightedNumbers = [], size = 600, lastWin = null }) => {

    // SVG CONFIG
    const center = size / 2
    // Scale internal dimensions relative to base 600
    const scale = size / 600
    const radius = 280 * scale
    const innerRadius = 180 * scale
    const textRadius = 240 * scale
    const ballRadius = 220 * scale

    // GEOMETRY GENERATOR
    const sectors = useMemo(() => {
        const angleStep = 360 / 37
        // const angleRad = (Math.PI * 2) / 37

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

            // Highlight Logic override
            if (highlightedNumbers.includes(num)) {
                color = '#ffd700' // Gold
            }

            // Text Position
            const textAngleDeg = (i * angleStep) - 90
            const tx = center + textRadius * Math.cos(Math.PI * textAngleDeg / 180)
            const ty = center + textRadius * Math.sin(Math.PI * textAngleDeg / 180)

            return {
                num,
                color,
                path: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`,
                textX: tx,
                textY: ty,
                rotation: textAngleDeg + 90 // Rotate text to readable orientation
            }
        })
    }, [highlightedNumbers, center, radius, textRadius])

    return (
        <div className="wheel-container">
            {/* 1. THE WHEEL SVG */}
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ transform: `rotate(${wheelRotation}deg)` }}
                className="wheel-svg"
            >
                {/* OUTER RIM (Wood/Metal) */}
                <circle cx={center} cy={center} r={center - (5 * scale)} fill="#5c3a1e" stroke="#d4af37" strokeWidth={8 * scale} />
                <circle cx={center} cy={center} r={radius + (5 * scale)} fill="#0a0a0a" />

                {/* NUMBER SECTORS */}
                {sectors.map((sector, i) => (
                    <g key={i}>
                        <path d={sector.path} fill={sector.color} stroke="#d4af37" strokeWidth={1 * scale} />
                        <text
                            x={sector.textX}
                            y={sector.textY}
                            fill="white"
                            fontSize={24 * scale}
                            fontWeight="bold"
                            fontFamily="Arial"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(${sector.rotation}deg)` }}
                        >
                            {sector.num}
                        </text>
                    </g>
                ))}

                {/* CENTER DOME (Turret) */}
                <circle cx={center} cy={center} r={innerRadius} fill="#111" stroke="#d4af37" strokeWidth={4 * scale} />

                {/* WINNER DISPLAY (In Center) */}
                {lastWin !== null ? (
                    <g transform={`rotate(${-wheelRotation}, ${center}, ${center})`}>
                        <circle cx={center} cy={center} r={70 * scale} fill="rgba(0,0,0,0.9)" stroke={
                            lastWin === 0 ? '#0f0' : (REDS.includes(lastWin) ? '#f00' : '#fff')
                        } strokeWidth={4 * scale} />
                        <text
                            x={center}
                            y={center}
                            dy={25 * scale}
                            textAnchor="middle"
                            fill={lastWin === 0 ? '#0f0' : (REDS.includes(lastWin) ? '#f44' : '#fff')}
                            fontSize={90 * scale}
                            fontWeight="bold"
                            style={{ textShadow: '0 0 15px rgba(0,0,0,1)' }}
                        >
                            {lastWin}
                        </text>
                    </g>
                ) : (
                    <>
                        {/* Decorative Crossbars (Only if no winner) */}
                        <circle cx={center} cy={center} r={40 * scale} fill="#d4af37" />
                        <circle cx={center} cy={center} r={15 * scale} fill="#5c3a1e" />
                    </>
                )}

                {/* Shine Effect Overlay */}
                <defs>
                    <radialGradient id="shine">
                        <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <circle cx={center} cy={center} r={radius} fill="url(#shine)" opacity="0.1" pointerEvents="none" />
            </svg>

            {/* 2. THE BALL LAYER */}
            {/* Renders only when spin starts (showBall=true) */}
            {showBall && (
                <div
                    className="ball-layer"
                    style={{
                        transform: `rotate(${ballRotation}deg)`,
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                        // Ensure it's above the SVG
                        zIndex: 10
                    }}
                >
                    {/* The Ball: Situated at top (0 deg) but translated down to track radius */}
                    <div
                        className="ivorine-ball"
                        style={{
                            width: `${16 * scale}px`,
                            height: `${16 * scale}px`,
                            background: 'radial-gradient(circle at 30% 30%, #fffff0, #e0e0d0)',
                            borderRadius: '50%',
                            boxShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            // Move to track radius (Move UP (negative Y) to match 0 degrees at 12 o'clock)
                            transform: `translate(-50%, -50%) translateY(-${ballRadius}px)`
                        }}
                    />
                </div>
            )}
        </div>
    )
}
