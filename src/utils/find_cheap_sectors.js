const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const generateBets = () => {
    const bets = [];
    for (let i = 0; i <= 36; i++) bets.push({ type: 'STR', cost: 1, nums: [i], name: `Straight ${i}` });
    for (let n = 1; n <= 33; n++) bets.push({ type: 'SPLIT', cost: 1, nums: [n, n + 3], name: `Split ${n}/${n + 3}` });
    for (let n = 1; n <= 35; n++) if (n % 3 !== 0) bets.push({ type: 'SPLIT', cost: 1, nums: [n, n + 1], name: `Split ${n}/${n + 1}` });
    bets.push({ type: 'SPLIT', cost: 1, nums: [0, 1], name: 'Split 0/1' },
        { type: 'SPLIT', cost: 1, nums: [0, 2], name: 'Split 0/2' },
        { type: 'SPLIT', cost: 1, nums: [0, 3], name: 'Split 0/3' });
    for (let n = 1; n <= 32; n++) if (n % 3 !== 0) bets.push({ type: 'CNR', cost: 1, nums: [n, n + 1, n + 3, n + 4], name: `Corner ${n}-${n + 4}` });
    bets.push({ type: 'CNR_0', cost: 1, nums: [0, 1, 2, 3], name: 'First 4 (0-3)' });
    bets.push({ type: 'TRIO', cost: 1, nums: [0, 1, 2], name: 'Trio 0-2' },
        { type: 'TRIO', cost: 1, nums: [0, 2, 3], name: 'Trio 0/2/3' });
    for (let n = 1; n <= 34; n += 3) bets.push({ type: 'STRT', cost: 1, nums: [n, n + 1, n + 2], name: `Street ${n}-${n + 2}` });
    for (let n = 1; n <= 31; n += 3) bets.push({ type: 'LINE', cost: 1, nums: [n, n + 1, n + 2, n + 3, n + 4, n + 5], name: `Line ${n}-${n + 5}` });
    return bets;
};

const BETS = generateBets();

const solveWithTrace = (requiredNums) => {
    let remaining = new Set(requiredNums);
    let totalCost = 0;
    const chosenBets = [];

    while (remaining.size > 0) {
        let bestBet = null;
        let maxCovered = 0;
        for (const bet of BETS) {
            let useful = 0;
            let invalid = false;
            for (const n of bet.nums) {
                if (remaining.has(n)) useful++;
                else invalid = true;
            }
            if (invalid) continue;
            if (useful > maxCovered) {
                maxCovered = useful;
                bestBet = bet;
            }
        }
        if (bestBet) {
            totalCost += bestBet.cost;
            chosenBets.push(`${bestBet.name}`);
            for (const n of bestBet.nums) remaining.delete(n);
        } else {
            if (remaining.size > 0) {
                const arr = Array.from(remaining);
                totalCost += arr.length;
                chosenBets.push(`Singles: ${arr.length}`);
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

console.log("=== BUSCANDO SECTORES ECONOMICOS (<= 3 FICHAS) ===");
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
        const sol = solveWithTrace(sec.nums);
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
    console.log("No se encontraron sectores de 3 fichas o menos.");
} else {
    found.forEach(f => {
        console.log(`[SYSTEM ${f.sys}] ${f.sector}: ${f.cost} FICHAS -> ${f.details}`);
    });
}
