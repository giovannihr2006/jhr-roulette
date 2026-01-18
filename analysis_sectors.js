import fs from 'fs';

// EUROPEAN WHEEL ORDER (Clockwise from 0)
const WHEEL = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Helper: Get Sector (Center + 3 neighbors each side -> 7 numbers)
function getSector(centerNum) {
    const idx = WHEEL.indexOf(centerNum);
    const sector = [];
    for (let i = -3; i <= 3; i++) {
        let neighborIdx = (idx + i) % WHEEL.length;
        if (neighborIdx < 0) neighborIdx += WHEEL.length;
        sector.push(WHEEL[neighborIdx]);
    }
    return sector;
}

// --- BOARD TOPOLOGY HELPERS ---

// Sort helpers
const numeric = (a, b) => a - b;

// Check if a subset exists in the huge superset
function isSubset(subset, superset) {
    return subset.every(val => superset.includes(val));
}

// VALID BET GENERATORS
// All bets that cover > 1 number

// 1. SPLITS (2 nums)
function getSplits() {
    const splits = [];
    // Horizontal
    for (let r = 1; r <= 36; r++) {
        if (r % 3 !== 0) splits.push([r, r + 1]); // 1-2, 2-3, 4-5...
    }
    // Vertical
    for (let r = 1; r <= 33; r++) splits.push([r, r + 3]);
    // Zero
    splits.push([0, 1], [0, 2], [0, 3]);
    // 0-2? 0-2 (Split)? Yes, 0 shares with 1,2,3.
    // Standard European Layout allows 0-1, 0-2, 0-3.
    return splits;
}

// 2. STREETS (3 nums) (Rows only: 1-2-3, 4-5-6...)
// Also 0-1-2, 0-2-3 (Basket)
function getStreets() {
    const streets = [];
    for (let r = 1; r <= 34; r += 3) {
        streets.push([r, r + 1, r + 2]);
    }
    streets.push([0, 1, 2], [0, 2, 3]);
    return streets;
}

// 3. CORNERS (4 nums)
// Square on board
// (n, n+1, n+3, n+4)
// Valid if n%3 != 0
function getCorners() {
    const corners = [];
    for (let r = 1; r <= 32; r++) {
        if (r % 3 !== 0) {
            corners.push([r, r + 1, r + 3, r + 4]);
        }
    }
    // Zero Corner (0-1-2-3 First Four)
    corners.push([0, 1, 2, 3]);
    return corners;
}

// 4. SIX LINES (6 nums)
// Two adjacent rows
// (n, n+1, n+2, n+3, n+4, n+5) where n is start of a row (1, 4, 7...)
function getSixLines() {
    const sixlines = [];
    for (let r = 1; r <= 31; r += 3) {
        sixlines.push([r, r + 1, r + 2, r + 3, r + 4, r + 5]);
    }
    return sixlines;
}

const ALL_SPLITS = getSplits();
const ALL_STREETS = getStreets();
const ALL_CORNERS = getCorners();
const ALL_SIXLINES = getSixLines();

function calculateOptimalCost(sectorInput) {
    const sector = [...sectorInput].sort(numeric);
    let remaining = [...sector];
    let cost = 0;
    let strategy = [];

    // GREEDY APPROACH (Approximation)
    // 1. Try biggest checks (Six Lines)
    // 2. Try Corners
    // 3. Try Streets
    // 4. Try Splits
    // 5. Fill Straights

    // Check Six Lines
    for (const bet of ALL_SIXLINES) {
        if (isSubset(bet, remaining)) {
            cost += 1;
            strategy.push(`SixLine(${bet[0]}-${bet[5]})`);
            remaining = remaining.filter(n => !bet.includes(n));
        }
    }

    // Check Corners
    for (const bet of ALL_CORNERS) {
        if (isSubset(bet, remaining)) {
            cost += 1;
            strategy.push(`Corner(${bet[0]}-${bet[3]})`);
            remaining = remaining.filter(n => !bet.includes(n));
        }
    }

    // Check Streets
    for (const bet of ALL_STREETS) {
        if (isSubset(bet, remaining)) {
            cost += 1;
            strategy.push(`Street(${bet.join('-')})`);
            remaining = remaining.filter(n => !bet.includes(n));
        }
    }

    // Check Splits
    // Find all valid splits strictly within 'remaining'
    const validSplits = [];
    for (const split of ALL_SPLITS) {
        if (isSubset(split, remaining)) {
            validSplits.push(split);
        }
    }

    // Find max independent set of splits exhaustively for optimal coverage
    let bestSplitSet = [];
    let maxSplitsCount = 0;

    function findMaxSplits(currentSet, currentUsed) {
        if (currentSet.length > maxSplitsCount) {
            maxSplitsCount = currentSet.length;
            bestSplitSet = currentSet;
        }

        for (const split of validSplits) {
            if (!currentUsed.includes(split[0]) && !currentUsed.includes(split[1])) {
                // Determine order to avoid permutations
                const lastSplit = currentSet[currentSet.length - 1];
                // Simple unique check: only add if split[0] > lastSplit[0]
                if (!lastSplit || (split[0] > lastSplit[0])) {
                    findMaxSplits([...currentSet, split], [...currentUsed, ...split]);
                }
            }
        }
    }

    findMaxSplits([], []);

    if (bestSplitSet.length > 0) {
        cost += bestSplitSet.length;
        bestSplitSet.forEach(s => strategy.push(`Split(${s.join('-')})`));
        const coveredBySplits = bestSplitSet.flat();
        remaining = remaining.filter(n => !coveredBySplits.includes(n));
    }

    // Straights
    if (remaining.length > 0) {
        cost += remaining.length;
        remaining.forEach(n => strategy.push(`Straight(${n})`));
    }

    return {
        center: sectorInput[3], // Center of 7 is index 3
        sector: sectorInput,
        cost,
        strategy: strategy.join(' + ')
    };
}

// MAIN EXECUTION
const results = [];
for (let i = 0; i < WHEEL.length; i++) {
    const center = WHEEL[i];
    const sector = getSector(center);
    const analysis = calculateOptimalCost(sector);
    results.push(analysis);
}

// Sort: Cost ASC
results.sort((a, b) => a.cost - b.cost);

// Format
let output = "# ANÁLISIS JEU N (7 NÚMEROS: VECINOS 3+3)\n\n";
output += "| Juego (Centro) | Sector Completo | Costo (Fichas) | Coef. Eficiencia (Nums/Ficha) | Estrategia |\n";
output += "| :---: | :--- | :---: | :---: | :--- |\n";

results.forEach(r => {
    const efficiency = (7 / r.cost).toFixed(2);
    output += `| **${r.center}** | ${r.sector.join(', ')} | **${r.cost}** | **${efficiency}** | ${r.strategy} |\n`;
});

fs.writeFileSync('analysis_results_7.md', output);
console.log("Written to analysis_results_7.md");
