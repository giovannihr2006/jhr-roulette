
const SESSIONS = 2000;
const START_BANKROLL = 2000000;
const TARGET_BANKROLL = 2500000; // +25% profit
const BASE_UNIT = 1000; // $1000 per chip
const MAX_TABLE_BET = 20000000000; // Infinite table limit

// BET DEFINITIONS
const FLOWER_5 = [
    { t: 'CORNER', n: [1, 2, 4, 5], w: 1 }, { t: 'CORNER', n: [2, 3, 5, 6], w: 2 },
    { t: 'CORNER', n: [5, 6, 8, 9], w: 3 }, { t: 'CORNER', n: [4, 5, 7, 8], w: 4 },
    { t: 'PLENO', n: [5], w: 5 } // Cost: 15
];
const FLOWER_23 = [
    { t: 'CORNER', n: [19, 20, 22, 23], w: 1 }, { t: 'CORNER', n: [20, 21, 23, 24], w: 2 },
    { t: 'CORNER', n: [23, 24, 26, 27], w: 3 }, { t: 'CORNER', n: [22, 23, 25, 26], w: 4 },
    { t: 'PLENO', n: [23], w: 5 } // Cost: 15
];

// Reduced Phase 2: Splits + Pleno (approx 13 chips)
const FLOWER_5_REDUCED = [
    { t: 'SPLIT', n: [4, 5], w: 2 }, { t: 'SPLIT', n: [5, 6], w: 2 },
    { t: 'SPLIT', n: [2, 5], w: 2 }, { t: 'SPLIT', n: [5, 8], w: 2 },
    { t: 'PLENO', n: [5], w: 5 }
];

// Reduced Phase 3: Street (10 chips concentrated)
const FLOWER_5_STREET = [
    { t: 'STREET', n: [4, 5, 6], w: 10 }
];

const PAYOUTS = { 'CORNER': 8, 'SPLIT': 17, 'PLENO': 35, 'STREET': 11 };

let wins = 0;
let busts = 0;

for (let i = 0; i < SESSIONS; i++) {
    let balance = START_BANKROLL;
    let maxBalance = START_BANKROLL;
    let multiplier = 1;
    let lossCount = 0;
    let spins = 0;

    while (balance > 0 && balance < TARGET_BANKROLL) {
        spins++;

        // 1. DETERMINE BETS BY PHASE
        let currentBets = [];
        let phaseMult = multiplier;

        // Logic: 
        // 0-4 losses: Phase 0 (Both Flowers)
        // 5 loss: Phase 1 (One Flower)
        // 6 loss: Phase 2 (Reduced)
        // 7+ loss: Phase 3 (Street)

        if (lossCount < 5) {
            currentBets = [...FLOWER_5, ...FLOWER_23];
        } else if (lossCount === 5) {
            currentBets = [...FLOWER_5];
        } else if (lossCount === 6) {
            currentBets = [...FLOWER_5_REDUCED];
        } else {
            currentBets = [...FLOWER_5_STREET];
        }

        // 2. CALCULATE COST
        let cost = 0;
        currentBets.forEach(b => cost += (b.w * BASE_UNIT * phaseMult));

        if (cost > balance) {
            balance = 0; // BUST
            break;
        }

        balance -= cost;

        // 3. SPIN
        const spin = Math.floor(Math.random() * 37);
        let win = 0;
        currentBets.forEach(b => {
            let hit = false;
            if (b.t === 'CORNER' && b.n.includes(spin)) hit = true;
            if (b.t === 'SPLIT' && b.n.includes(spin)) hit = true;
            if (b.t === 'STREET' && b.n.includes(spin)) hit = true;
            if (b.t === 'PLENO' && b.n.includes(spin)) hit = true;

            if (hit) win += (b.w * BASE_UNIT * phaseMult) * (PAYOUTS[b.t] + 1);
        });

        balance += win;

        // 4. PROGRESSION
        if (balance > maxBalance) {
            maxBalance = balance;
            multiplier = 1;
            lossCount = 0;
        } else {
            // "Mientras saldo potencial sea menor... doblo"
            // If we didn't recover to new high, double.
            multiplier *= 2;
            lossCount++;
        }

        if (spins > 50000) { busts++; break; } // Safety
    }

    if (balance >= TARGET_BANKROLL) wins++;
    else busts++;
}

console.log('RESULTADOS (FLOR DE TRINCHERA - 2M CAPITAL):');
console.log('Exitos (+500k):', wins);
console.log('Quiebras (0):', busts);
console.log('Probabilidad:', ((wins / SESSIONS) * 100).toFixed(2) + '%');
