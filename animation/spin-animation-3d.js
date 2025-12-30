/**
 * spin-animation-3d.js
 * Version: 2.0.0 - Fase 2: Animaciones 3D
 * 
 * Sistema de animación para giro 3D
 * - Orquestación de animaciones
 * - Sincronización con audio
 * - Transiciones de cámara
 * - Estados de animación
 * 
 * Autor: JHR Quantum Roulette - Fase 2
 */

class SpinAnimation3D {
    constructor(threeRenderer, physicsEngine, audioManager) {
        this.renderer = threeRenderer;
        this.physics = physicsEngine;
        this.audio = audioManager;
        
        // Estados de animación
        this.states = {
            IDLE: 'idle',
            PREPARING: 'preparing',
            SPINNING: 'spinning',
            SLOWING: 'slowing',
            SETTLING: 'settling',
            COMPLETE: 'complete'
        };
        
        this.currentState = this.states.IDLE;
        
        // Configuración de cámara
        this.cameraPresets = {
            overview: new THREE.Vector3(0, 15, 20),
            closeup: new THREE.Vector3(0, 8, 12),
            dramatic: new THREE.Vector3(5, 10, 15),
            topdown: new THREE.Vector3(0, 25, 0)
        };
        
        // Callbacks
        this.onStateChange = null;
        this.onComplete = null;
        
        // Loop de animación
        this.animationFrame = null;
        this.lastTime = Date.now();
        
        console.log('[SpinAnimation3D] Inicializado');
    }
    
    /**
     * Inicia el giro animado
     */
    async startSpin() {
        if (this.currentState !== this.states.IDLE) {
            console.warn('[SpinAnimation3D] Ya hay un giro en progreso');
            return;
        }
        
        console.log('[SpinAnimation3D] Iniciando giro 3D...');
        
        // Estado: PREPARING
        this.setState(this.states.PREPARING);
        
        // Cámara dramática
        this.renderer.animateCamera(this.cameraPresets.closeup, 1000);
        
        // Esperar animación de cámara
        await this.delay(1000);
        
        // Audio: inicio de giro
        if (this.audio) {
            this.audio.playSpinStart();
        }
        
        // Estado: SPINNING
        this.setState(this.states.SPINNING);
        
        // Iniciar física
        this.physics.startSpin();
        
        // Iniciar loop de animación
        this.startAnimationLoop();
    }
    
    /**
     * Loop de animación
     */
    startAnimationLoop() {
        const animate = () => {
            const currentTime = Date.now();
            const deltaTime = (currentTime - this.lastTime) / 1000; // Segundos
            this.lastTime = currentTime;
            
            // Actualizar física
            const result = this.physics.update(deltaTime);
            
            // Verificar estados
            this.updateState();
            
            // Renderizar escena
            this.renderer.render();
            
            // Si el giro terminó
            if (result) {
                this.finishSpin(result);
                return;
            }
            
            // Continuar loop
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }
    
    /**
     * Actualiza el estado según la física
     */
    updateState() {
        const physicsState = this.physics.getState();
        
        // Transición de SPINNING a SLOWING
        if (this.currentState === this.states.SPINNING) {
            if (Math.abs(physicsState.ballVelocity) < 2.0) {
                this.setState(this.states.SLOWING);
                
                // Cambiar a vista top-down cuando se ralentiza
                this.renderer.animateCamera(this.cameraPresets.topdown, 1500);
            }
        }
        
        // Transición de SLOWING a SETTLING
        if (this.currentState === this.states.SLOWING) {
            if (physicsState.ballHeight < 0.2) {
                this.setState(this.states.SETTLING);
                
                // Audio: bola cayendo
                if (this.audio) {
                    this.audio.playBallDrop();
                }
            }
        }
    }
    
    /**
     * Finaliza el giro
     */
    async finishSpin(result) {
        // Detener loop de animación
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Estado: COMPLETE
        this.setState(this.states.COMPLETE);
        
        console.log('[SpinAnimation3D] Giro completado');
        console.log(`  Número ganador: ${result.number}`);
        
        // Callback de completado
        if (this.onComplete) {
            this.onComplete(result);
        }
        
        // Esperar un momento antes de volver a IDLE
        await this.delay(2000);
        
        // Volver a vista general
        this.renderer.animateCamera(this.cameraPresets.overview, 1500);
        
        await this.delay(1500);
        
        // Volver a IDLE
        this.setState(this.states.IDLE);
    }
    
    /**
     * Cambia el estado de animación
     */
    setState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;
        
        console.log(`[SpinAnimation3D] Estado: ${oldState} → ${newState}`);
        
        if (this.onStateChange) {
            this.onStateChange(newState, oldState);
        }
    }
    
    /**
     * Obtiene el estado actual
     */
    getState() {
        return this.currentState;
    }
    
    /**
     * Verifica si está girando
     */
    isSpinning() {
        return this.currentState !== this.states.IDLE && 
               this.currentState !== this.states.COMPLETE;
    }
    
    /**
     * Cambia la vista de cámara
     */
    setCameraView(preset) {
        const position = this.cameraPresets[preset];
        
        if (!position) {
            console.warn(`[SpinAnimation3D] Preset de cámara no encontrado: ${preset}`);
            return;
        }
        
        this.renderer.animateCamera(position, 1000);
        console.log(`[SpinAnimation3D] Cámara cambiada a: ${preset}`);
    }
    
    /**
     * Detiene el giro forzadamente
     */
    stopSpin() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.physics.reset();
        this.setState(this.states.IDLE);
        
        console.log('[SpinAnimation3D] Giro detenido');
    }
    
    /**
     * Utilidad: delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Destructor
     */
    destroy() {
        this.stopSpin();
        this.onStateChange = null;
        this.onComplete = null;
        
        console.log('[SpinAnimation3D] Destruido');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SpinAnimation3D = SpinAnimation3D;
}
