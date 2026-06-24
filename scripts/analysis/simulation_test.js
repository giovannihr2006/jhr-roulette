
import { calculateWinnings, getCoveredNumbers } from './src/logic/RouletteUtils.js';

// Mock Config (copied from GameLimits.js)
const PAYOUTS = {
    STRAIGHT: 35,
    SPLIT: 17,
    STREET: 11,
    CORNER: 8,
    LINE: 5,
    COLUMN: 2,
    DOZEN: 2,
    SIMPLE: 1
};


// HELPER: Generate Random Bets
function generateRandomBets() {
    const bets = {};
    const betTypes = ['RED', 'BLACK', 'EVEN', 'ODD', '1', '17', '36', '0', 'SPLIT_1_2', 'CORNER_1_2_4_5', 'LINE_1_6'];
    const numBets = Math.floor(Math.random() * 5) + 1; // 1 to 5 bets

    for (let i = 0; i < numBets; i++) {
        const type = betTypes[Math.floor(Math.random() * betTypes.length)];
        bets[type] = (bets[type] || 0) + 10; // Bet 10 chips
    }
    return bets;
}

// SIMULATION
console.log("Starting Stress Test: 50,000 Rounds...");
let errors = 0;
let totalWinningsCheck = 0;

for (let i = 1; i <= 50000; i++) {
    const winningNumber = Math.floor(Math.random() * 37); // 0-36
    const currentBets = generateRandomBets();

    // 1. Calculate Expected Win logic manually (simple check)
    // We trust the Utils, but we check for anomalies like NaN
    const winnings = calculateWinnings(winningNumber, currentBets);

    // 2. Anomaly Detection
    if (typeof winnings !== 'number' || isNaN(winnings) || !isFinite(winnings)) {
        console.error(`ERROR Round ${i}: Invalid Winnings: ${winnings}`, { winningNumber, currentBets });
        errors++;
    }

    // 3. Ghost Payout Check
    // If we won, we MUST have a bet covering that number
    if (winnings > 0) {
        const covered = getCoveredNumbers(currentBets);
        if (!covered.includes(winningNumber)) {
            // Special case: Simple chances cover many numbers.
            // getCoveredNumbers handles them.
            console.error(`GHOST ERROR Round ${i}: Won ${winnings} on ${winningNumber} but covered numbers are:`, covered);
            console.error("Bets:", currentBets);
            errors++;
        }
    }

    totalWinningsCheck += winnings;

    if (i % 2000 === 0) console.log(`Completed ${i} rounds...`);
}

if (errors === 0) {
    console.log("SUCCESS: 50,000 Rounds completed with ZERO logic errors.");
} else {
    console.error(`FAILED: ${errors} errors found.`);
    process.exit(1);
}
