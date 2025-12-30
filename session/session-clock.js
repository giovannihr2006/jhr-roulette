/**
 * session-clock.js
 * Version: 0.1.14
 * 
 * Reloj en tiempo real
 * - Formato 24h y 12h (AM/PM)
 * - Actualización automática cada segundo
 * - Soporte para múltiples zonas horarias
 * 
 * Autor: JHR Quantum Roulette
 */

class SessionClock {
    constructor(format24h = true) {
        this.format24h = format24h;
        this.currentTime = new Date();
        this.isRunning = false;
        this.intervalId = null;
        
        // Callbacks
        this.onTick = null;
        
        console.log('[SessionClock] Inicializado', format24h ? '(24h)' : '(12h AM/PM)');
    }
    
    /**
     * Inicia el reloj
     */
    start() {
        if (this.isRunning) {
            console.warn('[SessionClock] Ya está corriendo');
            return;
        }
        
        this.isRunning = true;
        this.update();
        
        // Actualizar cada segundo
        this.intervalId = setInterval(() => {
            this.update();
        }, 1000);
        
        console.log('[SessionClock] Iniciado');
    }
    
    /**
     * Detiene el reloj
     */
    stop() {
        if (!this.isRunning) return;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.isRunning = false;
        console.log('[SessionClock] Detenido');
    }
    
    /**
     * Actualiza el tiempo actual
     */
    update() {
        this.currentTime = new Date();
        
        if (this.onTick) {
            this.onTick(this.getFormattedTime());
        }
    }
    
    /**
     * Obtiene el tiempo formateado
     */
    getFormattedTime() {
        const hours = this.currentTime.getHours();
        const minutes = this.currentTime.getMinutes();
        const seconds = this.currentTime.getSeconds();
        
        if (this.format24h) {
            return this.format24Hour(hours, minutes, seconds);
        } else {
            return this.format12Hour(hours, minutes, seconds);
        }
    }
    
    /**
     * Formato 24 horas (HH:MM:SS)
     */
    format24Hour(hours, minutes, seconds) {
        return {
            formatted: `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`,
            hours,
            minutes,
            seconds,
            format: '24h'
        };
    }
    
    /**
     * Formato 12 horas (HH:MM:SS AM/PM)
     */
    format12Hour(hours, minutes, seconds) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12; // Convertir 0 a 12
        
        return {
            formatted: `${this.pad(hours12)}:${this.pad(minutes)}:${this.pad(seconds)} ${period}`,
            hours: hours12,
            minutes,
            seconds,
            period,
            format: '12h'
        };
    }
    
    /**
     * Obtiene la fecha actual formateada
     */
    getFormattedDate() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const dayName = days[this.currentTime.getDay()];
        const monthName = months[this.currentTime.getMonth()];
        const date = this.currentTime.getDate();
        const year = this.currentTime.getFullYear();
        
        return {
            full: `${dayName}, ${monthName} ${date}, ${year}`,
            short: `${monthName} ${date}, ${year}`,
            dayName,
            monthName,
            date,
            year
        };
    }
    
    /**
     * Obtiene timestamp actual
     */
    getTimestamp() {
        return this.currentTime.getTime();
    }
    
    /**
     * Cambia el formato (24h/12h)
     */
    setFormat(format24h) {
        this.format24h = format24h;
        console.log('[SessionClock] Formato cambiado a', format24h ? '24h' : '12h');
    }
    
    /**
     * Obtiene el objeto Date actual
     */
    getCurrentDate() {
        return this.currentTime;
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
        console.log('[SessionClock] Destruido');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SessionClock = SessionClock;
}
