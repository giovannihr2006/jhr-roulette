import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import './RouletteWheel.css'
import { WHEEL_ORDER as NUMBERS, REDS } from '../utils/rouletteUtils'

import { LiveInputControl } from './LiveInputControl'

// Memoized RouletteWheel component for performance optimization
const RouletteWheelComponent = ({
    wheelRotation = 0,
    ballRotation = 0,
    showBall = false,
    highlightedNumbers = [],
    placedNumbers = [],
    size = 600,
    lastWin = null,
    isLiveMode = false,
    onManualWin,
    animState // NEW: Animation State Object
}) => {

    // Internal Animation Refs
    const wheelRef = React.useRef(null)
    const ballRef = React.useRef(null)
    const requestIdRef = React.useRef(null)
    const lastFrameTimeRef = React.useRef(0)

    // Ease-Out Quart Function (Matches CSS cubic-bezier(0.1, 0.8, 0.3, 1))
    // t is progress 0-1
    const easeOutQuart = (t) => {
        return 1 - Math.pow(1 - t, 4)
    }

    // ANIMATION LOOP
    React.useLayoutEffect(() => {
        const animate = () => {
            let currentWheelRot = wheelRotation
            let currentBallRot = ballRotation

            if (animState && animState.isSpinning) {
                const now = Date.now()
                const elapsed = now - animState.startTime
                const progress = Math.min(elapsed / animState.duration, 1)

                // If duration exceeded, we stick to target (safety)
                if (progress >= 1) {
                    currentWheelRot = animState.targetWheelRotation
                    currentBallRot = animState.targetBallRotation
                } else {
                    const eased = easeOutQuart(progress)

                    // Interpolate
                    currentWheelRot = animState.startWheelRotation + (animState.targetWheelRotation - animState.startWheelRotation) * eased
                    currentBallRot = animState.startBallRotation + (animState.targetBallRotation - animState.startBallRotation) * eased
                }

                requestIdRef.current = requestAnimationFrame(animate)
            } else {
                // Static State
                currentWheelRot = wheelRotation
                currentBallRot = ballRotation
            }

            // DIRECT DOM UPDATE (No React Render)
            if (wheelRef.current) {
                wheelRef.current.style.transform = `rotate(${currentWheelRot}deg)`
            }
            if (ballRef.current && showBall) {
                ballRef.current.style.transform = `rotate(${currentBallRot}deg)`
            }
        }

        requestIdRef.current = requestAnimationFrame(animate)

        return () => {
            if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current)
        }
    }, [animState, wheelRotation, ballRotation, showBall]) // Re-bind if core props change


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

        return NUMBERS.map((num, i) => {
            // Calculate start and end angles for the arc
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
            const isPlaced = placedNumbers.includes(num)

            if (isHovered) {
                color = '#ffd700' // Gold (Hover takes precedence)
            } else if (isPlaced) {
                // ILLUMINATE ACTIVE BETS: Bright Cyan
                color = '#00CED1'
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
                rotation: textAngleDeg + 90,
                isPlaced
            }
        })
    }, [highlightedNumbers, placedNumbers, center, radius, textRadius])

    return (
        <div className="wheel-container">
            {/* 1. THE WHEEL SVG */}
            <svg
                ref={wheelRef} // ATTACH REF
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                // REMOVED INLINE TRANSFORM HERE - Handled by RAF
                className="wheel-svg"
            >
                <defs>
                    {/* RED SECTOR GRADIENT (Glossy Enamel) */}
                    <radialGradient id="red-enamel" cx="0.5" cy="0.5" r="0.8">
                        <stop offset="60%" stopColor="#b31b1b" />
                        <stop offset="100%" stopColor="#660000" />
                    </radialGradient>
                    {/* BLACK SECTOR GRADIENT (Glossy Enamel) */}
                    <radialGradient id="black-enamel" cx="0.5" cy="0.5" r="0.8">
                        <stop offset="60%" stopColor="#222" />
                        <stop offset="100%" stopColor="#000" />
                    </radialGradient>
                    {/* GREEN ZERO GRADIENT */}
                    <radialGradient id="green-enamel" cx="0.5" cy="0.5" r="0.8">
                        <stop offset="60%" stopColor="#008f39" />
                        <stop offset="100%" stopColor="#004d1f" />
                    </radialGradient>
                    {/* GOLD METAL */}
                    <linearGradient id="gold-metal" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#bf953f" />
                        <stop offset="25%" stopColor="#fcf6ba" />
                        <stop offset="50%" stopColor="#b38728" />
                        <stop offset="75%" stopColor="#fbf5b7" />
                        <stop offset="100%" stopColor="#aa771c" />
                    </linearGradient>
                    {/* CHROME TURRET */}
                    <linearGradient id="chrome-turret" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#888" />
                        <stop offset="50%" stopColor="#eee" />
                        <stop offset="50.1%" stopColor="#666" />
                        <stop offset="100%" stopColor="#ccc" />
                    </linearGradient>
                </defs>

                {/* OUTER RIM (Wood/Metal) */}
                <circle cx={center} cy={center} r={center - (5 * scale)} fill="#3e1e12" stroke="url(#gold-metal)" strokeWidth={12 * scale} />
                <circle cx={center} cy={center} r={radius + (5 * scale)} fill="#050505" />

                {/* NUMBER SECTORS */}
                {sectors.map((sector, i) => {
                    let fill = sector.color
                    // Use Gradients for standard colors
                    if (sector.num === 0 && sector.color !== '#00CED1' && sector.color !== '#ffd700') fill = "url(#green-enamel)"
                    if (REDS.includes(sector.num) && sector.color !== '#00CED1' && sector.color !== '#ffd700') fill = "url(#red-enamel)"
                    if (!REDS.includes(sector.num) && sector.num !== 0 && sector.color !== '#00CED1' && sector.color !== '#ffd700') fill = "url(#black-enamel)"

                    return (
                        <g key={i}>
                            <path d={sector.path} fill={fill} stroke="rgba(212, 175, 55, 0.4)" strokeWidth={1 * scale} />
                            <text
                                x={sector.textX}
                                y={sector.textY}
                                fill="white"
                                fontSize={24 * scale}
                                fontWeight="bold"
                                fontFamily="Times New Roman, serif"
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(${sector.rotation}deg)` }}
                            >
                                {sector.num}
                            </text>
                        </g>
                    )
                })}

                {/* CENTER DOME (Turret) - MULTI-LAYERED */}
                <circle cx={center} cy={center} r={innerRadius} fill="url(#chrome-turret)" stroke="#111" strokeWidth={1} />
                <circle cx={center} cy={center} r={innerRadius * 0.7} fill="#3e1e12" stroke="url(#gold-metal)" strokeWidth={4 * scale} />
                <circle cx={center} cy={center} r={20 * scale} fill="url(#gold-metal)" />

                {/* WINNER DISPLAY (In Center) */}
                {isLiveMode ? (
                    <g transform={`rotate(${-wheelRotation}, ${center}, ${center})`}>
                        <foreignObject x={center - 60} y={center - 60} width={120} height={120}>
                            <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%' }}>
                                <LiveInputControl onSubmit={onManualWin} lastWin={lastWin} />
                            </div>
                        </foreignObject>
                    </g>
                ) : (
                    lastWin !== null ? (
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
                            <circle cx={center} cy={center} r={40 * scale} fill="#d4af37" />
                            <circle cx={center} cy={center} r={15 * scale} fill="#5c3a1e" />
                        </>
                    )
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
            {showBall && (
                <div
                    ref={ballRef} // ATTACH REF
                    className="ball-layer"
                    style={{
                        // transform: `rotate(${ballRotation}deg)`, // REMOVED INLINE
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                        zIndex: 10
                    }}
                >
                    <div
                        className="ivorine-ball"
                        style={{
                            width: `${24 * scale}px`,
                            height: `${24 * scale}px`,
                            background: 'radial-gradient(circle at 30% 30%, #fffff0, #e0e0d0)',
                            borderRadius: '50%',
                            boxShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) translateY(-${ballRadius}px)`
                        }}
                    />
                </div>
            )}
        </div>
    )
}

// PropTypes for type safety
RouletteWheelComponent.propTypes = {
    wheelRotation: PropTypes.number,
    ballRotation: PropTypes.number,
    showBall: PropTypes.bool,
    highlightedNumbers: PropTypes.arrayOf(PropTypes.number),
    placedNumbers: PropTypes.arrayOf(PropTypes.number),
    size: PropTypes.number,
    lastWin: PropTypes.number,
    isLiveMode: PropTypes.bool,
    onManualWin: PropTypes.func,
    animState: PropTypes.object
}

RouletteWheelComponent.defaultProps = {
    wheelRotation: 0,
    ballRotation: 0,
    showBall: false,
    highlightedNumbers: [],
    placedNumbers: [],
    size: 600,
    lastWin: null,
    isLiveMode: false,
    onManualWin: null,
    animState: null
}

// Export with React.memo for performance - prevents unnecessary re-renders
export const RouletteWheel = React.memo(RouletteWheelComponent)
