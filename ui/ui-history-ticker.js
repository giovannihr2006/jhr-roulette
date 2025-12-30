/**
 * ui-history-ticker.js
 * Version: 0.1.13
 * 
 * Ticker visual de últimos 12 resultados
 * - Renderizado horizontal en la parte superior
 * - Números con colores de ruleta (rojo, negro, verde)
 * - Animación de entrada para nuevos resultados
 * - Diseño minimalista y profesional
 * 
 * Autor: JHR Quantum Roulette
 */

class HistoryTicker {
    constructor(canvasManager, historyManager) {
        this.canvasManager = canvasManager;
        this.historyManager = historyManager;
        
        // Configuración visual
        this.config = {
            maxDisplay: 12,     // Máximo de números a mostrar
            numberSize: 40,     // Tamaño del círculo
            spacing: 10,        // Espacio entre números
            yOffset: 60,        // Offset desde arriba
            fontSize: 18,       // Tamaño de fuente
            animationDuration: 500, // ms para animación de entrada
            fadeInDistance: 100 // Distancia de fade-in
        };
        
        // Estado de animación
        this.animationProgress = 0;
        this.isAnimating = false;
        this.lastHistoryLength = 0;
        
        console.log('[HistoryTicker] Inicializado');
    }
    
    /**
     * Obtiene el color del número según reglas de ruleta
     */
    getNumberColor(numberData) {
        if (numberData === 0) return '#00AA44'; // Verde
        
        // Números rojos en ruleta europea
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        return redNumbers.includes(numberData) ? '#E41E31' : '#2D2D2D';
    }
    
    /**
     * Inicia animación de nuevo número
     */
    startAnimation() {
        this.isAnimating = true;
        this.animationProgress = 0;
        
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            this.animationProgress = Math.min(elapsed / this.config.animationDuration, 1);
            
            if (this.animationProgress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Detecta si hay un nuevo resultado
     */
    checkForNewResult() {
        const currentLength = this.historyManager.history.length;
        
        if (currentLength > this.lastHistoryLength) {
            this.startAnimation();
            this.lastHistoryLength = currentLength;
        }
    }
    
    /**
     * Renderiza el ticker
     */
    render(ctx) {
        this.checkForNewResult();
        
        const results = this.historyManager.getLastResults(this.config.maxDisplay);
        
        if (results.length === 0) return;
        
        const { width, height } = this.canvasManager;
        
        // Calcular posición central
        const totalWidth = (this.config.numberSize + this.config.spacing) * results.length;
        let startX = (width - totalWidth) / 2;
        const y = this.config.yOffset;
        
        // Renderizar cada número
        results.forEach((entry, index) => {
            const x = startX + index * (this.config.numberSize + this.config.spacing);
            
            // Aplicar animación solo al primer número si está animando
            let alpha = 1;
            let offsetX = 0;
            
            if (index === 0 && this.isAnimating) {
                alpha = this.animationProgress;
                offsetX = (1 - this.animationProgress) * this.config.fadeInDistance;
            }
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Dibujar círculo de fondo
            const color = this.getNumberColor(entry.number);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(
                x + this.config.numberSize / 2 - offsetX,
                y,
                this.config.numberSize / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Borde dorado sutil
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Dibujar número
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold ${this.config.fontSize}px 'Segoe UI', Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                entry.number,
                x + this.config.numberSize / 2 - offsetX,
                y
            );
            
            ctx.restore();
        });
        
        // Etiqueta "HISTORY"
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('HISTORY', startX, y - this.config.numberSize / 2 - 10);
        ctx.restore();
    }
    
    /**
     * Renderiza versión compacta (para espacios reducidos)
     */
    renderCompact(ctx, x, y, maxNumbers = 6) {
        const results = this.historyManager.getLastResults(maxNumbers);
        
        if (results.length === 0) return;
        
        const numberSize = 28;
        const spacing = 6;
        
        results.forEach((entry, index) => {
            const posX = x + index * (numberSize + spacing);
            
            // Círculo de fondo
            const color = this.getNumberColor(entry.number);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(posX + numberSize / 2, y, numberSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Número
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold 14px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(entry.number, posX + numberSize / 2, y);
        });
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.HistoryTicker = HistoryTicker;
}
