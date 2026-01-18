/**
 * useLocalStorage.js
 * Generic hook for localStorage with automatic persistence
 */
import { useState, useEffect, useCallback } from 'react'
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/ErrorHandling'

/**
 * Hook that syncs state with localStorage
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if not in storage
 * @returns {[*, Function, Function]} [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue) => {
    // Initialize state with stored value or initial value
    const [storedValue, setStoredValue] = useState(() => {
        const item = safeLocalStorageGet(key, null)
        return item !== null ? item : initialValue
    })

    // Update localStorage when state changes
    useEffect(() => {
        safeLocalStorageSet(key, storedValue)
    }, [key, storedValue])

    // Wrapped setter that updates both state and storage
    const setValue = useCallback((value) => {
        setStoredValue(prev => {
            const valueToStore = value instanceof Function ? value(prev) : value
            return valueToStore
        })
    }, [])

    // Remove from storage
    const removeValue = useCallback(() => {
        try {
            localStorage.removeItem(key)
            setStoredValue(initialValue)
        } catch (error) {
            console.error('[useLocalStorage] Remove error:', error)
        }
    }, [key, initialValue])

    return [storedValue, setValue, removeValue]
}

/**
 * Hook for boolean localStorage values with toggle
 * @param {string} key - localStorage key  
 * @param {boolean} initialValue - Default value
 * @returns {[boolean, Function, Function]} [value, toggle, setValue]
 */
export const useLocalStorageBoolean = (key, initialValue = false) => {
    const [value, setValue] = useLocalStorage(key, initialValue)

    const toggle = useCallback(() => {
        setValue(prev => !prev)
    }, [setValue])

    return [value, toggle, setValue]
}

/**
 * Hook for object localStorage values with merge updates
 * @param {string} key - localStorage key
 * @param {Object} initialValue - Default object
 * @returns {[Object, Function, Function]} [value, updateValue, resetValue]
 */
export const useLocalStorageObject = (key, initialValue = {}) => {
    const [value, setValue] = useLocalStorage(key, initialValue)

    const updateValue = useCallback((updates) => {
        setValue(prev => ({
            ...prev,
            ...(typeof updates === 'function' ? updates(prev) : updates)
        }))
    }, [setValue])

    const resetValue = useCallback(() => {
        setValue(initialValue)
    }, [setValue, initialValue])

    return [value, updateValue, resetValue]
}

export default useLocalStorage
