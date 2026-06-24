
// Internal Betting Pattern Generator

// 3x12 Grid Layout (Row, Col)
// Row 2 (Top/Right on board): 3, 6, 9...
// Row 1 (Mid): 2, 5, 8...
// Row 0 (Bot/Left on board): 1, 4, 7...
//
// Col 0: 1, 2, 3
// Col 1: 4, 5, 6
// ...
// Col 11: 34, 35, 36

const GRID = [
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34], // Row 0 (Bottom)
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35], // Row 1 (Middle)
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]  // Row 2 (Top)
];

const getBetObject = (type, name, betId, numbers) => ({
    type,
    name,
    betId, // ID used for placing the bet (e.g., 'SPLIT_1_2')
    numbers
});

export const generateInternalPatterns = () => {
    let patterns = [];

    // 1. STRAIGHT UP (Plenos) - 37
    for (let i = 0; i <= 36; i++) {
        patterns.push(getBetObject(
            'STRAIGHT',
            `Pleno ${i}`,
            i.toString(),
            [i]
        ));
    }

    // 2. SPLITS (Caballos)
    // Horizontal Splits (Adjacency in Grid) e.g., 1-4, 2-5... from Col n to n+1
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 11; col++) {
            const n1 = GRID[row][col];
            const n2 = GRID[row][col + 1];
            patterns.push(getBetObject(
                'SPLIT',
                `Caballo ${n1}/${n2}`,
                `SPLIT_${[n1, n2].sort((a, b) => a - b).join('_')}`,
                [n1, n2]
            ));
        }
    }
    // Vertical Splits (Adjacency in Grid) e.g., 1-2, 2-3... from Row n to n+1
    for (let col = 0; col < 12; col++) {
        for (let row = 0; row < 2; row++) {
            const n1 = GRID[row][col];
            const n2 = GRID[row + 1][col];
            patterns.push(getBetObject(
                'SPLIT',
                `Caballo ${n1}/${n2}`,
                `SPLIT_${[n1, n2].sort((a, b) => a - b).join('_')}`,
                [n1, n2]
            ));
        }
    }
    // Zero Splits (0-1, 0-2, 0-3)
    patterns.push(getBetObject('SPLIT', 'Caballo 0/1', 'SPLIT_0_1', [0, 1]));
    patterns.push(getBetObject('SPLIT', 'Caballo 0/2', 'SPLIT_0_2', [0, 2]));
    patterns.push(getBetObject('SPLIT', 'Caballo 0/3', 'SPLIT_0_3', [0, 3]));


    // 3. STREETS (Calles) - Rows of 3 (Vertical in grid, Horizontal on table)
    // e.g., 1-2-3 (Col 0), 4-5-6 (Col 1)...
    for (let col = 0; col < 12; col++) {
        const n1 = GRID[0][col]; // 1
        const n2 = GRID[1][col]; // 2
        const n3 = GRID[2][col]; // 3
        patterns.push(getBetObject(
            'STREET',
            `Calle ${n1}-${n3}`,
            `STREET_${n1}`, // Usually defined by start number
            [n1, n2, n3]
        ));
    }
    // Zero Streets (0-1-2, 0-2-3) - "Basket" or Trio
    patterns.push(getBetObject('TRIO', 'Trio 0-1-2', 'TRIO_0_1_2', [0, 1, 2]));
    patterns.push(getBetObject('TRIO', 'Trio 0-2-3', 'TRIO_0_2_3', [0, 2, 3])); // Often bet ID is TRIO_0_2_3


    // 4. CORNERS (Cuadros)
    // Intersection of 4 numbers. Row 0,1 & Col i, i+1
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 11; col++) {
            const n1 = GRID[row][col];     // 1
            const n2 = GRID[row + 1][col]; // 2
            const n3 = GRID[row][col + 1]; // 4
            const n4 = GRID[row + 1][col + 1]; // 5

            // Standard ID often: CORNER_1_2_4_5 or just CORNER_1_5 (min max)
            // Using explicit full ID helps BettingBoard logic
            patterns.push(getBetObject(
                'CORNER',
                `Cuadro ${n1}-${n4}`,
                `CORNER_${[n1, n2, n3, n4].sort((a, b) => a - b).join('_')}`,
                [n1, n2, n3, n4]
            ));
        }
    }
    // Zero Corner (Basket) 0-1-2-3
    patterns.push(getBetObject('BASKET', 'Canasta 0-3', 'BASKET_0_1_2_3', [0, 1, 2, 3]));


    // 5. SIX LINES (Lineas)
    // Two adjacent streets. e.g., 1-6. Col i and Col i+1
    for (let col = 0; col < 11; col++) {
        const start = GRID[0][col]; // 1
        const nextStart = GRID[0][col + 1]; // 4 (The start of the next street)

        const numbers = [
            GRID[0][col], GRID[1][col], GRID[2][col],
            GRID[0][col + 1], GRID[1][col + 1], GRID[2][col + 1]
        ];

        // FIX: Match BettingBoard format LINE_1_4 (Start_NextStart)
        // Previously was LINE_1, which caused the render mismatch.
        patterns.push(getBetObject(
            'LINE',
            `Linea ${start}-${start + 5}`,
            `LINE_${start}_${nextStart}`,
            numbers
        ));
    }

    return patterns;
};
