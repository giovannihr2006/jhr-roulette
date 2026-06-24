/**
 * InputValidation.js
 * Utilidades de validación para inputs de usuario
 */

/**
 * Validates a numeric input for reload/withdraw modals
 * @param {string|number} value - The input value
 * @param {Object} options - Validation options
 * @param {number} [options.min=0] - Minimum allowed value
 * @param {number} [options.max=Infinity] - Maximum allowed value
 * @param {boolean} [options.allowDecimals=false] - Whether to allow decimal values
 * @returns {{ valid: boolean, value: number, error: string|null }}
 */
export const validateNumericInput = (value, options = {}) => {
    const { min = 0, max = Infinity, allowDecimals = false } = options

    // Convert to string for parsing
    const strValue = String(value).trim()

    // Check for empty
    if (!strValue) {
        return { valid: false, value: 0, error: 'El valor es requerido' }
    }

    // Parse number
    const numValue = allowDecimals ? parseFloat(strValue) : parseInt(strValue, 10)

    // Check if valid number
    if (isNaN(numValue)) {
        return { valid: false, value: 0, error: 'Ingrese un número válido' }
    }

    // Check for negative
    if (numValue < 0) {
        return { valid: false, value: 0, error: 'El valor no puede ser negativo' }
    }

    // Check minimum
    if (numValue < min) {
        return { valid: false, value: numValue, error: `El valor mínimo es ${min}` }
    }

    // Check maximum
    if (numValue > max) {
        return { valid: false, value: numValue, error: `El valor máximo es ${max}` }
    }

    return { valid: true, value: numValue, error: null }
}

/**
 * Validates reload amount
 * @param {string|number} amount - Amount to reload
 * @param {number} [maxReload=1000000] - Maximum reload amount
 * @returns {{ valid: boolean, value: number, error: string|null }}
 */
export const validateReloadAmount = (amount, maxReload = 1000000) => {
    return validateNumericInput(amount, { min: 1, max: maxReload })
}

/**
 * Validates withdraw amount
 * @param {string|number} amount - Amount to withdraw
 * @param {number} currentBalance - Current available balance
 * @param {number} [minWithdraw=1] - Minimum withdraw amount
 * @returns {{ valid: boolean, value: number, error: string|null }}
 */
export const validateWithdrawAmount = (amount, currentBalance, minWithdraw = 1) => {
    const result = validateNumericInput(amount, { min: minWithdraw, max: currentBalance })

    if (result.valid && result.value > currentBalance) {
        return {
            valid: false,
            value: result.value,
            error: `Fondos insuficientes. Máximo: ${currentBalance}`
        }
    }

    return result
}

/**
 * Validates bet amount
 * @param {string|number} amount - Bet amount
 * @param {number} currentBalance - Current available balance
 * @param {Object} limits - Bet limits from GameLimits
 * @param {number} limits.min - Minimum bet
 * @param {number} limits.max - Maximum bet
 * @returns {{ valid: boolean, value: number, error: string|null }}
 */
export const validateBetAmount = (amount, currentBalance, limits = { min: 1, max: 10000 }) => {
    const result = validateNumericInput(amount, { min: limits.min, max: limits.max })

    if (result.valid && result.value > currentBalance) {
        return {
            valid: false,
            value: result.value,
            error: 'Fondos insuficientes para esta apuesta'
        }
    }

    return result
}

/**
 * Sanitizes a string input to prevent XSS and unwanted characters
 * @param {string} input - Input string to sanitize
 * @param {number} [maxLength=100] - Maximum length
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input, maxLength = 100) => {
    if (typeof input !== 'string') return ''

    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
}

/**
 * Validates timer duration input
 * @param {string|number} duration - Duration in seconds
 * @returns {{ valid: boolean, value: number, error: string|null }}
 */
export const validateTimerDuration = (duration) => {
    return validateNumericInput(duration, { min: 5, max: 120 })
}
