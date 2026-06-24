/**
 * LazyModals.jsx
 * Lazy-loaded modal components for better initial load performance
 */
import { lazy, Suspense } from 'react'

// Loading fallback component
const ModalLoader = () => (
    <div
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}
    >
        <div
            style={{
                width: '40px',
                height: '40px',
                border: '4px solid #333',
                borderTop: '4px solid #d4af37',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}
        />
    </div>
)

// Lazy-loaded modals
export const LazyHelpModal = lazy(() => import('./HelpModal'))
export const LazyHistoryModal = lazy(() => import('./HistoryModal'))
export const LazyStrategiesModal = lazy(() => import('./StrategiesModal'))
export const LazyProjectionsModal = lazy(() => import('./ProjectionsModal'))
export const LazyRubricModal = lazy(() => import('./RubricModal'))
export const LazyDetailedHistoryModal = lazy(() => import('./DetailedHistoryModal'))
export const LazySystemEfficiencyModal = lazy(() => import('./SystemEfficiencyModal'))
export const LazySimpleEfficiencyModal = lazy(() => import('./SimpleEfficiencyModal'))
export const LazyMethodsTable = lazy(() => import('./MethodsTable'))

/**
 * Wrapper for lazy-loaded modals with Suspense
 */
export const LazyModal = ({ show, children }) => {
    if (!show) return null

    return (
        <Suspense fallback={<ModalLoader />}>
            {children}
        </Suspense>
    )
}

export default {
    LazyHelpModal,
    LazyHistoryModal,
    LazyStrategiesModal,
    LazyProjectionsModal,
    LazyRubricModal,
    LazyDetailedHistoryModal,
    LazySystemEfficiencyModal,
    LazySimpleEfficiencyModal,
    LazyMethodsTable,
    LazyModal
}
