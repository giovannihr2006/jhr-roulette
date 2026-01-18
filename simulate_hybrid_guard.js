
const SESSIONS = 1000;
const START_BANKROLL = 20000; // 20k units
const TARGET_BANKROLL = 25000; // +25%
const BASE_UNIT = 100;
const MAX_TABLE_BET = 10000000000;

// BETS (19 Chips Total)
const BETS = [
    // Cross of 5 (4 chips - Splits)
    { t: 'SPLIT', n: [4, 5], w: 1 }, { t: 'SPLIT', n: [5, 6], w: 1 },
    { t: 'SPLIT', n: [2, 5], w: 1 }, { t: 'SPLIT', n: [5, 8], w: 1 },
    // Supports (15 chips)
    { t: 'DOZEN', n: 'DOZ1', w: 5 },
    { t: 'SIMPLE', n: 'BLACK', w: 5 },
    { t: 'SIMPLE', n: 'EVEN', w: 5 }
];

// Logic Mappings
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACKS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

const PAYOUTS = { 'SPLIT': 17, 'DOZEN': 2, 'SIMPLE': 1 };

let wins = 0; let busts = 0;

for (let i = 0; i < SESSIONS; i++) {
    let balance = START_BANKROLL;
    let maxBalance = START_BANKROLL;
    let multiplier = 1;
    let spins = 0;

    while (balance > 0 && balance < TARGET_BANKROLL) {
        spins++;

        let cost = 0;
        BETS.forEach(b => cost += (b.w * BASE_UNIT * multiplier));

        if (cost > balance) { balance = 0; break; } // Bust
        balance -= cost;

        // SPIN
        const spin = Math.floor(Math.random() * 37);
        let win = 0;

        BETS.forEach(b => {
            let hit = false;
            if (b.t === 'SPLIT' && b.n.includes(spin)) hit = true;
            if (b.t === 'DOZEN' && b.n === 'DOZ1' && spin >= 1 && spin <= 12) hit = true;
            if (b.t === 'SIMPLE') {
                if (b.n === 'BLACK' && BLACKS.includes(spin)) hit = true;
                if (b.n === 'EVEN' && spin !== 0 && spin % 2 === 0) hit = true;
            }

            if (hit) win += (b.w * BASE_UNIT * multiplier) * (PAYOUTS[b.t] + 1);
        });

        balance += win;

        // PROGRESSION LOGIC (User Request)
        if (balance > maxBalance) {
            // New Record -> Reset
            maxBalance = balance;
            multiplier = 1;
        } else if (balance > START_BANKROLL) {
            // "Mientras esté por encima de 0x (Positiva) se sigue jugando sin doblar"
            // We are winning, but below max. Float Mode.
            multiplier = 1;
        } else {
            // "Cuando la diferencia deje de ser positiva... se dobla"
            // Balance <= Start (Back to baseline or losing) -> EMERGENCY MODE
            multiplier *= 2;
        }

        if (spins > 50000) { busts++; break; }
    }

    if (balance >= TARGET_BANKROLL) wins++; else busts++;
}

console.log('--- RESULTADOS HÍBRIDO GUARDIA + FLOTACIÓN ---');
console.log('Exitos:', wins);
console.log('Quiebras:', busts);
console.log('% Supervivencia:', ((wins / SESSIONS) * 100).toFixed(2) + '%');
