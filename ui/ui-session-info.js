/**
 * ui-session-info.js
 * Version: 0.1.14
 * 
 * Panel de información de sesión
 * - Reloj en tiempo real
 * - Temporizador de sesión (elapsed time)
 * - Posicionado en esquina inferior izquierda
 * - Diseño minimalista y elegante
 * 
 * Autor: JHR Quantum Roulette
 */

class SessionInfoUI {
    constructor(canvasManager, sessionClock, sessionTimer) {
        this.canvasManager = canvasManager;
        this.sessionClock = sessionClock;
        this.sessionTimer = sessionTimer;
        
        // Configuración visual
        this.config = {
            width: 200,
            height: 90,
            margin: 20,
            padding: 15,
            fontSize: 14,
            labelFontSize: 11,
            iconSize: 16
        };
        
        // Colores
        this.colors = {
            background: 'rgba(20, 20, 30, 0.92)',
            border: 'rgba(255, 215, 0, 0.4)',
            text: '#FFFFFF',
            textSecondary: 'rgba(255, 255, 255, 0.6)',
            accent: '#FFD700'
        };
        
        // Cache de valores
        this.cachedClock = '';
        this.cachedTimer = '';
        
        console.log('[SessionInfoUI] Inicializado');
    }
    
    /**
     * Actualiza los valores del cache
     */
    updateCache() {
        if (this.sessionClock && this.sessionClock.isRunning) {
            const timeData = this.sessionClock.getFormattedTime();
            this.cachedClock = timeData.formatted;
        }
        
        if (this.sessionTimer && this.sessionTimer.isActive()) {
            const timeData = this.sessionTimer.formatElapsedTime();
            this.cachedTimer = timeData.formatted;
        }
    }
    
    /**
     * Renderiza el panel completo
     */
    render(ctx) {
        this.updateCache();
        
        const { height } = this.canvasManager;
        
        // Posición en esquina inferior izquierda
        const panelX = this.config.margin;
        const panelY = height - this.config.height - this.config.margin;
        
        // Fondo del panel
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(panelX, panelY, this.config.width, this.config.height);
        
        // Borde dorado
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, this.config.width, this.config.height);
        
        let currentY = panelY + this.config.padding;
        
        // ===== RELOJ EN TIEMPO REAL =====
        ctx.save();
        
        // Ícono de reloj
        ctx.fillStyle = this.colors.accent;
        ctx.font = `${this.config.iconSize}px Arial`;
        ctx.fillText('🕐', panelX + this.config.padding, currentY + 10);
        
        // Label "TIME"
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = `${this.config.labelFontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('TIME', panelX + this.config.padding + 25, currentY + 8);
        
        // Valor del reloj
        ctx.fillStyle = this.colors.text;
        ctx.font = `bold ${this.config.fontSize}px 'Courier New', monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(
            this.cachedClock || '--:--:--',
            panelX + this.config.width - this.config.padding,
            currentY + 10
        );
        
        ctx.restore();
        
        currentY += 35;
        
        // ===== TEMPORIZADOR DE SESIÓN =====
        ctx.save();
        
        // Ícono de cronómetro
        ctx.fillStyle = this.colors.accent;
        ctx.font = `${this.config.iconSize}px Arial`;
        ctx.fillText('⏱️', panelX + this.config.padding, currentY + 10);
        
        // Label "SESSION"
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = `${this.config.labelFontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('SESSION', panelX + this.config.padding + 25, currentY + 8);
        
        // Valor del temporizador
        ctx.fillStyle = this.colors.text;
        ctx.font = `bold ${this.config.fontSize}px 'Courier New', monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(
            this.cachedTimer || '00:00:00',
            panelX + this.config.width - this.config.padding,
            currentY + 10
        );
        
        ctx.restore();
    }
    
    /**
     * Renderiza versión compacta (una sola línea)
     */
    renderCompact(ctx, x, y) {
        this.updateCache();
        
        ctx.save();
        
        // Reloj
        ctx.fillStyle = this.colors.text;
        ctx.font = `12px 'Courier New', monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(`🕐 ${this.cachedClock}`, x, y);
        
        // Temporizador
        ctx.fillText(`⏱️ ${this.cachedTimer}`, x + 120, y);
        
        ctx.restore();
    }
    
    /**
     * Renderiza solo el reloj
     */
    renderClockOnly(ctx, x, y, size = 'normal') {
        this.updateCache();
        
        ctx.save();
        
        if (size === 'large') {
            ctx.fillStyle = this.colors.text;
            ctx.font = `bold 24px 'Courier New', monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(this.cachedClock, x, y);
        } else {
            ctx.fillStyle = this.colors.text;
            ctx.font = `14px 'Courier New', monospace`;
            ctx.textAlign = 'left';
            ctx.fillText(`🕐 ${this.cachedClock}`, x, y);
        }
        
        ctx.restore();
    }
    
    /**
     * Renderiza solo el temporizador
     */
    renderTimerOnly(ctx, x, y, size = 'normal') {
        this.updateCache();
        
        ctx.save();
        
        if (size === 'large') {
            ctx.fillStyle = this.colors.text;
            ctx.font = `bold 24px 'Courier New', monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(this.cachedTimer, x, y);
        } else {
            ctx.fillStyle = this.colors.text;
            ctx.font = `14px 'Courier New', monospace`;
            ctx.textAlign = 'left';
            ctx.fillText(`⏱️ ${this.cachedTimer}`, x, y);
        }
        
        ctx.restore();
    }
    
    /**
     * Obtiene las dimensiones del panel
     */
    getDimensions() {
        return {
            width: this.config.width,
            height: this.config.height
        };
    }
    
    /**
     * Verifica si un punto está dentro del panel
     */
    isPointInside(x, y) {
        const { height } = this.canvasManager;
        const panelX = this.config.margin;
        const panelY = height - this.config.height - this.config.margin;
        
        return (
            x >= panelX &&
            x <= panelX + this.config.width &&
            y >= panelY &&
            y <= panelY + this.config.height
        );
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SessionInfoUI = SessionInfoUI;
}
