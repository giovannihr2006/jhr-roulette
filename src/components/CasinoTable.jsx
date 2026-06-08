
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { RouletteWheel } from './RouletteWheel'
import { BettingBoard } from './BettingBoard'
import { ActiveBetsPanel } from './ActiveBetsPanel' // Moved Import
import WinEffects from './WinEffects'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { soundManager } from '../utils/SoundManager'
import { dealer } from '../utils/DealerVoice'
import './CasinoTable.css'
import { Draggable } from './Draggable'
import { LayoutHelpModal } from './LayoutHelpModal'
import { HistoryModal } from './HistoryModal'
import { HelpModal } from './HelpModal'
import { useCurrency } from '../hooks/useCurrency'
import { useRouletteGame } from '../hooks/useRouletteGame'
import { useRouletteLogic } from '../hooks/useRouletteLogic' // NEW
import { useDragLayout } from '../hooks/useDragLayout' // NEW
import { Roulette3D } from './Roulette3D'
import { ReloadModal } from './ReloadModal'
import { StrategiesModal } from './StrategiesModal'
import { RubricModal } from './RubricModal'
import { ProjectionsModal } from './ProjectionsModal'
import { StrategyManualModal } from './StrategyManualModal'
import { AudioSettingsModal } from './AudioSettingsModal'
import { Racetrack } from './Racetrack'
import { GameOverlayManager } from './managers/GameOverlayManager'
import { TooltipManager } from './managers/TooltipManager' // NEW
import { SessionClock } from './SessionClock'
import { StatisticsPanel } from './StatisticsPanel'
import { HistoryPanel } from './HistoryPanel'
import { TopOpportunityWidget } from './TopOpportunityWidget'
import ProjectionsPanel from './ProjectionsPanel'
import SpinCounter from './SpinCounter'
import { DetailedHistoryModal } from './DetailedHistoryModal'
import { DetailedHistoryWidget } from './DetailedHistoryWidget'
import { TimeBar } from './TimeBar' // NEW: TimeBar Import
import { DollarIcon, MethodsIcon, ScannerIcon } from './ControlIcons' // NEW: Draggable Icons
import { SystemEfficiencyModal } from './SystemEfficiencyModal'
import MethodsTable from './MethodsTable'
import InternalScannerModal from './InternalScannerModal'

import { getNeighbours, WHEEL_ORDER } from '../utils/rouletteUtils'



import { LIMITS, getBetType } from '../config/GameLimits'
import { Z_LAYERS } from '../config/Theme' // NEW
import { calculateRisk } from '../utils/BetValidator'
import { useToastStore } from '../logic/ToastStore'
import {
    calculateWinnings,
    calculateCoverage,
    calculateMaxPotentialWin,
    getCoveredNumbers
} from '../logic/RouletteUtils'


// Sequence for index lookup
// CONSTANTS moved to useRouletteGame


export const CasinoTable = () => {
    const fileInputRef = useRef(null)
    // Rotation State
    // Game State (Refactored to Hook)
    // const isSpinning... removed
    const [autoPlayCount, setAutoPlayCount] = useState(0)

    // Potentials
    const [potentialWin, setPotentialWin] = useState(0)
    const [showReloadModal, setShowReloadModal] = useState(false)
    const [showStrategiesModal, setShowStrategiesModal] = useState(false)
    const [showProjectionsModal, setShowProjectionsModal] = useState(false)
    const [showManualModal, setShowManualModal] = useState(false)
    const [showEfficiency, setShowEfficiency] = useState(false) // Toggle Cost/Number View

    // --- TIME BAR STATE ---
    const [timerMode, setTimerMode] = useState(false)
    const [timerDuration, setTimerDuration] = useState(15) // Default 15s
    const [timeLeft, setTimeLeft] = useState(15)

    // --- FULLSCREEN STATE ---
    const [isFullscreen, setIsFullscreen] = useState(false)
    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    // --- LIVE MODE STATE ---
    const [isLiveMode, setIsLiveMode] = useState(false)

    const handleManualWin = (number) => {
        const totalWinnings = calculateWinnings(number, currentBets)
        const roundBets = { ...currentBets }

        if (totalWinnings > 0) {
            soundManager.playWin(totalWinnings)
        }

        setLastWin(number)
        resolveRound(totalWinnings, number, roundBets)
        setCurrentBets({})
        setBetHistory([])
    }





    // TRACKING
    const [startTime] = useState(Date.now())
    // maxBalance moved to standard declaration below

    // SMART AUTOPLAY STATE
    // SMART AUTOPLAY STATE
    const [smartAutoActive, setSmartAutoActive] = useState(false)
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

    // Currency & View State
    const { exchangeRates, viewCurrency, setViewCurrency } = useCurrency()

    // Currency Exchange Rates (Base: 1 Logic Unit = 1 USD)
    // Currency Exchange Rates
    // CHIP_RATES: Preserves the user's preferred chip logic (1, 2, 5 USD)
    const CHIP_RATES = {
        COL: 100,
        USA: 1,
        EUR: 0.92
    }

    // DISPLAY_RATES: Realistic conversion for Balance, Wins, Projections
    // Logic: 100 COP (Base*100) / 3750 = ~0.0266 USD
    const DISPLAY_RATES = {
        COL: 100,
        USA: 0.0266666,
        EUR: 0.0245333
    }

    const formatValue = (creditValue) => {
        if (creditValue === undefined || creditValue === null || isNaN(creditValue)) return "$0"

        const val = creditValue * (DISPLAY_RATES[viewCurrency] || 1) // Uses Real Conversion

        if (viewCurrency === 'COL') return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
        if (viewCurrency === 'USA') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val) // Show cents for USD
        if (viewCurrency === 'EUR') return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(val)
        return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    }

    const formatChipValue = (creditValue) => {
        const val = creditValue * (CHIP_RATES[viewCurrency] || 1) // Uses Chip Logic
        if (viewCurrency === 'COL') return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
        if (viewCurrency === 'USA') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
    }

    // Store Selectors
    const gameMode = useFinancialStore(state => state.gameMode)
    const realCapital = useFinancialStore(state => state.realCapital)
    const demoCapital = useFinancialStore(state => state.demoCapital)
    const reloadCapital = useFinancialStore(state => state.reloadCapital)
    const hardReset = useFinancialStore(state => state.hardReset)
    const initialCapital = useFinancialStore(state => state.initialCapital) || 0
    const currentRoundBet = useFinancialStore(state => state.currentRoundBet)
    const sessionStart = useFinancialStore(state => state.sessionStart)
    const roundHistory = useFinancialStore(state => state.roundHistory || []) // Fixed: Added missing selector

    // Local Ticker removed (performance optimization)


    // Derived Balance (Safer than store getter)
    const balance = gameMode === 'REAL' ? realCapital : demoCapital

    // --- MAX BALANCE TRACKING ---
    const [maxBalance, setMaxBalance] = useState(balance)
    const [isNewRecord, setIsNewRecord] = useState(false)
    const [showRecordModal, setShowRecordModal] = useState(false)

    // Handle Enter/Escape key to close record modal
    useEffect(() => {
        if (!showRecordModal) return

        const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
                setShowRecordModal(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showRecordModal])

    useEffect(() => {
        if (balance > maxBalance) {
            setMaxBalance(balance)
            setIsNewRecord(true)

            // Only show blocking modal if NOT in auto mode
            if (!smartAutoActive) {
                setShowRecordModal(true)
                setTimeout(() => dealer.tipMinBets(), 1500)
            } else {
                // In auto mode, just small notification
                // soundManager.playRecord() is already called in the AutoPlay effect logic? 
                // Wait, it enters here FIRST because balance updates first.
                // Let's keep sound here or there?
                // AutoPlay logic also detects record and plays sound. 
                // Let's rely on AutoPlay logic for sound to avoid double play.
                // Actually, AutoPlay logic calls soundManager.playRecord().
            }

            // Still play sound here if manual? 
            if (!smartAutoActive) soundManager.playRecord()

            setTimeout(() => setIsNewRecord(false), 3000)
        }
    }, [balance, maxBalance])
    // ----------------------------


    // Actions & State
    const placeBet = useFinancialStore(state => state.placeBet)
    const refundBet = useFinancialStore(state => state.refundBet)
    const resolveRound = useFinancialStore(state => state.resolveRound)
    const transactionLog = useFinancialStore(state => state.transactionLog || [])
    const withdraw = useFinancialStore(state => state.withdraw)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    // const [showBuyInModal, setShowBuyInModal] = useState(true) // Removed dead state
    const [showHistoryModal, setShowHistoryModal] = useState(false)

    // NEW: Auto-Show Bankruptcy Modal if broke and no active bets

    const [showResetModal, setShowResetModal] = useState(false) // New State for Reset Modal
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [buyInAmount, setBuyInAmount] = useState('') // New State for Buy In Input

    // Reset amount when opening modal
    useEffect(() => {
        if (showWithdrawModal) setWithdrawAmount('')
    }, [showWithdrawModal])

    const handleReloadSubmit = () => {
        const val = parseFloat(buyInAmount);
        if (val >= 0) {
            const rate = DISPLAY_RATES[viewCurrency] || 1
            const logicUnits = val / rate
            reloadCapital(logicUnits) // Convert Currency -> Units
            setShowBankruptcy(false)
            setBuyInAmount('')
            addToast(`Recarga Exitosa: +${formatValue(logicUnits)}`, "success")
            soundManager.playChip()
        } else {
            addToast("Por favor ingrese un monto válido", "error")
        }
    }

    const handleWithdrawSubmit = () => {
        const amount = Number(withdrawAmount)
        if (!amount || amount <= 0) {
            addToast("Por favor ingresa un monto válido", "error")
            return
        }

        const rate = DISPLAY_RATES[viewCurrency] || 1
        const amountBase = amount / rate

        const result = withdraw(amountBase)

        if (result.success) {
            setShowWithdrawModal(false)
            addToast(`Retiro Exitoso: -${formatValue(amountBase)}`, "success")
            soundManager.playChip()
        } else {
            console.error("Disturbing failure:", result.error)
            if (result.error === 'INSUFFICIENT_FUNDS') addToast("Saldo insuficiente para este retiro", "error")
            else addToast("Error al procesar el retiro", "error")
        }
    }

    // Force Clean Slate on Logic Unit Mount if empty history (Solves Ghost State)
    // Force Clean Slate logic removed to support Persistence
    // useEffect(() => { ... }, [])

    // Betting State
    const [currentBets, setCurrentBets] = useState({})
    // Initialize lastBets from localStorage if available
    const [lastBets, setLastBets] = useState(() => {
        try {
            const saved = localStorage.getItem('casinoLastBets')
            return saved ? JSON.parse(saved) : {}
        } catch {
            return {}
        }
    })

    // Save lastBets to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('casinoLastBets', JSON.stringify(lastBets))
    }, [lastBets])
    const [betHistory, setBetHistory] = useState([]) // For Undo
    const numberHistory = useFinancialStore(state => state.numberHistory || [])


    const [selectedChip, setSelectedChip] = useState(100)
    // Wheel Highlight Sync
    const [hoveredNumbers, setHoveredNumbers] = useState([])

    const [showActiveBets, setShowActiveBets] = useState(true) // Dynamic Table Toggle

    // Mouse Tracking for Tooltip
    // MOVED TO TooltipManager for Performance
    // const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const handleMouseMove = () => { } // No-op to avoid breaking prop references temporarily

    // MODALS
    const [showHistory, setShowHistory] = useState(false)
    const [showBankruptcy, setShowBankruptcy] = useState(false)
    const [statusOverlay, setStatusOverlay] = useState(null) // Giant Overlay State

    // --- HOOK INTEGRATION ---
    const {
        isSpinning,
        handleSpin,
        physicsState,
        wheelRotation,
        ballRotation,
        ballResetKey,
        showBall,
        lastWin,
        setLastWin,
        lastWinAmount,
        animState
    } = useRouletteGame({
        currentBets,
        setCurrentBets,
        setLastBets,
        setBetHistory,
        resolveRound
    })

    const {
        handlePlaceBet,
        handleBatchBets,
        handleRepeat,
        handleDouble,
        handleUndo,
        handleClear,
        handleNeighborBet // NEW
    } = useRouletteLogic({
        currentBets,
        setCurrentBets,
        lastBets,
        setLastBets,
        setBetHistory,
        betHistory,
        isSpinning,
        gameMode,
        currentRoundBet
    })

    // --- BETTING WRAPPERS (To Trigger Reload Modal) ---
    const onBatchBet = (ids, val) => {
        const result = handleBatchBets(ids, val)
        if (result && result.error === 'INSUFFICIENT_FUNDS') {
            setShowReloadModal(true)
        }
    }

    const onPlaceBet = (id) => {
        const result = handlePlaceBet(id, selectedChip)
        if (result && result.error === 'INSUFFICIENT_FUNDS') {
            setShowReloadModal(true)
        }
    }

    // --- TIME BAR LOGIC (Moved here to access hooks) ---
    useEffect(() => {
        let interval = null

        if (timerMode && !isSpinning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // TIME UP!
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else if (timeLeft === 0 && timerMode && !isSpinning) {
            // RELEASE THE KRAKEN (SPIN)
            handleSpin()
        }

        return () => clearInterval(interval)
    }, [timerMode, isSpinning, timeLeft, handleSpin])

    // RESET TIMER ON SPIN END
    useEffect(() => {
        if (!isSpinning && timerMode) {
            setTimeLeft(timerDuration)
        }
    }, [isSpinning, timerMode, timerDuration])

    const {
        positions,
        onUpdatePos,
        isEditMode,
        setIsEditMode,
        resetLayout,
        handleSaveLayout,
        handleLoadLayout,
        showLayoutHelp,
        setShowLayoutHelp
    } = useDragLayout()

    // NEW: Auto-Show Bankruptcy Modal if broke and no active bets
    useEffect(() => {
        // Debounce slightly to allow state settlements? No, direct check is fine.
        // If balance is 0, no bets on table, and not spinning -> Show Reload
        // This allows "All-In" (balance 0 but bets > 0) to proceed without modal.
        if (balance <= 0 && Object.keys(currentBets).length === 0 && !isSpinning) {
            setShowBankruptcy(true)
        } else if (balance > 0) {
            setShowBankruptcy(false) // Auto-close if balance restored
        }
    }, [balance, currentBets, isSpinning])

    // 3D View Mode
    const [viewMode3D, setViewMode3D] = useState(false)

    // MAGNIFYING LENS STATE
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
    const handleLensMouseMove = (e) => {
        setCursorPos({ x: e.clientX, y: e.clientY })
    }

    // Modals State
    const [showRubricModal, setShowRubricModal] = useState(false)
    const [showAudioSettingsModal, setShowAudioSettingsModal] = useState(false)
    const [showHelpModal, setShowHelpModal] = useState(false)
    const [showScannerModal, setShowScannerModal] = useState(false) // NEW: Scanner
    const [showDetailedHistory, setShowDetailedHistory] = useState(false)


    const addToast = useToastStore(state => state.addToast)

    const formatBalance = (creditValue) => {
        if (creditValue === undefined || creditValue === null || isNaN(creditValue)) return "$0.00"
        return formatValue(creditValue)
    }

    // Physics Debug State (Safe Init)
    const [physicsDebug, setPhysicsDebug] = useState(false)

    // EFFICIENCY MODALS STATE
    const [showEfficiencyModal, setShowEfficiencyModal] = useState(false)
    const [showMethodsTable, setShowMethodsTable] = useState(false)


    // --- AUTOPLAY LOGIC ---
    useEffect(() => {
        if (!isSpinning && autoPlayCount > 0) {
            const timer = setTimeout(() => {
                // 1. Repeat Bets
                if (Object.keys(currentBets).length === 0 && Object.keys(lastBets).length > 0) {
                    handleRepeat()
                } else if (Object.keys(currentBets).length === 0) {
                    // No bets to repeat and empty table? Stop.
                    addToast("Autoplay detenido: No hay apuestas para repetir", "error")
                    setAutoPlayCount(0)
                    return
                }

                // 2. Spin
                // Ensure we call spin only if valid
                handleSpin()

                // 3. Decrement
                setAutoPlayCount(prev => prev - 1)

            }, 2000) // 2 seconds between spins
            return () => clearTimeout(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSpinning, autoPlayCount])



    // DEBUG OVERLAY




    // --- POTENTIAL WIN LOGIC ---
    const [bestPayout, setBestPayout] = useState({ amount: 0, numbers: [] })

    useEffect(() => {
        if (Object.keys(currentBets).length > 0) {
            const { maxWin, bestNumbers } = calculateMaxPotentialWin(currentBets)
            setBestPayout({ amount: maxWin, numbers: bestNumbers })

            // Still allow hover override if hovering a specific number? 
            // Or just show Max Win permanently as requested?
            // "PAGO POTENCIAL SIEMPRE VISIBLE... INDICANDO EL NUMERO QUE MAS PAGA"

            // Check hover for interactive feedback
            // Check hover for interactive feedback
            if (hoveredNumbers.length > 0) {
                // Modified: Iterate through all hovered numbers to find the Max Potential Win
                // This enables tooltips for Outside Bets (Red, Black, Columns) and Splits/Corners
                let maxWinInZone = 0
                hoveredNumbers.forEach(num => {
                    const w = calculateWinnings(num, currentBets)
                    if (w > maxWinInZone) maxWinInZone = w
                })
                setPotentialWin(maxWinInZone)
            } else {
                setPotentialWin(0) // Reset hover
            }
        } else {
            setBestPayout({ amount: 0, numbers: [] })
            setPotentialWin(0)
        }
    }, [currentBets, hoveredNumbers])

    // handlePlaceBet, handleBatchBets moved to useRouletteLogic hook


    // NEW: NEIGHBOR MODE LOGIC (Globals)
    const [neighborCount, setNeighborCount] = useState(2)



    // NEW: Handle Strategy Application
    const handleApplyStrategy = (stratKey, spinCount = 0) => {
        const strat = BETTING_STRATEGIES[stratKey]
        if (!strat) return

        let chipToUse = selectedChip

        // FORCE 1 CHIP (100 COP) for Hybrid Hedge Pro (User Requirement)
        if (stratKey === 'HYBRID_HEDGE_PRO') {
            chipToUse = 1
            setSelectedChip(1) // Update UI for visual consistency
        }

        // 1. Initial Bet Placement (Manual Batch Construction to bypass async selectedChip)
        // handleBatchBets uses 'selectedChip' state which might be stale.
        // We replicate handleBatchBets logic here with 'chipToUse'

        // --- INLINED BATCH LOGIC START ---
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
        // --- INLINED BATCH LOGIC END ---

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
                maxBalance: balance,
                startBalance: balance,
                baseBets: strat.bets,
                chipValue: chipToUse // Store the enforced chip value
            })
            setSmartAutoActive(true)

            addToast("Bot Armado: ¡Gira la primera vez para iniciar!", "info")
            // Removed auto-spin. User triggers first spin manually.
        }
    }

    // --- SMART AUTOPLAY EFFECT ---
    useEffect(() => {
        if (!smartAutoActive || isSpinning || smartAutoConfig.spinsRemaining <= 0) {
            if (smartAutoActive && smartAutoConfig.spinsRemaining <= 0 && !isSpinning) {
                setSmartAutoActive(false)
                addToast("Sesión Automática Finalizada", "info")
            }
            return
        }
        // Detect Round Finish (Balance Updated)
        // We need to run logic ONLY exactly when a round finishes. 
        // Using roundHistory length change is safest.
    }, [smartAutoActive, isSpinning, smartAutoConfig.spinsRemaining])

    // We need a dedicated effect for Round Completion to trigger Next Spin
    useEffect(() => {
        if (!smartAutoActive) return

        const { multiplier, maxBalance: trackMax, startBalance, strategyKey, spinsRemaining, chipValue } = smartAutoConfig
        let nextMult = multiplier
        let nextMax = trackMax

        // PROGRESSION LOGIC (Only for Hybrid Hedge Pro)
        let overlayData = null

        if (strategyKey === 'HYBRID_HEDGE_PRO') {
            const DR = balance - trackMax

            if (DR > 0) {
                // NEW RECORD -> RESET
                nextMult = 1
                nextMax = balance
                soundManager.playRecord()
                overlayData = { type: 'success', text: `RÉCORD SUPERADO`, subtext: `DR: +${formatValue(DR)}`, detail: 'Reset a 1x' }
            } else {
                // RECOVERY LOGIC - ALIGNED WITH "POTENTIAL DR" UI
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
                    // POTENTIAL GREEN -> MAINTAIN (Don't Double)
                    // "Si es positivo no doblas" (matches UI Green)
                    nextMult = multiplier
                    overlayData = { type: 'info', text: 'RANGO DE ATAQUE', subtext: `DR Pot: +${formatValue(potentialDR)}`, detail: `Manteniendo ${nextMult}x` }
                } else {
                    // POTENTIAL RED -> CHECK LAST RESULT
                    const wonLastRound = lastWinAmount > 0

                    if (wonLastRound) {
                        // WIN (But still Deeply Negative) -> MAINTAIN
                        nextMult = multiplier
                        overlayData = { type: 'info', text: 'RECUPERANDO', subtext: `DR: ${formatValue(DR)}`, detail: `Ganaste - Manteniendo ${nextMult}x` }
                    } else {
                        // LOSS (And Negative) -> DOUBLE
                        if (multiplier === 1) nextMult = 2
                        else nextMult = multiplier * 2
                        overlayData = { type: 'warning', text: 'ZONA NEGATIVA', subtext: `DR: ${formatValue(DR)}`, detail: `Doblando a ${nextMult}x` }
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

        if (spinsRemaining > 1) { // 1 because we just finished one, so if >1 remaining, we queue next
            setTimeout(() => {
                // CLEAR AND RE-BET
                handleClear() // Clear board

                // Re-Calculate with Multiplier using STORED CHIP VALUE
                // Strategy is array of IDs. We need to respect weight.
                // handleBatchBets adds chips.
                // We need to loop strat bets and apply (chip * multiplier)

                // Simpler: Just call handleBatchBets 'multiplier' times? No, expensive.
                // Better: Create a weighted map
                const bets = smartAutoConfig.baseBets
                const batch = {}
                let totalCost = 0 // Calculate Total Cost

                bets.forEach(id => {
                    const amount = (chipValue * nextMult)
                    batch[id] = (batch[id] || 0) + amount
                    totalCost += amount
                })

                // DEDUCT FUNDS
                const result = placeBet(totalCost, 'BATCH')
                if (!result.success) {
                    setSmartAutoActive(false)
                    if (result.error === 'INSUFFICIENT_FUNDS') addToast("Saldo Insuficiente - Autoplay Detenido", "error")
                    return
                }

                // Manually set bets to avoid animation lag of 'handleBatch'
                setCurrentBets(batch)
                setBetHistory(prev => [...prev, { bets: batch, totalCost: totalCost }])

                soundManager.playChip() // Audio feedback

                // SPIN
                handleSpin()

            }, 200) // FAST MODE: 200ms delay for continuous 480 spins
        } else {
            setSmartAutoActive(false)
            addToast("Meta de Giros Alcanzada", "info")
        }

    }, [roundHistory]) // Triggers when round history updates (Spin finish)

    // Handlers moved to useRouletteLogic & useDragLayout




    // MEMOIZED PROPS
    const placedNumbers = useMemo(() => getCoveredNumbers(currentBets), [currentBets])

    return (
        <div
            className="casino-table"
            style={{ display: 'block' }}
            onMouseMove={handleMouseMove}
        > {/* Switch to block for absolute children */}
            {/* BRANDING HEADER */}
            <Draggable index={1} totalCount={21} id="title" isEnabled={isEditMode} initialPos={positions.title} onDragEnd={onUpdatePos} style={{ zIndex: 4001, minWidth: '300px', minHeight: '60px', background: 'transparent' }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent', // Transparent to show felt gradient
                    border: 'none' // Explicitly no border
                }}>
                    <svg viewBox="0 0 500 85" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle"
                            fill="#d4af37"
                            fontFamily="Times New Roman, serif"
                            fontWeight="bold"
                            fontSize="42"
                            letterSpacing="2px"
                            style={{
                                textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.4)',
                                textTransform: 'uppercase'
                            }}
                        >
                            GHR Ruleta Royale
                        </text>
                        <text x="50%" y="85%" dominantBaseline="middle" textAnchor="middle"
                            fill="#aaa"
                            fontFamily="'Roboto Mono', monospace"
                            fontSize="14"
                            letterSpacing="1px"
                            style={{
                                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                            }}
                        >
                            Version 1.0, 10 Enero 2025
                        </text>
                    </svg>
                </div>
            </Draggable>


            {/* LOCK/UNLOCK BUTTON - Now Draggable */}
            <Draggable index={2} totalCount={21} id="layoutControls" isEnabled={isEditMode} initialPos={positions.layoutControls} onDragEnd={onUpdatePos}
                style={{ zIndex: 5000 }} // Keep on top
            >
                <div style={{ display: 'flex', gap: '10px' }}>
                    {isEditMode && (
                        <>
                            <button onClick={handleSaveLayout} style={{
                                background: '#28a745', color: 'white', border: '1px solid #fff',
                                padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                            }}>
                                💾 GUARDAR
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleLoadLayout}
                                style={{ display: 'none' }}
                                accept=".json"
                            />
                            {/* HELP BUTTON */}
                            <button
                                onClick={() => setShowLayoutHelp(true)}
                                style={{
                                    background: '#6c757d', color: 'white', border: '1px solid #fff',
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Ayuda de Diseño"
                            >
                                ?
                            </button>
                            <button
                                onClick={resetLayout}
                                style={{
                                    background: '#d4af37', color: 'black', border: 'none',
                                    padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                ↺ RESTAURAR DISEÑO
                            </button>
                        </>
                    )}

                    {/* STRATEGIES BUTTON */}
                    <button
                        onClick={() => setShowStrategiesModal(true)}
                        style={{
                            background: '#007bff', color: 'white', border: '1px solid #fff',
                            padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        ESTRATEGIAS
                    </button>
                    {/* MANUAL STRATEGY BUTTON */}
                    <button
                        onClick={() => setShowManualModal(true)}
                        style={{
                            background: '#17a2b8', color: 'white', border: '1px solid #fff',
                            padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        MANUAL
                    </button>
                    <button
                        onClick={() => setViewMode3D(!viewMode3D)}
                        style={{
                            background: '#6f42c1', color: 'white', border: '1px solid #fff',
                            padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        {viewMode3D ? 'VISTA 2D' : 'VISTA 3D'}
                    </button>
                </div>
            </Draggable>


            {/* GAME CONTROLS (Strategies, Audio, Tools) */}
            <Draggable index={3} totalCount={21} id="toolBox" isEnabled={isEditMode} initialPos={positions.toolBox || { x: 200, y: 750 }} onDragEnd={onUpdatePos} style={{ zIndex: 4002 }}>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px' }}>
                    <button onClick={() => setShowStrategiesModal(true)} style={{
                        background: '#222', color: '#ff00ff', border: '1px solid #ff00ff',
                        width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #ff00ff'
                    }} title="Estrategias Maestras">
                        🧠
                    </button>

                    {/* RULETA RUBRIC BUTTON */}
                    <button onClick={() => setShowRubricModal(true)} style={{
                        background: '#222', color: '#4f4', border: '1px solid #4f4',
                        width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #4f4'
                    }} title="Ver Calidad / Rúbrica">
                        📊
                    </button>

                    {/* AUDIO SETTINGS BUTTON */}
                    <button onClick={() => setShowAudioSettingsModal(true)} style={{
                        background: '#222', color: '#ffd700', border: '1px solid #ffd700',
                        width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #ffd700'
                    }} title="Configuración de Audio">
                        🔊
                    </button>

                    {/* ACTIVE BETS TOGGLE BUTTON - NEW */}
                    <button onClick={() => setShowActiveBets(!showActiveBets)} style={{
                        background: showActiveBets ? '#ff9800' : '#222', color: showActiveBets ? '#000' : '#ff9800',
                        border: '1px solid #ff9800',
                        width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #ff9800'
                    }} title="Ver/Ocultar Panel de Apuestas">
                        📝
                    </button>





                    {/* 3D TOGGLE BUTTON */}
                    <button onClick={() => setViewMode3D(!viewMode3D)} style={{
                        background: viewMode3D ? '#00CED1' : '#222',
                        color: viewMode3D ? '#000' : '#00CED1',
                        border: '1px solid #00CED1',
                        width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #00CED1'
                    }} title="Alternar Vista 2D / 3D">
                        🎲
                    </button>

                    {/* HISTORY BUTTON - ALWAYS VISIBLE */}
                    <button onClick={() => setShowHistoryModal(true)} style={{
                        background: '#6610f2', color: 'white', border: '1px solid #fff',
                        padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                        boxShadow: '0 0 10px rgba(102, 16, 242, 0.5)'
                    }}>
                        📜 HISTORIAL
                    </button>
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        style={{
                            background: isEditMode ? '#ff4444' : '#444',
                            color: 'white', border: '1px solid #fff',
                            padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        {isEditMode ? '🔒 BLOQUEAR DISEÑO' : '🔓 MOVER ELEMENTOS'}
                    </button>
                    <button
                        onClick={() => {
                            if (document.fullscreenElement) {
                                document.exitFullscreen()
                            } else {
                                document.documentElement.requestFullscreen()
                            }
                        }}
                        style={{
                            background: isFullscreen ? '#4caf50' : '#444',
                            color: 'white', border: '1px solid #fff',
                            padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                        title="Alternar pantalla completa (F11)"
                    >
                        {isFullscreen ? '🔲 SALIR PANTALLA' : '⛶ PANTALLA COMPLETA'}
                    </button>
                </div>
            </Draggable >

            {/* 0. LIVE MODE TOGGLE (Top Right of Table or Controls) */}
            < Draggable index={4} totalCount={21} id="modeToggle" isEnabled={isEditMode} initialPos={positions.modeToggle || { x: 800, y: 20 }} onDragEnd={onUpdatePos} style={{ zIndex: 4005 }}>
                <div
                    onClick={() => setIsLiveMode(!isLiveMode)}
                    style={{
                        background: isLiveMode ? '#ff0044' : '#444',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        border: '2px solid #fff',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                >
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isLiveMode ? '#fff' : '#888' }} />
                    {isLiveMode ? "MODO EN VIVO" : "MODO SIMULACIÓN"}
                </div>
            </Draggable >

            {/* 1. WHEEL SECTION */}
            <Draggable index={5} totalCount={21} id="wheel" isEnabled={isEditMode} initialPos={positions.wheel} onDragEnd={onUpdatePos} style={{ padding: '10px' }} >
                {
                    viewMode3D ? (
                        <Roulette3D
                            wheelRotation={wheelRotation}
                            ballRotation={ballRotation}
                            showBall={showBall}
                            size={500}
                            lastWin={lastWin} // Pass lastWin to 3D for markers?
                        />
                    ) : (
                        <RouletteWheel
                            wheelRotation={wheelRotation}
                            ballRotation={ballRotation}
                            showBall={showBall}
                            ballResetKey={ballResetKey}
                            highlightedNumbers={hoveredNumbers}
                            placedNumbers={placedNumbers}
                            size={500}
                            lastWin={lastWin}
                            isLiveMode={isLiveMode}
                            isLiveMode={isLiveMode}
                            onManualWin={handleManualWin}
                            animState={animState}
                        />
                    )}
            </Draggable >

            {/* 2. BOARD SECTION */}
            < Draggable index={6} totalCount={21} id="board" isEnabled={isEditMode} initialPos={positions.board} onDragEnd={onUpdatePos} >
                <div
                    style={{ transform: 'scale(0.9)', transformOrigin: 'top left', width: 'fit-content' }}
                    onMouseMove={handleMouseMove} // TRACK MOUSE HERE
                >
                    <BettingBoard
                        bets={currentBets}
                        onPlaceBet={onPlaceBet}
                        onBatchBet={(bets) => onBatchBet(bets, selectedChip)}
                        lastWin={lastWin}
                        onHoverNumbers={setHoveredNumbers}
                        history={numberHistory}
                        showEfficiency={showEfficiency}
                        setShowEfficiency={setShowEfficiency}
                        onNeighborBet={(num) => handleNeighborBet(num, neighborCount, selectedChip)}
                        showActiveBets={showActiveBets}
                        setShowActiveBets={setShowActiveBets}
                    />
                </div>
            </Draggable >





            {/* 4. TELEMETRY */}
            < Draggable index={7} totalCount={21} id="telemetry" isEnabled={isEditMode} initialPos={positions.telemetry} onDragEnd={onUpdatePos} >
                <div className="ct-telemetry">
                    <div style={{ marginBottom: 8, color: '#d4af37', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        🔬 Telemetría
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '5px' }}>
                        <div>Bola:</div> <div style={{ color: 'white' }}>{physicsState.ballType.name}</div>
                        <div>Salida:</div> <div style={{ color: 'white' }}>{physicsState.startPoint.name}</div>
                        <div style={{ borderTop: '1px solid #444', paddingTop: 5 }}>Sentido Bola:</div>
                        <div style={{ borderTop: '1px solid #444', paddingTop: 5, color: '#8f8' }}>{physicsState.ballDirection}</div>
                        <div>Vel. Bola:</div> <div style={{ color: '#4ff' }}>{physicsState.ballSpeed.name}</div>
                        <div style={{ borderTop: '1px solid #444', paddingTop: 5 }}>Sentido Cilindro:</div>
                        <div style={{ borderTop: '1px solid #444', paddingTop: 5, color: '#f88' }}>{physicsState.wheelDirection}</div>
                        <div>Vel. Cil:</div> <div style={{ color: '#f88' }}>{physicsState.wheelSpeed}</div>
                        <div style={{ gridColumn: '1 / -1', marginTop: 10, paddingTop: 10, borderTop: '1px dashed #555', textAlign: 'center', color: '#aaa' }}>
                            Permutaciones: <span style={{ color: '#fff', fontWeight: 'bold' }}>432</span>
                        </div>
                    </div>
                </div>
            </Draggable >

            {/* NEW: SESSION CLOCK (Top Right) */}
            < Draggable index={8} totalCount={21} id="clock" isEnabled={isEditMode} initialPos={positions.clock || { x: 1600, y: 20 }} onDragEnd={onUpdatePos} >
                <SessionClock />
            </Draggable >

            {/* NEW: SPIN COUNTER */}
            < Draggable index={9} totalCount={21} id="spinCounter" isEnabled={isEditMode} initialPos={positions.spinCounter} onDragEnd={onUpdatePos} >
                <SpinCounter />
            </Draggable >

            {/* NEW: DETAILED HISTORY WIDGET */}
            < Draggable index={10} totalCount={21} id="detailedHistory" isEnabled={isEditMode} initialPos={positions.detailedHistory} onDragEnd={onUpdatePos} className="ct-history-widget" >
                <DetailedHistoryWidget onClick={() => setShowHistoryModal(true)} />
            </Draggable >

            {/* MODALS */}
            {showHistoryModal && <DetailedHistoryModal onClose={() => setShowHistoryModal(false)} />}


            {/* 5. PAYTABLE (INFO) */}
            <Draggable index={11} totalCount={21} id="paytable" isEnabled={isEditMode} initialPos={positions.paytable} onDragEnd={onUpdatePos}>
                <div className="ct-help-controls">
                    <div
                        onClick={() => setShowHelpModal(true)}
                        className="ct-round-btn ct-btn-gold"
                        title="Ver Guía de Apuestas"
                    >
                        ?
                    </div>
                    <div
                        onClick={() => setShowManualModal(true)}
                        className="ct-round-btn ct-btn-white"
                        title="Códice GHR (Manual)"
                    >
                        📖
                    </div>
                </div>
            </Draggable>



            {/* NEW: STATISTICS PANEL */}
            <Draggable index={12} totalCount={21} id="statistics" isEnabled={isEditMode} initialPos={positions.statistics} onDragEnd={onUpdatePos}>
                <StatisticsPanel />
            </Draggable>



            {/* NEW: RACETRACK */}
            {/* NEW: RACETRACK - HIGH Z-INDEX TO PREVENT OVERLAP */}
            <Draggable index={13} totalCount={21} id="racetrack" isEnabled={isEditMode} initialPos={positions.racetrack} onDragEnd={onUpdatePos}>
                <div style={{ transform: 'scale(1.0)', transformOrigin: 'top left', zIndex: 50, position: 'relative' }}>
                    <Racetrack
                        onBatchBets={(bets) => handleBatchBets(bets, selectedChip)}
                        onHoverNumbers={setHoveredNumbers}
                        neighborCount={neighborCount}
                        setNeighborCount={setNeighborCount}
                    />
                </div>
            </Draggable>

            {/* NEW: RECORD / VICTORY MODAL */
                /* (Legacy Modals removed to fix ReferenceErrors. Handled at bottom of render) */
            }

            {/* NEW: RECORD / VICTORY MODAL */}
            {
                showRecordModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.85)', zIndex: 10001,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                            padding: '3px', borderRadius: '22px', // Gradient Border Wrapper
                            boxShadow: '0 0 60px rgba(255, 215, 0, 0.6)'
                        }}>
                            <div style={{
                                background: '#111', padding: '40px', borderRadius: '20px',
                                textAlign: 'center', width: '450px'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🏆</div>
                                <h1 style={{ color: '#FFD700', fontSize: '2.2rem', marginBottom: '15px', textTransform: 'uppercase' }}>
                                    ¡Nuevo Récord!
                                </h1>
                                <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '10px' }}>
                                    Has superado tu saldo máximo histórico.
                                </p>
                                <p style={{ color: '#aaa', marginBottom: '5px' }}>
                                    Saldo Actual: <span style={{ color: '#4f4', fontWeight: 'bold' }}>{formatBalance(balance)}</span>
                                </p>
                                <p style={{ color: '#ffd700', fontSize: '1.1rem', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '30px' }}>
                                    TIP: Comienza de nuevo con apuestas mínimas.
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                    <button
                                        onClick={() => setShowRecordModal(false)}
                                        style={{
                                            background: '#4f4', border: 'none', color: '#000', padding: '15px 30px',
                                            fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer',
                                            textTransform: 'uppercase', boxShadow: '0 0 15px rgba(68, 255, 68, 0.4)'
                                        }}
                                    >
                                        ¡Vamos por más!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }



            {/* TOOLTIP MANAGER (Lens & Hover) */}
            <TooltipManager
                showLens={!viewMode3D}

                viewMode3D={viewMode3D}
                currentBets={currentBets}
                handlePlaceBet={handlePlaceBet}
                handleNeighborBet={handleNeighborBet}
                hoveredNumbers={hoveredNumbers}
                setHoveredNumbers={setHoveredNumbers}
                selectedChip={selectedChip}
                potentialWin={potentialWin}
                positions={positions}
                formatValue={formatValue}
            />

            {/* WIN EFFECTS (Overlay) */}
            <WinEffects
                amount={lastWinAmount}
                gameMode={gameMode}
                viewCurrency={viewCurrency}
                formatValue={formatValue}
            />







            {/* HISTORY PANEL */}
            <Draggable index={14} totalCount={21} id="history" isEnabled={isEditMode} initialPos={positions.history} onDragEnd={onUpdatePos}>
                <HistoryPanel />
            </Draggable>

            {/* TOP OPPORTUNITY WIDGET */}
            <Draggable index={15} totalCount={21} id="opportunity" isEnabled={isEditMode} initialPos={positions.opportunity} onDragEnd={onUpdatePos}>
                <TopOpportunityWidget />
            </Draggable>





            {/* PROJECTIONS PANEL */}
            <Draggable index={16} totalCount={21} id="projections" isEnabled={isEditMode} initialPos={positions.projections} onDragEnd={onUpdatePos}>
                <ProjectionsPanel
                    balance={balance}
                    history={roundHistory}
                />
            </Draggable>

            {/* ACTIVE BETS PANEL */}
            {/* ACTIVE BETS PANEL */}
            {
                showActiveBets && (
                    <Draggable index={17} totalCount={21} id="activeBets" isEnabled={isEditMode} initialPos={positions.activeBets} onDragEnd={onUpdatePos}>
                        <ActiveBetsPanel
                            currentBets={currentBets}
                            onClear={handleClear}
                            onClose={() => setShowActiveBets(false)}
                        />
                    </Draggable>
                )
            }

            {/* 7. BUY-IN / BANKRUPTCY MODAL */}
            {
                showBankruptcy && !isSpinning && (
                    <div className="ct-bankruptcy-overlay" style={{ zIndex: Z_LAYERS.CRITICAL_MODAL }}>
                        <div className="ct-bankruptcy-content">
                            <h1 className="ct-status-title" style={{ fontSize: '2rem' }}>
                                {balance === 0 ? 'Bienvenido' : 'Saldo Insuficiente'}
                            </h1>
                            <p style={{ color: '#aaa', marginBottom: '20px' }}>
                                {balance === 0
                                    ? `Por favor, ingrese el monto en ${viewCurrency} para comenzar.`
                                    : `Se ha quedado sin fichas. Ingrese monto en ${viewCurrency} para recargar.`}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                                <input
                                    type="number"
                                    placeholder={`Monto (${viewCurrency})`}
                                    value={buyInAmount}
                                    onChange={(e) => setBuyInAmount(e.target.value)}
                                    autoFocus
                                    className="ct-finance-value"
                                    style={{
                                        padding: '10px', borderRadius: '5px', border: '1px solid #444',
                                        background: '#222', color: '#fff', fontSize: '1.2rem',
                                        width: '200px', textAlign: 'center', fontWeight: 'normal'
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleReloadSubmit()
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleReloadSubmit}
                                className="ct-control-btn ct-btn-gold"
                                style={{ padding: '12px 30px', fontSize: '1.2rem', width: 'auto' }}
                            >
                                INGRESAR FICHAS
                            </button>

                            {/* CLOSE / JUST WATCH BUTTON */}
                            <div style={{ marginTop: '15px' }}>
                                <button
                                    onClick={() => setShowBankruptcy(false)}
                                    style={{
                                        background: 'transparent', border: 'none', color: '#666',
                                        textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem'
                                    }}
                                >
                                    Solo Mirar (Cerrar)
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* CSS ANIMATIONS */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 68, 68, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
                }
                @keyframes fadeInScale {
                    from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes blinkGreen {
                    0% { background-color: #43a047; box-shadow: 0 0 15px #43a047; }
                    50% { background-color: #66bb6a; box-shadow: 0 0 25px #66bb6a; transform: scale(1.02); }
                    100% { background-color: #43a047; box-shadow: 0 0 15px #43a047; }
                }
            `}</style>

            {/* 6. UNIFIED BANKING HUD (VERTICAL TOWER - MASSIVE FONTS) */}
            <Draggable index={18} totalCount={21} id="banking" isEnabled={isEditMode} onDragEnd={onUpdatePos}>
                <div className="panel-tray-dark" style={{
                    width: '320px', minWidth: '320px',
                    display: 'flex', flexDirection: 'column',
                    padding: '0', // Padding moved to content
                    overflow: 'hidden'
                }}>
                    {/* HEADER */}
                    <div className="panel-tray-header">
                        🏦 BANCA Y ESTADO
                    </div>

                    {/* BODY */}
                    <div className="panel-tray-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>

                        {/* SECTION: CONTROLS & RESET */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowReloadModal(true)
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Recargar Fichas"
                                style={{

                                    background: '#2e7d32', // Green
                                    color: '#fff',
                                    border: '1px solid #4caf50',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    padding: '5px 15px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    zIndex: 1000,
                                    pointerEvents: 'auto'
                                }}
                            >
                                💲 Recargar
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowResetModal(true)
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Reiniciar TODO (Saldo a 0)"
                                style={{
                                    background: '#3e1a1a', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '4px',
                                    fontSize: '0.8rem', cursor: 'pointer', padding: '5px 10px',
                                    transition: 'all 0.2s', textTransform: 'uppercase',
                                    fontWeight: 'bold', zIndex: 1000, pointerEvents: 'auto'
                                }}
                            >
                                ⚠ Reiniciar
                            </button>
                        </div>

                        {/* SECTION: SECONDARY ACTIONS (WITHDRAW & PROJECTIONS) */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px', marginTop: '-5px' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowWithdrawModal(true)
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Retirar Ganancias"
                                style={{
                                    background: '#333', color: '#aaa', border: '1px solid #555', borderRadius: '4px',
                                    fontSize: '0.8rem', cursor: 'pointer', padding: '5px 15px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', textTransform: 'uppercase', transition: 'all 0.2s',
                                    zIndex: 1000, pointerEvents: 'auto'
                                }}
                            >
                                ⬇ Retirar
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowProjectionsModal(true)
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Proyecciones y Metas"
                                style={{
                                    background: '#d4af37', color: '#000', border: 'none', borderRadius: '4px',
                                    fontSize: '0.8rem', cursor: 'pointer', padding: '5px 15px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', textTransform: 'uppercase', transition: 'all 0.2s',
                                    zIndex: 1000, pointerEvents: 'auto'
                                }}
                            >
                                📈 Proy
                            </button>
                        </div>

                        {/* SECTION: BALANCE */}
                        <div className="ct-banking-row">
                            <div style={{
                                fontSize: '1rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold',
                                textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                                display: 'flex', alignItems: 'center'
                            }}>
                                <span>Saldo</span>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {/* Action buttons kept, but could be moved if user meant STRICT uniformity */}
                            </div>
                            <div style={{ fontSize: '1.9rem', color: '#ffd700', fontWeight: 'bold', textAlign: 'right', lineHeight: '1', fontFamily: 'Roboto Mono, monospace' }}>
                                {formatBalance(balance)}
                            </div>
                        </div>

                        {/* SECTION: POTENTIAL BEST PAYOUT */}
                        <div className="ct-banking-row">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
                                    Mejor Pago
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#ffcc00', fontWeight: 'bold' }}>
                                    {bestPayout.numbers.length > 0 ? (bestPayout.numbers.length > 5 ? 'Varios...' : bestPayout.numbers.join(', ')) : '-'}
                                </div>
                            </div>
                            <div style={{
                                fontSize: '1.4rem',
                                color: bestPayout.amount > 0 ? '#ffcc00' : '#444',
                                textAlign: 'right',
                                fontFamily: 'Roboto Mono, monospace',
                                lineHeight: '1',
                                textShadow: bestPayout.amount > 0 ? '0 0 10px rgba(255, 204, 0, 0.3)' : 'none'
                            }}>
                                {formatValue(bestPayout.amount)}
                            </div>
                        </div>

                        {/* SECTION: POTENTIAL MAX BALANCE */}
                        {bestPayout.amount > 0 && (
                            <div className="ct-banking-row">
                                <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
                                    Saldo Potencial
                                </div>
                                <div style={{
                                    fontSize: '1.4rem',
                                    color: (balance + bestPayout.amount) > maxBalance ? '#4caf50' : '#ff4444',
                                    textAlign: 'right',
                                    lineHeight: '1',
                                    fontFamily: 'Roboto Mono, monospace',
                                    textShadow: (balance + bestPayout.amount) > maxBalance ? '0 0 10px rgba(76, 175, 80, 0.4)' : 'none',
                                    position: 'relative',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    {/* Suggestion Popup if not breaking record */}
                                    {(balance + bestPayout.amount) <= maxBalance && (
                                        <div style={{
                                            position: 'absolute',
                                            right: '100%',
                                            marginRight: '15px',
                                            background: '#ff4444',
                                            color: 'white',
                                            padding: '5px 10px',
                                            borderRadius: '5px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap',
                                            animation: 'pulse 1s infinite',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
                                        }}>
                                            DOBLA APUESTA ⤴
                                            <div style={{
                                                position: 'absolute',
                                                right: '-5px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                borderTop: '5px solid transparent',
                                                borderBottom: '5px solid transparent',
                                                borderLeft: '5px solid #ff4444'
                                            }} />
                                        </div>
                                    )}
                                    {formatBalance(balance + bestPayout.amount)}
                                </div>
                            </div>
                        )}



                        {/* SECTION: MAX BALANCE */}
                        <div className="ct-banking-row">
                            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Saldo Máximo</div>
                            <div style={{
                                fontSize: '1.4rem',
                                color: isNewRecord ? '#fff' : '#d4af37',
                                textAlign: 'right',
                                lineHeight: '1',
                                fontFamily: 'Roboto Mono, monospace',
                                opacity: isNewRecord ? 1 : 0.8,
                                textShadow: isNewRecord ? '0 0 15px gold, 0 0 30px white' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                {formatBalance(maxBalance)} {isNewRecord && '🏆'}
                            </div>
                        </div>

                        {/* SECTION: POTENTIAL DIFFERENCE (RELOCATED) */}
                        {bestPayout.amount > 0 && (
                            <div style={{
                                width: '100%',
                                // Special case for DR row - keeps custom style but matches height potentially?
                                // Or should it also be a row? User said "EACH FIELD".
                                // Keeping it distinct but cleaner for now as it has background color logic.
                                // Actually, let's wrap contents in a row logic if possible, but the background needs to cover all.
                                height: '55px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginTop: '10px',
                                background: ((balance - currentRoundBet + bestPayout.amount) - maxBalance) > 0 ? '#43a047' : '#e53935',
                                borderRadius: '8px',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                boxShadow: ((balance - currentRoundBet + bestPayout.amount) - maxBalance) > 0 ? '0 0 15px #43a047' : '0 0 15px #e53935',
                                animation: ((balance - currentRoundBet + bestPayout.amount) - maxBalance) > 0 ? 'blinkGreen 1s infinite' : 'none'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: '#fff', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
                                    DR= Diferencia Record
                                </div>
                                <div style={{
                                    fontSize: '1.6rem',
                                    color: '#fff', // White text for contrast on Magenta
                                    textAlign: 'right',
                                    lineHeight: '1',
                                    fontFamily: 'Roboto Mono, monospace',
                                    fontWeight: 'bold'
                                }}>
                                    {(() => {
                                        const val = (balance - currentRoundBet + bestPayout.amount) - maxBalance
                                        return val > 0 ? '+' + formatBalance(val) : formatBalance(val)
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* SECTION: INITIAL BALANCE */}
                        <div className="ct-banking-row">
                            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Saldo Inicial</div>
                            <div style={{ fontSize: '1.4rem', color: '#888', textAlign: 'right', lineHeight: '1', fontFamily: 'Roboto Mono, monospace' }}>
                                {formatValue(initialCapital)}
                            </div>
                        </div>

                        {/* SECTION: PROFIT */}
                        <div className="ct-banking-row">
                            <div className="ct-finance-label" style={{ marginBottom: 0 }}>Ganancia Neta</div>
                            <div className={`ct-finance-value ct-val-lg ${(maxBalance - initialCapital) > 0 ? 'ct-text-green' : 'ct-text-gray'}`} style={{ fontSize: '1.9rem' }}>
                                {formatValue(maxBalance - initialCapital)}
                            </div>
                        </div>

                        {/* SECTION: DIFFERENCE MULTIPLIER */}
                        {bestPayout.amount > 0 && currentRoundBet > 0 && (
                            <div className="ct-banking-row">
                                <div className="ct-finance-label" style={{ marginBottom: 0 }}>
                                    Nx = Diferencia/Apuesta
                                </div>
                                <div className={`ct-finance-value ct-val-lg ${Math.round(((balance - currentRoundBet + bestPayout.amount) - maxBalance) / currentRoundBet) >= 0 ? 'ct-text-green' : 'ct-text-red'}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)', fontSize: '2.4rem' }}>
                                    {Math.round(((balance - currentRoundBet + bestPayout.amount) - maxBalance) / currentRoundBet)}x
                                </div>
                            </div>
                        )}

                        {/* SECTION: RECORD PROFIT PER MINUTE */}
                        {(maxBalance - initialCapital) > 0 && (
                            <>
                                <div className="ct-banking-row">
                                    <div className="ct-finance-label" style={{ marginBottom: 0 }}>
                                        Ganancia Récord / Min
                                    </div>
                                    <div className="ct-finance-value ct-val-sm ct-text-green">
                                        {(() => {
                                            const mins = Math.max(0.1, (Date.now() - sessionStart) / 60000)
                                            const profit = maxBalance - initialCapital
                                            return formatValue(profit / mins)
                                        })()}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* SECTION: BET */}
                        <div className="ct-banking-row">
                            <div className="ct-finance-label" style={{ marginBottom: 0 }}>Apuesta</div>
                            <div className="ct-finance-value ct-val-md ct-text-white" style={{ fontSize: '1.4rem' }}>
                                {formatValue(currentRoundBet)}
                            </div>
                        </div>

                        {/* SECTION: COVERAGE */}
                        <div className="ct-banking-row">
                            <div className="ct-finance-label" style={{ marginBottom: 0 }}>Cobertura</div>
                            <div className="ct-finance-value ct-val-sm ct-text-blue" style={{ opacity: 0.9 }}>
                                {calculateCoverage(currentBets).toFixed(1)}%
                            </div>
                        </div>

                        {/* SECTION: WIN */}
                        <div className="ct-banking-row">
                            <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Ganancia</div>
                            <div style={{
                                fontSize: '2.4rem',
                                color: lastWinAmount > 0 ? '#4f4' : '#555',
                                fontWeight: 'bold',
                                textAlign: 'right',
                                lineHeight: '1',
                                fontFamily: 'Roboto Mono, monospace',
                                textShadow: lastWinAmount > 0 ? '0 0 15px rgba(68, 255, 68, 0.5)' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                {formatValue(lastWinAmount)}
                            </div>
                        </div>

                        {/* CURRENCY SELECTOR */}
                        <div style={{ display: 'flex', gap: '5px', marginTop: '10px', height: '40px' }}>
                            {['COL', 'USA', 'EUR'].map(curr => (
                                <button key={curr} onClick={() => setViewCurrency(curr)}
                                    className={`ct-currency-btn ${viewCurrency === curr ? 'active' : ''}`}
                                >
                                    <span style={{ fontWeight: 'bold', fontSize: '1.0rem' }}>{curr}</span>
                                    {curr !== 'COL' && exchangeRates && (
                                        <span style={{ fontSize: '1.2rem', marginTop: '4px', opacity: 0.95, fontWeight: 'bold', color: viewCurrency === curr ? '#000' : '#888' }}>
                                            {curr === 'USA' && exchangeRates.COP ? `TRM ${Math.round(exchangeRates.COP)}` : ''}
                                            {curr === 'EUR' && exchangeRates.EUR && exchangeRates.COP ? `TRM ${Math.round(exchangeRates.COP / exchangeRates.EUR)}` : ''}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Draggable >

            {/* 6. WIN EFFECTS (Particles) */}
            < WinEffects lastWin={lastWin} lastWinAmount={lastWinAmount} />

            {/* OLD TOOLTIP REDUNDANT - Handled by TooltipManager */}


            {/* 7. GIANT DR STATUS OVERLAY (POP-UP) */}
            {
                statusOverlay && (
                    <div className="ct-status-overlay" style={{ zIndex: Z_LAYERS.STATUS_OVERLAY }}>
                        <div className="ct-status-title" style={{ color: lastWinAmount > 0 ? '#4f4' : '#f44' }}>
                            {lastWinAmount > 0 ? "¡VICTORIA!" : "NO VA MÁS"}
                        </div>
                        {lastWinAmount > 0 && (
                            <div className="ct-status-amount" style={{ color: '#4f4' }}>
                                {formatValue(lastWinAmount)}
                            </div>
                        )}
                    </div>
                )
            }


            {/* 1. CONTROLS HUD */}
            <Draggable index={19} totalCount={21} id="controls" isEnabled={isEditMode} initialPos={positions.controls} onDragEnd={onUpdatePos}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className="ct-controls-panel">
                        {/* SPIN BUTTON - Hidden/Disabled in Live Mode */}
                        {!isLiveMode && (
                            <button className="ct-control-btn ct-btn-spin" onClick={handleSpin} disabled={isSpinning || timerMode}>
                                {isSpinning ? "..." : (timerMode ? "AUTO" : "GIRAR")}
                            </button>
                        )}
                        <button onClick={handleRepeat} disabled={isSpinning || Object.keys(lastBets).length === 0}
                            className="ct-control-btn ct-btn-blue">
                            REPETIR
                        </button>
                        <button onClick={handleDouble} disabled={isSpinning || Object.keys(currentBets).length === 0}
                            className="ct-control-btn ct-btn-blue">
                            DOBLAR
                        </button>
                        <button onClick={handleUndo} disabled={isSpinning || betHistory.length === 0}
                            className="ct-control-btn ct-btn-bordeaux">
                            DESHACER
                        </button>
                        <button onClick={handleClear} disabled={isSpinning || Object.keys(currentBets).length === 0}
                            className="ct-control-btn ct-btn-crimson">
                            LIMPIAR
                        </button>
                    </div>
                    {/* TimeBar - Only show in Simulation Mode */}
                    {!isLiveMode && (
                        <TimeBar
                            isActive={timerMode && !isSpinning}
                            timerMode={timerMode}
                            duration={timerDuration}
                            timeLeft={timeLeft}
                            onToggle={() => {
                                setTimerMode(!timerMode)
                                if (!timerMode) setTimeLeft(timerDuration) // Reset when enabling
                            }}
                            onChangeDuration={setTimerDuration}
                        />
                    )}
                </div>
            </Draggable>


            {/* AUTOPLAY HUD */}
            <Draggable index={20} totalCount={21} id="autoplay" isEnabled={isEditMode} initialPos={positions.autoplay} onDragEnd={onUpdatePos}>
                <div className="ct-autoplay-panel">
                    <div className="ct-auto-label">
                        AUTO ({smartAutoActive ? smartAutoConfig.spinsRemaining : autoPlayCount}):
                    </div>
                    {(autoPlayCount > 0 || smartAutoActive) ? (
                        <button onClick={() => {
                            setAutoPlayCount(0)
                            setSmartAutoActive(false)
                            addToast("Autoplay Detenido Manualmente", "info")
                        }}
                            className="ct-auto-btn stop"
                        >
                            DETENER
                        </button>
                    ) : (
                        [10, 25, 50, 100, 480].map(count => (
                            <button key={count}
                                onClick={() => {
                                    if (count === 480) {
                                        // SPECIAL MACRO: Trigger Hybrid Hedge Pro
                                        handleClear() // Ensure clean start
                                        handleApplyStrategy('HYBRID_HEDGE_PRO', 480)
                                    } else {
                                        setAutoPlayCount(count)
                                    }
                                }}
                                className={`ct-auto-btn ${count === 480 ? 'gold' : ''}`}
                            >
                                {count === 480 ? '👑 480' : count}
                            </button>
                        ))
                    )}
                </div>
            </Draggable>

            {/* 7. CHIPS HUD (Separated) */}
            <Draggable index={21} totalCount={21} id="chips" isEnabled={isEditMode} initialPos={positions.chips} onDragEnd={onUpdatePos}>
                <div className={`ui-overlay-loose ${isSpinning ? 'disabled' : ''}`}>
                    <div className="chip-selector">
                        {[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].map(val => {
                            let display = formatChipValue(val)
                            // Custom formatting for Chips in COL to use K/M
                            if (viewCurrency === 'COL') {
                                const realVal = val * CHIP_RATES.COL
                                if (realVal >= 1000000) display = '$' + (realVal / 1000000).toLocaleString() + 'M'
                                else if (realVal >= 1000) display = '$' + (realVal / 1000).toLocaleString() + 'K'
                            }

                            return (
                                <div key={val} className={`chip-btn chip-${val} ${selectedChip === val ? 'selected' : ''}`}
                                    onClick={() => setSelectedChip(val)}
                                    style={{
                                        fontSize: viewCurrency === 'COL' ? '0.85rem' : '1rem', // Adjust for longer labels if not K? But K makes them short.
                                        // Actually user asked to INCREASE font.
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {display}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Draggable>

            {/* Top Opportunity Widget - Floating */}
            <Draggable id="opportunity" isEnabled={isEditMode} initialPos={positions.opportunity} onDragEnd={onUpdatePos}>
                <TopOpportunityWidget />
            </Draggable>

            {/* History Panel - Floating */}
            <Draggable id="history" isEnabled={isEditMode} initialPos={positions.history} onDragEnd={onUpdatePos}>
                <HistoryPanel />
            </Draggable>

            {/* ACTIVE BETS PANEL - Dynamic Pop-up */}
            {
                showActiveBets && (
                    <Draggable id="activeBets" isEnabled={isEditMode} initialPos={positions.activeBets || { x: 20, y: 500 }} onDragEnd={onUpdatePos} style={{ zIndex: Z_LAYERS.ACTIVE_BETS }}>
                        <ActiveBetsPanel
                            currentBets={currentBets}
                            onClose={() => setShowActiveBets(false)}
                            viewCurrency={viewCurrency}
                        />
                    </Draggable>
                )
            }

            {/* Projections Panel - Floating */}
            <Draggable id="projections" isEnabled={isEditMode} initialPos={positions.projections} onDragEnd={onUpdatePos}
                style={{ zIndex: Z_LAYERS.PROJECTIONS }}
            >
                <ProjectionsPanel viewCurrency={viewCurrency} currentBets={currentBets} />
            </Draggable>

            {/* --- CONTROL ICONS ($, Σ, M) --- */}
            {/* Dollar Icon - System Efficiency */}
            <Draggable index={22} totalCount={25} id="dollarIcon" isEnabled={isEditMode} initialPos={positions.dollarIcon} onDragEnd={onUpdatePos} style={{ zIndex: 2000 }}>
                <DollarIcon onClick={() => setShowEfficiencyModal(true)} />
            </Draggable>



            {/* Methods Icon - Methods Table */}
            <Draggable index={24} totalCount={25} id="methodsIcon" isEnabled={isEditMode} initialPos={positions.methodsIcon} onDragEnd={onUpdatePos} style={{ zIndex: 2000 }}>
                <MethodsIcon onClick={() => setShowMethodsTable(true)} />
            </Draggable>

            {/* Scanner Icon - Internal Market Scanner */}
            <Draggable index={25} totalCount={25} id="scannerIcon" isEnabled={isEditMode} initialPos={positions.scannerIcon || { x: 1350, y: 30 }} onDragEnd={onUpdatePos} style={{ zIndex: 2000 }}>
                <ScannerIcon onClick={() => setShowScannerModal(true)} />
            </Draggable>

            {
                showEfficiencyModal && (
                    <SystemEfficiencyModal
                        onClose={() => setShowEfficiencyModal(false)}
                        onBatchBet={onBatchBet}
                        currentBets={currentBets}
                        selectedChip={selectedChip}
                    />
                )
            }

            {
                showMethodsTable && (
                    <MethodsTable
                        onClose={() => setShowMethodsTable(false)}
                        onBatchBet={onBatchBet}
                        currentBets={currentBets}
                        selectedChip={selectedChip}
                    />
                )
            }

            {
                showScannerModal && (
                    <InternalScannerModal
                        onClose={() => setShowScannerModal(false)}
                        onBatchBet={onBatchBet}
                        currentBets={currentBets}
                        selectedChip={selectedChip}
                    />
                )
            }

            {/* RELOAD MODAL moved to GameOverlayManager */}


            {/* WITHDRAW MODAL */}
            {
                showWithdrawModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.9)', zIndex: Z_LAYERS.CRITICAL_MODAL,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <div style={{
                            background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                            border: '1px solid #333',
                            padding: '40px',
                            borderRadius: '20px',
                            textAlign: 'center',
                            boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                            maxWidth: '450px',
                            width: '90%'
                        }}>
                            <h2 style={{ color: '#aaa', fontSize: '1.8rem', marginBottom: '10px', textTransform: 'uppercase' }}>Retirar Fondos</h2>
                            <p style={{ color: '#666', marginBottom: '20px', fontSize: '1rem', lineHeight: '1.5' }}>
                                Ingresa la cantidad que deseas retirar de tu saldo.
                            </p>

                            <div style={{ marginBottom: '30px', position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '1.2rem' }}>$</span>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleWithdrawSubmit()}
                                    placeholder="0"
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '15px 15px 15px 35px',
                                        background: '#000',
                                        border: '1px solid #444',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        outline: 'none',
                                        fontFamily: 'Roboto Mono, monospace'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setShowWithdrawModal(false)}
                                    style={{
                                        padding: '15px 30px',
                                        borderRadius: '50px',
                                        border: '1px solid #444',
                                        background: 'transparent',
                                        color: '#888',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={handleWithdrawSubmit}
                                    style={{
                                        padding: '15px 40px',
                                        borderRadius: '50px',
                                        border: 'none',
                                        background: 'linear-gradient(145deg, #d32f2f, #b71c1c)', // Red theme for withdraw
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 15px rgba(211, 47, 47, 0.4)',
                                        transform: 'scale(1.05)',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    RETIRAR
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* RESET MODAL */}
            {
                showResetModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.95)', zIndex: Z_LAYERS.CRITICAL_MODAL,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{
                            background: 'linear-gradient(145deg, #2a0a0a, #1a0505)',
                            border: '2px solid #ff4444',
                            padding: '40px',
                            borderRadius: '20px',
                            textAlign: 'center',
                            boxShadow: '0 0 60px rgba(255, 68, 68, 0.4)',
                            maxWidth: '500px',
                            width: '90%'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
                            <h2 style={{ color: '#ff4444', fontSize: '2rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                ¿Reinicio Completo?
                            </h2>
                            <div style={{ color: '#fff', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.6', textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '10px' }}>
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    <li>Tu saldo volverá a <b>$0</b>.</li>
                                    <li>Se borrará todo el historial de jugadas.</li>
                                    <li>Se eliminará el récord de saldo máximo.</li>
                                </ul>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    style={{
                                        padding: '15px 30px',
                                        borderRadius: '50px',
                                        border: '1px solid #666',
                                        background: 'transparent',
                                        color: '#aaa',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s',
                                        flex: 1
                                    }}
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={() => {
                                        hardReset()
                                        setMaxBalance(0)
                                        setShowResetModal(false)
                                        addToast("Sistema Reiniciado Correctamente", "success")
                                        soundManager.playChip()
                                    }}
                                    style={{
                                        padding: '15px 30px',
                                        borderRadius: '50px',
                                        border: 'none',
                                        background: 'linear-gradient(145deg, #d32f2f, #b71c1c)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        boxShadow: '0 4px 20px rgba(211, 47, 47, 0.5)',
                                        transform: 'scale(1.05)',
                                        textTransform: 'uppercase',
                                        flex: 1
                                    }}
                                >
                                    SÍ, BORRAR TODO
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* GAME OVERLAY MANAGER (Handles all secondary modals) */}
            <GameOverlayManager
                showLayoutHelp={showLayoutHelp} setShowLayoutHelp={setShowLayoutHelp}
                showHistoryModal={showHistoryModal} setShowHistoryModal={setShowHistoryModal}
                showHelp={showHelpModal} setShowHelp={setShowHelpModal}
                showReloadModal={showReloadModal} setShowReloadModal={setShowReloadModal}
                showStrategiesModal={showStrategiesModal} setShowStrategiesModal={setShowStrategiesModal}
                showRubric={showRubricModal} setShowRubric={setShowRubricModal}
                showProjectionsModal={showProjectionsModal} setShowProjectionsModal={setShowProjectionsModal}
                showManualModal={showManualModal} setShowManualModal={setShowManualModal}
                showAudioSettings={showAudioSettingsModal} setShowAudioSettings={setShowAudioSettingsModal}
                showDetailedHistory={showDetailedHistory} setShowDetailedHistory={setShowDetailedHistory}
                // Data
                roundHistory={roundHistory}
                balance={balance}
                initialCapital={initialCapital}
                startTime={startTime}
                onReload={reloadCapital}
                viewCurrency={viewCurrency}
                rates={DISPLAY_RATES}
            />

            {/* EFFICIENCY MODALS (Moved from BettingBoard) */}
            {
                showEfficiencyModal && (
                    <SystemEfficiencyModal
                        onClose={() => setShowEfficiencyModal(false)}
                        onBatchBet={onBatchBet}
                        currentBets={currentBets}
                        selectedChip={selectedChip}
                    />
                )
            }

            <InternalScannerModal
                isOpen={showScannerModal}
                onClose={() => setShowScannerModal(false)}
                numberHistory={numberHistory}
                onBatchBet={onBatchBet}
                selectedChip={selectedChip}
            />

            <MethodsTable
                isOpen={showMethodsTable}
                onClose={() => setShowMethodsTable(false)}
                onBatchBet={onBatchBet}
                selectedChip={selectedChip}
                currentBets={currentBets}
            />
        </div >
    )
}
