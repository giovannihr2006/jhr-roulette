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
        MIN_BET: 1, // 1 Credit (100 COP / 1 USD)
        MIN_TOTAL_SPIN: 5,
        MAX_WIN_PER_SPIN: 1000, // 100,000 COP / 1,000 USD
        MAX_TOTAL_BET: 2000, // 2x Max Win
        MAX_POSITIONS: 50
    },
    DEMO: {
        MIN_BET: 1,
        MIN_TOTAL_SPIN: 5,
        MAX_WIN_PER_SPIN: 10000, // 10x Real
        MAX_TOTAL_BET: 20000,
        MAX_POSITIONS: 80
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
