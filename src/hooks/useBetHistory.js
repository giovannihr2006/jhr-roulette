import { useFinancialStore } from '../logic/FinancialSimulator'
import { soundManager } from '../utils/SoundManager'

/**
 * Hook to handle "Subtractive" bet actions (Undo, Clear).
 */
export const useBetHistory = ({
    currentBets,
    setCurrentBets,
    betHistory,
    setBetHistory,
    isSpinning,
    currentRoundBet
}) => {
    const refundBet = useFinancialStore(state => state.refundBet)

    const handleUndo = () => {
        if (isSpinning || betHistory.length === 0) return
        const lastAction = betHistory[betHistory.length - 1]

        // 1. Transaction
        refundBet(lastAction.totalCost)

        // 2. State Reversal
        setCurrentBets(prev => {
            const next = { ...prev }
            Object.entries(lastAction.bets).forEach(([id, amt]) => {
                if (next[id]) {
                    next[id] -= amt
                    if (next[id] <= 0) delete next[id]
                }
            })
            return next
        })

        // 3. History Pop
        setBetHistory(prev => prev.slice(0, -1))

        // Audio? Usually Undo is silent or subtle click.
        soundManager.playChip() // Reusing chip sound for feedback
    }

    const handleClear = () => {
        if (isSpinning || Object.keys(currentBets).length === 0) return

        // 1. Transaction
        refundBet(currentRoundBet)

        // 2. State Clear
        setCurrentBets({})
        setBetHistory([])

        soundManager.playChip()
    }

    return {
        handleUndo,
        handleClear
    }
}
