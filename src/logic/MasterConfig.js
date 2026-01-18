import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useGenesisStore = create(subscribeWithSelector((set) => ({
    finance: {
        capital: 0,
        pointValue: 100, // 'vlr punto'
        stopLoss: 50000,
        lossAlert: -6300, // 'alerta de pérdida'
        stopWin: 20000,
        pagoPleno: 35,
        pagoCalle: 12,
        betCount: 1, // '# apuestas'
        initialBetPoints: 1, // 'puntos ap inicial'
        minIncrement: 1, // 'incremento mínimo'
    },
    ensayo: {
        timeCompression: 1.0, // Control del tiempo simulado vs real
        projectedHours: 4, // 'Total Horas' para proyecciones
        targetRateHour: 333.33, // Tasa ganancia/hora esperada
        targetRateMonth: 73727999, // 'tasa mes' (del excel)
    },
    targets: {
        minWinPerGameCalc: 0, // 'gmjc'
        minWinPerGameObt: 5.55, // 'gmjo'
        minWinSuggested: 1100, // 'gms'
        minWinCalc: 0, // 'gmc'
        maxWinOneGame: 55500, // 'gmxo1j'
        targetHourlyWin: 333.33, // 'gmxho'
    },
    physics: {
        ballMass: 0.05,
        friction: 0.01,
        gravity: -9.81,
        wheelSpeed: 0.5,
        scatter: 0.7,
        tilt: 0.0,
    },
    strategy: {
        waitThreshold: 51.42,
        waitMachine: 20, // 'jugadas en máquina'
        waitAdditional: 28, // 'jugadas de espera adic'
        historyDepth: 52, // 'num max jug' (approx)
        aggressiveness: 1.0,
        recoveryMode: false,
        activePlan: 'PLAN_121',
    },
    ui: {
        showStats: false,
        showFinance: false,
        showGraph: false,
        showControls: false, // Default hidden
        viewMode: 'TRADITIONAL' // 'TRADITIONAL' | 'ENGINEER'
    },

    // Actions
    setFinance: (params) => set((state) => ({ finance: { ...state.finance, ...params } })),
    setTargets: (params) => set((state) => ({ targets: { ...state.targets, ...params } })),
    setPhysics: (params) => set((state) => ({ physics: { ...state.physics, ...params } })),
    setStrategy: (params) => set((state) => ({ strategy: { ...state.strategy, ...params } })),
    setUI: (params) => set((state) => ({ ui: { ...state.ui, ...params } })),
})))
