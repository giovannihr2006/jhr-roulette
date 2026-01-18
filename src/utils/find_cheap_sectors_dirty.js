const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// EXPANDED BETS: Include Dozens, Columns, Colors?
// Colors/Even/Odd satisfy "1 chip for 18 numbers". 
// If a sector has mostly Red?
// Vecinos 26 (17 nums). How many Reds?
// If it has 14 Reds. Bet Red (1 chip).
// Covers 14 targets. (Also covers 4 non-target Reds -> Waste).
// Remaining 3 Blacks.
// Bet 3 Singles (3 chips). Total 4.
// Or Street/Corner? 
// Let's include Outside Bets (Red/Black, Dozen, Column).
const generateBets = () => {
    const bets = [];
    const nums = []; for (let i = 0; i <= 36; i++) nums.push(i);
    const Reds = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    const Blacks = nums.filter(n => n !== 0 && !Reds.includes(n));

    // 1. Straight Up
    for (let i = 0; i <= 36; i++) bets.push({ type: 'STR', cost: 1, nums: [i], name: `Str ${i}` });

    // 2. Splits
    for (let n = 1; n <= 33; n++) bets.push({ type: 'SPLIT', cost: 1, nums: [n, n + 3], name: `Sp ${n}/${n + 3}` });
    for (let n = 1; n <= 35; n++) if (n % 3 !== 0) bets.push({ type: 'SPLIT', cost: 1, nums: [n, n + 1], name: `Sp ${n}/${n + 1}` });
    bets.push({ type: 'SPLIT', cost: 1, nums: [0, 1], name: 'Sp 0/1' },
        { type: 'SPLIT', cost: 1, nums: [0, 2], name: 'Sp 0/2' },
        { type: 'SPLIT', cost: 1, nums: [0, 3], name: 'Sp 0/3' });

    // 3. Corners
    for (let n = 1; n <= 32; n++) if (n % 3 !== 0) bets.push({ type: 'CNR', cost: 1, nums: [n, n + 1, n + 3, n + 4], name: `Cnr ${n}` });
    bets.push({ type: 'CNR_0', cost: 1, nums: [0, 1, 2, 3], name: 'First4' });

    // 4. Trios
    bets.push({ type: 'TRIO', cost: 1, nums: [0, 1, 2], name: 'Trio 0-2' },
        { type: 'TRIO', cost: 1, nums: [0, 2, 3], name: 'Trio 0/2/3' });

    // 5. Streets
    for (let n = 1; n <= 34; n += 3) bets.push({ type: 'STRT', cost: 1, nums: [n, n + 1, n + 2], name: `St ${n}` });

    // 6. Lines
    for (let n = 1; n <= 31; n += 3) bets.push({ type: 'LINE', cost: 1, nums: [n, n + 1, n + 2, n + 3, n + 4, n + 5], name: `Ln ${n}` });

    // 7. Dozens
    bets.push({ type: 'DOZ1', cost: 1, nums: nums.filter(n => n >= 1 && n <= 12), name: 'Doz 1' });
    bets.push({ type: 'DOZ2', cost: 1, nums: nums.filter(n => n >= 13 && n <= 24), name: 'Doz 2' });
    bets.push({ type: 'DOZ3', cost: 1, nums: nums.filter(n => n >= 25 && n <= 36), name: 'Doz 3' });

    // 8. Columns
    bets.push({ type: 'COL1', cost: 1, nums: nums.filter(n => n > 0 && n % 3 === 1), name: 'Col 1' });
    bets.push({ type: 'COL2', cost: 1, nums: nums.filter(n => n > 0 && n % 3 === 2), name: 'Col 2' });
    bets.push({ type: 'COL3', cost: 1, nums: nums.filter(n => n > 0 && n % 3 === 0), name: 'Col 3' });

    // 9. Colors (Why not?)
    bets.push({ type: 'RED', cost: 1, nums: Reds, name: 'Red' });
    bets.push({ type: 'BLACK', cost: 1, nums: Blacks, name: 'Black' });

    return bets;
};

const BETS = generateBets();

const solveDirty = (requiredNums) => {
    let remaining = new Set(requiredNums);
    let totalCost = 0;
    const chosenBets = [];

    // Safety break
    let iterations = 0;
    while (remaining.size > 0 && iterations < 20) {
        iterations++;

        // Find bet that covers most REMAINING numbers for Lowest Cost (all cost 1)
        // Ratio: Cost / TargetNumsCovered. (We want Min Cost per Target).
        // Since cost is 1, we want MAX TargetNumsCovered.

        let bestBet = null;
        let maxDeepCover = 0;

        for (const bet of BETS) {
            let useful = 0;
            for (const n of bet.nums) {
                if (remaining.has(n)) useful++;
            }

            if (useful > maxDeepCover) {
                maxDeepCover = useful;
                bestBet = bet;
            }
        }

        if (bestBet) {
            totalCost += bestBet.cost;
            chosenBets.push(`${bestBet.name} (${maxDeepCover} targets)`);
            for (const n of bestBet.nums) remaining.delete(n);
        } else {
            // Should not happen if Singles are available
            break;
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

console.log("=== BUSCANDO OPCIONES SUCIAS (DIRTY COVER) <= 3 FICHAS ===");
console.log("Incluyendo Docenas, Columnas y Colores.");

const found = [];

for (let i = 0; i <= 36; i++) {
    const s = getRelativeSectors(i);
    const sectors = [
        { name: 'NUCLEO', nums: s.nucleo },
        { name: 'VECINOS', nums: s.vecinos },
        { name: 'TERCIOS', nums: s.tiers },
        { name: 'HUERFANOS', nums: s.orphelins }
    ];

    sectors.forEach(sec => {
        const sol = solveDirty(sec.nums);
        if (sol.cost <= 3) {
            found.push({
                sys: i,
                sector: sec.name,
                cost: sol.cost,
                details: sol.trace.join(' + ')
            });
        }
    });
}

found.sort((a, b) => a.cost - b.cost);

if (found.length === 0) {
    console.log("INCREIBLE: Aun con Docenas/Columnas, no hay sectores de 3 fichas.");
} else {
    // Unique by sys+sector
    const unique = found.filter((v, i, a) => a.findIndex(t => (t.sys === v.sys && t.sector === v.sector)) === i);

    unique.forEach(f => {
        console.log(`[SYSTEM ${f.sys}] ${f.sector}: ${f.cost} FICHAS -> ${f.details}`);
    });
}
