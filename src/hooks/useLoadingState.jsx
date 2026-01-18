/**
 * useLoadingState.js
 * Hook para manejar estados de carga de forma consistente
 */
import { useState, useCallback } from 'react'

/**
 * Hook para manejar estados de carga
 * @returns {Object} Loading state and handlers
 */
export const useLoadingState = (initialState = false) => {
    const [isLoading, setIsLoading] = useState(initialState)
    const [error, setError] = useState(null)

    const startLoading = useCallback(() => {
        setIsLoading(true)
        setError(null)
    }, [])

    const stopLoading = useCallback(() => {
        setIsLoading(false)
    }, [])

    const setLoadingError = useCallback((err) => {
        setIsLoading(false)
        setError(err instanceof Error ? err.message : String(err))
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    /**
     * Wraps an async function with loading state management
     * @template T
     * @param {function(): Promise<T>} asyncFn - Async function to wrap
     * @returns {Promise<T|null>} Result or null on error
     */
    const withLoading = useCallback(async (asyncFn) => {
        startLoading()
        try {
            const result = await asyncFn()
            stopLoading()
            return result
        } catch (err) {
            setLoadingError(err)
            return null
        }
    }, [startLoading, stopLoading, setLoadingError])

    return {
        isLoading,
        error,
        startLoading,
        stopLoading,
        setLoadingError,
        clearError,
        withLoading
    }
}

/**
 * Hook para manejar múltiples estados de carga por ID
 * @returns {Object} Multi-loading state and handlers
 */
export const useMultiLoadingState = () => {
    const [loadingStates, setLoadingStates] = useState({})

    const isLoading = useCallback((id) => {
        return loadingStates[id] === true
    }, [loadingStates])

    const startLoading = useCallback((id) => {
        setLoadingStates(prev => ({ ...prev, [id]: true }))
    }, [])

    const stopLoading = useCallback((id) => {
        setLoadingStates(prev => ({ ...prev, [id]: false }))
    }, [])

    const isAnyLoading = Object.values(loadingStates).some(Boolean)

    return {
        isLoading,
        startLoading,
        stopLoading,
        isAnyLoading,
        loadingStates
    }
}

/**
 * Component for displaying loading spinner
 */
export const LoadingSpinner = ({ size = 24, color = '#d4af37' }) => {
    return (
        <div
            style={{
                width: size,
                height: size,
                border: `3px solid ${color}30`,
                borderTop: `3px solid ${color}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}
            aria-label="Cargando..."
            role="status"
        />
    )
}

/**
 * Component for displaying loading overlay
 */
export const LoadingOverlay = ({ isLoading, children, message = 'Cargando...' }) => {
    if (!isLoading) return children

    return (
        <div style={{ position: 'relative' }}>
            {children}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    borderRadius: '8px',
                    zIndex: 100
                }}
                aria-live="polite"
            >
                <LoadingSpinner size={40} />
                <span style={{ color: '#fff', fontSize: '0.9rem' }}>{message}</span>
            </div>
        </div>
    )
}

export default useLoadingState
