
// FORENSIC ANALYSIS: EFFICIENCY vs BENEFIT
// Converting "Economy" into "Real World Value"

const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// BET PAYOUTS (Gross)
const PAYOUTS = {
    STR: 36, // 35+1
    SPLIT: 18, // 17+1
    STREET: 12, // 11+1
    CORNER: 9, // 8+1
    LINE: 6, // 5+1
    COL: 3, // 2+1
    EVEN: 2 // 1+1
};

// SCENARIOS
const SCENARIOS = [
    {
        id: 'RED', name: 'ROJO (Método)',
        cost: 1, coverage: 18,
        bets: [{ prob: 18 / 37, pay: 2 }]
    },
    {
        id: 'DOZEN', name: 'DOCENA (Método)',
        cost: 1, coverage: 12,
        bets: [{ prob: 12 / 37, pay: 3 }]
    },
    {
        id: 'VOISINS', name: 'VECINOS (Sistema)',
        cost: 7, coverage: 17, // Optimized 7-chip version
        // 7 Chips:
        // 0/2/3 Trio (Street pay 11:1). Covers 3 nums.
        // 4/7 Split. 12/15 Split. 18/21 Split. 19/22 Split. 32/35 Split.
        // 25/26/28/29 Corner.
        bets: [
            { type: 'TRIO', count: 3, pay: 12 }, // 0,2,3
            { type: 'SPLIT', count: 10, pay: 18 }, // 5 splits * 2 nums = 10 nums
            { type: 'CORNER', count: 4, pay: 9 } // 25,26,28,29
        ]
    },
    {
        id: 'TIERS', name: 'TERCIO (Sistema)',
        cost: 6, coverage: 12,
        bets: [
            { type: 'SPLIT', count: 12, pay: 18 } // All splits
        ]
    },
    {
        id: 'ORPHANS', name: 'HUÉRFANOS (Sistema)',
        cost: 5, coverage: 8,
        bets: [
            { type: 'STR', count: 1, pay: 36 }, // 1
            { type: 'SPLIT', count: 7, pay: 18 } // 6/9, 14/17, 17/20, 31/34 (Note: 17 is double covered? No, standard orphans is 5 chips. 17 is covered by 14/17 AND 17/20. If 17 hits, you win TWICE? Usually yes.)
            // Let's assume standard payouts.
            // 17 is covered by TWO chips. Cost is 5.
            // If 17 hits: Pay 18 + 18 = 36 gross.
        ]
    },
    {
        id: 'JEUZERO', name: 'JEU ZÉRO (Sistema)',
        cost: 4, coverage: 7,
        bets: [
            { type: 'STR', count: 1, pay: 36 }, // 26
            { type: 'SPLIT', count: 6, pay: 18 } // 0/3, 12/15, 32/35
        ]
    }
];

console.log("| Sistema | Costo | Cobertura | Eficiencia (C/N) | Beneficio Min | Beneficio Max | Factor Explosivo |");
console.log("|---|---|---|---|---|---|---|");

SCENARIOS.forEach(s => {
    // 1. Efficiency
    const eff = s.cost / s.coverage;

    // 2. Net Wins
    // "Benefit" = Net Profit (Gross Win - Total Cost)
    let minNet = 9999;
    let maxNet = -9999;

    // Simulate hits on covered numbers
    // Simplified: Iterate bet types
    s.bets.forEach(b => {
        // Net = (Payout * ChipsOnWinner) - TotalCost
        // ChipsOnWinner usually 1 (except Orphans 17).
        // Let's assume 1 chip/pos.

        let chipsOnNum = 1;
        if (s.id === 'ORPHANS' && b.type === 'SPLIT' && b.pay === 18 && b.count === 7) {
            // 17 case handling complex... simplified approach:
            // Max win for Orphans is 17: (18+18) - 5 = 31.
            // Min win is Split: 18 - 5 = 13.
            // Straight 1: 36 - 5 = 31.
        }

        const net = b.pay - s.cost;
        if (net < minNet) minNet = net;
        if (net > maxNet) maxNet = net;
    });

    // Manual overrides for complexity
    if (s.id === 'ORPHANS') { maxNet = 31; minNet = 13; } // 17 hits (double split) or 1 hits (straight)

    const explosive = (maxNet / s.cost).toFixed(1) + 'x';

    console.log(`| **${s.name}** | ${s.cost} | ${s.coverage} | **${eff.toFixed(3)}** | +${minNet} | +${maxNet} | **${explosive}** |`);
});
