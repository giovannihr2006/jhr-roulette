/**
 * session-stats.js
 * Version: 0.1.14
 * 
 * Estadísticas completas de sesión
 * - Resumen de giros, apuestas, ganancias
 * - Cálculo de balance neto
 * - Duración de sesión
 * - Exportación de datos
 * 
 * Autor: JHR Quantum Roulette
 */

class SessionStats {
    constructor(bankrollManager, sessionTimer, historyManager = null) {
        this.bankrollManager = bankrollManager;
        this.sessionTimer = sessionTimer;
        this.historyManager = historyManager;
        
        // Datos de sesión
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            endTime: null,
            totalSpins: 0,
            totalStake: 0,
            totalWinnings: 0,
            biggestWin: 0,
            biggestLoss: 0,
            longestWinStreak: 0,
            longestLossStreak: 0,
            currentStreak: 0,
            streakType: null // 'win' | 'loss'
        };
        
        console.log('[SessionStats] Inicializado (ID:', this.sessionData.sessionId + ')');
    }
    
    /**
     * Genera un ID único de sesión
     */
    generateSessionId() {
        return `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Registra un giro completado
     */
    registerSpin(result) {
        this.sessionData.totalSpins++;
        this.sessionData.totalStake += result.totalStake || 0;
        
        const profit = result.profit || 0;
        
        if (profit > 0) {
            // Victoria
            this.sessionData.totalWinnings += profit;
            
            if (profit > this.sessionData.biggestWin) {
                this.sessionData.biggestWin = profit;
            }
            
            // Actualizar rachas
            if (this.sessionData.streakType === 'win') {
                this.sessionData.currentStreak++;
            } else {
                this.sessionData.streakType = 'win';
                this.sessionData.currentStreak = 1;
            }
            
            if (this.sessionData.currentStreak > this.sessionData.longestWinStreak) {
                this.sessionData.longestWinStreak = this.sessionData.currentStreak;
            }
        } else if (profit < 0) {
            // Pérdida
            const loss = Math.abs(profit);
            
            if (loss > this.sessionData.biggestLoss) {
                this.sessionData.biggestLoss = loss;
            }
            
            // Actualizar rachas
            if (this.sessionData.streakType === 'loss') {
                this.sessionData.currentStreak++;
            } else {
                this.sessionData.streakType = 'loss';
                this.sessionData.currentStreak = 1;
            }
            
            if (this.sessionData.currentStreak > this.sessionData.longestLossStreak) {
                this.sessionData.longestLossStreak = this.sessionData.currentStreak;
            }
        }
        
        console.log(`[SessionStats] Giro #${this.sessionData.totalSpins} registrado (profit: $${profit})`);
    }
    
    /**
     * Obtiene todas las estadísticas de la sesión
     */
    getStats() {
        const bankrollStats = this.bankrollManager.getStats();
        const timerData = this.sessionTimer.formatElapsedTime();
        
        // Calcular win rate
        const winRate = this.sessionData.totalSpins > 0
            ? ((bankrollStats.totalWins / this.sessionData.totalSpins) * 100).toFixed(1)
            : 0;
        
        // Balance neto
        const netProfit = this.bankrollManager.getNetProfit();
        const roi = this.sessionData.totalStake > 0
            ? ((netProfit / this.sessionData.totalStake) * 100).toFixed(2)
            : 0;
        
        return {
            // Identificación
            sessionId: this.sessionData.sessionId,
            startTime: this.sessionData.startTime,
            duration: timerData.formatted,
            durationSeconds: timerData.totalSeconds,
            
            // Giros y apuestas
            totalSpins: this.sessionData.totalSpins,
            totalStake: this.sessionData.totalStake,
            totalWinnings: this.sessionData.totalWinnings,
            
            // Balance
            currentBalance: this.bankrollManager.getBalance(),
            initialBalance: this.bankrollManager.getInitialBalance(),
            netProfit,
            roi: parseFloat(roi),
            
            // Victorias y derrotas
            totalWins: bankrollStats.totalWins,
            totalLosses: bankrollStats.totalLosses,
            winRate: parseFloat(winRate),
            
            // Records
            biggestWin: this.sessionData.biggestWin,
            biggestLoss: this.sessionData.biggestLoss,
            longestWinStreak: this.sessionData.longestWinStreak,
            longestLossStreak: this.sessionData.longestLossStreak,
            currentStreak: this.sessionData.currentStreak,
            streakType: this.sessionData.streakType,
            
            // Promedios
            averageStake: this.sessionData.totalSpins > 0
                ? (this.sessionData.totalStake / this.sessionData.totalSpins).toFixed(2)
                : 0,
            averageWin: bankrollStats.totalWins > 0
                ? (this.sessionData.totalWinnings / bankrollStats.totalWins).toFixed(2)
                : 0
        };
    }
    
    /**
     * Obtiene resumen compacto
     */
    getSummary() {
        const stats = this.getStats();
        
        return {
            spins: stats.totalSpins,
            balance: stats.currentBalance,
            profit: stats.netProfit,
            duration: stats.duration,
            winRate: `${stats.winRate}%`
        };
    }
    
    /**
     * Finaliza la sesión
     */
    endSession() {
        this.sessionData.endTime = Date.now();
        console.log('[SessionStats] Sesión finalizada');
        
        return this.getStats();
    }
    
    /**
     * Exporta las estadísticas a JSON
     */
    exportJSON() {
        const stats = this.getStats();
        
        // Incluir historial si está disponible
        if (this.historyManager) {
            stats.history = this.historyManager.getAllHistory();
        }
        
        return JSON.stringify(stats, null, 2);
    }
    
    /**
     * Exporta resumen legible
     */
    exportReadable() {
        const stats = this.getStats();
        
        let report = '═══════════════════════════════════════════\n';
        report += '  RESUMEN DE SESIÓN - JHR QUANTUM ROULETTE\n';
        report += '═══════════════════════════════════════════\n\n';
        
        report += `Session ID: ${stats.sessionId}\n`;
        report += `Duración: ${stats.duration}\n`;
        report += `Inicio: ${new Date(stats.startTime).toLocaleString()}\n\n`;
        
        report += '--- ACTIVIDAD ---\n';
        report += `Total de giros: ${stats.totalSpins}\n`;
        report += `Apuesta total: $${stats.totalStake}\n`;
        report += `Ganancias totales: $${stats.totalWinnings}\n`;
        report += `Apuesta promedio: $${stats.averageStake}\n\n`;
        
        report += '--- BALANCE ---\n';
        report += `Balance inicial: $${stats.initialBalance}\n`;
        report += `Balance actual: $${stats.currentBalance}\n`;
        report += `Ganancia neta: $${stats.netProfit}\n`;
        report += `ROI: ${stats.roi}%\n\n`;
        
        report += '--- RENDIMIENTO ---\n';
        report += `Win Rate: ${stats.winRate}%\n`;
        report += `Victorias: ${stats.totalWins}\n`;
        report += `Derrotas: ${stats.totalLosses}\n\n`;
        
        report += '--- RECORDS ---\n';
        report += `Mayor victoria: $${stats.biggestWin}\n`;
        report += `Mayor pérdida: $${stats.biggestLoss}\n`;
        report += `Racha de victorias: ${stats.longestWinStreak}\n`;
        report += `Racha de derrotas: ${stats.longestLossStreak}\n\n`;
        
        report += '═══════════════════════════════════════════\n';
        
        return report;
    }
    
    /**
     * Imprime estadísticas en consola
     */
    printStats() {
        console.log(this.exportReadable());
    }
    
    /**
     * Resetea las estadísticas (nueva sesión)
     */
    reset() {
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            endTime: null,
            totalSpins: 0,
            totalStake: 0,
            totalWinnings: 0,
            biggestWin: 0,
            biggestLoss: 0,
            longestWinStreak: 0,
            longestLossStreak: 0,
            currentStreak: 0,
            streakType: null
        };
        
        console.log('[SessionStats] Estadísticas reseteadas (nueva sesión)');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SessionStats = SessionStats;
}
