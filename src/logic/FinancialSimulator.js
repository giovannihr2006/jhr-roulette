import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { LIMITS, PAYOUTS } from '../config/GameLimits'

export const useFinancialStore = create(
    persist(
        (set, get) => ({
            sessionStart: Date.now(),
            gameMode: 'REAL',
            realCapital: 0,
            demoCapital: 0,

            get balance() {
                const s = get()
                return s.gameMode === 'REAL' ? s.realCapital : s.demoCapital
            },

            peakCapital: 0,
            netProfit: 0,
            totalSpins: 0,
            currentRoundBet: 0,
            numberHistory: [],
            roundHistory: [],
            history: [],
            transactionLog: [],

            toggleMode: () => set(state => ({
                gameMode: state.gameMode === 'REAL' ? 'DEMO' : 'REAL',
                currentRoundBet: 0
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

                return {
                    [isReal ? 'realCapital' : 'demoCapital']: newCapital,
                    transactionLog: [newLog, ...(state.transactionLog || [])].slice(0, 100),
                    initialCapital: newInitial,
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
                const isReal = state.gameMode === 'REAL'
                const currentCap = isReal ? state.realCapital : state.demoCapital

                // Bug #8 Fix: Validar integridad de datos - suma de apuestas vs currentRoundBet
                const sumOfBets = currentBets && typeof currentBets === 'object'
                    ? Object.values(currentBets).reduce((sum, amt) => sum + (typeof amt === 'number' ? amt : 0), 0)
                    : 0

                // Log warning si hay discrepancia significativa (más de 0.01 de diferencia)
                if (Math.abs(sumOfBets - state.currentRoundBet) > 0.01 && state.currentRoundBet > 0) {
                    console.warn(`[FinancialSimulator] Discrepancia de integridad: currentRoundBet=${state.currentRoundBet}, sumOfBets=${sumOfBets}`)
                }

                const newCapital = currentCap + totalWinnings
                const newTotalSpins = state.totalSpins + 1
                const newNumberHistory = winningNumber !== undefined
                    ? [...(state.numberHistory || []), winningNumber].slice(-2000)
                    : (state.numberHistory || [])
                const roundData = {
                    id: Date.now(),
                    spin: newTotalSpins,
                    timestamp: Date.now(),
                    winningNumber,
                    bets: currentBets === null ? {} : currentBets, // Safety fallback
                    totalBet: state.currentRoundBet,
                    totalWin: totalWinnings,
                    netResult: totalWinnings - state.currentRoundBet,
                    balanceAfter: newCapital,
                    mode: state.gameMode,
                    integrityCheck: sumOfBets === state.currentRoundBet // Flag de validación
                }
                const newRoundHistory = [roundData, ...(state.roundHistory || [])].slice(0, 2000)
                const newLog = {
                    id: Date.now() + 1,
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
                    [isReal ? 'realCapital' : 'demoCapital']: newCapital
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
                    history: [{ spin: 0, balance: cap }]
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
                transactionLog: [],
                numberHistory: [],
                roundHistory: [],
                totalSpins: 0,
                history: [], // Reset chart
                sessionStart: Date.now(),
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
                transactionLog: state.transactionLog,
                numberHistory: state.numberHistory,
                roundHistory: state.roundHistory,
                sessionStart: state.sessionStart,
                initialCapital: state.initialCapital,
                peakCapital: state.peakCapital
            }),
        }
    )
)
