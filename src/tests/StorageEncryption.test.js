/**
 * StorageEncryption.test.js
 * Tests for localStorage encryption utilities
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    encryptValue,
    decryptValue,
    secureStorage,
    migrateToEncrypted
} from '../utils/StorageEncryption'

describe('StorageEncryption', () => {
    // =========================================================================
    // encryptValue / decryptValue
    // =========================================================================
    describe('encryptValue and decryptValue', () => {
        it('should encrypt and decrypt a simple string', () => {
            const original = 'Hello World'
            const encrypted = encryptValue(original)
            const decrypted = decryptValue(encrypted)

            expect(encrypted).toMatch(/^ENC:/)
            expect(decrypted).toBe(original)
        })

        it('should encrypt and decrypt a number', () => {
            const original = 12345
            const encrypted = encryptValue(original)
            const decrypted = decryptValue(encrypted)

            expect(decrypted).toBe(original)
        })

        it('should encrypt and decrypt an object', () => {
            const original = { balance: 1000, mode: 'REAL' }
            const encrypted = encryptValue(original)
            const decrypted = decryptValue(encrypted)

            expect(decrypted).toEqual(original)
        })

        it('should encrypt and decrypt an array', () => {
            const original = [1, 2, 3, 4, 5]
            const encrypted = encryptValue(original)
            const decrypted = decryptValue(encrypted)

            expect(decrypted).toEqual(original)
        })

        it('should handle complex nested objects', () => {
            const original = {
                user: { name: 'Test', level: 5 },
                history: [1, 2, 3],
                settings: { sound: true }
            }
            const encrypted = encryptValue(original)
            const decrypted = decryptValue(encrypted)

            expect(decrypted).toEqual(original)
        })

        it('encrypted value should not be plaintext', () => {
            const original = 'secret password'
            const encrypted = encryptValue(original)

            expect(encrypted).not.toContain('secret')
            expect(encrypted).not.toContain('password')
        })
    })

    // =========================================================================
    // decryptValue edge cases
    // =========================================================================
    describe('decryptValue edge cases', () => {
        it('should handle legacy unencrypted JSON', () => {
            const legacy = JSON.stringify({ balance: 500 })
            const result = decryptValue(legacy)

            expect(result).toEqual({ balance: 500 })
        })

        it('should return null for invalid encrypted data', () => {
            const result = decryptValue('ENC:invalid_base64_!@#$%')
            expect(result).toBeNull()
        })

        it('should return null for null input', () => {
            const result = decryptValue(null)
            expect(result).toBeNull()
        })
    })

    // =========================================================================
    // secureStorage
    // =========================================================================
    describe('secureStorage', () => {
        beforeEach(() => {
            localStorage.clear()
        })

        afterEach(() => {
            localStorage.clear()
        })

        it('should store and retrieve values securely', () => {
            const testData = { foo: 'bar', count: 42 }

            secureStorage.setItem('test-key', testData)
            const retrieved = secureStorage.getItem('test-key')

            expect(retrieved).toEqual(testData)
        })

        it('should return default for non-existent key', () => {
            const result = secureStorage.getItem('non-existent', 'default')
            expect(result).toBe('default')
        })

        it('should store encrypted data in localStorage', () => {
            secureStorage.setItem('secret', { password: '1234' })

            const raw = localStorage.getItem('secret')
            expect(raw).toMatch(/^ENC:/)
            expect(raw).not.toContain('password')
            expect(raw).not.toContain('1234')
        })

        it('should remove items', () => {
            secureStorage.setItem('to-remove', 'value')
            expect(localStorage.getItem('to-remove')).not.toBeNull()

            secureStorage.removeItem('to-remove')
            expect(localStorage.getItem('to-remove')).toBeNull()
        })

        it('setItem should return true on success', () => {
            const result = secureStorage.setItem('key', 'value')
            expect(result).toBe(true)
        })
    })

    // =========================================================================
    // migrateToEncrypted
    // =========================================================================
    describe('migrateToEncrypted', () => {
        beforeEach(() => {
            localStorage.clear()
        })

        afterEach(() => {
            localStorage.clear()
        })

        it('should migrate unencrypted data to encrypted', () => {
            // Store unencrypted data
            localStorage.setItem('legacy-data', JSON.stringify({ value: 100 }))

            // Migrate
            migrateToEncrypted(['legacy-data'])

            // Should now be encrypted
            const raw = localStorage.getItem('legacy-data')
            expect(raw).toMatch(/^ENC:/)

            // Should still be readable
            const value = secureStorage.getItem('legacy-data')
            expect(value).toEqual({ value: 100 })
        })

        it('should skip already encrypted data', () => {
            // Store encrypted data
            secureStorage.setItem('already-encrypted', { test: true })
            const original = localStorage.getItem('already-encrypted')

            // Migrate should not change it
            migrateToEncrypted(['already-encrypted'])
            const after = localStorage.getItem('already-encrypted')

            expect(after).toBe(original)
        })

        it('should handle non-existent keys gracefully', () => {
            expect(() => {
                migrateToEncrypted(['non-existent-key'])
            }).not.toThrow()
        })
    })
})
