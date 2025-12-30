/**
 * reality-check.js
 * Version: 0.1.14
 * 
 * Sistema de Reality Check (Juego Responsable)
 * - Recordatorio cada N minutos (default: 30 min)
 * - Pausa automática del juego
 * - Estadísticas de sesión en el aviso
 * - Cumplimiento regulatorio
 * 
 * Autor: JHR Quantum Roulette
 */

class RealityCheck {
    constructor(intervalMinutes = 30) {
        this.intervalMinutes = intervalMinutes;
        this.intervalMs = intervalMinutes * 60 * 1000;
        this.lastCheckTime = Date.now();
        this.isEnabled = true;
        this.checkIntervalId = null;
        
        // Callbacks
        this.onRealityCheck = null; // Llamado cuando se dispara el check
        this.onPause = null;        // Llamado cuando se pausa el juego
        this.onResume = null;       // Llamado cuando se reanuda el juego
        
        // Configuración
        this.config = {
            autoLaunch: true,       // Lanzar automáticamente
            pauseGame: true,        // Pausar el juego durante el check
            showStats: true,        // Mostrar estadísticas de sesión
            requireConfirmation: true // Requiere confirmación para continuar
        };
        
        console.log(`[RealityCheck] Inicializado (intervalo: ${intervalMinutes} minutos)`);
    }
    
    /**
     * Inicia el sistema de Reality Check
     */
    start() {
        if (this.checkIntervalId) {
            console.warn('[RealityCheck] Ya está corriendo');
            return;
        }
        
        this.lastCheckTime = Date.now();
        
        // Comprobar cada minuto si es momento de hacer el check
        this.checkIntervalId = setInterval(() => {
            this.checkIfTimeForReality();
        }, 60000); // Cada 1 minuto
        
        console.log('[RealityCheck] Sistema iniciado');
    }
    
    /**
     * Detiene el sistema
     */
    stop() {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
            this.checkIntervalId = null;
        }
        console.log('[RealityCheck] Sistema detenido');
    }
    
    /**
     * Verifica si es momento de mostrar el Reality Check
     */
    checkIfTimeForReality() {
        if (!this.isEnabled) return;
        
        const now = Date.now();
        const elapsed = now - this.lastCheckTime;
        
        if (elapsed >= this.intervalMs) {
            this.triggerRealityCheck();
        }
    }
    
    /**
     * Dispara el Reality Check
     */
    triggerRealityCheck() {
        console.log('[RealityCheck] ⏰ Reality Check disparado');
        
        this.lastCheckTime = Date.now();
        
        if (this.onRealityCheck) {
            this.onRealityCheck(this.getSessionStats());
        }
        
        if (this.config.autoLaunch) {
            this.showRealityCheckDialog();
        }
    }
    
    /**
     * Muestra el diálogo de Reality Check
     */
    showRealityCheckDialog() {
        // Pausar el juego si está configurado
        if (this.config.pauseGame && this.onPause) {
            this.onPause();
        }
        
        const stats = this.getSessionStats();
        
        // Crear mensaje
        let message = '⏰ REALITY CHECK - Recordatorio de Juego Responsable\n\n';
        
        if (this.config.showStats && stats) {
            message += `Has estado jugando durante: ${stats.sessionDuration}\n`;
            message += `Giros totales: ${stats.totalSpins}\n`;
            message += `Balance actual: $${stats.currentBalance}\n`;
            message += `Ganancia/Pérdida: $${stats.netProfit}\n\n`;
        }
        
        message += 'Por favor, toma un momento para revisar tu actividad de juego.\n\n';
        message += '¿Deseas continuar jugando?';
        
        // Mostrar confirmación
        const userWantsToContinue = this.config.requireConfirmation
            ? confirm(message)
            : alert(message) || true;
        
        if (userWantsToContinue) {
            console.log('[RealityCheck] Usuario decidió continuar');
            if (this.onResume) {
                this.onResume();
            }
        } else {
            console.log('[RealityCheck] Usuario decidió parar');
            // Mantener el juego pausado
            this.showThankYouMessage();
        }
    }
    
    /**
     * Muestra mensaje de agradecimiento
     */
    showThankYouMessage() {
        alert('Gracias por jugar responsablemente.\n\nRecuerda:\n- El juego debe ser divertido\n- Nunca juegues con dinero que no puedas permitirte perder\n- Si necesitas ayuda, busca apoyo profesional');
    }
    
    /**
     * Obtiene estadísticas de sesión (si están disponibles)
     */
    getSessionStats() {
        // Intentar obtener stats de window.sessionStats si existe
        if (typeof window !== 'undefined' && window.sessionStats) {
            return window.sessionStats.getStats();
        }
        
        // Intentar obtener de bankrollManager y sessionTimer
        if (typeof window !== 'undefined') {
            const bankroll = window.bankrollManager;
            const timer = window.sessionTimer;
            
            if (bankroll && timer) {
                const stats = bankroll.getStats();
                const time = timer.formatElapsedTime();
                
                return {
                    sessionDuration: time.formatted,
                    totalSpins: stats.totalBets,
                    currentBalance: bankroll.getBalance(),
                    netProfit: bankroll.getNetProfit()
                };
            }
        }
        
        return null;
    }
    
    /**
     * Fuerza un Reality Check inmediato
     */
    forceCheck() {
        console.log('[RealityCheck] Reality Check forzado manualmente');
        this.triggerRealityCheck();
    }
    
    /**
     * Resetea el temporizador
     */
    resetTimer() {
        this.lastCheckTime = Date.now();
        console.log('[RealityCheck] Temporizador reseteado');
    }
    
    /**
     * Configura el intervalo
     */
    setInterval(minutes) {
        this.intervalMinutes = minutes;
        this.intervalMs = minutes * 60 * 1000;
        this.resetTimer();
        console.log(`[RealityCheck] Intervalo actualizado a ${minutes} minutos`);
    }
    
    /**
     * Habilita/deshabilita el sistema
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`[RealityCheck] ${enabled ? 'Habilitado' : 'Deshabilitado'}`);
    }
    
    /**
     * Obtiene el tiempo restante hasta el próximo check
     */
    getTimeUntilNextCheck() {
        const now = Date.now();
        const elapsed = now - this.lastCheckTime;
        const remaining = Math.max(0, this.intervalMs - elapsed);
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        return {
            ms: remaining,
            minutes,
            seconds,
            formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`
        };
    }
    
    /**
     * Configura opciones
     */
    configure(options) {
        this.config = { ...this.config, ...options };
        console.log('[RealityCheck] Configuración actualizada:', this.config);
    }
    
    /**
     * Destructor
     */
    destroy() {
        this.stop();
        this.onRealityCheck = null;
        this.onPause = null;
        this.onResume = null;
        console.log('[RealityCheck] Destruido');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.RealityCheck = RealityCheck;
}
