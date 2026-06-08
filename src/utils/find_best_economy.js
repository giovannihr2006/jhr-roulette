
// ROULETTE DATA
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// BET DEFINITIONS
const ALL_LINES = [];
for (let n = 1; n <= 31; n += 3) ALL_LINES.push({ nums: [n, n + 1, n + 2, n + 3, n + 4, n + 5], cost: 1, type: 'LN' });

const ALL_CORNERS = [];
for (let n = 1; n <= 32; n++) {
    if (n % 3 !== 0) {
        ALL_CORNERS.push({ nums: [n, n + 1, n + 3, n + 4], cost: 1, type: 'CR' });
    }
}
ALL_CORNERS.push({ nums: [0, 1, 2, 3], cost: 1, type: 'BSK' }); // Basket

const ALL_STREETS = [];
for (let n = 1; n <= 34; n += 3) ALL_STREETS.push({ nums: [n, n + 1, n + 2], cost: 1, type: 'STRT' });
ALL_STREETS.push({ nums: [0, 1, 2], cost: 1, type: 'STRT0' });
ALL_STREETS.push({ nums: [0, 2, 3], cost: 1, type: 'STRT0' });

const ALL_SPLITS = [];
// Horizontal
for (let r = 1; r <= 36; r += 3) {
    ALL_SPLITS.push({ nums: [r, r + 1], cost: 1, type: 'SPL' });
    ALL_SPLITS.push({ nums: [r + 1, r + 2], cost: 1, type: 'SPL' });
}
// Vertical
for (let n = 1; n <= 33; n++) {
    ALL_SPLITS.push({ nums: [n, n + 3], cost: 1, type: 'SPL' });
}
ALL_SPLITS.push({ nums: [0, 1], cost: 1, type: 'SPL' });
ALL_SPLITS.push({ nums: [0, 2], cost: 1, type: 'SPL' });
ALL_SPLITS.push({ nums: [0, 3], cost: 1, type: 'SPL' });

const CANDIDATES = [
    ...ALL_LINES,
    ...ALL_CORNERS,
    ...ALL_STREETS,
    ...ALL_SPLITS
];

// OPTIMIZER
function optimize(targetNums) {
    const targetSet = new Set(targetNums);
    let remaining = new Set(targetNums);
    let chips = 0;

    // Greedy approach
    while (remaining.size > 0) {
        let bestBet = null;
        let bestCoveredCount = 0;
        let bestEfficiency = 0;

        for (const candidate of CANDIDATES) {
            const isClean = candidate.nums.every(n => targetSet.has(n));
            if (!isClean) continue;

            const useful = candidate.nums.filter(n => remaining.has(n)).length;
            if (useful === 0) continue;

            // Priority: Coverage > Efficiency?
            // Actually minimum chips means maximizing coverage per bet.
            if (useful > bestCoveredCount) {
                bestCoveredCount = useful;
                bestBet = candidate;
            }
        }

        if (bestBet && bestCoveredCount >= 2) {
            chips++;
            bestBet.nums.forEach(n => remaining.delete(n));
        } else {
            chips += remaining.size;
            break;
        }
    }
    return chips;
}

// MAIN LOOP
const RESULTS = {};
// We test all contiguous slices of size 7 that include the center number
// Possible ranges relative to center:
// [-6, 0] ... [0, +6] ? No, center must be somewhat central for it to be a "Nucleo".
// Let's constrain to "Center is within the middle 3" of the 7?
// Or just test ALL shifts: [-6, 0] to [0, +6]?
// User generally expects Nucleo to be "around" the number.
// Let's test shifts: [-5, +1] to [-1, +5] (The 5 patterns we found before)
// PLUS [-6, 0] and [0, +6]? Maybe too extreme.
// Let's stick to the 5 known forensic patterns + [-3, 3].
// Patterns:
// A: [-3, 3]
// B: [-4, 2]
// C: [-2, 4]
// D: [-1, 5]
// E: [-5, 1]
// F: [-6, 0] ?
// G: [0, 6] ?

const SHIFTS = [
    { n: -3, v: 3 }, // Standard
    { n: -4, v: 2 },
    { n: -2, v: 4 },
    { n: -5, v: 1 },
    { n: -1, v: 5 },
    { n: -6, v: 0 }, // Extreme Left
    { n: 0, v: 6 }   // Extreme Right
];

console.log("Analyzing Optimal Chip Economy for Each Number (Size 7)...");

Object.keys(RESULTS).forEach(k => delete RESULTS[k]); // Clear

for (let center = 0; center <= 36; center++) {
    const centerIdx = WHEEL_ORDER.indexOf(center);
    let bestShift = null;
    let minChips = Infinity;

    for (const shift of SHIFTS) {
        const target = [];
        for (let i = shift.n; i <= shift.v; i++) {
            let idx = (centerIdx + i) % 37;
            if (idx < 0) idx += 37;
            target.push(WHEEL_ORDER[idx]);
        }

        const cost = optimize(target);
        if (cost < minChips) {
            minChips = cost;
            bestShift = shift;
        } else if (cost === minChips) {
            // Tie breaker: Prefer symmetry (closer to [-3,3])
            const currDiff = Math.abs(Math.abs(shift.n) - Math.abs(shift.v));
            const bestDiff = Math.abs(Math.abs(bestShift.n) - Math.abs(bestShift.v));
            if (currDiff < bestDiff) {
                bestShift = shift;
            }
        }
    }
    RESULTS[center] = { ...bestShift, cost: minChips };
}

import fs from 'fs';
const out = {};
for (let i = 0; i <= 36; i++) {
    const r = RESULTS[i];
    out[i] = { n: [r.n, r.v], v: [-9, 9] };
}
fs.writeFileSync('src/utils/optimized_offsets.json', JSON.stringify(out, null, 2));
console.log("Written optimized_offsets.json");
