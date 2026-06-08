import { optimizeBets, ROULETTE_NUMBERS, getBetType } from '../logic/RouletteUtils.js';

// Helper: Calculate Cost for a target slice
const getOptimizationCost = (targetNums) => {
    const bets = optimizeBets(targetNums);
    const cost = bets.reduce((acc, id) => {
        const type = getBetType(id);
        // 5x Rule Logic
        return acc + (['SIMPLE', 'DOZEN'].includes(type) ? 5 : 1);
    }, 0);
    return { cost, bets };
};

const results = [];

// Analyze Vecinos (19 numbers: center and 9 neighbors left/right) for all 37 numbers
for (let centerNum = 0; centerNum <= 36; centerNum++) {
    const centerIndex = ROULETTE_NUMBERS.indexOf(centerNum);

    // Vecinos: Target 19 Numbers, Sym -9..9
    const target = [];
    for (let i = -9; i <= 9; i++) {
        let idx = (centerIndex + i) % 37;
        if (idx < 0) idx += 37;
        target.push(ROULETTE_NUMBERS[idx]);
    }

    const { cost, bets } = getOptimizationCost(target);
    const efficiency = (cost / 19).toFixed(3);
    const percentage = ((19 / 37) * 100).toFixed(1);

    results.push({
        center: centerNum,
        cost: cost,
        efficiency: parseFloat(efficiency),
        percentage: parseFloat(percentage),
        bets: bets
    });
}

// Sort from best efficiency (lowest cost) to worst
results.sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    return a.center - b.center;
});

console.log("=============================================================");
console.log("🕵️‍♂️  ANÁLISIS DE EFICIENCIA DE VECINOS EN EL CILINDRO (19N)  🕵️‍♂️");
console.log("=============================================================");
console.log("Centro | Costo Fichas | Eficiencia (C/N) | Cant. Apuestas");
console.log("-------------------------------------------------------------");
results.forEach(r => {
    console.log(`SYS ${r.center.toString().padEnd(2)}  |    ${r.cost.toString().padEnd(2)} F      |      ${r.efficiency.toFixed(3)}       |    ${r.bets.length} apuestas`);
});
console.log("=============================================================");
