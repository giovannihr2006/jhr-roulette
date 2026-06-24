
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// --- 1. BETS ---
const generateBets = () => {
    const bets = [];
    for (let i = 0; i <= 36; i++) bets.push({ c: 1, nums: [i], id: `STR_${i}` });
    for (let n = 1; n <= 33; n++) bets.push({ c: 1, nums: [n, n + 3], id: `SPL_V_${n}` });
    for (let n = 1; n <= 35; n++) if (n % 3 !== 0) bets.push({ c: 1, nums: [n, n + 1], id: `SPL_H_${n}` });
    // Zero specials (Standard)
    bets.push({ c: 1, nums: [0, 1], id: 'SPL_0_1' });
    bets.push({ c: 1, nums: [0, 2], id: 'SPL_0_2' });
    bets.push({ c: 1, nums: [0, 3], id: 'SPL_0_3' });

    // Corners, Streets
    for (let n = 1; n <= 34; n += 3) bets.push({ c: 1, nums: [n, n + 1, n + 2], id: `ST_${n}` });
    for (let n = 1; n <= 32; n++) if (n % 3 !== 0) bets.push({ c: 1, nums: [n, n + 1, n + 3, n + 4], id: `CNR_${n}` });

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
const TIERS_STANDARD = [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33]; // The Official 12
// Indicies in wheel?
const indices = TIERS_STANDARD.map(n => WHEEL_ORDER.indexOf(n)).sort((a, b) => a - b);
// Continuous block check?
// Indices: 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22.
// Yes, perfectly contiguous block [11..22].
// Center is theoretically index 16.5. (Between 8 and 23).

console.log("🧩 ANÁLISIS FORENSE: TERCIO (TIERS DU CYLINDRE)");
console.log(`Sector Oficial (12 nums): [${TIERS_STANDARD.join(', ')}]`);
const stdCost = solveMinCost(TIERS_STANDARD);
console.log(`Costo Oficial: ${stdCost} Fichas. Eficiencia: ${(stdCost / 12).toFixed(3)}`);

console.log("\n🧪 SIMULACIÓN DE DESPLAZAMIENTO (Busca de Eficiencia)");
console.log("| Desplazamiento | Sector (Inicio/Fin) | Costo | Eficiencia |");
console.log("|---|---|---|---|");

// Test rolling window of size 12 across the whole wheel to see if Tiers is unique.
// "Standard" starts at Index 11.
for (let offset = -5; offset <= 5; offset++) {
    const startIdx = 11 + offset;
    const nums = [];
    for (let i = 0; i < 12; i++) {
        let idx = (startIdx + i) % 37;
        if (idx < 0) idx += 37;
        nums.push(WHEEL_ORDER[idx]);
    }

    const cost = solveMinCost(nums);
    const label = offset === 0 ? "**ESTÁNDAR**" : offset > 0 ? `+${offset}` : `${offset}`;
    console.log(`| ${label} | ${nums[0]}...${nums[11]} | ${cost} | ${(cost / 12).toFixed(3)} |`);
}
