/**
 * ui-hot-cold-panel.js
 * Version: 0.1.13
 * 
 * Panel visual de números HOT y COLD
 * - Muestra los 5 números más calientes
 * - Muestra los 5 números más fríos
 * - Indicadores visuales con gradientes
 * - Posicionado en esquina superior derecha
 * - Diseño compacto y elegante
 * 
 * Autor: JHR Quantum Roulette
 */

class HotColdPanel {
    constructor(canvasManager, hotColdCalculator) {
        this.canvasManager = canvasManager;
        this.hotColdCalculator = hotColdCalculator;
        
        // Configuración visual
        this.config = {
            width: 180,
            padding: 15,
            margin: 20,
            numberSize: 32,
            spacing: 8,
            fontSize: 12,
            titleFontSize: 14,
            updateInterval: 5000 // Actualizar cada 5 segundos
        };
        
        // Cache de análisis
        this.cachedAnalysis = null;
        this.lastUpdate = 0;
        
        // Colores
        this.colors = {
            hot: '#FF4444',
            hotGradient: '#FF8844',
            cold: '#4488FF',
            coldGradient: '#44CCFF',
            background: 'rgba(20, 20, 30, 0.92)',
            border: 'rgba(255, 215, 0, 0.4)',
            text: '#FFFFFF',
            textSecondary: 'rgba(255, 255, 255, 0.7)'
        };
        
        console.log('[HotColdPanel] Inicializado');
    }
    
    /**
     * Actualiza el análisis (con cache)
     */
    updateAnalysis() {
        const now = Date.now();
        
        if (!this.cachedAnalysis || now - this.lastUpdate > this.config.updateInterval) {
            this.cachedAnalysis = this.hotColdCalculator.getFullAnalysis('medium');
            this.lastUpdate = now;
        }
    }
    
    /**
     * Dibuja un número con estilo hot/cold
     */
    drawNumber(ctx, number, x, y, isHot, intensity) {
        const size = this.config.numberSize;
        
        // Gradiente de fondo
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
        
        if (isHot) {
            const alpha = Math.min(0.3 + intensity * 0.4, 0.9);
            gradient.addColorStop(0, `rgba(255, 68, 68, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 136, 68, ${alpha * 0.5})`);
        } else {
            const alpha = Math.min(0.3 + intensity * 0.4, 0.9);
            gradient.addColorStop(0, `rgba(68, 136, 255, ${alpha})`);
            gradient.addColorStop(1, `rgba(68, 204, 255, ${alpha * 0.5})`);
        }
        
        // Círculo de fondo
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde sutil
        ctx.strokeStyle = isHot 
            ? 'rgba(255, 100, 100, 0.6)' 
            : 'rgba(100, 150, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Número
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${this.config.fontSize + 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number, x, y);
    }
    
    /**
     * Dibuja indicador de frecuencia
     */
    drawFrequencyIndicator(ctx, x, y, frequency, expected, isHot) {
        const barWidth = 40;
        const barHeight = 4;
        
        // Barra de fondo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Barra de progreso
        const ratio = Math.min(Math.abs(frequency - expected) / expected, 1);
        ctx.fillStyle = isHot ? this.colors.hot : this.colors.cold;
        ctx.fillRect(x, y, barWidth * ratio, barHeight);
        
        // Texto de frecuencia
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = `10px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(`${frequency}×`, x + barWidth + 5, y + 3);
    }
    
    /**
     * Renderiza el panel completo
     */
    render(ctx) {
        this.updateAnalysis();
        
        if (!this.cachedAnalysis || this.cachedAnalysis.totalSpins < 20) {
            return; // No mostrar si no hay suficientes datos
        }
        
        const { width, height } = this.canvasManager;
        const panelX = width - this.config.width - this.config.margin;
        const panelY = this.config.margin;
        
        const hot = this.cachedAnalysis.hot.slice(0, 5);
        const cold = this.cachedAnalysis.cold.slice(0, 5);
        
        // Calcular altura del panel
        const titleHeight = 30;
        const sectionHeight = Math.max(hot.length, cold.length) * (this.config.numberSize + this.config.spacing) + 20;
        const panelHeight = titleHeight * 2 + sectionHeight * 2 + this.config.padding * 3;
        
        // Fondo del panel
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(panelX, panelY, this.config.width, panelHeight);
        
        // Borde dorado
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, this.config.width, panelHeight);
        
        let currentY = panelY + this.config.padding;
        
        // SECCIÓN HOT
        ctx.save();
        
        // Título HOT
        ctx.fillStyle = this.colors.hot;
        ctx.font = `bold ${this.config.titleFontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('🔥 HOT NUMBERS', panelX + this.config.padding, currentY + 15);
        
        currentY += titleHeight;
        
        // Números HOT
        if (hot.length > 0) {
            hot.forEach((item, index) => {
                const x = panelX + this.config.padding + this.config.numberSize / 2;
                const y = currentY + this.config.numberSize / 2;
                
                // Intensidad basada en score (normalizado 0-1)
                const maxScore = Math.max(...hot.map(h => Math.abs(h.score)));
                const intensity = Math.abs(item.score) / maxScore;
                
                this.drawNumber(ctx, item.number, x, y, true, intensity);
                
                // Indicador de frecuencia
                this.drawFrequencyIndicator(
                    ctx,
                    x + this.config.numberSize / 2 + 10,
                    y - 2,
                    item.frequency,
                    item.expected,
                    true
                );
                
                currentY += this.config.numberSize + this.config.spacing;
            });
        } else {
            ctx.fillStyle = this.colors.textSecondary;
            ctx.font = '11px Arial';
            ctx.fillText('No hot numbers yet', panelX + this.config.padding, currentY + 10);
            currentY += 30;
        }
        
        ctx.restore();
        
        currentY += 10;
        
        // SECCIÓN COLD
        ctx.save();
        
        // Título COLD
        ctx.fillStyle = this.colors.cold;
        ctx.font = `bold ${this.config.titleFontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText('❄️ COLD NUMBERS', panelX + this.config.padding, currentY + 15);
        
        currentY += titleHeight;
        
        // Números COLD
        if (cold.length > 0) {
            cold.forEach((item, index) => {
                const x = panelX + this.config.padding + this.config.numberSize / 2;
                const y = currentY + this.config.numberSize / 2;
                
                // Intensidad basada en score
                const maxScore = Math.max(...cold.map(c => Math.abs(c.score)));
                const intensity = Math.abs(item.score) / maxScore;
                
                this.drawNumber(ctx, item.number, x, y, false, intensity);
                
                // Indicador de frecuencia
                this.drawFrequencyIndicator(
                    ctx,
                    x + this.config.numberSize / 2 + 10,
                    y - 2,
                    item.frequency,
                    item.expected,
                    false
                );
                
                currentY += this.config.numberSize + this.config.spacing;
            });
        } else {
            ctx.fillStyle = this.colors.textSecondary;
            ctx.font = '11px Arial';
            ctx.fillText('No cold numbers yet', panelX + this.config.padding, currentY + 10);
        }
        
        ctx.restore();
        
        // Indicador de confiabilidad
        ctx.save();
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        const reliabilityText = `${this.cachedAnalysis.totalSpins} spins • ${this.cachedAnalysis.reliability} confidence`;
        ctx.fillText(
            reliabilityText,
            panelX + this.config.width / 2,
            panelY + panelHeight - 8
        );
        ctx.restore();
    }
    
    /**
     * Versión compacta del panel (solo íconos)
     */
    renderCompact(ctx, x, y) {
        this.updateAnalysis();
        
        if (!this.cachedAnalysis || this.cachedAnalysis.totalSpins < 20) return;
        
        const hot = this.cachedAnalysis.hot[0];
        const cold = this.cachedAnalysis.cold[0];
        
        if (hot) {
            ctx.fillStyle = this.colors.hot;
            ctx.font = 'bold 12px Arial';
            ctx.fillText(`🔥 ${hot.number}`, x, y);
        }
        
        if (cold) {
            ctx.fillStyle = this.colors.cold;
            ctx.font = 'bold 12px Arial';
            ctx.fillText(`❄️ ${cold.number}`, x + 60, y);
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.HotColdPanel = HotColdPanel;
}
