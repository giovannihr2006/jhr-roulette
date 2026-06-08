import { calculateWinnings, ROULETTE_NUMBERS } from '../logic/RouletteUtils.js'

/**
 * Calculates the maximum possible net win for the current board state using
 * the same payout engine that resolves real rounds.
 * @param {Object} currentBets - Map of betId -> amount
 * @returns {Object} { maxWin, worstCaseNumber, totalBet }
 */
export const calculateRisk = (currentBets) => {
    const bets = currentBets || {}
    const totalBet = Object.values(bets).reduce((sum, amount) => sum + amount, 0)

    let maxWin = 0
    let worstCaseNumber = -1

    for (const num of ROULETTE_NUMBERS) {
        const totalReturn = calculateWinnings(num, bets)
        const netProfit = totalReturn - totalBet

        if (netProfit > maxWin) {
            maxWin = netProfit
            worstCaseNumber = num
        }
    }

    return { maxWin, worstCaseNumber, totalBet }
}