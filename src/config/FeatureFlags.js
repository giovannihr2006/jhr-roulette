/**
 * FeatureFlags.js
 * Sistema de feature flags para control de funcionalidades
 */

/**
 * Feature flags configuration
 * Set to true to enable, false to disable
 */
const FLAGS = {
    // Game Features
    ENABLE_3D_VIEW: true,
    ENABLE_LIVE_MODE: true,
    ENABLE_AUTOPLAY: true,
    ENABLE_TIMER_MODE: true,

    // UI Features
    ENABLE_DRAG_LAYOUT: true,
    ENABLE_TOOLTIPS: true,
    ENABLE_ANIMATIONS: true,
    ENABLE_SOUND: true,

    // Analytics & Tracking
    ENABLE_ANALYTICS: false,
    ENABLE_ERROR_TRACKING: false,

    // Experimental
    ENABLE_SYSTEM_BETS: true,
    ENABLE_STRATEGY_ANALYSIS: true,
    ENABLE_PROJECTIONS: true,

    // Debug
    ENABLE_DEBUG_MODE: false,
    ENABLE_VERBOSE_LOGGING: false
}

/**
 * Override flags from localStorage (for testing)
 */
const loadOverrides = () => {
    try {
        const overrides = localStorage.getItem('featureFlagOverrides')
        if (overrides) {
            return JSON.parse(overrides)
        }
    } catch (e) {
        // Ignore parse errors
    }
    return {}
}

const overrides = loadOverrides()

/**
 * Check if a feature is enabled
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} Whether the feature is enabled
 */
export const isFeatureEnabled = (flagName) => {
    // Check overrides first
    if (flagName in overrides) {
        return overrides[flagName]
    }
    // Then check default flags
    if (flagName in FLAGS) {
        return FLAGS[flagName]
    }
    // Unknown flags are disabled
    return false
}

/**
 * Set a feature flag override (for testing)
 * @param {string} flagName - Name of the feature flag
 * @param {boolean} enabled - Whether to enable the feature
 */
export const setFeatureOverride = (flagName, enabled) => {
    try {
        const current = loadOverrides()
        current[flagName] = enabled
        localStorage.setItem('featureFlagOverrides', JSON.stringify(current))
        // Reload to apply
        window.location.reload()
    } catch (e) {
        console.error('Error setting feature override:', e)
    }
}

/**
 * Clear all feature flag overrides
 */
export const clearFeatureOverrides = () => {
    try {
        localStorage.removeItem('featureFlagOverrides')
        window.location.reload()
    } catch (e) {
        console.error('Error clearing overrides:', e)
    }
}

/**
 * Get all feature flags with their current values
 * @returns {Object} All flags and their values
 */
export const getAllFlags = () => {
    const allFlags = { ...FLAGS }
    Object.keys(overrides).forEach(key => {
        allFlags[key] = overrides[key]
    })
    return allFlags
}

// Named exports for common flags
export const FEATURES = {
    VIEW_3D: 'ENABLE_3D_VIEW',
    LIVE_MODE: 'ENABLE_LIVE_MODE',
    AUTOPLAY: 'ENABLE_AUTOPLAY',
    TIMER: 'ENABLE_TIMER_MODE',
    DRAG_LAYOUT: 'ENABLE_DRAG_LAYOUT',
    TOOLTIPS: 'ENABLE_TOOLTIPS',
    ANIMATIONS: 'ENABLE_ANIMATIONS',
    SOUND: 'ENABLE_SOUND',
    ANALYTICS: 'ENABLE_ANALYTICS',
    DEBUG: 'ENABLE_DEBUG_MODE'
}

export default {
    isFeatureEnabled,
    setFeatureOverride,
    clearFeatureOverrides,
    getAllFlags,
    FEATURES
}
