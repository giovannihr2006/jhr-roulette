import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { LIMITS, PAYOUTS } from '../config/GameLimits'
import {
  validateFinancialState,
  createInitialFinancialState,
  sanitizeFinancialState
} from './FinancialStateValidator'

export const useFinancialStore = create(
    persist(
        (set, get) => ({
            sessionStart: Date.now(),
            gameMode: 'REAL',
            realCapital: 0,
            demoCapital: 0,
            baseWaitThreshold: 300,
            riskCopilotEnabled: true,

            get balance() {
                const s = get()
                return s.gameMode === 'REAL' ? s.realCapital : s.demoCapital
            },

            targetProfit: 0,
            stopLossLimit: 0,
            useVaRStopLoss: false,
            setTargetProfit: (val) => set({ targetProfit: val }),
            setStopLossLimit: (val) => set({ stopLossLimit: val }),
            setUseVaRStopLoss: (val) => set({ useVaRStopLoss: val }),

            getVaRStopLoss: () => {
                const s = get()
                if (!s.useVaRStopLoss || s.totalSpins === 0) return s.stopLossLimit

                const results = s.roundHistory.map(r => r.netResult)
                if (results.length < 5) {
                    const baselineVolatility = 15 // baseline of 15 chips (1500 COP in equivalent units)
                    const factor = s.gameMode === 'REAL' ? 100 : 1 // if in real mode, scale by 100 COP per chip
                    return Math.max(0, s.initialCapital - Math.round(1.96 * baselineVolatility * factor * Math.sqrt(s.totalSpins)))
                }

                const mean = results.reduce((sum, val) => sum + val, 0) / results.length
                const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length
                const stdDev = Math.sqrt(variance) || 10

                const limit = s.initialCapital - (1.96 * stdDev * Math.sqrt(s.totalSpins))
                return Math.max(0, Math.round(limit))
            },

            peakCapital: 0,
            netProfit: 0,
            totalSpins: 0,
            currentRoundBet: 0,
            numberHistory: [],
            roundHistory: [],
            history: [],
            transactionLog: [],
            lastActionTime: Date.now(),
            totalIdleTime: 0,

            toggleMode: () => set(state => ({
                gameMode: state.gameMode === 'REAL' ? 'DEMO' : 'REAL',
                currentRoundBet: 0
            })),

            setBaseThreshold: (val) => set({ baseWaitThreshold: val }),
            setRiskCopilotEnabled: (val) => set({ riskCopilotEnabled: val }),

            runFastSimulation: (count = 100) => {
                const state = get()
                const WHEEL_NUMBERS = [
                    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
                    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
                ]

                const getSecureRandomInt = (max) => {
                    const limit = 0xFFFFFFFF - (0xFFFFFFFF % max);
                    const array = new Uint32Array(1);
                    while (true) {
                        window.crypto.getRandomValues(array);
                        if (array[0] < limit) {
                            return array[0] % max;
                        }
                    }
                }

                let currentReal = state.realCapital
                let currentDemo = state.demoCapital
                let newNumberHistory = [...(state.numberHistory || [])]
                let newRoundHistory = [...(state.roundHistory || [])]
                let newTransactionLog = [...(state.transactionLog || [])]
                let newSpins = state.totalSpins

                const nowBase = Date.now()

                for (let i = 0; i < count; i++) {
                    const winningNumber = WHEEL_NUMBERS[getSecureRandomInt(WHEEL_NUMBERS.length)]
                    newSpins++
                    newNumberHistory.push(winningNumber)

                    const roundTimestamp = nowBase - (count - i) * 1000 // past seconds offsets
                    const roundData = {
                        id: roundTimestamp,
                        spin: newSpins,
                        timestamp: roundTimestamp,
                        winningNumber,
                        bets: {},
                        totalBet: 0,
                        totalWin: 0,
                        netResult: 0,
                        balanceAfter: state.gameMode === 'REAL' ? currentReal : currentDemo,
                        mode: state.gameMode
                    }

                    newRoundHistory.unshift(roundData)

                    const newLog = {
                        id: roundTimestamp + 1,
                        time: new Date(roundTimestamp).toLocaleString(),
                        type: 'LOSS',
                        amount: 0,
                        detail: `[${state.gameMode}] Calibración: ${winningNumber}`,
                        balanceAfter: state.gameMode === 'REAL' ? currentReal : currentDemo
                    }
                    newTransactionLog.unshift(newLog)
                }

                newNumberHistory = newNumberHistory.slice(-2000)
                newRoundHistory = newRoundHistory.slice(0, 2000)
                newTransactionLog = newTransactionLog.slice(0, 2000)

                set({
                    numberHistory: newNumberHistory,
                    roundHistory: newRoundHistory,
                    transactionLog: newTransactionLog,
                    totalSpins: newSpins,
                    lastActionTime: Date.now()
                })
            },

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
                const updatedLogs = [newLog, ...(state.transactionLog || [])].slice(0, 2000)
                return { transactionLog: updatedLogs }
            }),

            reloadCapital: (amount = 1000) => set(state => {
                const isReal = state.gameMode === 'REAL'
                const currentCap = isReal ? state.realCapital : state.demoCapital
                const newCapital = currentCap + amount
                const newLog = {
                    id: Date.now(),
                    time: new Date().toLocaleString(),
                    type: 'DEPOSIT',
                    amount,
                    detail: 'Recarga de usuario',
                    balanceAfter: newCapital
                }
                const isFirstDeposit = (state.transactionLog || []).length === 0
                const currentInitial = state.initialCapital || 0
                const newInitial = isFirstDeposit ? newCapital : (currentInitial + amount)
                const newPeak = Math.max(state.peakCapital || 0, newCapital)

                return {
                    [isReal ? 'realCapital' : 'demoCapital']: newCapital,
                    transactionLog: [newLog, ...(state.transactionLog || [])].slice(0, 100),
                    initialCapital: newInitial,
                    peakCapital: newPeak, // Sync peak to prevent false record modal on reload
                    ...(isFirstDeposit ? { sessionStart: Date.now() } : {})
                }
            }),

            initialize: (startCap) => {
                const state = get()
                // PROTECTION: Only initialize if not already set (rehydration might have happened)
                if (state.sessionStart && state.initialCapital) {
                    console.log("Simulator already initialized, skipping reset.")
                    return
                }

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

                if (currentCap < amount) return { success: false, error: 'INSUFFICIENT_FUNDS' }
                if ((state.currentRoundBet + amount) > limits.MAX_TOTAL_BET) {
                    return { success: false, error: 'MAX_TOTAL_EXCEEDED', limit: limits.MAX_TOTAL_BET }
                }

                if (betType !== 'BATCH') {
                    const payout = PAYOUTS[betType] || 35
                    const maxBetForType = Math.floor(limits.MAX_WIN_PER_SPIN / payout)
                    const totalAfterBet = currentBetOnSpot + amount
                    if (totalAfterBet > maxBetForType) {
                        return { success: false, error: 'LIMIT_EXCEEDED', limit: maxBetForType, type: betType }
                    }
                }

                const newCapital = currentCap - amount
                const newLog = {
                    id: Date.now(),
                    time: new Date().toLocaleString(),
                    type: 'BET',
                    amount: -amount,
                    detail: `[${state.gameMode}] Apuesta ${betType}`,
                    balanceAfter: newCapital
                }
                const updatedLogs = [newLog, ...(state.transactionLog || [])].slice(0, 2000)

                set({
                    currentRoundBet: state.currentRoundBet + amount,
                    transactionLog: updatedLogs,
                    [isReal ? 'realCapital' : 'demoCapital']: newCapital
                })
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
                const updatedLogs = [newLog, ...(state.transactionLog || [])].slice(0, 2000)

                set({
                    [isReal ? 'realCapital' : 'demoCapital']: newCapital,
                    currentRoundBet: state.currentRoundBet - amount,
                    transactionLog: updatedLogs
                })
            },

            withdraw: (amount) => {
                const state = get()
                const isReal = state.gameMode === 'REAL'
                const currentCap = isReal ? state.realCapital : state.demoCapital

                if (amount <= 0) return { success: false, error: 'INVALID_AMOUNT' }
                if (amount > currentCap) return { success: false, error: 'INSUFFICIENT_FUNDS' }

                const newCapital = currentCap - amount
                const newLog = {
                    id: Date.now(),
                    time: new Date().toLocaleString(),
                    type: 'WITHDRAWAL',
                    amount: -amount,
                    detail: 'Retiro parcial de fondos',
                    balanceAfter: newCapital
                }
                const updatedLogs = [newLog, ...(state.transactionLog || [])].slice(0, 2000)

                set({
                    [isReal ? 'realCapital' : 'demoCapital']: newCapital,
                    transactionLog: updatedLogs
                })
                return { success: true }
            },

            resolveRound: (totalWinnings, winningNumber, currentBets = {}) => {
                const state = get()
                const now = Date.now()

                // TRACK IDLE TIME (Smart Timer)
                // If gap since last action > 60 seconds (60000ms), add to idle time
                const gap = now - (state.lastActionTime || state.sessionStart)
                const addedIdle = (gap > 60000) ? (gap - 60000) : 0

                const isReal = state.gameMode === 'REAL'
                const currentCap = isReal ? state.realCapital : state.demoCapital
                const newCapital = currentCap + totalWinnings
                const newTotalSpins = state.totalSpins + 1
                const newNumberHistory = winningNumber !== undefined
                    ? [...(state.numberHistory || []), winningNumber].slice(-2000)
                    : (state.numberHistory || [])
                const roundData = {
                    id: now,
                    spin: newTotalSpins,
                    timestamp: now,
                    winningNumber,
                    bets: currentBets === null ? {} : currentBets, // Safety fallback
                    totalBet: state.currentRoundBet,
                    totalWin: totalWinnings,
                    netResult: totalWinnings - state.currentRoundBet,
                    balanceAfter: newCapital,
                    mode: state.gameMode
                }
                const newRoundHistory = [roundData, ...(state.roundHistory || [])].slice(0, 2000)
                const newLog = {
                    id: now + 1,
                    time: new Date().toLocaleString(),
                    type: totalWinnings > 0 ? 'WIN' : 'LOSS',
                    amount: totalWinnings,
                    detail: `[${state.gameMode}] Round End: ${winningNumber}`,
                    balanceAfter: newCapital
                }
                const updatedLogs = [newLog, ...(state.transactionLog || [])].slice(0, 2000)

                const newPeak = Math.max(state.peakCapital || 0, newCapital)

                set({
                    currentRoundBet: 0,
                    transactionLog: updatedLogs,
                    numberHistory: newNumberHistory,
                    roundHistory: newRoundHistory,
                    totalSpins: newTotalSpins,
                    peakCapital: newPeak,
                    [isReal ? 'realCapital' : 'demoCapital']: newCapital,
                    lastActionTime: now,
                    totalIdleTime: (state.totalIdleTime || 0) + addedIdle
                })
            },

            resetSession: () => {
                const cap = get().balance // Use getter instead of undefined currentCapital
                set({
                    sessionStart: Date.now(),
                    initialCapital: cap,
                    netProfit: 0,
                    totalSpins: 0,
                    peakCapital: cap,
                    history: [{ spin: 0, balance: cap }],
                    totalIdleTime: 0,
                    lastActionTime: Date.now()
                })
            },

            setInitialCapital: (amount) => set({ initialCapital: amount }),

            hardReset: () => set({
                realCapital: 0,
                demoCapital: 0,
                initialCapital: 0,
                peakCapital: 0,
                currentCapital: 0,
                netProfit: 0,
                currentRoundBet: 0,
                targetProfit: 0,
                stopLossLimit: 0,
                transactionLog: [],
                numberHistory: [],
                roundHistory: [],
                totalSpins: 0,
                history: [], // Reset chart
                sessionStart: Date.now(),
                totalIdleTime: 0,
                lastActionTime: Date.now(),
                gameMode: 'REAL' // Force reset to Real mode
            })
        }),
        {
            name: 'baryonic-financial-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // PERSIST EVERYTHING EXCEPT TEMPORARY SESSION DATA IF NEEDED
                // For now, persist ALL essential data
                realCapital: state.realCapital,
                demoCapital: state.demoCapital,
                targetProfit: state.targetProfit,
                stopLossLimit: state.stopLossLimit,
                transactionLog: state.transactionLog,
                numberHistory: state.numberHistory,
                roundHistory: state.roundHistory,
                sessionStart: state.sessionStart,
                initialCapital: state.initialCapital,
                peakCapital: state.peakCapital,
                lastActionTime: state.lastActionTime,
                totalIdleTime: state.totalIdleTime,
                baseWaitThreshold: state.baseWaitThreshold,
                totalSpins: state.totalSpins,
                riskCopilotEnabled: state.riskCopilotEnabled,
                useVaRStopLoss: state.useVaRStopLoss
            }),
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error('❌ Error rehydrating financial store:', error)
                    return
                }

                // Validar estado rehydratado
                const validation = validateFinancialState(state)

                if (!validation.isValid) {
                    console.warn('⚠️ Invalid stored financial state:', validation.reason)
                    if (validation.errors) {
                        validation.errors.forEach(err => console.warn(`  - ${err}`))
                    }

                    // Intentar sanitizar datos parciales y aplicarlo en su lugar
                    const sanitized = sanitizeFinancialState(state)
                    console.log('🔧 Financial state sanitized and applied')
                    Object.assign(state, sanitized)
                }
            }
        }
    )
)
