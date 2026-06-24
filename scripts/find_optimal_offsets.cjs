
const fs = require('fs');

// 1. WHEEL ORDER
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Helper: Get slice from circular array
function getWheelSlice(centerNum, leftCount, rightCount) {
    const total = 37;
    const centerIdx = WHEEL_ORDER.indexOf(centerNum);
    const result = [];
    for (let i = -leftCount; i <= rightCount; i++) {
        let idx = (centerIdx + i) % total;
        if (idx < 0) idx += total;
        result.push(WHEEL_ORDER[idx]);
    }
    return result;
}

// 2. BET LOGIC (Simplified Cost Calculator)
// Streets: Rows (1,2,3), (4,5,6)...
// Splits: Adjacent on board.
//   Vertical: x, x+3
//   Horizontal: x, x+1 (if not col 3->1 wrap)
// Zero: Splits 0-1, 0-2, 0-3. Basket 0-1-2, 0-2-3.
const getCost = (numbers) => {
    // Greedy Set Cover
    let remaining = new Set(numbers.map(n => parseInt(n)));
    let cost = 0;
    const bets = [];

    // Strategies ordered by efficiency (Chips per number covered)
    // 1. Lines (6 nums) - skipped for "Nucleo" (7 nums) unless obvious?
    //    Usually Nucleo is too scattered for a Line.
    // 2. Corners (4 nums) - cost 1, eff 0.25 (Great)
    // 3. Streets (3 nums) - cost 1, eff 0.33
    // 4. Splits (2 nums) - cost 1, eff 0.5
    // 5. Straight (1 num) - cost 1, eff 1.0

    // Helper: Remove if subset
    const tryRemove = (candidates, label) => {
        // All candidates must be in remaining
        if (candidates.every(c => remaining.has(c))) {
            candidates.forEach(c => remaining.delete(c));
            cost++;
            bets.push(label);
            return true;
        }
        return false;
    };

    // A. CHECK CORNERS (Board Adjacency)
    // Logic: x, x+1, x+3, x+4.
    // Valid checks: row r, cols c..c+1
    // Simplification: Loop through board
    // (This is a simplified greedy script)

    // B. CHECK STREETS (Rows)
    // 1-3, 4-6 ...
    for (let r = 1; r <= 34; r += 3) {
        tryRemove([r, r + 1, r + 2], `STREET_${r}`);
    }
    // Zero Streets? 0-1-2, 0-2-3 (Trio)
    tryRemove([0, 1, 2], 'TRIO_0_1_2');
    tryRemove([0, 2, 3], 'TRIO_0_2_3');

    // C. CHECK SPLITS (Pairs)
    // Vertical (x, x+3)
    for (let n = 1; n <= 33; n++) {
        tryRemove([n, n + 3], `SPLIT_${n}_${n + 3}`);
    }
    // Horizontal (x, x+1) - Exclude 3, 6, 9...
    for (let n = 1; n <= 35; n++) {
        if (n % 3 !== 0) {
            tryRemove([n, n + 1], `SPLIT_${n}_${n + 1}`);
        }
    }
    // Zero Splits
    tryRemove([0, 1], 'SPLIT_0_1');
    tryRemove([0, 2], 'SPLIT_0_2');
    tryRemove([0, 3], 'SPLIT_0_3');


    // D. STRAIGHTS (Remaining)
    if (remaining.size > 0) {
        cost += remaining.size;
    }

    return cost;
};

// 3. OPTIMIZER LOOP
const results = {};

console.log("Starting Forensic Audit for Offset Optimization (Size 7)...");
console.log("Goal: Complete coverage of 7 contiguous numbers with Minimum Chips (Greedy).");

WHEEL_ORDER.forEach(num => {
    let bestCost = 99;
    let bestOffset = null;
    let bestSlice = [];

    // Window size 7.
    // Possible windows containing 'num' at variable positions.
    // Center is num.
    // Offsets: [-6, 0] to [0, +6] ? No, must include center.
    // Length is 7.
    // e.g. Left=0, Right=6. Left=1, Right=5. ... Left=6, Right=0.

    let bestWeightedCost = 999; // Using weighted cost to break ties properly

    for (let left = 0; left <= 6; left++) {
        const right = 6 - left;
        const slice = getWheelSlice(num, left, right);
        const cost = getCost(slice);

        // Preference: Symmetry > Asymmetry.
        // We add a 'penalty' to cost for deviation from perfect center [-3, 3].
        // Deviation = abs(left - 3).

        const deviation = Math.abs(left - 3);
        const weightedCost = cost + (deviation * 0.1);

        if (weightedCost < bestWeightedCost) {
            bestWeightedCost = weightedCost;
            bestResult = {
                cost: cost,
                offset: [-left, right],
                slice: slice
            };
        }
    }

    // Assign best found
    results[num] = bestResult.offset;
    console.log(`Num ${num}: Best Offset [${bestResult.offset[0]}, +${bestResult.offset[1]}] (Cost: ${bestResult.cost}) -> [${bestResult.slice.join(',')}]`);
});

// JSON Output
fs.writeFileSync('optimized_offsets.json', JSON.stringify(results, null, 2));
console.log("Done. Saved to optimized_offsets.json");
