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
