/**
 * useRenderOptimization.js
 * Hooks for optimizing component renders
 */
import { useRef, useCallback, useMemo } from 'react'

/**
 * Compares two objects shallowly
 * @param {Object} obj1 
 * @param {Object} obj2 
 * @returns {boolean}
 */
const shallowEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true
    if (!obj1 || !obj2) return false

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false

    for (const key of keys1) {
        if (obj1[key] !== obj2[key]) return false
    }

    return true
}

/**
 * Hook that returns a stable callback that only changes when deps change
 * Uses a ref to avoid recreating the callback on every render
 * @param {Function} callback 
 * @returns {Function}
 */
export const useStableCallback = (callback) => {
    const callbackRef = useRef(callback)
    callbackRef.current = callback

    return useCallback((...args) => {
        return callbackRef.current(...args)
    }, [])
}

/**
 * Hook that memoizes a value and only updates when it actually changes
 * Useful for objects that are recreated on every render but have same values
 * @param {*} value 
 * @returns {*}
 */
export const useDeepMemo = (value) => {
    const ref = useRef(value)

    if (!shallowEqual(ref.current, value)) {
        ref.current = value
    }

    return ref.current
}

/**
 * Hook that tracks previous value of a state
 * @param {*} value 
 * @returns {*}
 */
export const usePrevious = (value) => {
    const ref = useRef()
    const prev = ref.current
    ref.current = value
    return prev
}

/**
 * Hook that returns whether value has changed since last render
 * @param {*} value 
 * @returns {boolean}
 */
export const useHasChanged = (value) => {
    const prev = usePrevious(value)
    return prev !== value
}

/**
 * Creates a memoized bets comparator for React.memo
 * @param {Object} prevBets 
 * @param {Object} nextBets 
 * @returns {boolean}
 */
export const areBetsEqual = (prevBets, nextBets) => {
    const prevKeys = Object.keys(prevBets || {})
    const nextKeys = Object.keys(nextBets || {})

    if (prevKeys.length !== nextKeys.length) return false

    for (const key of prevKeys) {
        if (prevBets[key] !== nextBets[key]) return false
    }

    return true
}

/**
 * Creates props comparator for BettingBoard memoization
 */
export const bettingBoardPropsAreEqual = (prevProps, nextProps) => {
    // Compare bets object
    if (!areBetsEqual(prevProps.bets, nextProps.bets)) return false

    // Compare simple props
    if (prevProps.lastWin !== nextProps.lastWin) return false
    if (prevProps.showEfficiency !== nextProps.showEfficiency) return false
    if (prevProps.showActiveBets !== nextProps.showActiveBets) return false

    // Compare history array length (quick check)
    if ((prevProps.history?.length || 0) !== (nextProps.history?.length || 0)) return false

    return true
}

export default {
    useStableCallback,
    useDeepMemo,
    usePrevious,
    useHasChanged,
    areBetsEqual,
    bettingBoardPropsAreEqual
}
