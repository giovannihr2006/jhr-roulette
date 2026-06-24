import fs from 'fs';

// WHEEL ORDER
const WHEEL = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// 1. Define Segments via Rotation
function getSegments(center) {
    const centerIdx = WHEEL.indexOf(center);

    // Voisins: Center +/- 8 (Total 17)
    // Actually Standard Voisins (Zero) is specific.
    // Zero is Center. Left 9 nums (22..26). Right 7 nums (32..25). 
    // Wait. Voisins du Zero spans from 22 to 25.
    // 22 18 29 7 28 12 35 3 26 0 32 15 19 4 21 2 25
    // Count: 17.
    // Center is 0? 
    // 0 is index 0.
    // Left side: 26, 3, 35, 12, 28, 7, 29, 18, 22 (9 nums).
    // Right side: 32, 15, 19, 4, 21, 2, 25 (7 nums).
    // It's asymmetrical.

    // Tiers: Opposite sector (33 to 27). 12 nums.
    // 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27.

    // Orphans: The rest. (1, 20, 14, 31, 9) and (17, 34, 6).

    // To replicate this for 23, we simply rotate the mask.
    // Standard Zero (0):
    // Mask: Voisins[-9 to +7], Tiers[Opposite], Orphans[Gaps].
    // Let's deduce the Indices relative to center 0.
    // 0 is at index 0.
    // Voisins: Indices [28..35] (Left 9) + [0..7] (Right 8?? No. 0 is counted).
    // Let's map indices for Center 0:
    // Wheel length 37.
    // Voisins Indices (Hardcoded Standard): [28, 29, 30, 31, 32, 33, 34, 35, 0, 1, 2, 3, 4, 5, 6, 7] - Wait 17 nums.
    // 22 is index 28. (WHEEL[28] = 22). Correct.
    // 25 is index 7. (WHEEL[7] = 25). Correct.
    // So Voisins is Range [-9, +7] (relative idx).

    // Tiers Indices (Standard):
    // 33 (idx 22) to 27 (idx 11).
    // 27 is 11. 33 is 22.
    // Range [11, 22]. (12 nums).
    // Relative to 0 (idx 0), this is [+11, +22].

    // Orphans: The gaps.
    // Gap 1: [8, 10]. (17, 34, 6). Indices 8, 9, 10.
    // Gap 2: [23, 27]. (1, 20, 14, 31, 9). Indices 23, 24, 25, 26, 27.

    // So the "Template" relative to Center Index C:
    // Voisins: [C-9, C+7] (modulo 37).
    // Orphans 1 (Right): [C+8, C+10].
    // Tiers: [C+11, C+22].
    // Orphans 2 (Left): [C+23, C+27] (approx C-14 to C-10).

    const vois_indices = [];
    for (let k = -9; k <= 7; k++) vois_indices.push((centerIdx + k + 3700) % 37);

    const orph1_indices = [];
    for (let k = 8; k <= 10; k++) orph1_indices.push((centerIdx + k + 3700) % 37);

    const tiers_indices = [];
    for (let k = 11; k <= 22; k++) tiers_indices.push((centerIdx + k + 3700) % 37);

    const orph2_indices = [];
    for (let k = 23; k <= 27; k++) orph2_indices.push((centerIdx + k + 3700) % 37);

    const orphans = [...orph1_indices, ...orph2_indices].map(i => WHEEL[i]);
    const voisins = vois_indices.map(i => WHEEL[i]);
    const tiers = tiers_indices.map(i => WHEEL[i]);
    const game7 = []; // The Core 7 (C-3 to C+3)
    for (let k = -3; k <= 3; k++) game7.push(WHEEL[(centerIdx + k + 3700) % 37]);

    return { center, orphans, game7 };
}

// 2. Betting Optimizer (from previous script)
function getSplits() {
    const splits = [];
    for (let r = 1; r <= 36; r++) { if (r % 3 !== 0) splits.push([r, r + 1]); }
    for (let r = 1; r <= 33; r++) splits.push([r, r + 3]);
    splits.push([0, 1], [0, 2], [0, 3]);
    return splits;
}
const ALL_SPLITS = getSplits();

function isSubset(subset, superset) {
    return subset.every(val => superset.includes(val));
}

function optimizeSet(nums) {
    // Greedy Split Finder
    const numeric = (a, b) => a - b;
    let remaining = [...nums].sort(numeric);
    let cost = 0;
    let strategy = [];

    // Find valid splits in superset
    const validSplits = ALL_SPLITS.filter(s => isSubset(s, remaining));

    // Exhaustive Max Match
    let bestSet = [];
    let maxLen = 0;

    function solve(curr, used) {
        if (curr.length > maxLen) { maxLen = curr.length; bestSet = curr; }
        for (const s of validSplits) {
            if (!used.includes(s[0]) && !used.includes(s[1])) {
                const last = curr[curr.length - 1];
                if (!last || s[0] > last[0]) solve([...curr, s], [...used, ...s]);
            }
        }
    }
    solve([], []);

    if (bestSet.length > 0) {
        cost += bestSet.length;
        bestSet.forEach(s => strategy.push(`Split(${s.join('-')})`));
        const covered = bestSet.flat();
        remaining = remaining.filter(n => !covered.includes(n));
    }

    if (remaining.length > 0) {
        cost += remaining.length;
        remaining.forEach(n => strategy.push(`Straight(${n})`));
    }

    return { cost, strategy: strategy.join(' + ') };
}

// MAIN
const CENTERS = [0, 26, 23]; // 0 (Base Check), 26 (Requested), 23 (Requested)
let output = "# ANÁLISIS HUÉRFANOS Y JUEGO MAESTRO\n\n";

CENTERS.forEach(c => {
    const data = getSegments(c);

    // Analyze Juego 7
    // const j7 = optimizeSet(data.game7); 
    // We already know Jeu 26 and Jeu 23 are Cost 4. Just listing contents.

    // Analyze Orphans
    const orph = optimizeSet(data.orphans);

    output += `## CENTRO ${c} (Juego del ${c})\n`;
    output += `*   **Números del Juego (7):** ${data.game7.join(', ')}\n`;
    output += `*   **Huérfanos Calculados (8):** ${data.orphans.join(', ')}\n`;
    output += `*   **Estrategia Huérfanos (Costo ${orph.cost}):** ${orph.strategy}\n\n`;
});

fs.writeFileSync('analysis_orphans.md', output);
console.log("Done. written to analysis_orphans.md");
