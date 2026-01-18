/* eslint-disable react-hooks/purity */
import React, { useEffect } from 'react'
import { useControls, button } from 'leva'
import { useGenesisStore } from '../logic/MasterConfig'
import { useStatTracker } from '../logic/StatTracker'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { STRATEGY_PRESETS } from '../logic/StrategyPresets'

export const ControlPanel = () => {
    const { setFinance, setPhysics, setStrategy, setTargets, setUI } = useGenesisStore()
    const addResult = useStatTracker(state => state.addResult)
    const registerSpin = useFinancialStore(state => state.registerSpin)

    // Initial values from store could be read here, but Leva controls their own state usually.
    // We'll sync Leva -> Store

    // --- UI CONTROLS ---
    // --- UI CONTROLS ---
    useControls('INTERFACE', {
        'Modo Ingeniero': { value: false, onChange: (v) => setUI({ showStats: v, showFinance: v, showGraph: v }) },
        'Ver Estadísticas': { value: false, render: (get) => get('INTERFACE.Modo Ingeniero'), onChange: (v) => setUI({ showStats: v }) },
        'Ver Finanzas': { value: false, render: (get) => get('INTERFACE.Modo Ingeniero'), onChange: (v) => setUI({ showFinance: v }) },
        'Ver Gráfica': { value: false, render: (get) => get('INTERFACE.Modo Ingeniero'), onChange: (v) => setUI({ showGraph: v }) },
    }, { collapsed: true })

    // Strategy Selector via Leva
    const { activeStrategy } = useControls('ESTRATEGIA (PRESETS)', {
        activeStrategy: {
            options: Object.keys(STRATEGY_PRESETS).reduce((acc, key) => {
                acc[STRATEGY_PRESETS[key].label] = key
                return acc
            }, {}),
            value: "GENESIS_DEFAULT",
            label: "Perfil Activo"
        }
    })

    // Auto-load Strategy on Change
    useEffect(() => {
        const preset = STRATEGY_PRESETS[activeStrategy]
        if (preset) {
            console.log("Loading Strategy:", preset.label)
            // Batch updates would be better, but simple setters work
            setPhysics(preset.values) // physics contains ballMass, friction, etc.
            setFinance({ stopWin: preset.values.stopWin }) // Partial finance update
            setStrategy({ waitThreshold: preset.values.waitThreshold }) // Partial strategy update

            // Also update Sim Speed if we had a setter for it (we put it in Ensayo earlier?)
            if (preset.values.simSpeed) {
                useGenesisStore.setState(state => ({ ensayo: { ...state.ensayo, timeCompression: preset.values.simSpeed } }))
            }
        }
    }, [activeStrategy, setPhysics, setFinance, setStrategy])

    // Manual Handlers
    const handleManualSpin = () => {
        const num = Math.floor(Math.random() * 37)
        addResult(num)

        // Simulación Financiera Simple para testing
        // 50/50 chance de ganar 1 fichas o perder 1
        const win = Math.random() > 0.5
        const delta = win ? 3500 : -100
        registerSpin(delta)
    }

    // Manual Folder
    useControls('Control Manual (Debug)', {
        'Girar (Random y $)': button(handleManualSpin),
        'Forzar 0': button(() => addResult(0)),
        'Forzar Rojo': button(() => addResult(1)),
    })

    const financeValues = useControls('Finanzas (Base)', {
        capital: { value: 1000000, step: 1000 },
        pointValue: { value: 100, min: 1, step: 1 },
        stopLoss: { value: 50000, step: 1000 },
        lossAlert: { value: -6300, step: 100 },
        pagoPleno: { value: 35, step: 1 },
        pagoCalle: { value: 12, step: 1 },
        initialBetPoints: { value: 1, min: 1, step: 1 },
        minIncrement: { value: 1, min: 1, step: 1 },
    })

    const targetValues = useControls('Finanzas (Objetivos/Límites)', {
        minWinSuggested: { value: 1100, step: 100 },
        maxWinOneGame: { value: 55500, step: 500 },
        targetHourlyWin: { value: 333.33, step: 10 },
    })

    const ensayoValues = useControls('Simulación (ENSAYO)', {
        timeCompression: { value: 1.0, min: 0.1, max: 100, step: 0.1, label: 'Compresión Tiempo' },
        projectedHours: { value: 4, step: 0.5, label: 'Horas Sesión' },
        targetRateMonth: { value: 73728000, step: 1000, label: 'Meta Mensual' },
    })

    const physicsValues = useControls('Física (Genesis Engine)', {
        ballMass: { value: 0.05, min: 0.01, max: 0.5, step: 0.01 },
        friction: { value: 0.01, min: 0, max: 0.1, step: 0.001 },
        gravity: { value: -9.81, step: 0.1 },
        wheelSpeed: { value: 0.5, min: 0, max: 2, step: 0.1 },
        scatter: { value: 0.7, min: 0, max: 1, step: 0.05 },
        tilt: { value: 0.0, min: 0, max: 1, step: 0.01 },
    })

    const strategyValues = useControls('Strategy Engine', {
        waitThreshold: { value: 51.42, step: 0.01 },
        waitMachine: { value: 20, step: 1 },
        waitAdditional: { value: 28, step: 1 },
        historyDepth: { value: 52, step: 1 },
        aggressiveness: { value: 1.0, min: 0.5, max: 2, step: 0.1 },
        recoveryMode: false,
    })

    useEffect(() => {
        setFinance(financeValues)
    }, [financeValues, setFinance])

    useEffect(() => {
        setTargets(targetValues) // Sync added
    }, [targetValues, setTargets])

    // Sync Ensayo
    useEffect(() => {
        // We need to add setEnsayo to store first, let's assume it exists or use generic setter if preferred, 
        // but for now I will add setEnsayo to MasterConfig in next tool call to match this.
        // Wait, I can't add it there. I need to add it to MasterConfig first.
        // UseGenesisStore needs setEnsayo.
        useGenesisStore.setState(state => ({ ensayo: { ...state.ensayo, ...ensayoValues } }))
    }, [ensayoValues])

    useEffect(() => {
        setPhysics(physicsValues)
    }, [physicsValues, setPhysics])

    useEffect(() => {
        setStrategy(strategyValues)
    }, [strategyValues, setStrategy])

    return null // Leva renders its own UI overlaid
}
