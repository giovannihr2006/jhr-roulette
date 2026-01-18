import { PAYOUTS, getBetType } from '../config/GameLimits'
import { REDS } from './rouletteUtils'

// Helper to check if a number wins a specific bet
const doesNumberWin = (number, betId) => {
    const numStr = number.toString()

    // 1. Straight
    if (betId === numStr) return true

    // 2. Simple
    if (betId === 'RED') return REDS.includes(number)
    if (betId === 'BLACK') return !REDS.includes(number) && number !== 0
    if (betId === 'EVEN') return number !== 0 && number % 2 === 0
    if (betId === 'ODD') return number !== 0 && number % 2 !== 0
    if (betId === 'LOW') return number >= 1 && number <= 18
    if (betId === 'HIGH') return number >= 19 && number <= 36

    // 3. Dozens/Cols
    if (betId === 'DOZ1') return number >= 1 && number <= 12
    if (betId === 'DOZ2') return number >= 13 && number <= 24
    if (betId === 'DOZ3') return number >= 25 && number <= 36
    if (betId === 'COL1') return number !== 0 && number % 3 === 1
    if (betId === 'COL2') return number !== 0 && number % 3 === 2
    if (betId === 'COL3') return number !== 0 && number % 3 === 0

    // 4. Complex (Split, Street, Corner, Line)
    // These Ids are usually constructed like 'SPLIT_1_2'
    // We can just check if the number is in the ID parts usually, 
    // BUT 'LINE_1' (Double Street 1-6) might not list all numbers in ID depending on implementation.
    // Let's assume standard parsing or check implementation in CasinoTable.
    // In CasinoTable helper it parsed:
    if (betId.includes('_')) {
        const parts = betId.split('_')
        // Special prefixes check
        if (betId.startsWith('LINE')) {
            const startStr = parts[1]
            const start = parseInt(startStr)
            return number >= start && number <= start + 5
        }
        if (betId.startsWith('STREET')) {
            const startStr = parts[1]
            const start = parseInt(startStr)
            return number >= start && number <= start + 2
        }
        // Splits, Corners, Trios, Baskets usually list all numbers in ID?
        // Let's verify BettingBoard later if needed. Defaults to checking parts for now.
        return parts.includes(numStr)
    }

    return false
}

// Returns the Payout Multiplier for a bet
const getMultiplier = (betId) => {
    const type = getBetType(betId)
    return PAYOUTS[type] || 0
}

/**
 * Calculates the maximum possible win for the current board state.
 * @param {Object} currentBets - Map of betId -> amount
 * @returns {Object} { maxWin, bestCaseNumber, totalBet }
 */
export const calculateRisk = (currentBets) => {
    let maxWin = 0
    let bestCaseNumber = -1
    let totalBet = 0

    // Calculate Total Bet first
    Object.values(currentBets).forEach(amount => totalBet += amount)

    // Simulate for numbers 0-36
    for (let num = 0; num <= 36; num++) {


        // Net Result for player = Winnings - Total Bet? 
        // No, in Roulette, if you bet on Red and 32Red comes, you get your chip back + 1.
        // If you bet on Black, you lose chip.
        // So Profit for a number = (Sum of Payouts for winning bets) - (Sum of Losing Bets)?
        // Simplest: Total Payout (Return) - Total Initial Bet.

        // Let's calculate Total Return for this number
        let totalReturn = 0
        Object.entries(currentBets).forEach(([betId, amount]) => {
            if (doesNumberWin(num, betId)) {
                const mult = getMultiplier(betId)
                totalReturn += amount + (amount * mult)
            }
        })

        const netProfit = totalReturn - totalBet

        if (netProfit > maxWin) {
            maxWin = netProfit
            bestCaseNumber = num
        }
    }

    return { maxWin, bestCaseNumber, totalBet }
}
