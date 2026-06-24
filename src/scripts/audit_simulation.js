
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i);

// Helper to generate sequences
const ALL_SPLITS = [];
for (let r = 1; r <= 36; r += 3) {
    ALL_SPLITS.push({ id: `SPLIT_${r}_${r + 1}`, nums: [r, r + 1] }); // Horizontal
    ALL_SPLITS.push({ id: `SPLIT_${r + 1}_${r + 2}`, nums: [r + 1, r + 2] });
}
for (let n = 1; n <= 33; n++) {
    ALL_SPLITS.push({ id: `SPLIT_${n}_${n + 3}`, nums: [n, n + 3] }); // Vertical
}
// Zero Splits
ALL_SPLITS.push({ id: 'SPLIT_0_1', nums: [0, 1] });
ALL_SPLITS.push({ id: 'SPLIT_0_2', nums: [0, 2] });
ALL_SPLITS.push({ id: 'SPLIT_0_3', nums: [0, 3] });

const ALL_STREETS = [];
for (let n = 1; n <= 34; n += 3) {
    ALL_STREETS.push({ id: `STREET_${n}`, nums: [n, n + 1, n + 2] });
}
ALL_STREETS.push({ id: 'TRIO_0_1_2', nums: [0, 1, 2] });
ALL_STREETS.push({ id: 'TRIO_0_2_3', nums: [0, 2, 3] });

const ALL_CORNERS = [];
for (let n = 1; n <= 32; n++) {
    if (n % 3 !== 0) {
        ALL_CORNERS.push({ id: `CORNER_${n}_${n + 1}_${n + 3}_${n + 4}`, nums: [n, n + 1, n + 3, n + 4] });
    }
}
ALL_CORNERS.push({ id: 'BASKET_0_1_2_3', nums: [0, 1, 2, 3] });

const ALL_LINES_DEFS = [];
for (let n = 1; n <= 31; n += 3) {
    ALL_LINES_DEFS.push({ id: `LINE_${n}_${n + 3}`, nums: [n, n + 1, n + 2, n + 3, n + 4, n + 5] });
}

// Optimization Logic (Copied from Utils)
const optimizeBets = (targetNums) => {
    if (!targetNums || targetNums.length === 0) return [];

    let remaining = new Set(targetNums);
    const finalBetIds = [];

    const getCoverageCount = (betNums) => betNums.filter(n => remaining.has(n)).length;
    const consume = (betNums) => betNums.forEach(n => remaining.delete(n));

    // Candidates
    const CANDIDATES = [
        ...ALL_LINES_DEFS.map(l => ({ ...l, type: 'LINE' })),
        ...ALL_CORNERS.map(c => ({ ...c, type: 'CORNER' })),
        ...ALL_STREETS.map(s => ({ ...s, type: 'STREET' })),
        ...ALL_SPLITS.map(sp => ({ ...sp, type: 'SPLIT' }))
    ];

    while (remaining.size > 0) {
        let bestBet = null;
        let bestScore = 0;

        for (const candidate of CANDIDATES) {
            const count = getCoverageCount(candidate.nums);
            // Must cover at least 2 to differ from straight up
            if (count > 1) {
                const density = count / candidate.nums.length;
                if (count > bestScore || (count === bestScore && density > (bestBet ? bestScore / bestBet.nums.length : 0))) {
                    bestScore = count;
                    bestBet = candidate;
                }
            }
        }

        if (bestBet) {
            finalBetIds.push(bestBet.id);
            consume(bestBet.nums);
        } else {
            break;
        }
    }

    // Remaining as Plenos
    remaining.forEach(n => finalBetIds.push(n.toString()));

    return finalBetIds;
};

// Sector Logic
const getRelativeSectors = (centerNum) => {
    const centerIndex = WHEEL_ORDER.indexOf(centerNum);
    const getSlice = (startOffset, endOffset) => {
        const nums = [];
        for (let i = startOffset; i <= endOffset; i++) {
            let idx = (centerIndex + i) % 37;
            if (idx < 0) idx += 37;
            nums.push(WHEEL_ORDER[idx]);
        }
        return nums;
    };
    const nucleo = getSlice(-4, 2); // 7 nums
    const vecinos = getSlice(-9, 7); // 17 nums
    const tiers = getSlice(11, 22); // 12 nums
    // Orphelins: +8 to +10 AND +23 to +27
    const orphelins = [...getSlice(8, 10), ...getSlice(23, 27)];
    return { nucleo, vecinos, tiers, orphelins };
};

// Analysis
const SYSTEMS = [0, 26, 23, 10];
const RESULTS = {};

SYSTEMS.forEach(sysNum => {
    let sectors;
    if (sysNum === 0) {
        // Standard definitions for 0 to match BettingBoard fallback?
        // Actually, BettingBoard uses getRelativeSectors for 26, 23, 10 but STANDARD constants for 0.
        // But let's see what the Dynamic Logic produces for 0 (Nucleo 0 should correspond to Jeu Zero).
        sectors = getRelativeSectors(0);
    } else {
        sectors = getRelativeSectors(sysNum);
    }

    const nucleoBets = optimizeBets(sectors.nucleo);
    const vecinosBets = optimizeBets(sectors.vecinos);
    const tiersBets = optimizeBets(sectors.tiers);
    const orphelinsBets = optimizeBets(sectors.orphelins);

    RESULTS[sysNum] = {
        Nucleo: { cost: nucleoBets.length, nums: sectors.nucleo.length, bets: nucleoBets },
        Vecinos: { cost: vecinosBets.length, nums: sectors.vecinos.length, bets: vecinosBets },
        Huerfanos: { cost: orphelinsBets.length, nums: sectors.orphelins.length, bets: orphelinsBets },
        Tiers: { cost: tiersBets.length, nums: sectors.tiers.length, bets: tiersBets }
    };
});

console.log(JSON.stringify(RESULTS, null, 2));
