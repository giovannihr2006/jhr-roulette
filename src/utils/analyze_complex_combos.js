const NUMBERS = Array.from({ length: 37 }, (_, i) => i);
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const isRed = (n) => n !== 0 && REDS.includes(n);
const isBlack = (n) => n !== 0 && !REDS.includes(n);
const isEven = (n) => n !== 0 && n % 2 === 0;
const isOdd = (n) => n !== 0 && n % 2 !== 0;
const isLow = (n) => n >= 1 && n <= 18;
const isHigh = (n) => n >= 19 && n <= 36;

const getCol = (c) => NUMBERS.filter(n => n !== 0 && n % 3 === (c === 3 ? 0 : c));
const getDoz = (d) => NUMBERS.filter(n => n !== 0 && Math.ceil(n / 12) === d);

const CONTAINERS = [
    { name: 'Col 1', nums: getCol(1) },
    { name: 'Col 2', nums: getCol(2) },
    { name: 'Col 3', nums: getCol(3) },
    { name: 'Doz 1', nums: getDoz(1) },
    { name: 'Doz 2', nums: getDoz(2) },
    { name: 'Doz 3', nums: getDoz(3) }
];

const ATTRIBUTES = [
    { name: 'Red', check: isRed },
    { name: 'Black', check: isBlack },
    { name: 'Even', check: isEven },
    { name: 'Odd', check: isOdd },
    { name: 'Low', check: isLow },
    { name: 'High', check: isHigh }
];

console.log("=== COMPLEX COMBINATION ANALYSIS ===");

const combinations = [];

CONTAINERS.forEach(cont => {
    // Level 1: Container + 1 Attribute
    ATTRIBUTES.forEach(attr1 => {
        const nums = cont.nums.filter(attr1.check);
        combinations.push({
            name: `${cont.name} + ${attr1.name}`,
            count: nums.length,
            nums: nums,
            depth: 1
        });

        // Level 2: Container + 2 Attributes
        ATTRIBUTES.forEach((attr2, idx2) => {
            if (attr1 === attr2) return;
            // Prevent conflicting attributes (Red + Black, Even + Odd, Low + High)
            if (
                (attr1.name === 'Red' && attr2.name === 'Black') ||
                (attr1.name === 'Black' && attr2.name === 'Red') ||
                (attr1.name === 'Even' && attr2.name === 'Odd') ||
                (attr1.name === 'Odd' && attr2.name === 'Even') ||
                (attr1.name === 'Low' && attr2.name === 'High') ||
                (attr1.name === 'High' && attr2.name === 'Low')
            ) return;

            // Avoid duplicates (Red+Even vs Even+Red) - enforce order?
            // Simple check: compare names to ensure unique order
            if (attr1.name > attr2.name) return;

            const nums2 = nums.filter(attr2.check);
            combinations.push({
                name: `${cont.name} + ${attr1.name} + ${attr2.name}`,
                count: nums2.length,
                nums: nums2,
                depth: 2
            });

            // Level 3: Container + 3 Attributes
            // (Only possible if A=Color, B=Parity, C=Range)
            ATTRIBUTES.forEach((attr3) => {
                if (attr3 === attr1 || attr3 === attr2) return;
                // Conflicts
                if (
                    (attr3.name === 'Red' && (attr1.name === 'Black' || attr2.name === 'Black')) ||
                    (attr3.name === 'Black' && (attr1.name === 'Red' || attr2.name === 'Red')) ||
                    (attr3.name === 'Even' && (attr1.name === 'Odd' || attr2.name === 'Odd')) ||
                    (attr3.name === 'Odd' && (attr1.name === 'Even' || attr2.name === 'Even')) ||
                    (attr3.name === 'Low' && (attr1.name === 'High' || attr2.name === 'High')) ||
                    (attr3.name === 'High' && (attr1.name === 'Low' || attr2.name === 'Low'))
                ) return;

                if (attr2.name > attr3.name) return;

                const nums3 = nums2.filter(attr3.check);
                combinations.push({
                    name: `${cont.name} + ${attr1.name} + ${attr2.name} + ${attr3.name}`,
                    count: nums3.length,
                    nums: nums3,
                    depth: 3
                });
            });
        });
    });
});

// Sort by Count DESC
combinations.sort((a, b) => b.count - a.count);

console.log("TOP 20 DENSEST CLUSTERS:");
combinations.slice(0, 20).forEach((c, i) => {
    console.log(`${i + 1}. ${c.name}: ${c.count} nums (${c.nums.join(',')})`);
});

console.log("\nTOP 5 'SUPER COMBOS' (Depth 2, Density >= 4):");
const depth2 = combinations.filter(c => c.depth === 2 && c.count >= 4);
depth2.slice(0, 10).forEach(c => console.log(`- ${c.name}: ${c.count}`));

console.log("\nTOP 5 'HYPER COMBOS' (Depth 3, Density >= 2):");
const depth3 = combinations.filter(c => c.depth === 3 && c.count >= 2);
depth3.slice(0, 10).forEach(c => console.log(`- ${c.name}: ${c.count}`));
