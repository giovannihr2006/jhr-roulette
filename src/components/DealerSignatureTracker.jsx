import React, { useState, useEffect, useRef } from 'react'
import { WHEEL_ORDER, getNeighbours } from '../utils/rouletteUtils'
import { soundManager } from '../utils/SoundManager'

export const DealerSignatureTracker = ({ onPredictionUpdate, disabled }) => {
    // Timestamps for cylinder zero passing reference
    const [cylTimes, setCylTimes] = useState([])
    // Timestamps for ball passing reference
    const [ballTimes, setBallTimes] = useState([])

    // Calculated periods
    const [cylPeriod, setCylPeriod] = useState(null)
    const [ballPeriod, setBallPeriod] = useState(null)

    // Physics calibration constants
    const [slope, setSlope] = useState(12) // C1
    const [phaseOffset, setPhaseOffset] = useState(18) // C2 (calibracion de fase)

    const [prediction, setPrediction] = useState(null)
    const [predictedSector, setPredictedSector] = useState([])

    // Keyboard event listener ref
    const containerRef = useRef(null)

    // Handle Cylinder Tap
    const handleCylTap = () => {
        if (disabled) return
        soundManager.playChip()
        const now = performance.now()
        setCylTimes(prev => {
            const next = [...prev, now].slice(-2) // Keep last 2 taps
            if (next.length === 2) {
                const period = (next[1] - next[0]) / 1000 // In seconds
                setCylPeriod(period)
            }
            return next
        })
    }

    // Handle Ball Tap
    const handleBallTap = () => {
        if (disabled) return
        soundManager.playChip()
        const now = performance.now()
        setBallTimes(prev => {
            const next = [...prev, now].slice(-2) // Keep last 2 taps
            if (next.length === 2) {
                const period = (next[1] - next[0]) / 1000 // In seconds
                setBallPeriod(period)
            }
            return next
        })
    }

    // Reset Taps
    const handleReset = () => {
        setCylTimes([])
        setBallTimes([])
        setCylPeriod(null)
        setBallPeriod(null)
        setPrediction(null)
        setPredictedSector([])
        if (onPredictionUpdate) {
            onPredictionUpdate(null, [])
        }
    }

    // Calculate prediction when periods update
    useEffect(() => {
        if (cylPeriod && ballPeriod) {
            // Ratio formula: offset = round(C1 * (T_cyl / T_ball) + C2) % 37
            const ratio = cylPeriod / ballPeriod
            let offset = Math.round(slope * ratio + phaseOffset) % 37
            if (offset < 0) offset += 37

            const predictedNum = WHEEL_ORDER[offset]
            const sector = getNeighbours(predictedNum, 2).map(Number) // 5 numbers total

            setPrediction(predictedNum)
            setPredictedSector(sector)

            if (onPredictionUpdate) {
                onPredictionUpdate(predictedNum, sector)
            }
        }
    }, [cylPeriod, ballPeriod, slope, phaseOffset])

    // Keyboard Shortcuts (C for Cyl, B for Ball)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (disabled) return
            if (e.key.toLowerCase() === 'c') {
                handleCylTap()
            } else if (e.key.toLowerCase() === 'b') {
                handleBallTap()
            } else if (e.key.toLowerCase() === 'r') {
                handleReset()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [disabled, cylTimes, ballTimes])

    return (
        <div
            ref={containerRef}
            className="dealer-sig-widget"
            style={{
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '15px',
                color: '#fff',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}
        >
            <div style={{
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#d4af37',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <span>🎯 CAPTURA FÍSICA (DEALER SIGNATURE)</span>
                <button
                    onClick={handleReset}
                    style={{
                        background: 'rgba(255, 23, 68, 0.2)',
                        border: '1px solid rgba(255, 23, 68, 0.5)',
                        borderRadius: '4px',
                        color: '#ff1744',
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    RESET [R]
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                {/* Cylinder Tap Button */}
                <button
                    onClick={handleCylTap}
                    style={{
                        flex: 1,
                        height: '48px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%)',
                        color: cylTimes.length === 1 ? '#00f3ff' : '#eee',
                        boxShadow: cylTimes.length === 1 ? '0 0 10px rgba(0, 243, 255, 0.2)' : 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                    }}
                >
                    <span style={{ fontSize: '0.75rem' }}>⚙️ CILINDRO [C]</span>
                    <span style={{ fontSize: '0.65rem', color: '#888' }}>
                        {cylPeriod ? `${cylPeriod.toFixed(2)}s` : (cylTimes.length === 1 ? 'Esperando...' : 'Marcar Cero')}
                    </span>
                </button>

                {/* Ball Tap Button */}
                <button
                    onClick={handleBallTap}
                    style={{
                        flex: 1,
                        height: '48px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%)',
                        color: ballTimes.length === 1 ? '#00f3ff' : '#eee',
                        boxShadow: ballTimes.length === 1 ? '0 0 10px rgba(0, 243, 255, 0.2)' : 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                    }}
                >
                    <span style={{ fontSize: '0.75rem' }}>⚪ BOLA [B]</span>
                    <span style={{ fontSize: '0.65rem', color: '#888' }}>
                        {ballPeriod ? `${ballPeriod.toFixed(2)}s` : (ballTimes.length === 1 ? 'Esperando...' : 'Marcar Cero')}
                    </span>
                </button>
            </div>

            {/* Calibration Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#aaa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Calibración Pendiente (C1): {slope}</span>
                    <input
                        type="range" min="5" max="25" value={slope}
                        onChange={(e) => setSlope(parseInt(e.target.value))}
                        style={{ width: '100px', accentColor: '#d4af37' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ajuste de Fase (C2): {phaseOffset}</span>
                    <input
                        type="range" min="0" max="36" value={phaseOffset}
                        onChange={(e) => setPhaseOffset(parseInt(e.target.value))}
                        style={{ width: '100px', accentColor: '#d4af37' }}
                    />
                </div>
            </div>

            {/* Prediction Output */}
            {prediction !== null && (
                <div style={{
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase' }}>Sector Físico Predicho</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffd700' }}>
                            {prediction}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>
                            (Raza: {predictedSector.join(', ')})
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
