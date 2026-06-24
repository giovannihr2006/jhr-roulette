
import { useState, useRef, useEffect } from 'react'
import { soundManager } from '../utils/SoundManager'
import { dealer } from '../utils/DealerVoice'
import { calculateWinnings } from '../logic/RouletteUtils'

// CONSTANTS (Moved from CasinoTable)
const WHEEL_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

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
    resolveRound,
    isTurboMode = false
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
        // setTimeout(() => dealer.welcome(), 1000) // Replaced by user-gesture welcome in CasinoTable.jsx
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

        // Forensic Permutation Calculation
        const totalPermutations = BALL_TYPES.length * SPEEDS.length * WHEEL_SPEEDS.length * START_POINTS.length * 2

        setPhysicsState({
            ballType: pBall,
            ballSpeed: pSpeed,
            wheelSpeed: `${pWheel.name} - ${mps} m/s`,
            wheelSpeedObject: pWheel,
            startPoint: pStart,
            wheelDirection: pDirVal === 1 ? 'Horario ↻' : 'Anti-Horario ↺',
            ballDirection: pDirVal === 1 ? 'Anti-Horario ↺' : 'Horario ↻',
            permutations: totalPermutations
        })
    }

    // --- SECURE RNG HELPER (Forensic Grade: Rejection Sampling) ---
    const getSecureRandomInt = (max) => {
        // Rejection sampling to avoid modulo bias
        // We want a number between 0 and max-1.
        // We generate a random number from 0 to 2^32 - 1.
        // If the number falls in the "remainder" zone (where 2^32 % max would bias low numbers), we reject and retry.

        const limit = 0xFFFFFFFF - (0xFFFFFFFF % max);
        const array = new Uint32Array(1);

        while (true) {
            window.crypto.getRandomValues(array);
            // If the random value is within the "fair" range
            if (array[0] < limit) {
                return array[0] % max;
            }
            // Otherwise, reject and loop (this happens extremely rarely for small max, e.g. 37)
        }
    }

    const resolvePayouts = (winningNumber) => {
        const totalWinnings = calculateWinnings(winningNumber, currentBets)
        if (totalWinnings > 0) {
            soundManager.playWin(totalWinnings)
            const totalBet = Object.values(currentBets).reduce((a, b) => a + b, 0)
            if (totalWinnings > totalBet) {
                setTimeout(() => dealer.profitWin(), 2500)
            }
            setLastWinAmount(totalWinnings)
        } else {
            setLastWinAmount(0)
        }

        const roundBets = { ...currentBets }
        resolveRound(totalWinnings, winningNumber, roundBets)
        setCurrentBets({})
    }

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
            ballDirection: pDirVal === 1 ? 'Anti-Horario' : 'Horario',
            permutations: BALL_TYPES.length * SPEEDS.length * WHEEL_SPEEDS.length * START_POINTS.length * 2
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
            setBallRotation(pStart.angle)

            // Winner - CRYPTOGRAPHICALLY SECURE
            let winningNumber = WHEEL_NUMBERS[getSecureRandomInt(WHEEL_NUMBERS.length)]

            if (window.forceWinningNumber !== undefined && window.forceWinningNumber !== null) {
                const forced = parseInt(window.forceWinningNumber)
                if (WHEEL_NUMBERS.includes(forced)) winningNumber = forced
            }
            const winningIndex = WHEEL_NUMBERS.indexOf(winningNumber)

            // Deltas
            const wheelDelta = pDirVal * ((pWheelSpeed.laps * 360) + Math.random() * 360) // Visual jitter can stay Math.random
            const nextWheelRotation = wheelRotation + wheelDelta

            const ballDirVal = -pDirVal
            const ballTotalDegrees = pBallSpeed.laps * 360
            const wedgeAngle = winningIndex * (360 / 37)
            const targetWorldAngle = nextWheelRotation + wedgeAngle
            const idealEnd = pStart.angle + (ballDirVal * ballTotalDegrees)
            const rounds = Math.round((idealEnd - targetWorldAngle) / 360)
            const nextBallRotation = targetWorldAngle + (rounds * 360)

            const spinDuration = isTurboMode ? 1000 : 12500
            const openBetsDuration = isTurboMode ? 1000 : 5000

            setTimeout(() => {
                setWheelRotation(nextWheelRotation)
                setBallRotation(nextBallRotation)
            }, 50)

            setTimeout(() => {
                try {
                    soundManager.stopBallLoop() // Stop audio loop
                    setIsSpinning(false)
                    const color = winningNumber === 0 ? 'Verde' : (REDS.includes(winningNumber) ? 'Rojo' : 'Negro')
                    dealer.winner(winningNumber, color)
                    setLastWin(winningNumber)
                    resolvePayouts(winningNumber)

                    betsTimeoutRef.current = setTimeout(() => {
                        // setLastWin(null) -- DEPRECATED: Persist winning number and 3D diamond on mat until next spin
                        setBallResetKey(prev => prev + 1)
                        if (!isSpinningRef.current) dealer.betsOpen()
                    }, openBetsDuration)
                } catch (error) {
                    console.error("Error resolving spin:", error)
                    setIsSpinning(false)
                }
            }, spinDuration)

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
        physicsState
    }
}
