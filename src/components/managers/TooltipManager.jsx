
import React, { useState, useEffect } from 'react'
import { BettingBoard } from '../BettingBoard'
import { Z_LAYERS } from '../../config/Theme' // NEW

export const TooltipManager = ({
    // Lens Props
    showLens,
    // cursorPos, // Removed: Internal tracking
    viewMode3D,

    // Betting Props for Lens
    currentBets,
    handlePlaceBet,
    hoveredNumbers,
    setHoveredNumbers,
    chipSize, // needed?
    selectedChip,

    // Potential Win Props
    potentialWin,
    positions, // To fallback position if mouse lost
    formatValue // Received from parent
}) => {
    // INTERNAL MOUSE TRACKING (Performance Optimization)
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMove = (e) => {
            // Only update if we're actually going to render something to avoid spam?
            // Actually, React handles state diff, but we can check flags.
            if ((showLens && !viewMode3D && hoveredNumbers && hoveredNumbers.length > 0) || potentialWin > 0) {
                requestAnimationFrame(() => setCursorPos({ x: e.clientX, y: e.clientY }))
            }
        }
        window.addEventListener('mousemove', handleMove)
        return () => window.removeEventListener('mousemove', handleMove)
    }, [showLens, viewMode3D, hoveredNumbers, potentialWin])

    const isLensVisible = showLens && !viewMode3D && hoveredNumbers && hoveredNumbers.length > 0
    const isTooltipVisible = potentialWin > 0

    if (!isLensVisible && !isTooltipVisible) return null

    return (
        <>
            {/* LENS / COVERAGE OVERLAY (Unified) */}
            {isLensVisible && (
                <div style={{
                    position: 'fixed',
                    left: cursorPos.x + 20, // Offset right
                    top: cursorPos.y - 150, // Floating above/right
                    width: 'auto',
                    minWidth: '200px',
                    maxWidth: '300px',
                    background: 'rgba(0, 20, 30, 0.95)', // Deep Dark Blue/Black
                    border: '2px solid #00f3ff', // Cyan Neon
                    borderRadius: '15px',
                    boxShadow: '0 0 20px rgba(0, 243, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    pointerEvents: 'none',
                    zIndex: Z_LAYERS.LENS,
                    padding: '15px',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    {/* Header */}
                    <div style={{
                        fontSize: '0.9rem', color: '#00f3ff', textTransform: 'uppercase', letterSpacing: '2px',
                        borderBottom: '1px solid rgba(0, 243, 255, 0.3)', width: '100%', textAlign: 'center', paddingBottom: '5px'
                    }}>
                        Cobertura [{hoveredNumbers.length}]
                    </div>

                    {/* Numbers Grid */}
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px',
                        maxHeight: '150px', overflow: 'hidden' // Prevent massive growth
                    }}>
                        {hoveredNumbers.map((num, i) => (
                            <span key={i} style={{
                                color: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num) ? '#ff4444' : (num === 0 ? '#00e5ff' : 'white'),
                                fontSize: hoveredNumbers.length > 12 ? '1rem' : '1.4rem',
                                fontWeight: 'bold',
                                textShadow: '0 0 5px rgba(0,0,0,0.5)'
                            }}>
                                {num}
                            </span>
                        ))}
                    </div>

                    {/* Potential Win Integration (If visible) */}
                    {potentialWin > 0 && (
                        <div style={{
                            marginTop: '5px',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent)',
                            width: '100%',
                            textAlign: 'center',
                            borderTop: '1px solid rgba(255, 215, 0, 0.5)',
                            paddingTop: '5px'
                        }}>
                            <div style={{ fontSize: '0.8rem', color: '#ffd700', textTransform: 'uppercase' }}>Pago Est.</div>
                            <div style={{ fontSize: '1.4rem', color: '#ffd700', fontWeight: 'bold', textShadow: '0 0 10px rgba(255, 215, 0, 0.6)' }}>
                                {formatValue(potentialWin)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
