/**
 * StorageEncryption.js
 * Simple encryption for localStorage data
 * Uses XOR cipher with obfuscated key for basic protection
 */

// Simple obfuscated key (not cryptographically secure, but better than plaintext)
const getKey = () => {
    const parts = ['G', 'H', 'R', '-', 'R', 'u', 'l', 'e', 't', 'a', '-', '2', '0', '2', '5']
    return parts.join('')
}

/**
 * XOR cipher for basic obfuscation
 * @param {string} text - Text to encrypt/decrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted/decrypted text
 */
const xorCipher = (text, key) => {
    let result = ''
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return result
}

/**
 * Encode to base64-like string for storage
 * @param {string} text - Text to encode
 * @returns {string} Encoded string
 */
const toBase64 = (text) => {
    try {
        return btoa(unescape(encodeURIComponent(text)))
    } catch {
        return text
    }
}

/**
 * Decode from base64-like string
 * @param {string} encoded - Encoded string
 * @returns {string} Decoded text
 */
const fromBase64 = (encoded) => {
    try {
        return decodeURIComponent(escape(atob(encoded)))
    } catch {
        return encoded
    }
}

/**
 * Encrypts a value for storage
 * @param {*} value - Value to encrypt (will be JSON stringified)
 * @returns {string} Encrypted string
 */
export const encryptValue = (value) => {
    try {
        const json = JSON.stringify(value)
        const encrypted = xorCipher(json, getKey())
        return 'ENC:' + toBase64(encrypted)
    } catch (error) {
        console.error('[StorageEncryption] Encrypt error:', error)
        return JSON.stringify(value)
    }
}

/**
 * Decrypts a stored value
 * @param {string} encrypted - Encrypted string
 * @returns {*} Decrypted and parsed value
 */
export const decryptValue = (encrypted) => {
    try {
        // Check if it's encrypted
        if (!encrypted || !encrypted.startsWith('ENC:')) {
            // Return as-is (legacy unencrypted data)
            return JSON.parse(encrypted)
        }

        const encoded = encrypted.slice(4) // Remove 'ENC:' prefix
        const decoded = fromBase64(encoded)
        const decrypted = xorCipher(decoded, getKey())
        return JSON.parse(decrypted)
    } catch (error) {
        console.error('[StorageEncryption] Decrypt error:', error)
        // Try parsing as plain JSON (migration path)
        try {
            return JSON.parse(encrypted)
        } catch {
            return null
        }
    }
}

/**
 * Secure localStorage wrapper
 */
export const secureStorage = {
    /**
     * Get and decrypt an item from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Decrypted value or default
     */
    getItem: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key)
            if (item === null) return defaultValue
            return decryptValue(item)
        } catch (error) {
            console.error('[secureStorage] getItem error:', error)
            return defaultValue
        }
    },

    /**
     * Encrypt and store an item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    setItem: (key, value) => {
        try {
            const encrypted = encryptValue(value)
            localStorage.setItem(key, encrypted)
            return true
        } catch (error) {
            console.error('[secureStorage] setItem error:', error)
            return false
        }
    },

    /**
     * Remove an item from localStorage
     * @param {string} key - Storage key
     */
    removeItem: (key) => {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error('[secureStorage] removeItem error:', error)
        }
    },

    /**
     * Clear all items from localStorage
     */
    clear: () => {
        try {
            localStorage.clear()
        } catch (error) {
            console.error('[secureStorage] clear error:', error)
        }
    }
}

/**
 * Migrate existing unencrypted data to encrypted format
 * @param {string[]} keys - Keys to migrate
 */
export const migrateToEncrypted = (keys) => {
    keys.forEach(key => {
        try {
            const item = localStorage.getItem(key)
            if (item && !item.startsWith('ENC:')) {
                const value = JSON.parse(item)
                secureStorage.setItem(key, value)
                console.log(`[Migration] Encrypted: ${key}`)
            }
        } catch (error) {
            console.error(`[Migration] Error migrating ${key}:`, error)
        }
    })
}

export default secureStorage
