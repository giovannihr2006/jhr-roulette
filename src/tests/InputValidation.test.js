/**
 * InputValidation.test.js
 * Tests for input validation utilities
 */
import { describe, it, expect } from 'vitest'
import {
    validateNumericInput,
    validateReloadAmount,
    validateWithdrawAmount,
    validateBetAmount,
    sanitizeInput,
    validateTimerDuration
} from '../utils/InputValidation'

describe('InputValidation', () => {
    // =========================================================================
    // validateNumericInput
    // =========================================================================
    describe('validateNumericInput', () => {
        it('should return valid for positive integers', () => {
            const result = validateNumericInput(100)
            expect(result.valid).toBe(true)
            expect(result.value).toBe(100)
            expect(result.error).toBeNull()
        })

        it('should return invalid for empty string', () => {
            const result = validateNumericInput('')
            expect(result.valid).toBe(false)
            expect(result.error).toBe('El valor es requerido')
        })

        it('should return invalid for non-numeric string', () => {
            const result = validateNumericInput('abc')
            expect(result.valid).toBe(false)
            expect(result.error).toBe('Ingrese un número válido')
        })

        it('should return invalid for negative numbers', () => {
            const result = validateNumericInput(-50)
            expect(result.valid).toBe(false)
            expect(result.error).toBe('El valor no puede ser negativo')
        })

        it('should respect min option', () => {
            const result = validateNumericInput(5, { min: 10 })
            expect(result.valid).toBe(false)
            expect(result.error).toBe('El valor mínimo es 10')
        })

        it('should respect max option', () => {
            const result = validateNumericInput(1000, { max: 500 })
            expect(result.valid).toBe(false)
            expect(result.error).toBe('El valor máximo es 500')
        })

        it('should allow decimals when option is true', () => {
            const result = validateNumericInput('10.5', { allowDecimals: true })
            expect(result.valid).toBe(true)
            expect(result.value).toBe(10.5)
        })

        it('should parse string numbers correctly', () => {
            const result = validateNumericInput('  42  ')
            expect(result.valid).toBe(true)
            expect(result.value).toBe(42)
        })
    })

    // =========================================================================
    // validateReloadAmount
    // =========================================================================
    describe('validateReloadAmount', () => {
        it('should return valid for amounts within limits', () => {
            const result = validateReloadAmount(5000)
            expect(result.valid).toBe(true)
            expect(result.value).toBe(5000)
        })

        it('should return invalid for zero', () => {
            const result = validateReloadAmount(0)
            expect(result.valid).toBe(false)
        })

        it('should return invalid for amounts above max', () => {
            const result = validateReloadAmount(2000000, 1000000)
            expect(result.valid).toBe(false)
        })

        it('should respect custom max reload', () => {
            const result = validateReloadAmount(500, 100)
            expect(result.valid).toBe(false)
            expect(result.error).toBe('El valor máximo es 100')
        })
    })

    // =========================================================================
    // validateWithdrawAmount
    // =========================================================================
    describe('validateWithdrawAmount', () => {
        it('should return valid when within balance', () => {
            const result = validateWithdrawAmount(500, 1000)
            expect(result.valid).toBe(true)
        })

        it('should return invalid when exceeding balance', () => {
            const result = validateWithdrawAmount(1500, 1000)
            expect(result.valid).toBe(false)
            expect(result.error).toContain('1000') // Should mention the max balance
        })

        it('should respect minimum withdraw', () => {
            const result = validateWithdrawAmount(0.5, 1000, 1)
            expect(result.valid).toBe(false)
        })
    })

    // =========================================================================
    // validateBetAmount
    // =========================================================================
    describe('validateBetAmount', () => {
        it('should return valid for bet within limits and balance', () => {
            const result = validateBetAmount(100, 500, { min: 1, max: 1000 })
            expect(result.valid).toBe(true)
        })

        it('should return invalid if exceeds balance', () => {
            const result = validateBetAmount(600, 500, { min: 1, max: 1000 })
            expect(result.valid).toBe(false)
            expect(result.error).toContain('Fondos insuficientes')
        })

        it('should return invalid if below table minimum', () => {
            const result = validateBetAmount(5, 1000, { min: 10, max: 1000 })
            expect(result.valid).toBe(false)
        })

        it('should return invalid if above table maximum', () => {
            const result = validateBetAmount(2000, 5000, { min: 1, max: 1000 })
            expect(result.valid).toBe(false)
        })
    })

    // =========================================================================
    // sanitizeInput
    // =========================================================================
    describe('sanitizeInput', () => {
        it('should trim whitespace', () => {
            expect(sanitizeInput('  hello  ')).toBe('hello')
        })

        it('should remove dangerous characters', () => {
            expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script')
        })

        it('should respect max length', () => {
            const long = 'a'.repeat(200)
            expect(sanitizeInput(long, 50).length).toBe(50)
        })

        it('should return empty string for non-string input', () => {
            expect(sanitizeInput(123)).toBe('')
            expect(sanitizeInput(null)).toBe('')
            expect(sanitizeInput(undefined)).toBe('')
        })
    })

    // =========================================================================
    // validateTimerDuration
    // =========================================================================
    describe('validateTimerDuration', () => {
        it('should accept valid durations (5-120)', () => {
            expect(validateTimerDuration(15).valid).toBe(true)
            expect(validateTimerDuration(60).valid).toBe(true)
            expect(validateTimerDuration(120).valid).toBe(true)
        })

        it('should reject durations below 5', () => {
            expect(validateTimerDuration(3).valid).toBe(false)
        })

        it('should reject durations above 120', () => {
            expect(validateTimerDuration(150).valid).toBe(false)
        })
    })
})
