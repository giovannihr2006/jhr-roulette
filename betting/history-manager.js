/**
 * history-manager.js
 * Version: 0.1.13
 * 
 * Sistema completo de historial de resultados
 * - Registra todos los giros con timestamp
 * - Consulta de historial con límites y filtros
 * - Análisis de frecuencia de números
 * - Base para algoritmos hot/cold
 * 
 * Autor: JHR Quantum Roulette
 */

class HistoryManager {
    constructor(maxSize = 500) {
        this.maxSize = maxSize; // Límite de resultados guardados
        this.history = []; // Array de { number, color, timestamp, spinId }
        this.frequency = new Map(); // Map<number, count>
        this.spinCounter = 0; // ID único por giro
        
        // Inicializar frecuencias en 0 para todos los números
        for (let i = 0; i <= 36; i++) {
            this.frequency.set(i, 0);
        }
        
        console.log('[HistoryManager] Inicializado con límite:', maxSize);
    }
    
    /**
     * Añade un resultado de giro al historial
     */
    addResult(numberData) {
        const entry = {
            number: numberData.value,
            color: numberData.color,
            timestamp: Date.now(),
            spinId: ++this.spinCounter
        };
        
        // Añadir al principio del array (más reciente primero)
        this.history.unshift(entry);
        
        // Actualizar frecuencia
        const currentFreq = this.frequency.get(numberData.value) || 0;
        this.frequency.set(numberData.value, currentFreq + 1);
        
        // Mantener límite de tamaño
        if (this.history.length > this.maxSize) {
            const removed = this.history.pop();
            // Decrementar frecuencia del número eliminado
            const freq = this.frequency.get(removed.number);
            this.frequency.set(removed.number, Math.max(0, freq - 1));
        }
        
        console.log(`[HistoryManager] Resultado añadido: ${numberData.value} ${numberData.color} (spin #${entry.spinId})`);
        return entry;
    }
    
    /**
     * Obtiene los últimos N resultados
     */
    getLastResults(count = 10) {
        return this.history.slice(0, Math.min(count, this.history.length));
    }
    
    /**
     * Obtiene todo el historial
     */
    getAllHistory() {
        return [...this.history];
    }
    
    /**
     * Obtiene la frecuencia de un número específico
     */
    getFrequency(number) {
        return this.frequency.get(number) || 0;
    }
    
    /**
     * Obtiene todas las frecuencias ordenadas
     */
    getAllFrequencies(sortOrder = 'desc') {
        const frequencies = Array.from(this.frequency.entries())
            .map(([num, count]) => ({ number: num, count }));
        
        if (sortOrder === 'desc') {
            frequencies.sort((a, b) => b.count - a.count);
        } else if (sortOrder === 'asc') {
            frequencies.sort((a, b) => a.count - b.count);
        }
        
        return frequencies;
    }
    
    /**
     * Obtiene estadísticas generales del historial
     */
    getStats() {
        const totalSpins = this.history.length;
        
        if (totalSpins === 0) {
            return {
                totalSpins: 0,
                uniqueNumbers: 0,
                mostFrequent: null,
                leastFrequent: null,
                averageFrequency: 0
            };
        }
        
        const frequencies = this.getAllFrequencies('desc');
        const uniqueNumbers = frequencies.filter(f => f.count > 0).length;
        const totalCount = frequencies.reduce((sum, f) => sum + f.count, 0);
        
        return {
            totalSpins,
            uniqueNumbers,
            mostFrequent: frequencies[0],
            leastFrequent: frequencies[frequencies.length - 1],
            averageFrequency: (totalCount / 37).toFixed(2)
        };
    }
    
    /**
     * Filtra historial por color
     */
    getByColor(color, limit = null) {
        const filtered = this.history.filter(entry => entry.color === color);
        return limit ? filtered.slice(0, limit) : filtered;
    }
    
    /**
     * Filtra historial por rango de números
     */
    getByRange(min, max, limit = null) {
        const filtered = this.history.filter(entry => 
            entry.number >= min && entry.number <= max
        );
        return limit ? filtered.slice(0, limit) : filtered;
    }
    
    /**
     * Obtiene patrones de repetición (números que salieron N veces consecutivas)
     */
    getRepeatingPatterns(minRepeats = 2) {
        const patterns = [];
        let currentNumber = null;
        let currentCount = 0;
        
        for (const entry of this.history) {
            if (entry.number === currentNumber) {
                currentCount++;
            } else {
                if (currentCount >= minRepeats) {
                    patterns.push({
                        number: currentNumber,
                        repeats: currentCount,
                        startSpinId: entry.spinId
                    });
                }
                currentNumber = entry.number;
                currentCount = 1;
            }
        }
        
        // Check last sequence
        if (currentCount >= minRepeats) {
            patterns.push({
                number: currentNumber,
                repeats: currentCount,
                startSpinId: this.history[this.history.length - 1].spinId
            });
        }
        
        return patterns;
    }
    
    /**
     * Resetea el historial
     */
    reset() {
        this.history = [];
        this.spinCounter = 0;
        
        // Resetear frecuencias
        for (let i = 0; i <= 36; i++) {
            this.frequency.set(i, 0);
        }
        
        console.log('[HistoryManager] Historial reseteado');
    }
    
    /**
     * Exporta el historial a JSON
     */
    exportJSON() {
        return JSON.stringify({
            history: this.history,
            frequency: Array.from(this.frequency.entries()),
            spinCounter: this.spinCounter,
            timestamp: Date.now()
        }, null, 2);
    }
    
    /**
     * Importa historial desde JSON
     */
    importJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.history = data.history || [];
            this.frequency = new Map(data.frequency || []);
            this.spinCounter = data.spinCounter || 0;
            
            console.log('[HistoryManager] Historial importado:', this.history.length, 'resultados');
            return true;
        } catch (error) {
            console.error('[HistoryManager] Error al importar:', error);
            return false;
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.HistoryManager = HistoryManager;
}
