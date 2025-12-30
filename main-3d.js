/**
 * main-3d.js
 * Version: 2.0.0 - Fase 2: Integración Completa
 * 
 * Integración del motor 3D con el sistema existente
 * - Conecta ThreeRenderer, PhysicsEngine y SpinAnimation3D
 * - Mantiene compatibilidad con sistema 2D
 * - Modo híbrido: 3D + UI 2D overlay
 * 
 * Autor: JHR Quantum Roulette - Fase 2
 */

// ===== NUEVOS COMPONENTES FASE 2 =====
let threeRenderer = null;
let physicsEngine = null;
let spinAnimation3D = null;
let is3DMode = true; // true = 3D, false = 2D clásico

/**
 * Inicializa el sistema 3D (Fase 2)
 */
async function init3DSystem() {
    console.log('\n═══════════════════════════════════════════');
    console.log('  FASE 2: INICIALIZANDO SISTEMA 3D');
    console.log('═══════════════════════════════════════════\n');
    
    // Inicializar efectos visuales
    window.visualEffects = new VisualEffects();
    console.log('✨ Sistema de efectos visuales iniciado');
    
    // Verificar que Three.js esté disponible
    if (typeof THREE === 'undefined') {
        console.error('[Main3D] Three.js no está cargado. Usando modo 2D.');
        is3DMode = false;
        return false;
    }
    
    try {
        // 1. Inicializar ThreeRenderer
        const canvas3D = document.getElementById('canvas3D') || canvasManager.canvas;
        threeRenderer = new ThreeRenderer(canvas3D);
        await threeRenderer.init();
        
        // 2. Inicializar PhysicsEngine
        const wheel = threeRenderer.getWheel();
        const ball = threeRenderer.getBall();
        physicsEngine = new PhysicsEngine(wheel, ball, rouletteData);
        
        // 3. Inicializar SpinAnimation3D
        spinAnimation3D = new SpinAnimation3D(threeRenderer, physicsEngine, audioManager);
        
        // 4. Configurar callbacks
        spinAnimation3D.onStateChange = (newState, oldState) => {
            console.log(`[Main3D] Estado de giro: ${newState}`);
        };
        
        spinAnimation3D.onComplete = (result) => {
            console.log(`[Main3D] Giro completado: ${result.number}`);
            
            // Actualizar sistema existente
            if (historyManager) {
                const numberData = rouletteData.getNumberData(result.number);
                historyManager.addResult(numberData);
            }
            
            // Reproducir audio de victoria si hay apuestas
            if (audioManager && result.number !== null) {
                // Simulación de ganancia (conectar con sistema real de apuestas)
                const winAmount = Math.random() * 5000;
                audioManager.playWin(winAmount);
            }
        };
        
        // 5. Iniciar loop de renderizado 3D
        start3DRenderLoop();
        
        // Exponer globalmente
        window.threeRenderer = threeRenderer;
        window.physicsEngine = physicsEngine;
        window.spinAnimation3D = spinAnimation3D;
        
        console.log('[Main3D] ✓ Sistema 3D inicializado completamente\n');
        return true;
        
    } catch (error) {
        console.error('[Main3D] Error inicializando sistema 3D:', error);
        is3DMode = false;
        return false;
    }
}

/**
 * Loop de renderizado 3D
 */
function start3DRenderLoop() {
    function render3D() {
        // Renderizar escena 3D
        if (threeRenderer && is3DMode) {
            threeRenderer.render();
        }
        
        // Renderizar UI 2D overlay (mantener sistema existente)
        const ctx = canvasManager.ctx;
        
        // Limpiar solo si no está en modo 3D
        if (!is3DMode) {
            ctx.fillStyle = '#1a472a';
            ctx.fillRect(0, 0, canvasManager.width, canvasManager.height);
        } else {
            // En modo 3D, limpiar con transparencia para overlay
            ctx.clearRect(0, 0, canvasManager.width, canvasManager.height);
        }
        
        // Renderizar componentes UI (siempre visible)
        if (balanceUI) balanceUI.render(ctx);
        if (historyTicker) historyTicker.render(ctx);
        if (hotColdPanel) hotColdPanel.render(ctx);
        if (sessionInfoUI) sessionInfoUI.render(ctx);
        
        requestAnimationFrame(render3D);
    }
    
    render3D();
    console.log('[Main3D] Loop de renderizado 3D iniciado');
}

/**
 * Giro 3D (reemplaza testSpin en modo 3D)
 */
async function testSpin3D() {
    if (!is3DMode || !spinAnimation3D) {
        console.warn('[Main3D] Modo 3D no disponible, usando modo 2D');
        testSpin(); // Fallback a 2D
        return;
    }
    
    if (spinAnimation3D.isSpinning()) {
        console.warn('[Main3D] Ya hay un giro en progreso');
        return;
    }
    
    console.log('\n[Main3D] Iniciando giro 3D...');
    
    // Efectos visuales durante el giro
    if (window.visualEffects) {
        window.visualEffects.createSpinEffect();
    }
    
    await spinAnimation3D.startSpin();
    
    // Efectos visuales al finalizar
    if (window.visualEffects && spinAnimation3D.lastResult) {
        const number = spinAnimation3D.lastResult.value;
        window.visualEffects.createWinEffect(number);
        window.visualEffects.createParticleExplosion(number);
    }
}

/**
 * Toggle entre modo 3D y 2D
 */
function toggle3DMode() {
    if (!threeRenderer) {
        console.warn('[Main3D] Sistema 3D no disponible');
        return;
    }
    
    is3DMode = !is3DMode;
    
    console.log(`[Main3D] Modo ${is3DMode ? '3D' : '2D'} activado`);
    
    return is3DMode;
}

/**
 * Cambiar vista de cámara
 */
function changeCameraView(preset) {
    if (!spinAnimation3D) {
        console.warn('[Main3D] Sistema 3D no disponible');
        return;
    }
    
    spinAnimation3D.setCameraView(preset);
    console.log(`[Main3D] Vista cambiada a: ${preset}`);
}

/**
 * Resize handler para 3D
 */
function handle3DResize() {
    if (threeRenderer && canvasManager) {
        threeRenderer.resize(canvasManager.width, canvasManager.height);
    }
}

/**
 * Atajos de teclado adicionales para Fase 2
 */
document.addEventListener('keydown', (e) => {
    if (!is3DMode) return;
    
    switch(e.key.toLowerCase()) {
        case '1':
            changeCameraView('overview');
            break;
        case '2':
            changeCameraView('closeup');
            break;
        case '3':
            changeCameraView('dramatic');
            break;
        case '4':
            changeCameraView('topdown');
            break;
        case 't':
            toggle3DMode();
            break;
    }
});

/**
 * Actualizar init() original para incluir 3D
 */
const originalInit = window.init;
window.init = async function() {
    // Llamar a init original
    if (originalInit) {
        await originalInit();
    }
    
    // Añadir sistema 3D
    await init3DSystem();
    
    // Actualizar resize handler
    if (canvasManager) {
        const originalResize = canvasManager.onResize;
        canvasManager.onResize = () => {
            if (originalResize) originalResize();
            handle3DResize();
        };
    }
    
    console.log('\n[Main3D] ✓ Integración completa Fase 2');
    console.log('[Main3D] Funciones disponibles:');
    console.log('  • testSpin3D() - Giro 3D completo');
    console.log('  • toggle3DMode() - Cambiar 2D/3D');
    console.log('  • changeCameraView("overview"|"closeup"|"dramatic"|"topdown")');
    console.log('  • Teclas: 1-4 para cámaras, T para toggle 3D/2D\n');
};

// Log de carga
console.log('[Main3D] Sistema de integración 3D cargado - Fase 2');
