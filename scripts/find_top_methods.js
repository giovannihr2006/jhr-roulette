
// Logic extracted from MethodsTable.jsx
const ALL_NUMBERS = Array.from({ length: 37 }, (_, i) => i); // 0-36
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const isRed = (n) => REDS.includes(n);
const isBlack = (n) => n !== 0 && !REDS.includes(n);
const isEven = (n) => n !== 0 && n % 2 === 0;
const isOdd = (n) => n !== 0 && n % 2 !== 0;
const isLow = (n) => n >= 1 && n <= 18;
const isHigh = (n) => n >= 19 && n <= 36;
const isDoc1 = (n) => n >= 1 && n <= 12;
const isDoc2 = (n) => n >= 13 && n <= 24;
const isDoc3 = (n) => n >= 25 && n <= 36;
const isCol1 = (n) => n !== 0 && n % 3 === 1;
const isCol2 = (n) => n !== 0 && n % 3 === 2;
const isCol3 = (n) => n !== 0 && n % 3 === 0;

const calculateEconomics = (bajoAlto, color, parImpar, docCol) => {
    let safetyCount = 0;
    let powerCount = 0;
    let totalNet = 0;

    for (let n = 0; n <= 36; n++) {
        let returns = 0;
        if (n !== 0) {
            if (bajoAlto === 'BAJO' && isLow(n)) returns += 2;
            else if (bajoAlto === 'ALTO' && isHigh(n)) returns += 2;

            if (color === 'NEGRO' && isBlack(n)) returns += 2;
            else if (color === 'ROJO' && isRed(n)) returns += 2;

            if (parImpar === 'PAR' && isEven(n)) returns += 2;
            else if (parImpar === 'IMPAR' && isOdd(n)) returns += 2;

            if (docCol.includes('DOC')) {
                const doc1 = docCol.includes('1RA');
                const doc2 = docCol.includes('2DA');
                if ((doc1 && isDoc1(n)) || (doc2 && isDoc2(n)) || (!doc1 && !doc2 && isDoc3(n))) returns += 3;
            } else {
                const col1 = docCol.includes('1RA');
                const col2 = docCol.includes('2DA');
                if ((col1 && isCol1(n)) || (col2 && isCol2(n)) || (!col1 && !col2 && isCol3(n))) returns += 3;
            }
        }
        const net = returns - 4;
        totalNet += net;
        if (net >= 0) safetyCount++;
        if (net > 0) powerCount++;
    }

    return {
        safety: (safetyCount / 37) * 100,
        power: (powerCount / 37) * 100,
        ev: totalNet / 37
    };
};

// Generate Data
const data = [];
const bajoAlto = ['BAJO', 'ALTO'];
const colors = ['NEGRO', 'ROJO'];
const parImpar = ['PAR', 'IMPAR'];
const docenas = ['1RA DOC', '2DA DOC', '3RA DOC'];
const columnas = ['1RA COL', '2DACOL', '3RACOL'];

let methodNum = 1;
// Note: Loop order must match original file to get correct Method IDs
// Original loops:
// for (let ba of bajoAlto)
//   for (let col of colors)
//     for (let pi of parImpar)
//       for (let doc of docenas) ... then cols...
// Actually original file had:
// const docenas = ['1RA DOC', '2DA DOC', '3RA DOC'];
// const columnas = ['1RA COL', '2DACOL', '3RACOL'];
// And looped docenas THEN columnas inside same level?
// No, it was likely generating 72 combinations but methodNum <= 48 check.
// Let's re-read the file structure carefully or just implement the same generation logic.
// Original code lines 97-101:
// for(ba) for(col) for(pi)
//    for(doc of docenas) -> push
//    for(column of columnas) -> push
// wait, that would be 6 inner iterations? NO.
// Let's look at lines 97-117 of MethodsTable.jsx in previous turn.
// It iterates:
// for (let ba of bajoAlto)
//   for (let col of colors)
//     for (let pi of parImpar)
//       for (let doc of docenas) ...
//       for (let column of columnas) ...
// Wait, the loops were nested?
// 2 * 2 * 2 * 3 * 3 = 72.
// It checks if (methodNum <= 48).
// So it takes the first 48.
// Order: BAJO/ALTO -> COLOR -> PAR/IMPAR -> DOCENAS -> COLUMNAS.
// Actually lines 100-101 are:
// for (let doc of docenas) {
//    for (let column of columnas) {
// This implies it generates Doc 1 + Col 1, Doc 1 + Col 2, etc?
// That would mean 4 attributes? No "Zone" is either Doc OR Col.
// Ah, the user provided a manual list in `generateMethodsWithEfficiency`!
// Line 123: const generateMethodsWithEfficiency = () => { const pattern = [ ... ] }
// OK, I should use THAT pattern. I will copy strict pattern from file.

const pattern = [
    [1, 'BAJO', 'NEGRO', 'PAR', '1RA DOC'],
    [2, 'BAJO', 'NEGRO', 'PAR', '2DA DOC'],
    [3, 'BAJO', 'NEGRO', 'PAR', '3RA DOC'],
    [4, 'BAJO', 'NEGRO', 'PAR', '1RA COL'],
    [5, 'BAJO', 'NEGRO', 'PAR', '2DA COL'],
    [6, 'BAJO', 'NEGRO', 'PAR', '3RA COL'],
    [7, 'ALTO', 'NEGRO', 'PAR', '1RA DOC'],
    [8, 'ALTO', 'NEGRO', 'PAR', '2DA DOC'],
    [9, 'ALTO', 'NEGRO', 'PAR', '3RA DOC'],
    [10, 'ALTO', 'NEGRO', 'PAR', '1RA COL'],
    [11, 'ALTO', 'NEGRO', 'PAR', '2DA COL'],
    [12, 'ALTO', 'NEGRO', 'PAR', '3RA COL'],
    [13, 'BAJO', 'NEGRO', 'IMPAR', '1RA DOC'],
    [14, 'BAJO', 'NEGRO', 'IMPAR', '2DA DOC'],
    [15, 'BAJO', 'NEGRO', 'IMPAR', '3RA DOC'],
    [16, 'BAJO', 'NEGRO', 'IMPAR', '1RA COL'],
    [17, 'BAJO', 'NEGRO', 'IMPAR', '2DA COL'],
    [18, 'BAJO', 'NEGRO', 'IMPAR', '3RA COL'],
    [19, 'ALTO', 'NEGRO', 'IMPAR', '1RA DOC'],
    [20, 'ALTO', 'NEGRO', 'IMPAR', '2DA DOC'],
    [21, 'ALTO', 'NEGRO', 'IMPAR', '3RA DOC'],
    [22, 'ALTO', 'NEGRO', 'IMPAR', '1RA COL'],
    [23, 'ALTO', 'NEGRO', 'IMPAR', '2DA COL'],
    [24, 'ALTO', 'NEGRO', 'IMPAR', '3RA COL'],
    [25, 'BAJO', 'ROJO', 'PAR', '1RA DOC'],
    [26, 'BAJO', 'ROJO', 'PAR', '2DA DOC'],
    [27, 'BAJO', 'ROJO', 'PAR', '3RA DOC'],
    [28, 'BAJO', 'ROJO', 'PAR', '1RA COL'],
    [29, 'BAJO', 'ROJO', 'PAR', '2DA COL'],
    [30, 'BAJO', 'ROJO', 'PAR', '3RA COL'],
    [31, 'ALTO', 'ROJO', 'PAR', '1RA DOC'],
    [32, 'ALTO', 'ROJO', 'PAR', '2DA DOC'],
    [33, 'ALTO', 'ROJO', 'PAR', '3RA DOC'],
    [34, 'ALTO', 'ROJO', 'PAR', '1RA COL'],
    [35, 'ALTO', 'ROJO', 'PAR', '2DA COL'],
    [36, 'ALTO', 'ROJO', 'PAR', '3RA COL'],
    [37, 'BAJO', 'ROJO', 'IMPAR', '1RA DOC'],
    [38, 'BAJO', 'ROJO', 'IMPAR', '2DA DOC'],
    [39, 'BAJO', 'ROJO', 'IMPAR', '3RA DOC'],
    [40, 'BAJO', 'ROJO', 'IMPAR', '1RA COL'],
    [41, 'BAJO', 'ROJO', 'IMPAR', '2DA COL'],
    [42, 'BAJO', 'ROJO', 'IMPAR', '3RA COL'],
    [43, 'ALTO', 'ROJO', 'IMPAR', '1RA DOC'],
    [44, 'ALTO', 'ROJO', 'IMPAR', '2DA DOC'],
    [45, 'ALTO', 'ROJO', 'IMPAR', '3RA DOC'],
    [46, 'ALTO', 'ROJO', 'IMPAR', '1RA COL'],
    [47, 'ALTO', 'ROJO', 'IMPAR', '2DA COL'],
    [48, 'ALTO', 'ROJO', 'IMPAR', '3RA COL'],
];

const results = pattern.map(([metodo, bajoAlto, color, parImpar, docCol]) => {
    const economics = calculateEconomics(bajoAlto, color, parImpar, docCol);
    return {
        metodo,
        bajoAlto, color, parImpar, docCol,
        ...economics
    };
});

// SORT LOGIC (Safety Desc, Power Desc)
results.sort((a, b) => {
    if (a.safety !== b.safety) {
        return b.safety - a.safety; // Safety Desc
    }
    return b.power - a.power; // Power Desc
});

const top2 = results.slice(0, 2);
console.log(JSON.stringify(top2, null, 2));
