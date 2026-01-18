/**
 * Barrel exports for hooks
 * Import hooks from this file for cleaner imports
 */

// Game Hooks
export { useRouletteGame } from './useRouletteGame'
export { default as useRouletteLogic } from './useRouletteLogic'

// Layout Hooks
export { useDragLayout } from './useDragLayout'

// Utility Hooks
export { useCurrency } from './useCurrency'
export { useLoadingState, useMultiLoadingState, LoadingSpinner, LoadingOverlay } from './useLoadingState'
export { useOptimizedHover, useRouletteHover, useCoveredNumbers } from './useOptimizedHover'
export {
    useStableCallback,
    useDeepMemo,
    usePrevious,
    useHasChanged,
    areBetsEqual,
    bettingBoardPropsAreEqual
} from './useRenderOptimization'
