
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
    return bets.map(b => ({ cost: 1, nums: b.nums, id: b.id }));
}; // Orphans typically played with straights/splits. No streets/corners usually fit well?
// Actually 6/9, 14/17, 17/20, 31/34 are splits. 1 is straight.
// We'll use the full standard grid solver.
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

// --- ANALYSIS ---
// 1. SECTOR 1 (The 5-Num Block)
// Real: 1, 20, 14, 31, 9. (Center 14)
const sector1 = [1, 20, 14, 31, 9];
const s1Cost = solveMinCost(sector1);

// 2. SECTOR 2 (The 3-Num Block)
// Real: 17, 34, 6. (Center 34)
const sector2 = [17, 34, 6];
const s2Cost = solveMinCost(sector2);

// 3. COMBINED (Standard Orphans)
const orphansAll = [...sector1, ...sector2];
const totalCost = s1Cost + s2Cost; // Or solve together? Disjoint so sum is fine.

console.log("🧩 ANÁLISIS SECTOR A (EL BLOQUE DE 5)");
console.log(`Números: [${sector1.join(', ')}] (Centro 14)`);
console.log(`Costo Real: ${s1Cost} Fichas`);
console.log(`Eficiencia: ${(s1Cost / 5).toFixed(3)}`);

console.log("\n🧩 ANÁLISIS SECTOR B (EL BLOQUE DE 3)");
console.log(`Números: [${sector2.join(', ')}] (Centro 34)`);
console.log(`Costo Real: ${s2Cost} Fichas`);
console.log(`Eficiencia: ${(s2Cost / 3).toFixed(3)}`);

console.log("\n🧪 SIMULACIÓN: ¿HAY MEJOR VECINDARIO PARA EL 14?");
// Test Neighbors of 14 (Radius 2)
// True Neighbors of 14 in Wheel: 33, 1, 20 << 14 >> 31, 9, 22.
// Standard Sector 1 cuts at 1 (excluding 33) and 9 (excluding 22).
// Let's check cost of [33, 1, 20, 14, 31] vs [1, 20, 14, 31, 9] vs [20, 14, 31, 9, 22]
const center14 = WHEEL_ORDER.indexOf(14);
const variations = [];
for (let shift = -1; shift <= 1; shift++) { // Shift window Left/Right
    const nums = [];
    for (let i = -2 + shift; i <= 2 + shift; i++) {
        let idx = (center14 + i) % 37; if (idx < 0) idx += 37;
        nums.push(WHEEL_ORDER[idx]);
    }
    variations.push({ shift, nums, cost: solveMinCost(nums) });
}
variations.forEach(v => {
    console.log(`Shift ${v.shift}: [${v.nums.join(',')}] -> Cost ${v.cost}`);
});

console.log("\n🏁 CONCLUSIÓN TOTAL");
console.log(`Huérfanos Estándar (Total 8): ${totalCost} Fichas. Eficiencia ${(totalCost / 8).toFixed(3)}`);
