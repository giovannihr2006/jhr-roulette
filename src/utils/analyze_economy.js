
// ROULETTE DATA
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// BET DEFINITIONS (Simplified for Node.js)
const ALL_LINES = [];
for (let n = 1; n <= 31; n += 3) ALL_LINES.push({ nums: [n, n + 1, n + 2, n + 3, n + 4, n + 5], cost: 1 });

const ALL_CORNERS = [];
for (let n = 1; n <= 32; n++) {
    if (n % 3 !== 0) {
        ALL_CORNERS.push({ nums: [n, n + 1, n + 4, n + 5], cost: 1 }); // Oops, n+3, n+4. CORRECTION: Vertical is +3.
        // Corner 1-5 is 1,2,4,5. Row diff is 3.
        // 1 2 3
        // 4 5 6
        // Corner of 1,2,4,5.
        // Logic: n, n+1, n+3, n+4
        // Correct.
    }
}
// Fix Corner Loop for script correctness
const CORNERS_FIXED = [];
for (let n = 1; n <= 32; n++) {
    if (n % 3 !== 0) {
        CORNERS_FIXED.push({ nums: [n, n + 1, n + 3, n + 4], cost: 1 });
    }
}
CORNERS_FIXED.push({ nums: [0, 1, 2, 3], cost: 1 }); // Basket

const ALL_STREETS = [];
for (let n = 1; n <= 34; n += 3) ALL_STREETS.push({ nums: [n, n + 1, n + 2], cost: 1 });
ALL_STREETS.push({ nums: [0, 1, 2], cost: 1 });
ALL_STREETS.push({ nums: [0, 2, 3], cost: 1 });

const ALL_SPLITS = [];
// Horizontal
for (let r = 1; r <= 36; r += 3) {
    ALL_SPLITS.push({ nums: [r, r + 1], cost: 1 });
    ALL_SPLITS.push({ nums: [r + 1, r + 2], cost: 1 });
}
// Vertical
for (let n = 1; n <= 33; n++) {
    ALL_SPLITS.push({ nums: [n, n + 3], cost: 1 });
}
ALL_SPLITS.push({ nums: [0, 1], cost: 1 });
ALL_SPLITS.push({ nums: [0, 2], cost: 1 });
ALL_SPLITS.push({ nums: [0, 3], cost: 1 });

const CANDIDATES = [
    ...ALL_LINES,
    ...CORNERS_FIXED,
    ...ALL_STREETS,
    ...ALL_SPLITS
];

// OPTIMIZER
function optimize(targetNums) {
    const targetSet = new Set(targetNums);
    let remaining = new Set(targetNums);
    let chips = 0;

    while (remaining.size > 0) {
        let bestBet = null;
        let bestCoveredCount = 0;

        for (const candidate of CANDIDATES) {
            // STRICT: Must only contain target numbers
            const isClean = candidate.nums.every(n => targetSet.has(n));
            if (!isClean) continue;

            const count = candidate.nums.filter(n => remaining.has(n)).length;

            // Prefer covering MORE remaining numbers
            if (count > bestCoveredCount) {
                bestCoveredCount = count;
                bestBet = candidate;
            }
        }

        if (bestBet && bestCoveredCount >= 2) { // Only use complex bets if they cover at least 2 remaining
            chips++;
            bestBet.nums.forEach(n => remaining.delete(n));
        } else {
            // If no complex bet helps, break and pay 1 chip for each remaining
            chips += remaining.size;
            break;
        }
    }
    return chips;
}

// TEST RUNNER
const PATTERNS = [
    { name: "Symmetric [-3, +3]", n: -3, p: 3 },
    { name: "Left Heavy [-4, +2]", n: -4, p: 2 },
    { name: "Right Heavy [-2, +4]", n: -2, p: 4 },
    { name: "Extreme Left [-5, +1]", n: -5, p: 1 },
    { name: "Extreme Right [-1, +5]", n: -1, p: 5 },
    { name: "Wide [-4, +4] (9 nums)", n: -4, p: 4 }, // Control
];

console.log("--- CHIP ECONOMY ANALYSIS ---");
console.log("Calculating total chips needed to cover EVERY Nucleo (0-36) for each pattern...\n");

PATTERNS.forEach(pat => {
    let totalChips = 0;

    for (let center = 0; center <= 36; center++) {
        const centerIdx = WHEEL_ORDER.indexOf(center);
        const sectorNums = [];

        for (let i = pat.n; i <= pat.p; i++) {
            let idx = (centerIdx + i) % 37;
            if (idx < 0) idx += 37;
            sectorNums.push(WHEEL_ORDER[idx]);
        }

        const chips = optimize(sectorNums);
        totalChips += chips;
    }

    const avg = (totalChips / 37).toFixed(2);
    console.log(`[${pat.name}] Total: ${totalChips} | Avg: ${avg} chips/system`);
});
