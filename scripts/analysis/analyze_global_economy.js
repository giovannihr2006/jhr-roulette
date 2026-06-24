
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// --- 1. DEFINITIONS ---
const BET_TYPES = [
    { name: 'Simple Chance (Red/Black/Odd/Even/High/Low)', cost: 1, coverage: 18, payout: 1 },
    { name: 'Dozen / Column', cost: 1, coverage: 12, payout: 2 },
    { name: 'Six Line (Seisena)', cost: 1, coverage: 6, payout: 5 },
    { name: 'Corner (Cuadro)', cost: 1, coverage: 4, payout: 8 },
    { name: 'Street (Calle)', cost: 1, coverage: 3, payout: 11 },
    { name: 'Split (Caballo)', cost: 1, coverage: 2, payout: 17 },
    { name: 'Straight Up (Pleno)', cost: 1, coverage: 1, payout: 35 },
];

// Complex System Definitions (Forensic Geometry)
const getSectorStats = (centerNum, type) => {
    const centerIndex = WHEEL_ORDER.indexOf(centerNum);
    const getCount = (start, end) => {
        // Simple count of indices in circular range
        if (end >= start) return end - start + 1;
        return (37 - start) + end + 1; // Wrap around
    };

    if (type === 'NUCLEO') { // [-4, +2]
        return { name: `Nucleo ${centerNum}`, cost: 4, coverage: 7 }; // 4 chips (3 splits + 1 straight usually, or 4 splits optimal?)
        // Actually Jeu Zero is: 1 Straight (26), 3 Splits (0/3, 12/15, 32/35). Total 4 chips.
    }
    if (type === 'TERCIO') { // [+11, +22] -> 12 nums
        // Tiers is 6 splits.
        return { name: `Tercio ${centerNum}`, cost: 6, coverage: 12 };
    }
    if (type === 'VECINOS') { // [-9, +7] -> 17 nums
        // Voisins is 9 chips (2 street, 5 split, 1 corner, 1 trio? No, classical is 9 chips).
        // 2 chips on 0/2/3 (Street/Trio), 1 on 4/7, 1 on 12/15, 1 on 18/21, 1 on 19/22, 2 on 25/26/28/29 (Corner), 1 on 32/35.
        return { name: `Vecinos ${centerNum}`, cost: 9, coverage: 17 };
    }
    if (type === 'HUERFANOS') { // 8 nums
        // 1 chip on 1 (Straight), 4 splits (6/9, 14/17, 17/20, 31/34). Total 5 chips.
        return { name: `Huerfanos ${centerNum}`, cost: 5, coverage: 8 };
    }
    return null;
};

// --- 2. GENERATE ALL CANDIDATES ---
let candidates = [...BET_TYPES];

// Add specific system instances for key numbers (0, 26, etc) to check meaningful variations
// We assume the cost/coverage is constant for the TYPE of system,
// even if the specific chips change positions, the "System Class" economy is constant.
candidates.push(getSectorStats(0, 'NUCLEO')); // Jeu Zero
candidates.push(getSectorStats(0, 'VECINOS')); // Voisins Standard
candidates.push(getSectorStats(33, 'TERCIO')); // Tiers Standard (Center 33 approx)
candidates.push(getSectorStats(1, 'HUERFANOS')); // Orphelins Standard

// --- 3. ANALYSIS ---
const analyze = () => {
    console.log("--- FORENSIC BETTING ANALYSIS ---\n");
    console.log("BASELINE: 'Vecinos del Cero' (Voisins)");
    console.log("  > Cost: 9, Coverage: 17, Eff Ratio: 0.529 chips/num\n");

    const results = candidates.map(c => {
        const ratio = c.cost / c.coverage; // Lower is better economy
        const prob = c.coverage / 37;
        // "Rentabilidad" often means ROI or "Bang for Buck".
        // EV is constant. But "Hit Rate per Chip" is 1/Ratio.

        // Let's define a "Score":
        // We want Low Cost, High Coverage.
        // Simple Ratio (Cost/Coverage) ranks Economy.

        return {
            ...c,
            ratio: ratio.toFixed(4),
            prob: (prob * 100).toFixed(1) + '%'
        };
    });

    // FIND THE "BETTER THAN VOISINS"
    const voisinsRatio = 9 / 17; // 0.5294
    const better = results.filter(r => parseFloat(r.ratio) < voisinsRatio);

    // Sort by most economic (lowest ratio)
    better.sort((a, b) => parseFloat(a.ratio) - parseFloat(b.ratio));

    console.log(`FOUND ${better.length} BETS MORE ECONOMICAL THAN VOISINS:\n`);

    better.slice(0, 10).forEach((b, i) => {
        console.log(`#${i + 1} [${b.name.toUpperCase()}]`);
        console.log(`   Cost: ${b.cost} | Coverage: ${b.coverage} nums`);
        console.log(`   ECONOMY: ${b.ratio} chips/num (Lower is Cheaper)`);
        console.log(`   Hit Chance: ${b.prob}`);
        const improvement = ((voisinsRatio - parseFloat(b.ratio)) / voisinsRatio * 100).toFixed(1);
        console.log(`   >> ${improvement}% more efficient than Vecinos\n`);
    });
};

analyze();
