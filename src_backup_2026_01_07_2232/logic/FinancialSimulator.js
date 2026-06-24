import { create } from 'zustand'
import { LIMITS, PAYOUTS } from '../config/GameLimits'
// import { useGenesisStore } from './MasterConfig'

// Replicates the logic from 'ENSAYO' sheet:
// - Track time elapsed
// - Track net profit
// - Calculate 'Speed' ($/hour)
// - Project time to reach StopWin

export const useFinancialStore = create((set, get) => ({
    sessionStart: Date.now(),

    // MODES
    gameMode: 'REAL', // 'REAL' or 'DEMO'

    // CAPITALS
    realCapital: 10000,
    demoCapital: 50000, // 10k * 5 or user defined

    // Active Capital Getter (Virtual)
    get balance() {
        const s = get()
        return s.gameMode === 'REAL' ? s.realCapital : s.demoCapital
    },

    // Metrics (Session specific? Maybe reset on switch? Let's keep simple for now)
    peakCapital: 0,
    netProfit: 0,
    totalSpins: 0,
    currentRoundBet: 0,
    numberHistory: [],
    history: [],
    transactionLog: [],

    // ACTIONS
    toggleMode: () => set(state => ({
        gameMode: state.gameMode === 'REAL' ? 'DEMO' : 'REAL',
        currentRoundBet: 0 // Reset bet when switching
    })),

    addLog: (type, amount, detail) => set(state => {
        const isReal = state.gameMode === 'REAL'
        const currentCap = isReal ? state.realCapital : state.demoCapital

        const newLog = {
            id: Date.now(),
            time: new Date().toLocaleString(),
            type,
            amount,
            detail: `[${state.gameMode}] ${detail}`,
            balanceAfter: currentCap
        }
        const updatedLogs = [newLog, ...(state.transactionLog || [])].slice(0, 100)
        return { transactionLog: updatedLogs }
    }),

    reloadCapital: () => set(state => {
        const amount = 1000
        const isReal = state.gameMode === 'REAL'
        const currentCap = isReal ? state.realCapital : state.demoCapital
        const newCapital = currentCap + amount

        const newLog = {
            id: Date.now(),
            time: new Date().toLocaleString(),
            type: 'DEPOSIT',
            amount: amount,
            detail: 'Recarga de emergencia',
            balanceAfter: newCapital
        }
        return {
            [isReal ? 'realCapital' : 'demoCapital']: newCapital,
            transactionLog: [newLog, ...(state.transactionLog || [])].slice(0, 100)
        }
    }),

    // Derived Metrics (Calculated on update)
    hourlyRate: 0,
    efficiency: 0, // Profit per spin
    projectedTimeHours: null,

    initialize: (startCap) => {
        set({
            sessionStart: Date.now(),
            initialCapital: startCap,
            currentCapital: startCap,
            peakCapital: startCap,
            netProfit: 0,
            totalSpins: 0,
            currentRoundBet: 0,
            history: [{ spin: 0, balance: startCap }],
            numberHistory: []
        })
    },

    placeBet: (amount, betType = 'STRAIGHT', currentBetOnSpot = 0) => {
        const state = get()
        const isReal = state.gameMode === 'REAL'
        const currentCap = isReal ? state.realCapital : state.demoCapital
        const limits = LIMITS[state.gameMode]

        // 1. Balance Check
        if (currentCap < amount) return { success: false, error: 'INSUFFICIENT_FUNDS' }

        // 2. Global Max Bet Check (Total table bet)
        if ((state.currentRoundBet + amount) > limits.MAX_TOTAL_BET) {
            return { success: false, error: 'MAX_TOTAL_EXCEEDED', limit: limits.MAX_TOTAL_BET }
        }

        if (betType === 'BATCH') {
            // Batch bets (Repeat/Double) bypass per-spot limit because they are aggregates.
            // We assume the individual components were validated when originally placed.
            // We only check Global Totals and Funds (already done above).
        } else {
            // 3. Per-Bet Logic Limit (Derived from Max Win)
            // Max Bet = MaxWin / Payout
            const payout = PAYOUTS[betType] || 35
            const maxBetForType = Math.floor(limits.MAX_WIN_PER_SPIN / payout)

            // Check if accumulated amount exceeds limit
            const totalAfterBet = currentBetOnSpot + amount

            if (totalAfterBet > maxBetForType) {
                return { success: false, error: 'LIMIT_EXCEEDED', limit: maxBetForType, type: betType }
            }
        }

        const newCapital = currentCap - amount

        // Log transaction
        const newLog = {
            id: Date.now(),
            time: new Date().toLocaleString(),
            type: 'BET',
            amount: -amount,
            detail: `[${state.gameMode}] Apuesta ${betType}`,
            balanceAfter: newCapital
        }
        const updatedLogs = [newLog, ...(state.transactionLog || [])].slice(0, 100)

        const updates = {
            currentRoundBet: state.currentRoundBet + amount,
            transactionLog: updatedLogs,
            [isReal ? 'realCapital' : 'demoCapital']: newCapital
        }
        set(updates)
        return { success: true }
    },

    refundBet: (amount) => {
        const state = get()
        const isReal = state.gameMode === 'REAL'
        const currentCap = isReal ? state.realCapital : state.demoCapital
        const newCapital = currentCap + amount

        const newLog = {
            id: Date.now(),
            time: new Date().toLocaleString(),
            type: 'REFUND',
            amount: amount,
            detail: 'Apuesta deshecha',
            balanceAfter: newCapital
        }
        const updatedLogs = [newLog, ...(state.transactionLog || [])].slice(0, 100)

        set({
            [isReal ? 'realCapital' : 'demoCapital']: newCapital,
            currentRoundBet: state.currentRoundBet - amount,
            transactionLog: updatedLogs
        })
    },

    resolveRound: (totalWinnings, winningNumber) => {
        const state = get()
        const isReal = state.gameMode === 'REAL'
        const currentCap = isReal ? state.realCapital : state.demoCapital

        const newCapital = currentCap + totalWinnings

        // Metrics Update (Simplified for now, sharing history)
        const newTotalSpins = state.totalSpins + 1

        // Update Number History
        const newNumberHistory = winningNumber !== undefined
            ? [...(state.numberHistory || []), winningNumber].slice(0, 50)
            : (state.numberHistory || [])

        // Log Result
        const newLog = {
            id: Date.now() + 1,
            time: new Date().toLocaleString(),
            type: totalWinnings > 0 ? 'WIN' : 'LOSS',
            amount: totalWinnings,
            detail: `[${state.gameMode}] Round End: ${winningNumber}`,
            balanceAfter: newCapital
        }
        const updatedLogs = [newLog, ...(state.transactionLog || [])].slice(0, 100)

        const updates = {
            currentRoundBet: 0,
            transactionLog: updatedLogs,
            numberHistory: newNumberHistory,
            totalSpins: newTotalSpins,
            // Only update active capital
            [isReal ? 'realCapital' : 'demoCapital']: newCapital
        }

        set(updates)
    },



    resetSession: () => {
        const cap = get().currentCapital
        set({
            sessionStart: Date.now(),
            initialCapital: cap, // Carry over capital? Or reset to MasterConfig default? 
            // Usually in a session simulator you keep the money but reset the Timer/Metrics
            netProfit: 0,
            totalSpins: 0,
            hourlyRate: 0,
            efficiency: 0,
            peakCapital: cap,
            history: [{ spin: 0, balance: cap }] // Initialize history
        })
    }
}))
