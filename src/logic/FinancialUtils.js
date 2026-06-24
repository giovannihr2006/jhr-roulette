/**
 * Validates the integrity of the current bets against the tracked total bet.
 * @param {Object} currentBets - THe current bets object.
 * @param {number} trackedTotal - The total bet amount tracked by the store.
 * @returns {boolean} True if valid, false if discrepant.
 */
export const validateBetsIntegrity = (currentBets, trackedTotal) => {
    const sumOfBets = currentBets && typeof currentBets === 'object'
        ? Object.values(currentBets).reduce((sum, amt) => sum + (typeof amt === 'number' ? amt : 0), 0)
        : 0
    return Math.abs(sumOfBets - trackedTotal) <= 0.01
}

/**
 * Creates a structured record for the round history.
 * @param {Object} params - The parameters for the round record.
 * @param {number} params.spinNumber - The new spin count.
 * @param {number} params.winningNumber - The winning number.
 * @param {Object} params.bets - The bets placed.
 * @param {number} params.totalBet - Total amount bet.
 * @param {number} params.totalWin - Total amount won.
 * @param {number} params.balanceAfter - Capital after the round.
 * @param {string} params.mode - Game mode (REAL/DEMO).
 * @param {boolean} params.integrityCheck - Result of integrity check.
 * @returns {Object} The immutable round data object.
 */
export const createRoundRecord = ({
    spinNumber,
    winningNumber,
    bets,
    totalBet,
    totalWin,
    balanceAfter,
    mode,
    integrityCheck
}) => {
    return {
        id: Date.now(),
        spin: spinNumber,
        timestamp: Date.now(),
        winningNumber,
        bets: bets || {},
        totalBet,
        totalWin,
        netResult: totalWin - totalBet,
        balanceAfter,
        mode,
        integrityCheck
    }
}

/**
 * Creates a structured transaction log entry.
 * @param {string} type - Transaction type (BET, WIN, LOSS, DEPOSIT, etc.)
 * @param {number} amount - Amount involved.
 * @param {string} detail - Human readable detail.
 * @param {number} balanceAfter - Balance after transaction.
 * @returns {Object} The immutable log object.
 */
export const createTransactionLog = (type, amount, detail, balanceAfter) => {
    return {
        id: Date.now() + (Math.random() * 10), // jitter to avoid collision with roundId if same ms
        time: new Date().toLocaleString(),
        type,
        amount,
        detail,
        balanceAfter
    }
}
