/**
 * FinancialSelectors.js
 * Memoized selectors for FinancialSimulator Zustand store
 * These selectors optimize re-renders by selecting only needed state
 */

// Simple value selectors
export const selectBalance = (state) => state.balance
export const selectDemoBalance = (state) => state.demoBalance
export const selectMode = (state) => state.mode
export const selectTotalSpins = (state) => state.totalSpins
export const selectSessionStart = (state) => state.sessionStart

// Get current balance based on mode
export const selectCurrentBalance = (state) =>
    state.mode === 'REAL' ? state.balance : state.demoBalance

// History selectors
export const selectNumberHistory = (state) => state.numberHistory || []
export const selectRoundHistory = (state) => state.roundHistory || []
export const selectTransactionLog = (state) => state.transactionLog || []

// Statistics selectors
export const selectTotalWagered = (state) => state.totalWagered || 0
export const selectTotalWon = (state) => state.totalWon || 0
export const selectNetProfit = (state) => (state.totalWon || 0) - (state.totalWagered || 0)
export const selectWinRate = (state) => {
    const wins = (state.roundHistory || []).filter(r => r.netResult > 0).length
    const total = (state.roundHistory || []).length
    return total > 0 ? (wins / total * 100).toFixed(1) : '0.0'
}

// Threshold selectors
export const selectBaseWaitThreshold = (state) => state.baseWaitThreshold || 300

// Action selectors (stable references)
export const selectPlaceBet = (state) => state.placeBet
export const selectResolveRound = (state) => state.resolveRound
export const selectHardReset = (state) => state.hardReset
export const selectToggleMode = (state) => state.toggleMode
export const selectReloadFunds = (state) => state.reloadFunds
export const selectWithdrawFunds = (state) => state.withdrawFunds

// Composed selectors for common use cases
export const selectBankingInfo = (state) => ({
    balance: state.mode === 'REAL' ? state.balance : state.demoBalance,
    mode: state.mode,
    totalSpins: state.totalSpins,
    netProfit: (state.totalWon || 0) - (state.totalWagered || 0)
})

export const selectSessionInfo = (state) => ({
    sessionStart: state.sessionStart,
    totalSpins: state.totalSpins,
    historyLength: (state.numberHistory || []).length
})

// Last N numbers from history
export const createSelectLastNNumbers = (n) => (state) =>
    (state.numberHistory || []).slice(-n)

// Selector creators for dynamic selections
export const createSelectHistorySlice = (start, end) => (state) =>
    (state.numberHistory || []).slice(start, end)
