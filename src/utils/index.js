/**
 * Barrel exports for utils
 * Import utilities from this file for cleaner imports
 */

// Sound
export { soundManager } from './SoundManager'
export { audioPreloader } from './AudioPreloader'

// Validation
export {
    validateNumericInput,
    validateReloadAmount,
    validateWithdrawAmount,
    validateBetAmount,
    sanitizeInput,
    validateTimerDuration
} from './InputValidation'

export { default as BetValidator } from './BetValidator'

// Storage
export {
    encryptValue,
    decryptValue,
    secureStorage,
    migrateToEncrypted
} from './StorageEncryption'

// Error Handling
export {
    tryCatch,
    tryCatchAsync,
    safeLocalStorageGet,
    safeLocalStorageSet,
    safeLocalStorageRemove,
    safeJsonParse,
    safeAudioOperation,
    safeDebouncedFn
} from './ErrorHandling'

// Accessibility
export {
    getIconButtonProps,
    getKeyboardProps,
    getLiveRegionProps,
    getTooltipTriggerProps,
    ARIA_LABELS,
    ARIA_ROLES,
    announceToScreenReader
} from './AccessibilityUtils'

// Currency
export { default as CurrencyService } from './CurrencyService'
