/**
 * useOptimizedHover.js
 * Hook para manejar hover de forma optimizada con debounce
 */
import { useState, useCallback, useRef, useMemo } from 'react'

/**
 * Hook para manejar hover con debounce para evitar re-renders excesivos
 * @param {number} [delay=50] - Delay en ms antes de actualizar el estado
 * @returns {Object} Hover state and handlers
 */
export const useOptimizedHover = (delay = 50) => {
    const [hoveredItem, setHoveredItem] = useState(null)
    const timeoutRef = useRef(null)
    const pendingValueRef = useRef(null)

    const handleHover = useCallback((item) => {
        // Clear any pending timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // If same item, skip
        if (pendingValueRef.current === item) return

        pendingValueRef.current = item

        // Debounce the state update
        timeoutRef.current = setTimeout(() => {
            setHoveredItem(item)
        }, delay)
    }, [delay])

    const handleHoverEnd = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        pendingValueRef.current = null
        setHoveredItem(null)
    }, [])

    // Create stable handlers for common use case
    const getHoverProps = useCallback((item) => ({
        onMouseEnter: () => handleHover(item),
        onMouseLeave: handleHoverEnd,
        onFocus: () => handleHover(item),
        onBlur: handleHoverEnd
    }), [handleHover, handleHoverEnd])

    return {
        hoveredItem,
        handleHover,
        handleHoverEnd,
        getHoverProps
    }
}

/**
 * Hook optimizado para hover de números en la ruleta
 * @param {function} onHighlight - Callback para resaltar números
 * @param {number} [delay=30] - Delay de debounce
 */
export const useRouletteHover = (onHighlight, delay = 30) => {
    const { hoveredItem, handleHover, handleHoverEnd } = useOptimizedHover(delay)
    const lastHighlightRef = useRef(null)

    // Memoize the highlight call to avoid unnecessary updates
    const highlightNumbers = useCallback((numbers) => {
        const key = numbers ? numbers.join(',') : ''
        if (lastHighlightRef.current !== key) {
            lastHighlightRef.current = key
            onHighlight?.(numbers || [])
        }
    }, [onHighlight])

    const handleBetHover = useCallback((betId, coveredNumbers) => {
        handleHover(betId)
        highlightNumbers(coveredNumbers)
    }, [handleHover, highlightNumbers])

    const handleBetLeave = useCallback(() => {
        handleHoverEnd()
        highlightNumbers([])
    }, [handleHoverEnd, highlightNumbers])

    return {
        hoveredBet: hoveredItem,
        handleBetHover,
        handleBetLeave
    }
}

/**
 * useMemo wrapper para cálculos de números cubiertos
 * @param {function} getCoveredFn - Función para obtener números cubiertos
 * @param {*} betId - ID de la apuesta
 */
export const useCoveredNumbers = (getCoveredFn, betId) => {
    return useMemo(() => {
        if (!betId) return []
        return getCoveredFn(betId)
    }, [getCoveredFn, betId])
}

export default useOptimizedHover
