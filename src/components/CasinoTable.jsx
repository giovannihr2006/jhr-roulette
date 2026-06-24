
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
import SystemEfficiencyModal from './SystemEfficiencyModal'
import MethodsTable from './MethodsTable'
import InternalScannerModal from './InternalScannerModal'
import { BayesianBiasEstimator } from '../logic/BayesianBiasEstimator'
import { MarkovMatrixTracker } from '../logic/MarkovMatrixTracker'
import { MultiBotSimulator } from '../logic/MultiBotSimulator'
import { DealerSignatureTracker } from './DealerSignatureTracker'
import { consolidateActiveBets } from '../logic/RouletteUtils'

// --- CONSOLIDATED SIDEBAR WIDGETS ---
import { UnifiedTelemetry } from './UnifiedTelemetry'
import { AuditTowerWidget } from './AuditTowerWidget'
import { StrategyMonitorWidget } from './StrategyMonitorWidget'
import { AlphaWidget } from './AlphaWidget'
import { InternalScannerWidget } from './InternalScannerWidget'
import { OldestStreetsWidget } from './OldestStreetsWidget'
import { OldestLinesWidget } from './OldestLinesWidget'
import { MethodsWidget } from './MethodsWidget'
import { SystemsWidget } from './SystemsWidget'
import { TimeManagementWidget } from './TimeManagementWidget'
import { VerticalBanking } from './VerticalBanking'
import { EconomicValueModal } from './EconomicValueModal'
import { AICopilotWidget } from './AICopilotWidget'


import { getNeighbours, WHEEL_ORDER } from '../utils/rouletteUtils'

// --- ELITE SYSTEM DEFINITIONS (18 NUMBERS, 48.65% COVERAGE, COST 4 CHIPS) ---
const ELITE_SYSTEMS = [
    {
        id: 'BETA',
        name: 'BETA (OPC. 1)',
        bets: ['LINE_7_10', 'LINE_28_31', 'STREET_16', 'STREET_22'],
        numbers: [7, 8, 9, 10, 11, 12, 16, 17, 18, 22, 23, 24, 28, 29, 30, 31, 32, 33],
        icr: '1.600',
        ibes: '0.6049',
        badge: '🥇 #1'
    },
    {
        id: 'GAMMA',
        name: 'GAMMA',
        bets: ['LINE_13_16', 'LINE_28_31', 'STREET_7', 'STREET_22'],
        numbers: [7, 8, 9, 13, 14, 15, 16, 17, 18, 22, 23, 24, 28, 29, 30, 31, 32, 33],
        icr: '1.333',
        ibes: '0.6049',
        badge: '🥈 #2'
    },
    {
        id: 'ALFA',
        name: 'ALFA',
        bets: ['LINE_4_7', 'LINE_28_31', 'STREET_16', 'STREET_22'],
        numbers: [4, 5, 6, 7, 8, 9, 16, 17, 18, 22, 23, 24, 28, 29, 30, 31, 32, 33],
        icr: '1.000',
        ibes: '0.6049',
        badge: '🥉 #3'
    },
    {
        id: 'DELTA',
        name: 'DELTA',
        bets: ['LINE_16_19', 'LINE_28_31', 'STREET_7', 'STREET_22'],
        numbers: [7, 8, 9, 16, 17, 18, 19, 20, 21, 22, 23, 24, 28, 29, 30, 31, 32, 33],
        icr: '0.875',
        ibes: '0.6049',
        badge: '🎗️ #4'
    }
]



import { LIMITS } from '../config/GameLimits'
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
    const autoPlaySpinInFlightRef = useRef(false)
    // Rotation State
    // Game State (Refactored to Hook)
    // const isSpinning... removed
    const [autoPlayCount, setAutoPlayCount] = useState(0)
    const [autoPlayWaitingForBets, setAutoPlayWaitingForBets] = useState(false)

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
    const [programmedPlayCount, setProgrammedPlayCount] = useState(12)

    // --- FULLSCREEN STATE ---
    const [isFullscreen, setIsFullscreen] = useState(false)
    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    // --- LIVE MODE STATE ---
    const [isLiveMode, setIsLiveMode] = useState(false)

    // --- SIDEBAR TABS STATE ---
    const [activeSidebarTab, setActiveSidebarTab] = useState('intelligence')

    // --- CERTIFICATION MODALS STATE ---
    const [showAppliedRubric, setShowAppliedRubric] = useState(false)
    const [showVisualRubric, setShowVisualRubric] = useState(false)
    const [showAppliedVisualRubric, setShowAppliedVisualRubric] = useState(false)
    const [showValueRubric, setShowValueRubric] = useState(false)
    const [showAppliedValueRubric, setShowAppliedValueRubric] = useState(false)
    const [showForensicManual, setShowForensicManual] = useState(false)
    const [showEconomicModal, setShowEconomicModal] = useState(false)


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
    const totalIdleTime = useFinancialStore(state => state.totalIdleTime || 0)
    const lastActionTime = useFinancialStore(state => state.lastActionTime)
    const targetProfit = useFinancialStore(state => state.targetProfit || 0)
    const stopLossLimit = useFinancialStore(state => state.stopLossLimit || 0)
    const setTargetProfit = useFinancialStore(state => state.setTargetProfit)
    const setStopLossLimit = useFinancialStore(state => state.setStopLossLimit)
    const baseWaitThreshold = useFinancialStore(state => state.baseWaitThreshold) || 300
    const riskCopilotEnabled = useFinancialStore(state => state.riskCopilotEnabled)
    const setRiskCopilotEnabled = useFinancialStore(state => state.setRiskCopilotEnabled)

    // Local Ticker removed (performance optimization)


    // Derived Balance (Safer than store getter)
    const balance = gameMode === 'REAL' ? realCapital : demoCapital

    // --- MAX BALANCE TRACKING ---
    const [maxBalance, setMaxBalance] = useState(() => useFinancialStore.getState().peakCapital || balance)
    const [isNewRecord, setIsNewRecord] = useState(false)
    const [showRecordModal, setShowRecordModal] = useState(false)
    const [bestPayout, setBestPayout] = useState({ amount: 0, numbers: [] })

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
    const useVaRStopLoss = useFinancialStore(state => state.useVaRStopLoss)
    const setUseVaRStopLoss = useFinancialStore(state => state.setUseVaRStopLoss)
    const getVaRStopLoss = useFinancialStore(state => state.getVaRStopLoss)
    const activeStopLoss = getVaRStopLoss()
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


    const [selectedChip, setSelectedChip] = useState(1)
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
    const [isTurboMode, setIsTurboMode] = useState(false)

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
        resolveRound,
        isTurboMode
    })

    // --- ADVANCED PROBABILISTIC TRACKERS ---
    const bayesianEstimator = React.useRef(new BayesianBiasEstimator())
    const markovTracker = React.useRef(new MarkovMatrixTracker())
    const multiBot = React.useRef(new MultiBotSimulator(balance))

    const [physPrediction, setPhysPrediction] = React.useState(null)
    const [physPredictionSector, setPhysPredictionSector] = React.useState([])

    // Update trackers when history changes
    React.useEffect(() => {
        if (numberHistory.length > 0) {
            bayesianEstimator.current.update(numberHistory)
            markovTracker.current.update(numberHistory)

            const latestNumber = numberHistory[numberHistory.length - 1]
            multiBot.current.processSpin(latestNumber)
        }
    }, [numberHistory])

    // Adaptive neighbor arc based on hit dispersion
    React.useEffect(() => {
        if (numberHistory.length >= 5 && physPrediction !== null) {
            let distances = []
            for (let i = numberHistory.length - 5; i < numberHistory.length - 1; i++) {
                const idx1 = WHEEL_ORDER.indexOf(numberHistory[i])
                const idx2 = WHEEL_ORDER.indexOf(numberHistory[i+1])
                if (idx1 !== -1 && idx2 !== -1) {
                    let dist = Math.abs(idx2 - idx1)
                    if (dist > 18) dist = 37 - dist
                    distances.push(dist)
                }
            }
            if (distances.length > 0) {
                const meanDist = distances.reduce((a,b)=>a+b,0) / distances.length
                if (meanDist < 4) setNeighborCount(1)
                else if (meanDist < 9) setNeighborCount(2)
                else setNeighborCount(4)
            }
        }
    }, [numberHistory, physPrediction])

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
        const chipValue = (val !== undefined && val !== null) ? val : selectedChip
        const result = handleBatchBets(ids, chipValue)
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

    const handleProgrammedPlayChange = (value) => {
        const parsed = parseInt(value, 10)
        if (Number.isNaN(parsed)) {
            setProgrammedPlayCount(1)
            return
        }
        setProgrammedPlayCount(Math.max(1, Math.min(999, parsed)))
    }

    const startProgrammedPlays = () => {
        if (isSpinning) return
        if (Object.keys(currentBets).length === 0 && Object.keys(lastBets).length === 0) {
            addToast("Programa detenido: primero coloca o repite una apuesta", "error")
            return
        }
        setTimerMode(false)
        setAutoPlayWaitingForBets(false)
        setAutoPlayCount(programmedPlayCount)
        addToast(`Programa iniciado: ${programmedPlayCount} jugadas`, "success")
    }

    const stopProgrammedPlays = () => {
        autoPlaySpinInFlightRef.current = false
        setAutoPlayWaitingForBets(false)
        setAutoPlayCount(0)
        addToast("Programa de jugadas detenido", "info")
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

    // --- 10 FRONTLINE IMPROVEMENTS STATES & EFFECTS ---
    const [limitFlash, setLimitFlash] = useState(null)

    // Recommended chip logic
    const chipOptions = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    const copilotBase = Math.max(1, balance / 1000);

    // Evaluate maximum misses among the 4 Elite Systems
    let maxMisses = 0;
    ELITE_SYSTEMS.forEach(sys => {
        let misses = 0;
        for (let i = numberHistory.length - 1; i >= 0; i--) {
            if (sys.numbers.includes(numberHistory[i])) break;
            misses++;
        }
        if (misses > maxMisses) {
            maxMisses = misses;
        }
    });

    const copilotTSystem = Math.round(baseWaitThreshold / 18) || 17;
    const copilotF = Math.min(5, Math.floor(maxMisses / copilotTSystem));
    let copilotS = copilotBase * Math.max(1, copilotF);

    // Upgrade: Fractional Kelly Criterion Sizing
    if (riskCopilotEnabled) {
        let p = 1 / 37;
        let b = 35; // Net odds

        if (physPrediction !== null) {
            p = 0.054; // Physics signature edge estimate
        } else if (bayesianEstimator.current) {
            const stats = bayesianEstimator.current.getAllPocketStats();
            const biased = stats.filter(s => s.confidence >= 0.90);
            if (biased.length > 0) {
                p = biased[0].mean;
            }
        }

        if (p > 1 / 37) {
            const q = 1 - p;
            const fStar = (p * b - q) / b;
            const fraction = 0.25; // Quarter-Kelly
            const kellyS = balance * fStar * fraction;
            if (kellyS > 0) {
                copilotS = kellyS;
            }
        }
    }

    // Map to closest chip option
    let suggestedChipVal = chipOptions[0];
    let minDiff = Math.abs(copilotS - suggestedChipVal);
    for (let i = 1; i < chipOptions.length; i++) {
        const diff = Math.abs(copilotS - chipOptions[i]);
        if (diff < minDiff) {
            minDiff = diff;
            suggestedChipVal = chipOptions[i];
        }
    }

    const isGiovanniConditionMet = (bestPayout.amount + balance) > maxBalance
    const shouldDoubleBetGiovanni = !isGiovanniConditionMet && bestPayout.amount > 0
    const recommendedChipVal = smartAutoActive && smartAutoConfig && smartAutoConfig.chipValue
        ? smartAutoConfig.multiplier * smartAutoConfig.chipValue
        : (shouldDoubleBetGiovanni ? selectedChip * 2 : (riskCopilotEnabled ? suggestedChipVal : null))
    const isRecommendedDueToGiovanni = !smartAutoActive && shouldDoubleBetGiovanni;

    // Stop-Loss and Target Profit Monitor
    useEffect(() => {
        if (targetProfit > 0 && balance >= targetProfit) {
            setSmartAutoActive(false)
            setAutoPlayCount(0)
            setLimitFlash('target-profit')
            setTimeout(() => setLimitFlash(null), 6000)

            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance("Meta de saldo alcanzada. Deteniendo juego para asegurar ganancias.")
                utterance.lang = 'es-ES'
                window.speechSynthesis.speak(utterance)
            }
            addToast(`¡Límite superior alcanzado! Meta de saldo: ${formatValue(targetProfit)}`, "success")
        } else if (activeStopLoss > 0 && balance <= activeStopLoss) {
            setSmartAutoActive(false)
            setAutoPlayCount(0)
            setLimitFlash('stop-loss')
            setTimeout(() => setLimitFlash(null), 6000)

            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance("Límite de pérdida alcanzado. Deteniendo juego para proteger su capital.")
                utterance.lang = 'es-ES'
                window.speechSynthesis.speak(utterance)
            }
            addToast(`¡Límite inferior alcanzado! Stop-Loss: ${formatValue(activeStopLoss)}`, "error")
        }
    }, [balance, targetProfit, activeStopLoss])

    // Keyboard Hotkeys
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeEl = document.activeElement
            const isInput = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.isContentEditable
            )
            if (isInput) return

            if (e.key === ' ') {
                e.preventDefault()
                if (!isSpinning && !timerMode) {
                    handleSpin()
                }
            } else if (e.key === 'Backspace' || e.key === 'c' || e.key === 'C') {
                e.preventDefault()
                if (!isSpinning) handleClear()
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault()
                if (!isSpinning) handleRepeat()
            } else if (e.key === 'd' || e.key === 'D') {
                e.preventDefault()
                if (!isSpinning) handleDouble()
            } else if (e.key === 'z' || e.key === 'Z') {
                e.preventDefault()
                if (!isSpinning) handleUndo()
            } else if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
                e.preventDefault()
                const tabMap = {
                    '1': 'intelligence',
                    '2': 'forensic',
                    '3': 'stats',
                    '4': 'projections',
                    '5': 'history',
                    '6': 'session',
                    '7': 'banking'
                }
                setActiveSidebarTab(tabMap[e.key])
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isSpinning, timerMode, handleSpin, handleClear, handleRepeat, handleDouble, handleUndo])

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
        if (!isSpinning && autoPlaySpinInFlightRef.current) {
            autoPlaySpinInFlightRef.current = false
            setAutoPlayCount(prev => Math.max(0, prev - 1))
        }
    }, [isSpinning])

    useEffect(() => {
        if (!isSpinning && autoPlayCount > 0) {
            const timer = setTimeout(() => {
                // 1. Repeat Bets
                if (Object.keys(currentBets).length === 0 && Object.keys(lastBets).length > 0) {
                    const repeated = handleRepeat()
                    if (!repeated) {
                        setAutoPlayWaitingForBets(false)
                        setAutoPlayCount(0)
                    } else {
                        setAutoPlayWaitingForBets(true)
                    }
                    return
                } else if (Object.keys(currentBets).length === 0) {
                    // No bets to repeat and empty table? Stop.
                    addToast("Autoplay detenido: No hay apuestas para repetir", "error")
                    setAutoPlayWaitingForBets(false)
                    setAutoPlayCount(0)
                    return
                }

                // 2. Spin
                // Ensure we call spin only if valid
                setAutoPlayWaitingForBets(false)
                autoPlaySpinInFlightRef.current = true
                handleSpin()

            }, autoPlayWaitingForBets ? 150 : 2000) // Wait one state pass after repeating bets.
            return () => clearTimeout(timer)
        }
        if (autoPlayCount <= 0) {
            autoPlaySpinInFlightRef.current = false
            setAutoPlayWaitingForBets(false)
        }
    }, [isSpinning, autoPlayCount, currentBets, lastBets, autoPlayWaitingForBets, handleRepeat, handleSpin, addToast])



    // DEBUG OVERLAY




    // --- POTENTIAL WIN LOGIC ---

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

    const renderSidebarContent = () => {
        const rankings = multiBot.current ? multiBot.current.getRankings() : []

        switch (activeSidebarTab) {
            case 'intelligence':
                return (
                    <>
                        <div style={{ transform: 'scale(1.0)', transformOrigin: 'top left', zIndex: 50, position: 'relative', width: '100%' }}>
                            <Racetrack
                                onBatchBets={(bets) => onBatchBet(bets, selectedChip)}
                                onHoverNumbers={setHoveredNumbers}
                                neighborCount={neighborCount}
                                setNeighborCount={setNeighborCount}
                            />
                        </div>
                        <DealerSignatureTracker
                            onPredictionUpdate={(num, sector) => {
                                setPhysPrediction(num)
                                setPhysPredictionSector(sector || [])
                            }}
                            disabled={isSpinning}
                        />
                        <UnifiedTelemetry physicsState={physicsState} />
                        <DetailedHistoryWidget onClick={() => setShowHistoryModal(true)} />

                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '10px',
                            padding: '12px',
                            marginTop: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxSizing: 'border-box',
                            width: '100%'
                        }}>
                            <div style={{ fontSize: '0.8rem', color: '#ffd700', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                                <span>📈 RENDIMIENTO MULTI-BOT (SHADOW)</span>
                                <span style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 'normal' }}>Base: $10K</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {rankings.slice(0, 4).map((bot, idx) => {
                                    const profit = bot.netProfit
                                    const isPos = profit > 0
                                    const isNeg = profit < 0
                                    return (
                                        <div key={bot.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                                            <span>#{idx + 1} {bot.label.split(' ')[0]}</span>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.65rem', color: '#aaa' }}>{bot.winRate.toFixed(0)}% WR</span>
                                                <span style={{
                                                    color: isPos ? '#4caf50' : (isNeg ? '#ff1744' : '#fff'),
                                                    fontWeight: 'bold'
                                                }}>
                                                    {isPos ? '+' : ''}{formatValue(bot.netProfit)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )
            case 'forensic':
                return (
                    <>
                        <div className="ct-widgets-grid">
                            <StrategyMonitorWidget currentRoundBet={currentRoundBet} bestPayoutAmount={bestPayout.amount} />
                            <AlphaWidget onBet={onBatchBet} placedNumbers={placedNumbers} />
                            <InternalScannerWidget onBet={onBatchBet} />
                            <OldestStreetsWidget onBet={onBatchBet} />
                            <OldestLinesWidget onBet={onBatchBet} />
                            <MethodsWidget onBet={onBatchBet} placedNumbers={placedNumbers} onToggleTable={() => setShowMethodsTable(true)} />
                            <SystemsWidget onBet={onBatchBet} placedNumbers={placedNumbers} onToggleTable={() => setShowEfficiencyModal(true)} />
                            <TopOpportunityWidget />
                        </div>
                        <AuditTowerWidget
                            onShowRubricManual={() => setShowRubricModal(true)}
                            onShowRubricApplied={() => setShowAppliedRubric(true)}
                            onShowVisualManual={() => setShowVisualRubric(true)}
                            onShowVisualApplied={() => setShowAppliedVisualRubric(true)}
                            onShowValueManual={() => setShowValueRubric(true)}
                            onShowValueApplied={() => setShowAppliedValueRubric(true)}
                            onShowAppValue={() => setShowEconomicModal(true)}
                            onShowForensicManual={() => setShowForensicManual(true)}
                        />
                    </>
                )
            case 'stats':
                return <StatisticsPanel />
            case 'projections':
                return (
                    <ProjectionsPanel
                        balance={balance}
                        history={roundHistory}
                        viewCurrency={viewCurrency}
                        currentBets={currentBets}
                        onExpand={() => setShowProjectionsModal(true)}
                    />
                )
            case 'history':
                return <HistoryPanel />
            case 'session':
                return (
                    <TimeManagementWidget
                        isActive={timerMode && !isSpinning}
                        timerMode={timerMode}
                        duration={timerDuration}
                        timeLeft={timeLeft}
                        onToggle={() => {
                            setTimerMode(!timerMode)
                            if (!timerMode) setTimeLeft(timerDuration)
                        }}
                        onChangeDuration={setTimerDuration}
                        totalSpins={roundHistory.length}
                        totalIdleTime={totalIdleTime}
                        lastActionTime={lastActionTime}
                        onShowJustificationE24={() => addToast("Manual de Gestión de Tiempo", "info")}
                    />
                )
            case 'banking':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                        <VerticalBanking
                            balance={balance}
                            maxBalance={maxBalance}
                            bestPayout={bestPayout}
                            currentRoundBet={currentRoundBet}
                            formatBalance={formatBalance}
                            formatValue={formatValue}
                            setShowReloadModal={setShowReloadModal}
                            setShowResetModal={setShowResetModal}
                            setShowWithdrawModal={setShowWithdrawModal}
                            setShowProjectionsModal={setShowProjectionsModal}
                            isNewRecord={isNewRecord}
                            initialCapital={initialCapital}
                            sessionStart={sessionStart}
                            lastWinAmount={lastWinAmount}
                            currentBets={currentBets}
                            viewCurrency={viewCurrency}
                            setViewCurrency={setViewCurrency}
                            exchangeRates={exchangeRates}
                            targetProfit={targetProfit}
                            stopLossLimit={stopLossLimit}
                            setTargetProfit={setTargetProfit}
                            setStopLossLimit={setStopLossLimit}
                            roundHistory={roundHistory}
                            setCurrentBets={setCurrentBets}
                            placeBet={placeBet}
                            handleClear={handleClear}
                            setBetHistory={setBetHistory}
                        />
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxSizing: 'border-box'
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ffd700', cursor: 'pointer', userSelect: 'none' }}>
                                <input
                                    type="checkbox"
                                    checked={useVaRStopLoss}
                                    onChange={(e) => setUseVaRStopLoss(e.target.checked)}
                                    style={{ accentColor: '#ffd700', cursor: 'pointer', width: '14px', height: '14px', margin: 0 }}
                                />
                                <span>🛡️ STOP-LOSS DINÁMICO (VaR)</span>
                            </label>
                            {useVaRStopLoss && (
                                <div style={{ fontSize: '0.75rem', color: '#aaa', paddingLeft: '22px' }}>
                                    Límite VaR Activo: <strong style={{ color: '#ff1744' }}>{formatValue(activeStopLoss)}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                )
            default:
                return null;
        }
    }
    return (
        <div
            className="casino-table"
            style={{ display: 'block' }}
            onMouseMove={handleMouseMove}
        >
            {limitFlash === 'stop-loss' && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    border: '25px solid rgba(255, 23, 68, 0.95)',
                    boxShadow: 'inset 0 0 100px rgba(255, 23, 68, 0.9)',
                    pointerEvents: 'none', zIndex: 99999,
                    animation: 'pulseFlash 1s infinite'
                }} />
            )}
            {limitFlash === 'target-profit' && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    border: '25px solid rgba(212, 175, 55, 0.95)',
                    boxShadow: 'inset 0 0 100px rgba(212, 175, 55, 0.9)',
                    pointerEvents: 'none', zIndex: 99999,
                    animation: 'pulseFlash 1s infinite'
                }} />
            )}
            <div className={`programmed-plays-panel ${autoPlayCount > 0 ? 'active' : ''}`}>
                <div className="programmed-plays-copy">
                    <span className="programmed-plays-label">JUGADAS PROGRAMADAS</span>
                    <strong>{autoPlayCount > 0 ? `${autoPlayCount} restantes` : 'Listo para programar'}</strong>
                </div>
                <div className="programmed-plays-controls">
                    <button
                        type="button"
                        className="programmed-step"
                        onClick={() => handleProgrammedPlayChange(programmedPlayCount - 1)}
                        disabled={autoPlayCount > 0}
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min="1"
                        max="999"
                        value={programmedPlayCount}
                        onChange={(e) => handleProgrammedPlayChange(e.target.value)}
                        disabled={autoPlayCount > 0}
                        aria-label="Numero de jugadas programadas"
                    />
                    <button
                        type="button"
                        className="programmed-step"
                        onClick={() => handleProgrammedPlayChange(programmedPlayCount + 1)}
                        disabled={autoPlayCount > 0}
                    >
                        +
                    </button>
                    {autoPlayCount > 0 ? (
                        <button type="button" className="programmed-stop" onClick={stopProgrammedPlays}>
                            DETENER
                        </button>
                    ) : (
                        <button type="button" className="programmed-start" onClick={startProgrammedPlays} disabled={isSpinning}>
                            INICIAR
                        </button>
                    )}
                </div>
            </div>
            {!isEditMode ? (
                /* --- DUAL COLUMN ANTI-OVERLAP LAYOUT --- */
                <div className="ct-layout-wrapper">
                    {/* LEFT / MAIN COLUMN */}
                    <div className="ct-main-column">
                        {/* CONTROLS ROW WITH INLINED BRANDING */}
                        <div className="ct-controls-row">
                            {/* Compact Branding */}
                            <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '20px', borderRight: '1px solid rgba(212, 175, 55, 0.35)', marginRight: '10px', flexShrink: 0 }}>
                                <span style={{
                                    color: '#d4af37',
                                    fontFamily: 'Times New Roman, serif',
                                    fontWeight: 'bold',
                                    fontSize: '1.25rem',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    textShadow: '0 2px 5px rgba(0,0,0,0.5)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    GHR Ruleta Royale
                                </span>
                                <span style={{
                                    color: '#aaa',
                                    fontFamily: "'Roboto Mono', monospace",
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.5px',
                                    marginTop: '-1px'
                                }}>
                                    v1.0 - 10 Ene 2025
                                </span>
                            </div>
                            <button onClick={() => setShowStrategiesModal(true)} style={{
                                background: '#007bff', color: 'white', border: '1px solid #fff',
                                padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                            }}>
                                ESTRATEGIAS
                            </button>
                            <button onClick={() => setShowManualModal(true)} style={{
                                background: '#17a2b8', color: 'white', border: '1px solid #fff',
                                padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                            }}>
                                MANUAL
                            </button>
                            <button onClick={() => setViewMode3D(!viewMode3D)} style={{
                                background: '#6f42c1', color: 'white', border: '1px solid #fff',
                                padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                            }}>
                                {viewMode3D ? 'VISTA 2D' : 'VISTA 3D'}
                            </button>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: 'auto', marginRight: '35px' }}>
                                <button onClick={() => setIsEditMode(true)} style={{
                                    background: '#444', color: 'white', border: '1px solid #fff',
                                    padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                }}>
                                    🔓 MOVER ELEMENTOS
                                </button>
                                <button onClick={() => {
                                    if (document.fullscreenElement) document.exitFullscreen();
                                    else document.documentElement.requestFullscreen();
                                }} style={{
                                    background: isFullscreen ? '#4caf50' : '#444', color: 'white', border: '1px solid #fff',
                                    padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                }}>
                                    {isFullscreen ? '🔲 SALIR PANTALLA' : '⛶ PANTALLA COMPLETA'}
                                </button>
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
                            </div>
                        </div>

                        {/* GAME ROW (Wheel + Board) */}
                        <div className="ct-game-row">
                            {/* Wheel */}
                            <div style={{ flex: 'none', width: '420px', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {viewMode3D ? (
                                    <Roulette3D
                                        wheelRotation={wheelRotation}
                                        ballRotation={ballRotation}
                                        showBall={showBall}
                                        highlightedNumbers={hoveredNumbers}
                                        placedNumbers={placedNumbers}
                                        bestPayoutNumbers={bestPayout?.numbers || []}
                                        size={420}
                                        lastWin={lastWin}
                                        isTurboMode={isTurboMode}
                                    />
                                ) : (
                                    <RouletteWheel
                                        wheelRotation={wheelRotation}
                                        ballRotation={ballRotation}
                                        showBall={showBall}
                                        ballResetKey={ballResetKey}
                                        highlightedNumbers={hoveredNumbers}
                                        placedNumbers={placedNumbers}
                                        bestPayoutNumbers={bestPayout?.numbers || []}
                                        isTurboMode={isTurboMode}
                                        size={420}
                                        lastWin={lastWin}
                                        isLiveMode={isLiveMode}
                                        onManualWin={handleManualWin}
                                        animState={animState}
                                        isSpinning={isSpinning}
                                    />
                                )}
                            </div>

                            {/* Board */}
                            <div style={{ width: '774px', height: '615px', flex: 'none', display: 'flex', alignItems: 'flex-start', overflow: 'visible', paddingTop: '0px', boxSizing: 'border-box' }}>
                                <div style={{ transform: 'scale(0.9)', transformOrigin: 'left top', width: '860px' }}>
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
                            </div>
                        </div>

                        {/* BOTTOM CONTROLS & CHIPS ROW */}
                        <div className="ct-controls-panel-row" style={{ display: 'flex', gap: '10px', width: 'calc(100% - 30px)', maxWidth: '1113px', marginLeft: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', boxSizing: 'border-box' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                                <div className="ct-controls-panel" style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '10px', background: 'transparent', border: 'none', padding: 0 }}>
                                    {!isLiveMode && (
                                        <button className="ct-control-btn ct-btn-spin" onClick={handleSpin} disabled={isSpinning || timerMode} style={{ margin: 0 }}>
                                            {isSpinning ? "..." : (timerMode ? "AUTO" : "GIRAR")}
                                        </button>
                                    )}
                                    {!isLiveMode && (
                                        <button
                                            onClick={() => setIsTurboMode(!isTurboMode)}
                                            className={`ct-control-btn ${isTurboMode ? 'ct-btn-gold' : 'ct-btn-blue'}`}
                                            style={{
                                                background: isTurboMode ? 'linear-gradient(135deg, #1e1010, #3a0007)' : 'rgba(20, 20, 20, 0.85)',
                                                color: isTurboMode ? '#ff1744' : '#d4af37',
                                                border: isTurboMode ? '1px solid #ff1744' : '1px solid rgba(212, 175, 55, 0.4)',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px',
                                                boxShadow: isTurboMode ? '0 0 10px rgba(255, 23, 68, 0.3)' : 'none'
                                            }}
                                        >
                                            ⚡ TURBO: {isTurboMode ? 'ON' : 'OFF'}
                                        </button>
                                    )}
                                    <button onClick={handleRepeat} disabled={isSpinning || Object.keys(lastBets).length === 0} className="ct-control-btn ct-btn-blue">
                                        REPETIR
                                    </button>
                                    <button onClick={handleDouble} disabled={isSpinning || Object.keys(currentBets).length === 0} className="ct-control-btn ct-btn-blue">
                                        DOBLAR
                                    </button>
                                    <button onClick={handleUndo} disabled={isSpinning || betHistory.length === 0} className="ct-control-btn ct-btn-bordeaux">
                                        DESHACER
                                    </button>
                                    <button onClick={handleClear} disabled={isSpinning || Object.keys(currentBets).length === 0} className="ct-control-btn ct-btn-crimson">
                                        LIMPIAR
                                    </button>
                                </div>
                                {!isLiveMode && (
                                    <TimeBar
                                        isActive={timerMode && !isSpinning}
                                        timerMode={timerMode}
                                        duration={timerDuration}
                                        timeLeft={timeLeft}
                                        onToggle={() => {
                                            setTimerMode(!timerMode)
                                            if (!timerMode) setTimeLeft(timerDuration)
                                        }}
                                        onChangeDuration={setTimerDuration}
                                    />
                                )}
                            </div>

                            <div className="ui-overlay-loose" style={{ flex: 'none', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div className="chip-selector">
                                    {[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].map(val => {
                                        let display = formatChipValue(val)
                                        if (viewCurrency === 'COL') {
                                            const realVal = val * CHIP_RATES.COL
                                            if (realVal >= 1000000) display = '$' + (realVal / 1000000).toLocaleString() + 'M'
                                            else if (realVal >= 1000) display = '$' + (realVal / 1000).toLocaleString() + 'K'
                                        }
                                        return (
                                            <div key={val} className={`chip-btn chip-${val} ${selectedChip === val ? 'selected' : ''}`}
                                                onClick={() => setSelectedChip(val)}
                                                style={{
                                                    fontSize: '1.1rem',
                                                    ...(val === recommendedChipVal ? {
                                                        boxShadow: isRecommendedDueToGiovanni
                                                            ? '0 0 15px #ff1744, inset 0 0 8px #ff1744'
                                                            : '0 0 15px #ffd700, inset 0 0 8px #ffd700',
                                                        border: isRecommendedDueToGiovanni
                                                            ? '2px solid #ff1744'
                                                            : '2px solid #ffd700',
                                                        animation: isRecommendedDueToGiovanni
                                                            ? 'pulseRecommendedRed 1.5s infinite'
                                                            : 'pulseRecommendedGold 1.5s infinite'
                                                    } : {})
                                                }}
                                            >
                                                {display}
                                            </div>
                                        )
                                    })}
                                </div>
                                {riskCopilotEnabled && !smartAutoActive && (
                                    <div className="copilot-suggest-banner" style={{
                                        marginTop: '8px',
                                        padding: '6px 12px',
                                        background: 'rgba(212, 175, 55, 0.12)',
                                        border: '1px solid rgba(212, 175, 55, 0.3)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        color: '#ffd700',
                                        fontSize: '0.85rem',
                                        textShadow: '0 0 5px rgba(212, 175, 55, 0.4)',
                                        boxShadow: 'inset 0 0 10px rgba(212, 175, 55, 0.05), 0 2px 8px rgba(0, 0, 0, 0.3)',
                                        backdropFilter: 'blur(4px)',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span>⚡</span>
                                            <span>CO-PILOTO: Sugerido: <strong>{formatChipValue(suggestedChipVal)}</strong></span>
                                        </span>
                                        <button
                                            onClick={() => setSelectedChip(suggestedChipVal)}
                                            style={{
                                                background: 'linear-gradient(135deg, #ffd700, #b8860b)',
                                                border: 'none',
                                                borderRadius: '4px',
                                                color: '#000',
                                                padding: '2px 8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.filter = 'brightness(1.2)';
                                                e.target.style.boxShadow = '0 0 8px rgba(212, 175, 55, 0.8)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.filter = 'none';
                                                e.target.style.boxShadow = '0 0 5px rgba(212, 175, 55, 0.5)';
                                            }}
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* WIDE ELITE SYSTEMS BOTTOM ROW */}
                        <div className="elite-systems-bottom-row" style={{
                            width: 'calc(100% - 30px)',
                            maxWidth: '1113px',
                            marginLeft: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '15px 20px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            marginTop: '-35px',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#d4af37',
                                fontWeight: 'bold',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                textShadow: '0 0 5px rgba(212, 175, 55, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                marginBottom: '4px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>⚙️ SISTEMAS ÉLITE</span>
                                    <span style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'none', fontWeight: 'normal' }}>
                                        (18 Nums • 4 Fichas)
                                    </span>
                                </div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.75rem',
                                    color: '#ffd700',
                                    cursor: 'pointer',
                                    textTransform: 'none',
                                    fontWeight: 'normal',
                                    userSelect: 'none'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={riskCopilotEnabled}
                                        onChange={(e) => setRiskCopilotEnabled(e.target.checked)}
                                        style={{
                                            accentColor: '#ffd700',
                                            cursor: 'pointer',
                                            width: '14px',
                                            height: '14px',
                                            margin: 0
                                        }}
                                    />
                                    <span>CO-PILOTO DE RIESGO</span>
                                </label>
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                justifyContent: 'space-between',
                                width: '100%'
                            }}>
                                {ELITE_SYSTEMS.map(sys => {
                                    const isActive = sys.bets.every(bId => currentBets[bId] && currentBets[bId] > 0);
                                    const isBeta = sys.id === 'BETA';

                                    // Calculate misses (madurez)
                                    let misses = 0;
                                    for (let i = numberHistory.length - 1; i >= 0; i--) {
                                        if (sys.numbers.includes(numberHistory[i])) break;
                                        misses++;
                                    }

                                    const tSystem = 37 / Math.max(sys.numbers.length, 1);
                                    const ratio = misses / tSystem;
                                    const percentage = Math.round(ratio * 100);

                                    return (
                                        <button
                                            key={sys.id}
                                            className={`elite-sys-btn ${isActive ? 'active' : ''} ${isBeta ? 'best' : ''}`}
                                            onClick={() => onBatchBet(sys.bets, selectedChip)}
                                            onMouseEnter={() => setHoveredNumbers(sys.numbers)}
                                            onMouseLeave={() => setHoveredNumbers([])}
                                            style={{
                                                flex: 1,
                                                height: '52px',
                                                background: isActive
                                                    ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.25) 0%, rgba(0, 100, 150, 0.4) 100%)'
                                                    : (isBeta
                                                        ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(30, 25, 10, 0.3) 100%)'
                                                        : 'rgba(20, 20, 20, 0.6)'),
                                                border: isActive
                                                    ? '2px solid #00f3ff'
                                                    : (isBeta ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.2)'),
                                                boxShadow: isActive
                                                    ? '0 0 12px rgba(0, 243, 255, 0.5)'
                                                    : (isBeta ? '0 0 8px rgba(212, 175, 55, 0.25)' : 'none'),
                                                color: isActive
                                                    ? '#e0ffff'
                                                    : (isBeta ? '#ffd700' : '#eee'),
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0 10px',
                                                textShadow: isActive ? '0 0 5px #00f3ff' : 'none',
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                            title={`${sys.name} • ICR: ${sys.icr} • IBES: ${sys.ibes} • Madurez: ${percentage}% (${misses} giros)\nClick para apostar • Hover para iluminar`}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px', lineHeight: '1.2' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ fontSize: '0.85rem' }}>{sys.badge}</span>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{sys.name}</span>
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: isActive ? '#d0f5ff' : '#aaa', fontWeight: 'bold' }}>
                                                    ICR: {sys.icr}
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                                                paddingLeft: '8px',
                                                height: '100%',
                                                alignSelf: 'stretch',
                                                justifyContent: 'center'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1' }}>
                                                    <span style={{ fontSize: '0.62rem', color: '#999', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                        MADUREZ
                                                    </span>
                                                    <span style={{
                                                        fontSize: '1.2rem',
                                                        fontWeight: '900',
                                                        color: misses > tSystem ? '#ff3d00' : misses > (tSystem / 2) ? '#ff9100' : '#00e676',
                                                        textShadow: misses > (tSystem / 2) ? '0 0 5px rgba(255, 145, 0, 0.3)' : 'none',
                                                        marginTop: '2px'
                                                    }}>
                                                        {percentage}%
                                                    </span>
                                                </div>
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    color: misses > (tSystem / 2) ? '#ff9100' : '#888',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1px'
                                                }} title={`Ausencia: ${misses} giros`}>
                                                    🔥{misses}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT / SIDEBAR COLUMN */}
                    <div className="ct-sidebar-panel">
                        {/* PERSISTENT VIP FINANCIAL TELEMETRY HEADER */}
                        <div style={{
                            padding: '12px 15px',
                            background: 'rgba(20, 20, 20, 0.7)',
                            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                            borderTopLeftRadius: '10px',
                            borderTopRightRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                            backdropFilter: 'blur(10px)',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.65rem', color: '#888', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    Saldo VIP
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontSize: '1.4rem', color: '#ffd700', fontFamily: "'Roboto Mono', monospace", fontWeight: 'bold', textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}>
                                        {formatBalance(balance)}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: (balance - initialCapital) > 0 ? '#4caf50' : '#888', fontFamily: "'Roboto Mono', monospace", fontWeight: 'bold' }}>
                                        {(balance - initialCapital) > 0 ? '+' : ''}{formatValue(balance - initialCapital)}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0, 0, 0, 0.4)', padding: '3px', borderRadius: '8px', border: '1px solid #333' }}>
                                {['COL', 'USA', 'EUR'].map(curr => (
                                    <button
                                        key={curr}
                                        onClick={() => setViewCurrency(curr)}
                                        className={`ct-currency-btn ${viewCurrency === curr ? 'active' : ''}`}
                                        style={{
                                            padding: '4px 8px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            background: viewCurrency === curr ? '#d4af37' : 'transparent',
                                            color: viewCurrency === curr ? '#000' : '#888',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            minWidth: '38px',
                                            lineHeight: '1.1'
                                        }}
                                        title={curr === 'COL' ? 'Pesos Colombianos' : (curr === 'USA' ? 'Dólares (USD)' : 'Euros (EUR)')}
                                    >
                                        <span>{curr}</span>
                                        {curr !== 'COL' && exchangeRates && (
                                            <span style={{ fontSize: '0.5rem', opacity: 0.8, fontWeight: 'normal', fontFamily: 'monospace', marginTop: '1px' }}>
                                                {curr === 'USA' && exchangeRates.COP ? `${Math.round(exchangeRates.COP)}` : ''}
                                                {curr === 'EUR' && exchangeRates.EUR && exchangeRates.COP ? `${Math.round(exchangeRates.COP / exchangeRates.EUR)}` : ''}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <AICopilotWidget />
                        <div className="ct-sidebar-tabs">
                            <button onClick={() => setActiveSidebarTab('intelligence')} className={`ct-tab-btn ${activeSidebarTab === 'intelligence' ? 'active' : ''}`}>
                                <span className="ct-tab-icon">🛰️</span>
                                <span>Inteligencia</span>
                            </button>
                            <button onClick={() => setActiveSidebarTab('forensic')} className={`ct-tab-btn ${activeSidebarTab === 'forensic' ? 'active' : ''}`}>
                                <span className="ct-tab-icon">🔬</span>
                                <span>Forense</span>
                            </button>
                            <button onClick={() => setActiveSidebarTab('banking')} className={`ct-tab-btn ${activeSidebarTab === 'banking' ? 'active' : ''}`}>
                                <span className="ct-tab-icon">🏦</span>
                                <span>Banca</span>
                            </button>
                            <button onClick={() => setActiveSidebarTab('stats')} className={`ct-tab-btn ${activeSidebarTab === 'stats' ? 'active' : ''}`}>
                                <span className="ct-tab-icon">🧮</span>
                                <span>Estadísticas</span>
                            </button>
                            <button onClick={() => setActiveSidebarTab('projections')} className={`ct-tab-btn ${activeSidebarTab === 'projections' ? 'active' : ''}`}>
                                <span className="ct-tab-icon">📈</span>
                                <span>Proyecciones</span>
                            </button>
                            <button onClick={() => setActiveSidebarTab('history')} className={`ct-tab-btn ${activeSidebarTab === 'history' ? 'active' : ''}`}>
                                <span className="ct-tab-icon">📜</span>
                                <span>Historial</span>
                            </button>
                            <button onClick={() => setActiveSidebarTab('session')} className={`ct-tab-btn ${activeSidebarTab === 'session' ? 'active' : ''}`}>
                                <span className="ct-tab-icon">⏱️</span>
                                <span>Sesión</span>
                            </button>
                        </div>
                        <div className="ct-sidebar-content">
                            {renderSidebarContent()}
                        </div>
                    </div>
                </div>
            ) : (
                /* --- DRAGGABLE / MOVEMENT LAYOUT (renders the 8 primary elements) --- */
                <>
                    {/* BRANDING HEADER */}
                    <Draggable index={1} totalCount={21} id="title" isEnabled={isEditMode} initialPos={positions.title} onDragEnd={onUpdatePos} style={{ zIndex: 4001, minWidth: '300px', minHeight: '60px', background: 'transparent' }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none'
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
                    <Draggable index={2} totalCount={21} id="layoutControls" isEnabled={isEditMode} initialPos={positions.layoutControls} onDragEnd={onUpdatePos} style={{ zIndex: 5000 }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSaveLayout} style={{
                                background: '#28a745', color: 'white', border: '1px solid #fff',
                                padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                            }}>
                                💾 GUARDAR
                            </button>
                            <button onClick={() => setIsEditMode(false)} style={{
                                background: '#00bcd4', color: '#001014', border: '2px solid #ffffff',
                                padding: '10px 22px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900',
                                boxShadow: '0 0 12px rgba(0, 188, 212, 0.55)'
                            }}>
                                MODO NORMAL
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleLoadLayout}
                                style={{ display: 'none' }}
                                accept=".json"
                            />
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
                            <button onClick={() => setShowStrategiesModal(true)} style={{
                                background: '#007bff', color: 'white', border: '1px solid #fff',
                                padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                            }}>
                                ESTRATEGIAS
                            </button>
                            <button onClick={() => setShowManualModal(true)} style={{
                                background: '#17a2b8', color: 'white', border: '1px solid #fff',
                                padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                            }}>
                                MANUAL
                            </button>
                            <button onClick={() => setViewMode3D(!viewMode3D)} style={{
                                background: '#6f42c1', color: 'white', border: '1px solid #fff',
                                padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                            }}>
                                {viewMode3D ? 'VISTA 2D' : 'VISTA 3D'}
                            </button>
                        </div>
                    </Draggable>

                    {/* LIVE MODE TOGGLE */}
                    <Draggable index={4} totalCount={21} id="modeToggle" isEnabled={isEditMode} initialPos={positions.modeToggle || { x: 800, y: 20 }} onDragEnd={onUpdatePos} style={{ zIndex: 4005 }}>
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
                    </Draggable>

                    {/* WHEEL */}
                    <Draggable index={5} totalCount={21} id="wheel" isEnabled={isEditMode} initialPos={positions.wheel} onDragEnd={onUpdatePos} style={{ padding: '10px' }} >
                        {viewMode3D ? (
                            <Roulette3D
                                wheelRotation={wheelRotation}
                                ballRotation={ballRotation}
                                showBall={showBall}
                                size={500}
                                lastWin={lastWin}
                                isTurboMode={isTurboMode}
                            />
                        ) : (
                            <RouletteWheel
                                width="500px"
                                wheelRotation={wheelRotation}
                                ballRotation={ballRotation}
                                showBall={showBall}
                                ballResetKey={ballResetKey}
                                highlightedNumbers={hoveredNumbers}
                                placedNumbers={placedNumbers}
                                bestPayoutNumbers={bestPayout?.numbers || []}
                                isTurboMode={isTurboMode}
                                size={500}
                                lastWin={lastWin}
                                isLiveMode={isLiveMode}
                                onManualWin={handleManualWin}
                                animState={animState}
                                isSpinning={isSpinning}
                            />
                        )}
                    </Draggable>

                    {/* BOARD */}
                    <Draggable index={6} totalCount={21} id="board" isEnabled={isEditMode} initialPos={positions.board} onDragEnd={onUpdatePos} >
                        <div style={{ transform: 'scale(0.9)', transformOrigin: 'top left', width: 'fit-content' }}>
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
                    </Draggable>

                    {/* CONTROLS HUD */}
                    <Draggable index={19} totalCount={21} id="controls" isEnabled={isEditMode} initialPos={positions.controls} onDragEnd={onUpdatePos}>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div className="ct-controls-panel">
                                {!isLiveMode && (
                                    <button className="ct-control-btn ct-btn-spin" onClick={handleSpin} disabled={isSpinning || timerMode}>
                                        {isSpinning ? "..." : (timerMode ? "AUTO" : "GIRAR")}
                                    </button>
                                )}
                                {!isLiveMode && (
                                    <button
                                        onClick={() => setIsTurboMode(!isTurboMode)}
                                        className={`ct-control-btn ${isTurboMode ? 'ct-btn-gold' : 'ct-btn-blue'}`}
                                        style={{
                                            background: isTurboMode ? 'linear-gradient(135deg, #1e1010, #3a0007)' : 'rgba(20, 20, 20, 0.85)',
                                            color: isTurboMode ? '#ff1744' : '#d4af37',
                                            border: isTurboMode ? '1px solid #ff1744' : '1px solid rgba(212, 175, 55, 0.4)',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '5px',
                                            boxShadow: isTurboMode ? '0 0 10px rgba(255, 23, 68, 0.3)' : 'none'
                                        }}
                                    >
                                        ⚡ TURBO: {isTurboMode ? 'ON' : 'OFF'}
                                    </button>
                                )}
                                <button onClick={handleRepeat} disabled={isSpinning || Object.keys(lastBets).length === 0} className="ct-control-btn ct-btn-blue">
                                    REPETIR
                                </button>
                                <button onClick={handleDouble} disabled={isSpinning || Object.keys(currentBets).length === 0} className="ct-control-btn ct-btn-blue">
                                    DOBLAR
                                </button>
                                <button onClick={handleUndo} disabled={isSpinning || betHistory.length === 0} className="ct-control-btn ct-btn-bordeaux">
                                    DESHACER
                                </button>
                                <button onClick={handleClear} disabled={isSpinning || Object.keys(currentBets).length === 0} className="ct-control-btn ct-btn-crimson">
                                    LIMPIAR
                                </button>
                            </div>
                            {!isLiveMode && (
                                <TimeBar
                                    isActive={timerMode && !isSpinning}
                                    timerMode={timerMode}
                                    duration={timerDuration}
                                    timeLeft={timeLeft}
                                    onToggle={() => {
                                        setTimerMode(!timerMode)
                                        if (!timerMode) setTimeLeft(timerDuration)
                                    }}
                                    onChangeDuration={setTimerDuration}
                                />
                            )}
                        </div>
                    </Draggable>

                    {/* CHIPS HUD */}
                    <Draggable index={21} totalCount={21} id="chips" isEnabled={isEditMode} initialPos={positions.chips} onDragEnd={onUpdatePos}>
                        <div className={`ui-overlay-loose ${isSpinning ? 'disabled' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="chip-selector">
                                {[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].map(val => {
                                    let display = formatChipValue(val)
                                    if (viewCurrency === 'COL') {
                                        const realVal = val * CHIP_RATES.COL
                                        if (realVal >= 1000000) display = '$' + (realVal / 1000000).toLocaleString() + 'M'
                                        else if (realVal >= 1000) display = '$' + (realVal / 1000).toLocaleString() + 'K'
                                    }
                                    return (
                                        <div key={val} className={`chip-btn chip-${val} ${selectedChip === val ? 'selected' : ''}`}
                                            onClick={() => setSelectedChip(val)}
                                            style={{
                                                fontSize: '1.1rem',
                                                ...(val === recommendedChipVal ? {
                                                    boxShadow: isRecommendedDueToGiovanni
                                                        ? '0 0 15px #ff1744, inset 0 0 8px #ff1744'
                                                        : '0 0 15px #ffd700, inset 0 0 8px #ffd700',
                                                    border: isRecommendedDueToGiovanni
                                                        ? '2px solid #ff1744'
                                                        : '2px solid #ffd700',
                                                    animation: isRecommendedDueToGiovanni
                                                        ? 'pulseRecommendedRed 1.5s infinite'
                                                        : 'pulseRecommendedGold 1.5s infinite'
                                                } : {})
                                            }}
                                        >
                                            {display}
                                        </div>
                                    )
                                })}
                            </div>
                            {riskCopilotEnabled && !smartAutoActive && (
                                <div className="copilot-suggest-banner" style={{
                                    marginTop: '8px',
                                    padding: '6px 12px',
                                    background: 'rgba(212, 175, 55, 0.12)',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    color: '#ffd700',
                                    fontSize: '0.85rem',
                                    textShadow: '0 0 5px rgba(212, 175, 55, 0.4)',
                                    boxShadow: 'inset 0 0 10px rgba(212, 175, 55, 0.05), 0 2px 8px rgba(0, 0, 0, 0.3)',
                                    backdropFilter: 'blur(4px)',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>⚡</span>
                                        <span>CO-PILOTO: Sugerido: <strong>{formatChipValue(suggestedChipVal)}</strong></span>
                                    </span>
                                    <button
                                        onClick={() => setSelectedChip(suggestedChipVal)}
                                        style={{
                                            background: 'linear-gradient(135deg, #ffd700, #b8860b)',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: '#000',
                                            padding: '2px 8px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.filter = 'brightness(1.2)';
                                            e.target.style.boxShadow = '0 0 8px rgba(212, 175, 55, 0.8)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.filter = 'none';
                                            e.target.style.boxShadow = '0 0 5px rgba(212, 175, 55, 0.5)';
                                        }}
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            )}
                        </div>
                    </Draggable>

                    {/* ELITE SYSTEMS DRAGGABLE */}
                    <Draggable index={22} totalCount={21} id="eliteSystems" isEnabled={isEditMode} initialPos={positions.eliteSystems} onDragEnd={onUpdatePos}>
                        <div className={`ui-overlay-loose ${isSpinning ? 'disabled' : ''}`} style={{
                            background: 'rgba(0,0,0,0.5)',
                            padding: '15px 20px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#d4af37',
                                fontWeight: 'bold',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                textShadow: '0 0 5px rgba(212, 175, 55, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                marginBottom: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>⚙️ SISTEMAS ÉLITE</span>
                                    <span style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'none', fontWeight: 'normal' }}>
                                        (18 Nums • 4 Fichas)
                                    </span>
                                </div>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.75rem',
                                    color: '#ffd700',
                                    cursor: 'pointer',
                                    textTransform: 'none',
                                    fontWeight: 'normal',
                                    userSelect: 'none'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={riskCopilotEnabled}
                                        onChange={(e) => setRiskCopilotEnabled(e.target.checked)}
                                        style={{
                                            accentColor: '#ffd700',
                                            cursor: 'pointer',
                                            width: '14px',
                                            height: '14px',
                                            margin: 0
                                        }}
                                    />
                                    <span>CO-PILOTO DE RIESGO</span>
                                </label>
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                justifyContent: 'space-between',
                                width: '100%'
                            }}>
                                {ELITE_SYSTEMS.map(sys => {
                                    const isActive = sys.bets.every(bId => currentBets[bId] && currentBets[bId] > 0);
                                    const isBeta = sys.id === 'BETA';

                                    // Calculate misses (madurez)
                                    let misses = 0;
                                    for (let i = numberHistory.length - 1; i >= 0; i--) {
                                        if (sys.numbers.includes(numberHistory[i])) break;
                                        misses++;
                                    }

                                    const tSystem = 37 / Math.max(sys.numbers.length, 1);
                                    const ratio = misses / tSystem;
                                    const percentage = Math.round(ratio * 100);

                                    return (
                                        <button
                                            key={sys.id}
                                            className={`elite-sys-btn ${isActive ? 'active' : ''} ${isBeta ? 'best' : ''}`}
                                            onClick={() => onBatchBet(sys.bets, selectedChip)}
                                            onMouseEnter={() => setHoveredNumbers(sys.numbers)}
                                            onMouseLeave={() => setHoveredNumbers([])}
                                            style={{
                                                flex: 1,
                                                height: '52px',
                                                background: isActive
                                                    ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.25) 0%, rgba(0, 100, 150, 0.4) 100%)'
                                                    : (isBeta
                                                        ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(30, 25, 10, 0.3) 100%)'
                                                        : 'rgba(20, 20, 20, 0.6)'),
                                                border: isActive
                                                    ? '2px solid #00f3ff'
                                                    : (isBeta ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.2)'),
                                                boxShadow: isActive
                                                    ? '0 0 12px rgba(0, 243, 255, 0.5)'
                                                    : (isBeta ? '0 0 8px rgba(212, 175, 55, 0.25)' : 'none'),
                                                color: isActive
                                                    ? '#e0ffff'
                                                    : (isBeta ? '#ffd700' : '#eee'),
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0 10px',
                                                textShadow: isActive ? '0 0 5px #00f3ff' : 'none',
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                            title={`${sys.name} • ICR: ${sys.icr} • IBES: ${sys.ibes} • Madurez: ${percentage}% (${misses} giros)\nClick para apostar • Hover para iluminar`}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px', lineHeight: '1.2' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ fontSize: '0.85rem' }}>{sys.badge}</span>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{sys.name}</span>
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: isActive ? '#d0f5ff' : '#aaa', fontWeight: 'bold' }}>
                                                    ICR: {sys.icr}
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
                                                paddingLeft: '8px',
                                                height: '100%',
                                                alignSelf: 'stretch',
                                                justifyContent: 'center'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1' }}>
                                                    <span style={{ fontSize: '0.62rem', color: '#999', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                        MADUREZ
                                                    </span>
                                                    <span style={{
                                                        fontSize: '1.2rem',
                                                        fontWeight: '900',
                                                        color: misses > tSystem ? '#ff3d00' : misses > (tSystem / 2) ? '#ff9100' : '#00e676',
                                                        textShadow: misses > (tSystem / 2) ? '0 0 5px rgba(255, 145, 0, 0.3)' : 'none',
                                                        marginTop: '2px'
                                                    }}>
                                                        {percentage}%
                                                    </span>
                                                </div>
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    color: misses > (tSystem / 2) ? '#ff9100' : '#888',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1px'
                                                }} title={`Ausencia: ${misses} giros`}>
                                                    🔥{misses}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </Draggable>

                    {/* SIDEBAR IN EDIT MODE */}
                    <Draggable index={3} totalCount={21} id="sidebar" isEnabled={isEditMode} initialPos={positions.sidebar || { x: 1050, y: 10 }} onDragEnd={onUpdatePos} style={{ zIndex: 4000 }}>
                        <div className="ct-sidebar-panel" style={{ height: '730px' }}>
                            {/* PERSISTENT VIP FINANCIAL TELEMETRY HEADER */}
                            <div style={{
                                padding: '12px 15px',
                                background: 'rgba(20, 20, 20, 0.7)',
                                borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                                borderTopLeftRadius: '10px',
                                borderTopRightRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                                backdropFilter: 'blur(10px)',
                                flexShrink: 0
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#888', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                        Saldo VIP
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        <span style={{ fontSize: '1.4rem', color: '#ffd700', fontFamily: "'Roboto Mono', monospace", fontWeight: 'bold', textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}>
                                            {formatBalance(balance)}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: (balance - initialCapital) > 0 ? '#4caf50' : '#888', fontFamily: "'Roboto Mono', monospace", fontWeight: 'bold' }}>
                                            {(balance - initialCapital) > 0 ? '+' : ''}{formatValue(balance - initialCapital)}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0, 0, 0, 0.4)', padding: '3px', borderRadius: '8px', border: '1px solid #333' }}>
                                    {['COL', 'USA', 'EUR'].map(curr => (
                                        <button
                                            key={curr}
                                            onClick={() => setViewCurrency(curr)}
                                            className={`ct-currency-btn ${viewCurrency === curr ? 'active' : ''}`}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                background: viewCurrency === curr ? '#d4af37' : 'transparent',
                                                color: viewCurrency === curr ? '#000' : '#888',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                minWidth: '38px',
                                                lineHeight: '1.1'
                                            }}
                                            title={curr === 'COL' ? 'Pesos Colombianos' : (curr === 'USA' ? 'Dólares (USD)' : 'Euros (EUR)')}
                                        >
                                            <span>{curr}</span>
                                            {curr !== 'COL' && exchangeRates && (
                                                <span style={{ fontSize: '0.5rem', opacity: 0.8, fontWeight: 'normal', fontFamily: 'monospace', marginTop: '1px' }}>
                                                    {curr === 'USA' && exchangeRates.COP ? `${Math.round(exchangeRates.COP)}` : ''}
                                                    {curr === 'EUR' && exchangeRates.EUR && exchangeRates.COP ? `${Math.round(exchangeRates.COP / exchangeRates.EUR)}` : ''}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <AICopilotWidget />
                            <div className="ct-sidebar-tabs">
                                <button onClick={() => setActiveSidebarTab('intelligence')} className={`ct-tab-btn ${activeSidebarTab === 'intelligence' ? 'active' : ''}`}>
                                    <span className="ct-tab-icon">🛰️</span>
                                    <span>Inteligencia</span>
                                </button>
                                <button onClick={() => setActiveSidebarTab('forensic')} className={`ct-tab-btn ${activeSidebarTab === 'forensic' ? 'active' : ''}`}>
                                    <span className="ct-tab-icon">🔬</span>
                                    <span>Forense</span>
                                </button>
                                <button onClick={() => setActiveSidebarTab('banking')} className={`ct-tab-btn ${activeSidebarTab === 'banking' ? 'active' : ''}`}>
                                    <span className="ct-tab-icon">🏦</span>
                                    <span>Banca</span>
                                </button>
                                <button onClick={() => setActiveSidebarTab('stats')} className={`ct-tab-btn ${activeSidebarTab === 'stats' ? 'active' : ''}`}>
                                    <span className="ct-tab-icon">🧮</span>
                                    <span>Estadísticas</span>
                                </button>
                                <button onClick={() => setActiveSidebarTab('projections')} className={`ct-tab-btn ${activeSidebarTab === 'projections' ? 'active' : ''}`}>
                                    <span className="ct-tab-icon">📈</span>
                                    <span>Proyecciones</span>
                                </button>
                                <button onClick={() => setActiveSidebarTab('history')} className={`ct-tab-btn ${activeSidebarTab === 'history' ? 'active' : ''}`}>
                                    <span className="ct-tab-icon">📜</span>
                                    <span>Historial</span>
                                </button>
                                <button onClick={() => setActiveSidebarTab('session')} className={`ct-tab-btn ${activeSidebarTab === 'session' ? 'active' : ''}`}>
                                    <span className="ct-tab-icon">⏱️</span>
                                    <span>Sesión</span>
                                </button>
                            </div>
                            <div className="ct-sidebar-content">
                                {renderSidebarContent()}
                            </div>
                        </div>
                    </Draggable>
                </>
            )}

            {/* --- GLOBAL OVERLAYS & MODALS --- */}
            {/* 6. WIN EFFECTS (Particles) */}
            <WinEffects lastWin={lastWin} lastWinAmount={lastWinAmount} />

            {/* 7. GIANT DR STATUS OVERLAY (POP-UP) */}
            {statusOverlay && (
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
            )}

            {/* NEW: RECORD / VICTORY MODAL */}
            {showRecordModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', zIndex: 10001,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        padding: '3px', borderRadius: '22px',
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
            )}

            {/* BANKRUPTCY MODAL */}
            {showBankruptcy && !isSpinning && (
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
            )}

            {/* WITHDRAW MODAL */}
            {showWithdrawModal && (
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
                                    background: 'linear-gradient(145deg, #d32f2f, #b71c1c)',
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
            )}

            {/* RESET MODAL */}
            {showResetModal && (
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
            )}

            {/* TOOLTIP LENS & HOVER */}
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

            {/* GAME OVERLAY MANAGER (Handles all secondary modals) */}
            <GameOverlayManager
                showLayoutHelp={showLayoutHelp} setShowLayoutHelp={setShowLayoutHelp}
                showHistoryModal={showHistoryModal} setShowHistoryModal={setShowHistoryModal}
                showHelp={showHelpModal} setShowHelp={setShowHelpModal}
                showReloadModal={showReloadModal} setShowReloadModal={setShowReloadModal}
                showStrategiesModal={showStrategiesModal} setShowStrategiesModal={setShowStrategiesModal}
                showRubric={showRubricModal} setShowRubric={setShowRubricModal}
                showAppliedRubric={showAppliedRubric} setShowAppliedRubric={setShowAppliedRubric}
                showProjectionsModal={showProjectionsModal} setShowProjectionsModal={setShowProjectionsModal}
                showManualModal={showManualModal} setShowManualModal={setShowManualModal}
                showAudioSettings={showAudioSettingsModal} setShowAudioSettings={setShowAudioSettingsModal}
                showDetailedHistory={showDetailedHistory} setShowDetailedHistory={setShowDetailedHistory}
                showVisualRubric={showVisualRubric} setShowVisualRubric={setShowVisualRubric}
                showAppliedVisualRubric={showAppliedVisualRubric} setShowAppliedVisualRubric={setShowAppliedVisualRubric}
                showValueRubric={showValueRubric} setShowValueRubric={setShowValueRubric}
                showAppliedValueRubric={showAppliedValueRubric} setShowAppliedValueRubric={setShowAppliedValueRubric}
                showForensicManual={showForensicManual} setShowForensicManual={setShowForensicManual}
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
            {showEfficiencyModal && (
                <SystemEfficiencyModal
                    onClose={() => setShowEfficiencyModal(false)}
                    onBatchBet={onBatchBet}
                    currentBets={currentBets}
                    selectedChip={selectedChip}
                />
            )}

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

            {/* ECONOMIC VALUE MODAL */}
            {showEconomicModal && (
                <EconomicValueModal onClose={() => setShowEconomicModal(false)} />
            )}

            <style>{`
                @keyframes pulseFlash {
                    0% { opacity: 0.5; }
                    50% { opacity: 0.95; }
                    100% { opacity: 0.5; }
                }
                @keyframes pulseRecommendedGold {
                    0% { transform: scale(1); box-shadow: 0 0 8px #ffd700; }
                    50% { transform: scale(1.08); box-shadow: 0 0 20px #ffd700; }
                    100% { transform: scale(1); box-shadow: 0 0 8px #ffd700; }
                }
                @keyframes pulseRecommendedRed {
                    0% { transform: scale(1); box-shadow: 0 0 8px #ff1744; }
                    50% { transform: scale(1.08); box-shadow: 0 0 20px #ff1744; }
                    100% { transform: scale(1); box-shadow: 0 0 8px #ff1744; }
                }
            `}</style>
        </div>
    )
}
