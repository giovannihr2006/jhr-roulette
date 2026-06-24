/**
 * Bayesian Pocket Bias Estimator using a Dirichlet-Multinomial model.
 * Fits a Beta distribution Beta(alpha_i, sum(alpha_j) - alpha_i) for each pocket i.
 * Computes mean, variance, and the 95% credible lower bound to detect physical wheel bias.
 */
export class BayesianBiasEstimator {
    constructor() {
        this.reset()
    }

    reset() {
        // Dirichlet prior parameters: start with flat Laplace prior (alpha = 1 for all pockets)
        // This represents a uniform probability distribution over all pockets before any data is seen.
        this.alphas = Array(37).fill(1)
        this.totalCount = 37 // Sum of all alphas initially
    }

    /**
     * Train/Update the estimator with a history of winning numbers.
     * @param {number[]} numberHistory - Array of winning numbers (oldest to newest)
     */
    update(numberHistory) {
        this.reset()
        numberHistory.forEach(num => {
            const val = parseInt(num)
            if (val >= 0 && val <= 36) {
                this.alphas[val]++
                this.totalCount++
            }
        })
    }

    /**
     * Get bias statistics for a specific pocket.
     * @param {number} num - Pocket index 0 to 36
     * @returns {{number: number, hits: number, mean: number, stdDev: number, lowerBound95: number, isBiased: boolean, confidence: number}}
     */
    getPocketStats(num) {
        const val = parseInt(num)
        if (val < 0 || val > 36) return null

        const alpha_i = this.alphas[val]
        const S = this.totalCount
        const sumOtherAlphas = S - alpha_i

        // Mean of Beta distribution: alpha_i / S
        const mean = alpha_i / S

        // Variance of Beta distribution: (alpha_i * sumOtherAlphas) / (S^2 * (S + 1))
        const variance = (alpha_i * sumOtherAlphas) / (Math.pow(S, 2) * (S + 1))
        const stdDev = Math.sqrt(variance)

        // Lower bound of 95% credible interval (One-sided Z = 1.645)
        const lowerBound95 = mean - (1.645 * stdDev)

        // Fair probability for European Roulette: 1/37 ≈ 0.027027
        const fairProbability = 1 / 37

        // A pocket is considered biased if the lower bound of its credible interval is strictly greater than fair probability
        const isBiased = lowerBound95 > fairProbability

        // Approximate confidence level that pocket probability is greater than fair probability
        // Z = (mean - fair) / stdDev
        const zScore = (mean - fairProbability) / (stdDev || 1)
        const confidence = this.approximateNormalCDF(zScore)

        return {
            number: val,
            hits: alpha_i - 1, // Subtract 1 (prior) to get actual hit count
            mean: mean,
            stdDev: stdDev,
            lowerBound95: lowerBound95,
            isBiased: isBiased,
            confidence: confidence
        }
    }

    /**
     * Get all pockets sorted by credibility / bias level.
     * @returns {any[]}
     */
    getAllPocketStats() {
        const stats = []
        for (let i = 0; i <= 36; i++) {
            stats.push(this.getPocketStats(i))
        }
        // Sort by hits/confidence descending
        stats.sort((a, b) => b.mean - a.mean)
        return stats
    }

    /**
     * Returns list of numbers currently showing positive bias with >90% probability.
     * @param {number} minConfidence - Minimum probability of positive bias (0.0 to 1.0)
     * @returns {number[]}
     */
    getBiasedNumbers(minConfidence = 0.90) {
        const stats = this.getAllPocketStats()
        return stats
            .filter(s => s.confidence >= minConfidence)
            .map(s => s.number)
    }

    /**
     * Standard Normal Cumulative Distribution Function approximation.
     * Returns P(Z <= z)
     */
    approximateNormalCDF(z) {
        // Abramowitz & Stegun approximation
        const t = 1 / (1 + 0.2316419 * Math.abs(z))
        const d = 0.3989423 * Math.exp(-z * z / 2)
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
        return z >= 0 ? 1 - p : p
    }
}
