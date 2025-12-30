/**
 * hot-cold-calculator.js
 * Version: 0.1.13
 * 
 * Algoritmo de análisis de números calientes (HOT) y fríos (COLD)
 * - Detecta números con mayor/menor frecuencia
 * - Análisis estadístico con desviación estándar
 * - Sistema de scoring para ranking
 * - Configuración de ventanas de tiempo
 * 
 * Autor: JHR Quantum Roulette
 */

class HotColdCalculator {
    constructor(historyManager) {
        this.historyManager = historyManager;
        
        // Configuración de ventanas de análisis
        this.config = {
            shortWindow: 50,    // Últimos 50 spins
            mediumWindow: 100,  // Últimos 100 spins
            longWindow: 200,    // Últimos 200 spins
            minSampleSize: 20,  // Mínimo de spins para análisis fiable
            hotThreshold: 1.5,  // Desviaciones estándar para considerar "hot"
            coldThreshold: -1.5 // Desviaciones estándar para considerar "cold"
        };
        
        console.log('[HotColdCalculator] Inicializado');
    }
    
    /**
     * Calcula la frecuencia esperada teórica
     */
    getExpectedFrequency(totalSpins) {
        return totalSpins / 37; // Ruleta europea tiene 37 números
    }
    
    /**
     * Calcula desviación estándar de frecuencias
     */
    calculateStdDev(frequencies, mean) {
        if (frequencies.length === 0) return 0;
        
        const squaredDiffs = frequencies.map(f => Math.pow(f - mean, 2));
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / frequencies.length;
        return Math.sqrt(variance);
    }
    
    /**
     * Calcula el score de "hotness" de un número
     * Score positivo = hot, negativo = cold
     */
    calculateHotScore(number, window = 'medium') {
        const windowSize = this.config[`${window}Window`];
        const recentHistory = this.historyManager.getLastResults(windowSize);
        
        if (recentHistory.length < this.config.minSampleSize) {
            return { score: 0, frequency: 0, expected: 0, reliability: 'low' };
        }
        
        // Contar frecuencia del número en la ventana
        const frequency = recentHistory.filter(entry => entry.number === number).length;
        
        // Frecuencia esperada
        const expected = this.getExpectedFrequency(recentHistory.length);
        
        // Calcular todas las frecuencias para desviación estándar
        const allFrequencies = [];
        for (let i = 0; i <= 36; i++) {
            const freq = recentHistory.filter(entry => entry.number === i).length;
            allFrequencies.push(freq);
        }
        
        const stdDev = this.calculateStdDev(allFrequencies, expected);
        
        // Score normalizado (desviaciones estándar desde la media)
        const score = stdDev > 0 ? (frequency - expected) / stdDev : 0;
        
        // Reliability basado en tamaño de muestra
        let reliability = 'low';
        if (recentHistory.length >= this.config.longWindow) {
            reliability = 'high';
        } else if (recentHistory.length >= this.config.mediumWindow) {
            reliability = 'medium';
        }
        
        return {
            score: parseFloat(score.toFixed(2)),
            frequency,
            expected: parseFloat(expected.toFixed(2)),
            deviation: parseFloat((frequency - expected).toFixed(2)),
            reliability,
            sampleSize: recentHistory.length
        };
    }
    
    /**
     * Obtiene los N números más calientes
     */
    getHotNumbers(count = 5, window = 'medium') {
        const scores = [];
        
        for (let i = 0; i <= 36; i++) {
            const analysis = this.calculateHotScore(i, window);
            scores.push({
                number: i,
                ...analysis
            });
        }
        
        // Ordenar por score descendente
        scores.sort((a, b) => b.score - a.score);
        
        // Filtrar solo los que están por encima del threshold
        const hotNumbers = scores.filter(s => s.score >= this.config.hotThreshold);
        
        return hotNumbers.slice(0, count);
    }
    
    /**
     * Obtiene los N números más fríos
     */
    getColdNumbers(count = 5, window = 'medium') {
        const scores = [];
        
        for (let i = 0; i <= 36; i++) {
            const analysis = this.calculateHotScore(i, window);
            scores.push({
                number: i,
                ...analysis
            });
        }
        
        // Ordenar por score ascendente
        scores.sort((a, b) => a.score - b.score);
        
        // Filtrar solo los que están por debajo del threshold
        const coldNumbers = scores.filter(s => s.score <= this.config.coldThreshold);
        
        return coldNumbers.slice(0, count);
    }
    
    /**
     * Análisis completo: hot, cold y neutral
     */
    getFullAnalysis(window = 'medium') {
        const hot = this.getHotNumbers(5, window);
        const cold = this.getColdNumbers(5, window);
        
        const totalSpins = this.historyManager.getLastResults(
            this.config[`${window}Window`]
        ).length;
        
        return {
            window,
            totalSpins,
            hot,
            cold,
            reliability: totalSpins >= this.config.longWindow ? 'high' :
                        totalSpins >= this.config.mediumWindow ? 'medium' : 'low',
            timestamp: Date.now()
        };
    }
    
    /**
     * Detecta rachas de números (apareció múltiples veces recientemente)
     */
    detectStreaks(minOccurrences = 3, withinSpins = 20) {
        const recentHistory = this.historyManager.getLastResults(withinSpins);
        const streaks = new Map();
        
        for (const entry of recentHistory) {
            const count = streaks.get(entry.number) || 0;
            streaks.set(entry.number, count + 1);
        }
        
        const hotStreaks = [];
        for (const [number, count] of streaks.entries()) {
            if (count >= minOccurrences) {
                hotStreaks.push({
                    number,
                    occurrences: count,
                    percentage: ((count / withinSpins) * 100).toFixed(1)
                });
            }
        }
        
        hotStreaks.sort((a, b) => b.occurrences - a.occurrences);
        
        return hotStreaks;
    }
    
    /**
     * Genera reporte de consola para debugging
     */
    printAnalysis(window = 'medium') {
        const analysis = this.getFullAnalysis(window);
        
        console.log('\n═══════════════════════════════════════════');
        console.log(`  HOT/COLD ANALYSIS (${window.toUpperCase()} WINDOW)`);
        console.log('═══════════════════════════════════════════');
        console.log(`Total Spins: ${analysis.totalSpins}`);
        console.log(`Reliability: ${analysis.reliability.toUpperCase()}\n`);
        
        console.log('🔥 HOT NUMBERS (appearing more than expected):');
        if (analysis.hot.length === 0) {
            console.log('  No significant hot numbers detected');
        } else {
            analysis.hot.forEach((item, i) => {
                console.log(`  ${i+1}. Number ${item.number}: ${item.frequency} times (expected ${item.expected}, score ${item.score})`);
            });
        }
        
        console.log('\n❄️  COLD NUMBERS (appearing less than expected):');
        if (analysis.cold.length === 0) {
            console.log('  No significant cold numbers detected');
        } else {
            analysis.cold.forEach((item, i) => {
                console.log(`  ${i+1}. Number ${item.number}: ${item.frequency} times (expected ${item.expected}, score ${item.score})`);
            });
        }
        
        console.log('═══════════════════════════════════════════\n');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.HotColdCalculator = HotColdCalculator;
}
