import React from 'react'
import './BettingBoard.css'

const NUMBERS = [
    // Row 3 (Top)
    3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36,
    // Row 2 (Mid)
    2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35,
    // Row 1 (Bot)
    1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
]

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

// --- CALL BET DEFINITIONS (Moved from Racetrack) ---
const VOISINS_NUMBERS = [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25]
const TIERS_NUMBERS = [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33]
const ORPHELINS_NUMBERS = [1, 20, 14, 31, 9, 17, 34, 6]
const ZERO_NUMBERS = [12, 35, 3, 26, 0, 32, 15]

const getVoisinsBets = () => [
    'TRIO_0_2_3', 'TRIO_0_2_3', 'SPLIT_4_7', 'SPLIT_12_15',
    'SPLIT_18_21', 'SPLIT_19_22', 'CORNER_25_26_28_29', 'CORNER_25_26_28_29', 'SPLIT_32_35'
]
const getTiersBets = () => [
    'SPLIT_5_8', 'SPLIT_10_11', 'SPLIT_13_16', 'SPLIT_23_24', 'SPLIT_27_30', 'SPLIT_33_36'
]
const getOrphelinsBets = () => [
    '1', 'SPLIT_6_9', 'SPLIT_14_17', 'SPLIT_17_20', 'SPLIT_31_34'
]
const getJeuZeroBets = () => [
    'SPLIT_0_3', 'SPLIT_12_15', 'SPLIT_32_35', '26'
]

export const BettingBoard = ({ bets, onPlaceBet, onBatchBet, lastWin, onHoverNumbers }) => {
    console.log("DEBUG: BettingBoard Render. Bets:", bets) // DEBUG TRIGGER

    // State for hover effects
    const [hoveredBet, setHoveredBet] = React.useState(null)

    // Helper: Determine which numbers are covered by a bet ID
    const getCoveredNumbers = (betId) => {
        if (!betId) return []

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

        // NEW CALL BETS
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

    const renderChip = (betId) => {
        const amount = bets[betId]
        if (!amount) return null
        return <div className="board-chip">{amount}</div>
    }

    const checkWin = (betId) => {
        if (lastWin === null || lastWin === undefined) return false
        if (betId === '0') return lastWin === 0

        const covered = getCoveredNumbers(betId)
        return covered.includes(lastWin)
    }

    const getClass = (betId, baseClass) => {
        const isHovered = hoveredBet === betId;
        const isWin = checkWin(betId);
        return `${baseClass} ${isHovered ? 'highlight-preview' : ''} ${isWin ? 'highlight-win' : ''}`.trim()
    }

    const handleBet = (betId) => {
        if (onPlaceBet) onPlaceBet(betId.toString())
    }

    const handleCallBet = (type) => {
        if (onBatchBet) {
            if (type === 'VOISINS') onBatchBet(getVoisinsBets())
            if (type === 'TIERS') onBatchBet(getTiersBets())
            if (type === 'ORPHELINS') onBatchBet(getOrphelinsBets())
            if (type === 'ZERO') onBatchBet(getJeuZeroBets())
        }
    }



    const coveredNumbers = React.useMemo(() => getCoveredNumbers(hoveredBet), [hoveredBet])

    // --- HOTSPOT GENERATION ---
    const renderHotspots = () => {
        const spots = []

        const getNum = (r, c) => {
            const index = (r * 12) + c
            return NUMBERS[index]
        }

        // 0. ZERO SPECIALS (Left Edge)
        // A. Splits with Zero (0-3, 0-2, 0-1)
        // Row 0 (Top) is 3 -> Split 0-3
        // Row 1 (Mid) is 2 -> Split 0-2
        // Row 2 (Bot) is 1 -> Split 0-1
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
                        left: '0%',
                        top: `${(r / 3) * 100}%`,
                        marginLeft: '-10px',
                        width: '20px',
                        height: '33.33%',
                        position: 'absolute',
                        zIndex: 100
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

        // B. Trios (0-2-3, 0-1-2)
        // Intersection Row 0/1 -> 0-2-3
        // Intersection Row 1/2 -> 0-1-2
        spots.push(
            <div
                key="trio_0_2_3"
                className="hotspot corner"
                style={{
                    left: '0%', top: '33.33%',
                    marginLeft: '-15px', marginTop: '-15px',
                    width: '30px', height: '30px',
                    position: 'absolute', zIndex: 200, borderRadius: '50%'
                }}
                onClick={(e) => { e.stopPropagation(); handleBet('TRIO_0_2_3') }}
                onMouseEnter={() => setHoveredBet('TRIO_0_2_3')}
                onMouseLeave={() => setHoveredBet(null)}
                title="Trio 0-2-3"
            >
                {renderChip('TRIO_0_2_3')}
            </div>
        )
        spots.push(
            <div
                key="trio_0_1_2"
                className="hotspot corner"
                style={{
                    left: '0%', top: '66.66%',
                    marginLeft: '-15px', marginTop: '-15px',
                    width: '30px', height: '30px',
                    position: 'absolute', zIndex: 200, borderRadius: '50%'
                }}
                onClick={(e) => { e.stopPropagation(); handleBet('TRIO_0_1_2') }}
                onMouseEnter={() => setHoveredBet('TRIO_0_1_2')}
                onMouseLeave={() => setHoveredBet(null)}
                title="Trio 0-1-2"
            >
                {renderChip('TRIO_0_1_2')}
            </div>
        )

        // C. Basket / First Four (0-1-2-3)
        // Usually placed at the corner of 0 and 1 (bottom left) or 0 and 3 (top left).
        // Let's place it at Top Left (corner of 0 and 3) as "Basket".
        spots.push(
            <div
                key="basket_0_1_2_3"
                className="hotspot corner"
                style={{
                    left: '0%', top: '0%',
                    marginLeft: '-15px', marginTop: '-15px',
                    width: '30px', height: '30px',
                    position: 'absolute', zIndex: 200, borderRadius: '50%'
                }}
                onClick={(e) => { e.stopPropagation(); handleBet('BASKET_0_1_2_3') }}
                onMouseEnter={() => setHoveredBet('BASKET_0_1_2_3')}
                onMouseLeave={() => setHoveredBet(null)}
                title="Basket 0-1-2-3"
            >
                {renderChip('BASKET_0_1_2_3')}
            </div>
        )

        // 1. VERTICAL SPLITS
        for (let c = 0; c < 11; c++) {
            for (let r = 0; r < 3; r++) {
                const n1 = getNum(r, c)
                const n2 = getNum(r, c + 1)
                if (n1 !== undefined && n2 !== undefined) {
                    const id = `SPLIT_${n1}_${n2}`
                    const leftPct = ((c + 1) / 12) * 100
                    const topPct = (r / 3) * 100
                    spots.push(
                        <div
                            key={`vsplit_${n1}_${n2}`}
                            className="hotspot v-split"
                            style={{
                                left: `${leftPct}%`,
                                top: `${topPct}%`,
                                marginLeft: '-10px',
                                width: '20px',
                                height: '33.33%',
                                position: 'absolute',
                                zIndex: 100
                            }}
                            onClick={(e) => { e.stopPropagation(); handleBet(id) }}
                            onMouseEnter={() => setHoveredBet(id)}
                            onMouseLeave={() => setHoveredBet(null)}
                            title={`Split ${n1}-${n2}`}
                        >
                            {renderChip(id)}
                        </div>
                    )
                }
            }
        }

        // 2. CORNERS
        for (let c = 0; c < 11; c++) {
            for (let r = 0; r < 2; r++) {
                const n1 = getNum(r, c)
                const n2 = getNum(r, c + 1)
                const n3 = getNum(r + 1, c)
                const n4 = getNum(r + 1, c + 1)
                if (n1 && n2 && n3 && n4) {
                    const id = `CORNER_${n1}_${n2}_${n3}_${n4}`
                    const leftPct = ((c + 1) / 12) * 100
                    const topPct = ((r + 1) / 3) * 100
                    spots.push(
                        <div
                            key={`corner_${n1}_${n4}`}
                            className="hotspot corner"
                            style={{
                                left: `${leftPct}%`,
                                top: `${topPct}%`,
                                marginLeft: '-15px',
                                marginTop: '-15px',
                                width: '30px',
                                height: '30px',
                                position: 'absolute',
                                zIndex: 2000,
                                borderRadius: '50%'
                            }}
                            onClick={(e) => { e.stopPropagation(); handleBet(id) }}
                            onMouseEnter={() => setHoveredBet(id)}
                            onMouseLeave={() => setHoveredBet(null)}
                            title={`Corner ${n1}-${n2}-${n3}-${n4}`}
                        >
                            {renderChip(id)}
                        </div>
                    )
                }
            }
        }

        // 3. HORIZONTAL SPLITS
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 12; c++) {
                const n1 = getNum(r, c)
                const n2 = getNum(r + 1, c)
                if (n1 && n2) {
                    const id = `SPLIT_${n1}_${n2}`
                    const leftPct = (c / 12) * 100
                    const topPct = ((r + 1) / 3) * 100
                    spots.push(
                        <div
                            key={`hsplit_${n1}_${n2}`}
                            className="hotspot h-split"
                            style={{
                                left: `${leftPct}%`,
                                top: `${topPct}%`,
                                marginTop: '-10px',
                                width: '8.33%',
                                height: '20px',
                                position: 'absolute',
                                zIndex: 100
                            }}
                            onClick={(e) => { e.stopPropagation(); handleBet(id) }}
                            onMouseEnter={() => setHoveredBet(id)}
                            onMouseLeave={() => setHoveredBet(null)}
                            title={`Split ${n1}-${n2}`}
                        >
                            {renderChip(id)}
                        </div>
                    )
                }
            }
        }

        // 3. STREETS & LINES
        for (let c = 0; c < 12; c++) {
            const nTop = getNum(0, c)
            const nBot = getNum(2, c)
            if (nBot && nTop) {
                const streetId = `STREET_${nBot}`
                spots.push(
                    <div
                        key={`street_${streetId}`}
                        className="hotspot street"
                        style={{
                            gridColumn: `${c + 1} / span 1`,
                            gridRow: '1 / span 1',
                            top: '-15px',
                            height: '35px',
                            width: '60%',
                            left: '20%',
                            position: 'absolute',
                            zIndex: 90,
                        }}
                        onClick={(e) => { e.stopPropagation(); handleBet(streetId) }}
                        onMouseEnter={() => setHoveredBet(streetId)}
                        onMouseLeave={() => setHoveredBet(null)}
                        title={`Street ${nBot}-${nTop}`}
                    >
                        {renderChip(streetId)}
                    </div>
                )

                // 4. SIX LINES
                if (c < 11) {
                    const nextBot = getNum(2, c + 1)
                    const lineId = `LINE_${nBot}_${nextBot}`
                    if (nextBot) {
                        const leftPct = ((c + 1) / 12) * 100
                        spots.push(
                            <div
                                key={`line_${lineId}`}
                                className="hotspot six-line"
                                style={{
                                    left: `${leftPct}%`,
                                    top: '0',
                                    marginTop: '-20px',
                                    marginLeft: '-20px',
                                    height: '35px',
                                    width: '35px',
                                    position: 'absolute',
                                    zIndex: 2000,
                                    borderRadius: '50%'
                                }}
                                onClick={(e) => { e.stopPropagation(); handleBet(lineId) }}
                                onMouseEnter={() => setHoveredBet(lineId)}
                                onMouseLeave={() => setHoveredBet(null)}
                                title={`Line ${nBot}-${nextBot}`}
                            >
                                {renderChip(lineId)}
                            </div>
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
                    onClick={() => handleBet('0')}
                    onMouseEnter={() => setHoveredBet('0')}
                    onMouseLeave={() => setHoveredBet(null)}
                >
                    0
                    {renderChip('0')}
                </div>

                {/* 1.5 CALL BETS (NEW ROW ABOVE NUMBERS) */}
                <div className="call-bets-row">
                    <div className={getClass('ZERO', "grid-cell rect-cell")}
                        onClick={() => handleCallBet('ZERO')}
                        onMouseEnter={() => setHoveredBet('ZERO')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        ZERO (Juego 0)
                    </div>
                    <div className={getClass('VOISINS', "grid-cell rect-cell")}
                        onClick={() => handleCallBet('VOISINS')}
                        onMouseEnter={() => setHoveredBet('VOISINS')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        VOISINS (Vecinos)
                    </div>
                    <div className={getClass('ORPHELINS', "grid-cell rect-cell")}
                        onClick={() => handleCallBet('ORPHELINS')}
                        onMouseEnter={() => setHoveredBet('ORPHELINS')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        ORPH (Huérfanos)
                    </div>
                    <div className={getClass('TIERS', "grid-cell rect-cell")}
                        onClick={() => handleCallBet('TIERS')}
                        onMouseEnter={() => setHoveredBet('TIERS')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        TIERS (Tercio)
                    </div>
                </div>

                {/* 2. NUMBERS 1-36 */}
                <div className="numbers-block" style={{ position: 'relative' }}>
                    {NUMBERS.map(num => {
                        const isCovered = coveredNumbers.includes(num);
                        return (
                            <div
                                key={num}
                                className={`grid-cell number-cell ${getNumberColor(num)} ${lastWin === num ? 'highlight-win' : ''} ${isCovered ? 'highlight-preview' : ''}`}
                                onClick={() => handleBet(num)}
                                onMouseEnter={() => setHoveredBet(num.toString())}
                                onMouseLeave={() => setHoveredBet(null)}
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
                        onClick={() => handleBet('COL3')}
                        onMouseEnter={() => setHoveredBet('COL3')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        <span className="payout-text">2 to 1</span>
                        <span className="col-label">3rd Col</span>
                        {renderChip('COL3')}
                    </div>
                    <div className={getClass('COL2', "grid-cell rect-cell column-cell")}
                        onClick={() => handleBet('COL2')}
                        onMouseEnter={() => setHoveredBet('COL2')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        <span className="payout-text">2 to 1</span>
                        <span className="col-label">2nd Col</span>
                        {renderChip('COL2')}
                    </div>
                    <div className={getClass('COL1', "grid-cell rect-cell column-cell")}
                        onClick={() => handleBet('COL1')}
                        onMouseEnter={() => setHoveredBet('COL1')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        <span className="payout-text">2 to 1</span>
                        <span className="col-label">1st Col</span>
                        {renderChip('COL1')}
                    </div>
                </div>

                {/* 4. DOZENS */}
                <div className="outside-row dozens-row">
                    <div className={getClass('DOZ1', "grid-cell rect-cell")}
                        onClick={() => handleBet('DOZ1')}
                        onMouseEnter={() => setHoveredBet('DOZ1')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        1st 12 {renderChip('DOZ1')}
                    </div>
                    <div className={getClass('DOZ2', "grid-cell rect-cell")}
                        onClick={() => handleBet('DOZ2')}
                        onMouseEnter={() => setHoveredBet('DOZ2')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        2nd 12 {renderChip('DOZ2')}
                    </div>
                    <div className={getClass('DOZ3', "grid-cell rect-cell")}
                        onClick={() => handleBet('DOZ3')}
                        onMouseEnter={() => setHoveredBet('DOZ3')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        3rd 12 {renderChip('DOZ3')}
                    </div>
                </div>

                {/* 5. EVEN/ODD/COLORS */}
                <div className="outside-row simple-row">
                    <div className={getClass('LOW', "grid-cell rect-cell")}
                        onClick={() => handleBet('LOW')}
                        onMouseEnter={() => setHoveredBet('LOW')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        1-18 {renderChip('LOW')}
                    </div>
                    <div className={getClass('EVEN', "grid-cell rect-cell")}
                        onClick={() => handleBet('EVEN')}
                        onMouseEnter={() => setHoveredBet('EVEN')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        PAR {renderChip('EVEN')}
                    </div>
                    <div className={getClass('RED', "grid-cell rect-cell red-diamond")}
                        onClick={() => handleBet('RED')}
                        onMouseEnter={() => setHoveredBet('RED')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        <div className="diamond-shape red"></div> {renderChip('RED')}
                    </div>
                    <div className={getClass('BLACK', "grid-cell rect-cell black-diamond")}
                        onClick={() => handleBet('BLACK')}
                        onMouseEnter={() => setHoveredBet('BLACK')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        <div className="diamond-shape black"></div> {renderChip('BLACK')}
                    </div>
                    <div className={getClass('ODD', "grid-cell rect-cell")}
                        onClick={() => handleBet('ODD')}
                        onMouseEnter={() => setHoveredBet('ODD')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        IMPAR {renderChip('ODD')}
                    </div>
                    <div className={getClass('HIGH', "grid-cell rect-cell")}
                        onClick={() => handleBet('HIGH')}
                        onMouseEnter={() => setHoveredBet('HIGH')}
                        onMouseLeave={() => setHoveredBet(null)}
                    >
                        19-36 {renderChip('HIGH')}
                    </div>
                </div>
            </div>
        </div>
    )
}
