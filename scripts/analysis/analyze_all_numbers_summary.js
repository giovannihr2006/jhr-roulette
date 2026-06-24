
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// --- 1. BET GENERATION (Standard Grid + Zero Specials) ---
const generateBets = () => {
    const bets = [];
    for (let i = 0; i <= 36; i++) bets.push({ c: 1, nums: [i], id: `STR_${i}` });
    for (let n = 1; n <= 33; n++) bets.push({ c: 1, nums: [n, n + 3], id: `SPL_V_${n}` });
    for (let n = 1; n <= 35; n++) if (n % 3 !== 0) bets.push({ c: 1, nums: [n, n + 1], id: `SPL_H_${n}` });
    // Zero specials
    bets.push({ c: 1, nums: [0, 1], id: 'SPL_0_1' });
    bets.push({ c: 1, nums: [0, 2], id: 'SPL_0_2' });
    bets.push({ c: 1, nums: [0, 3], id: 'SPL_0_3' });

    // Corners/Streets
    for (let n = 1; n <= 34; n += 3) bets.push({ c: 1, nums: [n, n + 1, n + 2], id: `ST_${n}` });
    for (let n = 1; n <= 32; n++) if (n % 3 !== 0) bets.push({ c: 1, nums: [n, n + 1, n + 3, n + 4], id: `CNR_${n}` });
    // Basket
    bets.push({ c: 1, nums: [0, 1, 2, 3], id: 'BASKET' });
    // Zero Trio
    bets.push({ c: 1, nums: [0, 1, 2], id: 'TRIO_0_1_2' });
    bets.push({ c: 1, nums: [0, 2, 3], id: 'TRIO_0_2_3' });

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
const results = [];

// For numbers 1 to 36 (Zero is already known King)
for (let num = 1; num <= 36; num++) {
    const cIdx = WHEEL_ORDER.indexOf(num);
    let bestForNum = { eff: 99, info: '' };

    // Brute Force: Center NUM, Radius L/R
    // Check Total Size 3 to 19
    for (let total = 3; total <= 19; total++) {
        for (let L = 0; L < total; L++) {
            const R = total - 1 - L;

            const nums = [];
            for (let i = -L; i <= R; i++) {
                let idx = (cIdx + i) % 37;
                if (idx < 0) idx += 37;
                nums.push(WHEEL_ORDER[idx]);
            }

            const cost = solveMinCost(nums);
            const eff = cost / total;

            if (eff < bestForNum.eff) {
                // If tie, prefer Symmetric-ish (diff L/R < 2)
                bestForNum = {
                    eff: eff,
                    cost: cost,
                    total: total,
                    config: `${L}L / ${R}R`
                };
            }
        }
    }
    results.push({ num, ...bestForNum });
}

// Sort by Efficiency
results.sort((a, b) => a.eff - b.eff);

console.log("| Rank | Número | Mejor Configuración | Costo | Eficiencia | Veredicto |");
console.log("|---|---|---|---|---|---|");

results.forEach((r, i) => {
    let veredicto = "Normal";
    if (r.eff <= 0.42) veredicto = "🏆 REY";
    else if (r.eff <= 0.50) veredicto = "💎 ELITE";
    else if (r.eff <= 0.60) veredicto = "⚠️ MEDIOCRE";
    else veredicto = "❌ EVITAR";

    // Grouping Tiers numbers to shorten if needed? No, user asked for "each".
    console.log(`| #${i + 1} | **${r.num}** | ${r.config} (Total ${r.total}) | ${r.cost} | **${r.eff.toFixed(3)}** | ${veredicto} |`);
});
