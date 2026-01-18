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

// Helper to determine bet type from ID
export const getBetType = (betId) => {
    if (betId.includes('SPLIT')) return 'SPLIT'
    if (betId.includes('CORNER') || betId.includes('BASKET')) return 'CORNER' // Basket pays 8 too? Usually 6 or 8 depending on rule. User said 8.
    if (betId.includes('STREET') || betId.includes('TRIO')) return 'STREET' // Trio 11
    if (betId.includes('LINE')) return 'LINE'
    if (['DOZ1', 'DOZ2', 'DOZ3', 'COL1', 'COL2', 'COL3'].includes(betId)) return 'DOZEN' // Columns pay same
    if (['RED', 'BLACK', 'EVEN', 'ODD', 'LOW', 'HIGH'].includes(betId)) return 'SIMPLE'
    return 'STRAIGHT'
}

export const CHIP_RATES = {
    COL: 100,
    USA: 1,
    EUR: 0.92
}
