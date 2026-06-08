import React from 'react'
import './BettingBoard.css'
import SystemEfficiencyModal from './SystemEfficiencyModal'
import SimpleEfficiencyModal from './SimpleEfficiencyModal'
import MethodsTable from './MethodsTable'
import { optimizeBets, getCoveredNumbers as getActualCoverageFromBets, getBetType, ALL_STREETS, ALL_CORNERS, ALL_LINES, getCanonicalBetId } from '../logic/RouletteUtils'
import { useFinancialStore } from '../logic/FinancialSimulator'


const NUMBERS = [
    // Row 3 (Top)
    3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36,
    // Row 2 (Mid)
    2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35,
    // Row 1 (Bot)
    1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
]

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const MATURITY_COLORS = ['#ffd700', '#ff8c00', '#ff4500', '#ff6b6b']
const DEFAULT_MATURITY_TYPES = {
    street: true,
    corner: true,
    line: true,
    dozen: true,
    column: true
}
const DEFAULT_MATURITY_RANKS = {
    0: true,
    1: true,
    2: true,
    3: true
}
const MATURITY_TYPE_OPTIONS = [
    { key: 'street', label: 'Calles' },
    { key: 'corner', label: 'Cuadros' },
    { key: 'line', label: 'Lineas 6' },
    { key: 'dozen', label: 'Docenas' },
    { key: 'column', label: 'Columnas' }
]
const MATURITY_RANK_OPTIONS = [
    { key: 0, label: '1' },
    { key: 1, label: '2' },
    { key: 2, label: '3' },
    { key: 3, label: '4' }
]

const DOZEN_GROUPS = [
    { id: 'DOZ1', label: '1st 12', numbers: NUMBERS.filter(n => n >= 1 && n <= 12) },
    { id: 'DOZ2', label: '2nd 12', numbers: NUMBERS.filter(n => n >= 13 && n <= 24) },
    { id: 'DOZ3', label: '3rd 12', numbers: NUMBERS.filter(n => n >= 25 && n <= 36) }
]

const COLUMN_GROUPS = [
    { id: 'COL3', label: '3rd Col', numbers: NUMBERS.filter(n => n % 3 === 0) },
    { id: 'COL2', label: '2nd Col', numbers: NUMBERS.filter(n => n % 3 === 2) },
    { id: 'COL1', label: '1st Col', numbers: NUMBERS.filter(n => n % 3 === 1) }
]

// --- STANDARD CALL BET CONSTANTS (Restored) ---
const VOISINS_NUMBERS = [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25]
const TIERS_NUMBERS = [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33]
const ORPHELINS_NUMBERS = [1, 20, 14, 31, 9, 17, 34, 6]
const ZERO_NUMBERS = [12, 35, 3, 26, 0, 32, 15]

// --- DYNAMIC WHEEL SECTOR LOGIC ---
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

// --- GEOMETRIC AUDIT RESULTS: Best Offsets for Chip Economy (Asymmetric) ---
// ADJUSTMENT: Enforcing Symmetric [-3, 3] for Nucleo to ensure distinct identity per user request.
// (Chip efficiency optimization caused clustering of neighbors 0/26 and 10/23).
const OFFSETS = {
    DEFAULT: { n: [-3, 3], v: [-9, 9] }
}
// Generate entries 0-36 strictly symmetric for Nucleo
for (let i = 0; i <= 36; i++) {
    OFFSETS[i] = { n: [-3, 3], v: [-9, 9] }
}

const getRelativeSectors = (centerNum) => {
    const centerIndex = WHEEL_ORDER.indexOf(centerNum)
    if (centerIndex === -1) return { nucleo: [], vecinos: [], tiers: [], orphelins: [] }

    // Helper for circular slice
    const getSlice = (startOffset, endOffset) => {
        const nums = []
        // Range inclusive
        for (let i = startOffset; i <= endOffset; i++) {
            let idx = (centerIndex + i) % 37
            if (idx < 0) idx += 37
            nums.push(WHEEL_ORDER[idx])
        }
        return nums
    }

    // --- GEOMETRIC AUDIT RESULTS: Best Offsets for Chip Economy ---
    // --- GEOMETRIC AUDIT RESULTS: Best Offsets for Chip Economy (Asymmetric) ---


    const set = OFFSETS[centerNum] || OFFSETS.DEFAULT

    // Nucleo: Optimized for 7 numbers
    const nucleo = getSlice(set.n[0], set.n[1])

    // Vecinos: Optimized for 17 numbers
    const vecinos = getSlice(set.v[0], set.v[1])

    // Tiers (Opposite Profile): Center +11 to +22 (12 nums)
    const tiers = getSlice(11, 22)

    // Orphelins (Flanks): Dynamically fill gaps between Vecinos and Tiers
    // Gap 1 (Right): End of Vecinos (v[1]) + 1 ... Start of Tiers (11) - 1 => [v[1]+1, 10]
    // Gap 2 (Left): End of Tiers (22) + 1 ... Start of Vecinos (v[0]) - 1 => [23, v[0]-1 (normalized)]

    // Normalize v[0] (e.g. -9 becomes 28 in positive index logic, but we need relative... wait)
    // Relative: v[0] is negative relative index. e.g. -9.
    // Tiers ends at +22.
    // Gap 2 is +23 to v[0]-1. (e.g. +23 to -10? No. Wheel is circular).
    // Let's think in positive relative indices 0..36? No, getSlice handles negatives.
    // Gap 2 starts at +23. It ends just before v[0].
    // If v[0] is -8. The gap ends at -9.
    // So getSlice(23, 27) works if v[0] is -8 (starts at 29). No, -8 is 29.
    // 29-1 = 28. (relative -9).
    // So if v[0] = -8, we need 23 to -9.
    // if v[0] = -9, we need 23 to -10.

    const orphRight = getSlice(set.v[1] + 1, 10)

    // Fix: Gap 2 (Left) often involves wrapping or negative indices relative to center
    // Normalizing to positive index space for getSlice loop
    let gap2End = set.v[0] - 1
    if (gap2End < 23) gap2End += 37
    const orphLeft = getSlice(23, gap2End)

    const orphelins = [...orphRight, ...orphLeft]

    return { nucleo, vecinos, tiers, orphelins }
}

// Generate Static Definitions for Performance
const SECTORS_0 = getRelativeSectors(0)
const SECTORS_26 = getRelativeSectors(26)
const SECTORS_23 = getRelativeSectors(23)
const SECTORS_10 = getRelativeSectors(10)

const NUCLEO_0_NUMBERS = SECTORS_0.nucleo
const VECINOS_0_NUMBERS = SECTORS_0.vecinos
const TERCIO_0_NUMBERS = SECTORS_0.tiers
const HUERFANOS_0_NUMBERS = SECTORS_0.orphelins

const NUCLEO_26_NUMBERS = SECTORS_26.nucleo
const VECINOS_26_NUMBERS = SECTORS_26.vecinos
const TERCIO_26_NUMBERS = SECTORS_26.tiers
const HUERFANOS_26_NUMBERS = SECTORS_26.orphelins

const NUCLEO_23_NUMBERS = SECTORS_23.nucleo
const VECINOS_23_NUMBERS = SECTORS_23.vecinos
const TERCIO_23_NUMBERS = SECTORS_23.tiers
const HUERFANOS_23_NUMBERS = SECTORS_23.orphelins

const NUCLEO_10_NUMBERS = SECTORS_10.nucleo
const VECINOS_10_NUMBERS = SECTORS_10.vecinos
const TERCIO_10_NUMBERS = SECTORS_10.tiers
const HUERFANOS_10_NUMBERS = SECTORS_10.orphelins

// Placeholders / Formatting for Getters
// Convert to Strings for betting logic
const N0_STR = NUCLEO_0_NUMBERS.map(n => n.toString())
const V0_STR = VECINOS_0_NUMBERS.map(n => n.toString())
const T0_STR = TERCIO_0_NUMBERS.map(n => n.toString())
const H0_STR = HUERFANOS_0_NUMBERS.map(n => n.toString())

const N26_STR = NUCLEO_26_NUMBERS.map(n => n.toString())
const V26_STR = VECINOS_26_NUMBERS.map(n => n.toString())
const T26_STR = TERCIO_26_NUMBERS.map(n => n.toString())
const H26_STR = HUERFANOS_26_NUMBERS.map(n => n.toString())

const N23_STR = NUCLEO_23_NUMBERS.map(n => n.toString())
const V23_STR = VECINOS_23_NUMBERS.map(n => n.toString())
const T23_STR = TERCIO_23_NUMBERS.map(n => n.toString())
const H23_STR = HUERFANOS_23_NUMBERS.map(n => n.toString())

const N10_STR = NUCLEO_10_NUMBERS.map(n => n.toString())
const V10_STR = VECINOS_10_NUMBERS.map(n => n.toString())
const T10_STR = TERCIO_10_NUMBERS.map(n => n.toString())
const H10_STR = HUERFANOS_10_NUMBERS.map(n => n.toString())

// --- PRE-CALCULATED REAL COVERAGE (Including collateral numbers from optimization) ---
const calculateRealCoverage = (targetNums) => {
    if (!targetNums) return []
    const betsList = optimizeBets(targetNums)
    const betsObj = {}
    betsList.forEach(id => betsObj[id] = 1)
    return getActualCoverageFromBets(betsObj)
}

const N0_REAL = calculateRealCoverage(NUCLEO_0_NUMBERS)
const V0_REAL = calculateRealCoverage(VECINOS_0_NUMBERS)
const T0_REAL = calculateRealCoverage(TERCIO_0_NUMBERS)
const H0_REAL = calculateRealCoverage(HUERFANOS_0_NUMBERS)

const N26_REAL = calculateRealCoverage(NUCLEO_26_NUMBERS)
const V26_REAL = calculateRealCoverage(VECINOS_26_NUMBERS)
const T26_REAL = calculateRealCoverage(TERCIO_26_NUMBERS)
const H26_REAL = calculateRealCoverage(HUERFANOS_26_NUMBERS)

const N23_REAL = calculateRealCoverage(NUCLEO_23_NUMBERS)
const V23_REAL = calculateRealCoverage(VECINOS_23_NUMBERS)
const T23_REAL = calculateRealCoverage(TERCIO_23_NUMBERS)
const H23_REAL = calculateRealCoverage(HUERFANOS_23_NUMBERS)

const N10_REAL = calculateRealCoverage(NUCLEO_10_NUMBERS)
const V10_REAL = calculateRealCoverage(VECINOS_10_NUMBERS)
const T10_REAL = calculateRealCoverage(TERCIO_10_NUMBERS)
const H10_REAL = calculateRealCoverage(HUERFANOS_10_NUMBERS)

const ZERO_REAL = [12, 35, 3, 26, 0, 32, 15] // Strict 7 numbers
const VOISINS_REAL = VOISINS_NUMBERS
const ORPHELINS_REAL = ORPHELINS_NUMBERS
const TIERS_REAL = TIERS_NUMBERS

// Update Getters to use Optimized Bet Arrays
const getNucleo0Bets = () => optimizeBets(NUCLEO_0_NUMBERS)
const getVecinos0Bets = () => optimizeBets(VECINOS_0_NUMBERS)
const getTercio0Bets = () => optimizeBets(TERCIO_0_NUMBERS)
const getHuerfanos0Bets = () => optimizeBets(HUERFANOS_0_NUMBERS)

const getNucleo26Bets = () => optimizeBets(NUCLEO_26_NUMBERS)
const getNucleo23Bets = () => optimizeBets(NUCLEO_23_NUMBERS)
const getNucleo10Bets = () => optimizeBets(NUCLEO_10_NUMBERS)

const getVecinos26Bets = () => optimizeBets(VECINOS_26_NUMBERS)
const getTercio26Bets = () => optimizeBets(TERCIO_26_NUMBERS)
const getHuerfanos26Bets = () => optimizeBets(HUERFANOS_26_NUMBERS)

const getVecinos23Bets = () => optimizeBets(VECINOS_23_NUMBERS)
const getTercio23Bets = () => optimizeBets(TERCIO_23_NUMBERS)
const getHuerfanos23Bets = () => optimizeBets(HUERFANOS_23_NUMBERS)

const getVecinos10Bets = () => optimizeBets(VECINOS_10_NUMBERS)
const getTercio10Bets = () => optimizeBets(TERCIO_10_NUMBERS)
const getHuerfanos10Bets = () => optimizeBets(HUERFANOS_10_NUMBERS)

const getVoisinsBets = () => [
    'TRIO_0_2_3', 'SPLIT_4_7', 'SPLIT_12_15',
    'SPLIT_18_21', 'SPLIT_19_22', 'CORNER_25_26_28_29', 'SPLIT_32_35'
]
const getTiersBets = () => [
    'SPLIT_5_8', 'SPLIT_10_11', 'SPLIT_13_16', 'SPLIT_23_24', 'SPLIT_27_30', 'SPLIT_33_36'
]
const getOrphelinsBets = () => [
    '1', 'SPLIT_6_9', 'SPLIT_14_17', 'SPLIT_17_20', 'SPLIT_31_34'
]
const getJeuZeroBets = () => [
    'SPLIT_0_3', 'SPLIT_12_15', '26', 'SPLIT_32_35'
]

// System 23 Helpers (Optimized: 3 Chips / 9 Nums)


export const BettingBoard = ({
    bets,
    onPlaceBet,
    onBatchBet,
    lastWin,
    onHoverNumbers,
    history,
    showEfficiency,
    setShowEfficiency,
    showActiveBets, setShowActiveBets, // NEW
    onNeighborBet, // NEW
    neighborCount, // FIX: Missing prop causing ReferenceError
    placedNumbers = [], // NEW: Numbers with active bets
    bestPayoutNumbers = [] // NEW: Numbers that pay the most
}) => {
    // STATE
    const [hoveredBet, setHoveredBet] = React.useState(null)
    const [showNumbers, setShowNumbers] = React.useState(false)
    const [showEfficiencyModal, setShowEfficiencyModal] = React.useState(false)
    const [showSimpleEfficiencyModal, setShowSimpleEfficiencyModal] = React.useState(false) // NEW: Simple Ranking Modal
    const [showMethodsTable, setShowMethodsTable] = React.useState(false) // NEW: Methods Table Modal
    const [isNeighborMode, setIsNeighborMode] = React.useState(false) // NEW: Global Neighbor Mode
    const [hoveredTarget, setHoveredTarget] = React.useState(false) // NEW: Tooltip state
    const [maturityTypes, setMaturityTypes] = React.useState(DEFAULT_MATURITY_TYPES)
    const [maturityRanks, setMaturityRanks] = React.useState(DEFAULT_MATURITY_RANKS)

    const toggleMaturityType = (key) => {
        setMaturityTypes(current => ({ ...current, [key]: !current[key] }))
    }

    const toggleMaturityRank = (key) => {
        setMaturityRanks(current => ({ ...current, [key]: !current[key] }))
    }

    const setAllMaturityTypes = (value) => {
        setMaturityTypes(Object.fromEntries(MATURITY_TYPE_OPTIONS.map(option => [option.key, value])))
    }

    const setAllMaturityRanks = (value) => {
        setMaturityRanks(Object.fromEntries(MATURITY_RANK_OPTIONS.map(option => [option.key, value])))
    }

    const isMaturityVisible = (type, rank) => (
        rank !== -1 && Boolean(maturityTypes[type]) && Boolean(maturityRanks[rank])
    )

    // State for Dynamic Rows
    // OPTIMIZED DEFAULT: Cost Effective Symmetric Nucleos (23, 26, 0, 3)
    const [topCandidates, setTopCandidates] = React.useState([23, 26, 0, 3])
    const prevCandidatesRef = React.useRef([23, 26, 0, 3]) // To track previous state for victory retention

    const baseWaitThreshold = useFinancialStore(state => state.baseWaitThreshold) || 300;

    // Calculate the 4 most mature (coldest) standard streets (excluding streets with 0)
    const matureStreets = React.useMemo(() => {
        const list = history || []
        const tCalle = 37 / 3 // True stochastical cycle: 12.333
        const standardStreets = (ALL_STREETS || []).filter(s => !s.numbers.includes(0))
        const streetsData = standardStreets.map(street => {
            let misses = 0
            for (let i = list.length - 1; i >= 0; i--) {
                if (street.numbers.includes(list[i])) break
                misses++
            }
            const sorted = [...street.numbers].sort((a, b) => a - b)
            const id = `STREET_${sorted[0]}`
            const ratio = misses / tCalle
            const percentage = Math.round(ratio * 100)
            return { ...street, misses, percentage, id }
        })
        const sorted = streetsData.sort((a, b) => b.misses - a.misses)
        return sorted.slice(0, 4)
    }, [history])

    // Calculate the 4 most mature (coldest) standard corners (excluding corners with 0)
    const matureCorners = React.useMemo(() => {
        const list = history || []
        const tCorner = 37 / 4 // True stochastical cycle: 9.25
        const standardCorners = (ALL_CORNERS || []).filter(c => !c.numbers.includes(0))
        const cornersData = standardCorners.map(corner => {
            let misses = 0
            for (let i = list.length - 1; i >= 0; i--) {
                if (corner.numbers.includes(list[i])) break
                misses++
            }
            const sorted = [...corner.numbers].sort((a, b) => a - b)
            const id = `CORNER_${sorted.join('_')}`
            const ratio = misses / tCorner
            const percentage = Math.round(ratio * 100)
            return { ...corner, misses, percentage, id }
        })
        const sorted = cornersData.sort((a, b) => b.misses - a.misses)
        return sorted.slice(0, 4)
    }, [history])

    // Calculate the 4 most mature (coldest) standard lines/seisenas (excluding lines with 0)
    const matureLines = React.useMemo(() => {
        const list = history || []
        const tLine = 37 / 6 // True stochastical cycle: 6.167
        const standardLines = (ALL_LINES || []).filter(l => !l.numbers.includes(0))
        const linesData = standardLines.map(line => {
            let misses = 0
            for (let i = list.length - 1; i >= 0; i--) {
                if (line.numbers.includes(list[i])) break
                misses++
            }
            const id = `LINE_${line.numbers[0]}_${line.numbers[3]}`
            const ratio = misses / tLine
            const percentage = Math.round(ratio * 100)
            return { ...line, misses, percentage, id }
        })
        const sorted = linesData.sort((a, b) => b.misses - a.misses)
        return sorted.slice(0, 4)
    }, [history])

    // Calculate mature outside bets using the same coldness ratio model.
    const matureDozens = React.useMemo(() => {
        const list = history || []
        const tDozen = 37 / 12 // True stochastical cycle: 3.083
        const dozensData = DOZEN_GROUPS.map(dozen => {
            let misses = 0
            for (let i = list.length - 1; i >= 0; i--) {
                if (dozen.numbers.includes(list[i])) break
                misses++
            }
            const ratio = misses / tDozen
            const percentage = Math.round(ratio * 100)
            return { ...dozen, misses, percentage }
        })
        return dozensData.sort((a, b) => b.misses - a.misses).slice(0, 3)
    }, [history])

    const matureColumns = React.useMemo(() => {
        const list = history || []
        const tColumn = 37 / 12 // True stochastical cycle: 3.083
        const columnsData = COLUMN_GROUPS.map(column => {
            let misses = 0
            for (let i = list.length - 1; i >= 0; i--) {
                if (column.numbers.includes(list[i])) break
                misses++
            }
            const ratio = misses / tColumn
            const percentage = Math.round(ratio * 100)
            return { ...column, misses, percentage }
        })
        return columnsData.sort((a, b) => b.misses - a.misses).slice(0, 3)
    }, [history])


    // --- 1. DYNAMIC RANKING LOGIC (Staleness) ---
    React.useEffect(() => {
        if (!history || history.length === 0) {
            // RESET DETECTED: Revert to Optimized Defaults
            const defaults = [23, 26, 0, 3]
            if (JSON.stringify(defaults) !== JSON.stringify(topCandidates)) {
                setTopCandidates(defaults)
                prevCandidatesRef.current = defaults
            }
            return
        }

        const lastSeen = {}
        const staleness = []

        // Init all numbers
        for (let i = 0; i <= 36; i++) lastSeen[i] = -1

        // Traverse history (newest first usually, index 0 is newest)
        // Adjust if history is oldest-first. Assuming index 0 is newest based on common implementation?
        // Let's verify: Usually history.push simply adds to end. If index 0 is oldest...
        // Assuming array is [oldest, ..., newest].
        // Let's assume standard array.reverse() check or check provider.
        // Using "indexOf" from end for simplicity or explicit loop.

        // Let's look for "Distance from end"
        for (let i = 0; i <= 36; i++) {
            const lastIdx = history.lastIndexOf(i)
            const spinsAgo = lastIdx === -1 ? 999 : (history.length - 1 - lastIdx)
            staleness.push({ num: i, ago: spinsAgo })
        }

        // Sort: Descending spinsAgo (Stalest first)
        staleness.sort((a, b) => b.ago - a.ago)

        // --- VICTORY RETENTION LOGIC ---
        // If a number just won (history[history.length-1]), and it was partially covered by a candidate,
        // we want to KEEP that candidate in the list to show the win.

        let candidates = staleness.slice(0, 4).map(s => s.num)

        const latestNum = history[history.length - 1]
        if (latestNum !== undefined && prevCandidatesRef.current) {
            const retentionList = []

            // Check each previous candidate
            prevCandidatesRef.current.forEach(cand => {
                // Check if 'cand' covers 'latestNum' via Nucleo/Vecinos
                // We can use getRelativeSectors(cand) or OFFSETS logic
                // Let's use getCoveredNumbers helpers if available or re-derive
                // Fast check: Nucleo or Vecinos?

                // Retrieve sectors
                const sectors = getRelativeSectors(cand)
                const covered = [...sectors.nucleo, ...sectors.vecinos] // Assuming these are main systems

                if (covered.includes(latestNum)) {
                    retentionList.push(cand)
                }
            })

            if (retentionList.length > 0) {
                // We have winners to retain.
                // Strategy: Put them at the TOP of the new list, remove duplicates.
                const combined = [...retentionList, ...candidates]
                // Unique
                const unique = [...new Set(combined)]
                // Trim to 4
                candidates = unique.slice(0, 4)
            }
        }

        // Pick top 4 distinct
        const top4 = candidates

        // Avoid flickering? Update only if changed significantly?
        // For now, reactive updates are good.
        // Check equality to avoid re-renders if same
        if (JSON.stringify(top4) !== JSON.stringify(topCandidates)) {
            setTopCandidates(top4)
            prevCandidatesRef.current = top4
        }
    }, [history])


    // Helper: Determine which numbers are covered by a bet ID
    const getCoveredNumbers = (betId) => {
        if (!betId) return []

        // 1. Check for straight-up number first
        const numeric = parseInt(betId)
        if (!isNaN(numeric) && numeric >= 0 && numeric <= 36 && betId.indexOf('_') === -1) {
            return [numeric]
        }

        // 2. Systems and Call Bets (Dynamic/Real Coverage)
        // DYNAMIC PARSING for Systems
        if (betId.startsWith('NUCLEO_') || betId.startsWith('VECINOS_') || betId.startsWith('HUERFANOS_') || betId.startsWith('TERCIO_')) {
            const parts = betId.split('_')
            const type = parts[0]
            const center = parseInt(parts[1])

            if (!isNaN(center) && OFFSETS[center]) {
                const sectorData = getRelativeSectors(center)
                let nums = []
                if (type === 'NUCLEO') nums = sectorData.nucleo
                if (type === 'VECINOS') nums = sectorData.vecinos
                if (type === 'HUERFANOS') nums = sectorData.orphelins
                if (type === 'TERCIO') nums = sectorData.tiers

                return calculateRealCoverage(nums)
            }
        }

        if (betId === 'ZERO') return ZERO_REAL
        if (betId === 'VOISINS') return VOISINS_REAL
        if (betId === 'ORPHELINS') return ORPHELINS_REAL
        if (betId === 'TIERS') return TIERS_REAL

        // 3. Structured Bets
        const parts = betId.split('_')
        const type = parts[0]

        if (type === 'STREET') {
            const start = parseInt(parts[1])
            return [start, start + 1, start + 2]
        }
        if (type === 'LINE' || type === 'LINEA') {
            const start = parseInt(parts[1])
            return [start, start + 1, start + 2, start + 3, start + 4, start + 5]
        }
        if (['SPLIT', 'CORNER', 'TRIO', 'BASKET'].includes(type)) {
            return parts.slice(1).map(Number)
        }

        if (type === 'RED') return REDS
        if (type === 'BLACK') return NUMBERS.filter(n => !REDS.includes(n))
        if (type === 'EVEN') return NUMBERS.filter(n => n % 2 === 0)
        if (type === 'ODD') return NUMBERS.filter(n => n % 2 !== 0)
        if (type === 'LOW') return NUMBERS.filter(n => n <= 18)
        if (type === 'HIGH') return NUMBERS.filter(n => n >= 19)

        if (type === 'DOZ1') return NUMBERS.filter(n => n >= 1 && n <= 12)
        if (type === 'DOZ2') return NUMBERS.filter(n => n >= 13 && n <= 24)
        if (type === 'DOZ3') return NUMBERS.filter(n => n >= 25 && n <= 36)

        if (type === 'COL1') return NUMBERS.filter(n => n % 3 === 1)
        if (type === 'COL2') return NUMBERS.filter(n => n % 3 === 2)
        if (type === 'COL3') return NUMBERS.filter(n => n % 3 === 0)

        return []
    }

    // Notify parent of hovered numbers for Wheel synchronization
    React.useEffect(() => {
        if (!onHoverNumbers) return
        if (hoveredBet) {
            onHoverNumbers(getCoveredNumbers(hoveredBet))
        } else {
            onHoverNumbers([])
        }
    }, [hoveredBet, onHoverNumbers])

    // FAILSAFE: Clear hover when unmounting or mouse acts erratically
    React.useEffect(() => {
        return () => onHoverNumbers && onHoverNumbers([])
    }, [])

    // NEW: Auto-clear if mouse leaves the grid area entirely
    const handleGridLeave = () => {
        setHoveredBet(null)
        if (onHoverNumbers) onHoverNumbers([])
    }

    const getNumberColor = (num) => {
        if (num === 0) return 'green'
        if (REDS.includes(num)) return 'red'
        return 'black'
    }

    // Helper: Decompose amount into chips
    const getChipStack = (amount) => {
        const denoms = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]
        const stack = []
        let remaining = amount

        for (let chipVal of denoms) {
            const count = Math.floor(remaining / chipVal)
            for (let i = 0; i < count; i++) {
                stack.push(chipVal)
            }
            remaining %= chipVal
        }

        // VISIBILITY FIX: If amount > 0 but stack is empty (fractional bet), force a visual chip
        if (stack.length === 0 && amount > 0) {
            stack.push(1) // Force lowest denom for visibility
        }

        return stack.reverse()
    }

    const renderChip = (betId) => {
        // Find existing bet by checking both the provided ID and its canonical version
        const parts = betId.split('_')
        let canonicalId = betId
        if (['SPLIT', 'CORNER', 'TRIO', 'BASKET', 'LINE', 'LINEA'].includes(parts[0])) {
            const nums = parts.slice(1).map(Number).sort((a, b) => a - b)
            canonicalId = `${parts[0]}_${nums.join('_')}`
        }
        // LINE SPECIAL: Allow both LINE_1_4 (Hotspot) and LINE_1_2_3_4_5_6 (Analyzer) to match
        // But for rendering, we trust the keys in 'bets' are consistent with hotspot generation.
        // IF the key in 'bets' is using the short format (LINE_1_4), we must NOT force it to long format here unless checking alternate.
        // The issue is likely that 'bets' stores it as LINE_1_4 but this function might be mangling it or not finding it if stored as long.
        // MANUAL DEBUG: Log failures for LINE bets
        if (betId.startsWith('LINE')) {
            const val = bets[betId]
            // If we have a value in bets but renderChip isn't finding it, or vice versa
            // console.log(`RENDER CHIP CHECK: ID=${betId} Canonical=${canonicalId} Found=${!!bets[betId] || !!bets[canonicalId]}`)
        }


        // ROBUST LOOKUP: Check multiple ID formats for LINE bets to ensure visibility
        let amount = bets[betId] || bets[canonicalId]

        if (!amount && (betId.startsWith('LINE') || betId.startsWith('LINEA'))) {
            const parts = betId.split('_')
            // Only process standard hotspot IDs like LINE_22_25
            if (parts.length === 3) {
                const start = parseInt(parts[1])

                // 1. Check Short Format: LINE_22
                const shortId = `LINE_${start}`
                amount = bets[shortId]

                // 2. Check Long Format: LINE_22_23_24_25_26_27
                if (!amount) {
                    const longNums = []
                    for (let k = 0; k < 6; k++) longNums.push(start + k)
                    const longId = `LINE_${longNums.join('_')}`
                    amount = bets[longId]
                }

                // 3. Check "LINEA" Prefix Variants
                if (!amount) {
                    amount = bets[`LINEA_${start}`] || bets[`LINEA_${parts[1]}_${parts[2]}`]
                }
            }
        }

        if (!amount) return null

        const stack = getChipStack(amount)

        return (
            <div className="chip-stack">
                {stack.map((val, i) => (
                    <div
                        key={i}
                        className={`board-chip-visual chip-${val}`}
                        style={{
                            transform: `translateY(-${i * 4}px)`,
                            zIndex: i
                        }}
                    >
                        {val >= 1000 ? '1K' : val}
                    </div>
                ))}
                {/* Total Overlay on top if stack > 1 */}
                {stack.length > 1 && (
                    <div className="stack-total">
                        {amount}
                    </div>
                )}
            </div>
        )
    }

    const checkWin = (betId) => {
        if (lastWin === null || lastWin === undefined) return false
        if (betId === '0') return lastWin === 0

        const covered = getCoveredNumbers(betId)
        return covered.includes(lastWin)
    }

    // Helper: Get bets for a system ID (Centralized)
    const getSystemBets = (sysId) => {
        if (sysId === 'ZERO') return getJeuZeroBets()
        if (sysId === 'VOISINS') return getVoisinsBets()
        if (sysId === 'ORPHELINS') return getOrphelinsBets()
        if (sysId === 'TIERS') return getTiersBets()

        if (sysId === 'NUCLEO_0') return getNucleo0Bets()
        if (sysId === 'VECINOS_0') return getVecinos0Bets()
        if (sysId === 'HUERFANOS_0') return getHuerfanos0Bets()
        if (sysId === 'TERCIO_0') return getTercio0Bets()

        if (sysId === 'NUCLEO_26') return getNucleo26Bets()
        if (sysId === 'VECINOS_26') return getVecinos26Bets()
        if (sysId === 'HUERFANOS_26') return getHuerfanos26Bets()
        if (sysId === 'TERCIO_26') return getTercio26Bets()

        if (sysId === 'NUCLEO_23') return getNucleo23Bets()
        if (sysId === 'VECINOS_23') return getVecinos23Bets()
        if (sysId === 'HUERFANOS_23') return getHuerfanos23Bets()
        if (sysId === 'TERCIO_23') return getTercio23Bets()

        if (sysId === 'NUCLEO_10') return getNucleo10Bets()
        if (sysId === 'VECINOS_10') return getVecinos10Bets()
        if (sysId === 'HUERFANOS_10') return getHuerfanos10Bets()
        if (sysId === 'TERCIO_10') return getTercio10Bets()

        if (sysId.startsWith('NUCLEO_') || sysId.startsWith('VECINOS_') || sysId.startsWith('HUERFANOS_') || sysId.startsWith('TERCIO_')) {
            return optimizeBets(getCoveredNumbers(sysId))
        }

        return []
    }

    const checkSystemActive = (sysId) => {
        const requiredBets = getSystemBets(sysId)
        if (requiredBets.length === 0) return false
        return requiredBets.every(id => bets[id] && bets[id] > 0)
    }

    const getSystemMetrics = (sysId) => {
        const betsList = getSystemBets(sysId)
        // COST FIX: Outside bets (Simple/Dozen) cost 5 units, others cost 1 (Rule 5x)
        const cost = betsList.reduce((acc, bid) => {
            const type = getBetType(bid)
            return acc + (type === 'SIMPLE' || type === 'DOZEN' ? 5 : 1)
        }, 0)
        const nums = getCoveredNumbers(sysId).length
        const percentage = nums > 0 ? ((nums / 37) * 100).toFixed(1) : '0.0'
        const decimal = nums > 0 ? (cost / nums).toFixed(3) : '0.000'
        return { cost, nums, percentage, decimal }
    }

    const getClass = (betId, baseClass) => {
        const isHovered = hoveredBet === betId;
        const isWin = checkWin(betId);

        // NEW: Check if this is a system button and if it is active
        const isActiveSystem = checkSystemActive(betId)

        let highlightClass = 'highlight-preview'
        if (hoveredBet) {
            if (hoveredBet.includes('26')) highlightClass = 'highlight-preview-gold'
            else if (hoveredBet.includes('23')) highlightClass = 'highlight-preview-orange'
            else if (hoveredBet.includes('10')) highlightClass = 'highlight-preview-red'
        }

        // WIN GLOW LOGIC
        if (lastWin !== null && parseInt(betId) === lastWin) {
            baseClass += ' win-glow'
        }

        return `${baseClass} ${isHovered ? highlightClass : ''} ${isWin ? 'highlight-win' : ''} ${isActiveSystem ? 'system-active' : ''}`.trim()
    }

    // HANDLERS
    const handleBet = (type, value) => {
        // console.log removed
        if (type === 'NUMBER') {
            if (isNeighborMode) {
                // NEIGHBOR MODE: Place bet on number + neighbors
                onNeighborBet && onNeighborBet(value)
            } else {
                // NORMAL MODE: Single number bet
                onPlaceBet(value.toString())
            }
        } else {
            // Outside bets (Red, Black, etc.)
            onPlaceBet(type) // Or specific handling if needed
        }
    }

    const handleCallBet = (type) => {
        if (onBatchBet) {
            if (type === 'ORPHELINS') onBatchBet(getOrphelinsBets())
            if (type === 'ZERO') onBatchBet(getJeuZeroBets())

            // DYNAMIC SYSTEM HANDLERS
            if (type.startsWith('NUCLEO_') || type.startsWith('VECINOS_') || type.startsWith('HUERFANOS_') || type.startsWith('TERCIO_')) {
                const parts = type.split('_')
                const base = parts[0]
                const center = parseInt(parts[1])

                if (!isNaN(center)) {
                    const sectorData = getRelativeSectors(center)
                    if (base === 'NUCLEO') onBatchBet(optimizeBets(sectorData.nucleo))
                    if (base === 'VECINOS') onBatchBet(optimizeBets(sectorData.vecinos))
                    if (base === 'HUERFANOS') onBatchBet(optimizeBets(sectorData.orphelins))
                    if (base === 'TERCIO') onBatchBet(optimizeBets(sectorData.tiers))
                }
            }
        }
    }


    // --- EFFICIENCY HELPERS ---
    // Dynamic Efficiency Calculator
    const getEfficiencyMetrics = (center) => {
        const sysRaw = getRelativeSectors(center)
        const metrics = {}

        const calc = (nums) => {
            const real = calculateRealCoverage(nums) // returns straight nums covered
            // Cost is harder to get direct from here without verify bets
            const bets = optimizeBets(nums)
            // Approx cost: sum bets? optimizeBets returns full array of IDs.
            // Logic in optimizeBets uses internal Consts (1 or 5).
            // Simple estimation:
            let cost = 0
            bets.forEach(b => {
                if (b.startsWith('SPLIT') || b.startsWith('STREET') || b.startsWith('CORNER') || b.startsWith('LINE') || b.startsWith('TRIO')) cost += 1
                else if (['RED', 'BLACK', 'EVEN', 'ODD', 'LOW', 'HIGH'].includes(b)) cost += 5
                else if (b.startsWith('DOZ') || b.startsWith('COL')) cost += 5
                else cost += 1 // Straight
            })

            const covered = real.length
            const efficiency = covered > 0 ? (cost / covered) : 99
            const percent = (covered / 37) * 100
            return { cost, nums: covered, decimal: efficiency.toFixed(2), percentage: percent.toFixed(1) }
        }

        metrics[`NUCLEO_${center}`] = calc(sysRaw.nucleo)
        metrics[`VECINOS_${center}`] = calc(sysRaw.vecinos)
        metrics[`HUERFANOS_${center}`] = calc(sysRaw.orphelins)
        metrics[`TERCIO_${center}`] = calc(sysRaw.tiers)

        return metrics
    }

    const getEfficiencyStyle = (row, key, text) => {
        // Uniform style, large font, bold, NO color highlighting (inherit parent color)
        return <div style={{ fontSize: '1.2rem', fontWeight: "bold" }}>{text}</div>
    }

    const coveredNumbers = React.useMemo(() => getCoveredNumbers(hoveredBet), [hoveredBet])

    // --- HOTSPOT GENERATION ---
    const renderHotspots = () => {
        const spots = []

        const getNum = (r, c) => {
            const index = (r * 12) + c
            return NUMBERS[index]
        }

        // 0. ZERO SPECIALS
        const zeroSplits = [
            { r: 0, n: 3 },
            { r: 1, n: 2 },
            { r: 2, n: 1 }
        ]
        zeroSplits.forEach(({ r, n }) => {
            const id = `SPLIT_0_${n}`
            spots.push(
                <div
                    key={`split_0_${n}`}
                    className="hotspot v-split"
                    style={{
                        left: '0%', top: `${(r / 3) * 100}%`,
                        marginLeft: '-10px', width: '20px', height: '33.33%',
                        position: 'absolute', zIndex: 100
                    }}
                    onClick={(e) => { e.stopPropagation(); handleBet(id) }}
                    onMouseEnter={() => setHoveredBet(id)}
                    onMouseLeave={() => setHoveredBet(null)}
                    title={`Split 0-${n}`}
                    id={`bet-btn-${id}`}
                >
                    {renderChip(id)}
                </div>
            )
        })

        spots.push(
            <div key="trio_0_2_3" className="hotspot corner"
                style={{ left: '0%', top: '33.33%', marginLeft: '-15px', marginTop: '-15px', width: '30px', height: '30px', position: 'absolute', zIndex: 200, borderRadius: '50%' }}
                onClick={(e) => { e.stopPropagation(); handleBet('TRIO_0_2_3') }}
                onMouseEnter={() => setHoveredBet('TRIO_0_2_3')} onMouseLeave={() => setHoveredBet(null)} title="Trio 0-2-3"
                id="bet-btn-TRIO_0_2_3"
            >
                {renderChip('TRIO_0_2_3')}
            </div>
        )
        spots.push(
            <div key="trio_0_1_2" className="hotspot corner"
                style={{ left: '0%', top: '66.66%', marginLeft: '-15px', marginTop: '-15px', width: '30px', height: '30px', position: 'absolute', zIndex: 200, borderRadius: '50%' }}
                onClick={(e) => { e.stopPropagation(); handleBet('TRIO_0_1_2') }}
                onMouseEnter={() => setHoveredBet('TRIO_0_1_2')} onMouseLeave={() => setHoveredBet(null)} title="Trio 0-1-2"
                id="bet-btn-TRIO_0_1_2"
            >
                {renderChip('TRIO_0_1_2')}
            </div>
        )
        spots.push(
            <div key="basket_0_1_2_3" className="hotspot corner"
                style={{ left: '0%', top: '0%', marginLeft: '-15px', marginTop: '-15px', width: '30px', height: '30px', position: 'absolute', zIndex: 200, borderRadius: '50%' }}
                onClick={(e) => { e.stopPropagation(); handleBet('BASKET_0_1_2_3') }}
                onMouseEnter={() => setHoveredBet('BASKET_0_1_2_3')} onMouseLeave={() => setHoveredBet(null)} title="Basket 0-1-2-3"
                id="bet-btn-BASKET_0_1_2_3"
            >
                {renderChip('BASKET_0_1_2_3')}
            </div>
        )

        // 1. VERTICAL (SPLITS)
        for (let c = 0; c < 11; c++) {
            for (let r = 0; r < 3; r++) {
                const n1 = getNum(r, c)
                const n2 = getNum(r, c + 1)
                if (n1 !== undefined && n2 !== undefined) {
                    const low = Math.min(n1, n2)
                    const high = Math.max(n1, n2)
                    const id = `SPLIT_${low}_${high}`
                    spots.push(
                        <div key={`vsplit_${n1}_${n2}`} className="hotspot v-split"
                            style={{ left: `${((c + 1) / 12) * 100}%`, top: `${(r / 3) * 100}%`, marginLeft: '-10px', width: '20px', height: '33.33%', position: 'absolute', zIndex: 100 }}
                            onClick={(e) => { e.stopPropagation(); handleBet(id) }}
                            onMouseEnter={() => setHoveredBet(id)} onMouseLeave={() => setHoveredBet(null)}
                            title={`Split ${n1}-${n2}`}
                            id={`bet-btn-${id}`}
                        >{renderChip(id)}</div>
                    )
                }
            }
        }

        // 2. CORNERS
        for (let c = 0; c < 11; c++) {
            for (let r = 0; r < 2; r++) {
                const n1 = getNum(r, c); const n2 = getNum(r, c + 1); const n3 = getNum(r + 1, c); const n4 = getNum(r + 1, c + 1)
                if (n1 !== undefined && n2 !== undefined && n3 !== undefined && n4 !== undefined) {
                    const nums = [n1, n2, n3, n4].sort((a, b) => a - b)
                    const id = `CORNER_${nums.join('_')}`

                    const rawMatureRank = matureCorners.findIndex(cor => cor.id === id && cor.misses > 0)
                    const matureRank = isMaturityVisible('corner', rawMatureRank) ? rawMatureRank : -1
                    const hasBet = bets[id] || bets[getCanonicalBetId(id)]

                    const cornerStyle = {
                        left: `${((c + 1) / 12) * 100}%`,
                        top: `${((r + 1) / 3) * 100}%`,
                        marginLeft: '-19px',
                        marginTop: '-19px',
                        width: '38px',
                        height: '38px',
                        position: 'absolute',
                        zIndex: 2000,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }

                    if (matureRank !== -1) {
                        const colors = ['#ffd700', '#ff8c00', '#ff4500', '#ff6b6b']
                        cornerStyle.backgroundColor = colors[matureRank]
                        cornerStyle.border = '2px solid #ffffff'
                        cornerStyle.boxShadow = `0 0 10px ${colors[matureRank]}, 0 0 20px ${colors[matureRank]}`
                        cornerStyle.color = matureRank === 2 ? '#ffffff' : '#000000'
                        cornerStyle.fontSize = '14.5px'
                        cornerStyle.fontWeight = '900'
                        cornerStyle.letterSpacing = '-0.5px'
                    }

                    spots.push(
                        <div key={`corner_${n1}_${n4}`} className="hotspot corner"
                            style={cornerStyle}
                            onClick={(e) => { e.stopPropagation(); handleBet(id) }}
                            onMouseEnter={() => setHoveredBet(id)} onMouseLeave={() => setHoveredBet(null)}
                            title={`Cuadro (#4) ${nums.join('-')} (${matureRank !== -1 ? matureCorners[matureRank].percentage : 0}%)`}
                            id={`bet-btn-${id}`}
                        >
                            {hasBet ? renderChip(id) : (matureRank !== -1 ? `${matureCorners[matureRank].percentage}%` : null)}
                        </div>
                    )
                }
            }
        }

        // 3. HORIZONTAL (SPLITS)
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 12; c++) {
                const n1 = getNum(r, c); const n2 = getNum(r + 1, c)
                if (n1 !== undefined && n2 !== undefined) {
                    const low = Math.min(n1, n2)
                    const high = Math.max(n1, n2)
                    const id = `SPLIT_${low}_${high}`
                    spots.push(
                        <div key={`hsplit_${n1}_${n2}`} className="hotspot h-split"
                            style={{ left: `${(c / 12) * 100}%`, top: `${((r + 1) / 3) * 100}%`, marginTop: '-10px', width: '8.33%', height: '20px', position: 'absolute', zIndex: 100 }}
                            onClick={(e) => { e.stopPropagation(); handleBet(id) }}
                            onMouseEnter={() => setHoveredBet(id)} onMouseLeave={() => setHoveredBet(null)}
                            title={`Medio (#2) ${n1}-${n2}`}
                            id={`bet-btn-${id}`}
                        >{renderChip(id)}</div>
                    )
                }
            }
        }

        // 3. STREETS & LINES (FORENSIC REPAIR)
        for (let c = 0; c < 12; c++) {
            // Numbers in this column (Row 0=Top=3.., Row 2=Bot=1..)
            const nTop = getNum(0, c)
            const nBot = getNum(2, c)

            if (nBot && nTop) {
                // --- STREET BETS (Standard) ---
                const streetId = `STREET_${nBot}`
                const rawMatureRank = matureStreets.findIndex(s => s.id === streetId && s.misses > 0)
                const matureRank = isMaturityVisible('street', rawMatureRank) ? rawMatureRank : -1
                spots.push(
                    <div key={`street_${streetId}`} className="hotspot street"
                        style={{
                            gridColumn: `${c + 1} / span 1`,
                            gridRow: '1 / span 1',
                            position: 'absolute',
                            top: '-15px',
                            left: '50%',
                            width: '60%',
                            height: '35px',
                            transform: 'translateX(-50%)',
                            zIndex: 90
                        }}
                        onClick={(e) => { e.stopPropagation(); handleBet(streetId) }}
                        onMouseEnter={() => setHoveredBet(streetId)}
                        onMouseLeave={() => setHoveredBet(null)}
                        title={`Calle ${nBot}-${nTop}`}
                        id={`bet-btn-${streetId}`}
                    >
                        {renderChip(streetId)}
                        {matureRank !== -1 && (
                            <div className={`mature-street-badge rank-${matureRank + 1}`} style={{
                                position: 'absolute',
                                top: '-46px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: matureRank === 0 ? '#ffd700' : matureRank === 1 ? '#ff8c00' : matureRank === 2 ? '#ff4500' : '#ff6b6b',
                                color: '#000',
                                padding: '3px 6px',
                                borderRadius: '5px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                boxShadow: '0 3px 6px rgba(0,0,0,0.5)',
                                zIndex: 100,
                                border: '1.5px solid rgba(0,0,0,0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0px',
                                lineHeight: '1.1'
                            }}>
                                <div style={{ fontSize: '9.5px', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 'bold' }}>
                                    🔥 M{matureRank + 1}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginTop: '1px' }}>
                                    <span style={{ fontSize: '15px', fontWeight: '900' }}>{matureStreets[matureRank].percentage}%</span>
                                    <span style={{ fontSize: '9.5px', opacity: 0.75, fontWeight: 'bold' }}>({matureStreets[matureRank].misses})</span>
                                </div>
                            </div>
                        )}
                    </div>
                )

                // --- SIX LINE BETS (Forensic fix: Identical behavior to Streets) ---
                // Only generate if there is a "Next Column" to the right
                if (c < 11) {
                    const nextBot = getNum(2, c + 1)
                    if (nextBot) {
                        const lineId = `LINE_${nBot}_${nextBot}` // ID Format: LINE_1_4
                        const rawMatureRank = matureLines.findIndex(l => l.id === lineId && l.misses > 0)
                        const matureRank = isMaturityVisible('line', rawMatureRank) ? rawMatureRank : -1
                        const hasBet = bets[lineId] || bets[getCanonicalBetId(lineId)]

                        const lineStyle = {
                            gridColumn: `${c + 1} / span 1`, // Anchored to Current Column
                            gridRow: '1 / span 1',           // Top Row
                            position: 'absolute',
                            top: '-16px',                    // Aligned exactly with Street chips
                            left: 'calc(100% + 1px)',        // Exact center of the 2px gap
                            width: '42px',
                            height: '42px',
                            transform: 'translateX(-50%)',   // Center the hotspot on the line
                            zIndex: 10000,                   // Ultra High Z for priority
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }

                        if (matureRank !== -1) {
                            const colors = ['#ffd700', '#ff8c00', '#ff4500', '#ff6b6b']
                            lineStyle.backgroundColor = colors[matureRank]
                            lineStyle.border = '2px solid #ffffff'
                            lineStyle.boxShadow = `0 0 10px ${colors[matureRank]}, 0 0 20px ${colors[matureRank]}`
                            lineStyle.color = matureRank === 2 ? '#ffffff' : '#000000'
                            lineStyle.fontSize = '14.5px'
                            lineStyle.fontWeight = '900'
                            lineStyle.letterSpacing = '-0.5px'
                        }

                        spots.push(
                            <div key={`line_${lineId}`} className="hotspot six-line"
                                style={lineStyle}
                                onClick={(e) => { e.stopPropagation(); handleBet(lineId) }}
                                onMouseEnter={() => setHoveredBet(lineId)}
                                onMouseLeave={() => setHoveredBet(null)}
                                title={`Seisena ${nBot}-${nextBot} (${matureRank !== -1 ? matureLines[matureRank].percentage : 0}%)`}
                                id={`bet-btn-${lineId}`}
                            >
                                {hasBet ? renderChip(lineId) : (matureRank !== -1 ? `${matureLines[matureRank].percentage}%` : null)}
                            </div>
                        )
                    }
                }
            }
        }

        return spots
    }

    const getMaturityCellStyle = (rank) => {
        if (rank === -1) return {}
        const color = MATURITY_COLORS[rank]
        return {
            background: `linear-gradient(135deg, ${color}, rgba(20, 20, 20, 0.95))`,
            border: '2px solid #ffffff',
            boxShadow: `inset 0 0 12px ${color}, 0 0 14px ${color}`,
            color: rank === 2 ? '#ffffff' : '#000000',
            fontWeight: '900'
        }
    }

    const renderMaturityBadge = (entry, rank, compact = false) => {
        if (!entry || rank === -1 || entry.misses <= 0) return null
        const color = MATURITY_COLORS[rank]
        return (
            <div style={{
                position: 'absolute',
                right: compact ? '4px' : '8px',
                bottom: compact ? '4px' : '5px',
                zIndex: 8,
                pointerEvents: 'none',
                backgroundColor: color,
                color: '#000',
                border: '1.5px solid rgba(0,0,0,0.25)',
                borderRadius: '5px',
                boxShadow: '0 3px 6px rgba(0,0,0,0.5)',
                padding: compact ? '2px 4px' : '3px 6px',
                minWidth: compact ? '34px' : '42px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1.05',
                fontWeight: '900'
            }}>
                <span style={{ fontSize: compact ? '8px' : '9px', opacity: 0.85 }}>M{rank + 1}</span>
                <span style={{ fontSize: compact ? '11px' : '13px' }}>{entry.percentage}%</span>
            </div>
        )
    }

    return (
        <div
            className="board-container"
            style={{ padding: '0', justifyContent: 'flex-start', alignItems: 'center', width: '100%', overflow: 'visible' }}
            onMouseLeave={handleGridLeave} // FAILSAFE TRIGGER
        >
            <div className="maturity-filter-panel" onMouseLeave={() => setHoveredBet(null)}>
                <div className="maturity-filter-group" aria-label="Tipos de madurez">
                    <button
                        type="button"
                        className={`maturity-filter-chip ${MATURITY_TYPE_OPTIONS.every(option => maturityTypes[option.key]) ? 'active' : ''}`}
                        onClick={() => setAllMaturityTypes(!MATURITY_TYPE_OPTIONS.every(option => maturityTypes[option.key]))}
                    >
                        Tipos
                    </button>
                    {MATURITY_TYPE_OPTIONS.map(option => (
                        <button
                            key={option.key}
                            type="button"
                            className={`maturity-filter-chip ${maturityTypes[option.key] ? 'active' : ''}`}
                            onClick={() => toggleMaturityType(option.key)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <div className="maturity-filter-group" aria-label="Ranking de madurez">
                    <button
                        type="button"
                        className={`maturity-filter-chip ${MATURITY_RANK_OPTIONS.every(option => maturityRanks[option.key]) ? 'active' : ''}`}
                        onClick={() => setAllMaturityRanks(!MATURITY_RANK_OPTIONS.every(option => maturityRanks[option.key]))}
                    >
                        Ranking
                    </button>
                    {MATURITY_RANK_OPTIONS.map(option => (
                        <button
                            key={option.key}
                            type="button"
                            className={`maturity-filter-chip rank-${option.key + 1} ${maturityRanks[option.key] ? 'active' : ''}`}
                            onClick={() => toggleMaturityRank(option.key)}
                        >
                            M{option.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="betting-grid" style={{ width: 'max-content', flexShrink: 0, position: 'relative' }}>
                {/* E2 IDENTIFICATION LABEL */}
                {/* E2 IDENTIFICATION LABEL REMOVED - Now in CasinoTable.jsx */}

                {/* 1. ZERO */}
                {(() => {
                    const isCovered = coveredNumbers.includes(0);
                    const isPlaced = placedNumbers.includes(0);
                    const isBestPayout = bestPayoutNumbers.includes(0);
                    const isWin = lastWin === 0;

                    let highlightClass = '';
                    if (isWin) highlightClass = 'highlight-win';
                    else if (isBestPayout) highlightClass = 'highlight-best-payout';
                    else if (isPlaced) highlightClass = 'highlight-placed';
                    else if (isCovered) highlightClass = 'highlight-preview';

                    return (
                        <div
                            className={`grid-cell zero-cell green ${highlightClass}`}
                            onClick={() => handleBet('NUMBER', 0)}
                            onMouseEnter={() => setHoveredBet('0')}
                            onMouseLeave={() => setHoveredBet(null)}
                            id="bet-btn-0"
                            style={{ position: 'relative' }}
                        >
                            0
                            {renderChip('0')}
                            {isWin && (
                                <div className="dolly-marker" style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%) rotate(45deg)',
                                    width: '14px',
                                    height: '14px',
                                    border: '2px solid #fff',
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(212, 175, 55, 0.95) 100%)',
                                    boxShadow: '0 0 10px #ffd700, 0 0 20px #ffd700',
                                    zIndex: 3000,
                                    borderRadius: '2px',
                                    animation: 'dollyPulse 1s infinite alternate',
                                    pointerEvents: 'none'
                                }} />
                            )}
                        </div>
                    );
                })()}

                {/* 2. NUMBERS 1-36 */}
                <div className="numbers-block" style={{ position: 'relative' }}>
                    {NUMBERS.map(num => {
                        const isCovered = coveredNumbers.includes(num);
                        const isPlaced = placedNumbers.includes(num);
                        const isBestPayout = bestPayoutNumbers.includes(num);
                        const isWin = lastWin === num;

                        const isSystem26 = hoveredBet && hoveredBet.includes('26');
                        const isSystem23 = hoveredBet && hoveredBet.includes('23');
                        const isSystem10 = hoveredBet && hoveredBet.includes('10');

                        let highlightClass = '';
                        if (isWin) highlightClass = 'highlight-win';
                        else if (isBestPayout) highlightClass = 'highlight-best-payout';
                        else if (isPlaced) highlightClass = 'highlight-placed';
                        else if (isCovered) {
                            highlightClass = 'highlight-preview';
                            if (isSystem26) highlightClass = 'highlight-preview-gold';
                            if (isSystem23) highlightClass = 'highlight-preview-orange';
                            if (isSystem10) highlightClass = 'highlight-preview-red';
                        }

                        // Check if this number is in one of the top 4 mature streets
                        const matureStreetForNum = maturityTypes.street ? matureStreets.find(s => {
                            const rankIdx = matureStreets.indexOf(s)
                            return s.numbers.includes(num) && s.misses > 0 && Boolean(maturityRanks[rankIdx])
                        }) : null
                        let matureClass = ''
                        if (matureStreetForNum) {
                            const rankIdx = matureStreets.indexOf(matureStreetForNum)
                            if (rankIdx === 0) matureClass = 'mature-glow-gold'
                            else if (rankIdx === 1) matureClass = 'mature-glow-orange'
                            else if (rankIdx === 2) matureClass = 'mature-glow-red'
                            else if (rankIdx === 3) matureClass = 'mature-glow-coral'
                        }

                        // Check if this number is in one of the top 4 mature corners
                        const matureCornerForNum = maturityTypes.corner ? matureCorners.find(c => {
                            const rankIdx = matureCorners.indexOf(c)
                            return c.numbers.includes(num) && c.misses > 0 && Boolean(maturityRanks[rankIdx])
                        }) : null
                        let matureCornerClass = ''
                        if (matureCornerForNum) {
                            const rankIdx = matureCorners.indexOf(matureCornerForNum)
                            if (rankIdx === 0) matureCornerClass = 'mature-corner-glow-gold'
                            else if (rankIdx === 1) matureCornerClass = 'mature-corner-glow-orange'
                            else if (rankIdx === 2) matureCornerClass = 'mature-corner-glow-red'
                            else if (rankIdx === 3) matureCornerClass = 'mature-corner-glow-coral'
                        }

                        // Check if this number is in one of the top 4 mature lines (seisenas)
                        const matureLineForNum = maturityTypes.line ? matureLines.find(l => {
                            const rankIdx = matureLines.indexOf(l)
                            return l.numbers.includes(num) && l.misses > 0 && Boolean(maturityRanks[rankIdx])
                        }) : null
                        let matureLineClass = ''
                        if (matureLineForNum) {
                            const rankIdx = matureLines.indexOf(matureLineForNum)
                            if (rankIdx === 0) matureLineClass = 'mature-line-glow-gold'
                            else if (rankIdx === 1) matureLineClass = 'mature-line-glow-orange'
                            else if (rankIdx === 2) matureLineClass = 'mature-line-glow-red'
                            else if (rankIdx === 3) matureLineClass = 'mature-line-glow-coral'
                        }

                        return (
                            <div key={num}
                                className={`grid-cell number-cell ${getNumberColor(num)} ${highlightClass} ${matureClass} ${matureCornerClass} ${matureLineClass}`}
                                onClick={() => handleBet('NUMBER', num)}
                                onMouseEnter={() => setHoveredBet(num.toString())} onMouseLeave={() => setHoveredBet(null)}
                                id={`bet-btn-${num}`}
                                style={{ position: 'relative' }}
                            >
                                {num}
                                {renderChip(num.toString())}
                                {isWin && (
                                    <div className="dolly-marker" style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%) rotate(45deg)',
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid #fff',
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(212, 175, 55, 0.95) 100%)',
                                        boxShadow: '0 0 10px #ffd700, 0 0 20px #ffd700',
                                        zIndex: 3000,
                                        borderRadius: '2px',
                                        animation: 'dollyPulse 1s infinite alternate',
                                        pointerEvents: 'none'
                                    }} />
                                )}
                            </div>
                        )
                    })}
                    {renderHotspots()}
                </div>

                {/* 3. COLUMNS */}
                <div className="columns-block">
                    {COLUMN_GROUPS.map(column => {
                        const rawMatureRank = matureColumns.findIndex(entry => entry.id === column.id && entry.misses > 0)
                        const matureRank = isMaturityVisible('column', rawMatureRank) ? rawMatureRank : -1
                        const matureEntry = matureRank !== -1 ? matureColumns[matureRank] : null
                        return (
                            <div key={column.id}
                                className={getClass(column.id, "grid-cell rect-cell column-cell")}
                                onClick={() => handleBet(column.id)}
                                onMouseEnter={() => setHoveredBet(column.id)}
                                onMouseLeave={() => setHoveredBet(null)}
                                style={{ position: 'relative', ...getMaturityCellStyle(matureRank) }}
                                title={`${column.label} (${matureEntry ? matureEntry.percentage : 0}%)`}
                                id={`bet-btn-${column.id}`}
                            >
                                <span style={{ fontSize: '0.55rem', position: 'absolute', top: '4px', right: '6px', opacity: 0.7, color: matureRank !== -1 ? '#111' : '#ffeb3b', pointerEvents: 'none' }}>Min 5</span>
                                <span className="payout-text" style={{ position: 'relative', zIndex: 5 }}>2 to 1</span>
                                <span className="col-label" style={{ position: 'relative', zIndex: 5 }}>{column.label}</span>
                                {renderChip(column.id)}
                                {!bets[column.id] && renderMaturityBadge(matureEntry, matureRank, true)}
                            </div>
                        )
                    })}
                </div>

                {/* 4. DOZENS */}
                <div className="outside-row dozens-row">
                    {DOZEN_GROUPS.map(dozen => {
                        const rawMatureRank = matureDozens.findIndex(entry => entry.id === dozen.id && entry.misses > 0)
                        const matureRank = isMaturityVisible('dozen', rawMatureRank) ? rawMatureRank : -1
                        const matureEntry = matureRank !== -1 ? matureDozens[matureRank] : null
                        return (
                            <div key={dozen.id}
                                className={getClass(dozen.id, "grid-cell rect-cell")}
                                onClick={() => handleBet(dozen.id)}
                                onMouseEnter={() => setHoveredBet(dozen.id)}
                                onMouseLeave={() => setHoveredBet(null)}
                                style={{ position: 'relative', ...getMaturityCellStyle(matureRank) }}
                                title={`${dozen.label} (${matureEntry ? matureEntry.percentage : 0}%)`}
                                id={`bet-btn-${dozen.id}`}
                            >
                                <span style={{ fontSize: '0.55rem', position: 'absolute', top: '4px', left: '6px', opacity: 0.7, color: matureRank !== -1 ? '#111' : '#ffeb3b', pointerEvents: 'none' }}>Min 5</span>
                                <span style={{ position: 'relative', zIndex: 5 }}>{dozen.label}</span>
                                {renderChip(dozen.id)}
                                {!bets[dozen.id] && renderMaturityBadge(matureEntry, matureRank)}
                            </div>
                        )
                    })}
                </div>

                {/* 5. EVEN CHANCES (Justo Debajo de Docenas) */}
                < div className="outside-row simple-row" >
                    {/* Bajo Docena 1: BAJOS y PAR */}
                    < div className={getClass('LOW', "grid-cell rect-cell")}
                        onClick={() => handleBet('LOW')} onMouseEnter={() => setHoveredBet('LOW')} onMouseLeave={() => setHoveredBet(null)}
                        id="bet-btn-LOW"
                    >
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.55rem', position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', opacity: 0.7, color: '#ffeb3b', whiteSpace: 'nowrap', pointerEvents: 'none' }}>Min 5</span>
                            BAJOS {renderChip('LOW')}
                        </div>
                    </div >
                    <div className={getClass('EVEN', "grid-cell rect-cell")}
                        onClick={() => handleBet('EVEN')} onMouseEnter={() => setHoveredBet('EVEN')} onMouseLeave={() => setHoveredBet(null)}
                        id="bet-btn-EVEN"
                    >
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.55rem', position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', opacity: 0.7, color: '#ffeb3b', whiteSpace: 'nowrap', pointerEvents: 'none' }}>Min 5</span>
                            PAR {renderChip('EVEN')}
                        </div>
                    </div>

                    {/* Bajo Docena 2: ROJO y NEGRO */}
                    <div className={getClass('RED', "grid-cell rect-cell")}
                        onClick={() => handleBet('RED')} onMouseEnter={() => setHoveredBet('RED')} onMouseLeave={() => setHoveredBet(null)}
                        style={{ background: '#d32f2f', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}
                        id="bet-btn-RED"
                    >
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.55rem', position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', opacity: 0.8, color: '#fff', whiteSpace: 'nowrap', pointerEvents: 'none' }}>Min 5</span>
                            ROJO {renderChip('RED')}
                        </div>
                    </div>
                    <div className={getClass('BLACK', "grid-cell rect-cell")}
                        onClick={() => handleBet('BLACK')} onMouseEnter={() => setHoveredBet('BLACK')} onMouseLeave={() => setHoveredBet(null)}
                        style={{ background: '#000', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid #444' }}
                        id="bet-btn-BLACK"
                    >
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.55rem', position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', opacity: 0.8, color: '#fff', whiteSpace: 'nowrap', pointerEvents: 'none' }}>Min 5</span>
                            NEGRO {renderChip('BLACK')}
                        </div>
                    </div>

                    {/* Bajo Docena 3: IMPAR y ALTOS */}
                    <div className={getClass('ODD', "grid-cell rect-cell")}
                        onClick={() => handleBet('ODD')} onMouseEnter={() => setHoveredBet('ODD')} onMouseLeave={() => setHoveredBet(null)}
                        id="bet-btn-ODD"
                    >
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.55rem', position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', opacity: 0.7, color: '#ffeb3b', whiteSpace: 'nowrap', pointerEvents: 'none' }}>Min 5</span>
                            IMPAR {renderChip('ODD')}
                        </div>
                    </div>
                    <div className={getClass('HIGH', "grid-cell rect-cell")}
                        onClick={() => handleBet('HIGH')} onMouseEnter={() => setHoveredBet('HIGH')} onMouseLeave={() => setHoveredBet(null)}
                        id="bet-btn-HIGH"
                    >
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.55rem', position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', opacity: 0.7, color: '#ffeb3b', whiteSpace: 'nowrap', pointerEvents: 'none' }}>Min 5</span>
                            ALTOS {renderChip('HIGH')}
                        </div>
                    </div>
                </div >



                {/* EXTRA ROW 2: NUCLEO 26 + SYSTEM 26 */}


                {/* REAL TOGGLE BUTTON - Placing at Grid Row 9 (System 23 Row) Left Column */}



                {/* DYNAMIC SYSTEM ROWS (TOP 4) */}
                {(() => {
                    // STALENESS HELPER
                    const getStaleness = (key) => {
                        if (!history || history.length === 0) return 0
                        const cov = getCoveredNumbers(key)
                        let count = 0
                        for (let i = history.length - 1; i >= 0; i--) {
                            if (cov.includes(history[i])) return count
                            count++
                        }
                        return count
                    }

                    // PRE-CALCULATE GLOBAL MAX STALENESS
                    let globalMaxStale = 0
                    topCandidates.forEach(centerNum => {
                        const nKey = `NUCLEO_${centerNum}`
                        const vKey = `VECINOS_${centerNum}`
                        const hKey = `HUERFANOS_${centerNum}`
                        const tKey = `TERCIO_${centerNum}`
                        globalMaxStale = Math.max(globalMaxStale, getStaleness(nKey), getStaleness(vKey), getStaleness(hKey), getStaleness(tKey))
                    })

                    // PRE-CALCULATE DYNAMIC SYSTEM RANKINGS (TOP 4 COLD/MATURE SECTORS)
                    const systemRankings = (() => {
                        const list = [];
                        topCandidates.forEach(centerNum => {
                            const keys = [
                                `NUCLEO_${centerNum}`,
                                `VECINOS_${centerNum}`,
                                `HUERFANOS_${centerNum}`,
                                `TERCIO_${centerNum}`
                            ];
                            keys.forEach(k => {
                                const stale = getStaleness(k);
                                const nums = getCoveredNumbers(k).length;
                                const wait = Math.round(37 / Math.max(nums, 1));
                                const maturity = Math.round((stale / wait) * 100);
                                list.push({ key: k, maturity, stale });
                            });
                        });
                        // Sort: highest maturity first (descending). Tiebreaker: highest stale/delay.
                        const sorted = list.sort((a, b) => {
                            if (b.maturity !== a.maturity) return b.maturity - a.maturity;
                            return b.stale - a.stale;
                        });
                        return sorted.slice(0, 4);
                    })();

                    const getRankClass = (key, isActive) => {
                        if (isActive) return '';
                        const rankIdx = systemRankings.findIndex(r => r.key === key);
                        if (rankIdx === 0) return 'rank-gold-card';
                        if (rankIdx === 1) return 'rank-orange-card';
                        if (rankIdx === 2) return 'rank-red-card';
                        if (rankIdx === 3) return 'rank-coral-card';
                        return '';
                    };

                    return topCandidates.map((centerNum, index) => {
                        const metrics = getEfficiencyMetrics(centerNum)
                        const nKey = `NUCLEO_${centerNum}`
                        const vKey = `VECINOS_${centerNum}`
                        const hKey = `HUERFANOS_${centerNum}`
                        const tKey = `TERCIO_${centerNum}`

                        // WIN CHECK
                        const lastNum = history && history.length > 0 ? history[history.length - 1] : -1
                        const checkWin = (key) => {
                            const covered = getCoveredNumbers(key)
                            return covered.includes(lastNum)
                        }

                        const nWin = checkWin(nKey)
                        const vWin = checkWin(vKey)
                        const hWin = checkWin(hKey)
                        const tWin = checkWin(tKey)

                        // ACTIVE CHECK (Visual Feedback)
                        const nActive = checkSystemActive(nKey)
                        const vActive = checkSystemActive(vKey)
                        const hActive = checkSystemActive(hKey)
                        const tActive = checkSystemActive(tKey)


                        // Get metrics for each
                        const mN = metrics[nKey]
                        const mV = metrics[vKey]
                        const mH = metrics[hKey]
                        const mT = metrics[tKey]

                        // STALENESS CALCULATOR (REMOVED - MOVED UP)
                        // const getStaleness = ...

                        const stN = getStaleness(nKey)
                        const stV = getStaleness(vKey)
                        const stH = getStaleness(hKey)
                        const stT = getStaleness(tKey)

                        // Helper to render badge (REMOVED - Moving inline)
                        // const renderStaleBadge = ...

                        // HIGHLIGHT STYLE FOR ANCIENT (COLD) SYSTEMS
                        const getStaleStyle = (count) => {
                            if (count === 0) return { color: '#00ff00', textShadow: '0 0 5px rgba(0,255,0,0.5)', fontWeight: 'bold' } // JUST WON

                            // ABSOLUTE OLDEST (MAGENTA) - Regardless of count (if > 0)
                            if (count === globalMaxStale && count > 0) {
                                return { color: '#ff00ff', textShadow: '0 0 8px #ff00ff, 0 0 15px #ff00ff', fontWeight: 'bold', fontSize: '1rem' }
                            }

                            // RELATIVELY COLD (> 10)
                            if (count > 10) return { color: '#00ffff', textShadow: '0 0 5px #00ffff', fontWeight: 'bold' }

                            return { color: '#fff', opacity: 0.7 } // RECENT
                        }

                        // NEW: METRICS HELPER (Wait & Maturity)
                        const getAdvMetrics = (nums, stale) => {
                            const waitVal = 37 / Math.max(nums, 1)
                            const maturity = Math.round((stale / waitVal) * 100)
                            return { wait: Math.round(waitVal), maturity }
                        }

                        return (
                            <div key={`dynamic-row-${centerNum}`} className="outside-row extra-row-2" style={{ gridRow: 7 + index, marginTop: '2px' }}>

                                {/* NUCLEO */}
                                {
                                    (() => {
                                        const { wait, maturity } = getAdvMetrics(getCoveredNumbers(nKey).length, stN)
                                        return (
                                            <div className={`${getClass(nKey, "grid-cell rect-cell")} ${nActive ? 'rect-cell-active' : ''} ${getRankClass(nKey, nActive)}`}
                                                style={{
                                                    fontSize: showNumbers ? '0.65rem' : '1rem',
                                                    fontWeight: 'bold',
                                                    color: '#ffd700',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    lineHeight: '1.1',
                                                    position: 'relative',
                                                    background: nActive ? 'rgba(0, 255, 255, 0.3)' : undefined
                                                }}
                                                onClick={() => handleCallBet(nKey)}
                                                onMouseEnter={() => setHoveredBet(nKey)}
                                                onMouseLeave={() => setHoveredBet(null)}
                                            >
                                                {/* renderStaleBadge(stN) REMOVED */}
                                                {(() => {
                                                    return showNumbers ? getCoveredNumbers(nKey).join(', ') : (showEfficiency ? getEfficiencyStyle(`row${index}`, nKey, `${mN.decimal} F/N`) :
                                                        <>
                                                            <div style={{ fontSize: '0.85rem' }}>NUCLEO {centerNum} <span style={{ color: '#fff', opacity: 0.7 }}>[{mN.cost}F|{mN.nums}N]</span></div>
                                                            <div style={{ fontSize: '0.85rem' }}>
                                                                <span style={{ color: '#aaa', marginRight: '6px' }}>{mN.decimal}</span>
                                                                <span style={{ color: '#ffd700' }}>{mN.percentage}%</span>
                                                                <span style={{ marginLeft: '6px', fontSize: '0.8rem', ...getStaleStyle(stN) }}>{stN}↺</span>
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '3px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                                                ESP:{wait} <span style={{ color: maturity > 100 ? '#ff9800' : '#ccc', marginLeft: '5px' }}>MAD:{maturity}%</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )
                                    })()
                                }

                                {/* VECINOS */}
                                {
                                    (() => {
                                        const { wait, maturity } = getAdvMetrics(getCoveredNumbers(vKey).length, stV)
                                        return (
                                            <div className={`${getClass(vKey, "grid-cell rect-cell")} ${vActive ? 'rect-cell-active' : ''} ${getRankClass(vKey, vActive)}`}
                                                style={{
                                                    fontSize: showNumbers ? '0.65rem' : '1rem',
                                                    fontWeight: 'bold',
                                                    color: '#ffd700',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    lineHeight: '1.1',
                                                    position: 'relative',
                                                    background: vActive ? 'rgba(0, 255, 255, 0.3)' : undefined
                                                }}
                                                onClick={() => handleCallBet(vKey)}
                                                onMouseEnter={() => setHoveredBet(vKey)}
                                                onMouseLeave={() => setHoveredBet(null)}
                                            >
                                                {/* renderStaleBadge(stV) REMOVED */}
                                                {(() => {
                                                    return showNumbers ? getCoveredNumbers(vKey).join(', ') : (showEfficiency ? getEfficiencyStyle(`row${index}`, vKey, `${mV.decimal} F/N`) :
                                                        <>
                                                            <div style={{ fontSize: '0.85rem' }}>VECINOS {centerNum} <span style={{ color: '#fff', opacity: 0.7 }}>[{mV.cost}F|{mV.nums}N]</span></div>
                                                            <div style={{ fontSize: '0.85rem' }}>
                                                                <span style={{ color: '#aaa', marginRight: '6px' }}>{mV.decimal}</span>
                                                                <span style={{ color: '#55ff55' }}>{mV.percentage}%</span>
                                                                <span style={{ marginLeft: '6px', fontSize: '0.8rem', ...getStaleStyle(stV) }}>{stV}↺</span>
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '3px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                                                ESP:{wait} <span style={{ color: maturity > 100 ? '#ff9800' : '#ccc', marginLeft: '5px' }}>MAD:{maturity}%</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )
                                    })()
                                }

                                {/* HUERFANOS */}
                                {
                                    (() => {
                                        const { wait, maturity } = getAdvMetrics(getCoveredNumbers(hKey).length, stH)
                                        return (
                                            <div className={`${getClass(hKey, "grid-cell rect-cell")} ${hActive ? 'rect-cell-active' : ''} ${getRankClass(hKey, hActive)}`}
                                                style={{
                                                    fontSize: showNumbers ? '0.65rem' : '1rem',
                                                    fontWeight: 'bold',
                                                    color: '#ffd700',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    lineHeight: '1.1',
                                                    position: 'relative',
                                                    background: hActive ? 'rgba(0, 255, 255, 0.3)' : undefined
                                                }}
                                                onClick={() => handleCallBet(hKey)}
                                                onMouseEnter={() => setHoveredBet(hKey)}
                                                onMouseLeave={() => setHoveredBet(null)}
                                            >
                                                {/* renderStaleBadge(stH) REMOVED */}
                                                {(() => {
                                                    return showNumbers ? getCoveredNumbers(hKey).join(', ') : (showEfficiency ? getEfficiencyStyle(`row${index}`, hKey, `${mH.decimal} F/N`) :
                                                        <>
                                                            <div style={{ fontSize: '0.85rem' }}>HUÉRFANOS {centerNum} <span style={{ color: '#fff', opacity: 0.7 }}>[{mH.cost}F|{mH.nums}N]</span></div>
                                                            <div style={{ fontSize: '0.85rem' }}>
                                                                <span style={{ color: '#aaa', marginRight: '6px' }}>{mH.decimal}</span>
                                                                <span style={{ color: '#44aaff' }}>{mH.percentage}%</span>
                                                                <span style={{ marginLeft: '6px', fontSize: '0.8rem', ...getStaleStyle(stH) }}>{stH}↺</span>
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '3px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                                                ESP:{wait} <span style={{ color: maturity > 100 ? '#ff9800' : '#ccc', marginLeft: '5px' }}>MAD:{maturity}%</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )
                                    })()
                                }

                                {/* TERCIO */}
                                {
                                    (() => {
                                        const { wait, maturity } = getAdvMetrics(getCoveredNumbers(tKey).length, stT)
                                        return (
                                            <div className={`${getClass(tKey, "grid-cell rect-cell")} ${tActive ? 'rect-cell-active' : ''} ${getRankClass(tKey, tActive)}`}
                                                style={{
                                                    fontSize: showNumbers ? '0.65rem' : '1rem',
                                                    fontWeight: 'bold',
                                                    color: '#ffd700',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    lineHeight: '1.1',
                                                    position: 'relative',
                                                    background: tActive ? 'rgba(0, 255, 255, 0.3)' : undefined
                                                }}
                                                onClick={() => handleCallBet(tKey)}
                                                onMouseEnter={() => setHoveredBet(tKey)}
                                                onMouseLeave={() => setHoveredBet(null)}
                                            >
                                                {/* renderStaleBadge(stT) REMOVED */}
                                                {(() => {
                                                    return showNumbers ? getCoveredNumbers(tKey).join(', ') : (showEfficiency ? getEfficiencyStyle(`row${index}`, tKey, `${mT.decimal} F/N`) :
                                                        <>
                                                            <div style={{ fontSize: '0.85rem' }}>TERCIO {centerNum} <span style={{ color: '#fff', opacity: 0.7 }}>[{mT.cost}F|{mT.nums}N]</span></div>
                                                            <div style={{ fontSize: '0.85rem' }}>
                                                                <span style={{ color: '#aaa', marginRight: '6px' }}>{mT.decimal}</span>
                                                                <span style={{ color: '#ff4444' }}>{mT.percentage}%</span>
                                                                <span style={{ marginLeft: '6px', fontSize: '0.8rem', ...getStaleStyle(stT) }}>{stT}↺</span>
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '3px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                                                ESP:{wait} <span style={{ color: maturity > 100 ? '#ff9800' : '#ccc', marginLeft: '5px' }}>MAD:{maturity}%</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )
                                    })()
                                }
                            </div >
                        )
                    })
                })()}

                {/* MODAL RENDER */}
                {
                    showEfficiencyModal && (
                        <SystemEfficiencyModal
                            onClose={() => setShowEfficiencyModal(false)}
                            onBatchBet={onBatchBet}
                            currentBets={bets}
                        />
                    )
                }
                {/* SIMPLE MODAL RENDER */}
                {
                    showSimpleEfficiencyModal && (
                        <SimpleEfficiencyModal
                            onClose={() => setShowSimpleEfficiencyModal(false)}
                            onBatchBet={onBatchBet}
                            currentBets={bets}
                        />
                    )
                }
                {/* METHODS TABLE MODAL */}
                <MethodsTable
                    isOpen={showMethodsTable}
                    onClose={() => setShowMethodsTable(false)}
                    onBet={onBatchBet}
                />


                {/* BUTTONS 1-4 REMOVED OR MOVED */}
            </div >
        </div >
    )
}
