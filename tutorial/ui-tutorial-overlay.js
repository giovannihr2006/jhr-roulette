/**
 * ui-tutorial-overlay.js - v0.1.15
 * Overlay visual para el tutorial
 */

class TutorialOverlay {
    constructor(canvasManager, tutorialManager) {
        this.canvasManager = canvasManager;
        this.tutorialManager = tutorialManager;
        this.isVisible = false;
        this.currentHighlight = null;
        
        tutorialManager.onStepChange = (step, index) => {
            this.showStep(step);
        };
        
        tutorialManager.onComplete = () => {
            this.hide();
        };
        
        console.log('[TutorialOverlay] Inicializado');
    }
    
    showStep(step) {
        this.isVisible = true;
        this.currentStep = step;
        this.currentHighlight = this.getHighlightArea(step.target);
    }
    
    hide() {
        this.isVisible = false;
        this.currentHighlight = null;
    }
    
    getHighlightArea(target) {
        const { width, height } = this.canvasManager;
        
        const areas = {
            balance: { x: width - 220, y: 20, w: 200, h: 80 },
            history: { x: width/2 - 250, y: 30, w: 500, h: 60 },
            hotcold: { x: width - 200, y: 20, w: 180, h: 300 },
            session: { x: 20, y: height - 110, w: 200, h: 90 },
            grid: { x: width/2 - 200, y: height/2 - 100, w: 400, h: 200 },
            spin: { x: width/2 - 80, y: height - 150, w: 160, h: 60 }
        };
        
        return areas[target] || null;
    }
    
    render(ctx) {
        if (!this.isVisible || !this.tutorialManager.isActive) return;
        
        const { width, height } = this.canvasManager;
        
        // Overlay oscuro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
        
        // Highlight área
        if (this.currentHighlight) {
            const h = this.currentHighlight;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(h.x - 10, h.y - 10, h.w + 20, h.h + 20);
            ctx.restore();
            
            // Borde highlight
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(h.x - 10, h.y - 10, h.w + 20, h.h + 20);
        }
        
        // Panel de instrucciones
        const panelW = 400;
        const panelH = 200;
        const panelX = width/2 - panelW/2;
        const panelY = height/2 - panelH/2;
        
        ctx.fillStyle = 'rgba(20, 20, 30, 0.95)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelW, panelH);
        
        // Título
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentStep.title, width/2, panelY + 40);
        
        // Descripción
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        this.wrapText(ctx, this.currentStep.desc, width/2, panelY + 80, panelW - 40, 20);
        
        // Progreso
        const progress = this.tutorialManager.getProgress();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Arial';
        ctx.fillText(`Paso ${progress.current}/${progress.total}`, width/2, panelY + panelH - 50);
        
        // Botones
        this.renderButtons(ctx, panelX, panelY, panelW, panelH);
    }
    
    renderButtons(ctx, panelX, panelY, panelW, panelH) {
        const btnY = panelY + panelH - 30;
        
        // Botón Next
        ctx.fillStyle = '#00AA44';
        ctx.fillRect(panelX + panelW - 120, btnY - 20, 100, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CONTINUAR', panelX + panelW - 70, btnY - 2);
        
        // Botón Skip
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(panelX + 20, btnY - 20, 80, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('SALTAR', panelX + 60, btnY - 2);
    }
    
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let yPos = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, yPos);
                line = words[n] + ' ';
                yPos += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, yPos);
    }
    
    handleClick(x, y) {
        if (!this.isVisible) return false;
        
        const { width, height } = this.canvasManager;
        const panelW = 400;
        const panelH = 200;
        const panelX = width/2 - panelW/2;
        const panelY = height/2 - panelH/2;
        const btnY = panelY + panelH - 30;
        
        // Click en Next
        if (x >= panelX + panelW - 120 && x <= panelX + panelW - 20 &&
            y >= btnY - 20 && y <= btnY + 10) {
            this.tutorialManager.next();
            return true;
        }
        
        // Click en Skip
        if (x >= panelX + 20 && x <= panelX + 100 &&
            y >= btnY - 20 && y <= btnY + 10) {
            this.tutorialManager.skip();
            return true;
        }
        
        return false;
    }
}

if (typeof window !== 'undefined') {
    window.TutorialOverlay = TutorialOverlay;
}
