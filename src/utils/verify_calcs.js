const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Generate all possible bets
const generateBets = () => {
    const bets = [];
    // 1. Straight Up
    for (let i = 0; i <= 36; i++) bets.push({ type: 'STR', cost: 1, nums: [i], name: `Straight ${i}` });
    // 2. Splits
    for (let n = 1; n <= 33; n++) bets.push({ type: 'SPLIT', cost: 1, nums: [n, n + 3], name: `Split ${n}/${n + 3}` });
    for (let n = 1; n <= 35; n++) if (n % 3 !== 0) bets.push({ type: 'SPLIT', cost: 1, nums: [n, n + 1], name: `Split ${n}/${n + 1}` });
    bets.push({ type: 'SPLIT', cost: 1, nums: [0, 1], name: 'Split 0/1' },
        { type: 'SPLIT', cost: 1, nums: [0, 2], name: 'Split 0/2' },
        { type: 'SPLIT', cost: 1, nums: [0, 3], name: 'Split 0/3' });
    // 3. Corners
    for (let n = 1; n <= 32; n++) if (n % 3 !== 0) bets.push({ type: 'CNR', cost: 1, nums: [n, n + 1, n + 3, n + 4], name: `Corner ${n}-${n + 4}` });
    bets.push({ type: 'CNR_0', cost: 1, nums: [0, 1, 2, 3], name: 'First 4 (0-3)' });
    // 4. Trios
    bets.push({ type: 'TRIO', cost: 1, nums: [0, 1, 2], name: 'Trio 0-2' },
        { type: 'TRIO', cost: 1, nums: [0, 2, 3], name: 'Trio 0/2/3' });
    // 5. Streets
    for (let n = 1; n <= 34; n += 3) bets.push({ type: 'STRT', cost: 1, nums: [n, n + 1, n + 2], name: `Street ${n}-${n + 2}` });
    // 6. Lines
    for (let n = 1; n <= 31; n += 3) bets.push({ type: 'LINE', cost: 1, nums: [n, n + 1, n + 2, n + 3, n + 4, n + 5], name: `Line ${n}-${n + 5}` });
    return bets;
};

const BETS = generateBets();

// Solver with Trace
const solveWithTrace = (requiredNums) => {
    let remaining = new Set(requiredNums);
    let totalCost = 0;
    const chosenBets = [];

    while (remaining.size > 0) {
        let bestBet = null;
        let maxCovered = 0;

        // Find bet that covers most REMAINING numbers
        for (const bet of BETS) {
            let useful = 0;
            let invalid = false;
            // Check if bet covers ONLY valid numbers (standard constraint: we don't want to bet on numbers outside the sector usually, 
            // BUT in reality, sometimes covering an extra number is fine if it's efficient. 
            // However, the strict request usually implies covering EXACT set.
            // Let's assume strict set cover: we cannot bet on numbers NOT in the target list?
            // VISUAL UI usually allows "dirty" bets if efficient. 
            // BUT standard "Sector" analysis usually implies covering the sector.
            // Let's stick to the previous logic: "invalid" was defined as ? 
            // Wait, looking at previous code: 
            // "if (remaining.has(n)) useful++; else invalid = true;"
            // This logic explicitly PUNISHED betting on outside numbers. 
            // This means we are calculating "Clean" Efficiency (not wasting money on outside numbers).
            // This is the correct interpretation for "System Ranking".

            for (const n of bet.nums) {
                if (remaining.has(n)) useful++;
                else invalid = true;
            }

            if (invalid) continue; // STRICT MODE: No outside numbers allowed

            if (useful > maxCovered) {
                maxCovered = useful;
                bestBet = bet;
            }
        }

        if (bestBet) {
            totalCost += bestBet.cost;
            chosenBets.push(`${bestBet.name} [${bestBet.nums.join(',')}]`);
            for (const n of bestBet.nums) remaining.delete(n);
        } else {
            // No multi-number bet fits. Must use Singles for remainder.
            if (remaining.size > 0) {
                const arr = Array.from(remaining);
                totalCost += arr.length;
                chosenBets.push(`Singles: ${arr.join(', ')}`);
                remaining.clear();
            }
        }
    }
    return { cost: totalCost, trace: chosenBets };
};

const getRelativeSectors = (centerNum) => {
    const centerIndex = WHEEL_ORDER.indexOf(centerNum);
    const getSlice = (start, end) => {
        const nums = [];
        for (let i = start; i <= end; i++) {
            let idx = (centerIndex + i) % 37;
            if (idx < 0) idx += 37;
            nums.push(WHEEL_ORDER[idx]);
        }
        return nums;
    };
    return {
        nucleo: getSlice(-3, 3),
        vecinos: getSlice(-8, 8),
        tiers: getSlice(12, 23),
        orphelins: [...getSlice(9, 11), ...getSlice(24, 28)]
    };
};

// Main Verification Loop
console.log("=== VERIFICACION DE CALCULO DE EFICIENCIA (TRACE) ===");
console.log("Modo: Strict Clean Cover (No se permiten fichas que cubran numeros fuera del sector)");

for (let i = 0; i <= 36; i++) {
    const s = getRelativeSectors(i);

    // Solve each
    const solNucleo = solveWithTrace(s.nucleo);
    const solVecinos = solveWithTrace(s.vecinos);
    const solTiers = solveWithTrace(s.tiers);
    const solOrph = solveWithTrace(s.orphelins);

    // Output (Compact but complete)
    console.log(`\n--- SYSTEM ${i} ---`);
    console.log(`NUCLEO [${s.nucleo.join(',')}]: Cost ${solNucleo.cost} => ${solNucleo.trace.join(' + ')}`);
    console.log(`VECINOS [${s.vecinos.join(',')}]: Cost ${solVecinos.cost} => ${solVecinos.trace.join(' + ')}`);
    console.log(`HUERF [${s.orphelins.join(',')}]: Cost ${solOrph.cost} => ${solOrph.trace.join(' + ')}`);
    console.log(`TERCIOS [${s.tiers.join(',')}]: Cost ${solTiers.cost} => ${solTiers.trace.join(' + ')}`);
}
