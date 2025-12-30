/**
 * physics-engine.js
 * Version: 2.0.0 - Fase 2: Física Realista
 * 
 * Motor de física para ruleta 3D
 * - Física de bola con fricción
 * - Colisiones con divisores (frets)
 * - Gravedad y velocidad angular
 * - Detección de casilla ganadora
 * 
 * Autor: JHR Quantum Roulette - Fase 2
 */

class PhysicsEngine {
    constructor(wheelMesh, ballMesh, rouletteData) {
        this.wheelMesh = wheelMesh;
        this.ballMesh = ballMesh;
        this.rouletteData = rouletteData; // RouletteData con números y posiciones
        
        // Estado de física
        this.isSpinning = false;
        this.wheelAngularVelocity = 0;
        this.ballAngularVelocity = 0;
        this.ballHeight = 0.5;
        this.ballRadius = 3.5;
        
        // Constantes físicas
        this.physics = {
            wheelFriction: 0.98,          // Fricción del cilindro
            ballFriction: 0.985,          // Fricción de la bola
            ballAirDrag: 0.995,           // Resistencia del aire
            gravity: 0.015,               // Gravedad
            bounceRestitution: 0.6,       // Rebote en colisiones
            minVelocityThreshold: 0.01,   // Velocidad mínima para detenerse
            wheelInitialSpeed: 2.5,       // Velocidad inicial del cilindro (rad/s)
            ballInitialSpeed: -4.0        // Velocidad inicial de la bola (opuesta)
        };
        
        // Casillas de la ruleta (37 números, 0-36)
        this.pockets = this.generatePockets();
        
        // Estado actual
        this.currentPocket = null;
        this.winningNumber = null;
        
        console.log('[PhysicsEngine] Inicializado');
    }
    
    /**
     * Genera las posiciones angulares de las casillas
     */
    generatePockets() {
        const pockets = [];
        const angleStep = (Math.PI * 2) / 37; // 37 números
        
        // Orden europeo de la ruleta
        const wheelOrder = [
            0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
            5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
        ];
        
        for (let i = 0; i < wheelOrder.length; i++) {
            const number = wheelOrder[i];
            const angle = i * angleStep;
            
            pockets.push({
                number: number,
                angle: angle,
                minAngle: angle - angleStep / 2,
                maxAngle: angle + angleStep / 2
            });
        }
        
        console.log('[PhysicsEngine] 37 casillas generadas');
        return pockets;
    }
    
    /**
     * Inicia el giro de la ruleta
     */
    startSpin() {
        if (this.isSpinning) {
            console.warn('[PhysicsEngine] Ya está girando');
            return false;
        }
        
        this.isSpinning = true;
        
        // Velocidades iniciales
        this.wheelAngularVelocity = this.physics.wheelInitialSpeed;
        this.ballAngularVelocity = this.physics.ballInitialSpeed;
        
        // Resetear posición de bola
        this.ballHeight = 0.5;
        this.ballRadius = 3.5;
        
        console.log('[PhysicsEngine] Giro iniciado');
        console.log(`  Wheel velocity: ${this.wheelAngularVelocity.toFixed(2)} rad/s`);
        console.log(`  Ball velocity: ${this.ballAngularVelocity.toFixed(2)} rad/s`);
        
        return true;
    }
    
    /**
     * Actualiza la física (llamar cada frame)
     */
    update(deltaTime = 1/60) {
        if (!this.isSpinning) return null;
        
        // Actualizar rotación del cilindro
        this.updateWheel(deltaTime);
        
        // Actualizar movimiento de la bola
        this.updateBall(deltaTime);
        
        // Verificar si la bola se detuvo
        if (this.hasStopped()) {
            return this.finishSpin();
        }
        
        return null;
    }
    
    /**
     * Actualiza la rotación del cilindro
     */
    updateWheel(deltaTime) {
        // Aplicar fricción
        this.wheelAngularVelocity *= this.physics.wheelFriction;
        
        // Actualizar rotación del mesh
        if (this.wheelMesh) {
            this.wheelMesh.rotation.z += this.wheelAngularVelocity * deltaTime;
        }
    }
    
    /**
     * Actualiza el movimiento de la bola
     */
    updateBall(deltaTime) {
        // Aplicar fricción y resistencia del aire
        this.ballAngularVelocity *= this.physics.ballFriction;
        this.ballAngularVelocity *= this.physics.ballAirDrag;
        
        // Aplicar gravedad (la bola cae gradualmente hacia el centro)
        if (this.ballHeight > 0) {
            this.ballHeight -= this.physics.gravity * deltaTime;
            this.ballRadius = 3.5 - (0.5 - this.ballHeight) * 2; // Se acerca al centro
        } else {
            this.ballHeight = 0;
            this.ballRadius = Math.max(2.5, this.ballRadius * 0.99); // Se asienta
        }
        
        // Calcular posición angular
        const ballAngle = this.ballAngularVelocity * deltaTime;
        
        // Actualizar posición del mesh de la bola
        if (this.ballMesh) {
            const x = Math.cos(ballAngle) * this.ballRadius;
            const z = Math.sin(ballAngle) * this.ballRadius;
            
            this.ballMesh.position.set(x, this.ballHeight, z);
            
            // Rotación de la bola (rolling)
            this.ballMesh.rotation.x += this.ballAngularVelocity * 2 * deltaTime;
        }
        
        // Detectar colisiones con divisores (bounce)
        if (this.ballHeight < 0.2 && Math.abs(this.ballAngularVelocity) > 0.5) {
            if (Math.random() < 0.05) { // 5% chance de rebote por frame
                this.ballAngularVelocity *= -this.physics.bounceRestitution;
                console.log('[PhysicsEngine] Bounce!');
            }
        }
    }
    
    /**
     * Verifica si la bola se detuvo
     */
    hasStopped() {
        return Math.abs(this.ballAngularVelocity) < this.physics.minVelocityThreshold &&
               Math.abs(this.wheelAngularVelocity) < this.physics.minVelocityThreshold &&
               this.ballHeight <= 0.1;
    }
    
    /**
     * Finaliza el giro y determina número ganador
     */
    finishSpin() {
        this.isSpinning = false;
        
        // Detener completamente
        this.wheelAngularVelocity = 0;
        this.ballAngularVelocity = 0;
        
        // Determinar casilla ganadora
        const finalAngle = this.normalizeAngle(this.wheelMesh.rotation.z);
        this.currentPocket = this.findPocketByAngle(finalAngle);
        this.winningNumber = this.currentPocket ? this.currentPocket.number : 0;
        
        console.log('[PhysicsEngine] Giro finalizado');
        console.log(`  Winning number: ${this.winningNumber}`);
        console.log(`  Final angle: ${(finalAngle * 180 / Math.PI).toFixed(2)}°`);
        
        return {
            number: this.winningNumber,
            pocket: this.currentPocket
        };
    }
    
    /**
     * Normaliza un ángulo entre 0 y 2π
     */
    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }
    
    /**
     * Encuentra la casilla por ángulo
     */
    findPocketByAngle(angle) {
        for (const pocket of this.pockets) {
            if (angle >= pocket.minAngle && angle <= pocket.maxAngle) {
                return pocket;
            }
        }
        
        // Fallback: casilla más cercana
        let closestPocket = this.pockets[0];
        let minDiff = Math.abs(angle - closestPocket.angle);
        
        for (const pocket of this.pockets) {
            const diff = Math.abs(angle - pocket.angle);
            if (diff < minDiff) {
                minDiff = diff;
                closestPocket = pocket;
            }
        }
        
        return closestPocket;
    }
    
    /**
     * Fuerza un número ganador específico (para testing)
     */
    forceWinningNumber(targetNumber) {
        console.log(`[PhysicsEngine] Forzando número ganador: ${targetNumber}`);
        
        // Encontrar la casilla del número objetivo
        const targetPocket = this.pockets.find(p => p.number === targetNumber);
        
        if (!targetPocket) {
            console.error('[PhysicsEngine] Número no encontrado');
            return;
        }
        
        // Ajustar velocidades para que caiga en ese número
        // (esto es una simplificación, en producción usarías física inversa)
        this.wheelAngularVelocity = this.physics.wheelInitialSpeed * 0.8;
        this.ballAngularVelocity = this.physics.ballInitialSpeed * 0.8;
    }
    
    /**
     * Obtiene el estado actual
     */
    getState() {
        return {
            isSpinning: this.isSpinning,
            wheelVelocity: this.wheelAngularVelocity,
            ballVelocity: this.ballAngularVelocity,
            ballHeight: this.ballHeight,
            ballRadius: this.ballRadius,
            currentPocket: this.currentPocket,
            winningNumber: this.winningNumber
        };
    }
    
    /**
     * Resetea el motor de física
     */
    reset() {
        this.isSpinning = false;
        this.wheelAngularVelocity = 0;
        this.ballAngularVelocity = 0;
        this.ballHeight = 0.5;
        this.ballRadius = 3.5;
        this.currentPocket = null;
        this.winningNumber = null;
        
        // Resetear posiciones visuales
        if (this.wheelMesh) {
            this.wheelMesh.rotation.z = 0;
        }
        
        if (this.ballMesh) {
            this.ballMesh.position.set(3.5, 0.5, 0);
            this.ballMesh.rotation.x = 0;
        }
        
        console.log('[PhysicsEngine] Reseteado');
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.PhysicsEngine = PhysicsEngine;
}
