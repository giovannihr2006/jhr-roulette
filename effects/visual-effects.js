/**
 * visual-effects.js
 * Version: 2.0.1 - Polish Visual
 * 
 * Efectos visuales avanzados para el juego
 * - Glow en número ganador
 * - Partículas doradas
 * - Efectos de transición
 * - Post-procesamiento básico
 * 
 * Autor: JHR Quantum Roulette - Final Polish
 */

class VisualEffects {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
        this.ctx = canvasManager.ctx;
        
        // Sistema de partículas
        this.particles = [];
        this.maxParticles = 50;
        
        // Efectos activos
        this.glowEffect = null;
        this.activeEffects = [];
        
        console.log('[VisualEffects] Inicializado');
    }
    
    /**
     * Crea efecto de glow en número ganador
     */
    createWinnerGlow(x, y, number, duration = 3000) {
        this.glowEffect = {
            x,
            y,
            number,
            startTime: Date.now(),
            duration,
            intensity: 0,
            maxIntensity: 1.5
        };
        
        console.log(`[VisualEffects] Glow activado en número ${number}`);
    }
    
    /**
     * Crea explosión de partículas doradas
     */
    createParticleBurst(x, y, count = 30, color = '#FFD700') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.01 + Math.random() * 0.01,
                size: 2 + Math.random() * 4,
                color,
                gravity: 0.1
            });
        }
        
        // Limitar número de partículas
        if (this.particles.length > this.maxParticles * 2) {
            this.particles = this.particles.slice(-this.maxParticles);
        }
        
        console.log(`[VisualEffects] Burst de ${count} partículas creado`);
    }
    
    /**
     * Crea efecto de confeti para grandes victorias
     */
    createConfetti(centerX, centerY, count = 50) {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 5, // Impulso inicial hacia arriba
                life: 1.0,
                decay: 0.005 + Math.random() * 0.005,
                size: 3 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 0.2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
        
        console.log(`[VisualEffects] Confeti de ${count} partículas creado`);
    }
    
    /**
     * Crea efecto de texto flotante (ej: "+$500")
     */
    createFloatingText(text, x, y, color = '#FFD700', duration = 2000) {
        this.activeEffects.push({
            type: 'floatingText',
            text,
            x,
            y: y,
            startY: y,
            color,
            startTime: Date.now(),
            duration,
            alpha: 1
        });
        
        console.log(`[VisualEffects] Texto flotante: "${text}"`);
    }
    
    /**
     * Actualiza todas las partículas
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Actualizar posición
            p.x += p.vx;
            p.y += p.vy;
            
            // Aplicar gravedad
            if (p.gravity) {
                p.vy += p.gravity;
            }
            
            // Actualizar rotación
            if (p.rotation !== undefined) {
                p.rotation += p.rotationSpeed;
            }
            
            // Decrementar vida
            p.life -= p.decay;
            
            // Eliminar partículas muertas
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Actualiza el efecto de glow
     */
    updateGlow() {
        if (!this.glowEffect) return;
        
        const elapsed = Date.now() - this.glowEffect.startTime;
        const progress = elapsed / this.glowEffect.duration;
        
        if (progress >= 1) {
            this.glowEffect = null;
            return;
        }
        
        // Pulsación (0 → 1 → 0)
        const pulse = Math.sin(progress * Math.PI * 4); // 4 pulsaciones
        this.glowEffect.intensity = pulse * this.glowEffect.maxIntensity * (1 - progress);
    }
    
    /**
     * Actualiza efectos activos
     */
    updateActiveEffects() {
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            const elapsed = Date.now() - effect.startTime;
            const progress = elapsed / effect.duration;
            
            if (progress >= 1) {
                this.activeEffects.splice(i, 1);
                continue;
            }
            
            // Actualizar según tipo
            if (effect.type === 'floatingText') {
                effect.y = effect.startY - (progress * 100); // Flotar hacia arriba
                effect.alpha = 1 - progress; // Fade out
            }
        }
    }
    
    /**
     * Renderiza todas las partículas
     */
    renderParticles(ctx) {
        ctx.save();
        
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            
            if (p.rotation !== undefined) {
                // Partícula con rotación (confeti)
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 2);
                ctx.restore();
            } else {
                // Partícula circular
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    /**
     * Renderiza el efecto de glow
     */
    renderGlow(ctx) {
        if (!this.glowEffect || this.glowEffect.intensity <= 0) return;
        
        ctx.save();
        
        const { x, y, number, intensity } = this.glowEffect;
        
        // Glow exterior
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60 * intensity);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${0.6 * intensity})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${0.3 * intensity})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 60 * intensity, 0, Math.PI * 2);
        ctx.fill();
        
        // Círculo brillante
        ctx.strokeStyle = `rgba(255, 215, 0, ${intensity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Renderiza efectos activos
     */
    renderActiveEffects(ctx) {
        ctx.save();
        
        for (const effect of this.activeEffects) {
            if (effect.type === 'floatingText') {
                ctx.globalAlpha = effect.alpha;
                ctx.fillStyle = effect.color;
                ctx.font = 'bold 32px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Sombra para legibilidad
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                ctx.fillText(effect.text, effect.x, effect.y);
            }
        }
        
        ctx.restore();
    }
    
    /**
     * Actualiza todos los efectos
     */
    update() {
        this.updateParticles();
        this.updateGlow();
        this.updateActiveEffects();
    }
    
    /**
     * Renderiza todos los efectos
     */
    render(ctx) {
        this.renderGlow(ctx);
        this.renderParticles(ctx);
        this.renderActiveEffects(ctx);
    }
    
    /**
     * Efecto completo de victoria
     */
    playWinEffect(x, y, number, amount) {
        // Glow en número
        this.createWinnerGlow(x, y, number, 3000);
        
        // Partículas según cantidad ganada
        if (amount >= 1000) {
            this.createConfetti(x, y, 50); // Gran victoria
        } else {
            this.createParticleBurst(x, y, 30); // Victoria normal
        }
        
        // Texto flotante
        this.createFloatingText(`+$${amount}`, x, y - 50, '#FFD700', 2000);
        
        console.log(`[VisualEffects] Efecto de victoria completo: $${amount}`);
    }
    
    /**
     * Limpia todos los efectos
     */
    clear() {
        this.particles = [];
        this.glowEffect = null;
        this.activeEffects = [];
        
        console.log('[VisualEffects] Efectos limpiados');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.VisualEffects = VisualEffects;
}
