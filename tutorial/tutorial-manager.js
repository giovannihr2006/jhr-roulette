/**
 * tutorial-manager.js - v0.1.15
 * Sistema de tutorial interactivo paso a paso
 */

class TutorialManager {
    constructor() {
        this.steps = [
            { id: 1, title: 'Bienvenida', desc: 'Bienvenido a JHR Quantum Roulette. Este tutorial te guiará paso a paso.', target: null, action: 'continue' },
            { id: 2, title: 'Balance', desc: 'Tu balance actual se muestra aquí. Comenzamos con $10,000.', target: 'balance', action: 'continue' },
            { id: 3, title: 'Historial', desc: 'Aquí verás el historial de los últimos 12 resultados.', target: 'history', action: 'continue' },
            { id: 4, title: 'Hot/Cold', desc: 'Este panel muestra números calientes y fríos basados en frecuencia estadística.', target: 'hotcold', action: 'continue' },
            { id: 5, title: 'Sesión', desc: 'Información de tu sesión actual: reloj y tiempo transcurrido.', target: 'session', action: 'continue' },
            { id: 6, title: 'Apuestas', desc: 'Haz clic en el tablero para hacer apuestas. Prueba hacer clic en un número.', target: 'grid', action: 'bet' },
            { id: 7, title: 'Girar', desc: 'Presiona ESPACIO o haz clic en "SPIN" para girar la ruleta.', target: 'spin', action: 'spin' },
            { id: 8, title: 'Completado', desc: '¡Tutorial completado! Ahora puedes jugar libremente.', target: null, action: 'finish' }
        ];
        
        this.currentStep = 0;
        this.isActive = false;
        this.hasSeenTutorial = localStorage.getItem('jhr_tutorial_completed') === 'true';
        
        this.onStepChange = null;
        this.onComplete = null;
        
        console.log('[TutorialManager] Inicializado');
    }
    
    start() {
        if (this.hasSeenTutorial) {
            console.log('[TutorialManager] Tutorial ya completado anteriormente');
            return false;
        }
        
        this.isActive = true;
        this.currentStep = 0;
        this.showStep(0);
        console.log('[TutorialManager] Tutorial iniciado');
        return true;
    }
    
    showStep(index) {
        if (index >= this.steps.length) {
            this.complete();
            return;
        }
        
        this.currentStep = index;
        const step = this.steps[index];
        
        if (this.onStepChange) {
            this.onStepChange(step, index);
        }
        
        console.log(`[TutorialManager] Paso ${index + 1}/${this.steps.length}: ${step.title}`);
    }
    
    next() {
        this.showStep(this.currentStep + 1);
    }
    
    skip() {
        this.complete();
    }
    
    complete() {
        this.isActive = false;
        localStorage.setItem('jhr_tutorial_completed', 'true');
        this.hasSeenTutorial = true;
        
        if (this.onComplete) {
            this.onComplete();
        }
        
        console.log('[TutorialManager] Tutorial completado');
    }
    
    reset() {
        localStorage.removeItem('jhr_tutorial_completed');
        this.hasSeenTutorial = false;
        console.log('[TutorialManager] Tutorial reseteado');
    }
    
    getCurrentStep() {
        return this.steps[this.currentStep];
    }
    
    getProgress() {
        return {
            current: this.currentStep + 1,
            total: this.steps.length,
            percentage: ((this.currentStep + 1) / this.steps.length * 100).toFixed(0)
        };
    }
}

if (typeof window !== 'undefined') {
    window.TutorialManager = TutorialManager;
}
