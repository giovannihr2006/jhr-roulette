
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// --- 1. SECTOR DEFINITIONS (Corrected Geometry) ---
const getRelativeSectors = (centerNum) => {
    const centerIndex = WHEEL_ORDER.indexOf(centerNum);
    const getSlice = (startOffset, endOffset) => {
        const nums = [];
        for (let i = startOffset; i <= endOffset; i++) {
            let idx = (centerIndex + i) % 37;
            if (idx < 0) idx += 37;
            nums.push(WHEEL_ORDER[idx]);
        }
        return nums;
    };
    // Standard Asymmetric Offsets
    return {
        id: centerNum,
        nucleo: getSlice(-4, 2),        // 7 nums
        vecinos: getSlice(-9, 7),       // 17 nums
        tiers: getSlice(11, 22),        // 12 nums
        orphelins: [...getSlice(8, 10), ...getSlice(23, 27)] // 8 nums
    };
};

// --- 2. BET GENERATION (For Covering) ---
// We need a pool of all possible bets to find the optimal cover
const generateBets = () => {
    const bets = [];
    // Straight Up
    for (let i = 0; i <= 36; i++) bets.push({ cost: 1, nums: [i], id: `STR_${i}` });

    // Splits (Horizontal)
    for (let r = 1; r <= 36; r += 3) {
        bets.push({ cost: 1, nums: [r, r + 1], id: `SPLIT_${r}_${r + 1}` });
        bets.push({ cost: 1, nums: [r + 1, r + 2], id: `SPLIT_${r + 1}_${r + 2}` });
    }
    // Splits (Vertical)
    for (let n = 1; n <= 33; n++) {
        bets.push({ cost: 1, nums: [n, n + 3], id: `SPLIT_${n}_${n + 3}` });
    }
    // Splits (Zero)
    bets.push({ cost: 1, nums: [0, 1], id: 'SPLIT_0_1' });
    bets.push({ cost: 1, nums: [0, 2], id: 'SPLIT_0_2' });
    bets.push({ cost: 1, nums: [0, 3], id: 'SPLIT_0_3' });

    // Corners
    for (let n = 1; n <= 32; n++) {
        if (n % 3 !== 0) {
            bets.push({ cost: 1, nums: [n, n + 1, n + 3, n + 4], id: `COR_${n}` });
        }
    }
    // Basket
    bets.push({ cost: 1, nums: [0, 1, 2, 3], id: 'BASKET' });

    // Streets (3 nums)
    for (let n = 1; n <= 34; n += 3) {
        bets.push({ cost: 1, nums: [n, n + 1, n + 2], id: `STREET_${n}` });
    }
    // Zero Streets
    bets.push({ cost: 1, nums: [0, 1, 2], id: 'STREET_0_1_2' });
    bets.push({ cost: 1, nums: [0, 2, 3], id: 'STREET_0_2_3' });

    // Lines (6 nums)
    for (let n = 1; n <= 31; n += 3) {
        bets.push({ cost: 1, nums: [n, n + 1, n + 2, n + 3, n + 4, n + 5], id: `LINE_${n}` });
    }

    return bets;
};

const ALL_BETS = generateBets();

// --- 3. COST CALCULATION (Greedy Set Cover) ---
const calculateMinCost = (targetNums) => {
    let remaining = new Set(targetNums);
    let totalCost = 0;

    // Sort bets by "Efficiency" (Numbers covered per chip)
    // But we strictly only care about covering the target set cleanly.
    // Heuristic: Prefer bets that cover the MOST remaining target numbers without covering NON-target numbers?
    // Usually systems allow covering non-targets?
    // NO. "Strict Economy" usually implies covering EXACTLY the sector if possible,
    // or at least covering the sector with minimal chips.
    // Allowing extra numbers changes the risk profile.
    // Let's assume "Clean Cover" (Strict Subset) strategy for purity first.
    // If we allow "Over-cover", calculating economy is harder.
    // For this analysis, we stick to: Bets must primarily serve the target.
    // ACTUALLY: Standard efficiency analysis allows 'waste' if it saves chips?
    // No, standard Roulette Systems (like Tier) are precise.
    // I will enforce: A bet is valid ONLY if ALL its numbers are in the target set.
    // This penalizes scattered sectors, which is correct for "Safety".

    while (remaining.size > 0) {
        let bestBet = null;
        let maxCovered = 0;

        for (const bet of ALL_BETS) {
            // Check if bet is strictly within remaining targets?
            // Or strictly within original targets?
            // "Strict Subset of Original Targets" && "Covers at least 1 remaining".

            let isSubset = bet.nums.every(n => targetNums.includes(n));
            if (!isSubset) continue;

            let useful = 0;
            for (const n of bet.nums) {
                if (remaining.has(n)) useful++;
            }

            if (useful > 0) {
                // Heuristic: Maximize useful coverage per chip (Cost is always 1, so minimize chips)
                if (useful > maxCovered) {
                    maxCovered = useful;
                    bestBet = bet;
                }
            }
        }

        if (bestBet) {
            totalCost += bestBet.cost;
            bestBet.nums.forEach(n => remaining.delete(n));
        } else {
            // No multi-number bet fits. Fill with Straight Ups.
            totalCost += remaining.size;
            remaining.clear();
        }
    }
    return totalCost;
};

// --- 4. RUN ANALYSIS ---
const results = [];

for (let i = 0; i <= 36; i++) {
    const s = getRelativeSectors(i);

    const cNucleo = calculateMinCost(s.nucleo);
    const cVecinos = calculateMinCost(s.vecinos);
    const cTiers = calculateMinCost(s.tiers);
    const cOrphelins = calculateMinCost(s.orphelins);

    // System Total? Sum of parts?
    // Or coverage of the whole wheel? Covering the whole wheel is always ~same.
    // User likely means "Which System ID has cheap parts?"
    const totalScore = cNucleo + cVecinos + cTiers + cOrphelins;

    results.push({
        id: i,
        cNucleo,
        cVecinos,
        cTiers,
        cOrphelins,
        totalScore
    });
}

// --- 5. REPORTING HELPER ---
const getTop4 = (key, label) => {
    // Sort Ascending by Cost
    const sorted = [...results].sort((a, b) => a[key] - b[key]);
    const top4 = sorted.slice(0, 4);

    console.log(`\n🏆 TOP 4 MOST ECONOMICAL ${label}:`);
    top4.forEach((r, idx) => {
        console.log(`#${idx + 1}: NUMBER ${r.id} (Cost: ${r[key]} chips)`);
    });
    return top4;
};

getTop4('cNucleo', 'NUCLEI (7 Nums)');
getTop4('cVecinos', 'NEIGHBORS (17 Nums)');
getTop4('cTiers', 'TIERS (12 Nums)');
getTop4('cOrphelins', 'ORPHANS (8 Nums)');
// getTop4('totalScore', 'FULL SYSTEMS');
