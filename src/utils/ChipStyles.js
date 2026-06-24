/**
 * ChipStyles.js
 * Unified chip gradient and styling utilities
 */

/**
 * Get gradient for chip based on value
 * @param {number} value - Chip value
 * @returns {string} CSS gradient string
 */
export const getChipGradient = (value) => {
    const gradients = {
        1: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #bdbdbd 100%)',      // White/Silver
        5: 'linear-gradient(135deg, #ef5350 0%, #c62828 50%, #b71c1c 100%)',      // Red
        10: 'linear-gradient(135deg, #42a5f5 0%, #1565c0 50%, #0d47a1 100%)',     // Blue
        25: 'linear-gradient(135deg, #66bb6a 0%, #2e7d32 50%, #1b5e20 100%)',     // Green
        50: 'linear-gradient(135deg, #ffa726 0%, #ef6c00 50%, #e65100 100%)',     // Orange
        100: 'linear-gradient(135deg, #212121 0%, #000000 50%, #1a1a1a 100%)',    // Black
        500: 'linear-gradient(135deg, #7e57c2 0%, #4527a0 50%, #311b92 100%)',    // Purple
        1000: 'linear-gradient(135deg, #ffd54f 0%, #ffb300 50%, #ff8f00 100%)',   // Gold
        5000: 'linear-gradient(135deg, #f8bbd0 0%, #e91e63 50%, #c2185b 100%)',   // Pink
        10000: 'linear-gradient(135deg, #b2dfdb 0%, #00897b 50%, #00695c 100%)'   // Teal
    }
    return gradients[value] || gradients[1]
}

/**
 * Get chip border color based on value
 * @param {number} value - Chip value
 * @returns {string} CSS color
 */
export const getChipBorderColor = (value) => {
    const borders = {
        1: '#9e9e9e',
        5: '#b71c1c',
        10: '#0d47a1',
        25: '#1b5e20',
        50: '#e65100',
        100: '#424242',
        500: '#311b92',
        1000: '#ff6f00',
        5000: '#880e4f',
        10000: '#004d40'
    }
    return borders[value] || borders[1]
}

/**
 * Get chip text color (for contrast)
 * @param {number} value - Chip value
 * @returns {string} CSS color
 */
export const getChipTextColor = (value) => {
    // Dark chips need white text
    const darkChips = [100, 500]
    return darkChips.includes(value) ? '#fff' : '#000'
}

/**
 * Get full chip style object
 * @param {number} value - Chip value
 * @param {number} size - Chip size in pixels
 * @returns {Object} Style object
 */
export const getChipStyle = (value, size = 40) => ({
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: getChipGradient(value),
    border: `3px solid ${getChipBorderColor(value)}`,
    color: getChipTextColor(value),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: `${size * 0.35}px`,
    boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
    cursor: 'pointer',
    userSelect: 'none'
})

export default {
    getChipGradient,
    getChipBorderColor,
    getChipTextColor,
    getChipStyle
}
