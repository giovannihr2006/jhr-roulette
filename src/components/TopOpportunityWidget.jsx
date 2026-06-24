import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { ALL_SPLITS, ALL_STREETS, ALL_CORNERS, ALL_LINES } from '../logic/RouletteUtils'
import JustificationModal from './JustificationModal';
import { ELEMENT_DESCRIPTIONS } from '../config/ElementDescriptions';
import { ForensicBadge } from './ForensicBadge';

const EMPTY_ARRAY = [];

export const TopOpportunityWidget = ({ onBet, placedNumbers = [] }) => {
    const [showJustification, setShowJustification] = useState(false);
    const history = useFinancialStore(state => state.numberHistory || EMPTY_ARRAY);
    const baseWaitThreshold = useFinancialStore(state => state.baseWaitThreshold || 300);

    // --- FORENSIC OPTIMIZATION ALGORITHM ---
    const optimizeBets = (targetNums) => {
        if (!targetNums || targetNums.length === 0) return [];

        let remaining = new Set(targetNums.map(n => parseInt(n)));
        const finalBetIds = [];

        // Helper to check if a bet's numbers are fully contained in remaining
        const canUseBet = (betNums) => {
            return betNums.every(n => remaining.has(n));
        }

        // Helper to remove covered numbers
        const consume = (betNums) => {
            betNums.forEach(n => remaining.delete(n));
        }

        // 1. LINES (6 numbers)
        ALL_LINES.forEach(line => {
            if (canUseBet(line.numbers)) {
                finalBetIds.push(`LINE_${line.numbers[0]}_${line.numbers[3]}`); // Correct Hotspot ID
                consume(line.numbers);
            }
        });

        // 2. CORNERS (4 numbers)
        ALL_CORNERS.forEach(corner => {
            if (canUseBet(corner.numbers)) {
                // Ensure Canonical ID (sorted)
                const sorted = [...corner.numbers].sort((a, b) => a - b);
                finalBetIds.push(`CORNER_${sorted.join('_')}`);
                consume(corner.numbers);
            }
        });

        // 3. STREETS (3 numbers)
        ALL_STREETS.forEach(street => {
            if (canUseBet(street.numbers)) {
                // Check if it's a standard street or zero street
                if (street.numbers.length === 3) {
                    // Check special zero streets (0-1-2, 0-2-3) ID format
                    // RouletteUtils uses 'TRIO' for these?
                    // ALL_STREETS includes 0-1-2 and 0-2-3 at the end.
                    // Standard streets start at 1, 4, 7...
                    const start = street.numbers[0];
                    if (street.numbers.includes(0)) {
                        // It's a TRIO/BASKET variant, simplified as TRIO usually
                        // or just explicit STREET
                        // Let's use TRIO_A_B_C format if 0 is involved as per getCanonicalBetId
                        finalBetIds.push(`TRIO_${street.numbers.join('_')}`);
                    } else {
                        finalBetIds.push(`STREET_${start}`);
                    }
                    consume(street.numbers);
                }
            }
        });

        // 4. SPLITS (2 numbers)
        ALL_SPLITS.forEach(split => {
            if (canUseBet(split.numbers)) {
                const sorted = [...split.numbers].sort((a, b) => a - b);
                finalBetIds.push(`SPLIT_${sorted.join('_')}`);
                consume(split.numbers);
            }
        });

        // 5. REMAINING (Plenos)
        remaining.forEach(n => {
            finalBetIds.push(n.toString());
        });

        return finalBetIds;
    }

    const topOpportunity = useMemo(() => {
        try {
            if (!history || history.length === 0) return null
            if (!ALL_SPLITS || !ALL_STREETS) {
                console.warn("DEBUG: RouletteUtils not loaded yet")
                return null
            }

            const countMisses = (numbers) => {
                let misses = 0
                for (let i = history.length - 1; i >= 0; i--) {
                    if (numbers.includes(history[i])) return misses
                    misses++
                }
                return misses
            }

            const allOps = []

            // 1. Plenos (Straight Up)
            const tPleno = baseWaitThreshold
            for (let i = 0; i <= 36; i++) {
                const m = countMisses([i])
                allOps.push({
                    type: 'Pleno',
                    name: i.toString(),
                    misses: m,
                    limit: tPleno,
                    ratio: m / tPleno,
                    nums: [i],
                    id: i.toString()
                })
            }

            // 2. Medios (Splits)
            const tMedio = Math.round(baseWaitThreshold / 2)
            ALL_SPLITS.forEach(bet => {
                const m = countMisses(bet.numbers)
                const sorted = [...bet.numbers].sort((a, b) => a - b)
                allOps.push({
                    type: 'Medio',
                    name: bet.name.replace('Medio ', ''),
                    misses: m,
                    limit: tMedio,
                    ratio: m / tMedio,
                    nums: bet.numbers,
                    id: `SPLIT_${sorted.join('_')}`
                })
            })

            // 3. Calles (Streets)
            const tCalle = Math.round(baseWaitThreshold / 3)
            ALL_STREETS.forEach(bet => {
                const m = countMisses(bet.numbers)
                // Handle 0-1-2 and 0-2-3 special streets (TRIO in utils but STREET usually works if mapped)
                // Standard streets start at 1, 4, 7...
                // If it contains 0, treat as TRIO or special STREET
                const sorted = [...bet.numbers].sort((a, b) => a - b)
                let id = `STREET_${sorted[0]}`
                if (bet.numbers.includes(0)) {
                    id = `TRIO_${sorted.join('_')}`
                }
                allOps.push({
                    type: 'Calle',
                    name: bet.name.replace('Calle ', ''),
                    misses: m,
                    limit: tCalle,
                    ratio: m / tCalle,
                    nums: bet.numbers,
                    id: id
                })
            })

            // 4. Lineas
            const tLine = Math.round(baseWaitThreshold / 6)
            ALL_LINES.forEach(bet => {
                const m = countMisses(bet.numbers)
                const sorted = [...bet.numbers].sort((a, b) => a - b)
                allOps.push({
                    type: 'Linea',
                    name: bet.name.replace('Linea ', ''),
                    misses: m,
                    limit: tLine,
                    ratio: m / tLine,
                    nums: bet.numbers,
                    id: `LINE_${sorted[0]}_${sorted[3]}`
                })
            })

            // 5. Cuadros (Corners)
            const tCorner = Math.round(baseWaitThreshold / 4)
            ALL_CORNERS.forEach(bet => {
                const m = countMisses(bet.numbers)
                const sorted = [...bet.numbers].sort((a, b) => a - b)
                // Handle Basket 0-1-2-3
                let id = `CORNER_${sorted.join('_')}`
                if (bet.numbers.includes(0)) {
                    id = `BASKET_${sorted.join('_')}`
                }
                allOps.push({
                    type: 'Cuadro',
                    name: bet.name.replace('Cuadro ', ''),
                    misses: m,
                    limit: tCorner,
                    ratio: m / tCorner,
                    nums: bet.numbers,
                    id: id
                })
            })

            // --- FORENSIC GEOMETRY SCANNERS ---
            // (IDs are null for these, so optimizer handles them)
            const WHEEL = [
                0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
                10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
            ];

            const getSlice = (centerIdx, startOffset, endOffset) => {
                const nums = [];
                for (let offset = startOffset; offset <= endOffset; offset++) {
                    let idx = (centerIdx + offset) % 37;
                    if (idx < 0) idx += 37;
                    nums.push(WHEEL[idx]);
                }
                return nums;
            }

            // 6. NÚCLEOS (7 Vecinos: -4/+2)
            const tNucleo = Math.round(baseWaitThreshold / 7);
            for (let i = 0; i <= 36; i++) {
                const centerIdx = WHEEL.indexOf(i);
                const nums = getSlice(centerIdx, -4, 2);
                const m = countMisses(nums);
                allOps.push({ type: 'Núcleo', name: i.toString(), misses: m, limit: tNucleo, ratio: m / tNucleo, nums: nums, id: null });
            }

            // 7. VECINOS GLOBALES (17 Números: -9/+7)
            const tVecinos = Math.round(baseWaitThreshold / 17);
            for (let i = 0; i <= 36; i++) {
                const centerIdx = WHEEL.indexOf(i);
                const nums = getSlice(centerIdx, -9, 7);
                const m = countMisses(nums);
                allOps.push({ type: 'Vecinos', name: i.toString(), misses: m, limit: tVecinos, ratio: m / tVecinos, nums: nums, id: null });
            }

            // 8. TERCIOS GLOBALES (12 Números: +11 to +22 opposite)
            const tTiers = Math.round(baseWaitThreshold / 12);
            for (let i = 0; i <= 36; i++) {
                const centerIdx = WHEEL.indexOf(i);
                const nums = getSlice(centerIdx, 11, 22);
                const m = countMisses(nums);
                allOps.push({ type: 'Tercio', name: i.toString(), misses: m, limit: tTiers, ratio: m / tTiers, nums: nums, id: null });
            }

            // 9. HUÉRFANOS GLOBALES (8 Números: +8..10 & +23..27)
            const tOrph = Math.round(baseWaitThreshold / 8);
            for (let i = 0; i <= 36; i++) {
                const centerIdx = WHEEL.indexOf(i);
                const nums1 = getSlice(centerIdx, 8, 10);
                const nums2 = getSlice(centerIdx, 23, 27);
                const nums = [...nums1, ...nums2];
                const m = countMisses(nums);
                allOps.push({ type: 'Huérfanos', name: i.toString(), misses: m, limit: tOrph, ratio: m / tOrph, nums: nums, id: null });
            }

            // Sort by Ratio DESC and take top 1
            const sorted = allOps.sort((a, b) => b.ratio - a.ratio)
            return sorted.length > 0 ? sorted[0] : null

        } catch (err) {
            console.error("CRITICAL ERROR in TopOpportunityWidget:", err)
            return null
        }
    }, [history, baseWaitThreshold])

    const hasActiveBets = useMemo(() => {
        if (!topOpportunity || !topOpportunity.nums) return false;
        return topOpportunity.nums.some(n => placedNumbers.includes(n));
    }, [topOpportunity, placedNumbers]);

    // RENDER: Use "panel-tray-dark" to match other widgets
    const content = topOpportunity ? (
        <div
            className="panel-tray-dark"
            onClick={() => {
                if (onBet && topOpportunity.nums) {
                    if (topOpportunity.id) {
                        // STANDARD BET: Exact ID (Split, Street, etc.)
                        onBet([topOpportunity.id]);
                        // Also trigger visual feedback? managed by onBet usually
                    } else {
                        // FORENSIC OPTIMIZATION: Reduce chip cost using coverage logic for complex sectors
                        const optimizedIds = optimizeBets(topOpportunity.nums);
                        if (optimizedIds.length > 0) onBet(optimizedIds);
                    }
                }
            }}
            style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                cursor: onBet ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                background: hasActiveBets ? 'rgba(0, 255, 255, 0.15)' : 'rgba(20, 20, 20, 0.95)',
                border: hasActiveBets ? '1px solid rgba(0, 255, 255, 0.6)' : '1px solid #d4af37',
                boxShadow: hasActiveBets
                    ? '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)'
                    : '0 0 10px rgba(212, 175, 55, 0.2)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title="Click para apostar (Optimizado)"
        >
            {/* HEADER */}
            <div className="panel-tray-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'transparent' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <ForensicBadge id="opportunity" />
                    <span style={{ color: '#fff', letterSpacing: '1px' }}>MEJOR OPORTUNIDAD</span>
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                    title="Ver Justificación Forense (E6)"
                    style={{
                        width: '26px', height: '26px',
                        borderRadius: '50%',
                        border: '1px solid #d4af37',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', color: '#d4af37', background: 'rgba(20, 20, 20, 0.8)',
                        cursor: 'help',
                        transition: 'all 0.2s',
                        padding: 0,
                        boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.6)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 5px rgba(212, 175, 55, 0.3)'; }}
                >
                    ⚖
                </button>
            </div>

            {/* BODY - REFACTORED TO MATCH ALPHA WIDGET (3 COLUMNS) */}
            <div className="panel-tray-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', paddingBottom: '5px' }}>

                {/* MAIN ROW: [ WAIT ] [ NUMBER ] [ ACTION ] */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

                    {/* LEFT: WAIT COUNT (Aligned like SCORE) */}
                    <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>ESPERA</div>
                        <div style={{
                            fontWeight: 'bold', fontSize: '1.9rem', color: '#fff',
                            textShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
                            display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'center'
                        }}>
                            {topOpportunity.misses}<span style={{ color: '#777', fontSize: '1.2rem' }}>/{topOpportunity.limit}</span>
                        </div>
                    </div>

                    {/* CENTER: NUMBER & NAME */}
                    <div style={{ flex: 1.2, textAlign: 'center' }}>
                        <div style={{
                            fontSize: '4.5rem', fontWeight: '900', color: '#fff',
                            textShadow: '0 0 30px rgba(255, 215, 0, 0.9)',
                            lineHeight: '0.9', letterSpacing: '-2px'
                        }}>
                            {(() => {
                                const displayName = (topOpportunity.type === 'Pleno' ? '#' : '') + topOpportunity.name;
                                const isLong = displayName.length > 3; // MATCHED TO ALPHA WIDGET (>3)
                                return (
                                    <span style={{ fontSize: isLong ? '2.5rem' : '4.5rem', whiteSpace: 'nowrap' }}>
                                        {displayName}
                                    </span>
                                )
                            })()}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#ccc', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginTop: '5px' }}>
                            {topOpportunity.type}
                        </div>
                    </div>

                    {/* RIGHT: RATIO & ACTION (Aligned like ALPHA/ACTION) */}
                    <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>

                        {/* 1. RATIO VALUE (Matches Alpha Value Box) */}
                        <div style={{
                            textAlign: 'center', background: 'linear-gradient(135deg, #444, #222)',
                            color: (topOpportunity.ratio * 100) > 80 ? '#00C853' : '#ffd700',
                            padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.4rem',
                            border: `1px solid ${(topOpportunity.ratio * 100) > 80 ? '#00C853' : '#ffd700'}40`,
                            width: 'max-content'
                        }}>
                            {(topOpportunity.ratio * 100).toFixed(0)}%
                        </div>

                        {/* 2. UNIFIED ACTION BADGE */}
                        <div style={{
                            background: (topOpportunity.ratio * 100) > 80 ? '#00C853' : '#D32F2F',
                            color: 'white', fontWeight: '900', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.3)', width: 'max-content',
                            textTransform: 'uppercase',
                            animation: (topOpportunity.ratio * 100) > 80 ? 'flashText 1s infinite ease-in-out' : 'none'
                        }}>
                            {(topOpportunity.ratio * 100) > 80 ? 'ATAQUE' : 'ESPERA'}
                        </div>
                    </div>
                </div>

                {/* BOTTOM: REFERENCE TABLE (Full Width) */}
                <div style={{
                    width: '100%', background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px',
                    fontSize: '0.85rem', color: '#ddd', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', border: '1px solid #333', textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
                        <span style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '1rem' }}>&gt;80%</span>
                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>EXTREMO</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', borderLeft: '1px solid #444', borderRight: '1px solid #444' }}>
                        <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '1rem' }}>40-80%</span>
                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>TENSIÓN</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
                        <span style={{ color: '#00bfff', fontWeight: 'bold', fontSize: '1rem' }}>&lt;40%</span>
                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>ESTABLE</span>
                    </div>
                </div>
            </div>
        </div>

    ) : (
        <div className="panel-tray-dark" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
            <div className="panel-tray-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'transparent', width: '100%' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <ForensicBadge id="opportunity" />
                    <span style={{ color: '#fff', letterSpacing: '1px' }}>MEJOR OPORTUNIDAD</span>
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                    title="Ver Justificación Forense (E6)"
                    style={{
                        width: '26px', height: '26px',
                        borderRadius: '50%',
                        border: '1px solid #d4af37',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', color: '#d4af37', background: 'rgba(20, 20, 20, 0.8)',
                        cursor: 'help',
                        transition: 'all 0.2s',
                        padding: 0,
                        boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.6)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 5px rgba(212, 175, 55, 0.3)'; }}
                >
                    ⚖
                </button>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#666', fontSize: '1.2rem', fontStyle: 'italic' }}>
                    Escaneando...
                </div>
            </div>
        </div>
    );

    return (
        <>
            {content}
            {showJustification && <JustificationModal {...ELEMENT_DESCRIPTIONS[6]} onClose={() => setShowJustification(false)} />}
        </>
    );
};
