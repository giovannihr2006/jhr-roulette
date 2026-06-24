
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// --- 1. BETS POOL ---
const generateBets = () => {
    const bets = [];
    for (let i = 0; i <= 36; i++) bets.push({ cost: 1, nums: [i], id: `STR_${i}` });
    for (let n = 1; n <= 33; n++) bets.push({ cost: 1, nums: [n, n + 3], id: `SPL_V_${n}` });
    for (let n = 1; n <= 35; n++) if (n % 3 !== 0) bets.push({ cost: 1, nums: [n, n + 1], id: `SPL_H_${n}` });
    bets.push({ cost: 1, nums: [0, 1], id: 'SPL_0_1' });
    bets.push({ cost: 1, nums: [0, 2], id: 'SPL_0_2' });
    bets.push({ cost: 1, nums: [0, 3], id: 'SPL_0_3' });
    bets.push({ cost: 1, nums: [0, 1, 2], id: 'TRIO_0_1_2' });
    bets.push({ cost: 1, nums: [0, 2, 3], id: 'TRIO_0_2_3' });

    // Corners
    for (let n = 1; n <= 32; n++) if (n % 3 !== 0) bets.push({ cost: 1, nums: [n, n + 1, n + 3, n + 4], id: `CNR_${n}` });
    return bets;
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
            if (!bet.nums.every(n => targetNums.includes(n))) continue; // Strict

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

// --- 3. GENERATE & RANK ---
const results = [];
const cIdx = WHEEL_ORDER.indexOf(0);

for (let r = 1; r <= 9; r++) {
    const nums = [];
    for (let i = -r; i <= r; i++) {
        let idx = (cIdx + i) % 37;
        if (idx < 0) idx += 37;
        nums.push(WHEEL_ORDER[idx]);
    }

    const cost = solveMinCost(nums);
    const eff = cost / nums.length;

    results.push({
        radius: r,
        count: nums.length,
        cost,
        eff: eff, // Keep precise
        nums: nums
    });
}

// SORT: Best Efficiency (Lowest) First
results.sort((a, b) => a.eff - b.eff);

console.log("| Ranking | Radio (+/-) | Números | Costo | Eficiencia |");
console.log("|---|---|---|---|---|");
results.forEach((r, i) => {
    console.log(`| #${i + 1} | ${r.radius} | ${r.count} | ${r.cost} | **${r.eff.toFixed(3)}** |`);
});
