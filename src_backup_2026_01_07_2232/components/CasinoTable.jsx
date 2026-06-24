/* eslint-disable react-hooks/purity */
import React, { useState, useEffect } from 'react'
import { RouletteWheel } from './RouletteWheel'
import { BettingBoard } from './BettingBoard'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { soundManager } from '../utils/SoundManager'
import './CasinoTable.css'
import { Draggable } from './Draggable'
import { HelpModal } from './HelpModal'
import { HistoryModal } from './HistoryModal'
import { StatisticsPanel } from './StatisticsPanel'
import { Racetrack } from './Racetrack' // Import was missing!
import { LIMITS, getBetType } from '../config/GameLimits'
import { calculateRisk } from '../utils/BetValidator'

// Sequence for index lookup
const WHEEL_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

// 1. Matrix definitions
const BALL_TYPES = [
    { name: 'Ivorina (4.5g)', color: '#fffff0' },
    { name: 'Teflón (3.2g)', color: '#ffffff' },
    { name: 'Cerámica (5.8g)', color: '#f0f0e0' },
    { name: 'Metal (8.0g)', color: '#cccccc' }
]

const SPEEDS = [
    { name: '4.2 m/s (15.1 km/h)', laps: 20 },
    { name: '7.5 m/s (27.0 km/h)', laps: 30 },
    { name: '11.3 m/s (40.6 km/h)', laps: 45 }
]

const WHEEL_SPEEDS = [
    { name: 'Lento (L)', laps: 15 },
    { name: 'Normal (N)', laps: 22 },
    { name: 'Rápido (R)', laps: 32 }
]

const START_POINTS = [
    { name: 'Norte 0 Grados', angle: 0 },
    { name: 'Noreste 45 Grados', angle: 45 },
    { name: 'Este 90 Grados', angle: 90 },
    { name: 'Sureste 135 Grados', angle: 135 },
    { name: 'Sur 180 Grados', angle: 180 },
    { name: 'Suroeste 225 Grados', angle: 225 },
    { name: 'Oeste 270 Grados', angle: 270 },
    { name: 'Noroeste 315 Grados', angle: 315 },
]

export const CasinoTable = () => {
    console.log("DEBUG: CasinoTable Mounting...")
    // Rotation State
    const [wheelRotation, setWheelRotation] = useState(0)
    const [ballRotation, setBallRotation] = useState(0)
    const [ballResetKey, setBallResetKey] = useState(0)

    // Game State
    const [isSpinning, setIsSpinning] = useState(false)
    const [lastWin, setLastWin] = useState(null)
    const [showBall, setShowBall] = useState(false)
    const [lastWinAmount, setLastWinAmount] = useState(0)

    // Currency & View State
    const [viewCurrency, setViewCurrency] = useState('COL')

    // Store Selectors
    const gameMode = useFinancialStore(state => state.gameMode)
    const realCapital = useFinancialStore(state => state.realCapital)
    const demoCapital = useFinancialStore(state => state.demoCapital)
    const toggleMode = useFinancialStore(state => state.toggleMode)

    // Derived Balance (Safer than store getter)
    const balance = gameMode === 'REAL' ? realCapital : demoCapital

    console.log("DEBUG: Store Selectors OK", { gameMode, balance })

    // Actions & State
    const currentRoundBet = useFinancialStore(state => state.currentRoundBet)
    const placeBet = useFinancialStore(state => state.placeBet)
    const refundBet = useFinancialStore(state => state.refundBet)
    const resolveRound = useFinancialStore(state => state.resolveRound)
    const transactionLog = useFinancialStore(state => state.transactionLog || [])
    const reloadCapital = useFinancialStore(state => state.reloadCapital)

    // Betting State
    const [currentBets, setCurrentBets] = useState({})
    // Initialize lastBets from localStorage if available
    const [lastBets, setLastBets] = useState(() => {
        try {
            const saved = localStorage.getItem('casinoLastBets')
            return saved ? JSON.parse(saved) : {}
        } catch (e) {
            return {}
        }
    })

    // Save lastBets to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('casinoLastBets', JSON.stringify(lastBets))
    }, [lastBets])
    const [betHistory, setBetHistory] = useState([]) // For Undo

    const [selectedChip, setSelectedChip] = useState(5)
    // Wheel Highlight Sync
    const [hoveredNumbers, setHoveredNumbers] = useState([])

    // MODALS
    const [showHistory, setShowHistory] = useState(false)
    const [showBankruptcy, setShowBankruptcy] = useState(false)

    // Bankruptcy Check
    useEffect(() => {
        if (balance < 1 && currentRoundBet === 0 && !isSpinning) {
            setShowBankruptcy(true)
        }
    }, [balance, currentRoundBet, isSpinning])

    // DEFAULT POSITIONS (Updated for better visibility)
    const DEFAULT_POSITIONS = {
        wheel: { x: 50, y: 150 },
        board: { x: 600, y: 100 },
        banking: { x: 1200, y: 20 },
        win: { x: 1200, y: 350 },
        controls: { x: 600, y: 550 }, // Moved up
        chips: { x: 1200, y: 120 },
        paytable: { x: 20, y: 20 },
        telemetry: { x: 50, y: 700 }, // Moved up
        layoutControls: { x: 20, y: 80 }, // Moved to top-left area for safety
        statistics: { x: 900, y: 20 },
        racetrack: { x: 600, y: 400 } // Explicit default
    }

    // LAYOUT STATE
    const [isEditMode, setIsEditMode] = useState(false)
    const [showHelp, setShowHelp] = useState(false)

    // Load positions from localStorage or default
    const [positions, setPositions] = useState(() => {
        try {
            const saved = localStorage.getItem('casinoLayout_v2') // Version 2 to force reset
            if (saved) {
                const parsed = JSON.parse(saved)
                return { ...DEFAULT_POSITIONS, ...parsed }
            }
        } catch (e) {
            console.error("Failed to load layout", e)
        }
        return DEFAULT_POSITIONS
    })
    console.log("DEBUG: Layout Init OK", positions)

    const onUpdatePos = (id, newPos) => {
        setPositions(prev => {
            const next = { ...prev, [id]: newPos }
            localStorage.setItem('casinoLayout_v2', JSON.stringify(next))
            return next
        })
    }

    const resetLayout = () => {
        setPositions(DEFAULT_POSITIONS)
        localStorage.removeItem('casinoLayout_v2')
    }

    // Currency Exchange Rates (Base: 1 Logic Unit)
    // COL: 1 unit = 100 Pesos
    // USA: 1 unit = 1 Dollar
    // EUR: 1 unit = 1 Euro
    const RATES = {
        COL: 100,
        USA: 1,
        EUR: 1
    }

    const formatValue = (creditValue) => {
        const val = creditValue * (RATES[viewCurrency] || 1) // Safety fallback

        if (viewCurrency === 'COL') return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
        if (viewCurrency === 'USA') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
        if (viewCurrency === 'EUR') return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
        return val
    }

    const formatBalance = (creditValue) => {
        return formatValue(creditValue)
    }

    // Physics Debug State (Safe Init)
    const [physicsState, setPhysicsState] = useState(() => ({
        ballType: BALL_TYPES[0],
        ballSpeed: SPEEDS[0],
        wheelSpeed: '---',
        wheelSpeedObject: WHEEL_SPEEDS[0],
        startPoint: START_POINTS[0],
        wheelDirection: 'Horario',
        ballDirection: 'Anti-Horario'
    }))
    console.log("DEBUG: Physics Init OK", physicsState)

    // Init Random Physics on Mount
    const randomizePhysicsDisplay = () => {
        const pBall = BALL_TYPES[Math.floor(Math.random() * BALL_TYPES.length)]
        const pSpeed = SPEEDS[Math.floor(Math.random() * SPEEDS.length)]
        const pWheel = WHEEL_SPEEDS[Math.floor(Math.random() * WHEEL_SPEEDS.length)]
        const pStart = START_POINTS[Math.floor(Math.random() * START_POINTS.length)]
        const pDirVal = Math.random() > 0.5 ? 1 : -1

        const dist = pWheel.laps * 2.5
        const mps = (dist / 12.5).toFixed(1)

        setPhysicsState({
            ballType: pBall,
            ballSpeed: pSpeed,
            wheelSpeed: `${pWheel.name} - ${mps} m/s`,
            wheelSpeedObject: pWheel,
            startPoint: pStart,
            wheelDirection: pDirVal === 1 ? 'Horario ↻' : 'Anti-Horario ↺',
            ballDirection: pDirVal === 1 ? 'Anti-Horario ↺' : 'Horario ↻'
        })
    }
    useEffect(() => {
        randomizePhysicsDisplay()
    }, [])



    // Spin Logic
    const handleSpin = () => {
        if (isSpinning) return

        // 1. Randomize for this spin
        const pBall = BALL_TYPES[Math.floor(Math.random() * BALL_TYPES.length)]
        const pBallSpeed = SPEEDS[Math.floor(Math.random() * SPEEDS.length)]
        const pWheelSpeed = WHEEL_SPEEDS[Math.floor(Math.random() * WHEEL_SPEEDS.length)]
        const pStart = START_POINTS[Math.floor(Math.random() * START_POINTS.length)]
        const pDirVal = Math.random() > 0.5 ? 1 : -1

        const wheelDirName = pDirVal === 1 ? 'Horario' : 'Anti-Horario'
        const ballDirName = pDirVal === 1 ? 'Anti-Horario' : 'Horario'

        const wheelLaps = pWheelSpeed.laps
        const dist = wheelLaps * 2.5
        const mps = (dist / 12.5).toFixed(1)
        const kmh = (mps * 3.6).toFixed(1)

        setPhysicsState({
            ballType: pBall,
            ballSpeed: pBallSpeed,
            wheelSpeed: `${mps} m/s (${kmh} km/h)`,
            wheelSpeedObject: pWheelSpeed,
            startPoint: pStart,
            wheelDirection: wheelDirName,
            ballDirection: ballDirName
        })

        // 2. Setup
        try {
            soundManager.playSpinStart() // AUDIO
            setIsSpinning(true)

            // Save for Repeat
            if (Object.keys(currentBets).length > 0) {
                setLastBets(currentBets)
            }
            setBetHistory([]) // Clear undo history for new round

            setLastWin(null)
            setLastWinAmount(0)
            setShowBall(true)
            setBallResetKey(prev => prev + 1)
            setBallRotation(pStart.angle)

            // 3. Winner
            let winningNumber = WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)]

            // --- VERIFICATION INSTRUMENTATION ---
            if (window.forceWinningNumber !== undefined && window.forceWinningNumber !== null) {
                const forced = parseInt(window.forceWinningNumber)
                if (WHEEL_NUMBERS.includes(forced)) {
                    console.log("DEBUG: Forcing winning number to", forced)
                    winningNumber = forced
                }
            }
            // ------------------------------------
            const winningIndex = WHEEL_NUMBERS.indexOf(winningNumber)

            // 4. Deltas
            const wheelDelta = pDirVal * ((wheelLaps * 360) + Math.random() * 360)
            const nextWheelRotation = wheelRotation + wheelDelta

            const ballDirVal = -pDirVal
            const totalBallLaps = pBallSpeed.laps
            const ballTotalDegrees = totalBallLaps * 360
            const wedgeAngle = winningIndex * (360 / 37)
            const targetWorldAngle = nextWheelRotation + wedgeAngle
            const idealEnd = pStart.angle + (ballDirVal * ballTotalDegrees)
            const diff = idealEnd - targetWorldAngle
            const rounds = Math.round(diff / 360)
            const nextBallRotation = targetWorldAngle + (rounds * 360)

            // 5. Animate
            setTimeout(() => {
                setWheelRotation(nextWheelRotation)
                setBallRotation(nextBallRotation)
            }, 100)

            // 6. Cleanup
            setTimeout(() => {
                try {
                    setIsSpinning(false)
                    const color = winningNumber === 0 ? 'Cero' : (REDS.includes(winningNumber) ? 'Rojo' : 'Negro')
                    soundManager.announceNumber(winningNumber, color)

                    setLastWin(winningNumber)
                    resolvePayouts(winningNumber)

                    // Clear highlights after 5 seconds
                    setTimeout(() => {
                        setLastWin(null)
                        setLastWinAmount(0)
                        setBallResetKey(prev => prev + 1) // Optional: Reset ball position or similar? Maybe not needed.
                    }, 5000)

                } catch (error) {
                    console.error("Error resolving spin:", error)
                    setIsSpinning(false) // Force reset on error
                }
            }, 12500)

        } catch (e) {
            console.error("Critical error in spin setup:", e)
            setIsSpinning(false)
        }
    }

    console.log("DEBUG RENDER: Bets:", Object.keys(currentBets).length, "SelectedChip:", selectedChip)

    // DEBUG OVERLAY
    const debugOverlay = (
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, background: 'rgba(0,0,0,0.5)', color: 'lime', pointerEvents: 'none' }}>
            DEBUG: Bets: {Object.keys(currentBets).join(', ')} | Chip: {selectedChip}
        </div>
    )

    const resolvePayouts = (winningNumber) => {
        let totalWinnings = 0
        const winningNumStr = winningNumber.toString()

        // Rules
        // Rules
        const isRed = REDS.includes(winningNumber)
        const isBlack = !isRed && winningNumber !== 0
        const isEven = winningNumber !== 0 && winningNumber % 2 === 0
        const isOdd = winningNumber !== 0 && winningNumber % 2 !== 0
        const isLow = winningNumber >= 1 && winningNumber <= 18
        const isHigh = winningNumber >= 19 && winningNumber <= 36

        const isDoz1 = winningNumber >= 1 && winningNumber <= 12
        const isDoz2 = winningNumber >= 13 && winningNumber <= 24
        const isDoz3 = winningNumber >= 25 && winningNumber <= 36

        const isCol1 = winningNumber !== 0 && winningNumber % 3 === 1
        const isCol2 = winningNumber !== 0 && winningNumber % 3 === 2
        const isCol3 = winningNumber !== 0 && winningNumber % 3 === 0

        Object.entries(currentBets).forEach(([betId, amount]) => {
            let multiplier = 0

            // 0. Parse Complex Bets
            if (betId.startsWith('SPLIT')) {
                const parts = betId.split('_')
                if (parts.includes(winningNumStr)) multiplier = 17
            } else if (betId.startsWith('CORNER')) {
                const parts = betId.split('_')
                if (parts.includes(winningNumStr)) multiplier = 8
            } else if (betId.startsWith('STREET')) {
                const startNum = parseInt(betId.split('_')[1])
                if (winningNumber >= startNum && winningNumber <= startNum + 2) multiplier = 11
            } else if (betId.startsWith('LINE')) {
                const startNum = parseInt(betId.split('_')[1])
                if (winningNumber >= startNum && winningNumber <= startNum + 5) multiplier = 5
            } else if (betId.startsWith('TRIO')) {
                // TRIO_0_1_2 or TRIO_0_2_3
                const parts = betId.split('_')
                if (parts.includes(winningNumStr)) multiplier = 11
            } else if (betId.startsWith('BASKET')) {
                // BASKET_0_1_2_3
                const parts = betId.split('_')
                if (parts.includes(winningNumStr)) multiplier = 8
            }

            // 1. Straight Up
            else if (betId === winningNumStr) multiplier = 35

            // 2. Simple Chances
            else if (betId === 'RED' && isRed) multiplier = 1
            else if (betId === 'BLACK' && isBlack) multiplier = 1
            else if (betId === 'EVEN' && isEven) multiplier = 1
            else if (betId === 'ODD' && isOdd) multiplier = 1
            else if (betId === 'LOW' && isLow) multiplier = 1
            else if (betId === 'HIGH' && isHigh) multiplier = 1

            // 3. Dozens/Columns
            else if (betId === 'DOZ1' && isDoz1) multiplier = 2
            else if (betId === 'DOZ2' && isDoz2) multiplier = 2
            else if (betId === 'DOZ3' && isDoz3) multiplier = 2
            else if (betId === 'COL1' && isCol1) multiplier = 2
            else if (betId === 'COL2' && isCol2) multiplier = 2
            else if (betId === 'COL3' && isCol3) multiplier = 2

            if (multiplier > 0) {
                totalWinnings += amount + (amount * multiplier)
            }
        })

        if (totalWinnings > 0) {
            soundManager.playWin(totalWinnings)
            setLastWinAmount(totalWinnings)
        } else {
            setLastWinAmount(0)
        }

        // Pass winningNumber to resolveRound for history tracking
        resolveRound(totalWinnings, winningNumber)
        setCurrentBets({})
    }

    const handlePlaceBet = (betId) => {
        console.log("DEBUG EVENT: handlePlaceBet called with", betId, "SelectedChip:", selectedChip)
        if (isSpinning) {
            console.log("DEBUG EVENT: Spin in progress, bet ignored")
            return
        }

        // --- LIMITS & VALIDATION 1: Chips ---
        const limits = LIMITS[gameMode]

        // 1. Min Bet
        if (selectedChip < limits.MIN_BET) {
            console.warn("DEBUG EVENT: Min bet rejection", selectedChip, limits.MIN_BET)
            alert(`Mínimo de apuesta es ${limits.MIN_BET}`) // Use Toast later
            return
        }

        // 2. Max Total Bet Prediction
        const predictedTotalBet = currentRoundBet + selectedChip // Approx, store might lag? No, store is sync enough usually or passed via prop.
        if (predictedTotalBet > limits.MAX_TOTAL_BET) {
            alert(`Límite total de apuesta excedido (${limits.MAX_TOTAL_BET})`)
            return
        }

        // 3. Max Positions
        const currentPositions = Object.keys(currentBets).length
        if (!currentBets[betId] && currentPositions >= limits.MAX_POSITIONS) {
            alert(`Máximo de ${limits.MAX_POSITIONS} posiciones permitidas.`)
            return
        }

        // 4. THE PRO CHECK: Max Potential Win ("Worst Case")
        // Create a temporary state of what bets WOULD be
        const nextBets = { ...currentBets, [betId]: (currentBets[betId] || 0) + selectedChip }
        const { maxWin } = calculateRisk(nextBets)

        if (maxWin > limits.MAX_WIN_PER_SPIN) {
            alert(`Esta apuesta excede el pago máximo permitido de la mesa (${limits.MAX_WIN_PER_SPIN}).`)
            return
        }

        // Proceed
        const betType = getBetType(betId)
        const currentBetOnSpot = currentBets[betId] || 0
        const result = placeBet(selectedChip, betType, currentBetOnSpot)

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') {
                alert("Sin saldo suficiente")
            } else if (result.error === 'MAX_TOTAL_EXCEEDED') {
                alert(`Límite total de mesa excedido ($${result.limit})`)
            } else if (result.error === 'LIMIT_EXCEEDED') {
                alert(`Apuesta máxima para ${result.type} es $${result.limit}`)
            }
            return
        }

        try {
            if (soundManager && soundManager.playChip) {
                soundManager.playChip()
            }
        } catch (e) {
            console.error(e)
        }

        setCurrentBets(prev => ({
            ...prev,
            [betId]: (prev[betId] || 0) + selectedChip
        }))

        // History for Undo
        setBetHistory(prev => [...prev, { bets: { [betId]: selectedChip }, totalCost: selectedChip }])
    }

    const handleBatchBets = (betsToPlace) => {
        // betsToPlace: Array of betIds ['1', 'SPLIT_1_2', ...]
        if (isSpinning) return
        const totalCost = betsToPlace.length * selectedChip

        const success = placeBet(totalCost)
        if (!success) {
            alert(`Saldo insuficiente para esta apuesta completa ($${totalCost})`)
            return
        }

        soundManager.playChip()

        const newBatch = {}
        betsToPlace.forEach(id => {
            newBatch[id] = selectedChip
        })

        setCurrentBets(prev => {
            const next = { ...prev }
            betsToPlace.forEach(id => {
                next[id] = (next[id] || 0) + selectedChip
            })
            return next
        })

        setBetHistory(prev => [...prev, { bets: newBatch, totalCost: totalCost }])
    }

    // --- NEW BETTING CONTROLS ---

    const handleUndo = () => {
        if (isSpinning || betHistory.length === 0) return

        const lastAction = betHistory[betHistory.length - 1]

        // 1. Refund
        refundBet(lastAction.totalCost)

        // 2. Remove bets
        setCurrentBets(prev => {
            const next = { ...prev }
            Object.entries(lastAction.bets).forEach(([id, amount]) => {
                if (next[id]) {
                    next[id] -= amount
                    if (next[id] <= 0) delete next[id]
                }
            })
            return next
        })

        // 3. Update History
        setBetHistory(prev => prev.slice(0, -1))
        soundManager.playChip() // Maybe a different sound?
    }

    const handleClear = () => {
        if (isSpinning || Object.keys(currentBets).length === 0) return

        // Refund total current bet
        refundBet(currentRoundBet)

        setCurrentBets({})
        setBetHistory([])
        soundManager.playChip()
    }

    const handleRepeat = () => {
        if (isSpinning || Object.keys(lastBets).length === 0) return
        if (Object.keys(currentBets).length > 0) {
            // Optional: Alert that table must be empty? Or just add to it? 
            // Standard behavior: Repeat adds previous bets. 
        }

        // Calculate total cost
        const cost = Object.values(lastBets).reduce((a, b) => a + b, 0)

        // Pass 'BATCH' to avoid per-spot limit check (since we are repeating a valid set)
        const result = placeBet(cost, 'BATCH')
        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') alert("Saldo insuficiente para repetir apuesta")
            else if (result.error === 'MAX_TOTAL_EXCEEDED') alert(`Límite total de mesa excedido ($${result.limit})`)
            return
        }

        setCurrentBets(prev => {
            const next = { ...prev }
            Object.entries(lastBets).forEach(([id, amount]) => {
                next[id] = (next[id] || 0) + amount
            })
            return next
        })

        setBetHistory(prev => [...prev, { bets: lastBets, totalCost: cost }])
        soundManager.playChip()
    }

    const handleDouble = () => {
        if (isSpinning || Object.keys(currentBets).length === 0) return

        // Cost is equal to current currentRoundBet (since we are duplicating everything)
        // Wait, currentRoundBet is in store. 
        const cost = currentRoundBet

        const result = placeBet(cost, 'BATCH')
        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') alert("Saldo insuficiente para doblar")
            else if (result.error === 'MAX_TOTAL_EXCEEDED') alert(`Límite total de mesa excedido ($${result.limit})`)
            return
        }

        const addedBets = { ...currentBets } // We are adding exactly what we have

        setCurrentBets(prev => {
            const next = { ...prev }
            Object.keys(next).forEach(key => {
                next[key] *= 2
            })
            return next
        })

        setBetHistory(prev => [...prev, { bets: addedBets, totalCost: cost }])
        soundManager.playChip()
    }



    return (
        <div className="casino-table" style={{ display: 'block' }}> {/* Switch to block for absolute children */}


            {/* LOCK/UNLOCK BUTTON - Now Draggable */}
            <Draggable id="layoutControls" isEnabled={isEditMode} initialPos={positions.layoutControls} onDragEnd={onUpdatePos}
                style={{ zIndex: 5000 }} // Keep on top
            >
                <div style={{ display: 'flex', gap: '10px' }}>
                    {isEditMode && (
                        <button
                            onClick={resetLayout}
                            style={{
                                background: '#d4af37', color: 'black', border: 'none',
                                padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            ↺ RESET
                        </button>
                    )}
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
                </div>
            </Draggable>

            {/* 1. WHEEL SECTION */}
            <Draggable id="wheel" isEnabled={isEditMode} initialPos={positions.wheel} onDragEnd={onUpdatePos}>
                <RouletteWheel
                    wheelRotation={wheelRotation}
                    ballRotation={ballRotation}
                    showBall={showBall}
                    ballResetKey={ballResetKey}
                    highlightedNumbers={hoveredNumbers}
                    size={500}
                    lastWin={lastWin} // Passed here
                />
            </Draggable>

            {/* 2. BOARD SECTION */}
            <Draggable id="board" isEnabled={isEditMode} initialPos={positions.board} onDragEnd={onUpdatePos}>
                <div style={{ transform: 'scale(0.9)', transformOrigin: 'top left', width: '900px' }}> {/* Scale down slightly to fit */}
                    <BettingBoard
                        bets={currentBets}
                        onPlaceBet={handlePlaceBet}
                        onBatchBet={handleBatchBets}
                        lastWin={lastWin}
                        onHoverNumbers={setHoveredNumbers}
                    />
                </div>
            </Draggable>



            {/* 4. TELEMETRY */}
            <Draggable id="telemetry" isEnabled={isEditMode} initialPos={positions.telemetry} onDragEnd={onUpdatePos}>
                <div style={{
                    fontSize: '13px', color: '#ccc', background: 'linear-gradient(to bottom, #222, #111)',
                    padding: '15px', borderRadius: '8px', textAlign: 'left',
                    border: '1px solid #555', boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    minWidth: '300px', fontFamily: 'monospace'
                }}>
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
            </Draggable>

            {/* 5. PAYTABLE (INFO) */}
            <Draggable id="paytable" isEnabled={isEditMode} initialPos={positions.paytable} onDragEnd={onUpdatePos}>
                <div
                    onClick={() => setShowHelp(true)}
                    style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: '#222', border: '2px solid #d4af37',
                        color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)', transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    title="Ver Guía de Apuestas"
                >
                    ?
                </div>
            </Draggable>

            {/* NEW: STATISTICS PANEL */}
            <Draggable id="statistics" isEnabled={isEditMode} initialPos={positions.statistics} onDragEnd={onUpdatePos}>
                <StatisticsPanel />
            </Draggable>

            {/* NEW: RACETRACK */}
            <Draggable id="racetrack" isEnabled={isEditMode} initialPos={positions.racetrack} onDragEnd={onUpdatePos}>
                <div style={{ transform: 'scale(1.0)', transformOrigin: 'top left' }}>
                    <Racetrack onBatchBets={handleBatchBets} onHoverNumbers={setHoveredNumbers} />
                </div>
            </Draggable>

            {/* MODAL LAYER */}
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {showHistory && <HistoryModal logs={transactionLog} onClose={() => setShowHistory(false)} />}

            {/* BANKRUPTCY MODAL */}
            {showBankruptcy && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        background: '#222', padding: '30px', borderRadius: '12px',
                        border: '2px solid #f44', textAlign: 'center', color: '#fff', maxWidth: '400px'
                    }}>
                        <h2 style={{ color: '#f44', marginTop: 0 }}>¡Saldo Agotado!</h2>
                        <p>Te has quedado sin fichas. La casa invita esta vez.</p>
                        <button
                            onClick={() => { reloadCapital(); setShowBankruptcy(false); }}
                            style={{
                                background: '#4f4', border: 'none', color: '#000', padding: '15px 30px',
                                fontSize: '18px', fontWeight: 'bold', borderRadius: '50px', cursor: 'pointer',
                                marginTop: '10px'
                            }}
                        >
                            🔄 Recargar $1000
                        </button>
                    </div>
                </div>
            )}

            {/* 6. BANKING HUD (Balance + Bet) */}
            <Draggable id="banking" isEnabled={isEditMode} initialPos={positions.banking} onDragEnd={onUpdatePos}>
                <div className="ui-overlay-loose" style={{
                    display: 'flex', flexDirection: 'column', gap: '5px',
                    background: 'rgba(0,0,0,0.8)', padding: '15px', borderRadius: '8px',
                    border: '1px solid #444', minWidth: '200px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase' }}>Saldo {gameMode}</div>
                        <div style={{ display: 'flex', gap: 2 }}>
                            <button onClick={toggleMode} style={{
                                background: gameMode === 'REAL' ? '#f44' : '#4f4',
                                color: '#000', border: 'none', borderRadius: '4px',
                                fontSize: '10px', cursor: 'pointer', padding: '2px 5px', fontWeight: 'bold'
                            }}>
                                {gameMode}
                            </button>
                            <button onClick={() => setShowHistory(true)} style={{
                                background: 'none', border: '1px solid #555', borderRadius: '4px',
                                color: '#aaa', fontSize: '10px', cursor: 'pointer', padding: '2px 5px'
                            }}>
                                📜 Historial
                            </button>
                        </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', color: '#ffd700', fontWeight: 'bold' }}>{formatBalance(balance)}</div>

                    <div style={{ height: '1px', background: '#333', margin: '5px 0' }}></div>

                    <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase' }}>Apuesta</div>
                    <div style={{ fontSize: '1.2rem', color: '#fff' }}>{formatValue(currentRoundBet)}</div>

                    {/* CURRENCY TOGGLE MOVED HERE OR SEPARATE? Keeping it here for now neatly */}
                    <div style={{ display: 'flex', gap: 2, background: '#222', padding: '2px', borderRadius: '4px', marginTop: '10px' }}>
                        {['COL', 'USA', 'EUR'].map(curr => (
                            <button key={curr} onClick={() => setViewCurrency(curr)}
                                style={{
                                    flex: 1,
                                    background: viewCurrency === curr ? '#d4af37' : 'transparent',
                                    color: viewCurrency === curr ? '#000' : '#888',
                                    border: 'none', padding: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem'
                                }}
                            >
                                {curr}
                            </button>
                        ))}
                    </div>
                </div>
            </Draggable>

            {/* 6b. WIN HUD (New) */}
            <Draggable id="win" isEnabled={isEditMode} initialPos={positions.win} onDragEnd={onUpdatePos}>
                <div className="ui-overlay-loose" style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    background: lastWinAmount > 0 ? 'rgba(0, 100, 0, 0.8)' : 'rgba(0,0,0,0.6)',
                    padding: '15px', borderRadius: '8px',
                    border: `1px solid ${lastWinAmount > 0 ? '#4f4' : '#444'}`,
                    minWidth: '200px', transition: 'background 0.5s'
                }}>
                    <div style={{ fontSize: '0.9rem', color: '#eee', textTransform: 'uppercase' }}>Ganancia</div>
                    <div style={{ fontSize: '1.6rem', color: lastWinAmount > 0 ? '#fff' : '#888', fontWeight: 'bold' }}>
                        {formatValue(lastWinAmount)}
                    </div>
                </div>
            </Draggable>

            {/* NEW: CONTROLS HUD */}
            <Draggable id="controls" isEnabled={isEditMode} initialPos={positions.controls} onDragEnd={onUpdatePos}>
                <div style={{
                    display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '50px',
                    border: '1px solid #555', alignItems: 'center'
                }}>
                    <button className="spin-btn" onClick={handleSpin} disabled={isSpinning}
                        style={{
                            padding: '15px 30px', borderRadius: '30px', border: 'none',
                            background: isSpinning ? '#444' : 'linear-gradient(145deg, #ffd700, #b8860b)',
                            color: isSpinning ? '#888' : '#000',
                            fontWeight: 'bold', fontSize: '1.2rem', cursor: isSpinning ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)', marginRight: '10px'
                        }}
                    >
                        {isSpinning ? "..." : "GIRAR"}
                    </button>
                    <button onClick={handleRepeat} disabled={Object.keys(lastBets).length === 0}
                        style={{ padding: '10px 15px', borderRadius: '20px', border: 'none', background: '#336699', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: Object.keys(lastBets).length === 0 ? 0.5 : 1 }}>
                        REPETIR
                    </button>
                    <button onClick={handleDouble} disabled={Object.keys(currentBets).length === 0}
                        style={{ padding: '10px 15px', borderRadius: '20px', border: 'none', background: '#336699', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: Object.keys(currentBets).length === 0 ? 0.5 : 1 }}>
                        x2
                    </button>
                    <button onClick={handleUndo} disabled={betHistory.length === 0}
                        style={{ padding: '10px 15px', borderRadius: '20px', border: 'none', background: '#663333', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: betHistory.length === 0 ? 0.5 : 1 }}>
                        DESHACER
                    </button>
                    <button onClick={handleClear} disabled={Object.keys(currentBets).length === 0}
                        style={{ padding: '10px 15px', borderRadius: '20px', border: 'none', background: '#993333', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: Object.keys(currentBets).length === 0 ? 0.5 : 1 }}>
                        LIMPIAR
                    </button>
                </div>
            </Draggable>

            {/* 7. CHIPS HUD (Separated) */}
            <Draggable id="chips" isEnabled={isEditMode} initialPos={positions.chips} onDragEnd={onUpdatePos}>
                <div className="ui-overlay-loose" style={{
                    background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '10px'
                }}>
                    <div className="chip-selector">
                        {[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].map(val => (
                            <div key={val} className={`chip-btn chip-${val} ${selectedChip === val ? 'selected' : ''}`}
                                onClick={() => setSelectedChip(val)}
                            >
                                {formatValue(val)}
                            </div>
                        ))}
                    </div>
                </div>
            </Draggable>

        </div >
    )
}
