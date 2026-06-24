
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// --- BETS ---
const generateBets = () => {
    const bets = [];
    for (let i = 0; i <= 36; i++) bets.push({ c: 1, nums: [i], id: `STR_${i}` });
    for (let n = 1; n <= 33; n++) bets.push({ c: 1, nums: [n, n + 3], id: `SPL_V_${n}` });
    for (let n = 1; n <= 35; n++) if (n % 3 !== 0) bets.push({ c: 1, nums: [n, n + 1], id: `SPL_H_${n}` });
    // Zero specials
    bets.push({ c: 1, nums: [0, 1], id: 'SPL_0_1' });
    bets.push({ c: 1, nums: [0, 2], id: 'SPL_0_2' });
    bets.push({ c: 1, nums: [0, 3], id: 'SPL_0_3' });

    return bets.map(b => ({ cost: 1, nums: b.nums, id: b.id }));
};
const BETS = generateBets();

const solveMinCost = (targetNums) => {
    let remaining = new Set(targetNums);
    let cost = 0;
    while (remaining.size > 0) {
        let bestBet = null; let maxCovered = 0;
        for (const bet of BETS) {
            if (!bet.nums.every(n => targetNums.includes(n))) continue;
            let useful = 0;
            for (let n of bet.nums) if (remaining.has(n)) useful++;
            if (useful > maxCovered) { maxCovered = useful; bestBet = bet; }
        }
        if (bestBet) {
            cost++; bestBet.nums.forEach(n => remaining.delete(n));
        } else {
            cost += remaining.size; remaining.clear();
        }
    }
    return cost;
};

// --- RUNNER ---
// Tiers Center: "Opposite Zero".
// Zero is Index 0. Opposite is Index 18 (10) or 19 (5).
// Tiers Standard Nums: 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27.
// Wheel indices: [11] to [22]?
// 27(11), 13(12), 36(13), 11(14), 30(15), 8(16), 23(17), 10(18), 5(19), 24(20), 16(21), 33(22).
// Yes, Indices 11 to 22 (Length 12).
// Midpoint is 16.5 -> Between Index 16 (8) and 17 (23).
const CENTER_IDX = 16; // Using 8 as center anchor. Or 17 (23).
// Let's use 16 (8) and 17 (23) as Dual Centers? No, just pick index 16 (Number 8).

const getSector = (L, R) => { // From Center 8 (Index 16)
    const nums = [];
    for (let i = -L; i <= R; i++) {
        let idx = (CENTER_IDX + i) % 37;
        if (idx < 0) idx += 37;
        nums.push(WHEEL_ORDER[idx]);
    }
    return nums;
};

// 1. SYMMETRIC (Around 8)
console.log("📐 TABLA 1: TERCIO SIMÉTRICO (Centro 8/23 aprox)");
console.log("| Radio | Total | Costo | Eficiencia |");
console.log("|---|---|---|---|");
for (let r = 4; r <= 7; r++) {
    // Check offsets to find true "Geometric Fit" since center is between nums
    // Try Center 8... and Center 23...
    // Actually, Tiers is even-sized (12). So it has no single center number.
    // It is symmetric around the gap between 8 and 23.
    // If we use Number 8 as center, symmetric +/- 5 gives 11 nums. +/- 6 gives 13.
    // Standard Tiers is 12. So it MUST be asymmetric relative to a single number node.
    // Let's test treating it as Asymmetric L/R relative to 8.
    const nums = getSector(r, r);
    const cost = solveMinCost(nums);
    console.log(`| +/- ${r} | ${nums.length} | ${cost} | ${(cost / nums.length).toFixed(3)} |`);
}

// 2. ASYMMETRIC OPTIMAL
console.log("\n⚖️ TABLA 2: ASIMETRÍA ÓPTIMA (Centro 8)");
console.log("| Total | Config (Izq/Der) | Costo | Eficiencia |");
console.log("|---|---|---|---|");

for (let size = 10; size <= 14; size++) {
    let best = { eff: 99 };
    for (let L = 0; L < size; L++) {
        const R = size - 1 - L;
        const nums = getSector(L, R);
        const cost = solveMinCost(nums);
        const eff = cost / size;
        if (eff < best.eff) best = { L, R, cost, eff, nums };
    }
    console.log(`| ${size} | ${best.L}/${best.R} | ${best.cost} | **${best.eff.toFixed(3)}** |`);
}
