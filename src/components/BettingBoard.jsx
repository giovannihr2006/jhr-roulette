import React from 'react'
import PropTypes from 'prop-types'
import './BettingBoard.css'
import { REDS, WHEEL_ORDER } from '../utils/rouletteUtils'

// NUMBERS is board layout order (different from WHEEL_ORDER)
const NUMBERS = [
    // Row 3 (Top)
    3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36,
    // Row 2 (Mid)
    2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35,
    // Row 1 (Bot)
    1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
]

// --- STANDARD CALL BET CONSTANTS (Restored) ---
const VOISINS_NUMBERS = [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25]
const TIERS_NUMBERS = [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33]
const ORPHELINS_NUMBERS = [1, 20, 14, 31, 9, 17, 34, 6]
const ZERO_NUMBERS = [12, 35, 3, 26, 0, 32, 15]

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

    // Geometry Definitions relative to Center (Clockwise + / Counter -)
    // Nucleo (Core): Center +/- 3 (7 nums)
    const nucleo = getSlice(-3, 3)

    // Vecinos (Neighbors): Center +/- 8 (17 nums)
    const vecinos = getSlice(-8, 8)

    // Tiers (Opposite): Opposite Side. 
    // Gap 1 (Right of Vecinos): +9, +10, +11 (3 nums) -> Orph Right
    // Tiers Sector: +12 to +23 (12 nums)
    const tiers = getSlice(12, 23)

    // Orphelins (Flanks):
    // Orph Right: +9 to +11 (3 nums)
    // Orph Left: +24 to +28 (5 nums) -> Equivalent to -9 to -13
    // Note: slice(12, 23) covers indices 12..23.
    // 37 nums. 17 (Vec) + 12 (Tiers) + 8 (Orph) = 37.
    // Vecinos: indices [-8..8] (17).
    // Orph 1: [9..11] (3)
    // Tiers: [12..23] (12)
    // Orph 2: [24..28] (5)
    // Check: 24 is (idx+24). End of Tiers is +23.
    // 28 is (idx+28). 
    // Is 28 adjacent to -8?
    // -8 + 37 = 29. So 28 is adjacent to 29. Yes.
    const orphelins = [...getSlice(9, 11), ...getSlice(24, 28)]

    return { nucleo, vecinos, tiers, orphelins }
}

// Generate Static Definitions for Performance
const SECTORS_26 = getRelativeSectors(26)
const SECTORS_23 = getRelativeSectors(23)
const SECTORS_10 = getRelativeSectors(10)

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

// Update Getters to use these Straight Up arrays (Maximum Coverage)
const getNucleo26Bets = () => N26_STR
const getNucleo23Bets = () => N23_STR
const getNucleo10Bets = () => N10_STR

const getVecinos26Bets = () => V26_STR // Renamed from getVoisinsBets
const getTercio26Bets = () => T26_STR
const getHuerfanos26Bets = () => H26_STR

const getVecinos23Bets = () => V23_STR
const getTercio23Bets = () => T23_STR
const getHuerfanos23Bets = () => H23_STR

const getVecinos10Bets = () => V10_STR
const getTercio10Bets = () => T10_STR
const getHuerfanos10Bets = () => H10_STR

const getVoisinsBets = () => [
    'TRIO_0_2_3', 'SPLIT_4_7', 'SPLIT_12_15',
    'SPLIT_18_21', 'SPLIT_19_22', 'CORNER_26_29_25_28', 'SPLIT_32_35'
]
const getTiersBets = () => [
    'SPLIT_5_8', 'SPLIT_11_10', 'SPLIT_13_16', 'SPLIT_24_23', 'SPLIT_27_30', 'SPLIT_33_36'
]
const getOrphelinsBets = () => [
    '1', 'SPLIT_6_9', 'SPLIT_14_17', 'SPLIT_17_20', 'SPLIT_31_34'
]
const getJeuZeroBets = () => [
    'SPLIT_0_3', 'SPLIT_12_15', 'SPLIT_32_35', '26'
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
    onNeighborBet // NEW
}) => {
    // STATE
    const [hoveredBet, setHoveredBet] = React.useState(null)
    const [showNumbers, setShowNumbers] = React.useState(false)

    const [isNeighborMode, setIsNeighborMode] = React.useState(false) // NEW: Global Neighbor Mode

    // Helper: Determine which numbers are covered by a bet ID
    const getCoveredNumbers = (betId) => {
        if (!betId) return []

        // SYSTEM 26 ALIASES (Full ID Check)
        if (betId === 'NUCLEO_26') return NUCLEO_26_NUMBERS
        if (betId === 'VECINOS_26') return VOISINS_NUMBERS
        if (betId === 'HUERFANOS_26') return ORPHELINS_NUMBERS
        if (betId === 'TERCIO_26') return TIERS_NUMBERS

        // SYSTEM 23 ALIASES
        if (betId === 'NUCLEO_23') return NUCLEO_23_NUMBERS
        if (betId === 'VECINOS_23') return VECINOS_23_NUMBERS
        if (betId === 'HUERFANOS_23') return HUERFANOS_23_NUMBERS
        if (betId === 'TERCIO_23') return TERCIO_23_NUMBERS

        // SYSTEM 10 ALIASES
        if (betId === 'NUCLEO_10') return NUCLEO_10_NUMBERS
        if (betId === 'VECINOS_10') return VECINOS_10_NUMBERS
        if (betId === 'HUERFANOS_10') return HUERFANOS_10_NUMBERS
        if (betId === 'TERCIO_10') return TERCIO_10_NUMBERS

        // STANDARD CALL BETS (Row 0)
        if (betId === 'ZERO') return [0, 3, 12, 15, 26, 32, 35] // Jeu Zero
        if (betId === 'VOISINS') return VOISINS_NUMBERS
        if (betId === 'ORPHELINS') return ORPHELINS_NUMBERS
        if (betId === 'TIERS') return TIERS_NUMBERS

        // Check for straight-up number first
        const numeric = parseInt(betId)
        if (!isNaN(numeric) && numeric >= 0 && numeric <= 36 && betId.indexOf('_') === -1) {
            return [numeric]
        }

        const parts = betId.split('_')
        const type = parts[0]

        if (type === 'STREET') return [parseInt(parts[1]), parseInt(parts[1]) + 1, parseInt(parts[1]) + 2]
        if (type === 'LINE') return [parseInt(parts[1]), parseInt(parts[1]) + 1, parseInt(parts[1]) + 2, parseInt(parts[1]) + 3, parseInt(parts[1]) + 4, parseInt(parts[1]) + 5]
        if (type === 'SPLIT' || type === 'CORNER' || type === 'TRIO' || type === 'BASKET') return parts.slice(1).map(n => parseInt(n))

        if (type === '0') return [0]
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

        // STANDARD CALL BETS
        if (type === 'VOISINS') return VOISINS_NUMBERS
        if (type === 'TIERS') return TIERS_NUMBERS
        if (type === 'ORPHELINS') return ORPHELINS_NUMBERS
        if (type === 'ZERO') return ZERO_NUMBERS

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
        return stack.reverse()
    }

    const renderChip = (betId) => {
        const amount = bets[betId]
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

    // Helper: Check if a system is fully active (all component bets are placed)
    const checkSystemActive = (sysId) => {
        let requiredBets = []
        // Row 1
        if (sysId === 'ZERO') requiredBets = getJeuZeroBets()
        if (sysId === 'VOISINS') requiredBets = getVoisinsBets()
        if (sysId === 'ORPHELINS') requiredBets = getOrphelinsBets()
        if (sysId === 'TIERS') requiredBets = getTiersBets()
        // Row 2
        if (sysId === 'NUCLEO_26') requiredBets = getNucleo26Bets()
        if (sysId === 'VECINOS_26') requiredBets = getVoisinsBets()
        if (sysId === 'HUERFANOS_26') requiredBets = getOrphelinsBets()
        if (sysId === 'TERCIO_26') requiredBets = getTiersBets()

        // Row 3
        if (sysId === 'NUCLEO_23') requiredBets = getNucleo23Bets()
        if (sysId === 'VECINOS_23') requiredBets = getVecinos23Bets()
        if (sysId === 'HUERFANOS_23') requiredBets = getHuerfanos23Bets()
        if (sysId === 'TERCIO_23') requiredBets = getTercio23Bets()

        // Row 4
        if (sysId === 'NUCLEO_10') requiredBets = getNucleo10Bets()
        if (sysId === 'VECINOS_10') requiredBets = getVecinos10Bets()
        if (sysId === 'HUERFANOS_10') requiredBets = getHuerfanos10Bets()
        if (sysId === 'TERCIO_10') requiredBets = getTercio10Bets()

        if (requiredBets.length === 0) return false

        // Strict Check: ALL required bets must have chips > 0
        return requiredBets.every(id => bets[id] && bets[id] > 0)
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
            if (type === 'VOISINS') onBatchBet(getVoisinsBets())
            if (type === 'TIERS') onBatchBet(getTiersBets())
            if (type === 'ORPHELINS') onBatchBet(getOrphelinsBets())
            if (type === 'ZERO') onBatchBet(getJeuZeroBets())

            // SYSTEM 26 HANDLERS (Call same helpers)
            if (type === 'NUCLEO_26') onBatchBet(getNucleo26Bets())
            if (type === 'VECINOS_26') onBatchBet(getVoisinsBets())
            if (type === 'HUERFANOS_26') onBatchBet(getOrphelinsBets())
            if (type === 'TERCIO_26') onBatchBet(getTiersBets())

            // SYSTEM 23 HANDLERS
            if (type === 'NUCLEO_23') onBatchBet(getNucleo23Bets())
            if (type === 'VECINOS_23') onBatchBet(getVecinos23Bets())
            if (type === 'HUERFANOS_23') onBatchBet(getHuerfanos23Bets())
            if (type === 'TERCIO_23') onBatchBet(getTercio23Bets())

            // SYSTEM 10 HANDLERS
            if (type === 'NUCLEO_10') onBatchBet(getNucleo10Bets())
            if (type === 'VECINOS_10') onBatchBet(getVecinos10Bets())
            if (type === 'HUERFANOS_10') onBatchBet(getHuerfanos10Bets())
            if (type === 'TERCIO_10') onBatchBet(getTercio10Bets())
        }
    }


    // --- EFFICIENCY HELPERS ---
    const EFFICIENCY_DATA = {
        row1: { 'ZERO': 0.57, 'VOISINS': 0.41, 'ORPHELINS': 0.63, 'TIERS': 0.50 },
        row2: { 'NUCLEO_26': 0.36, 'VECINOS_26': 0.41, 'HUERFANOS_26': 0.63, 'TERCIO_26': 0.50 },
        row3: { 'NUCLEO_23': 0.33, 'VECINOS_23': 0.60, 'HUERFANOS_23': 1.00, 'TERCIO_23': 0.50 },
        row4: { 'NUCLEO_10': 0.43, 'VECINOS_10': 0.50, 'HUERFANOS_10': 0.63, 'TERCIO_10': 0.41 }
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
            >
                {renderChip('TRIO_0_2_3')}
            </div>
        )
        spots.push(
            <div key="trio_0_1_2" className="hotspot corner"
                style={{ left: '0%', top: '66.66%', marginLeft: '-15px', marginTop: '-15px', width: '30px', height: '30px', position: 'absolute', zIndex: 200, borderRadius: '50%' }}
                onClick={(e) => { e.stopPropagation(); handleBet('TRIO_0_1_2') }}
                onMouseEnter={() => setHoveredBet('TRIO_0_1_2')} onMouseLeave={() => setHoveredBet(null)} title="Trio 0-1-2"
            >
                {renderChip('TRIO_0_1_2')}
            </div>
        )
        spots.push(
            <div key="basket_0_1_2_3" className="hotspot corner"
                style={{ left: '0%', top: '0%', marginLeft: '-15px', marginTop: '-15px', width: '30px', height: '30px', position: 'absolute', zIndex: 200, borderRadius: '50%' }}
                onClick={(e) => { e.stopPropagation(); handleBet('BASKET_0_1_2_3') }}
                onMouseEnter={() => setHoveredBet('BASKET_0_1_2_3')} onMouseLeave={() => setHoveredBet(null)} title="Basket 0-1-2-3"
            >
                {renderChip('BASKET_0_1_2_3')}
            </div>
        )

        // 1. VERTICAL
        for (let c = 0; c < 11; c++) {
            for (let r = 0; r < 3; r++) {
                const n1 = getNum(r, c)
                const n2 = getNum(r, c + 1)
                if (n1 !== undefined && n2 !== undefined) {
                    const id = `SPLIT_${n1}_${n2}`
                    spots.push(
                        <div key={`vsplit_${n1}_${n2}`} className="hotspot v-split"
                            style={{ left: `${((c + 1) / 12) * 100}%`, top: `${(r / 3) * 100}%`, marginLeft: '-10px', width: '20px', height: '33.33%', position: 'absolute', zIndex: 100 }}
                            onClick={(e) => { e.stopPropagation(); handleBet(id) }}
                            onMouseEnter={() => setHoveredBet(id)} onMouseLeave={() => setHoveredBet(null)}
                            title={`Split ${n1}-${n2}`}
                        >{renderChip(id)}</div>
                    )
                }
            }
        }

        // 2. CORNERS
        for (let c = 0; c < 11; c++) {
            for (let r = 0; r < 2; r++) {
                const n1 = getNum(r, c); const n2 = getNum(r, c + 1); const n3 = getNum(r + 1, c); const n4 = getNum(r + 1, c + 1)
                if (n1 && n2 && n3 && n4) {
                    const id = `CORNER_${n1}_${n2}_${n3}_${n4}`
                    spots.push(
                        <div key={`corner_${n1}_${n4}`} className="hotspot corner"
                            style={{ left: `${((c + 1) / 12) * 100}%`, top: `${((r + 1) / 3) * 100}%`, marginLeft: '-15px', marginTop: '-15px', width: '30px', height: '30px', position: 'absolute', zIndex: 2000, borderRadius: '50%' }}
                            onClick={(e) => { e.stopPropagation(); handleBet(id) }}
                            onMouseEnter={() => setHoveredBet(id)} onMouseLeave={() => setHoveredBet(null)}
                            title={`Corner ${n1}-${n4}`}
                        >{renderChip(id)}</div>
                    )
                }
            }
        }

        // 3. HORIZONTAL
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 12; c++) {
                const n1 = getNum(r, c); const n2 = getNum(r + 1, c)
                if (n1 && n2) {
                    const id = `SPLIT_${n1}_${n2}`
                    spots.push(
                        <div key={`hsplit_${n1}_${n2}`} className="hotspot h-split"
                            style={{ left: `${(c / 12) * 100}%`, top: `${((r + 1) / 3) * 100}%`, marginTop: '-10px', width: '8.33%', height: '20px', position: 'absolute', zIndex: 100 }}
                            onClick={(e) => { e.stopPropagation(); handleBet(id) }}
                            onMouseEnter={() => setHoveredBet(id)} onMouseLeave={() => setHoveredBet(null)}
                            title={`Split ${n1}-${n2}`}
                        >{renderChip(id)}</div>
                    )
                }
            }
        }

        // 3. STREETS & LINES
        for (let c = 0; c < 12; c++) {
            const nTop = getNum(0, c); const nBot = getNum(2, c)
            if (nBot && nTop) {
                const streetId = `STREET_${nBot}`
                spots.push(
                    <div key={`street_${streetId}`} className="hotspot street"
                        style={{ gridColumn: `${c + 1} / span 1`, gridRow: '1 / span 1', top: '-15px', height: '35px', width: '60%', left: '20%', position: 'absolute', zIndex: 90 }}
                        onClick={(e) => { e.stopPropagation(); handleBet(streetId) }}
                        onMouseEnter={() => setHoveredBet(streetId)} onMouseLeave={() => setHoveredBet(null)}
                        title={`Street ${nBot}-${nTop}`}
                    >{renderChip(streetId)}</div>
                )
                if (c < 11) {
                    const nextBot = getNum(2, c + 1)
                    // LINE_N donde N es el primer número de la seisena (1, 4, 7, 10... para las 11 líneas posibles)
                    const lineId = `LINE_${nBot}`
                    if (nextBot) {
                        spots.push(
                            <div key={`line_${lineId}_${nextBot}`} className="hotspot six-line"
                                style={{ left: `${((c + 1) / 12) * 100}%`, top: '0', marginTop: '-20px', marginLeft: '-20px', height: '35px', width: '35px', position: 'absolute', zIndex: 2000, borderRadius: '50%' }}
                                onClick={(e) => { e.stopPropagation(); handleBet(lineId) }}
                                onMouseEnter={() => setHoveredBet(lineId)} onMouseLeave={() => setHoveredBet(null)}
                                title={`Line ${nBot}-${nBot + 5}`}
                            >{renderChip(lineId)}</div>
                        )
                    }
                }
            }
        }

        return spots
    }

    return (
        <div className="board-container">
            <div className="betting-grid">

                {/* 1. ZERO */}
                <div
                    className={`grid-cell zero-cell green ${coveredNumbers.includes(0) ? 'highlight-preview' : ''} ${lastWin === 0 ? 'highlight-win' : ''}`}
                    onClick={() => handleBet('NUMBER', 0)}
                    onMouseEnter={() => setHoveredBet('0')}
                    onMouseLeave={() => setHoveredBet(null)}
                >
                    0
                    {renderChip('0')}
                </div>

                {/* 2. NUMBERS 1-36 */}
                <div className="numbers-block" style={{ position: 'relative' }}>
                    {NUMBERS.map(num => {
                        const isCovered = coveredNumbers.includes(num);
                        const isSystem26 = hoveredBet && hoveredBet.includes('26');
                        const isSystem23 = hoveredBet && hoveredBet.includes('23');
                        const isSystem10 = hoveredBet && hoveredBet.includes('10');

                        let highlightClass = 'highlight-preview';
                        if (isSystem26) highlightClass = 'highlight-preview-gold';
                        if (isSystem23) highlightClass = 'highlight-preview-orange';
                        if (isSystem10) highlightClass = 'highlight-preview-red';

                        return (
                            <div key={num}
                                className={`grid-cell number-cell ${getNumberColor(num)} ${lastWin === num ? 'highlight-win' : ''} ${isCovered ? highlightClass : ''}`}
                                onClick={() => handleBet('NUMBER', num)}
                                onMouseEnter={() => setHoveredBet(num.toString())} onMouseLeave={() => setHoveredBet(null)}
                            >
                                {num}
                                {renderChip(num.toString())}
                            </div>
                        )
                    })}
                    {renderHotspots()}
                </div>

                {/* 3. COLUMNS */}
                <div className="columns-block">
                    <div className={getClass('COL3', "grid-cell rect-cell column-cell")}
                        onClick={() => handleBet('COL3')} onMouseEnter={() => setHoveredBet('COL3')} onMouseLeave={() => setHoveredBet(null)}
                    >
                        <span className="payout-text">2 to 1</span>
                        <span className="col-label">3rd Col</span>
                        {renderChip('COL3')}
                    </div>
                    <div className={getClass('COL2', "grid-cell rect-cell column-cell")}
                        onClick={() => handleBet('COL2')} onMouseEnter={() => setHoveredBet('COL2')} onMouseLeave={() => setHoveredBet(null)}
                    >
                        <span className="payout-text">2 to 1</span>
                        <span className="col-label">2nd Col</span>
                        {renderChip('COL2')}
                    </div>
                    <div className={getClass('COL1', "grid-cell rect-cell column-cell")}
                        onClick={() => handleBet('COL1')} onMouseEnter={() => setHoveredBet('COL1')} onMouseLeave={() => setHoveredBet(null)}
                    >
                        <span className="payout-text">2 to 1</span>
                        <span className="col-label">1st Col</span>
                        {renderChip('COL1')}
                    </div>
                </div>

                {/* 4. DOZENS */}
                <div className="outside-row dozens-row">
                    <div className={getClass('DOZ1', "grid-cell rect-cell")}
                        onClick={() => handleBet('DOZ1')} onMouseEnter={() => setHoveredBet('DOZ1')} onMouseLeave={() => setHoveredBet(null)}
                    >
                        1st 12 {renderChip('DOZ1')}
                    </div>
                    <div className={getClass('DOZ2', "grid-cell rect-cell")}
                        onClick={() => handleBet('DOZ2')} onMouseEnter={() => setHoveredBet('DOZ2')} onMouseLeave={() => setHoveredBet(null)}
                    >
                        2nd 12 {renderChip('DOZ2')}
                    </div>
                    <div className={getClass('DOZ3', "grid-cell rect-cell")}
                        onClick={() => handleBet('DOZ3')} onMouseEnter={() => setHoveredBet('DOZ3')} onMouseLeave={() => setHoveredBet(null)}
                    >
                        3rd 12 {renderChip('DOZ3')}
                    </div>
                </div>

                {/* 5. EVEN CHANCES (Justo Debajo de Docenas) */}
                <div className="outside-row simple-row">
                    {/* Bajo Docena 1: BAJOS y PAR */}
                    <div className={getClass('LOW', "grid-cell rect-cell")}
                        onClick={() => handleBet('LOW')} onMouseEnter={() => setHoveredBet('LOW')} onMouseLeave={() => setHoveredBet(null)}
                    >
                        BAJOS {renderChip('LOW')}
                    </div>
                    <div className={getClass('EVEN', "grid-cell rect-cell")}
                        onClick={() => handleBet('EVEN')} onMouseEnter={() => setHoveredBet('EVEN')} onMouseLeave={() => setHoveredBet(null)}
                    >
                        PAR {renderChip('EVEN')}
                    </div>

                    {/* Bajo Docena 2: ROJO y NEGRO */}
                    <div className={getClass('RED', "grid-cell rect-cell")}
                        onClick={() => handleBet('RED')} onMouseEnter={() => setHoveredBet('RED')} onMouseLeave={() => setHoveredBet(null)}
                        style={{ background: '#d32f2f', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}
                    >
                        ROJO {renderChip('RED')}
                    </div>
                    <div className={getClass('BLACK', "grid-cell rect-cell")}
                        onClick={() => handleBet('BLACK')} onMouseEnter={() => setHoveredBet('BLACK')} onMouseLeave={() => setHoveredBet(null)}
                        style={{ background: '#000', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid #444' }}
                    >
                        NEGRO {renderChip('BLACK')}
                    </div>

                    {/* Bajo Docena 3: IMPAR y ALTOS */}
                    <div className={getClass('ODD', "grid-cell rect-cell")}
                        onClick={() => handleBet('ODD')} onMouseEnter={() => setHoveredBet('ODD')} onMouseLeave={() => setHoveredBet(null)}
                    >
                        IMPAR {renderChip('ODD')}
                    </div>
                    <div className={getClass('HIGH', "grid-cell rect-cell")}
                        onClick={() => handleBet('HIGH')} onMouseEnter={() => setHoveredBet('HIGH')} onMouseLeave={() => setHoveredBet(null)}
                    >
                        ALTOS {renderChip('HIGH')}
                    </div>
                </div>



                {/* EXTRA ROW 2: NUCLEO 26 + SYSTEM 26 */}








                {/* EXTRA ROW 3: SYSTEM 23 (Orange) */}


                {/* EXTRA ROW 4: SYSTEM 10 (Red/Cyan) - Red Neon selected */}










            </div>
        </div>
    )
}

// PropTypes for type safety and documentation
BettingBoard.propTypes = {
    /** Current bets object - map of betId to amount */
    bets: PropTypes.object.isRequired,
    /** Handler for placing a single bet */
    onPlaceBet: PropTypes.func.isRequired,
    /** Handler for placing batch bets (systems) */
    onBatchBet: PropTypes.func,
    /** Last winning number for highlighting */
    lastWin: PropTypes.number,
    /** Callback for hover highlights on wheel */
    onHoverNumbers: PropTypes.func,
    /** Number history for statistics */
    history: PropTypes.arrayOf(PropTypes.number),
    /** Whether to show efficiency metrics */
    showEfficiency: PropTypes.bool,
    /** Toggle efficiency metrics */
    setShowEfficiency: PropTypes.func,
    /** Whether active bets panel is visible */
    showActiveBets: PropTypes.bool,
    /** Toggle active bets panel */
    setShowActiveBets: PropTypes.func,
    /** Handler for neighbor bets */
    onNeighborBet: PropTypes.func
}

BettingBoard.defaultProps = {
    bets: {},
    onBatchBet: null,
    lastWin: null,
    onHoverNumbers: null,
    history: [],
    showEfficiency: false,
    setShowEfficiency: null,
    showActiveBets: false,
    setShowActiveBets: null,
    onNeighborBet: null
}
