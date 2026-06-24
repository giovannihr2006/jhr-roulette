const NUMBERS = Array.from({ length: 37 }, (_, i) => i);
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const isRed = (n) => n !== 0 && REDS.includes(n);
const isBlack = (n) => n !== 0 && !REDS.includes(n);
const isEven = (n) => n !== 0 && n % 2 === 0;
const isOdd = (n) => n !== 0 && n % 2 !== 0;
const isLow = (n) => n >= 1 && n <= 18;
const isHigh = (n) => n >= 19 && n <= 36;

const getCol = (c) => NUMBERS.filter(n => n !== 0 && n % 3 === (c === 3 ? 0 : c)); // Col 1(1,4..), Col 2(2,5..), Col 3(3,6..)
const getDoz = (d) => NUMBERS.filter(n => n !== 0 && Math.ceil(n / 12) === d);

const CONTAINERS = [
    { name: 'Col 1', nums: getCol(1), type: 'COL' },
    { name: 'Col 2', nums: getCol(2), type: 'COL' },
    { name: 'Col 3', nums: getCol(3), type: 'COL' },
    { name: 'Doz 1', nums: getDoz(1), type: 'DOZ' },
    { name: 'Doz 2', nums: getDoz(2), type: 'DOZ' },
    { name: 'Doz 3', nums: getDoz(3), type: 'DOZ' }
];

const ATTRIBUTES = [
    { name: 'Red', check: isRed },
    { name: 'Black', check: isBlack },
    { name: 'Even', check: isEven },
    { name: 'Odd', check: isOdd },
    { name: 'Low', check: isLow },
    { name: 'High', check: isHigh }
];

console.log("=== SIMPLE EFFICIENCY ANALYSIS ===");

CONTAINERS.forEach(cont => {
    console.log(`\nParent: ${cont.name} (12 Nums)`);
    ATTRIBUTES.forEach(attr => {
        const count = cont.nums.filter(attr.check).length;
        // Calculation: 
        // Subset Size: count
        // Parent Size: 12
        // Efficiency: count/12 (Density of attribute in container)
        // Global Efficiency: count/37? No, bet covers 12.
        // User asked for "F/N". Chips / Number?
        // If I bet 1 Chip on "Col 2", I get 8 Blacks.
        // Cost: 1. Target: 8.
        // F/N: 1/8 ?
        // Or "8 Blacks in 12".
        console.log(`  - ${attr.name}: ${count}/12`);
    });
});
