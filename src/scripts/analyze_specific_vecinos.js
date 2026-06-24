import { optimizeBets, ROULETTE_NUMBERS, getBetType, getCoveredNumbers } from '../logic/RouletteUtils.js';

const getSpecs = (centerNum) => {
    const centerIndex = ROULETTE_NUMBERS.indexOf(centerNum);
    const target = [];
    for (let i = -9; i <= 9; i++) {
        let idx = (centerIndex + i) % 37;
        if (idx < 0) idx += 37;
        target.push(ROULETTE_NUMBERS[idx]);
    }
    const bets = optimizeBets(target);

    // Count bet types
    let plenos = 0, splits = 0, streets = 0, corners = 0, lines = 0;
    bets.forEach(id => {
        if (id.startsWith('SPLIT')) splits++;
        else if (id.startsWith('STREET')) streets++;
        else if (id.startsWith('CORNER') || id.startsWith('BASKET')) corners++;
        else if (id.startsWith('LINE')) lines++;
        else if (!isNaN(id)) plenos++;
    });

    // Calculate payout distribution on hit
    // We simulate hitting each covered number and calculate the return
    const payouts = {};
    target.forEach(n => {
        // Create bet object with 1 chip each
        const betObj = {};
        bets.forEach(id => betObj[id] = 1);

        let win = 0;
        // Manual simple payout resolver for 1 chip bets
        bets.forEach(id => {
            const cov = getCoveredNumbers({ [id]: 1 });
            if (cov.includes(n)) {
                let mult = 0;
                if (id.startsWith('SPLIT')) mult = 17;
                else if (id.startsWith('CORNER') || id.startsWith('BASKET')) mult = 8;
                else if (id.startsWith('STREET')) mult = 11;
                else if (id.startsWith('LINE')) mult = 5;
                else if (!isNaN(id)) mult = 35;
                win += 1 + mult; // Return stake + profit
            }
        });
        payouts[n] = win;
    });

    const payoutVals = Object.values(payouts);
    const minPayout = Math.min(...payoutVals);
    const maxPayout = Math.max(...payoutVals);
    const avgPayout = (payoutVals.reduce((a,b)=>a+b, 0) / payoutVals.length).toFixed(2);

    // Volatility (standard deviation of payouts)
    const mean = parseFloat(avgPayout);
    const variance = payoutVals.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / payoutVals.length;
    const stdDev = Math.sqrt(variance).toFixed(2);

    return {
        center: centerNum,
        plenos, splits, streets, corners, lines,
        minPayout, maxPayout, avgPayout, stdDev,
        bets: bets.length
    };
};

const targets = [26, 0, 35, 3, 10, 5];
const results = targets.map(getSpecs);

console.log("====================================================================");
console.log("🕵️‍♂️  COMPORTAMIENTO MATEMÁTICO DE LOS VECINOS ÉLITE (19N)  🕵️‍♂️");
console.log("====================================================================");
console.log("SYS | Bets | Plenos | Splits | Corners | Pago Min/Max | Pago Prom | Desv. Est");
console.log("--------------------------------------------------------------------");
results.forEach(r => {
    console.log(`SYS ${r.center.toString().padEnd(2)}|  ${r.bets}  |   ${r.plenos}    |   ${r.splits}    |    ${r.corners}    |   $${r.minPayout}/$${r.maxPayout}   |   $${r.avgPayout}   |   ${r.stdDev}`);
});
console.log("====================================================================");
