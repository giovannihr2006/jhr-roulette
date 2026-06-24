import React, { useMemo, useState } from 'react';
import { Z_LAYERS } from '../config/Theme';
import { optimizeBets, getBetType } from '../logic/RouletteUtils';
import { WHEEL_ORDER } from '../utils/rouletteUtils';
import { useForensicAnalysis } from '../hooks/useForensicAnalysis';


export const ChipEconomyModal = ({ onClose, onBet }) => {
    // STATE: Filters and Sorting
    const [sortConfig, setSortConfig] = useState({ key: 'tier', direction: 'asc' }); // tier asc = S first
    const [filterTier, setFilterTier] = useState('ALL'); // ALL, S, A, B


    // --- ANALYSIS ENGINE ---
    const analysisData = useMemo(() => {
        const rows = [];

        // Helper: Calculate Cost for a target slice
        const getOptimizationCost = (targetNums) => {
            const bets = optimizeBets(targetNums);
            const cost = bets.reduce((acc, id) => {
                const type = getBetType(id);
                // 5x Rule Logic
                return acc + (['SIMPLE', 'DOZEN'].includes(type) ? 5 : 1);
            }, 0);
            return cost;
        };

        // Analyze every number on the wheel as a Center
        for (let centerNum = 0; centerNum <= 36; centerNum++) {
            const centerIndex = WHEEL_ORDER.indexOf(centerNum);

            // 1. NUCLEO (Target 7 Numbers, Sym -3..3 approx)
            // We search for the BEST 7-number slice around this center
            let bestNCost = Infinity;

            // Search window: Shift symmetry by +/- 3 slots
            for (let shift = -3; shift <= 3; shift++) {
                const target = [];
                for (let i = -3 + shift; i <= 3 + shift; i++) {
                    let idx = (centerIndex + i) % 37;
                    if (idx < 0) idx += 37;
                    target.push(WHEEL_ORDER[idx]);
                }
                const cost = getOptimizationCost(target);
                if (cost < bestNCost) bestNCost = cost;
            }

            // 2. VECINOS (Target 17 Numbers, Sym -8..8 approx)
            let bestVCost = Infinity;
            for (let shift = -3; shift <= 3; shift++) {
                const target = [];
                for (let i = -8 + shift; i <= 8 + shift; i++) {
                    let idx = (centerIndex + i) % 37;
                    if (idx < 0) idx += 37;
                    target.push(WHEEL_ORDER[idx]);
                }
                const cost = getOptimizationCost(target);
                if (cost < bestVCost) bestVCost = cost;
            }

            // 3. TERCIOS (Target 12 Numbers, Opposite Sector approx -6 to +6 relative to antipode? No, Tiers is approx 1/3 wheel)
            // Tiers is usually defined as the sector opposite to Zero (Nucleo).
            // In our dynamic model, Tiers is opposite to Center.
            // Standard Tiers = 12 nums. Range approx +/- 6 nums opposite to center.
            // Or roughly 11-22 indices away from center?
            // Let's use the definition from BettingBoard: Center +11 to +22 (12 nums)
            // We search for best 12-number slice in that opposite region (-3..3 shift)
            let bestTCost = Infinity;
            for (let shift = -3; shift <= 3; shift++) {
                const target = [];
                const startOff = 11 + shift;
                const endOff = 22 + shift;
                for (let i = startOff; i <= endOff; i++) {
                    let idx = (centerIndex + i) % 37;
                    if (idx < 0) idx += 37;
                    target.push(WHEEL_ORDER[idx]);
                }
                const cost = getOptimizationCost(target);
                if (cost < bestTCost) bestTCost = cost;
            }

            // 4. HUERFANOS (Target 8 Numbers, Flanks)
            // Huerfanos fills the gaps.
            // If Vecinos is ~17 nums (Center +/- 8) and Tiers is ~12 nums (Center +11..22),
            // Huerfanos is the remaining 8 nums (37 - 17 - 12 = 8).
            // We can calculate it by subtraction: All Nums - (Best Vecinos Nums + Best Tiers Nums)
            // But for pure cost analysis, we can just search for the best 8-number configuration
            // that represents "flanks".
            // However, Orphelins are strictly defined by the gaps.
            // To simplify optimized cost analysis for "Simulated Huerfanos", we can just assume
            // it's the complementary set of V+T.
            // Let's assume the "Ideal Huerfanos" is just the 8 numbers not covered by V_Opt and T_Opt.
            // But V_Opt and T_Opt shift independently.
            // Let's approximate: Huerfanos = 8 numbers.
            // The user wants "Economy". The cheapest way to cover ANY 8 numbers is trivial (1 or 2 chips).
            // But we specifically mean "The Huerfanos OF THIS CENTER".
            // Let's define it as the 8 numbers at indices +9, +10 (Right Flank) and -9..-14 (Left Flank)?
            // Actually, let's use the explicit logic:
            // Gap 1: indices +9 to +10 (2 nums) ?? No, Tiers starts at +11.
            // Gap 2: indices 23 to 28 (6 nums) ??
            // 17(V) + 12(T) = 29. 37 - 29 = 8.
            // Let's use the BettingBoard logic: Orphelins fill the gaps.
            // Best H Cost = Cost of covering the 8 gap numbers.
            // We need to define the gap based on the BEST Vecinos and BEST Tiers we just found?
            // That might be computationally heavy to find the EXACT complementary pair.
            // Let's use a standard "Huerfanos-like" slice: Two chunks of 3 and 5 numbers opposite to each other.
            // Chunk 1 (Right): +9, +10, +11? No.
            // Let's use the complementary cost.
            const totalWheelCost = getOptimizationCost(WHEEL_ORDER); // Should be very high or optimized?
            // Actually, simpler: define Huerfanos as the set of numbers indices [9,10] and [23..28] relative to center
            // relative to the standard offsets.
            // Or better: Just calculate cost for the standard "Orphelins" relative positions:
            // Right: +9, +10. Left: -9, -10, -11, -12, -13, -14. (Total 8)
            const hTarget = [];
            // Right Flank (2 nums)
            for (let i = 9; i <= 10; i++) {
                let idx = (centerIndex + i) % 37; if (idx < 0) idx += 37; hTarget.push(WHEEL_ORDER[idx]);
            }
            // Left Flank (6 nums) - wait, Tiers is 12. Vecinos 17. Total 29. 8 remain.
            // If Tiers is 11..22.
            // Vecinos is -8..8.
            // Gap 1: 9, 10. (2 nums).
            // Gap 2: 23, 24, 25, 26, 27, 28 (6 nums relative to center? NO).
            // 22 is end of Tiers. 37-8 = 29.
            // From 23 to 37-9 = 28. (Indices 23,24,25,26,27,28). 6 nums.
            // Total 2+6 = 8. Correct.
            for (let i = 23; i <= 28; i++) {
                let idx = (centerIndex + i) % 37; if (idx < 0) idx += 37; hTarget.push(WHEEL_ORDER[idx]);
            }
            const bestHCost = getOptimizationCost(hTarget);

            // Determine Tier
            let tier = 'B';
            if (bestNCost <= 4) tier = 'S'; // Gold Standard
            else if (bestNCost <= 5) tier = 'A'; // Good

            // RATIO METRICS & CORRECTED FORENSIC ALPHA (Chip Economy)
            const nDecimal = (bestNCost / 7).toFixed(3);
            const nFraction = `${bestNCost}/7`;
            const nAlpha = (((7 - bestNCost) / 6) * 18.9).toFixed(1);

            const vDecimal = (bestVCost / 17).toFixed(3);
            const vFraction = `${bestVCost}/17`;
            const vAlpha = (((17 - bestVCost) / 16) * 45.9).toFixed(1);

            const tDecimal = (bestTCost / 12).toFixed(3);
            const tFraction = `${bestTCost}/12`;
            const tAlpha = (((12 - bestTCost) / 11) * 32.4).toFixed(1);

            const hDecimal = (bestHCost / 8).toFixed(3);
            const hFraction = `${bestHCost}/8`;
            const hAlpha = (((8 - bestHCost) / 7) * 21.6).toFixed(1);

            rows.push({
                num: centerNum,
                nCost: bestNCost,
                vCost: bestVCost,
                tCost: bestTCost,
                hCost: bestHCost,
                tier,
                nDecimal,
                nFraction,
                nAlpha, // Store for sorting
                vDecimal,
                vFraction,
                vAlpha,
                tDecimal,
                tFraction,
                tAlpha,
                hDecimal,
                hFraction,
                hAlpha
            });
        }

        return rows;
    }, []);

    // --- SORTING & FILTERING ---
    const processedData = useMemo(() => {
        let data = [...analysisData];

        // 1. Filter
        if (filterTier !== 'ALL') {
            data = data.filter(r => r.tier === filterTier);
        }

        // 2. Sort
        data.sort((a, b) => {
            // Special handling for tier sorting (S, A, B)
            if (sortConfig.key === 'tier') {
                const tierOrder = { 'S': 1, 'A': 2, 'B': 3 };
                const valA = tierOrder[a.tier];
                const valB = tierOrder[b.tier];
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            }

            // Default sorting for numbers/strings
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return data;
    }, [analysisData, filterTier, sortConfig]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' or 'RANKING'

    // --- FLATTENED RANKING ENGINE ---
    const rankingData = useMemo(() => {
        const flat = [];
        analysisData.forEach(row => {
            // Nucleo
            flat.push({
                sysId: `${row.num}_N`,
                center: row.num,
                type: 'NUCLEO',
                cost: row.nCost,
                alpha: parseFloat(row.nAlpha),
                decimal: row.nDecimal,
                fraction: row.nFraction,
                coverageStr: '19%',
                code: 'N'
            });
            // Vecinos
            flat.push({
                sysId: `${row.num}_V`,
                center: row.num,
                type: 'VECINOS',
                cost: row.vCost,
                alpha: parseFloat(row.vAlpha),
                decimal: row.vDecimal,
                fraction: row.vFraction,
                coverageStr: '46%',
                code: 'V'
            });
            // Tercios
            flat.push({
                sysId: `${row.num}_T`,
                center: row.num,
                type: 'TERCIOS',
                cost: row.tCost,
                alpha: parseFloat(row.tAlpha),
                decimal: row.tDecimal,
                fraction: row.tFraction,
                coverageStr: '32%',
                code: 'T'
            });
            // Huerfanos
            flat.push({
                sysId: `${row.num}_H`,
                center: row.num,
                type: 'HUERFANOS',
                cost: row.hCost,
                alpha: parseFloat(row.hAlpha),
                decimal: row.hDecimal,
                fraction: row.hFraction,
                coverageStr: '22%',
                code: 'H'
            });
        });

        // Default Sort by Alpha Descending
        return flat.sort((a, b) => b.alpha - a.alpha);
    }, [analysisData]);

    const [rankSort, setRankSort] = useState({ key: 'alpha', direction: 'desc' });

    const processedRanking = useMemo(() => {
        let data = [...rankingData];
        if (rankSort.key) {
            data.sort((a, b) => {
                if (a[rankSort.key] < b[rankSort.key]) return rankSort.direction === 'asc' ? -1 : 1;
                if (a[rankSort.key] > b[rankSort.key]) return rankSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [rankingData, rankSort]);

    const handleRankSort = (key) => {
        let direction = 'desc';
        if (rankSort.key === key && rankSort.direction === 'desc') {
            direction = 'asc';
        }
        setRankSort({ key, direction });
    };

    // --- HEATMAP LOGIC ---
    const getHeatmapColor = (cost, type) => {
        // Green (Optimal), Yellow (Standard), Red (Inefficient)
        const COLORS = { GREEN: '#00e676', YELLOW: '#ffeb3b', RED: '#ff4444' };

        if (type === 'N') return cost <= 4 ? COLORS.GREEN : (cost === 5 ? COLORS.YELLOW : COLORS.RED);
        if (type === 'H') return cost <= 5 ? COLORS.GREEN : (cost <= 6 ? COLORS.YELLOW : COLORS.RED); // 8 numbers ~5 chips
        if (type === 'T') return cost <= 6 ? COLORS.GREEN : (cost <= 8 ? COLORS.YELLOW : COLORS.RED); // 12 numbers ~6 chips
        if (type === 'V') return cost <= 9 ? COLORS.GREEN : (cost <= 11 ? COLORS.YELLOW : COLORS.RED); // 17 numbers ~9 chips
        return '#fff';
    };

    // --- BETTING INTERACTION ---
    const handleBet = (centerNum, systemType) => {
        if (!onBet) return;

        const centerIndex = WHEEL_ORDER.indexOf(centerNum);
        let targetNumbers = [];

        // REPLICATE SELECTION LOGIC for Consistency
        if (systemType === 'NUM') {
            // Straight Bet on specific number
            onBet([`straight_${centerNum}`]);
            return;
        }

        if (systemType === 'N') {
            // BEST NUCLEO SEARCH
            let bestCost = Infinity;
            let bestTarget = [];
            for (let shift = -3; shift <= 3; shift++) {
                const target = [];
                for (let i = -3 + shift; i <= 3 + shift; i++) {
                    let idx = (centerIndex + i) % 37;
                    if (idx < 0) idx += 37;
                    target.push(WHEEL_ORDER[idx]);
                }
                // Simple cost approximation for selection
                // We re-use optimization to be exact
                const betIds = optimizeBets(target);
                const cost = betIds.length; // Approximate, or recalculate full weight?
                // Let's use the pre-calculated analysisData to find the cost?
                // Actually, simpler: Just pick the symmetric one (shift 0) OR run the search?
                // User wants the "Economical" one. So we must run the search.
                // This is fast enough for 7 iterations.
                if (betIds.length < bestCost) { // Using length as proxy for simple cost, or should use full logic?
                    // Full logic:
                    const fullCost = betIds.reduce((acc, id) => acc + (['SIMPLE', 'DOZEN'].includes(getBetType(id)) ? 5 : 1), 0);
                    if (fullCost < bestCost) {
                        bestCost = fullCost;
                        bestTarget = target;
                    }
                }
            }
            targetNumbers = bestTarget;
        }

        if (systemType === 'V') {
            // BEST VECINOS SEARCH
            let bestCost = Infinity;
            let bestTarget = [];
            for (let shift = -3; shift <= 3; shift++) {
                const target = [];
                for (let i = -8 + shift; i <= 8 + shift; i++) {
                    let idx = (centerIndex + i) % 37;
                    if (idx < 0) idx += 37;
                    target.push(WHEEL_ORDER[idx]);
                }
                const betIds = optimizeBets(target);
                const fullCost = betIds.reduce((acc, id) => acc + (['SIMPLE', 'DOZEN'].includes(getBetType(id)) ? 5 : 1), 0);
                if (fullCost < bestCost) {
                    bestCost = fullCost;
                    bestTarget = target;
                }
            }
            targetNumbers = bestTarget;
        }

        if (systemType === 'T') {
            // BEST TERCIOS SEARCH (Opposite +11 to +22)
            let bestCost = Infinity;
            let bestTarget = [];
            for (let shift = -3; shift <= 3; shift++) {
                const target = [];
                const startOff = 11 + shift;
                const endOff = 22 + shift;
                for (let i = startOff; i <= endOff; i++) {
                    let idx = (centerIndex + i) % 37;
                    if (idx < 0) idx += 37;
                    target.push(WHEEL_ORDER[idx]);
                }
                const betIds = optimizeBets(target);
                const fullCost = betIds.reduce((acc, id) => acc + (['SIMPLE', 'DOZEN'].includes(getBetType(id)) ? 5 : 1), 0);
                if (fullCost < bestCost) {
                    bestCost = fullCost;
                    bestTarget = target;
                }
            }
            targetNumbers = bestTarget;
        }

        if (systemType === 'H') {
            // HUERFANOS (Fixed Logic as per Analysis)
            // Right Flank (2 nums) + Left Flank (6 nums)
            for (let i = 9; i <= 10; i++) {
                let idx = (centerIndex + i) % 37; if (idx < 0) idx += 37; targetNumbers.push(WHEEL_ORDER[idx]);
            }
            for (let i = 23; i <= 28; i++) {
                let idx = (centerIndex + i) % 37; if (idx < 0) idx += 37; targetNumbers.push(WHEEL_ORDER[idx]);
            }
        }

        // OPTIMIZE AND PLACE
        if (targetNumbers.length > 0) {
            const finalBets = optimizeBets(targetNumbers);
            onBet(finalBets);
        }
    };


    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.95)', zIndex: Z_LAYERS.CRITICAL_MODAL,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)'
        }} onClick={onClose}>
            <div style={{
                background: '#0a0a0a',
                border: '1px solid #00f3ff',
                boxShadow: '0 0 60px rgba(0, 243, 255, 0.4)',
                borderRadius: '12px',
                width: '98vw', maxWidth: '1800px',
                height: '95vh',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div style={{
                    padding: '20px', borderBottom: '1px solid #333',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(0, 243, 255, 0.05)'
                }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#00f3ff', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Eficiencia de Fichas (F/N)
                        </h2>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                            ANÁLISIS FORENSE 0-36 (REGLA 5X) • ELEMENTO 27 • ORDENADO POR COSTO (N-H-T-V)
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: '1px solid #00f3ff', color: '#00f3ff',
                        padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>
                        CERRAR
                    </button>
                </div>

                {/* TOOLBAR */}
                <div style={{ padding: '10px 20px', background: '#0a0a0a', borderBottom: '1px solid #222', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'bold' }}>FILTRAR CLASIFICACIÓN:</span>
                    {['ALL', 'S', 'A', 'B'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterTier(t)}
                            style={{
                                background: filterTier === t ? '#00f3ff' : 'transparent',
                                color: filterTier === t ? '#000' : '#888',
                                border: '1px solid #333',
                                padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
                                fontSize: '0.8rem', fontWeight: 'bold'
                            }}
                        >
                            {t}
                        </button>
                    ))}

                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ background: '#222', borderRadius: '20px', padding: '4px', display: 'flex', gap: '4px' }}>
                            <button
                                onClick={() => setViewMode('TABLE')}
                                style={{
                                    background: viewMode === 'TABLE' ? '#00f3ff' : 'transparent',
                                    color: viewMode === 'TABLE' ? '#000' : '#888',
                                    border: 'none', padding: '6px 16px', borderRadius: '16px',
                                    fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                MATRIZ
                            </button>
                            <button
                                onClick={() => setViewMode('RANKING')}
                                style={{
                                    background: viewMode === 'RANKING' ? '#00e676' : 'transparent',
                                    color: viewMode === 'RANKING' ? '#000' : '#888',
                                    border: 'none', padding: '6px 16px', borderRadius: '16px',
                                    fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                RANKING ALPHA 🏆
                            </button>
                        </div>
                    </div>

                    <span style={{ color: '#666', fontSize: '0.7rem' }}>
                        * Click en cabeceras para ordenar • <span style={{ color: '#fff', fontWeight: 'bold' }}>Click en celdas para apostar</span> • Colores: <span style={{ color: '#00e676' }}>Verde (Óptimo)</span>, <span style={{ color: '#ffeb3b' }}>Amarillo (Estándar)</span>, <span style={{ color: '#ff4444' }}>Rojo (Caro)</span>
                    </span>
                </div>

                {/* CONTENT */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

                    {viewMode === 'RANKING' ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee', fontSize: '0.9rem', maxWidth: '1200px', margin: '0 auto' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
                                <tr style={{ color: '#888', borderBottom: '2px solid #333', textAlign: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '12px', color: '#ffd700' }}>#</th>
                                    <th onClick={() => handleRankSort('alpha')} style={{ padding: '12px', color: '#00e676' }}>ALPHA (POTENCIA) {rankSort.key === 'alpha' && (rankSort.direction === 'desc' ? '▼' : '▲')}</th>
                                    <th onClick={() => handleRankSort('center')} style={{ padding: '12px', color: '#fff' }}>CENTRO</th>
                                    <th onClick={() => handleRankSort('type')} style={{ padding: '12px', color: '#00f3ff' }}>ESTRATEGIA</th>
                                    <th onClick={() => handleRankSort('cost')} style={{ padding: '12px' }}>DE PAGO / COBERTURA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedRanking.map((row, idx) => {
                                    const isTop = idx < 5;
                                    const alphaSize = isTop ? '1.4rem' : '1.1rem';
                                    const alphaColor = row.alpha > 20 ? '#00e676' : '#888';

                                    return (
                                        <tr key={row.sysId}
                                            onClick={() => handleBet(row.center, row.code)}
                                            style={{
                                                borderBottom: '1px solid #222',
                                                textAlign: 'center',
                                                background: isTop ? 'rgba(0, 230, 118, 0.05)' : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = isTop ? 'rgba(0, 230, 118, 0.05)' : 'transparent'}
                                        >
                                            <td style={{ padding: '12px', fontWeight: 'bold', color: isTop ? '#ffd700' : '#444' }}>{idx + 1}</td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontSize: alphaSize, fontWeight: 'bold', color: alphaColor, textShadow: isTop ? '0 0 15px rgba(0,230,118,0.3)' : 'none' }}>
                                                    α {row.alpha}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                                                {row.center}
                                            </td>
                                            <td style={{ padding: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                <span style={{
                                                    background: row.type === 'NUCLEO' ? 'rgba(255, 215, 0, 0.2)' : row.type === 'VECINOS' ? 'rgba(129, 199, 132, 0.2)' : 'rgba(100, 181, 246, 0.2)',
                                                    padding: '4px 8px', borderRadius: '4px', color: '#eee', fontSize: '0.8rem'
                                                }}>
                                                    {row.type} ({row.coverageStr})
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', fontFamily: 'monospace', color: '#aaa' }}>
                                                <span style={{ color: getHeatmapColor(row.cost, row.code), fontWeight: 'bold', fontSize: '1.1rem' }}>{row.cost} Fichas</span>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Ratio: {row.decimal}</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee', fontSize: '0.9rem' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10 }}>
                                <tr style={{ color: '#888', borderBottom: '2px solid #333', textAlign: 'center', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    <th onClick={() => handleSort('num')} style={{ padding: '8px', minWidth: '50px', color: sortConfig.key === 'num' ? '#00f3ff' : 'inherit' }}>NUM {sortConfig.key === 'num' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>

                                    {/* NUCLEO (7) */}
                                    <th onClick={() => handleSort('nCost')} style={{ padding: '8px', color: sortConfig.key === 'nCost' ? '#00f3ff' : 'inherit' }}>N. 7N {sortConfig.key === 'nCost' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                                    <th style={{ padding: '8px', minWidth: '90px' }}>
                                        <span onClick={() => handleSort('nDecimal')} style={{ cursor: 'pointer', color: sortConfig.key === 'nDecimal' ? '#fff' : 'inherit' }}>RATIO {sortConfig.key === 'nDecimal' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</span>
                                        <span style={{ color: '#444', margin: '0 4px' }}>|</span>
                                        <span onClick={() => handleSort('nAlpha')} style={{ cursor: 'pointer', color: sortConfig.key === 'nAlpha' ? '#00e676' : 'inherit' }}>α {sortConfig.key === 'nAlpha' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</span>
                                    </th>

                                    {/* HUERFANOS (8) */}
                                    <th onClick={() => handleSort('hCost')} style={{ padding: '8px', color: sortConfig.key === 'hCost' ? '#00f3ff' : 'inherit' }}>H. 8N {sortConfig.key === 'hCost' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                                    <th style={{ padding: '8px', minWidth: '90px' }}>
                                        <span onClick={() => handleSort('hDecimal')} style={{ cursor: 'pointer', color: sortConfig.key === 'hDecimal' ? '#fff' : 'inherit' }}>RATIO {sortConfig.key === 'hDecimal' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</span>
                                        <span style={{ color: '#444', margin: '0 4px' }}>|</span>
                                        <span onClick={() => handleSort('hAlpha')} style={{ cursor: 'pointer', color: sortConfig.key === 'hAlpha' ? '#00e676' : 'inherit' }}>α {sortConfig.key === 'hAlpha' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</span>
                                    </th>

                                    {/* TERCIOS (12) */}
                                    <th onClick={() => handleSort('tCost')} style={{ padding: '8px', color: sortConfig.key === 'tCost' ? '#00f3ff' : 'inherit' }}>T. 12N {sortConfig.key === 'tCost' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                                    <th style={{ padding: '8px', minWidth: '90px' }}>
                                        <span onClick={() => handleSort('tDecimal')} style={{ cursor: 'pointer', color: sortConfig.key === 'tDecimal' ? '#fff' : 'inherit' }}>RATIO {sortConfig.key === 'tDecimal' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</span>
                                        <span style={{ color: '#444', margin: '0 4px' }}>|</span>
                                        <span onClick={() => handleSort('tAlpha')} style={{ cursor: 'pointer', color: sortConfig.key === 'tAlpha' ? '#00e676' : 'inherit' }}>α {sortConfig.key === 'tAlpha' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</span>
                                    </th>

                                    {/* VECINOS (17) */}
                                    <th onClick={() => handleSort('vCost')} style={{ padding: '8px', color: sortConfig.key === 'vCost' ? '#00f3ff' : 'inherit' }}>V. 17N {sortConfig.key === 'vCost' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                                    <th style={{ padding: '8px', minWidth: '90px' }}>
                                        <span onClick={() => handleSort('vDecimal')} style={{ cursor: 'pointer', color: sortConfig.key === 'vDecimal' ? '#fff' : 'inherit' }}>RATIO {sortConfig.key === 'vDecimal' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</span>
                                        <span style={{ color: '#444', margin: '0 4px' }}>|</span>
                                        <span onClick={() => handleSort('vAlpha')} style={{ cursor: 'pointer', color: sortConfig.key === 'vAlpha' ? '#00e676' : 'inherit' }}>α {sortConfig.key === 'vAlpha' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</span>
                                    </th>

                                    <th onClick={() => handleSort('tier')} style={{ padding: '8px', color: sortConfig.key === 'tier' ? '#00f3ff' : 'inherit' }}>CLASIFICACIÓN</th>
                                    <th style={{ padding: '8px' }}>ESTADO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.map(row => {
                                    const isSelectedSystem = [0, 26, 23, 10].includes(row.num);
                                    const rowBg = isSelectedSystem ? 'rgba(0, 243, 255, 0.1)' : 'transparent';
                                    const numColor = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(row.num) ? '#ff4444' : (row.num === 0 ? '#00e5ff' : 'white');

                                    return (
                                        <tr key={row.num} style={{ borderBottom: '1px solid #222', background: rowBg, textAlign: 'center' }}>
                                            <td
                                                onClick={() => handleBet(row.num, 'NUM')}
                                                style={{ padding: '12px', fontWeight: 'bold', fontSize: '1.2rem', color: numColor, cursor: 'pointer' }}
                                                title={`Apostar al ${row.num}`}
                                            >
                                                {row.num}
                                            </td>

                                            {/* NUCLEO */}
                                            <td
                                                onClick={() => handleBet(row.num, 'N')}
                                                style={{ padding: '12px', cursor: 'pointer' }}
                                                title="Apostar Núcleo Óptimo"
                                            >
                                                <span style={{ color: getHeatmapColor(row.nCost, 'N'), fontWeight: 'bold' }}>
                                                    {row.nCost} F
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#aaa' }}>
                                                <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                                    <span style={{ color: '#fff' }}>{row.nFraction}</span>
                                                    <span style={{ margin: '0 8px', color: '#444' }}>|</span>
                                                    <span style={{ color: '#00f3ff' }}>{row.nDecimal}</span>
                                                </div>
                                                <div style={{ fontSize: '1.2rem', marginTop: '2px', borderTop: '1px solid #222', paddingTop: '2px', fontWeight: 'bold', color: parseFloat(row.nAlpha) > 20 ? '#00e676' : '#888', textShadow: parseFloat(row.nAlpha) > 20 ? '0 0 10px rgba(0,230,118,0.4)' : 'none' }}>
                                                    α {row.nAlpha}
                                                </div>
                                            </td>

                                            {/* HUERFANOS */}
                                            <td
                                                onClick={() => handleBet(row.num, 'H')}
                                                style={{ padding: '12px', cursor: 'pointer' }}
                                                title="Apostar Huerfanos"
                                            >
                                                <span style={{ color: getHeatmapColor(row.hCost, 'H'), fontWeight: 'bold' }}>
                                                    {row.hCost} F
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#aaa' }}>
                                                <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                                    <span style={{ color: '#fff' }}>{row.hFraction}</span>
                                                    <span style={{ margin: '0 8px', color: '#444' }}>|</span>
                                                    <span style={{ color: '#00f3ff' }}>{row.hDecimal}</span>
                                                </div>
                                                <div style={{ fontSize: '1.2rem', marginTop: '2px', borderTop: '1px solid #222', paddingTop: '2px', fontWeight: 'bold', color: parseFloat(row.hAlpha) > 20 ? '#00e676' : '#888', textShadow: parseFloat(row.hAlpha) > 20 ? '0 0 10px rgba(0,230,118,0.4)' : 'none' }}>
                                                    α {row.hAlpha}
                                                </div>
                                            </td>

                                            {/* TERCIOS */}
                                            <td
                                                onClick={() => handleBet(row.num, 'T')}
                                                style={{ padding: '12px', cursor: 'pointer' }}
                                                title="Apostar Tercios Óptimos"
                                            >
                                                <span style={{ color: getHeatmapColor(row.tCost, 'T'), fontWeight: 'bold' }}>
                                                    {row.tCost} F
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#aaa', borderLeft: '1px solid #111', background: 'rgba(0, 243, 255, 0.05)' }}>
                                                <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                                    <span style={{ color: '#fff' }}>{row.tFraction}</span>
                                                    <span style={{ margin: '0 8px', color: '#444' }}>|</span>
                                                    <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>{row.tDecimal}</span>
                                                </div>
                                                <div style={{ fontSize: '1.2rem', marginTop: '2px', borderTop: '1px solid #222', paddingTop: '2px', fontWeight: 'bold', color: parseFloat(row.tAlpha) > 20 ? '#00e676' : '#888', textShadow: parseFloat(row.tAlpha) > 20 ? '0 0 10px rgba(0,230,118,0.4)' : 'none' }}>
                                                    α {row.tAlpha}
                                                </div>
                                            </td>

                                            {/* VECINOS */}
                                            <td
                                                onClick={() => handleBet(row.num, 'V')}
                                                style={{ padding: '12px', cursor: 'pointer' }}
                                                title="Apostar Vecinos Óptimos"
                                            >
                                                <span style={{ color: getHeatmapColor(row.vCost, 'V'), fontWeight: 'bold' }}>
                                                    {row.vCost} F
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#aaa' }}>
                                                <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                                    <span style={{ color: '#fff' }}>{row.vFraction}</span>
                                                    <span style={{ margin: '0 8px', color: '#444' }}>|</span>
                                                    <span style={{ color: '#00f3ff' }}>{row.vDecimal}</span>
                                                </div>
                                                <div style={{ fontSize: '1.2rem', marginTop: '2px', borderTop: '1px solid #222', paddingTop: '2px', fontWeight: 'bold', color: parseFloat(row.vAlpha) > 20 ? '#00e676' : '#888', textShadow: parseFloat(row.vAlpha) > 20 ? '0 0 10px rgba(0,230,118,0.4)' : 'none' }}>
                                                    α {row.vAlpha}
                                                </div>
                                            </td>

                                            {/* TIER */}
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    background: row.tier === 'S' ? '#ffd700' : (row.tier === 'A' ? '#444' : '#222'),
                                                    color: row.tier === 'S' ? '#000' : '#fff',
                                                    padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem'
                                                }}>
                                                    {row.tier}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '0.8rem', color: '#666' }}>
                                                {isSelectedSystem ?
                                                    <span style={{ color: '#00f3ff', border: '1px solid #00f3ff', padding: '2px 6px', borderRadius: '4px' }}>SISTEMA ACTIVO</span> :
                                                    (row.tier === 'S' ? 'Candidato Óptimo' : 'Ineficiente')
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* FOOTER LEGEND */}
                <div style={{ padding: '20px', borderTop: '1px solid #333', background: '#0e0e0e' }}>
                    <div style={{ color: '#00f3ff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        📖 Guía de Clasificación (Efficiency Class)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', fontSize: '0.9rem' }}>

                        {/* TIER S */}
                        <div style={{ padding: '15px', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #ffd700', borderRadius: '8px' }}>
                            <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px' }}>🏆 CLASIF. S (Superior)</div>
                            <div style={{ color: '#eee', marginBottom: '5px' }}>Costo Núcleo: <strong>≤ 4 Fichas</strong></div>
                            <div style={{ color: '#888', fontSize: '0.85rem' }}>
                                Máxima eficiencia matemática. Cubre el sector crítico con mínima inversión.
                                <br /><em style={{ color: '#aaa' }}>Ejemplos: 0, 26, 23, 10</em>
                            </div>
                        </div>

                        {/* TIER A */}
                        <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #888', borderRadius: '8px' }}>
                            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px' }}>🥈 CLASIF. A (Regular)</div>
                            <div style={{ color: '#eee', marginBottom: '5px' }}>Costo Núcleo: <strong>5 Fichas</strong></div>
                            <div style={{ color: '#888', fontSize: '0.85rem' }}>
                                Eficiencia estándar. Requiere una ficha extra para cubrir huecos geométricos.
                                <br /><em style={{ color: '#aaa' }}>Ejemplos: 6, 9, 31</em>
                            </div>
                        </div>

                        {/* TIER B */}
                        <div style={{ padding: '15px', background: 'rgba(50, 50, 50, 0.4)', border: '1px solid #333', borderRadius: '8px' }}>
                            <div style={{ color: '#999', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px' }}>🥉 CLASIF. B (Ineficiente)</div>
                            <div style={{ color: '#eee', marginBottom: '5px' }}>Costo Núcleo: <strong>≥ 6 Fichas</strong></div>
                            <div style={{ color: '#888', fontSize: '0.85rem' }}>
                                Zonas de baja rentabilidad. Alto costo de cobertura. Evitar como centros.
                                <br /><em style={{ color: '#555' }}>Ejemplos: Zonas muertas</em>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
