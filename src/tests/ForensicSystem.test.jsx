
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useForensicSystem } from '../hooks/useForensicSystem'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { useToastStore } from '../logic/ToastStore'

// Mock Stores
const mockMatchActiveBets = vi.fn()
const mockAddToast = vi.fn()

// Mock Store Implementations
// We need to mock the hooks used inside useForensicSystem
// Specifically useFinancialStore and useToastStore

vi.mock('../logic/FinancialSimulator', () => ({
    useFinancialStore: vi.fn()
}))

vi.mock('../logic/ToastStore', () => ({
    useToastStore: vi.fn()
}))

describe('useForensicSystem', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // Default Mock Returns
        useFinancialStore.mockImplementation((selector) => {
            const state = {
                matchActiveBets: mockMatchActiveBets,
                activeBets: {}, // Empty by default
            }
            return selector(state)
        })

        useToastStore.mockImplementation((selector) => {
            return selector({ addToast: mockAddToast })
        })
    })

    it('should restore bets from persistent storage on mount', () => {
        // Setup stored bets
        const storedBets = { 'RED': 100 }
        useFinancialStore.mockImplementation((selector) => {
            const state = {
                matchActiveBets: mockMatchActiveBets,
                activeBets: storedBets, // Simulating crash recovery data
            }
            return selector(state)
        })

        const setCurrentBets = vi.fn()
        const balance = 1000
        const isSpinning = false

        renderHook(() => useForensicSystem({}, setCurrentBets, balance, isSpinning))

        // Should call setCurrentBets with stored data
        expect(setCurrentBets).toHaveBeenCalledWith(storedBets)
        // Should notify user
        expect(mockAddToast).toHaveBeenCalledWith(expect.stringContaining('Sesión Restaurada'), 'info')
    })

    it('should sync active bets to store when they change', () => {
        const setCurrentBets = vi.fn()
        const balance = 1000
        const isSpinning = false
        const currentBets = { '17': 50 }

        const { rerender } = renderHook(
            ({ bets }) => useForensicSystem(bets, setCurrentBets, balance, isSpinning),
            { initialProps: { bets: {} } }
        )

        // Update bets
        rerender({ bets: currentBets })

        expect(mockMatchActiveBets).toHaveBeenCalledWith(currentBets)
    })

    it('should detect bankruptcy condition', () => {
        const setCurrentBets = vi.fn()

        // Case 1: Broke with no bets -> Bankruptcy
        let balance = 0
        let currentBets = {}
        let isSpinning = false

        const { result, rerender } = renderHook(
            ({ b, c, s }) => useForensicSystem(c, setCurrentBets, b, s),
            { initialProps: { b: balance, c: currentBets, s: isSpinning } }
        )

        expect(result.current.shouldShowBankruptcy()).toBe(true)

        // Case 2: Broke but betting (All-In) -> No Bankruptcy yet
        currentBets = { 'RED': 100 }
        rerender({ b: 0, c: currentBets, s: false })
        expect(result.current.shouldShowBankruptcy()).toBe(false)

        // Case 3: Spinning -> No Bankruptcy
        rerender({ b: 0, c: {}, s: true })
        expect(result.current.shouldShowBankruptcy()).toBe(false)

        // Case 4: Has money -> No Bankruptcy
        rerender({ b: 10, c: {}, s: false })
        expect(result.current.shouldShowBankruptcy()).toBe(false)
    })
})
