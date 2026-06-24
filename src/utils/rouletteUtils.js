// Standard European Wheel Order (Clockwise from 0)
export const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

// Alias for compatibility
export const WHEEL_NUMBERS = WHEEL_ORDER

// Red numbers in European Roulette
export const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

// Black numbers (derived)
export const BLACKS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

export const getNeighbours = (number, count) => {
    const num = parseInt(number)
    const index = WHEEL_ORDER.indexOf(num)
    if (index === -1) return []

    let indices = []
    // Center
    indices.push(index)

    // Neighbors
    for (let i = 1; i <= count; i++) {
        indices.push((index + i) % 37) // Clockwise
        indices.push((index - i + 37) % 37) // Counter-Clockwise
    }

    // Return as strings (standard bet IDs) or numbers? Keeping as strings for compatibility
    return indices.map(i => WHEEL_ORDER[i].toString())
}
