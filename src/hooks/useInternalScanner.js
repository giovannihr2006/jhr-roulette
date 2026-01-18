import { useMemo } from 'react';
import { generateInternalPatterns } from '../utils/internalPatterns';

const PATTERNS = generateInternalPatterns();

export const useInternalScanner = (numberHistory, minSpins = 10) => {

    const results = useMemo(() => {
        if (!numberHistory || numberHistory.length < minSpins) return [];

        // Analyze last N spins (or all if not specified, usually pass sliced history)
        // Let's assume numberHistory is the full array, we might want to analyze last 37, 50, etc.
        // For now, analyzing the ENTIRE passed history array.

        const totalSpins = numberHistory.length;
        const counts = new Map();

        // 1. Count occurrences of each number in history
        for (const num of numberHistory) {
            counts.set(num, (counts.get(num) || 0) + 1);
        }

        // 2. Evaluate all patterns
        return PATTERNS.map(pattern => {
            let hits = 0;
            // Sum hits for all numbers in the pattern
            for (const num of pattern.numbers) {
                hits += (counts.get(num) || 0);
            }

            const coverage = pattern.numbers.length;
            const probability = coverage / 37;
            const expected = totalSpins * probability;

            // Efficiency (F/N) - Factor Normalizado
            // If expected is 0 (shouldn't happen with valid history), avoid NaN
            const efficiency = expected > 0 ? (hits / expected) : 0;

            // Rating logic (Simple thresholds)
            let rating = 'Normal';
            if (efficiency >= 2.0) rating = 'Excelente';
            else if (efficiency >= 1.5) rating = 'Muy Bueno';
            else if (efficiency >= 1.2) rating = 'Bueno';
            else if (efficiency < 0.5) rating = 'Frío';

            return {
                ...pattern,
                hits,
                expected: expected.toFixed(2),
                efficiency,
                rating,
                coverage
            };
        }).sort((a, b) => b.efficiency - a.efficiency); // Sort by best efficiency

    }, [numberHistory, minSpins]);

    return results;
};
