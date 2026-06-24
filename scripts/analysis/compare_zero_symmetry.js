
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// --- 1. BETS POOL ---
const generateBets = () => {
    const bets = [];
    for (let i = 0; i <= 36; i++) bets.push({ c: 1, nums: [i], id: `STR_${i}` });
    for (let n = 1; n <= 33; n++) bets.push({ c: 1, nums: [n, n + 3], id: `SPL_V_${n}` });
    for (let n = 1; n <= 35; n++) if (n % 3 !== 0) bets.push({ c: 1, nums: [n, n + 1], id: `SPL_H_${n}` });
    bets.push({ c: 1, nums: [0, 1], id: 'SPL_0_1' });
    bets.push({ c: 1, nums: [0, 2], id: 'SPL_0_2' });
    bets.push({ c: 1, nums: [0, 3], id: 'SPL_0_3' });

    // Corners, Streets, Trios, Lines
    bets.push({ c: 1, nums: [0, 1, 2], id: 'TRIO_0_1_2' });
    bets.push({ c: 1, nums: [0, 2, 3], id: 'TRIO_0_2_3' });
    bets.push({ c: 1, nums: [0, 1, 2, 3], id: 'BASKET' }); // 4-number bet

    for (let n = 1; n <= 34; n += 3) bets.push({ c: 1, nums: [n, n + 1, n + 2], id: `ST_${n}` });
    for (let n = 1; n <= 32; n++) if (n % 3 !== 0) bets.push({ c: 1, nums: [n, n + 1, n + 3, n + 4], id: `CNR_${n}` });

    return bets.map(b => ({ cost: 1, nums: b.nums, id: b.id }));
};
const BETS = generateBets();

// --- 2. SOLVER ---
const solveMinCost = (targetNums) => {
    let remaining = new Set(targetNums);
    let cost = 0;
    while (remaining.size > 0) {
        let bestBet = null;
        let maxCovered = 0;

        for (const bet of BETS) {
            // STRICT SUBSET constraint
            if (!bet.nums.every(n => targetNums.includes(n))) continue;

            let useful = 0;
            for (let n of bet.nums) if (remaining.has(n)) useful++;

            if (useful > maxCovered) {
                maxCovered = useful;
                bestBet = bet;
            }
        }

        if (bestBet) {
            cost += 1;
            bestBet.nums.forEach(n => remaining.delete(n));
        } else {
            cost += remaining.size;
            remaining.clear();
        }
    }
    return cost;
};

// --- 3. ANALYSIS RUNNER ---
const cIdx = WHEEL_ORDER.indexOf(0);

const getSector = (L, R) => {
    const nums = [];
    // Left (Counter-Clockwise in array? Check Index logic)
    // Array: 0, 32... if we go +1 index, that's right?
    // Standard: 26 is right of 0? No, 26 is 0's Right Neighbor usually?
    // Let's assume generic L/R.
    // L = negative indices, R = positive indices.
    for (let i = -L; i <= R; i++) {
        let idx = (cIdx + i) % 37;
        if (idx < 0) idx += 37;
        nums.push(WHEEL_ORDER[idx]);
    }
    return nums;
};

const symResults = [];
const asymResults = [];

// Loop Total Sizes (3, 5, 7 ... 19)
for (let size = 3; size <= 19; size += 2) { // steps of 2 to keep odd sizes?
    // Or just 1..19? Usually neighbors are roughly balanced.
    // Let's do all sizes 3..19.
}

// Actually, iterate Radii for Symmetric, and Sizes for Asymmetric.

// TABLE A: SYMMETRIC
for (let r = 1; r <= 9; r++) {
    const nums = getSector(r, r);
    const cost = solveMinCost(nums);
    symResults.push({
        label: `+/- ${r}`,
        total: nums.length,
        cost,
        eff: cost / nums.length
    });
}

// TABLE B: OPTIMAL ASYMMETRIC
// For each total size, find best L/R combo
for (let total = 3; total <= 19; total++) {
    let bestForSize = { cost: 99, L: 0, R: 0, eff: 99 };

    // Try all splits L+R = total-1 (since 0 is center)
    // L ranges from 0 to total-1
    for (let L = 0; L < total; L++) {
        const R = total - 1 - L;
        if (R < 0) continue;

        // Skip extreme asymmetry? (e.g. 0 Left, 18 Right). Maybe valid.
        const nums = getSector(L, R);
        const cost = solveMinCost(nums);
        const eff = cost / total;

        if (eff < bestForSize.eff) {
            bestForSize = { cost, L, R, eff, nums };
        }
    }
    asymResults.push({
        total,
        bestConfig: `${bestForSize.L} Izq / ${bestForSize.R} Der`,
        cost: bestForSize.cost,
        eff: bestForSize.eff
    });
}

console.log("\n📐 TABLA 1: VECINOS SIMÉTRICOS (Espejo Perfecto)");
console.log("| Radio (+/-) | Total Números | Costo | Eficiencia |");
console.log("|---|---|---|---|");
symResults.sort((a, b) => a.eff - b.eff).forEach(r => {
    console.log(`| ${r.label} | ${r.total} | ${r.cost} | ${r.eff.toFixed(3)} |`);
});

console.log("\n⚖️ TABLA 2: ASIMETRÍA ÓPTIMA (La 'Trampa' Geométrica)");
console.log("| Total Números | Configuración | Costo | Eficiencia |");
console.log("|---|---|---|---|");
// Sort by efficiency
asymResults.sort((a, b) => a.eff - b.eff).slice(0, 12).forEach(r => {
    console.log(`| ${r.total} | ${r.bestConfig} | ${r.cost} | **${r.eff.toFixed(3)}** |`);
});
