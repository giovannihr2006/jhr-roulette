
import { useState, useRef, useEffect } from 'react'
import { soundManager } from '../utils/SoundManager'
import { dealer } from '../utils/DealerVoice'
import { calculateWinnings } from '../logic/RouletteUtils'
import { WHEEL_NUMBERS, REDS } from '../utils/rouletteUtils'

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

export const useRouletteGame = ({
    currentBets,
    setCurrentBets,
    setLastBets,
    setBetHistory,
    resolveRound
}) => {
    // Game State
    const [isSpinning, setIsSpinning] = useState(false)
    const isSpinningRef = useRef(isSpinning)

    // Physics State
    const [wheelRotation, setWheelRotation] = useState(0)
    const [ballRotation, setBallRotation] = useState(0)
    const [ballResetKey, setBallResetKey] = useState(0)
    const [showBall, setShowBall] = useState(false)

    // Result State
    const [lastWin, setLastWin] = useState(null)
    const [lastWinAmount, setLastWinAmount] = useState(0)

    // Physics Info for UI
    const [physicsState, setPhysicsState] = useState(() => ({
        ballType: BALL_TYPES[0],
        ballSpeed: SPEEDS[0],
        wheelSpeed: '---',
        wheelSpeedObject: WHEEL_SPEEDS[0],
        startPoint: START_POINTS[0],
        wheelDirection: 'Horario',
        ballDirection: 'Anti-Horario'
    }))

    const betsTimeoutRef = useRef(null)

    // Sync Ref
    useEffect(() => {
        isSpinningRef.current = isSpinning
    }, [isSpinning])

    // Init Logic
    useEffect(() => {
        // Enforce silence on load (Fixes HMR ghosts or prev session leaks)
        soundManager.stopAll()
        setTimeout(() => dealer.welcome(), 1000)
        randomizePhysicsDisplay()
    }, [])

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

    // --- SECURE RNG HELPER ---
    const getSecureRandomInt = (max) => {
        const array = new Uint32Array(1)
        window.crypto.getRandomValues(array)
        return array[0] % max
    }

    const resolvePayouts = (winningNumber) => {
        // Bug #6 Fix: Validar que hay apuestas antes de procesar
        if (!currentBets || typeof currentBets !== 'object' || Object.keys(currentBets).length === 0) {
            // No hay apuestas, solo resolver la ronda con 0 ganancias
            resolveRound(0, winningNumber, {})
            setCurrentBets({})
            setLastWinAmount(0)
            return
        }

        // Validar que todas las apuestas tienen montos válidos
        const validBets = {}
        Object.entries(currentBets).forEach(([betId, amount]) => {
            if (typeof amount === 'number' && amount > 0 && !isNaN(amount)) {
                validBets[betId] = amount
            }
        })

        const totalWinnings = calculateWinnings(winningNumber, validBets)
        if (totalWinnings > 0) {
            soundManager.playWin(totalWinnings)
            const totalBet = Object.values(validBets).reduce((a, b) => a + b, 0)
            if (totalWinnings > totalBet) {
                setTimeout(() => dealer.profitWin(), 2500)
            }
            setLastWinAmount(totalWinnings)
        } else {
            setLastWinAmount(0)
        }

        // Bug #7 Fix: Copia profunda para evitar mutaciones
        const roundBets = JSON.parse(JSON.stringify(validBets))
        resolveRound(totalWinnings, winningNumber, roundBets)
        setCurrentBets({})
    }

    // Animation State
    const [animState, setAnimState] = useState({
        isSpinning: false,
        startTime: 0,
        duration: 12000,
        startWheelRotation: 0,
        targetWheelRotation: 0,
        startBallRotation: 0,
        targetBallRotation: 0
    })

    const handleSpin = () => {
        if (isSpinning) return

        // 1. Secure Randomize Physics
        const pBall = BALL_TYPES[getSecureRandomInt(BALL_TYPES.length)]
        const pBallSpeed = SPEEDS[getSecureRandomInt(SPEEDS.length)]
        const pWheelSpeed = WHEEL_SPEEDS[getSecureRandomInt(WHEEL_SPEEDS.length)]
        const pStart = START_POINTS[getSecureRandomInt(START_POINTS.length)]
        const pDirVal = getSecureRandomInt(2) === 0 ? 1 : -1

        const mps = ((pWheelSpeed.laps * 2.5) / 12.5).toFixed(1)
        const kmh = (mps * 3.6).toFixed(1)

        setPhysicsState({
            ballType: pBall,
            ballSpeed: pBallSpeed,
            wheelSpeed: `${mps} m/s (${kmh} km/h)`,
            wheelSpeedObject: pWheelSpeed,
            startPoint: pStart,
            wheelDirection: pDirVal === 1 ? 'Horario' : 'Anti-Horario',
            ballDirection: pDirVal === 1 ? 'Anti-Horario' : 'Horario'
        })

        try {
            soundManager.playSpinStart()
            soundManager.playBallLoop()
            dealer.noMoreBets()
            setIsSpinning(true)

            if (Object.keys(currentBets).length > 0) {
                setLastBets(currentBets)
            }
            setBetHistory([])
            setLastWin(null)
            setLastWinAmount(0)
            setShowBall(true)
            setBallResetKey(prev => prev + 1)

            // Initial Rotation (Snap to current)
            // We use the last known rotation as start
            const currentWheelRot = wheelRotation
            const startBallRot = pStart.angle

            setWheelRotation(currentWheelRot)
            setBallRotation(startBallRot)

            // Winner - CRYPTOGRAPHICALLY SECURE
            let winningNumber = WHEEL_NUMBERS[getSecureRandomInt(WHEEL_NUMBERS.length)]

            if (window.forceWinningNumber !== undefined && window.forceWinningNumber !== null) {
                const forced = parseInt(window.forceWinningNumber)
                if (WHEEL_NUMBERS.includes(forced)) winningNumber = forced
            }
            const winningIndex = WHEEL_NUMBERS.indexOf(winningNumber)

            // Calculate Targets
            const wheelDelta = pDirVal * ((pWheelSpeed.laps * 360) + Math.random() * 360)
            const targetWheelRot = currentWheelRot + wheelDelta

            const ballDirVal = -pDirVal
            const ballTotalDegrees = pBallSpeed.laps * 360
            const wedgeAngle = winningIndex * (360 / 37)

            // Ball End Logic
            // The ball must land on 'wedgeAngle' relative to the wheel's final position
            const finalWheelMod = ((targetWheelRot % 360) + 360) % 360
            const targetWorldAngle = targetWheelRot + wedgeAngle

            // We need ball to travel approx ballTotalDegrees
            const idealEnd = startBallRot + (ballDirVal * ballTotalDegrees)

            // Snap to nearest matching angle
            // We need ballRotation % 360 == targetWorldAngle % 360
            // But we also want closer to idealEnd
            const rounds = Math.round((idealEnd - targetWorldAngle) / 360)
            const targetBallRot = targetWorldAngle + (rounds * 360)

            const now = Date.now()
            const duration = 12000

            // Set Animation State for UI
            setAnimState({
                isSpinning: true,
                startTime: now,
                duration: duration,
                startWheelRotation: currentWheelRot,
                targetWheelRotation: targetWheelRot,
                startBallRotation: startBallRot,
                targetBallRotation: targetBallRot
            })

            // Don't set immediate rotation state here as we animate it in UI
            // But update final state at end

            setTimeout(() => {
                try {
                    soundManager.stopBallLoop() // Stop audio loop
                    setIsSpinning(false)

                    // Finalize positions
                    setWheelRotation(targetWheelRot)
                    setBallRotation(targetBallRot)

                    const color = winningNumber === 0 ? 'Verde' : (REDS.includes(winningNumber) ? 'Rojo' : 'Negro')
                    dealer.winner(winningNumber, color)
                    setLastWin(winningNumber)
                    resolvePayouts(winningNumber)

                    betsTimeoutRef.current = setTimeout(() => {
                        setLastWin(null) // Clear Visual Highlights
                        setBallResetKey(prev => prev + 1)
                        if (!isSpinningRef.current) dealer.betsOpen()
                    }, 5000)
                } catch (error) {
                    console.error("Error resolving spin:", error)
                    setIsSpinning(false)
                }
            }, duration + 500) // Small buffer

        } catch (e) {
            console.error("Spin error", e)
            setIsSpinning(false)
        }
    }

    return {
        isSpinning,
        handleSpin,
        wheelRotation,
        ballRotation,
        ballResetKey,
        showBall,
        lastWin,
        lastWinAmount,
        setLastWinAmount,
        setLastWin,
        physicsState,
        animState // New Animation State Export
    }
}
