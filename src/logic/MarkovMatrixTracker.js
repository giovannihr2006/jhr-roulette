import { WHEEL_ORDER } from '../utils/rouletteUtils'

/**
 * First-order Markov Chain tracker for angular shifts in the physical roulette wheel.
 * Tracks the transitions between consecutive wheel index deltas.
 */
export class MarkovMatrixTracker {
    constructor() {
        this.reset()
    }

    reset() {
        // Occurrence counts for individual shifts (0 to 36 pockets)
        this.shiftCounts = Array(37).fill(0)
        this.totalShiftsCount = 0

        // 37x37 transition matrix: [previous_shift][current_shift]
        this.transitionMatrix = Array(37).fill(null).map(() => Array(37).fill(0))
        // Sum of transitions out of each shift (for probability normalization)
        this.transitionTotals = Array(37).fill(0)
    }

    /**
     * Train/Update the tracker with a history of winning numbers.
     * @param {number[]} numberHistory - Array of winning numbers (oldest to newest)
     */
    update(numberHistory) {
        this.reset()
        if (numberHistory.length < 2) return

        let prevShift = null

        for (let i = 1; i < numberHistory.length; i++) {
            const numPrev = numberHistory[i - 1]
            const numCurr = numberHistory[i]

            const idxPrev = WHEEL_ORDER.indexOf(numPrev)
            const idxCurr = WHEEL_ORDER.indexOf(numCurr)

            if (idxPrev === -1 || idxCurr === -1) continue

            // Angular shift clockwise (0 to 36 slots)
            const shift = (idxCurr - idxPrev + 37) % 37

            this.shiftCounts[shift]++
            this.totalShiftsCount++

            if (prevShift !== null) {
                this.transitionMatrix[prevShift][shift]++
                this.transitionTotals[prevShift]++
            }

            prevShift = shift
        }
    }

    /**
     * Get the probability distribution of the next shift.
     * Combines transition probabilities and general shift frequencies.
     * @param {number[]} numberHistory - Complete winning history
     * @returns {number[]} - Array of 37 probabilities corresponding to shifts 0..36
     */
    getNextShiftProbabilities(numberHistory) {
        const probs = Array(37).fill(0)

        // Prior probability from overall shift distribution
        const prior = this.shiftCounts.map(count =>
            this.totalShiftsCount > 0 ? count / this.totalShiftsCount : 1 / 37
        )

        if (numberHistory.length < 2) {
            return prior
        }

        // Get the very last shift
        const lastNum2 = numberHistory[numberHistory.length - 2]
        const lastNum1 = numberHistory[numberHistory.length - 1]
        const idx2 = WHEEL_ORDER.indexOf(lastNum2)
        const idx1 = WHEEL_ORDER.indexOf(lastNum1)

        if (idx2 === -1 || idx1 === -1) {
            return prior
        }

        const lastShift = (idx1 - idx2 + 37) % 37
        const totalTransitions = this.transitionTotals[lastShift]

        for (let s = 0; s < 37; s++) {
            if (totalTransitions > 0) {
                // Bayesian blending: 70% Markov transition probability, 30% overall prior frequency
                const markovProb = this.transitionMatrix[lastShift][s] / totalTransitions
                probs[s] = (0.7 * markovProb) + (0.3 * prior[s])
            } else {
                probs[s] = prior[s]
            }
        }

        return probs
    }

    /**
     * Predicts the next numbers with highest transition probabilities.
     * @param {number[]} numberHistory - Winning history
     * @param {number} topCount - Number of predictions to return
     * @returns {{number: number, probability: number, shift: number}[]}
     */
    predictNextNumbers(numberHistory, topCount = 3) {
        if (numberHistory.length === 0) return []

        const lastNum = numberHistory[numberHistory.length - 1]
        const lastIdx = WHEEL_ORDER.indexOf(lastNum)
        if (lastIdx === -1) return []

        const shiftProbs = this.getNextShiftProbabilities(numberHistory)

        const predictions = shiftProbs.map((prob, shift) => {
            const nextIdx = (lastIdx + shift) % 37
            const nextNum = WHEEL_ORDER[nextIdx]
            return {
                number: nextNum,
                probability: prob,
                shift: shift
            }
        })

        // Sort by probability descending
        predictions.sort((a, b) => b.probability - a.probability)

        return predictions.slice(0, topCount)
    }
}
