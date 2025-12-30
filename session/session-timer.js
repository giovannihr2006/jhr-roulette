/**
 * session-timer.js
 * Version: 0.1.14
 * 
 * Temporizador de sesión (elapsed time)
 * - Cuenta el tiempo transcurrido desde el inicio
 * - Formato HH:MM:SS
 * - Pausa y resume
 * - Reset
 * 
 * Autor: JHR Quantum Roulette
 */

class SessionTimer {
    constructor() {
        this.startTime = null;
        this.pauseTime = null;
        this.elapsedBeforePause = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        
        // Callbacks
        this.onTick = null;
        this.onMilestone = null; // Llamado cada N minutos
        
        console.log('[SessionTimer] Inicializado');
    }
    
    /**
     * Inicia el temporizador
     */
    start() {
        if (this.isRunning && !this.isPaused) {
            console.warn('[SessionTimer] Ya está corriendo');
            return;
        }
        
        if (this.isPaused) {
            // Reanudar desde pausa
            this.resume();
            return;
        }
        
        this.startTime = Date.now();
        this.isRunning = true;
        this.isPaused = false;
        this.elapsedBeforePause = 0;
        
        this.startInterval();
        
        console.log('[SessionTimer] Iniciado');
    }
    
    /**
     * Pausa el temporizador
     */
    pause() {
        if (!this.isRunning || this.isPaused) {
            console.warn('[SessionTimer] No se puede pausar');
            return;
        }
        
        this.pauseTime = Date.now();
        this.isPaused = true;
        this.elapsedBeforePause += this.pauseTime - this.startTime;
        
        this.stopInterval();
        
        console.log('[SessionTimer] Pausado');
    }
    
    /**
     * Reanuda el temporizador
     */
    resume() {
        if (!this.isPaused) {
            console.warn('[SessionTimer] No está pausado');
            return;
        }
        
        this.startTime = Date.now();
        this.isPaused = false;
        
        this.startInterval();
        
        console.log('[SessionTimer] Reanudado');
    }
    
    /**
     * Detiene y resetea el temporizador
     */
    reset() {
        this.stop();
        this.startTime = null;
        this.pauseTime = null;
        this.elapsedBeforePause = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        console.log('[SessionTimer] Reseteado');
    }
    
    /**
     * Detiene el temporizador (sin reset)
     */
    stop() {
        this.stopInterval();
        this.isRunning = false;
        this.isPaused = false;
    }
    
    /**
     * Inicia el intervalo de actualización
     */
    startInterval() {
        this.stopInterval(); // Limpiar cualquier intervalo previo
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
    }
    
    /**
     * Detiene el intervalo de actualización
     */
    stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    /**
     * Tick del temporizador
     */
    tick() {
        const elapsed = this.getElapsedMs();
        
        if (this.onTick) {
            this.onTick(this.formatElapsedTime(elapsed));
        }
        
        // Detectar milestones (cada 5, 10, 15, 30 minutos, etc.)
        if (this.onMilestone) {
            const minutes = Math.floor(elapsed / 60000);
            if (minutes > 0 && minutes % 5 === 0 && elapsed % 60000 < 1000) {
                this.onMilestone(minutes);
            }
        }
    }
    
    /**
     * Obtiene el tiempo transcurrido en milisegundos
     */
    getElapsedMs() {
        if (!this.isRunning && !this.isPaused) {
            return 0;
        }
        
        if (this.isPaused) {
            return this.elapsedBeforePause;
        }
        
        const currentElapsed = Date.now() - this.startTime;
        return this.elapsedBeforePause + currentElapsed;
    }
    
    /**
     * Obtiene el tiempo transcurrido en segundos
     */
    getElapsedSeconds() {
        return Math.floor(this.getElapsedMs() / 1000);
    }
    
    /**
     * Obtiene el tiempo transcurrido en minutos
     */
    getElapsedMinutes() {
        return Math.floor(this.getElapsedMs() / 60000);
    }
    
    /**
     * Formatea el tiempo transcurrido (HH:MM:SS)
     */
    formatElapsedTime(ms = null) {
        const elapsed = ms !== null ? ms : this.getElapsedMs();
        
        const totalSeconds = Math.floor(elapsed / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return {
            formatted: `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`,
            hours,
            minutes,
            seconds,
            totalSeconds,
            totalMinutes: Math.floor(totalSeconds / 60)
        };
    }
    
    /**
     * Formatea el tiempo transcurrido (versión compacta)
     */
    formatCompact() {
        const elapsed = this.getElapsedMs();
        const totalMinutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        if (totalMinutes < 60) {
            return `${totalMinutes}m ${seconds}s`;
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}h ${minutes}m`;
        }
    }
    
    /**
     * Verifica si el temporizador está corriendo
     */
    isActive() {
        return this.isRunning && !this.isPaused;
    }
    
    /**
     * Padding para números (01, 02, etc.)
     */
    pad(num) {
        return num.toString().padStart(2, '0');
    }
    
    /**
     * Destructor
     */
    destroy() {
        this.stop();
        this.onTick = null;
        this.onMilestone = null;
        console.log('[SessionTimer] Destruido');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SessionTimer = SessionTimer;
}
