
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// --- GRID DEFINITIONS ---
const BETS = [];

// 1. Straight Up (All 0-36)
for (let i = 0; i <= 36; i++) {
    BETS.push({ type: 'STRAIGHT', cost: 1, nums: [i] });
}

// 2. Splits (Horizontal & Vertical)
for (let n = 1; n <= 33; n++) {
    BETS.push({ type: 'SPLIT', cost: 1, nums: [n, n + 3] });
}
for (let n = 1; n <= 35; n++) {
    if (n % 3 !== 0) {
        BETS.push({ type: 'SPLIT', cost: 1, nums: [n, n + 1] });
    }
}
BETS.push({ type: 'SPLIT', cost: 1, nums: [0, 1] });
BETS.push({ type: 'SPLIT', cost: 1, nums: [0, 2] });
BETS.push({ type: 'SPLIT', cost: 1, nums: [0, 3] });

// 3. Corners
for (let n = 1; n <= 32; n++) {
    if (n % 3 !== 0) {
        BETS.push({ type: 'CORNER', cost: 1, nums: [n, n + 1, n + 3, n + 4] });
    }
}
BETS.push({ type: 'CORNER_0', cost: 1, nums: [0, 1, 2, 3] });

// 4. Trios
BETS.push({ type: 'TRIO', cost: 1, nums: [0, 1, 2] });
BETS.push({ type: 'TRIO', cost: 1, nums: [0, 2, 3] });

// 5. Streets
for (let n = 1; n <= 34; n += 3) {
    BETS.push({ type: 'STREET', cost: 1, nums: [n, n + 1, n + 2] });
}

// 6. Six Lines
for (let n = 1; n <= 31; n += 3) {
    BETS.push({ type: 'LINE', cost: 1, nums: [n, n + 1, n + 2, n + 3, n + 4, n + 5] });
}


// --- SOLVER ---
function calculateMinCost(requiredNums) {
    let remaining = new Set(requiredNums);
    let totalCost = 0;

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
            for (const n of bestBet.nums) remaining.delete(n);
        } else {
            if (remaining.size > 0) {
                totalCost += remaining.size;
                remaining.clear();
            }
        }
    }
    return totalCost;
}

function solveAndLog(name, nums) {
    let remaining = new Set(nums);
    let chosen = [];

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
            if (!invalid && useful > maxCovered) {
                maxCovered = useful;
                bestBet = bet;
            }
        }

        if (bestBet) {
            chosen.push(bestBet);
            for (const n of bestBet.nums) remaining.delete(n);
        } else {
            remaining.forEach(n => chosen.push({ type: 'STRAIGHT_FORCED', cost: 1, nums: [n] }));
            remaining.clear();
        }
    }

    const total = chosen.reduce((acc, b) => acc + b.cost, 0);
    console.log(`\n--- Verification for ${name} (${nums.join(',')}) ---`);
    console.log(`Total Cost: ${total}`);
    chosen.forEach(b => console.log(`  - ${b.type} [${b.nums.join(',')}]`));
    return total;
}

// --- RELATIVE SECTOR GENERATOR ---
function getRelativeSectors(centerNum) {
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
        nucleo: getSlice(-3, 3),    // 7 nums
        vecinos: getSlice(-8, 8),   // 17 nums
        tiers: getSlice(12, 23),    // 12 nums
        orphelins: [...getSlice(9, 11), ...getSlice(24, 28)] // 8 nums
    };
}

// --- MAIN LOOP ---
console.log("System | Nucleo(7) | Tiers(12) | Orph(8) | Voisins(17) | TOTAL CHIPS | F/N Ratio");
console.log("-------|-----------|-----------|---------|-------------|-------------|-----------");

const results = [];

for (let i = 0; i <= 36; i++) {
    const sectors = getRelativeSectors(i);

    // Special logging for 26 and 23
    if (i === 26 || i === 23) {
        console.log(`\n>>> DETAILED CHECK SYSTEM ${i} <<<`);
        solveAndLog(`Nucleo ${i}`, sectors.nucleo);
        solveAndLog(`Vecinos ${i}`, sectors.vecinos);
    }

    // STRICT COSTS
    const cNucleo = calculateMinCost(sectors.nucleo);
    const cTiers = calculateMinCost(sectors.tiers);
    const cOrph = calculateMinCost(sectors.orphelins);
    const cVoisins = calculateMinCost(sectors.vecinos);

    const totalChips = cNucleo + cTiers + cOrph + cVoisins;

    results.push({
        id: i,
        cNucleo,
        cTiers,
        cOrph,
        cVoisins,
        total: totalChips
    });
}

results.sort((a, b) => a.total - b.total); // Sort by TOTAL cost

results.forEach(r => {
    const coverageCost = r.total; // Using Sum of Parts
    const ratio = (coverageCost / 37).toFixed(3);
    console.log(`Sys ${r.id.toString().padEnd(2)} | ${r.cNucleo} (${(7 / r.cNucleo).toFixed(2)}) | ${r.cTiers} (${(12 / r.cTiers).toFixed(2)}) | ${r.cOrph} (${(8 / r.cOrph).toFixed(2)}) | ${r.cVoisins} (${(17 / r.cVoisins).toFixed(2)}) | ${coverageCost}        | ${ratio}`);
});
