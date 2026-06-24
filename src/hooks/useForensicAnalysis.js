import { useMemo } from 'react';
import {
    optimizeBets,
    getBetType,
    ALL_SPLITS,
    ALL_STREETS,
    ALL_CORNERS,
    ALL_LINES,
    RED_NUMBERS,
    ROULETTE_NUMBERS
} from '../logic/RouletteUtils';
import { WHEEL_ORDER } from '../utils/rouletteUtils';
import { useFinancialStore } from '../logic/FinancialSimulator';

export const useForensicAnalysis = () => {
    const numberHistory = useFinancialStore(state => state.numberHistory || []);

    // NEW: Dynamic Score Calculator
    const getDynamicScore = (baseScore, targetNums) => {
        if (!numberHistory || numberHistory.length === 0) return { score: baseScore, isHot: false, isDue: false };

        const recentLimit = 50;
        const recentHistory = numberHistory.slice(-recentLimit);

        // 1. Heat Factor (How many hits in last 50?)
        const hits = recentHistory.filter(n => targetNums.includes(n)).length;
        const heatMultiplier = 1 + (hits * 0.1); // +10% per hit

        // 2. Due Factor (Is the sector "Cold" / "Due"?)
        // Calculate rounds since ANY number in the sector hit
        let roundsAbsent = 0;
        for (let i = numberHistory.length - 1; i >= 0; i--) {
            if (targetNums.includes(numberHistory[i])) break;
            roundsAbsent++;
        }
        const dueBonus = (roundsAbsent > 37) ? 1.1 : 1.0; // +10% if overdue

        return {
            score: baseScore * heatMultiplier * dueBonus,
            isHot: hits >= 3, // Custom threshold for "Hot" icon
            isDue: roundsAbsent > 37
        };
    };

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
            let bestNCost = Infinity;
            let bestNTarget = [];
            for (let shift = -3; shift <= 3; shift++) {
                const target = [];
                for (let i = -3 + shift; i <= 3 + shift; i++) {
                    let idx = (centerIndex + i) % 37;
                    if (idx < 0) idx += 37;
                    target.push(WHEEL_ORDER[idx]);
                }
                const cost = getOptimizationCost(target);
                if (cost < bestNCost) { bestNCost = cost; bestNTarget = target; }
            }

            // 2. VECINOS (Target 17 Numbers, Asym -9..7)
            let bestVCost = Infinity;
            let bestVTarget = [];
            for (let shift = -3; shift <= 3; shift++) {
                const target = [];
                for (let i = -9 + shift; i <= 7 + shift; i++) {
                    let idx = (centerIndex + i) % 37;
                    if (idx < 0) idx += 37;
                    target.push(WHEEL_ORDER[idx]);
                }
                const cost = getOptimizationCost(target);
                if (cost < bestVCost) { bestVCost = cost; bestVTarget = target; }
            }

            // 3. TERCIOS (Target 12 Numbers, Opposite Sector approx)
            let bestTCost = Infinity;
            let bestTTarget = [];
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
                if (cost < bestTCost) { bestTCost = cost; bestTTarget = target; }
            }

            // 4. HUERFANOS (Target 8 Numbers, Flanks)
            let bestHCost = Infinity;
            let bestHTarget = [];
            const hTarget = [];
            for (let i = 8; i <= 10; i++) { let idx = (centerIndex + i) % 37; if (idx < 0) idx += 37; hTarget.push(WHEEL_ORDER[idx]); }
            for (let i = 23; i <= 27; i++) { let idx = (centerIndex + i) % 37; if (idx < 0) idx += 37; hTarget.push(WHEEL_ORDER[idx]); }
            bestHCost = getOptimizationCost(hTarget);
            bestHTarget = hTarget;


            // Determine Tier
            let tier = 'B';
            if (bestNCost <= 4) tier = 'S'; // Gold Standard
            else if (bestNCost <= 5) tier = 'A'; // Good

            // RATIO METRICS & CORRECTED FORENSIC ALPHA (Chip Economy)
            const nDecimal = (bestNCost / 7).toFixed(3);
            const nFraction = `${bestNCost}/7`;
            const nAlpha = (((7 - bestNCost) / 6) * 18.9).toFixed(1);
            const nBaseScore = bestNCost > 0 ? (7 / bestNCost) : 0;
            const nDyn = getDynamicScore(nBaseScore, bestNTarget);

            const vDecimal = (bestVCost / 17).toFixed(3);
            const vFraction = `${bestVCost}/17`;
            const vAlpha = (((17 - bestVCost) / 16) * 45.9).toFixed(1);
            const vBaseScore = bestVCost > 0 ? (17 / bestVCost) : 0;
            const vDyn = getDynamicScore(vBaseScore, bestVTarget);

            const tDecimal = (bestTCost / 12).toFixed(3);
            const tFraction = `${bestTCost}/12`;
            const tAlpha = (((12 - bestTCost) / 11) * 32.4).toFixed(1);
            const tBaseScore = bestTCost > 0 ? (12 / bestTCost) : 0;
            const tDyn = getDynamicScore(tBaseScore, bestTTarget);

            const hDecimal = (bestHCost / 8).toFixed(3);
            const hFraction = `${bestHCost}/8`;
            const hAlpha = (((8 - bestHCost) / 7) * 21.6).toFixed(1);
            const hBaseScore = bestHCost > 0 ? (8 / bestHCost) : 0;
            const hDyn = getDynamicScore(hBaseScore, bestHTarget);

            rows.push({
                num: centerNum,

                nCost: bestNCost,
                nAlpha,
                nScore: nDyn.score,
                nIsHot: nDyn.isHot,
                nIsDue: nDyn.isDue,

                vCost: bestVCost,
                vAlpha,
                vScore: vDyn.score,
                vIsHot: vDyn.isHot,
                vIsDue: vDyn.isDue,

                tCost: bestTCost,
                tAlpha,
                tScore: tDyn.score,
                tIsHot: tDyn.isHot,
                tIsDue: tDyn.isDue,

                hCost: bestHCost,
                hAlpha,
                hScore: hDyn.score,
                hIsHot: hDyn.isHot,
                hIsDue: hDyn.isDue,

                tier
            });
        }
        return rows;
    }, [numberHistory]); // Re-run when history changes

    // NEW: Standard Table Bet Analysis
    const standardAnalysisData = useMemo(() => {
        const rows = [];
        if (!numberHistory) return rows;

        // HELPER: Compute Alpha for a Standard Bet
        const analyzeBet = (name, type, targetNums, cost) => {
            // 1. Base Score (Payout leverage-ish)
            // Standard payout is 36/count. Base Score = Payout / Cost?
            // Existing logic: Base Score = CoverageInverse.
            // Nucleo (7 nums) base score = 7 / Cost? No.
            // Let's stick to the existing "Activity" score logic.
            // Score = Frequency + Recency.
            const baseScore = 1.0; // Normalized start
            const dyn = getDynamicScore(baseScore, targetNums);

            // ALPHA = Score / Cost
            // Normalizing factor: We need to match the scale of the existing Alpha.
            // Existing Alpha for Nucleo(7, cost 4) is roughly ~18.9 multiplier?
            // Let's look at the implementation:
            // nDecimal = Cost/7. Alpha = Decimal * 18.9 ??
            // Wait, existing logic is weird: Alpha = (Cost/7) * 18.9 ...
            // If Cost is LOW, Alpha should be HIGH. The existing formula seems to favor High Cost??
            // Re-reading logic: `nBaseScore = 7 / bestNCost`. `nDyn = getDynamicScore`.
            // BUT `nAlpha` calculation in line 117 was: `(parseFloat(nDecimal) * 18.9)`.
            // `nDecimal` = `bestNCost / 7`. So if cost is 4, decimal is 0.57. Alpha = 10.
            // If cost is 1, decimal is 0.14. Alpha = 2.
            // THIS SEEMS BACKWARDS. Lower cost should be BETTER.
            //
            // LET'S RE-EVALUATE THE "ALPHA" FORMULA.
            // The user said: "Alpha = Score / Cost".
            // My previous implementation might have been flawed or just arbitrary scaling.
            // Let's implement the User's Definition strictly here:
            // CAST: Alpha = (DynamicScore / Cost) * ScalingFactor.
            // Let's assume a Scaling Factor of 10 to make numbers nice (0-100).

            const alpha = (dyn.score / cost) * 5.0; // Tuned to match approx ranges

            return {
                name,
                type,
                targetNums,
                cost,
                alpha: alpha.toFixed(1),
                score: dyn.score,
                isHot: dyn.isHot,
                tier: alpha > 3.0 ? 'S' : (alpha > 1.5 ? 'A' : 'B')
            };
        };

        // 1. PLENOS (STRAIGHT UP) - Cost 1
        for (let i = 0; i <= 36; i++) {
            rows.push(analyzeBet(i.toString(), 'Pleno', [i], 1));
        }

        // 2. SPLITS (MEDIOS) - Cost 1
        ALL_SPLITS.forEach(bet => {
            rows.push(analyzeBet(bet.name.replace('Medio ', ''), 'Medio', bet.numbers, 1));
        });

        // 3. STREETS (CALLES) - Cost 1
        ALL_STREETS.forEach(bet => {
            rows.push(analyzeBet(bet.name.replace('Calle ', ''), 'Calle', bet.numbers, 1));
        });

        // 4. CORNERS (CUADROS) - Cost 1
        ALL_CORNERS.forEach(bet => {
            rows.push(analyzeBet(bet.name.replace('Cuadro ', ''), 'Cuadro', bet.numbers, 1));
        });

        // 5. LINES (LINEAS) - Cost 1
        ALL_LINES.forEach(bet => {
            rows.push(analyzeBet(bet.name.replace('Linea ', ''), 'Linea', bet.numbers, 1));
        });

        // 6. SIMPLES - Cost 5 (To penalize low leverage)
        // Red
        rows.push(analyzeBet('ROJO', 'Simple', RED_NUMBERS, 5));
        // Black
        rows.push(analyzeBet('NEGRO', 'Simple', ROULETTE_NUMBERS.filter(n => n !== 0 && !RED_NUMBERS.includes(n)), 5));
        // Even
        rows.push(analyzeBet('PAR', 'Simple', ROULETTE_NUMBERS.filter(n => n !== 0 && n % 2 === 0), 5));
        // Odd
        rows.push(analyzeBet('IMPAR', 'Simple', ROULETTE_NUMBERS.filter(n => n !== 0 && n % 2 !== 0), 5));
        // Low
        rows.push(analyzeBet('BAJO', 'Simple', ROULETTE_NUMBERS.filter(n => n >= 1 && n <= 18), 5));
        // High
        rows.push(analyzeBet('ALTO', 'Simple', ROULETTE_NUMBERS.filter(n => n >= 19 && n <= 36), 5));

        return rows;
    }, [numberHistory]);

    const bestCandidate = useMemo(() => {
        let best = null;
        let maxAlpha = -1;

        // 1. CHECK SECTORS (AnalysisData)
        // We need to normalize their "Alpha" to be comparable?
        // The existing alpha in analysisData was calculated weirdly.
        // Let's re-calculate "Standard Alpha" for them too here to be fair.
        analysisData.forEach(row => {
            // Nucleo
            const nAlpha = (row.nScore / row.nCost) * 5.0;
            if (nAlpha > maxAlpha) { maxAlpha = nAlpha; best = { ...row, num: row.num, type: 'NUCLEO', code: 'N', tier: nAlpha > 3 ? 'S' : 'A', activeScore: row.nScore, nAlpha: nAlpha.toFixed(1) }; }

            // Vecinos
            const vAlpha = (row.vScore / row.vCost) * 5.0;
            if (vAlpha > maxAlpha) { maxAlpha = vAlpha; best = { ...row, num: row.num, type: 'VECINOS', code: 'V', tier: vAlpha > 3 ? 'S' : 'A', activeScore: row.vScore, nAlpha: vAlpha.toFixed(1) }; }

            // Tercios
            const tAlpha = (row.tScore / row.tCost) * 5.0;
            if (tAlpha > maxAlpha) { maxAlpha = tAlpha; best = { ...row, num: row.num, type: 'TERCIOS', code: 'T', tier: tAlpha > 3 ? 'S' : 'A', activeScore: row.tScore, nAlpha: tAlpha.toFixed(1) }; }

            // Huerfanos
            const hAlpha = (row.hScore / row.hCost) * 5.0;
            if (hAlpha > maxAlpha) { maxAlpha = hAlpha; best = { ...row, num: row.num, type: 'HUERFANOS', code: 'H', tier: hAlpha > 3 ? 'S' : 'A', activeScore: row.hScore, nAlpha: hAlpha.toFixed(1) }; }
        });

        // 2. CHECK STANDARD BETS
        standardAnalysisData.forEach(bet => {
            const bAlpha = parseFloat(bet.alpha);
            if (bAlpha > maxAlpha) {
                maxAlpha = bAlpha;
                best = {
                    num: bet.name, // Display Name (e.g., "ROJO", "14-17")
                    type: bet.type.toUpperCase(),
                    tier: bet.tier,
                    activeScore: bet.score,
                    nAlpha: bet.alpha, // Unified naming
                    isStandardBet: true,
                    targetNums: bet.targetNums
                };
            }
        });

        return best;
    }, [analysisData, standardAnalysisData]);

    return { analysisData, bestCandidate };
};
