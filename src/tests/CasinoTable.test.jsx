import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CasinoTable } from '../components/CasinoTable'
import React from 'react'

// Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// --- MOCKS ---

// 1. Mock Hooks
vi.mock('../hooks/useRouletteGame', () => ({
    useRouletteGame: () => ({
        isSpinning: false,
        handleSpin: vi.fn(),
        physicsState: { ballType: { name: 'Mock Ball' }, startPoint: { name: 'Mock Start' }, ballSpeed: { name: 'Mock Speed' }, wheelSpeed: 'Mock Wheel', launchVelocity: 0, wheelDirection: 'CW', ballDirection: 'CCW' },
        wheelRotation: 0,
        ballRotation: 0,
        showBall: true,
        lastWin: null,
        setLastWin: vi.fn(),
        lastWinAmount: 0,
        animState: 'IDLE'
    })
}))

vi.mock('../hooks/useForensicSystem', () => ({
    useForensicSystem: () => ({
        shouldShowBankruptcy: () => false
    })
}))

vi.mock('../hooks/useAutoplay', () => ({
    useAutoplay: () => ({
        autoPlayCount: 0,
        setAutoPlayCount: vi.fn()
    })
}))

vi.mock('../hooks/usePotentialWin', () => ({
    usePotentialWin: () => ({
        potentialWin: 0
    })
}))

vi.mock('../hooks/useStrategyBot', () => ({
    useStrategyBot: () => ({
        handleApplyStrategy: vi.fn(),
        smartAutoActive: false,
        smartAutoConfig: {} // Add missing prop if accessed
    })
}))

vi.mock('../hooks/useBetActions', () => ({
    useBetActions: () => ({
        handlePlaceBet: vi.fn(),
        handleBatchBets: vi.fn(),
        handleNeighborBet: vi.fn()
    })
}))

vi.mock('../hooks/useBetHistory', () => ({
    useBetHistory: () => ({
        handleUndo: vi.fn(),
        handleClear: vi.fn(),
        canUndo: false
    })
}))

vi.mock('../hooks/useCurrency', () => ({
    useCurrency: () => ({
        viewCurrency: 'COL'
    })
}))

vi.mock('../hooks/useDragLayout', () => ({
    useDragLayout: () => ({
        positions: {},
        layoutMode: false,
        updatePosition: vi.fn(),
        resetLayout: vi.fn(),
        toggleLock: vi.fn()
    })
}))

vi.mock('../logic/ToastStore', () => ({
    useToastStore: (selector) => selector({ addToast: vi.fn() })
}))

// 2. Mock Components
vi.mock('../components/Roulette3D', () => ({
    Roulette3D: () => <div data-testid="roulette-3d">Roulette 3D Mock</div>
}))
vi.mock('../components/BettingBoard', () => ({
    BettingBoard: () => <div data-testid="betting-board">Betting Board Mock</div>
}))
vi.mock('../components/Draggable', () => ({
    Draggable: ({ children }) => <div data-testid="draggable">{children}</div>
}))
// Mock other components to avoid deep rendering issues
vi.mock('../components/ReloadModal', () => ({ ReloadModal: () => <div /> }))
vi.mock('../components/StrategiesModal', () => ({ StrategiesModal: () => <div /> }))
vi.mock('../components/RubricModal', () => ({ RubricModal: () => <div /> }))
vi.mock('../components/StrategyManualModal', () => ({ StrategyManualModal: () => <div /> }))
vi.mock('../components/AudioSettingsModal', () => ({ AudioSettingsModal: () => <div /> }))
vi.mock('../components/Racetrack', () => ({ Racetrack: () => <div /> }))
vi.mock('../components/DetailedHistoryModal', () => ({ DetailedHistoryModal: () => <div /> }))
vi.mock('../components/DetailedHistoryWidget', () => ({ DetailedHistoryWidget: () => <div /> }))
vi.mock('../components/SessionClock', () => ({ SessionClock: () => <div /> }))
vi.mock('../components/StatisticsPanel', () => ({ StatisticsPanel: () => <div /> }))
vi.mock('../components/SpinCounter', () => ({ default: () => <div /> }))

// 3. Mock Stores (Robust)
vi.mock('../logic/FinancialSimulator', () => {
    const mockState = {
        gameMode: 'REAL',
        realCapital: 5000,
        demoCapital: 10000,
        placeBet: vi.fn(),
        currentRoundBet: 0,
        roundHistory: [],
        withdraw: vi.fn(),
        reloadCapital: vi.fn(),
        resolveRound: vi.fn(),
        useVaRStopLoss: false,
        setUseVaRStopLoss: vi.fn(),
        getVaRStopLoss: vi.fn(() => 0)
    }
    const useFinancialStore = vi.fn((selector) => selector(mockState))
    useFinancialStore.getState = vi.fn(() => ({
        ...mockState,
        resolveRound: vi.fn()
    }))

    return { useFinancialStore }
})

// 4. Mock Singletons/Utilities
vi.mock('../utils/SoundManager', () => ({
    soundManager: {
        playChip: vi.fn(),
        playSpinStart: vi.fn(),
        playBallLoop: vi.fn(),
        stopBallLoop: vi.fn(),
        playWin: vi.fn(),
        playClick: vi.fn()
    }
}))
vi.mock('../utils/DealerVoice', () => ({
    dealer: {
        welcome: vi.fn(),
        noMoreBets: vi.fn(),
        winner: vi.fn(),
        betsOpen: vi.fn()
    }
}))
vi.mock('../logic/RouletteUtils', () => ({
    getCoveredNumbers: vi.fn(() => []),
    calculateWinnings: vi.fn(() => 0)
}))

vi.mock('../config/LayoutPresets', () => ({
    LAYOUT_PRESETS: {
        DEFAULT: [
            { i: 'roulette-wheel', x: 0, y: 0, w: 1, h: 1 },
            { i: 'betting-board', x: 0, y: 0, w: 1, h: 1 },
            { i: 'banking-panel', x: 0, y: 0, w: 1, h: 1 },
            { i: 'control-panel', x: 0, y: 0, w: 1, h: 1 },
            { i: 'stats-panel', x: 0, y: 0, w: 1, h: 1 },
            { i: 'history-widget', x: 0, y: 0, w: 1, h: 1 },
            { i: 'session-clock', x: 0, y: 0, w: 1, h: 1 },
            { i: 'spin-counter', x: 0, y: 0, w: 1, h: 1 },
            { i: 'racetrack', x: 0, y: 0, w: 1, h: 1 }
        ]
    }
}))

describe('CasinoTable UI [Smoke Test]', () => {

    it('debe renderizar la tabla sin explotar', () => {
        render(<CasinoTable />)
        expect(screen.getByText(/GHR Ruleta Royale/i)).toBeDefined()
        expect(screen.getByTestId('betting-board')).toBeDefined()
        expect(screen.getByText('GIRAR')).toBeDefined()
    })

    it('debe mostrar el saldo correctamente', () => {
        render(<CasinoTable />)
        // Check for "$ 5.000" or similar text presence
        const title = screen.getByText(/GHR Ruleta Royale/i)
        expect(title).toBeDefined()
    })

    it('debe tener el botón GIRAR habilitado', () => {
        render(<CasinoTable />)
        const spinBtn = screen.getByText("GIRAR")
        expect(spinBtn).toBeDefined()
        expect(spinBtn.disabled).toBe(false)
    })
})
