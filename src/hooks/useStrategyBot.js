import { useState, useEffect } from 'react'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { useToastStore } from '../logic/ToastStore'
import { BETTING_STRATEGIES } from '../config/Strategies'
import { soundManager } from '../utils/SoundManager'
import { dealer } from '../utils/DealerVoice'
import { calculateRisk } from '../utils/BetValidator'
import { formatValue } from '../utils/CurrencyUtils' // Assumed util or inline

/**
 * Hook to manage Betting Strategies and Smart Autoplay Bot.
 * Encapsulates the logic for:
 * - Applying strategies (Hybrid Hedge, etc.)
 * - Persisting Bot Configuration
 * - Executing Smart Autoplay loops with progression logic
 */
export const useStrategyBot = (
    balance,
    placeBet,
    handleClear,
    setCurrentBets,
    setBetHistory,
    handleSpin,
    isSpinning,
    roundHistory,
    lastWinAmount,
    selectedChip,
    setSelectedChip
) => {
    const addToast = useToastStore(state => state.addToast)

    // --- SMART AUTOPLAY STATE ---
    const [smartAutoActive, setSmartAutoActive] = useState(false)
    const [ghostModeActive, setGhostModeActive] = useState(false) // NEW: Espera Fantasma
    const [smartAutoConfig, setSmartAutoConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('smartAutoConfig')
            return saved ? JSON.parse(saved) : {
                spinsRemaining: 0,
                strategyKey: null,
                multiplier: 1,
                maxBalance: 0,
                startBalance: 0
            }
        } catch {
            return {
                spinsRemaining: 0,
                strategyKey: null,
                multiplier: 1,
                maxBalance: 0,
                startBalance: 0
            }
        }
    })

    // PERSIST BOT STATE
    useEffect(() => {
        localStorage.setItem('smartAutoConfig', JSON.stringify(smartAutoConfig))
    }, [smartAutoConfig])

    // --- HANDLE APPLY STRATEGY ---
    const handleApplyStrategy = (stratKey, spinCount = 0) => {
        const strat = BETTING_STRATEGIES[stratKey]
        if (!strat) return

        let chipToUse = selectedChip

        // FORCE 1 CHIP (100 COP) for Hybrid Hedge Pro (User Requirement)
        if (stratKey === 'HYBRID_HEDGE_PRO') {
            chipToUse = 1
            setSelectedChip(1) // Update UI for visual consistency
        }

        // 1. Initial Bet Placement (Manual Batch/Inline Logic)
        const totalAmount = strat.bets.length * chipToUse
        const result = placeBet(totalAmount, 'BATCH') // Deduct balance

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') addToast("Saldo insuficiente", 'error')
            return
        }

        soundManager.playChip()

        const newBatch = {}
        strat.bets.forEach(id => newBatch[id] = chipToUse)

        setCurrentBets(prev => {
            const next = { ...prev }
            strat.bets.forEach(id => {
                next[id] = (next[id] || 0) + chipToUse
            })
            return next
        })

        setBetHistory(prev => [...prev, { bets: newBatch, totalCost: totalAmount }])

        addToast(`Estrategia aplicada: ${strat.label}`, 'success')

        // 2. Setup Auto-Play if requested
        if (spinCount > 0) {
            if (stratKey !== 'HYBRID_HEDGE_PRO') {
                addToast("Modo Automático solo disponible para Híbrido Pro (por ahora)", "warning")
            }

            setSmartAutoConfig({
                spinsRemaining: spinCount,
                strategyKey: stratKey,
                multiplier: 1,
                maxBalance: balance, // Capture current balance as max for tracking
                startBalance: balance,
                baseBets: strat.bets,
                chipValue: chipToUse // Store the enforced chip value
            })
            setSmartAutoActive(true)

            addToast("Bot Armado: ¡Gira la primera vez para iniciar!", "info")
        }
    }

    // --- SMART AUTOPLAY EFFECT ---
    // Detect Round Finish (Balance Updated) and Trigger Next Spin
    useEffect(() => {
        if (!smartAutoActive || isSpinning || smartAutoConfig.spinsRemaining <= 0) {
            if (smartAutoActive && smartAutoConfig.spinsRemaining <= 0 && !isSpinning) {
                setSmartAutoActive(false)
                addToast("Sesión Automática Finalizada", "info")
            }
            return
        }

        // This effect runs when roundHistory changes (new round finished)
        // AND we are active and not spinning.

        // Safety check: Ensure we actually finished a round recently?
        // Relying on dependency array [roundHistory] passed from parent.

        const { multiplier, maxBalance: trackMax, strategyKey, spinsRemaining, chipValue } = smartAutoConfig
        let nextMult = multiplier
        let nextMax = trackMax

        // PROGRESSION LOGIC (Only for Hybrid Hedge Pro)
        let overlayData = null

        if (strategyKey === 'HYBRID_HEDGE_PRO') {
            if (ghostModeActive) {
                const wonLastRound = lastWinAmount > 0
                if (wonLastRound) {
                    nextMult = 1
                    setGhostModeActive(false)
                    soundManager.playRecord()
                    addToast("¡Victoria Virtual! Saliendo de Espera Fantasma (Reset a 1x)", "success")
                } else {
                    nextMult = 8
                    addToast("Pérdida Virtual. Continuando en Espera Fantasma (Multiplicador 8x congelado)...", "info")
                }
            } else {
                const DR = balance - trackMax

                if (DR > 0) {
                    // NEW RECORD -> RESET
                    nextMult = 1
                    nextMax = balance
                    soundManager.playRecord()
                } else {
                    // RECOVERY LOGIC
                    // 1. Calculate Potential DR (Nx)
                    const testBets = {}
                    smartAutoConfig.baseBets.forEach(id => {
                        const amount = (chipValue * multiplier)
                        testBets[id] = (testBets[id] || 0) + amount
                    })
                    const { maxWin } = calculateRisk(testBets) // maxWin is NET Profit
                    const potentialBalance = balance + maxWin
                    const potentialDR = potentialBalance - trackMax

                    // 2. Decision Matrix
                    if (potentialDR > 0) {
                        // POTENTIAL GREEN -> MAINTAIN
                        nextMult = multiplier
                    } else {
                        // POTENTIAL RED -> CHECK LAST RESULT
                        const wonLastRound = lastWinAmount > 0
                        if (wonLastRound) {
                            // WIN (But still Deeply Negative) -> MAINTAIN
                            nextMult = multiplier
                        } else {
                            // LOSS (And Negative) -> DOUBLE
                            if (multiplier === 1) nextMult = 2
                            else nextMult = multiplier * 2
                        }
                    }

                    if (nextMult >= 8) {
                        nextMult = 8
                        setGhostModeActive(true)
                        addToast("⚠️ Umbral de Estrés (8x) superado. Entrando en ESPERA FANTASMA.", "warning")
                    }
                }
            }
        }

        // Update Config
        const nextConfig = {
            ...smartAutoConfig,
            multiplier: nextMult,
            maxBalance: nextMax,
            spinsRemaining: spinsRemaining - 1
        }
        setSmartAutoConfig(nextConfig)

        if (spinsRemaining > 1) {
            setTimeout(() => {
                // CLEAR AND RE-BET
                handleClear() // Clear board

                // RE-BET WITH MULTIPLIER
                const bets = smartAutoConfig.baseBets
                const batch = {}
                let totalCost = 0

                bets.forEach(id => {
                    const amount = (chipValue * nextMult)
                    batch[id] = (batch[id] || 0) + amount
                    totalCost += amount
                })

                // DEDUCT FUNDS
                let result = { success: true }
                if (!ghostModeActive) {
                    result = placeBet(totalCost, 'BATCH')
                } else {
                    addToast("Giro Virtual en Espera Fantasma (Fichas sin costo real)", "info")
                }

                if (!result.success) {
                    setSmartAutoActive(false)
                    if (result.error === 'INSUFFICIENT_FUNDS') addToast("Saldo Insuficiente - Autoplay Detenido", "error")
                    return
                }

                // UI UPDATE
                setCurrentBets(batch)
                setBetHistory(prev => [...prev, { bets: batch, totalCost: totalCost }])

                soundManager.playChip()

                // SPIN
                handleSpin()

            }, 200) // FAST MODE
        } else {
            setSmartAutoActive(false)
            addToast("Meta de Giros Alcanzada", "info")
        }

    }, [roundHistory]) // Triggers only when round history updates (Spin finish)

    return {
        smartAutoActive,
        setSmartAutoActive,
        smartAutoConfig,
        handleApplyStrategy
    }
}
