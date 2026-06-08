
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// --- 1. BET GENERATION (Standard Grid + Zero Specials) ---
const generateBets = () => {
    const bets = [];
    // Straight Up
    for (let i = 0; i <= 36; i++) bets.push({ c: 1, nums: [i], id: `STR_${i}` });

    // Splits (Vert & Horiz)
    for (let n = 1; n <= 33; n++) bets.push({ c: 1, nums: [n, n + 3], id: `SPL_${n}_${n + 3}` });
    for (let n = 1; n <= 35; n++) if (n % 3 !== 0) bets.push({ c: 1, nums: [n, n + 1], id: `SPL_${n}_${n + 1}` });
    // Zero Splits
    bets.push({ c: 1, nums: [0, 1], id: 'SPL_0_1' }); bets.push({ c: 1, nums: [0, 2], id: 'SPL_0_2' }); bets.push({ c: 1, nums: [0, 3], id: 'SPL_0_3' });

    // Corners
    for (let n = 1; n <= 32; n++) if (n % 3 !== 0) bets.push({ c: 1, nums: [n, n + 1, n + 3, n + 4], id: `CNR_${n}` });
    // Zero Basket
    bets.push({ c: 1, nums: [0, 1, 2, 3], id: 'BASKET' });

    // Streets
    for (let n = 1; n <= 34; n += 3) bets.push({ c: 1, nums: [n, n + 1, n + 2], id: `ST_${n}` });
    // Zero Streets/Trios
    bets.push({ c: 1, nums: [0, 1, 2], id: 'TRIO_0_1_2' }); bets.push({ c: 1, nums: [0, 2, 3], id: 'TRIO_0_2_3' });

    // Lines
    for (let n = 1; n <= 31; n += 3) bets.push({ c: 1, nums: [n, n + 1, n + 2, n + 3, n + 4, n + 5], id: `LN_${n}` });

    return bets.map(b => ({ cost: 1, nums: b.nums, id: b.id }));
};
const BETS = generateBets();

// --- 2. SOLVER (Corrected Greedy for Min Set Cover) ---
const solveMinCost = (targetNums) => {
    let remaining = new Set(targetNums);
    let cost = 0;
    while (remaining.size > 0) {
        let bestBet = null;
        let maxCovered = 0;

        for (const bet of BETS) {
            // STRICT SUBSET: Bet must exist entirely within the target sector.
            // This is "Safe/Standard" system design.
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
            // Fallback to straight ups if no complex bet fits
            cost += remaining.size;
            remaining.clear();
        }
    }
    return cost;
};

// --- 3. GLOBAL ANALYSIS ---
console.log("--- FORENSIC AUDIT: GLOBAL SECTOR EFFICIENCY ---");
console.log("| Center | Radius | Size | Cost | Efficiency (Chip/Num) |");

let globalBest = { eff: 1.0, info: '' };
let topResults = [];

for (let center = 0; center <= 36; center++) {
    const cIdx = WHEEL_ORDER.indexOf(center);

    // Test Radius 2 (5 nums) to 9 (19 nums)
    // Small sectors are noisy, large ones average out.
    // Interested in finding "Sweet Spots".
    for (let r = 2; r <= 9; r++) {
        const nums = [];
        for (let i = -r; i <= r; i++) {
            let idx = (cIdx + i) % 37;
            if (idx < 0) idx += 37;
            nums.push(WHEEL_ORDER[idx]);
        }

        const cost = solveMinCost(nums);
        const eff = cost / nums.length;

        // Track interesting results
        if (eff < 0.45) { // Threshold for "Better than Tier (0.5)"
            topResults.push({ center, r, size: nums.length, cost, eff, nums });
        }
        if (eff < globalBest.eff) {
            globalBest = { eff, info: `Center ${center} (R${r}, Sz${nums.length})` };
        }
    }
}

// Result Report
topResults.sort((a, b) => a.eff - b.eff);

// Group by Efficiency Tier
const gold = topResults.filter(x => x.eff <= 0.42);
const silver = topResults.filter(x => x.eff > 0.42 && x.eff <= 0.45);

console.log(`\n🏆 GOLD TIER (Eficiencia < 0.42 - The "Voisins" Level):`);
if (gold.length === 0) console.log("NONE found except Voisins themselves?");
gold.forEach(x => console.log(`Center ${x.center} (Size ${x.size}): Cost ${x.cost} -> Eff ${x.eff.toFixed(3)}`));

console.log(`\n🥈 SILVER TIER (Eficiencia 0.42 - 0.45):`);
silver.slice(0, 10).forEach(x => console.log(`Center ${x.center} (Size ${x.size}): Cost ${x.cost} -> Eff ${x.eff.toFixed(3)}`));

console.log(`\nGlobal Best: ${globalBest.info} with Efficiency ${globalBest.eff.toFixed(3)}`);
