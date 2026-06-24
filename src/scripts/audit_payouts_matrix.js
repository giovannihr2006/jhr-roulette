
import {
    calculateWinnings,
    ALL_WAGERABLE_BET_IDS,
    ROULETTE_NUMBERS,
    getBetType,
    getCoveredNumbers
} from '../logic/RouletteUtils.js';

// --- CONFIGURACIÓN DE AUDITORÍA ---
const LOG_LEVEL = {
    INFO: true,
    ERROR: true,
    SUCCESS: true
};

const PAYOUT_RULES = {
    'STRAIGHT': 35,     // 35:1
    'SPLIT': 17,        // 17:1
    'STREET': 11,       // 11:1 (Includes Trio)
    'CORNER': 8,        // 8:1 (Includes Basket)
    'LINE': 5,          // 5:1
    'DOZEN': 2,         // 2:1 (Column/Doz)
    'SIMPLE': 1         // 1:1 (Red/Black/etc)
};

console.log("=============================================================");
console.log("🕵️‍♂️  AUDITORÍA FORENSE DE PAGOS (GLI-STANDARD MATRIX)  🕵️‍♂️");
console.log("=============================================================");
console.log(`> Fecha: ${new Date().toISOString()}`);
console.log(`> Total Números a Probar: ${ROULETTE_NUMBERS.length} (0-36)`);
console.log(`> Total IDs de Apuestas Jugables: ${ALL_WAGERABLE_BET_IDS.length}`);
console.log("-------------------------------------------------------------");

let totalTests = 0;
let totalErrors = 0;
let totalPasses = 0;
const TEST_AMOUNT = 100; // Valor nominal de la ficha para pruebas

// --- HELPER: Obtener multiplicador esperado ---
function getExpectedMultiplier(betId, winningNum) {
    // 1. VARIABLE PAYOUTS (Call Bets)
    if (betId === 'ZERO' || betId === 'JEU_ZERO') {
        if (winningNum === 26) return 35;
        if ([0, 3, 12, 15, 32, 35].includes(winningNum)) return 17;
        return 0;
    }
    if (betId === 'VOISINS') {
        if ([0, 2, 3].includes(winningNum)) return 11;
        if ([25, 26, 28, 29].includes(winningNum)) return 8;
        if ([4, 7, 12, 15, 18, 21, 19, 22, 32, 35].includes(winningNum)) return 17;
        return 0;
    }
    if (betId === 'TIERS') return 17;
    if (betId.startsWith('NUCLEO_') || betId.startsWith('VECINOS_') || betId.startsWith('HUERFANOS_')) return 35;
    if (betId.startsWith('TERCIO_') || betId.startsWith('TIERS_')) return 17;
    if (betId === 'ORPHELINS') {
        if (winningNum === 1) return 35;
        if ([6, 9, 14, 17, 17, 20, 31, 34].includes(winningNum)) return 17;
        return 0;
    }

    // 2. STANDARD PAYOUTS
    let type = getBetType(betId);

    // Manual Refinements
    if (betId.includes('TRIO')) type = 'STREET';
    if (betId.includes('BASKET')) type = 'CORNER';
    if (betId.startsWith('COL') && !betId.startsWith('COLOR')) type = 'DOZEN';
    if (betId.startsWith('DOZ')) type = 'DOZEN';

    const multiplier = PAYOUT_RULES[type];
    if (multiplier === undefined) {
        throw new Error(`CRITICAL: Unknown Bet Type or Pay Rule for ID: ${betId} (Type: ${type})`);
    }
    return multiplier;
}

// --- CORE LOOPS ---

// 1. Matriz de Identificadores Jugables
for (const betId of ALL_WAGERABLE_BET_IDS) {
    const coveredNums = getCoveredNumbers({ [betId]: TEST_AMOUNT });
    const paidNums = ROULETTE_NUMBERS.filter(num => calculateWinnings(num, { [betId]: TEST_AMOUNT }) > 0);
    const missingPayouts = coveredNums.filter(num => !paidNums.includes(num));
    const unexpectedPayouts = paidNums.filter(num => !coveredNums.includes(num));

    if (missingPayouts.length || unexpectedPayouts.length) {
        totalErrors++;
        console.error(`[ERROR] COBERTURA/PAGO DESALINEADO: [${betId}]`);
        console.error(`   - Cubiertos sin pago: [${missingPayouts.join(', ') || 'ninguno'}]`);
        console.error(`   - Pagados sin cobertura: [${unexpectedPayouts.join(', ') || 'ninguno'}]`);
    }

    // Verificar contra CADA número de la rueda (0-36)
    for (const winningNum of ROULETTE_NUMBERS) {
        totalTests++;

        // Simular apuesta
        const bets = { [betId]: TEST_AMOUNT };

        // Calcular ganancia usando el motor del juego
        const actualWinnings = calculateWinnings(winningNum, bets);

        // Calcular ganancia ESPERADA (Oráculo)
        let expectedWin = 0;

        // Special Logic: Use getExpectedMultiplier with winningNum
        // And ensure winningNum is actually covered.
        if (coveredNums.includes(winningNum)) {
            const mult = getExpectedMultiplier(betId, winningNum);
            // Formula: (Monto * Multiplicador) + MontoOriginal
            // NOTE: calculateWinnings returns Total Return (Profit + Stake)?
            // In RouletteUtils: totalWinnings += amount + (amount * multiplier)
            // YES. So we match that.
            if (mult > 0) {
                expectedWin = (TEST_AMOUNT * mult) + TEST_AMOUNT;
            } else {
                expectedWin = 0; // If mult is 0, it means it's a covered number but we defined no payout? (Error case in oracle)
            }
        } else {
            expectedWin = 0;
        }

        // --- ASERCIÓN ---
        // Floating point safety? Integer math here.
        if (actualWinnings !== expectedWin) {
            totalErrors++;
            console.error(`❌ FALLO CRÍTICO: [${betId}] vs WinningNum: ${winningNum}`);
            console.error(`   - Esperado: $${expectedWin}`);
            console.error(`   - Recibido: $${actualWinnings}`);
            console.error(`   - Tipo: ${getBetType(betId)}`);
            console.error(`   - Cobertura: ${coveredNums.includes(winningNum)}`);
        } else {
            totalPasses++;
        }
    }
}

// 2. Pruebas Especiales de Sistemas (Nucleos, Tiers, Vecinos)
console.log("\n--- INICIANDO PRUEBAS DE SISTEMAS ESPECIALES ---");

const SYSTEM_TESTS = [
    { name: 'NUCLEO 0 (12)', center: 0, target: 12, shouldWin: true },
    { name: 'NUCLEO 0 (0)', center: 0, target: 0, shouldWin: true },
    { name: 'NUCLEO 0 (35)', center: 0, target: 35, shouldWin: true },
    { name: 'NUCLEO 0 (1)', center: 0, target: 1, shouldWin: false },
];

for (const sys of SYSTEM_TESTS) {
    totalTests++;
    const betId = `NUCLEO_${sys.center}`;
    const bets = { [betId]: TEST_AMOUNT };
    const win = calculateWinnings(sys.target, bets);

    if (win === 0 && sys.shouldWin) {
        totalErrors++;
        console.error(`❌ SISTEMA FALLÓ [${betId}]: Pago 0 en ${sys.target}`);
    } else if (win > 0 && sys.shouldWin) {
        console.log(`✅ SISTEMA OK [${betId}]: Pagó $${win} en ${sys.target}`);
        totalPasses++;
    } else if (win === 0 && !sys.shouldWin) {
        totalPasses++;
    } else {
        totalErrors++;
        console.error(`❌ SISTEMA FALLO INVERSO [${betId}]: Pagó $${win} en ${sys.target} (No debía)`);
    }
}


console.log("-------------------------------------------------------------");
console.log("📊 RESUMEN FINAL DE AUDITORÍA");
console.log("-------------------------------------------------------------");
console.log(`TOTAL PRUEBAS:   ${totalTests}`);
console.log(`✅ PASARON:      ${totalPasses}`);
console.log(`❌ FALLARON:     ${totalErrors}`);
console.log("-------------------------------------------------------------");

if (totalErrors === 0) {
    console.log("🏆 CERTIFICADO: SISTEMA DE PAGOS ÍNTEGRO (100% OK) 🏆");
    process.exit(0);
} else {
    console.error("💀 ERROR FATAL: EL SISTEMA DE PAGOS ESTÁ CORRUPTO 💀");
    process.exit(1);
}
