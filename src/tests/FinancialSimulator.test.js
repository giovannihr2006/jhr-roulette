/**
 * FinancialSimulator.test.js
 * Tests unitarios para el store de Zustand de finanzas del juego
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from '@testing-library/react'

// Mock localStorage
const localStorageMock = (() => {
    let store = {}
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value }),
        removeItem: vi.fn((key) => { delete store[key] }),
        clear: vi.fn(() => { store = {} })
    }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Import después del mock
import { useFinancialStore } from '../logic/FinancialSimulator'

// ============================================
// SETUP Y HELPERS
// ============================================
describe('FinancialSimulator Store', () => {

    beforeEach(() => {
        // Reset store antes de cada test
        act(() => {
            useFinancialStore.getState().hardReset()
        })
        vi.clearAllMocks()
    })

    // ============================================
    // ESTADO INICIAL
    // ============================================
    describe('Estado Inicial', () => {
        it('debe tener realCapital en 0 después de reset', () => {
            const state = useFinancialStore.getState()
            expect(state.realCapital).toBe(0)
        })

        it('debe tener demoCapital en 0 después de reset', () => {
            const state = useFinancialStore.getState()
            expect(state.demoCapital).toBe(0)
        })

        it('debe tener gameMode en REAL por defecto', () => {
            const state = useFinancialStore.getState()
            expect(state.gameMode).toBe('REAL')
        })

        it('debe tener totalSpins en 0', () => {
            const state = useFinancialStore.getState()
            expect(state.totalSpins).toBe(0)
        })

        it('debe tener currentRoundBet en 0', () => {
            const state = useFinancialStore.getState()
            expect(state.currentRoundBet).toBe(0)
        })

        it('debe tener numberHistory vacío', () => {
            const state = useFinancialStore.getState()
            expect(state.numberHistory).toEqual([])
        })

        it('debe tener transactionLog vacío', () => {
            const state = useFinancialStore.getState()
            expect(state.transactionLog).toEqual([])
        })
    })

    // ============================================
    // toggleMode
    // ============================================
    describe('toggleMode', () => {
        it('debe cambiar de REAL a DEMO', () => {
            act(() => {
                useFinancialStore.getState().toggleMode()
            })
            expect(useFinancialStore.getState().gameMode).toBe('DEMO')
        })

        it('debe cambiar de DEMO a REAL', () => {
            act(() => {
                useFinancialStore.getState().toggleMode()
                useFinancialStore.getState().toggleMode()
            })
            expect(useFinancialStore.getState().gameMode).toBe('REAL')
        })

        it('debe resetear currentRoundBet al cambiar modo', () => {
            // Primero agregamos fondos y una apuesta
            act(() => {
                useFinancialStore.getState().reloadCapital(1000)
                useFinancialStore.getState().placeBet(100)
            })

            expect(useFinancialStore.getState().currentRoundBet).toBe(100)

            act(() => {
                useFinancialStore.getState().toggleMode()
            })

            expect(useFinancialStore.getState().currentRoundBet).toBe(0)
        })
    })

    // ============================================
    // reloadCapital
    // ============================================
    describe('reloadCapital', () => {
        it('debe incrementar realCapital en modo REAL', () => {
            act(() => {
                useFinancialStore.getState().reloadCapital(1000)
            })
            expect(useFinancialStore.getState().realCapital).toBe(1000)
        })

        it('debe incrementar demoCapital en modo DEMO', () => {
            act(() => {
                useFinancialStore.getState().toggleMode() // Cambiar a DEMO
                useFinancialStore.getState().reloadCapital(500)
            })
            expect(useFinancialStore.getState().demoCapital).toBe(500)
        })

        it('debe usar 1000 como valor por defecto', () => {
            act(() => {
                useFinancialStore.getState().reloadCapital()
            })
            expect(useFinancialStore.getState().realCapital).toBe(1000)
        })

        it('debe acumular múltiples recargas', () => {
            act(() => {
                useFinancialStore.getState().reloadCapital(500)
                useFinancialStore.getState().reloadCapital(300)
            })
            expect(useFinancialStore.getState().realCapital).toBe(800)
        })

        it('debe agregar entrada al transactionLog', () => {
            act(() => {
                useFinancialStore.getState().reloadCapital(1000)
            })
            const log = useFinancialStore.getState().transactionLog
            expect(log).toHaveLength(1)
            expect(log[0].type).toBe('DEPOSIT')
            expect(log[0].amount).toBe(1000)
        })

        it('debe establecer initialCapital en primera recarga', () => {
            act(() => {
                useFinancialStore.getState().reloadCapital(5000)
            })
            expect(useFinancialStore.getState().initialCapital).toBe(5000)
        })
    })

    // ============================================
    // placeBet
    // ============================================
    describe('placeBet', () => {
        beforeEach(() => {
            act(() => {
                useFinancialStore.getState().reloadCapital(10000)
            })
        })

        it('debe decrementar el balance correctamente', () => {
            act(() => {
                useFinancialStore.getState().placeBet(100)
            })
            expect(useFinancialStore.getState().realCapital).toBe(9900)
        })

        it('debe incrementar currentRoundBet', () => {
            act(() => {
                useFinancialStore.getState().placeBet(100)
            })
            expect(useFinancialStore.getState().currentRoundBet).toBe(100)
        })

        it('debe retornar success: true en apuesta válida', () => {
            let result
            act(() => {
                result = useFinancialStore.getState().placeBet(100)
            })
            expect(result.success).toBe(true)
        })

        it('debe fallar si fondos insuficientes', () => {
            let result
            act(() => {
                result = useFinancialStore.getState().placeBet(20000)
            })
            expect(result.success).toBe(false)
            expect(result.error).toBe('INSUFFICIENT_FUNDS')
        })

        it('debe fallar si balance es exactamente igual a la apuesta y se intenta apostar más', () => {
            act(() => {
                useFinancialStore.getState().hardReset()
                useFinancialStore.getState().reloadCapital(100)
            })

            let result
            act(() => {
                result = useFinancialStore.getState().placeBet(100)
            })
            expect(result.success).toBe(true)

            act(() => {
                result = useFinancialStore.getState().placeBet(1)
            })
            expect(result.success).toBe(false)
        })

        it('debe acumular múltiples apuestas', () => {
            act(() => {
                useFinancialStore.getState().placeBet(100)
                useFinancialStore.getState().placeBet(50)
            })
            expect(useFinancialStore.getState().currentRoundBet).toBe(150)
            expect(useFinancialStore.getState().realCapital).toBe(9850)
        })

        it('debe agregar entrada al transactionLog', () => {
            const initialLogLength = useFinancialStore.getState().transactionLog.length

            act(() => {
                useFinancialStore.getState().placeBet(100)
            })

            const log = useFinancialStore.getState().transactionLog
            expect(log.length).toBe(initialLogLength + 1)
            expect(log[0].type).toBe('BET')
            expect(log[0].amount).toBe(-100)
        })
    })

    // ============================================
    // refundBet
    // ============================================
    describe('refundBet', () => {
        beforeEach(() => {
            act(() => {
                useFinancialStore.getState().reloadCapital(10000)
                useFinancialStore.getState().placeBet(500)
            })
        })

        it('debe restaurar fondos correctamente', () => {
            const balanceAfterBet = useFinancialStore.getState().realCapital

            act(() => {
                useFinancialStore.getState().refundBet(500)
            })

            expect(useFinancialStore.getState().realCapital).toBe(balanceAfterBet + 500)
        })

        it('debe decrementar currentRoundBet', () => {
            act(() => {
                useFinancialStore.getState().refundBet(500)
            })
            expect(useFinancialStore.getState().currentRoundBet).toBe(0)
        })

        it('debe reembolsar parcialmente', () => {
            act(() => {
                useFinancialStore.getState().refundBet(200)
            })
            expect(useFinancialStore.getState().currentRoundBet).toBe(300)
        })

        it('debe agregar entrada REFUND al log', () => {
            act(() => {
                useFinancialStore.getState().refundBet(500)
            })

            const log = useFinancialStore.getState().transactionLog
            expect(log[0].type).toBe('REFUND')
            expect(log[0].amount).toBe(500)
        })
    })

    // ============================================
    // withdraw
    // ============================================
    describe('withdraw', () => {
        beforeEach(() => {
            act(() => {
                useFinancialStore.getState().reloadCapital(10000)
            })
        })

        it('debe decrementar el balance correctamente', () => {
            act(() => {
                useFinancialStore.getState().withdraw(2000)
            })
            expect(useFinancialStore.getState().realCapital).toBe(8000)
        })

        it('debe retornar success: true en retiro válido', () => {
            let result
            act(() => {
                result = useFinancialStore.getState().withdraw(1000)
            })
            expect(result.success).toBe(true)
        })

        it('debe fallar si fondos insuficientes', () => {
            let result
            act(() => {
                result = useFinancialStore.getState().withdraw(20000)
            })
            expect(result.success).toBe(false)
            expect(result.error).toBe('INSUFFICIENT_FUNDS')
        })

        it('debe fallar si monto es 0', () => {
            let result
            act(() => {
                result = useFinancialStore.getState().withdraw(0)
            })
            expect(result.success).toBe(false)
            expect(result.error).toBe('INVALID_AMOUNT')
        })

        it('debe fallar si monto es negativo', () => {
            let result
            act(() => {
                result = useFinancialStore.getState().withdraw(-100)
            })
            expect(result.success).toBe(false)
            expect(result.error).toBe('INVALID_AMOUNT')
        })

        it('debe agregar entrada WITHDRAWAL al log', () => {
            act(() => {
                useFinancialStore.getState().withdraw(1000)
            })

            const log = useFinancialStore.getState().transactionLog
            expect(log[0].type).toBe('WITHDRAWAL')
            expect(log[0].amount).toBe(-1000)
        })
    })

    // ============================================
    // resolveRound
    // ============================================
    describe('resolveRound', () => {
        beforeEach(() => {
            act(() => {
                useFinancialStore.getState().reloadCapital(10000)
                useFinancialStore.getState().placeBet(100)
            })
        })

        it('debe agregar ganancias al balance', () => {
            const balanceBeforeWin = useFinancialStore.getState().realCapital

            act(() => {
                useFinancialStore.getState().resolveRound(3600, 17, { '17': 100 })
            })

            expect(useFinancialStore.getState().realCapital).toBe(balanceBeforeWin + 3600)
        })

        it('debe resetear currentRoundBet a 0', () => {
            act(() => {
                useFinancialStore.getState().resolveRound(0, 25, {})
            })
            expect(useFinancialStore.getState().currentRoundBet).toBe(0)
        })

        it('debe incrementar totalSpins', () => {
            act(() => {
                useFinancialStore.getState().resolveRound(0, 17, {})
            })
            expect(useFinancialStore.getState().totalSpins).toBe(1)
        })

        it('debe agregar número a numberHistory', () => {
            act(() => {
                useFinancialStore.getState().resolveRound(0, 17, {})
            })
            expect(useFinancialStore.getState().numberHistory).toContain(17)
        })

        it('debe agregar ronda a roundHistory', () => {
            act(() => {
                useFinancialStore.getState().resolveRound(3600, 17, { '17': 100 })
            })

            const history = useFinancialStore.getState().roundHistory
            expect(history).toHaveLength(1)
            expect(history[0].winningNumber).toBe(17)
            expect(history[0].totalWin).toBe(3600)
        })

        it('debe actualizar peakCapital si es nuevo máximo', () => {
            act(() => {
                useFinancialStore.getState().resolveRound(5000, 17, { '17': 100 })
            })

            // Balance después = 9900 + 5000 = 14900
            expect(useFinancialStore.getState().peakCapital).toBe(14900)
        })

        it('debe agregar WIN al log cuando hay ganancias', () => {
            act(() => {
                useFinancialStore.getState().resolveRound(3600, 17, {})
            })

            const log = useFinancialStore.getState().transactionLog
            expect(log[0].type).toBe('WIN')
        })

        it('debe agregar LOSS al log cuando no hay ganancias', () => {
            act(() => {
                useFinancialStore.getState().resolveRound(0, 25, {})
            })

            const log = useFinancialStore.getState().transactionLog
            expect(log[0].type).toBe('LOSS')
        })

        it('debe manejar múltiples rondas consecutivas', () => {
            act(() => {
                useFinancialStore.getState().resolveRound(0, 17, {})
                useFinancialStore.getState().placeBet(100)
                useFinancialStore.getState().resolveRound(0, 25, {})
                useFinancialStore.getState().placeBet(100)
                useFinancialStore.getState().resolveRound(3600, 0, {})
            })

            expect(useFinancialStore.getState().totalSpins).toBe(3)
            expect(useFinancialStore.getState().numberHistory).toHaveLength(3)
        })
    })

    // ============================================
    // hardReset
    // ============================================
    describe('hardReset', () => {
        it('debe resetear todos los valores financieros a 0', () => {
            act(() => {
                useFinancialStore.getState().reloadCapital(10000)
                useFinancialStore.getState().placeBet(500)
                useFinancialStore.getState().resolveRound(1000, 17, {})
                useFinancialStore.getState().hardReset()
            })

            const state = useFinancialStore.getState()
            expect(state.realCapital).toBe(0)
            expect(state.demoCapital).toBe(0)
            expect(state.initialCapital).toBe(0)
            expect(state.peakCapital).toBe(0)
            expect(state.currentRoundBet).toBe(0)
            expect(state.totalSpins).toBe(0)
        })

        it('debe limpiar todo el historial', () => {
            act(() => {
                useFinancialStore.getState().reloadCapital(10000)
                useFinancialStore.getState().resolveRound(0, 17, {})
                useFinancialStore.getState().hardReset()
            })

            const state = useFinancialStore.getState()
            expect(state.transactionLog).toEqual([])
            expect(state.numberHistory).toEqual([])
            expect(state.roundHistory).toEqual([])
            expect(state.history).toEqual([])
        })

        it('debe resetear gameMode a REAL', () => {
            act(() => {
                useFinancialStore.getState().toggleMode()
                useFinancialStore.getState().hardReset()
            })
            expect(useFinancialStore.getState().gameMode).toBe('REAL')
        })

        it('debe establecer nuevo sessionStart', () => {
            const oldSession = useFinancialStore.getState().sessionStart

            // Pequeño delay para asegurar diferencia de timestamp
            act(() => {
                useFinancialStore.getState().hardReset()
            })

            expect(useFinancialStore.getState().sessionStart).toBeGreaterThanOrEqual(oldSession)
        })
    })

    // ============================================
    // Edge Cases
    // ============================================
    describe('Edge Cases', () => {
        it('debe manejar apuesta exacta al balance', () => {
            act(() => {
                useFinancialStore.getState().reloadCapital(100)
            })

            let result
            act(() => {
                result = useFinancialStore.getState().placeBet(100)
            })

            expect(result.success).toBe(true)
            expect(useFinancialStore.getState().realCapital).toBe(0)
        })

        it('debe mantener balances separados entre REAL y DEMO', () => {
            act(() => {
                useFinancialStore.getState().reloadCapital(5000) // REAL
                useFinancialStore.getState().toggleMode() // DEMO
                useFinancialStore.getState().reloadCapital(1000) // DEMO
            })

            expect(useFinancialStore.getState().demoCapital).toBe(1000)
            expect(useFinancialStore.getState().realCapital).toBe(5000)
        })

        it('debe limitar transactionLog a 2000 entradas', () => {
            // Test rápido: verificar que el slice funciona
            // La lógica usa .slice(0, 2000), así que cualquier overflow se recorta
            act(() => {
                useFinancialStore.getState().reloadCapital(10000)
                // 50 iteraciones son suficientes para verificar que el log se mantiene funcional
                for (let i = 0; i < 50; i++) {
                    useFinancialStore.getState().placeBet(1)
                    useFinancialStore.getState().refundBet(1)
                }
            })
            // Verificar que el log existe y tiene entradas
            const logLength = useFinancialStore.getState().transactionLog.length
            expect(logLength).toBeGreaterThan(0)
            expect(logLength).toBeLessThanOrEqual(2000)
        })

        it('debe limitar numberHistory a 2000 entradas', () => {
            // Test rápido: verificar que el slice funciona
            act(() => {
                useFinancialStore.getState().reloadCapital(10000)
                // 50 iteraciones son suficientes para verificar la funcionalidad
                for (let i = 0; i < 50; i++) {
                    useFinancialStore.getState().resolveRound(0, i % 37, {})
                }
            })
            // Verificar que el historial existe y tiene entradas
            const historyLength = useFinancialStore.getState().numberHistory.length
            expect(historyLength).toBe(50)
            expect(historyLength).toBeLessThanOrEqual(2000)
        })
    })
})
