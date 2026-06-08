import { useFinancialStore } from '../logic/FinancialSimulator'
import { soundManager } from '../utils/SoundManager'
import { LIMITS } from '../config/GameLimits'
import { getBetType } from '../logic/RouletteUtils'
import { getNeighbours } from '../utils/rouletteUtils'
import { useToastStore } from '../logic/ToastStore'
import { calculateRisk } from '../utils/BetValidator'

/**
 * Hook to handle all "Additive" bet actions (Placing chips).
 */
export const useBetActions = ({
    currentBets,
    setCurrentBets,
    setBetHistory,
    isSpinning,
    gameMode,
    currentRoundBet,
    lastBets
}) => {
    const addToast = useToastStore(state => state.addToast)
    const placeBet = useFinancialStore(state => state.placeBet)

    // --- PRIMITIVE HELPERS ---

    const _executeBatch = (betsToPlace, chipValue) => {
        if (isSpinning) return { success: false }

        const totalCost = betsToPlace.length * chipValue

        // 1. Transaction
        const result = placeBet(totalCost, 'BATCH')

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') {
                return { success: false, error: 'INSUFFICIENT_FUNDS' }
            }
            addToast(`Saldo insuficiente ($${totalCost})`, 'error')
            return { success: false, error: result.error }
        }

        // 2. Audio
        soundManager.playChip()

        // 3. State Update
        const newBatch = {}
        betsToPlace.forEach(id => newBatch[id] = chipValue)

        setCurrentBets(prev => {
            const next = { ...prev }
            betsToPlace.forEach(id => {
                next[id] = (next[id] || 0) + chipValue
            })
            return next
        })

        setBetHistory(prev => [...prev, { bets: newBatch, totalCost }])
        return { success: true }
    }

    // --- PUBLIC ACTIONS ---

    const handlePlaceBet = (betId, selectedChip) => {
        if (isSpinning) return

        const limits = LIMITS[gameMode] || LIMITS['REAL']

        if (selectedChip < limits.MIN_BET) {
            addToast(`Mínimo de apuesta es ${limits.MIN_BET}`, 'error')
            return
        }

        if ((currentRoundBet + selectedChip) > limits.MAX_TOTAL_BET) {
            addToast(`Límite total de apuesta excedido (${limits.MAX_TOTAL_BET})`, 'error')
            return
        }

        const currentPositions = Object.keys(currentBets).length
        if (!currentBets[betId] && currentPositions >= limits.MAX_POSITIONS) {
            addToast(`Máximo de ${limits.MAX_POSITIONS} posiciones permitidas.`, 'error')
            return
        }

        const nextBets = { ...currentBets, [betId]: (currentBets[betId] || 0) + selectedChip }
        const { maxWin } = calculateRisk(nextBets)
        if (maxWin > limits.MAX_WIN_PER_SPIN) {
            addToast(`Esta apuesta excede el pago máximo permitido (${limits.MAX_WIN_PER_SPIN}).`, 'error')
            return
        }

        const betType = getBetType(betId)
        const currentOnSpot = currentBets[betId] || 0
        const result = placeBet(selectedChip, betType, currentOnSpot)

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') return { success: false, error: 'INSUFFICIENT_FUNDS' }
            if (result.error === 'MAX_TOTAL_EXCEEDED') addToast(`Límite total excedido`, 'error')
            if (result.error === 'LIMIT_EXCEEDED') addToast(`Límite individual excedido`, 'error')
            return { success: false, error: result.error }
        }

        soundManager.playChip()
        setCurrentBets(prev => ({ ...prev, [betId]: (prev[betId] || 0) + selectedChip }))
        setBetHistory(prev => [...prev, { bets: { [betId]: selectedChip }, totalCost: selectedChip }])

        return { success: true }
    }

    const handleBatchBets = (betsToPlace, chipValue) => {
        return _executeBatch(betsToPlace, chipValue)
    }

    const handleRepeat = () => {
        if (isSpinning || Object.keys(lastBets).length === 0) return

        // Reconstruction isn't trivial because LastBets is just {id: amount}.
        // We can treat it as a batch where each 'id' has a different value?
        // _executeBatch assumes single chipValue.
        // We need a custom logic here or upgrade _executeBatch.
        // Let's implement inline to be safe and consistent with logic v1.

        const cost = Object.values(lastBets).reduce((a, b) => a + b, 0)
        const result = placeBet(cost, 'BATCH')

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') addToast("Saldo insuficiente", 'error')
            return
        }

        setCurrentBets(prev => {
            const next = { ...prev }
            Object.entries(lastBets).forEach(([id, amt]) => {
                next[id] = (next[id] || 0) + amt
            })
            return next
        })
        setBetHistory(prev => [...prev, { bets: lastBets, totalCost: cost }])
        soundManager.playChip()
    }

    const handleDouble = () => {
        if (isSpinning || Object.keys(currentBets).length === 0) return
        const cost = currentRoundBet
        const result = placeBet(cost, 'BATCH')

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') addToast("Saldo insuficiente para doblar", 'error')
            return
        }

        const addedBets = { ...currentBets }
        setCurrentBets(prev => {
            const next = { ...prev }
            Object.keys(next).forEach(key => next[key] *= 2)
            return next
        })
        setBetHistory(prev => [...prev, { bets: addedBets, totalCost: cost }])
        soundManager.playChip()
    }

    const handleNeighborBet = (number, count, chipValue) => {
        if (isSpinning) return
        const neighbors = getNeighbours(number, count)
        handleBatchBets(neighbors, chipValue)
    }

    return {
        handlePlaceBet,
        handleBatchBets,
        handleRepeat,
        handleDouble,
        handleNeighborBet
    }
}
