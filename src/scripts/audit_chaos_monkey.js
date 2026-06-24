
import {
    calculateWinnings,
    ALL_WAGERABLE_BET_IDS,
    ROULETTE_NUMBERS
} from '../logic/RouletteUtils.js';

console.log("=============================================================");
console.log("🦍  AUDITORÍA FASE 2: CHAOS MONKEY (STRESS & LINEARITY)  🦍");
console.log("=============================================================");

const TOTAL_ROUNDS = 100000;
const MAX_BETS_PER_ROUND = 10;
const CHIP_VALUE = 100;

let totalWagered = 0;
let totalPaid = 0;
let errors = 0;

// Helper: Random Int
const randomInt = (max) => Math.floor(Math.random() * max);
const randomItem = (arr) => arr[randomInt(arr.length)];

console.log(`> Simulando ${TOTAL_ROUNDS} rondas complejas...`);
console.log(`> Verificando Linealidad: Payout(A + B) === Payout(A) + Payout(B)`);

const startTime = Date.now();

for (let i = 0; i < TOTAL_ROUNDS; i++) {
    // 1. Generate Random Bets
    const betCount = randomInt(MAX_BETS_PER_ROUND) + 1;
    const currentBets = {};

    // Track individual expected wins for linearity check
    const individualBets = [];

    for (let b = 0; b < betCount; b++) {
        const id = randomItem(ALL_WAGERABLE_BET_IDS);
        // Add specific amounts
        const amount = (randomInt(5) + 1) * CHIP_VALUE;

        if (currentBets[id]) currentBets[id] += amount;
        else currentBets[id] = amount;

        // Store for linearity check
        individualBets.push({ id, amount });
    }

    // 2. Spin Wheel
    const winningNum = randomItem(ROULETTE_NUMBERS);

    // 3. Calculate Total Payout (The 'System' way)
    const systemPayout = calculateWinnings(winningNum, currentBets);

    // 4. Calculate Linear Payout (Sum of individual resolutions)
    let linearSum = 0;
    for (const bet of individualBets) {
        // We resolve each bet as if it was alone
        const singleWin = calculateWinnings(winningNum, { [bet.id]: bet.amount });
        linearSum += singleWin;
    }

    // 5. Assert Linearity
    // Note: calculateWinnings sums up payouts. It should be perfectly linear.
    if (systemPayout !== linearSum) {
        console.error(`❌ ERROR DE LINEALIDAD en Ronda ${i + 1}`);
        console.error(`   Winning Num: ${winningNum}`);
        console.error(`   System Check: ${systemPayout}`);
        console.error(`   Linear Sum:   ${linearSum}`);
        console.error(`   Bets:`, currentBets);
        errors++;
        break; // Stop on first error
    }

    totalWagered += Object.values(currentBets).reduce((a, b) => a + b, 0);
    totalPaid += systemPayout;

    if (i % 20000 === 0 && i > 0) process.stdout.write('.');
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log("\n-------------------------------------------------------------");
if (errors === 0) {
    console.log(`✅ PRUEBA DE ESTRÉS COMPLETADA EN ${duration}s`);
    console.log(`> Rondas: ${TOTAL_ROUNDS}`);
    console.log(`> Total Apostado: $${totalWagered}`);
    console.log(`> Total Pagado:   $${totalPaid}`);
    console.log(`> RTP Observado:  ${((totalPaid / totalWagered) * 100).toFixed(2)}% (muestra aleatoria; no prueba de RTP teorico)`);
    console.log("🏆 CERTIFICADO: ROBUSTEZ Y LINEALIDAD CONFIRMADAS 🏆");
} else {
    console.error(`💀 FALLO DE ESTRÉS: Se detectaron errores de cálculo.`);
    process.exit(1);
}
