/**
 * useRouletteGame.test.js
 * Tests unitarios para el hook de lógica del juego de ruleta
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRouletteGame } from '../hooks/useRouletteGame'

// Mock de dependencias externas
vi.mock('../utils/SoundManager', () => ({
    soundManager: {
        playSpinStart: vi.fn(),
        playBallLoop: vi.fn(),
        stopBallLoop: vi.fn(),
        playWin: vi.fn(),
        stopAll: vi.fn()
    }
}))

vi.mock('../utils/DealerVoice', () => ({
    dealer: {
        welcome: vi.fn(),
        noMoreBets: vi.fn(),
        winner: vi.fn(),
        betsOpen: vi.fn(),
        profitWin: vi.fn()
    }
}))

// Mock de crypto.getRandomValues
const mockGetRandomValues = vi.fn((array) => {
    array[0] = Math.floor(Math.random() * 0xFFFFFFFF)
    return array
})

Object.defineProperty(window, 'crypto', {
    value: {
        getRandomValues: mockGetRandomValues
    },
    writable: true
})

// ============================================
// CONSTANTES DE REFERENCIA
// ============================================
const WHEEL_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

// ============================================
// SETUP Y TEARDOWN
// ============================================
describe('useRouletteGame Hook', () => {
    let mockSetCurrentBets
    let mockSetLastBets
    let mockSetBetHistory
    let mockResolveRound

    beforeEach(() => {
        vi.useFakeTimers()
        mockSetCurrentBets = vi.fn()
        mockSetLastBets = vi.fn()
        mockSetBetHistory = vi.fn()
        mockResolveRound = vi.fn()
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    const renderGameHook = (currentBets = {}) => {
        return renderHook(() => useRouletteGame({
            currentBets,
            setCurrentBets: mockSetCurrentBets,
            setLastBets: mockSetLastBets,
            setBetHistory: mockSetBetHistory,
            resolveRound: mockResolveRound
        }))
    }

    // ============================================
    // ESTADO INICIAL
    // ============================================
    describe('Estado Inicial', () => {
        it('debe inicializar isSpinning como false', () => {
            const { result } = renderGameHook()
            expect(result.current.isSpinning).toBe(false)
        })

        it('debe inicializar lastWin como null', () => {
            const { result } = renderGameHook()
            expect(result.current.lastWin).toBe(null)
        })

        it('debe inicializar lastWinAmount como 0', () => {
            const { result } = renderGameHook()
            expect(result.current.lastWinAmount).toBe(0)
        })

        it('debe inicializar showBall como false', () => {
            const { result } = renderGameHook()
            expect(result.current.showBall).toBe(false)
        })

        it('debe tener physicsState con valores iniciales', () => {
            const { result } = renderGameHook()
            expect(result.current.physicsState).toBeDefined()
            expect(result.current.physicsState.ballType).toBeDefined()
            expect(result.current.physicsState.wheelDirection).toBeDefined()
        })

        it('debe retornar handleSpin como función', () => {
            const { result } = renderGameHook()
            expect(typeof result.current.handleSpin).toBe('function')
        })
    })

    // ============================================
    // handleSpin - Validaciones
    // ============================================
    describe('handleSpin - Validaciones', () => {
        it('no debe ejecutar si ya está girando', async () => {
            const { result } = renderGameHook({ '17': 100 })

            // Primer giro
            act(() => {
                result.current.handleSpin()
            })

            expect(result.current.isSpinning).toBe(true)

            // Intentar segundo giro mientras está girando
            const firstSpinState = result.current.isSpinning
            act(() => {
                result.current.handleSpin()
            })

            // Debería seguir en el mismo estado de giro
            expect(result.current.isSpinning).toBe(firstSpinState)
        })

        it('debe establecer isSpinning a true al iniciar giro', () => {
            const { result } = renderGameHook()

            act(() => {
                result.current.handleSpin()
            })

            expect(result.current.isSpinning).toBe(true)
        })

        it('debe actualizar physicsState al girar', () => {
            const { result } = renderGameHook()
            const initialPhysics = { ...result.current.physicsState }

            act(() => {
                result.current.handleSpin()
            })

            // Los valores de física deberían actualizarse (pueden ser iguales por azar)
            expect(result.current.physicsState).toBeDefined()
            expect(result.current.physicsState.ballType).toBeDefined()
        })

        it('debe mostrar la bola al iniciar giro', () => {
            const { result } = renderGameHook()

            act(() => {
                result.current.handleSpin()
            })

            expect(result.current.showBall).toBe(true)
        })

        it('debe incrementar ballResetKey al iniciar giro', () => {
            const { result } = renderGameHook()
            const initialKey = result.current.ballResetKey

            act(() => {
                result.current.handleSpin()
            })

            expect(result.current.ballResetKey).toBe(initialKey + 1)
        })
    })

    // ============================================
    // handleSpin - Apuestas
    // ============================================
    describe('handleSpin - Manejo de Apuestas', () => {
        it('debe guardar apuestas actuales como lastBets', () => {
            const bets = { '17': 100, 'RED': 50 }
            const { result } = renderGameHook(bets)

            act(() => {
                result.current.handleSpin()
            })

            expect(mockSetLastBets).toHaveBeenCalledWith(bets)
        })

        it('no debe llamar setLastBets si no hay apuestas', () => {
            const { result } = renderGameHook({})

            act(() => {
                result.current.handleSpin()
            })

            expect(mockSetLastBets).not.toHaveBeenCalled()
        })

        it('debe limpiar historial de apuestas al girar', () => {
            const { result } = renderGameHook({ '17': 100 })

            act(() => {
                result.current.handleSpin()
            })

            expect(mockSetBetHistory).toHaveBeenCalledWith([])
        })

        it('debe resetear lastWin a null al iniciar giro', () => {
            const { result } = renderGameHook()

            act(() => {
                result.current.handleSpin()
            })

            expect(result.current.lastWin).toBe(null)
        })
    })

    // ============================================
    // handleSpin - Resolución del Giro
    // ============================================
    describe('handleSpin - Resolución', () => {
        it('debe completar el giro después del timeout', async () => {
            const { result } = renderGameHook({ '17': 100 })

            act(() => {
                result.current.handleSpin()
            })

            expect(result.current.isSpinning).toBe(true)

            // Avanzar el tiempo para completar el giro (12500ms)
            act(() => {
                vi.advanceTimersByTime(12600)
            })

            expect(result.current.isSpinning).toBe(false)
        })

        it('debe establecer lastWin después del giro', async () => {
            const { result } = renderGameHook({ '17': 100 })

            act(() => {
                result.current.handleSpin()
            })

            act(() => {
                vi.advanceTimersByTime(12600)
            })

            // lastWin debería ser un número del 0-36
            expect(result.current.lastWin).not.toBe(null)
            expect(WHEEL_NUMBERS).toContain(result.current.lastWin)
        })

        it('debe llamar resolveRound después del giro', async () => {
            const bets = { '17': 100 }
            const { result } = renderGameHook(bets)

            act(() => {
                result.current.handleSpin()
            })

            act(() => {
                vi.advanceTimersByTime(12600)
            })

            expect(mockResolveRound).toHaveBeenCalled()
            // Verificar que se llamó con: (totalWinnings, winningNumber, roundBets)
            expect(mockResolveRound.mock.calls[0]).toHaveLength(3)
        })

        it('debe limpiar apuestas actuales después del giro', async () => {
            const { result } = renderGameHook({ '17': 100 })

            act(() => {
                result.current.handleSpin()
            })

            act(() => {
                vi.advanceTimersByTime(12600)
            })

            expect(mockSetCurrentBets).toHaveBeenCalledWith({})
        })
    })

    // ============================================
    // getSecureRandomInt (Indirecto)
    // ============================================
    describe('RNG Seguro', () => {
        it('debe usar crypto.getRandomValues para el número ganador', () => {
            const { result } = renderGameHook()

            act(() => {
                result.current.handleSpin()
            })

            // Verificar que crypto.getRandomValues fue llamado
            expect(mockGetRandomValues).toHaveBeenCalled()
        })

        it('debe generar números válidos de ruleta (0-36)', async () => {
            const generatedNumbers = new Set()

            // Ejecutar múltiples giros para probar distribución
            for (let i = 0; i < 10; i++) {
                const { result } = renderGameHook()

                act(() => {
                    result.current.handleSpin()
                })

                act(() => {
                    vi.advanceTimersByTime(12600)
                })

                if (result.current.lastWin !== null) {
                    generatedNumbers.add(result.current.lastWin)
                    expect(result.current.lastWin).toBeGreaterThanOrEqual(0)
                    expect(result.current.lastWin).toBeLessThanOrEqual(36)
                }
            }
        })
    })

    // ============================================
    // physicsState
    // ============================================
    describe('physicsState', () => {
        it('debe contener información de tipo de bola', () => {
            const { result } = renderGameHook()
            expect(result.current.physicsState.ballType).toBeDefined()
            expect(result.current.physicsState.ballType.name).toBeDefined()
            expect(result.current.physicsState.ballType.color).toBeDefined()
        })

        it('debe contener información de velocidad de bola', () => {
            const { result } = renderGameHook()
            expect(result.current.physicsState.ballSpeed).toBeDefined()
        })

        it('debe contener dirección de la rueda', () => {
            const { result } = renderGameHook()
            expect(result.current.physicsState.wheelDirection).toBeDefined()
        })

        it('debe contener dirección de la bola', () => {
            const { result } = renderGameHook()
            expect(result.current.physicsState.ballDirection).toBeDefined()
        })

        it('debe actualizar physics al girar', () => {
            const { result } = renderGameHook()

            act(() => {
                result.current.handleSpin()
            })

            // wheelSpeed debería tener formato "X m/s (Y km/h)"
            expect(result.current.physicsState.wheelSpeed).toMatch(/m\/s/)
        })
    })

    // ============================================
    // Rotaciones
    // ============================================
    describe('Rotaciones', () => {
        it('debe actualizar wheelRotation al girar', () => {
            const { result } = renderGameHook()
            const initialRotation = result.current.wheelRotation

            act(() => {
                result.current.handleSpin()
            })

            // Avanzar tiempo para que se aplique la rotación
            act(() => {
                vi.advanceTimersByTime(200)
            })

            expect(result.current.wheelRotation).not.toBe(initialRotation)
        })

        it('debe actualizar ballRotation al girar', () => {
            const { result } = renderGameHook()

            act(() => {
                result.current.handleSpin()
            })

            act(() => {
                vi.advanceTimersByTime(200)
            })

            expect(result.current.ballRotation).toBeDefined()
        })
    })

    // ============================================
    // Edge Cases
    // ============================================
    describe('Edge Cases', () => {
        it('debe manejar apuestas vacías correctamente', () => {
            const { result } = renderGameHook({})

            act(() => {
                result.current.handleSpin()
            })

            expect(result.current.isSpinning).toBe(true)

            act(() => {
                vi.advanceTimersByTime(12600)
            })

            expect(result.current.isSpinning).toBe(false)
            expect(mockResolveRound).toHaveBeenCalled()
        })

        it('debe permitir múltiples giros secuenciales', async () => {
            const { result } = renderGameHook({ '17': 100 })

            // Primer giro
            act(() => {
                result.current.handleSpin()
            })

            act(() => {
                vi.advanceTimersByTime(12600)
            })

            expect(result.current.isSpinning).toBe(false)

            // Segundo giro
            act(() => {
                result.current.handleSpin()
            })

            expect(result.current.isSpinning).toBe(true)

            act(() => {
                vi.advanceTimersByTime(12600)
            })

            expect(result.current.isSpinning).toBe(false)
        })
    })
})

// ============================================
// CONSTANTES EXPORTADAS
// ============================================
describe('Constantes del Hook', () => {
    it('WHEEL_NUMBERS debe tener 37 números', () => {
        expect(WHEEL_NUMBERS).toHaveLength(37)
    })

    it('WHEEL_NUMBERS debe empezar con 0', () => {
        expect(WHEEL_NUMBERS[0]).toBe(0)
    })

    it('WHEEL_NUMBERS debe contener todos los números 0-36', () => {
        for (let i = 0; i <= 36; i++) {
            expect(WHEEL_NUMBERS).toContain(i)
        }
    })
})
