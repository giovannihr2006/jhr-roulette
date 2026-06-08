/**
 * Component Snapshot Tests
 * Tests for UI components using Vitest snapshots
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'

// Mock Zustand store
vi.mock('../logic/FinancialSimulator', () => ({
    useFinancialStore: vi.fn((selector) => {
        const mockState = {
            sessionStart: Date.now() - 3600000, // 1 hour ago
            totalSpins: 42
        }
        return selector(mockState)
    })
}))

// Import components after mocking
import { ChipSelector } from '../components/ChipSelector'
import { SessionClock } from '../components/SessionClock'
import SpinCounter from '../components/SpinCounter'

// ============================================================================
// ChipSelector Tests
// ============================================================================
describe('ChipSelector', () => {
    const mockOnSelectChip = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders correctly with no chip selected', () => {
        const { container } = render(
            <ChipSelector selectedChip={null} onSelectChip={mockOnSelectChip} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('renders correctly with chip 1 selected', () => {
        const { container } = render(
            <ChipSelector selectedChip={1} onSelectChip={mockOnSelectChip} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('renders correctly with chip 100 selected', () => {
        const { container } = render(
            <ChipSelector selectedChip={100} onSelectChip={mockOnSelectChip} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('renders correctly with chip 1000 selected', () => {
        const { container } = render(
            <ChipSelector selectedChip={1000} onSelectChip={mockOnSelectChip} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('renders all 6 chip values', () => {
        const { container } = render(
            <ChipSelector selectedChip={5} onSelectChip={mockOnSelectChip} />
        )

        const chips = container.querySelectorAll('div[style*="border-radius: 50%"]')
        // Parent container also has border-radius, so we check for chip values
        const chipTexts = Array.from(container.querySelectorAll('div'))
            .filter(el => ['1', '5', '25', '100', '500', '1000'].includes(el.textContent))

        expect(chipTexts.length).toBe(6)
    })
})

// ============================================================================
// SpinCounter Tests
// ============================================================================
describe('SpinCounter', () => {
    it('renders correctly with initial state', () => {
        const { container } = render(<SpinCounter />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('displays forensic session marker', () => {
        const { container } = render(<SessionClock />)
        expect(container.textContent).toContain('E14')
    })

    it('displays formatted time', () => {
        const { container } = render(<SessionClock />)
        // Should contain time format HH:MM:SS
        expect(container.textContent).toMatch(/\d{2}:\d{2}:\d{2}/)
    })
})

// ============================================================================
// Component Integration Tests
// ============================================================================
describe('Component Integration', () => {
    it('ChipSelector handles chip selection', () => {
        const mockHandler = vi.fn()
        const { container } = render(
            <ChipSelector selectedChip={5} onSelectChip={mockHandler} />
        )

        // Find chip with value "25" and click it
        const chips = Array.from(container.querySelectorAll('div'))
            .filter(el => el.textContent === '25')

        if (chips.length > 0) {
            chips[0].click()
            expect(mockHandler).toHaveBeenCalledWith(25)
        }
    })

    it('all components render without crashing', () => {
        expect(() => {
            render(<ChipSelector selectedChip={1} onSelectChip={() => { }} />)
            render(<SpinCounter />)
            render(<SessionClock />)
        }).not.toThrow()
    })
})
