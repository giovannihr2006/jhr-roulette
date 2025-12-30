/**
 * spin-controller.js
 * Version: 0.1.11 → 0.1.13 (ACTUALIZADO)
 * 
 * Motor de control de giro con estados
 * ACTUALIZACIÓN v0.1.13: Integración con HistoryManager
 * 
 * Estados:
 * - READY: Listo para apostar
 * - NO_MORE_BETS: Cerrado para apuestas
 * - SPINNING: Girando
 * - RESOLVING: Resolviendo apuestas
 * - PAYING: Pagando premios
 * 
 * Autor: JHR Quantum Roulette
 */

class SpinController {
    constructor(bankrollManager, rouletteEngine, payoutCalculator, historyManager = null) {
        this.bankrollManager = bankrollManager;
        this.rouletteEngine = rouletteEngine;
        this.payoutCalculator = payoutCalculator;
        this.historyManager = historyManager; // ← NUEVO v0.1.13
        
        // Estado del giro
        this.state = 'READY'; // READY | NO_MORE_BETS | SPINNING | RESOLVING | PAYING
        this.winningNumber = null;
        this.currentBets = [];
        this.totalStake = 0;
        
        // Callbacks
        this.onStateChange = null;
        this.onWin = null;
        this.onResult = null;
        
        // Configuración de tiempos
        this.timing = {
            noMoreBetsDelay: 1000,  // Delay antes de girar
            spinDuration: 3000,      // Duración del giro
            resolvingDelay: 500,     // Delay antes de pagar
            payingDuration: 1500     // Duración de animación de pago
        };
        
        console.log('[SpinController] Inicializado', historyManager ? 'con historial' : 'sin historial');
    }
    
    /**
     * Cambia el estado del controlador
     */
    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        
        console.log(`[SpinController] Estado: ${oldState} → ${newState}`);
        
        if (this.onStateChange) {
            this.onStateChange(newState, oldState);
        }
    }
    
    /**
     * Obtiene el estado actual
     */
    getState() {
        return this.state;
    }
    
    /**
     * Verifica si se pueden hacer apuestas
     */
    canPlaceBets() {
        return this.state === 'READY';
    }
    
    /**
     * Añade una apuesta al giro actual
     */
    placeBet(betData) {
        if (!this.canPlaceBets()) {
            console.warn('[SpinController] No se pueden hacer apuestas en estado:', this.state);
            return false;
        }
        
        // Verificar saldo
        if (!this.bankrollManager.canBet(betData.amount)) {
            console.warn('[SpinController] Saldo insuficiente');
            return false;
        }
        
        this.currentBets.push(betData);
        this.totalStake += betData.amount;
        
        console.log(`[SpinController] Apuesta añadida: ${betData.type} - $${betData.amount}`);
        return true;
    }
    
    /**
     * Limpia todas las apuestas
     */
    clearBets() {
        if (!this.canPlaceBets()) {
            return false;
        }
        
        this.currentBets = [];
        this.totalStake = 0;
        console.log('[SpinController] Apuestas limpiadas');
        return true;
    }
    
    /**
     * Inicia el giro
     */
    async spin() {
        if (this.state !== 'READY') {
            console.warn('[SpinController] No se puede girar en estado:', this.state);
            return;
        }
        
        if (this.currentBets.length === 0) {
            console.warn('[SpinController] No hay apuestas para girar');
            return;
        }
        
        // Debitar apuestas del bankroll
        this.bankrollManager.placeBet(this.totalStake);
        
        // Estado: NO MORE BETS
        this.setState('NO_MORE_BETS');
        
        await this.delay(this.timing.noMoreBetsDelay);
        
        // Estado: SPINNING
        this.setState('SPINNING');
        
        // Generar número ganador
        this.winningNumber = this.rouletteEngine.spin();
        
        await this.delay(this.timing.spinDuration);
        
        // Procesar resultado ganador
        this.processWinningNumber();
    }
    
    /**
     * Procesa el número ganador y determina pagos
     */
    processWinningNumber() {
        console.log(`[SpinController] Winning number: ${this.winningNumber.value} ${this.winningNumber.color}`);
        
        // ========== NUEVO v0.1.13: Registrar en historial ==========
        if (this.historyManager) {
            this.historyManager.addResult(this.winningNumber);
            console.log('[SpinController] Resultado añadido al historial');
        }
        // ===========================================================
        
        this.setState('RESOLVING');
        
        setTimeout(() => {
            this.calculateWinnings();
        }, this.timing.resolvingDelay);
    }
    
    /**
     * Calcula y paga las ganancias
     */
    calculateWinnings() {
        let totalWinnings = 0;
        const winningBets = [];
        
        // Evaluar cada apuesta
        for (const bet of this.currentBets) {
            const result = this.payoutCalculator.calculatePayout(
                bet,
                this.winningNumber.value
            );
            
            if (result.wins) {
                totalWinnings += result.payout;
                winningBets.push({
                    ...bet,
                    payout: result.payout,
                    profit: result.profit
                });
                
                console.log(`[SpinController] ✓ Ganaste: ${bet.type} - $${result.payout} (profit: $${result.profit})`);
            }
        }
        
        // Estado: PAYING
        this.setState('PAYING');
        
        if (totalWinnings > 0) {
            // Acreditar ganancias
            this.bankrollManager.collectWinnings(totalWinnings);
            
            if (this.onWin) {
                this.onWin({
                    totalWinnings,
                    totalStake: this.totalStake,
                    profit: totalWinnings - this.totalStake,
                    winningBets
                });
            }
        } else {
            // Registrar pérdida
            this.bankrollManager.registerLoss(this.totalStake);
        }
        
        // Callback de resultado
        if (this.onResult) {
            this.onResult({
                winningNumber: this.winningNumber,
                totalStake: this.totalStake,
                totalWinnings,
                profit: totalWinnings - this.totalStake,
                winningBets
            });
        }
        
        // Volver a READY después de pagar
        setTimeout(() => {
            this.reset();
        }, this.timing.payingDuration);
    }
    
    /**
     * Resetea el controlador para el siguiente giro
     */
    reset() {
        this.currentBets = [];
        this.totalStake = 0;
        this.winningNumber = null;
        this.setState('READY');
        
        console.log('[SpinController] Listo para el siguiente giro');
    }
    
    /**
     * Obtiene las apuestas actuales
     */
    getCurrentBets() {
        return [...this.currentBets];
    }
    
    /**
     * Obtiene el stake total
     */
    getTotalStake() {
        return this.totalStake;
    }
    
    /**
     * Obtiene el número ganador (si existe)
     */
    getWinningNumber() {
        return this.winningNumber;
    }
    
    /**
     * Utilidad: delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Configura tiempos personalizados
     */
    setTiming(timingConfig) {
        this.timing = { ...this.timing, ...timingConfig };
        console.log('[SpinController] Tiempos actualizados:', this.timing);
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SpinController = SpinController;
}
