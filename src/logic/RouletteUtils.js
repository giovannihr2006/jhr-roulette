export const ROULETTE_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export const getBetGroups = (num) => {
    if (num === 0) return ['ZERO']

    const groups = []

    // Simple props
    groups.push(RED_NUMBERS.includes(num) ? 'COLOR_RED' : 'COLOR_BLACK')
    groups.push(num % 2 === 0 ? 'EVEN' : 'ODD')
    groups.push(num <= 18 ? 'LOW_18' : 'HIGH_18')

    // Dozens & Columns
    const dozen = Math.ceil(num / 12)
    groups.push(`DOZEN_${dozen}`)

    const col = (num - 1) % 3 + 1
    groups.push(`COLUMN_${col}`)

    // Calles (Street) - 3 numbers (e.g., 1-3, 4-6)
    const street = Math.ceil(num / 3)
    groups.push(`STREET_${street}`)

    // Lineas (Six Line) - 6 numbers (e.g., 1-6, 7-12)
    const line = Math.ceil(num / 6)
    groups.push(`LINE_${line}`)

    // COMBINATIONS (Deep Analysis)
    // Simple Chance Tags for easy combining
    const t_color = RED_NUMBERS.includes(num) ? 'RED' : 'BLACK'
    const t_evod = num % 2 === 0 ? 'EVEN' : 'ODD'
    const t_lohi = num <= 18 ? 'LOW' : 'HIGH'

    // Triads (The 8 zones)
    groups.push(`COMBO_${t_lohi}_${t_color}_${t_evod}`)

    // Dyads (Pairs)
    groups.push(`PAIR_${t_lohi}_${t_color}`) // e.g. LOW_RED
    groups.push(`PAIR_${t_lohi}_${t_evod}`) // e.g. LOW_ODD
    groups.push(`PAIR_${t_color}_${t_evod}`) // e.g. RED_ODD

    return groups
}

const COLORS = ['RED', 'BLACK']
const EVODS = ['EVEN', 'ODD']
const LOHIS = ['LOW', 'HIGH']

const TRIADS = []
LOHIS.forEach(l => COLORS.forEach(c => EVODS.forEach(e => TRIADS.push(`COMBO_${l}_${c}_${e}`))))

const PAIRS = []
LOHIS.forEach(l => COLORS.forEach(c => PAIRS.push(`PAIR_${l}_${c}`)))
LOHIS.forEach(l => EVODS.forEach(e => PAIRS.push(`PAIR_${l}_${e}`)))
COLORS.forEach(c => EVODS.forEach(e => PAIRS.push(`PAIR_${c}_${e}`)))

export const ALL_BET_IDS = [
    'ZERO',
    'COLOR_RED', 'COLOR_BLACK',
    'EVEN', 'ODD',
    'LOW_18', 'HIGH_18',
    ...[1, 2, 3].map(d => `DOZEN_${d}`),
    ...[1, 2, 3].map(c => `COLUMN_${c}`),
    ...Array.from({ length: 12 }, (_, i) => `STREET_${i + 1}`),
    ...Array.from({ length: 6 }, (_, i) => `LINE_${i + 1}`),
    ...TRIADS,
    ...PAIRS,
]

// --- BET COMBINATION DEFINITIONS ---

// 1. Splits (Vertical & Horizontal)
export const ALL_SPLITS = []
// Horizontal (e.g., 1-2, 2-3)
for (let r = 1; r <= 36; r += 3) {
    ALL_SPLITS.push({ name: `Medio ${r}-${r + 1}`, numbers: [r, r + 1] })
    ALL_SPLITS.push({ name: `Medio ${r + 1}-${r + 2}`, numbers: [r + 1, r + 2] })
}
// Vertical (e.g., 1-4, 2-5)
for (let n = 1; n <= 33; n++) {
    ALL_SPLITS.push({ name: `Medio ${n}-${n + 3}`, numbers: [n, n + 3] })
}
// Zero Splits
ALL_SPLITS.push({ name: 'Medio 0-1', numbers: [0, 1] })
ALL_SPLITS.push({ name: 'Medio 0-2', numbers: [0, 2] })
ALL_SPLITS.push({ name: 'Medio 0-3', numbers: [0, 3] })

// 2. Streets (Calles - Rows of 3)
export const ALL_STREETS = []
for (let n = 1; n <= 34; n += 3) {
    ALL_STREETS.push({ name: `Calle ${n}-${n + 2}`, numbers: [n, n + 1, n + 2] })
}
// Zero Streets
ALL_STREETS.push({ name: 'Calle 0-1-2', numbers: [0, 1, 2] })
ALL_STREETS.push({ name: 'Calle 0-2-3', numbers: [0, 2, 3] })

// 3. Corners (Cuadros)
export const ALL_CORNERS = []
for (let n = 1; n <= 32; n++) {
    if (n % 3 !== 0) { // Skip right edge
        ALL_CORNERS.push({ name: `Cuadro ${n}-${n + 4}`, numbers: [n, n + 1, n + 3, n + 4] })
    }
}
// Zero Corners (First Four 0-1-2-3) - treated as corner in some variants or basket
ALL_CORNERS.push({ name: 'Canasta 0-1-2-3', numbers: [0, 1, 2, 3] })

// 4. Lines (Seisenas - Double Rows)
export const ALL_LINES = []
for (let n = 1; n <= 31; n += 3) {
    ALL_LINES.push({ name: `Seisena ${n}-${n + 5}`, numbers: [n, n + 1, n + 2, n + 3, n + 4, n + 5] })
}

export const calculateWinnings = (winningNumber, currentBets) => {
    let totalWinnings = 0
    const winningNumStr = winningNumber.toString()

    // Rules
    const isRed = RED_NUMBERS.includes(winningNumber)
    const isBlack = !isRed && winningNumber !== 0
    const isEven = winningNumber !== 0 && winningNumber % 2 === 0
    const isOdd = winningNumber !== 0 && winningNumber % 2 !== 0
    const isLow = winningNumber >= 1 && winningNumber <= 18
    const isHigh = winningNumber >= 19 && winningNumber <= 36

    const isDoz1 = winningNumber >= 1 && winningNumber <= 12
    const isDoz2 = winningNumber >= 13 && winningNumber <= 24
    const isDoz3 = winningNumber >= 25 && winningNumber <= 36

    const isCol1 = winningNumber !== 0 && winningNumber % 3 === 1
    const isCol2 = winningNumber !== 0 && winningNumber % 3 === 2
    const isCol3 = winningNumber !== 0 && winningNumber % 3 === 0

    Object.entries(currentBets).forEach(([betId, amount]) => {
        let multiplier = 0

        // 0. Parse Complex Bets
        if (betId.startsWith('SPLIT')) {
            const parts = betId.split('_')
            if (parts.includes(winningNumStr)) multiplier = 17
        } else if (betId.startsWith('CORNER')) {
            const parts = betId.split('_')
            if (parts.includes(winningNumStr)) multiplier = 8
        } else if (betId.startsWith('STREET')) {
            const startNum = parseInt(betId.split('_')[1])
            if (winningNumber >= startNum && winningNumber <= startNum + 2) multiplier = 11
        } else if (betId.startsWith('LINE')) {
            const startNum = parseInt(betId.split('_')[1])
            if (winningNumber >= startNum && winningNumber <= startNum + 5) multiplier = 5
        } else if (betId.startsWith('TRIO')) {
            const parts = betId.split('_')
            if (parts.includes(winningNumStr)) multiplier = 11
        } else if (betId.startsWith('BASKET')) {
            const parts = betId.split('_')
            if (parts.includes(winningNumStr)) multiplier = 8
        }

        // 1. Straight Up
        else if (betId === winningNumStr) multiplier = 35

        // 2. Simple Chances
        else if (betId === 'RED' && isRed) multiplier = 1
        else if (betId === 'BLACK' && isBlack) multiplier = 1
        else if (betId === 'EVEN' && isEven) multiplier = 1
        else if (betId === 'ODD' && isOdd) multiplier = 1
        else if (betId === 'LOW' && isLow) multiplier = 1
        else if (betId === 'HIGH' && isHigh) multiplier = 1

        // 3. Dozens/Columns
        else if (betId === 'DOZ1' && isDoz1) multiplier = 2
        else if (betId === 'DOZ2' && isDoz2) multiplier = 2
        else if (betId === 'DOZ3' && isDoz3) multiplier = 2
        else if (betId === 'COL1' && isCol1) multiplier = 2
        else if (betId === 'COL2' && isCol2) multiplier = 2
        else if (betId === 'COL3' && isCol3) multiplier = 2

        // 4. Call Bets (Voisins, etc. are passed as Batch, but if stored as ID? No, BettingBoard converts to chips)
        // BettingBoard converts call bets to individual chips on placement. 
        // So we don't need to handle 'VOISINS' string here, just the resulting chips.

        if (multiplier > 0) {
            totalWinnings += amount + (amount * multiplier)
        }
    })

    return totalWinnings
}

export const getCoveredNumbers = (currentBets) => {
    const coveredNumbers = new Set()

    Object.keys(currentBets).forEach(betId => {
        // 0. Parse Complex Bets
        if (betId.startsWith('SPLIT')) {
            betId.split('_').slice(1).forEach(n => coveredNumbers.add(parseInt(n)))
        } else if (betId.startsWith('CORNER')) {
            betId.split('_').slice(1).forEach(n => coveredNumbers.add(parseInt(n)))
        } else if (betId.startsWith('STREET')) {
            const start = parseInt(betId.split('_')[1])
            for (let i = 0; i < 3; i++) coveredNumbers.add(start + i)
        } else if (betId.startsWith('LINE')) {
            const start = parseInt(betId.split('_')[1])
            for (let i = 0; i < 6; i++) coveredNumbers.add(start + i)
        } else if (betId.startsWith('TRIO')) { // usually 0-1-2 or 0-2-3
            betId.split('_').slice(1).forEach(n => coveredNumbers.add(parseInt(n)))
        } else if (betId.startsWith('BASKET')) { // 0-1-2-3
            betId.split('_').slice(1).forEach(n => coveredNumbers.add(parseInt(n)))
        }
        else if (betId === 'BATCH') {
            // Batch bets (repeats/doubles) are usually re-expanded into currentBets. 
            // If we have 'BATCH' key it implies an error in resolving, but ignoring for coverage safe.
        }

        // 1. Straight Up (0-36)
        else if (!isNaN(betId)) {
            coveredNumbers.add(parseInt(betId))
        }

        // 2. Simple Chances (18 nums)
        else if (['RED', 'BLACK', 'EVEN', 'ODD', 'LOW', 'HIGH'].includes(betId)) {
            for (let i = 1; i <= 36; i++) {
                if (
                    (betId === 'RED' && RED_NUMBERS.includes(i)) ||
                    (betId === 'BLACK' && !RED_NUMBERS.includes(i)) ||
                    (betId === 'EVEN' && i % 2 === 0) ||
                    (betId === 'ODD' && i % 2 !== 0) ||
                    (betId === 'LOW' && i <= 18) ||
                    (betId === 'HIGH' && i >= 19)
                ) coveredNumbers.add(i)
            }
        }

        // 3. Dozens (12 nums)
        else if (['DOZ1', 'DOZ2', 'DOZ3'].includes(betId)) {
            const d = parseInt(betId.slice(3))
            const start = (d - 1) * 12 + 1
            for (let i = 0; i < 12; i++) coveredNumbers.add(start + i)
        }

        // 4. Columns (12 nums)
        else if (['COL1', 'COL2', 'COL3'].includes(betId)) {
            const c = parseInt(betId.slice(3))
            for (let i = 1; i <= 36; i++) {
                if (i % 3 === (c === 3 ? 0 : c)) coveredNumbers.add(i) // Fix mod logic: 3%3=0
            }
        }
    })

    return Array.from(coveredNumbers)
}

export const calculateCoverage = (currentBets) => {
    const covered = getCoveredNumbers(currentBets)
    const count = covered.length
    const percent = (count / 37) * 100
    return percent
}

export const calculateMaxPotentialWin = (currentBets) => {
    if (Object.keys(currentBets).length === 0) return { maxWin: 0, bestNumbers: [] }

    let maxWin = 0
    let bestNumbers = []

    // Check all numbers 0-36
    for (let i = 0; i <= 36; i++) {
        const win = calculateWinnings(i, currentBets)
        if (win > maxWin) {
            maxWin = win
            bestNumbers = [i]
        } else if (win === maxWin && maxWin > 0) {
            bestNumbers.push(i)
        }
    }

    return { maxWin, bestNumbers }
}
