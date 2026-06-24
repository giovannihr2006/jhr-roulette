/**
 * Format a numeric value into a currency string.
 * @param {number} value - The amount to format
 * @returns {string} - Formatted string (e.g. "$ 1,000")
 */
export const formatValue = (value) => {
    return `$ ${value.toLocaleString()}`
}
