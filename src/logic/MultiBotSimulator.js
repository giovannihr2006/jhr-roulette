import { BETTING_STRATEGIES } from './BettingStrategies'
import { calculateWinnings } from './RouletteUtils'

/**
 * Shadow simulation runner that evaluates all 7 preset strategies in parallel.
 * Updates virtual balances and returns rankings based on expectation performance.
 */
export class MultiBotSimulator {
    constructor(startBalance = 10000) {
        this.startBalance = startBalance
        this.reset()
    }

    reset() {
        this.bots = {}
        Object.entries(BETTING_STRATEGIES).forEach(([key, strat]) => {
            this.bots[key] = {
                key: key,
                label: strat.label,
                balance: this.startBalance,
                maxBalance: this.startBalance,
                multiplier: 1,
                totalSpins: 0,
                totalWins: 0,
                netProfit: 0,
                activeBets: strat.bets
            }
        })
    }

    /**
     * Process a new winning number. Runs simulations for all bots.
     * @param {number} winningNumber - The winning pocket
     */
    processSpin(winningNumber) {
        Object.keys(this.bots).forEach(key => {
            const bot = this.bots[key]
            bot.totalSpins++

            const baseChip = key === 'HYBRID_HEDGE_PRO' ? 1 : 10 // Enforce 1 unit for Hybrid Pro, 10 for others
            const chipValue = baseChip * bot.multiplier

            // Build current bets map
            const currentBets = {}
            bot.activeBets.forEach(betId => {
                currentBets[betId] = (currentBets[betId] || 0) + chipValue
            })

            const totalCost = bot.activeBets.length * chipValue
            const winnings = calculateWinnings(winningNumber, currentBets)
            const netProfit = winnings - totalCost

            bot.balance += netProfit
            bot.netProfit = bot.balance - this.startBalance

            if (winnings > 0) {
                bot.totalWins++
            }

            // Progression Logic
            if (key === 'HYBRID_HEDGE_PRO') {
                const DR = bot.balance - bot.maxBalance
                if (DR > 0) {
                    bot.multiplier = 1
                    bot.maxBalance = bot.balance
                } else {
                    const wonLastRound = winnings > 0
                    if (!wonLastRound) {
                        // Double multiplier on loss
                        bot.multiplier = bot.multiplier * 2
                    }
                    // If won but still below peak, keep current multiplier
                }
            } else {
                // Flat betting for other strategies
                bot.multiplier = 1
            }
        })
    }

    /**
     * Get the current rank list of strategies sorted by net profit descending.
     * @returns {any[]}
     */
    getRankings() {
        const rankings = Object.values(this.bots).map(bot => ({
            ...bot,
            winRate: bot.totalSpins > 0 ? (bot.totalWins / bot.totalSpins) * 100 : 0
        }))
        rankings.sort((a, b) => b.netProfit - a.netProfit)
        return rankings
    }
}
