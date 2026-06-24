
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

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

    const nucleo = getSlice(-4, 2);
    const vecinos = getSlice(-9, 7);
    const tiers = getSlice(11, 22);
    const orphelins = [...getSlice(8, 10), ...getSlice(23, 27)];

    return { nucleo, vecinos, tiers, orphelins };
};

console.log("--- FORENSIC AUDIT OF ROULETTE SECTORS ---");
let errors = 0;

for (let i = 0; i <= 36; i++) {
    const sectors = getRelativeSectors(i);
    const { orphelins, vecinos, tiers } = sectors;

    // Check 1: Orphans Count
    if (orphelins.length !== 8) {
        console.error(`ERROR NUM ${i}: Orphans count is ${orphelins.length} (Expected 8)`);
        errors++;
    }

    // Check 2: Duplicates within Orphans
    const uniqueOrphs = new Set(orphelins);
    if (uniqueOrphs.size !== orphelins.length) {
        console.error(`ERROR NUM ${i}: Duplicates found in Orphans:`, orphelins);
        errors++;
    }

    // Check 3: Overlap with Vecinos
    const vecSet = new Set(vecinos);
    const orphInVec = orphelins.filter(n => vecSet.has(n));
    if (orphInVec.length > 0) {
        console.error(`ERROR NUM ${i}: Orphans overlap with Vecinos:`, orphInVec);
        errors++;
    }

    // Check 4: Overlap with Tiers
    const tierSet = new Set(tiers);
    const orphInTier = orphelins.filter(n => tierSet.has(n));
    if (orphInTier.length > 0) {
        console.error(`ERROR NUM ${i}: Orphans overlap with Tiers:`, orphInTier);
        errors++;
    }

    // Check 5: Total Coverage (Vecinos + Tiers + Orphans = 37)
    // Note: Vecinos (17) + Tiers (12) + Orphans (8) = 37
    const allNums = new Set([...vecinos, ...tiers, ...orphelins]);
    if (allNums.size !== 37) {
        console.error(`ERROR NUM ${i}: Total coverage is ${allNums.size} (Expected 37). Missing/Dupes.`);
        errors++;
    }

    if ([0, 26, 23, 10].includes(i)) {
        console.log(`\n--- SYSTEM ${i} FORENSIC REPORT ---`);
        console.log(`Nucleo (${nucleo.length}): [${nucleo.join(', ')}]`);
        console.log(`Vecinos (${vecinos.length}): [${vecinos.join(', ')}]`);
        console.log(`Tiers (${tiers.length}): [${tiers.join(', ')}]`);
        console.log(`Orphelins (${orphelins.length}): [${orphelins.join(', ')}]`);
        console.log(`Check: Overlaps found? ${orphInVec.length + orphInTier.length > 0 ? "YES (FAIL)" : "NO (PASS)"}`);
        console.log(`Check: Total Coverage? ${allNums.size === 37 ? "37/37 (PASS)" : "FAIL"}`);
    }
}

if (errors === 0) {
    console.log("SUCCESS: All 37 systems verified. No repetitions, overlaps, or coverage gaps.");
} else {
    console.log(`FAILED: ${errors} errors found.`);
}
