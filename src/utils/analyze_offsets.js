
const OFFSETS_0_36 = {
    0: { n: [-3, 3], v: [-9, 9] },
    1: { n: [-4, 2], v: [-9, 9] },
    2: { n: [-4, 2], v: [-9, 9] },
    3: { n: [-3, 3], v: [-9, 9] },
    4: { n: [-2, 4], v: [-9, 9] },
    5: { n: [-3, 3], v: [-9, 9] },
    6: { n: [-2, 4], v: [-9, 9] },
    7: { n: [-1, 5], v: [-9, 9] },
    8: { n: [-1, 5], v: [-9, 9] },
    9: { n: [-4, 2], v: [-9, 9] },
    10: { n: [-4, 2], v: [-9, 9] },
    11: { n: [-3, 3], v: [-9, 9] },
    12: { n: [-1, 5], v: [-9, 9] },
    13: { n: [-2, 4], v: [-9, 9] },
    14: { n: [-3, 3], v: [-9, 9] },
    15: { n: [-5, 1], v: [-9, 9] },
    16: { n: [-5, 1], v: [-9, 9] },
    17: { n: [-3, 3], v: [-9, 9] },
    18: { n: [-2, 4], v: [-9, 9] },
    19: { n: [-3, 3], v: [-9, 9] },
    20: { n: [-3, 3], v: [-9, 9] },
    21: { n: [-5, 1], v: [-9, 9] },
    22: { n: [-1, 5], v: [-9, 9] },
    23: { n: [-3, 3], v: [-9, 9] },
    24: { n: [-4, 2], v: [-9, 9] },
    25: { n: [-3, 3], v: [-9, 9] },
    26: { n: [-3, 3], v: [-9, 9] },
    27: { n: [-1, 5], v: [-9, 9] },
    28: { n: [-5, 1], v: [-9, 9] },
    29: { n: [-3, 3], v: [-9, 9] },
    30: { n: [-1, 5], v: [-9, 9] },
    31: { n: [-3, 3], v: [-9, 9] },
    32: { n: [-5, 1], v: [-9, 9] },
    33: { n: [-5, 1], v: [-9, 9] },
    34: { n: [-3, 3], v: [-9, 9] },
    35: { n: [-1, 5], v: [-9, 9] },
    36: { n: [-3, 3], v: [-9, 9] },
};

const analysis = {};
const reverseMap = {};

Object.entries(OFFSETS_0_36).forEach(([num, offsets]) => {
    const key = JSON.stringify(offsets);
    if (!analysis[key]) {
        analysis[key] = [];
    }
    analysis[key].push(num);
});

console.log("--- FORENSIC ANALYSIS OF SECTOR DEFINITIONS ---");
console.log("Total Numbers:", Object.keys(OFFSETS_0_36).length);
console.log("Unique Patterns:", Object.keys(analysis).length);
console.log("\n--- DUPLICATE PATTERNS ---");

Object.entries(analysis).forEach(([key, nums]) => {
    const parsed = JSON.parse(key);
    const label = `N=[${parsed.n}] V=[${parsed.v}]`;
    console.log(`${label}: Count ${nums.length} -> [${nums.join(', ')}]`);
});
