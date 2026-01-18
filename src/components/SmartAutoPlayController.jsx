/**
 * SmartAutoPlayController.jsx
 * Extracted from CasinoTable.jsx - Controls smart autoplay logic
 */
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { calculateRisk } from '../utils/BetValidator'
import { soundManager } from '../utils/SoundManager'

/**
 * Custom hook for Smart AutoPlay state management
 */
export const useSmartAutoPlay = ({
    balance,
    isSpinning,
    lastWinAmount,
    handleSpin,
    applyStrategy,
    formatValue,
    setOverlayMessage
}) => {
    const [smartAutoActive, setSmartAutoActive] = useState(false)
    const [smartAutoConfig, setSmartAutoConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('smartAutoConfig')
            return saved ? JSON.parse(saved) : {
                spinsRemaining: 0,
                strategyKey: null,
                multiplier: 1,
                maxBalance: 0,
                startBalance: 0,
                baseBets: [],
                chipValue: 1
            }
        } catch {
            return {
                spinsRemaining: 0,
                strategyKey: null,
                multiplier: 1,
                maxBalance: 0,
                startBalance: 0,
                baseBets: [],
                chipValue: 1
            }
        }
    })

    // Persist bot state
    useEffect(() => {
        localStorage.setItem('smartAutoConfig', JSON.stringify(smartAutoConfig))
    }, [smartAutoConfig])

    // Main autoplay effect - stop condition
    useEffect(() => {
        if (!smartAutoActive) return
        if (smartAutoConfig.spinsRemaining <= 0 && !isSpinning) {
            setSmartAutoActive(false)
            setOverlayMessage?.({ type: 'success', text: 'AUTOPLAY FINALIZADO', subtext: 'Ciclo completado' })
            return
        }
    }, [smartAutoActive, isSpinning, smartAutoConfig.spinsRemaining, setOverlayMessage])

    // Round completion trigger for next spin
    useEffect(() => {
        if (!smartAutoActive || isSpinning) return
        if (smartAutoConfig.spinsRemaining <= 0) return

        const { multiplier, maxBalance: trackMax, strategyKey, spinsRemaining, chipValue, baseBets } = smartAutoConfig
        let nextMult = multiplier
        let nextMax = trackMax
        let overlayData = null

        // Progression logic for specific strategies
        if (strategyKey === 'HYBRID_HEDGE_PRO' && baseBets?.length > 0) {
            const DR = balance - trackMax

            if (DR > 0) {
                // New record - reset
                nextMult = 1
                nextMax = balance
                soundManager.playRecord?.()
                overlayData = { type: 'success', text: 'RÉCORD SUPERADO', subtext: `DR: +${formatValue(DR)}`, detail: 'Reset a 1x' }
            } else {
                // Recovery logic
                const testBets = {}
                baseBets.forEach(id => {
                    const amount = (chipValue * multiplier)
                    testBets[id] = (testBets[id] || 0) + amount
                })
                const { maxWin } = calculateRisk(testBets)

                const potentialBalance = balance + maxWin
                const potentialDR = potentialBalance - trackMax

                if (potentialDR > 0) {
                    nextMult = multiplier
                    overlayData = { type: 'info', text: 'RANGO DE ATAQUE', subtext: `DR Pot: +${formatValue(potentialDR)}`, detail: `Manteniendo ${nextMult}x` }
                } else {
                    const wonLastRound = lastWinAmount > 0
                    if (wonLastRound) {
                        nextMult = multiplier
                        overlayData = { type: 'info', text: 'RECUPERANDO', subtext: `DR: ${formatValue(DR)}`, detail: `Ganaste - Manteniendo ${nextMult}x` }
                    } else {
                        nextMult = multiplier === 1 ? 2 : multiplier * 2
                        overlayData = { type: 'warning', text: 'ZONA NEGATIVA', subtext: `DR: ${formatValue(DR)}`, detail: `Doblando a ${nextMult}x` }
                    }
                }
            }
        }

        // Update config
        const nextConfig = {
            ...smartAutoConfig,
            multiplier: nextMult,
            maxBalance: nextMax,
            spinsRemaining: spinsRemaining - 1
        }

        setSmartAutoConfig(nextConfig)

        if (overlayData && setOverlayMessage) {
            setOverlayMessage(overlayData)
        }

        // Apply strategy with multiplier and trigger spin
        if (applyStrategy && strategyKey) {
            setTimeout(() => {
                applyStrategy(strategyKey, nextMult)
                setTimeout(() => handleSpin(), 500)
            }, overlayData ? 2000 : 500)
        } else {
            setTimeout(() => handleSpin(), 500)
        }

    }, [smartAutoActive, isSpinning, balance, lastWinAmount, smartAutoConfig, handleSpin, applyStrategy, formatValue, setOverlayMessage])

    const startAutoPlay = (strategyKey, spinCount, baseBets, chipValue) => {
        setSmartAutoConfig({
            spinsRemaining: spinCount,
            strategyKey,
            multiplier: 1,
            maxBalance: balance,
            startBalance: balance,
            baseBets: baseBets || [],
            chipValue: chipValue || 1
        })
        setSmartAutoActive(true)
    }

    const stopAutoPlay = () => {
        setSmartAutoActive(false)
        setSmartAutoConfig(prev => ({ ...prev, spinsRemaining: 0 }))
    }

    return {
        smartAutoActive,
        smartAutoConfig,
        startAutoPlay,
        stopAutoPlay,
        setSmartAutoActive,
        setSmartAutoConfig
    }
}

// PropTypes for the hook parameters
useSmartAutoPlay.propTypes = {
    balance: PropTypes.number.isRequired,
    isSpinning: PropTypes.bool.isRequired,
    lastWinAmount: PropTypes.number,
    handleSpin: PropTypes.func.isRequired,
    applyStrategy: PropTypes.func,
    formatValue: PropTypes.func,
    setOverlayMessage: PropTypes.func
}

/**
 * SmartAutoPlayPanel - UI Component for displaying autoplay status
 */
export const SmartAutoPlayPanel = ({
    isActive,
    spinsRemaining,
    multiplier,
    onStop,
    style
}) => {
    if (!isActive) return null

    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(102, 16, 242, 0.9)',
            border: '2px solid #fff',
            borderRadius: '8px',
            padding: '10px 15px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 5000,
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            ...style
        }}>
            <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>AUTOPLAY ACTIVO</div>
                <div style={{ fontSize: '1.2rem' }}>
                    {spinsRemaining} giros • {multiplier}x
                </div>
            </div>
            <button
                onClick={onStop}
                style={{
                    background: '#ff4444',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                ⏹ DETENER
            </button>
        </div>
    )
}

SmartAutoPlayPanel.propTypes = {
    isActive: PropTypes.bool.isRequired,
    spinsRemaining: PropTypes.number,
    multiplier: PropTypes.number,
    onStop: PropTypes.func.isRequired,
    style: PropTypes.object
}

SmartAutoPlayPanel.defaultProps = {
    spinsRemaining: 0,
    multiplier: 1,
    style: {}
}
