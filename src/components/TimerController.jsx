/**
 * TimerController.jsx
 * Extracted from CasinoTable.jsx - Timer countdown logic for timed betting
 */
import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

/**
 * Custom hook for timer management
 */
export const useTimerController = ({
    isSpinning,
    handleSpin,
    defaultDuration = 15
}) => {
    const [timerMode, setTimerMode] = useState(false)
    const [timerDuration, setTimerDuration] = useState(defaultDuration)
    const [timeLeft, setTimeLeft] = useState(defaultDuration)

    // Timer countdown effect
    useEffect(() => {
        let interval = null

        if (timerMode && !isSpinning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else if (timeLeft === 0 && timerMode && !isSpinning) {
            // Time's up - trigger spin
            handleSpin()
        }

        return () => clearInterval(interval)
    }, [timerMode, isSpinning, timeLeft, handleSpin])

    // Reset timer on spin end
    useEffect(() => {
        if (!isSpinning && timerMode) {
            setTimeLeft(timerDuration)
        }
    }, [isSpinning, timerMode, timerDuration])

    const toggleTimer = useCallback(() => {
        setTimerMode(prev => !prev)
        if (!timerMode) {
            setTimeLeft(timerDuration)
        }
    }, [timerMode, timerDuration])

    const updateDuration = useCallback((newDuration) => {
        const duration = Math.max(5, Math.min(120, newDuration))
        setTimerDuration(duration)
        setTimeLeft(duration)
    }, [])

    return {
        timerMode,
        timerDuration,
        timeLeft,
        toggleTimer,
        setTimerMode,
        setTimerDuration,
        setTimeLeft,
        updateDuration
    }
}

/**
 * TimerDisplay - UI Component for showing countdown
 */
export const TimerDisplay = ({
    timerMode,
    timeLeft,
    timerDuration,
    onToggle,
    onDurationChange,
    isSpinning,
    style
}) => {
    const progress = timerMode ? (timeLeft / timerDuration) * 100 : 100
    const isUrgent = timeLeft <= 5 && timerMode && timeLeft > 0

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(0,0,0,0.7)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: timerMode ? '2px solid #ff9800' : '1px solid #666',
            ...style
        }}>
            {/* Timer Toggle */}
            <button
                onClick={onToggle}
                disabled={isSpinning}
                style={{
                    background: timerMode ? '#ff9800' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: isSpinning ? 'not-allowed' : 'pointer',
                    opacity: isSpinning ? 0.5 : 1
                }}
            >
                {timerMode ? '⏱ ON' : '⏱ OFF'}
            </button>

            {/* Duration Input */}
            <input
                type="number"
                min="5"
                max="120"
                value={timerDuration}
                onChange={(e) => onDurationChange(parseInt(e.target.value) || 15)}
                disabled={isSpinning || timerMode}
                style={{
                    width: '50px',
                    background: '#222',
                    border: '1px solid #666',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: 'white',
                    textAlign: 'center'
                }}
            />
            <span style={{ color: '#aaa', fontSize: '0.9rem' }}>seg</span>

            {/* Progress Bar */}
            {timerMode && (
                <div style={{
                    width: '100px',
                    height: '8px',
                    background: '#333',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: isUrgent ? '#ff4444' : '#4caf50',
                        transition: 'width 0.3s ease, background 0.3s ease'
                    }} />
                </div>
            )}

            {/* Time Display */}
            {timerMode && (
                <span style={{
                    color: isUrgent ? '#ff4444' : '#fff',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    minWidth: '40px',
                    textAlign: 'center',
                    animation: isUrgent ? 'pulse 0.5s infinite' : 'none'
                }}>
                    {timeLeft}s
                </span>
            )}
        </div>
    )
}

TimerDisplay.propTypes = {
    timerMode: PropTypes.bool.isRequired,
    timeLeft: PropTypes.number.isRequired,
    timerDuration: PropTypes.number.isRequired,
    onToggle: PropTypes.func.isRequired,
    onDurationChange: PropTypes.func.isRequired,
    isSpinning: PropTypes.bool,
    style: PropTypes.object
}

TimerDisplay.defaultProps = {
    isSpinning: false,
    style: {}
}
