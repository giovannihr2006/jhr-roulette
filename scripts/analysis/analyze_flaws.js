
// ROULETTE FLAWS ANALYZER
// Standard European Roulette Wheel Sequence (0 at top, clockwise)
const WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

// Properties
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const getProps = (n) => {
    if (n === 0) return { color: 'GREEN', parity: 'ZERO', size: 'ZERO', col: 'ZERO', doz: 'ZERO' };

    return {
        color: REDS.includes(n) ? 'RED' : 'BLACK',
        parity: (n % 2 === 0) ? 'EVEN' : 'ODD',
        size: (n <= 18) ? 'LOW' : 'HIGH',
        col: (n % 3 === 1) ? 'COL1' : (n % 3 === 2) ? 'COL2' : 'COL3', // 1->Col1, 2->Col2, 3(0)->Col3
        doz: (n <= 12) ? 'DOZ1' : (n <= 24) ? 'DOZ2' : 'DOZ3',
        isSquare: Number.isInteger(Math.sqrt(n))
    };
};

const analysis = {
    // 1. Color vs Parity
    redOdd: 0, redEven: 0, blackOdd: 0, blackEven: 0,
    // 2. Color vs Size
    redLow: 0, redHigh: 0, blackLow: 0, blackHigh: 0,
    // 3. Color per Column
    col1Red: 0, col1Black: 0,
    col2Red: 0, col2Black: 0,
    col3Red: 0, col3Black: 0,
    // 4. Color per Dozen (and Parity!)
    doz1RedOdd: 0, doz1RedEven: 0, doz1BlackOdd: 0, doz1BlackEven: 0,
    doz2RedOdd: 0, doz2RedEven: 0, doz2BlackOdd: 0, doz2BlackEven: 0,
    doz3RedOdd: 0, doz3RedEven: 0, doz3BlackOdd: 0, doz3BlackEven: 0,

    // 5. Squares
    redSquares: 0, blackSquares: 0,

    // 6. Finals (Terminaciones)
    finals: {}
};

// Init finals
for (let i = 0; i <= 9; i++) analysis.finals[i] = { R: 0, B: 0 };

WHEEL.forEach(n => {
    if (n === 0) return;
    const p = getProps(n);
    const finalDigit = n % 10;

    // Parity
    if (p.color === 'RED' && p.parity === 'ODD') analysis.redOdd++;
    if (p.color === 'RED' && p.parity === 'EVEN') analysis.redEven++;
    if (p.color === 'BLACK' && p.parity === 'ODD') analysis.blackOdd++;
    if (p.color === 'BLACK' && p.parity === 'EVEN') analysis.blackEven++;

    // Size
    if (p.color === 'RED' && p.size === 'LOW') analysis.redLow++;
    if (p.color === 'RED' && p.size === 'HIGH') analysis.redHigh++;
    if (p.color === 'BLACK' && p.size === 'LOW') analysis.blackLow++;
    if (p.color === 'BLACK' && p.size === 'HIGH') analysis.blackHigh++;

    // Column
    if (p.col === 'COL1') (p.color === 'RED') ? analysis.col1Red++ : analysis.col1Black++;
    if (p.col === 'COL2') (p.color === 'RED') ? analysis.col2Red++ : analysis.col2Black++;
    if (p.col === 'COL3') (p.color === 'RED') ? analysis.col3Red++ : analysis.col3Black++;

    // Dozen Detailed
    if (p.doz === 'DOZ1') {
        if (p.color === 'RED') (p.parity === 'ODD') ? analysis.doz1RedOdd++ : analysis.doz1RedEven++;
        else (p.parity === 'ODD') ? analysis.doz1BlackOdd++ : analysis.doz1BlackEven++;
    }
    if (p.doz === 'DOZ2') {
        if (p.color === 'RED') (p.parity === 'ODD') ? analysis.doz2RedOdd++ : analysis.doz2RedEven++;
        else (p.parity === 'ODD') ? analysis.doz2BlackOdd++ : analysis.doz2BlackEven++;
    }
    if (p.doz === 'DOZ3') {
        if (p.color === 'RED') (p.parity === 'ODD') ? analysis.doz3RedOdd++ : analysis.doz3RedEven++;
        else (p.parity === 'ODD') ? analysis.doz3BlackOdd++ : analysis.doz3BlackEven++;
    }

    // Squares
    if (p.isSquare) (p.color === 'RED') ? analysis.redSquares++ : analysis.blackSquares++;

    // Finals
    if (p.color === 'RED') analysis.finals[finalDigit].R++;
    else analysis.finals[finalDigit].B++;
});

console.log('--- ANÁLISIS DE ANOMALÍAS ESTRUCTURALES ---');
console.log('1. ASIMETRÍA COLOR/PARIDAD:');
console.log(`   Rojos Impares: ${analysis.redOdd} vs Rojos Pares: ${analysis.redEven}`);
console.log(`   Negros Impares: ${analysis.blackOdd} vs Negros Pares: ${analysis.blackEven}`);
console.log('2. ASIMETRÍA COLOR/TAMAÑO:');
console.log(`   Rojos Bajos: ${analysis.redLow} vs Rojos Altos: ${analysis.redHigh}`);
console.log(`   Negros Bajos: ${analysis.blackLow} vs Negros Altos: ${analysis.blackHigh}`);
console.log('3. ASIMETRÍA COLUMNAS:');
console.log(`   Columna 1: ${analysis.col1Red}R / ${analysis.col1Black}N`);
console.log(`   Columna 2: ${analysis.col2Red}R / ${analysis.col2Black}N`);
console.log(`   Columna 3: ${analysis.col3Red}R / ${analysis.col3Black}N`);
console.log('4. ASIMETRÍA DOCENAS (DETALLE):');
console.log(`   Docena 1: Rojos Impares=${analysis.doz1RedOdd}, Rojos Pares=${analysis.doz1RedEven} | Negros Impares=${analysis.doz1BlackOdd}, Negros Pares=${analysis.doz1BlackEven}`);
console.log(`   Docena 2: Rojos Impares=${analysis.doz2RedOdd}, Rojos Pares=${analysis.doz2RedEven} | Negros Impares=${analysis.doz2BlackOdd}, Negros Pares=${analysis.doz2BlackEven}`);
console.log(`   Docena 3: Rojos Impares=${analysis.doz3RedOdd}, Rojos Pares=${analysis.doz3RedEven} | Negros Impares=${analysis.doz3BlackOdd}, Negros Pares=${analysis.doz3BlackEven}`);
console.log('5. ASIMETRÍA CUADRADOS:');
console.log(`   Cuadrados Rojos: ${analysis.redSquares} vs Cuadrados Negros: ${analysis.blackSquares}`);
console.log('6. ASIMETRÍA TERMINACIONES (FINALS):');
for (let i = 0; i <= 9; i++) {
    const f = analysis.finals[i];
    if (f.R !== f.B) console.log(`   Final ${i}: ${f.R} Rojo / ${f.B} Negro`);
}
