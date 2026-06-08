
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// --- BETS ---
const generateBets = () => {
    const bets = [];
    for (let i = 0; i <= 36; i++) bets.push({ c: 1, nums: [i], id: `STR_${i}` });
    for (let n = 1; n <= 36; n++) {
        // Splits logic simplified: iterate all valid splits
        if (n <= 33) bets.push({ c: 1, nums: [n, n + 3], id: `SPL_V_${n}` });
        if (n <= 35 && n % 3 !== 0) bets.push({ c: 1, nums: [n, n + 1], id: `SPL_H_${n}` });
    }
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
        let bestBet = null;
        let maxCovered = 0;
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
const cIdx = WHEEL_ORDER.indexOf(0);
const getSector = (L, R) => {
    const nums = [];
    for (let i = -L; i <= R; i++) {
        let idx = (cIdx + i) % 37;
        if (idx < 0) idx += 37;
        nums.push(WHEEL_ORDER[idx]);
    }
    return nums;
};

// 1. SYMMETRIC (Radii 1 to 4) = Sizes 3, 5, 7, 9
const sym = [];
for (let r = 1; r <= 4; r++) {
    const s = getSector(r, r);
    sym.push({ r, size: s.length, cost: solveMinCost(s) });
}

// 2. ASYMMETRIC (Total Sizes 3 to 9)
const asym = [];
for (let size = 3; size <= 9; size++) {
    let best = { eff: 99 };
    for (let L = 0; L < size; L++) {
        const R = size - 1 - L;
        const s = getSector(L, R);
        const cost = solveMinCost(s);
        const eff = cost / size;
        if (eff < best.eff) best = { L, R, cost, eff, size };
    }
    asym.push(best);
}

// REPORT
console.log("🟦 NÚCLEOS SIMÉTRICOS (+/- N)");
sym.forEach(x => console.log(`R ${x.r} (Sz ${x.size}): Cost ${x.cost} -> Eff ${(x.cost / x.size).toFixed(3)}`));

console.log("\n🟧 NÚCLEOS ASIMÉTRICOS (OPTIMIZADOS)");
asym.sort((a, b) => a.eff - b.eff).forEach(x => {
    console.log(`Sz ${x.size} (${x.L} Izq / ${x.R} Der): Cost ${x.cost} -> Eff ${x.eff.toFixed(3)}`);
});
