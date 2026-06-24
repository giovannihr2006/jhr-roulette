/**
 * ErrorHandling.js
 * Utilidades para manejo consistente de errores
 */

/**
 * Wraps a function with try-catch and error logging
 * @template T
 * @param {function(): T} fn - Function to wrap
 * @param {string} context - Context for error logging
 * @param {T} [fallback] - Fallback value on error
 * @returns {T} Result or fallback
 */
export const tryCatch = (fn, context, fallback = null) => {
    try {
        return fn()
    } catch (error) {
        console.error(`[${context}] Error:`, error.message)
        return fallback
    }
}

/**
 * Wraps an async function with try-catch
 * @template T
 * @param {function(): Promise<T>} fn - Async function to wrap
 * @param {string} context - Context for error logging
 * @param {T} [fallback] - Fallback value on error
 * @returns {Promise<T>} Result or fallback
 */
export const tryCatchAsync = async (fn, context, fallback = null) => {
    try {
        return await fn()
    } catch (error) {
        console.error(`[${context}] Async Error:`, error.message)
        return fallback
    }
}

/**
 * Safe localStorage get with JSON parsing
 * @template T
 * @param {string} key - Storage key
 * @param {T} defaultValue - Default value if not found or error
 * @returns {T} Parsed value or default
 */
export const safeLocalStorageGet = (key, defaultValue) => {
    return tryCatch(() => {
        const item = localStorage.getItem(key)
        if (item === null) return defaultValue
        return JSON.parse(item)
    }, `localStorage.get(${key})`, defaultValue)
}

/**
 * Safe localStorage set with JSON stringification
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const safeLocalStorageSet = (key, value) => {
    return tryCatch(() => {
        localStorage.setItem(key, JSON.stringify(value))
        return true
    }, `localStorage.set(${key})`, false)
}

/**
 * Safe localStorage remove
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const safeLocalStorageRemove = (key) => {
    return tryCatch(() => {
        localStorage.removeItem(key)
        return true
    }, `localStorage.remove(${key})`, false)
}

/**
 * Safe JSON parse with fallback
 * @template T
 * @param {string} jsonString - JSON string to parse
 * @param {T} defaultValue - Default value on parse error
 * @returns {T} Parsed value or default
 */
export const safeJsonParse = (jsonString, defaultValue) => {
    return tryCatch(() => JSON.parse(jsonString), 'JSON.parse', defaultValue)
}

/**
 * Creates an error boundary wrapper for audio operations
 * @param {function} audioFn - Audio function to wrap
 * @param {string} soundName - Name of the sound for logging
 * @returns {function} Wrapped function that won't throw
 */
export const safeAudioOperation = (audioFn, soundName) => {
    return (...args) => {
        return tryCatch(() => audioFn(...args), `Audio.${soundName}`, undefined)
    }
}

/**
 * Creates a debounced function that catches errors
 * @param {function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @param {string} context - Error context
 * @returns {function} Debounced function
 */
export const safeDebouncedFn = (fn, delay, context) => {
    let timeoutId = null
    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            tryCatch(() => fn(...args), context)
        }, delay)
    }
}
