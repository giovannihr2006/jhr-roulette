export const PAYOUTS = {
    STRAIGHT: 35,
    SPLIT: 17,
    STREET: 11,
    CORNER: 8,
    LINE: 5,
    COLUMN: 2,
    DOZEN: 2,
    SIMPLE: 1 // Red/Black, Even/Odd, Low/High
}

export const SIMPLE_MIN_MULTIPLIER = 5; // Real Casino Rule: Outside bets = 5x Pleno Min

export const LIMITS = {
    REAL: {
        MIN_BET: 1, // 1 Credit
        MIN_TOTAL_SPIN: 0, // No minimum
        MAX_WIN_PER_SPIN: 1000000000000, // 1 Trillion - Effectively Infinite
        MAX_TOTAL_BET: 1000000000000, // 1 Trillion - Effectively Infinite
        MAX_POSITIONS: 150 // Increased position limit
    },
    DEMO: {
        MIN_BET: 1,
        MIN_TOTAL_SPIN: 0,
        MAX_WIN_PER_SPIN: 1000000000000, // Infinite
        MAX_TOTAL_BET: 1000000000000, // Infinite
        MAX_POSITIONS: 150
    }
}

// getBetType moved to RouletteUtils.js to avoid circular dependencies

export const CHIP_RATES = {
    COL: 100,
    USA: 1,
    EUR: 0.92
}
