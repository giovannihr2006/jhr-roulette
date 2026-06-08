
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

// 2. COST CALCULATOR (Same as before)
const getCost = (numbers) => {
    let remaining = new Set(numbers.map(n => parseInt(n)));
    let cost = 0;

    // Helper: Remove if subset
    const tryRemove = (candidates) => {
        if (candidates.every(c => remaining.has(c))) {
            candidates.forEach(c => remaining.delete(c));
            cost++;
            return true;
        }
        return false;
    };

    // B. STREETS (Rows)
    for (let r = 1; r <= 34; r += 3) tryRemove([r, r + 1, r + 2]);
    tryRemove([0, 1, 2]); tryRemove([0, 2, 3]);

    // C. SPLITS (Model board adjacency roughly)
    // Vert: n, n+3
    for (let n = 1; n <= 33; n++) tryRemove([n, n + 3]);
    // Horiz: n, n+1
    for (let n = 1; n <= 35; n++) if (n % 3 !== 0) tryRemove([n, n + 1]);
    tryRemove([0, 1]); tryRemove([0, 2]); tryRemove([0, 3]);

    // D. STRAIGHTS
    cost += remaining.size;

    return cost;
};

// 3. MAIN LOOP - SYMMETRIC ONLY [-3, 3]
const results = [];
WHEEL_ORDER.forEach(num => {
    const slice = getWheelSlice(num, 3, 3); // Symmetric 7
    const cost = getCost(slice);
    results.push({ num, cost });
});

// Sort by Cost Ascending, then by Number Ascending (for stability)
results.sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    return a.num - b.num;
});

console.log("Cheapest Symmetric Nucleos [-3, 3]:");
results.slice(0, 10).forEach(r => {
    console.log(`Num ${r.num}: Cost ${r.cost}`);
});
