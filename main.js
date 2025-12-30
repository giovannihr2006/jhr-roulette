/**
 * main.js
 * Version: 0.1.14 (INTEGRACIÓN COMPLETA)
 * 
 * Integración de todos los sistemas:
 * - v0.1.13: Historial, Hot/Cold, Ticker
 * - v0.1.14: Reloj, Temporizador, Reality Check, Sesión
 * 
 * Autor: JHR Quantum Roulette
 */

// ===== MANAGERS Y CONTROLADORES =====
let canvasManager;
let rouletteEngine;
let bankrollManager;
let historyManager;        // v0.1.13
let hotColdCalculator;     // v0.1.13
let sessionClock;          // v0.1.14
let sessionTimer;          // v0.1.14
let sessionStats;          // v0.1.14
let realityCheck;          // v0.1.14
let audioManager;          // v1.0.1 - Audio System
let visualEffects;         // v2.0.1 - Visual Effects

// ===== UI COMPONENTS =====
let balanceUI;
let historyTicker;         // NUEVO v0.1.13
let hotColdPanel;          // NUEVO v0.1.13
let sessionInfoUI;         // NUEVO v0.1.14

// ===== INITIALIZATION =====
async function init() {
    console.log('═══════════════════════════════════════════');
    console.log('  JHR QUANTUM ROULETTE - v2.0.1 (POLISH EDITION)');
    console.log('═══════════════════════════════════════════\n');
    
    // Inicializar efectos visuales
    visualEffects = new VisualEffects();
    console.log('✨ Sistema de efectos visuales iniciado');
    
    // Precargar assets visuales
    await preloadAssets();
    
    // Inicializar sistema de audio
    audioManager = new AudioManager();
    await audioManager.preloadAll();
    
    // 1. Canvas Manager
    canvasManager = new CanvasManager('rouletteCanvas');
    canvasManager.onResize = () => {
        console.log('[Main] Canvas redimensionado:', canvasManager.width, 'x', canvasManager.height);
    };
    
    // 2. Roulette Engine (RNG)
    rouletteEngine = new RouletteEngine('production');
    
    // 3. Bankroll Manager
    bankrollManager = new BankrollManager(10000); // $10,000 inicial
    
    // 4. History Manager (v0.1.13)
    historyManager = new HistoryManager(500);
    console.log('[Main] ✓ HistoryManager inicializado');
    
    // 5. Hot/Cold Calculator (v0.1.13)
    hotColdCalculator = new HotColdCalculator(historyManager);
    console.log('[Main] ✓ HotColdCalculator inicializado');
    
    // 6. Session Clock (v0.1.14)
    sessionClock = new SessionClock(true); // Formato 24h
    sessionClock.start();
    console.log('[Main] ✓ SessionClock iniciado');
    
    // 7. Session Timer (v0.1.14)
    sessionTimer = new SessionTimer();
    sessionTimer.start();
    console.log('[Main] ✓ SessionTimer iniciado');
    
    // 8. Session Stats (v0.1.14)
    sessionStats = new SessionStats(bankrollManager, sessionTimer, historyManager);
    console.log('[Main] ✓ SessionStats inicializado');
    
    // 9. Reality Check (v0.1.14) - cada 30 minutos
    realityCheck = new RealityCheck(30);
    realityCheck.onRealityCheck = (stats) => {
        console.log('[Main] Reality Check disparado:', stats);
    };
    realityCheck.start();
    console.log('[Main] ✓ RealityCheck iniciado (30 min)');
    
    // ===== UI COMPONENTS =====
    
    // 10. Balance UI
    balanceUI = new BalanceUI(canvasManager, bankrollManager);
    
    // 11. History Ticker (v0.1.13)
    historyTicker = new HistoryTicker(canvasManager, historyManager);
    console.log('[Main] ✓ HistoryTicker inicializado');
    
    // 12. Hot/Cold Panel (v0.1.13)
    hotColdPanel = new HotColdPanel(canvasManager, hotColdCalculator);
    console.log('[Main] ✓ HotColdPanel inicializado');
    
    // 13. Session Info UI (v0.1.14)
    sessionInfoUI = new SessionInfoUI(canvasManager, sessionClock, sessionTimer);
    console.log('[Main] ✓ SessionInfoUI inicializado');
    
    // Iniciar render loop
    startRenderLoop();
    
    // Exponer globalmente
    window.canvasManager = canvasManager;
    window.rouletteEngine = rouletteEngine;
    window.bankrollManager = bankrollManager;
    window.balanceUI = balanceUI;
    window.historyManager = historyManager;
    window.hotColdCalculator = hotColdCalculator;
    window.historyTicker = historyTicker;
    window.hotColdPanel = hotColdPanel;
    window.sessionClock = sessionClock;
    window.sessionTimer = sessionTimer;
    window.sessionStats = sessionStats;
    window.sessionInfoUI = sessionInfoUI;
    window.realityCheck = realityCheck;
    window.audioManager = audioManager;
    
    console.log('\n[Main] ✓ Sistema completo inicializado');
    console.log('[Main] Versión: 1.0.1 (con audio y assets)');
    console.log('[Main] Funciones disponibles: testSpin(), quickTest5Spins(), printStats()\n');
    console.log('[Main] Audio: audioManager.toggleMusic() para música\n');
}

// ===== RENDER LOOP =====
function startRenderLoop() {
    function render() {
        const ctx = canvasManager.ctx;
        const { width, height } = canvasManager;
        
        // Limpiar canvas
        ctx.fillStyle = '#1a472a'; // Verde casino
        ctx.fillRect(0, 0, width, height);
        
        // Renderizar componentes
        balanceUI.render(ctx);
        historyTicker.render(ctx);      // NUEVO v0.1.13
        hotColdPanel.render(ctx);       // NUEVO v0.1.13
        sessionInfoUI.render(ctx);      // NUEVO v0.1.14
        
        requestAnimationFrame(render);
    }
    
    render();
}

// ===== FUNCIONES DE PRUEBA =====

/**
 * Test de giro único con registro en historial
 */
function testSpin() {
    console.log('\n[Test] Ejecutando giro de prueba...');
    
    const result = rouletteEngine.spin();
    console.log(`[Test] Resultado: ${result.value} ${result.color}`);
    
    // Efectos de audio
    audioManager.playSpinStart();
    setTimeout(() => audioManager.playBallDrop(), 2000);
    
    // Efectos visuales (nuevo en v2.0.1)
    visualEffects.createSpinEffect();
    setTimeout(() => {
        visualEffects.createWinEffect(result.value);
        visualEffects.createParticleExplosion(result.value);
    }, 2500);
    
    // Registrar en historial
    historyManager.addResult(result);
    console.log('[Test] Resultado añadido al historial');
    
    // Mostrar análisis Hot/Cold
    if (historyManager.history.length >= 20) {
        console.log('\n[Test] Análisis Hot/Cold:');
        hotColdCalculator.printAnalysis('medium');
    } else {
        console.log(`[Test] Necesitas al menos 20 giros para análisis (actual: ${historyManager.history.length})`);
    }
    
    return result;
}

/**
 * Test rápido: 5 giros
 */
function quickTest5Spins() {
    console.log('\n[Test] Ejecutando 5 giros rápidos...\n');
    
    for (let i = 1; i <= 5; i++) {
        const result = rouletteEngine.spin();
        historyManager.addResult(result);
        
        // Simular apuesta y resultado
        const bet = { type: 'straight', number: result.value, amount: 100 };
        const profit = result.value === bet.number ? 3500 : -100;
        
        sessionStats.registerSpin({
            totalStake: 100,
            profit: profit
        });
        
        console.log(`Giro ${i}: ${result.value} ${result.color} → Profit: $${profit}`);
    }
    
    console.log('\n[Test] 5 giros completados');
    printStats();
}

/**
 * Imprime todas las estadísticas
 */
function printStats() {
    console.log('\n' + '═'.repeat(60));
    console.log('  ESTADÍSTICAS ACTUALES');
    console.log('═'.repeat(60));
    
    // Balance
    console.log('\n--- BALANCE ---');
    console.log(`Balance actual: $${bankrollManager.getBalance()}`);
    console.log(`Ganancia neta: $${bankrollManager.getNetProfit()}`);
    
    // Historial
    console.log('\n--- HISTORIAL ---');
    console.log(`Total de giros: ${historyManager.history.length}`);
    const last5 = historyManager.getLastResults(5);
    console.log('Últimos 5 resultados:', last5.map(r => r.number).join(', '));
    
    // Sesión
    console.log('\n--- SESIÓN ---');
    const sessionSummary = sessionStats.getSummary();
    console.log(`Duración: ${sessionSummary.duration}`);
    console.log(`Giros: ${sessionSummary.spins}`);
    console.log(`Balance: $${sessionSummary.balance}`);
    console.log(`Profit: $${sessionSummary.profit}`);
    
    // Hot/Cold
    if (historyManager.history.length >= 20) {
        console.log('\n--- HOT/COLD ---');
        const hot = hotColdCalculator.getHotNumbers(3, 'medium');
        const cold = hotColdCalculator.getColdNumbers(3, 'medium');
        
        console.log('Hot:', hot.map(h => `${h.number} (${h.frequency}x)`).join(', '));
        console.log('Cold:', cold.map(c => `${c.number} (${c.frequency}x)`).join(', '));
    }
    
    console.log('\n' + '═'.repeat(60) + '\n');
}

/**
 * Simula una sesión completa (50 giros)
 */
function simulateSession(spins = 50) {
    console.log(`\n[Simulación] Iniciando sesión de ${spins} giros...\n`);
    
    for (let i = 1; i <= spins; i++) {
        const result = rouletteEngine.spin();
        historyManager.addResult(result);
        
        // Simular apuesta aleatoria
        const betAmount = 100;
        const randomBetNumber = Math.floor(Math.random() * 37);
        const wins = result.value === randomBetNumber;
        const profit = wins ? 3500 : -betAmount;
        
        sessionStats.registerSpin({
            totalStake: betAmount,
            profit: profit
        });
        
        if (i % 10 === 0) {
            console.log(`[Simulación] Progreso: ${i}/${spins} giros`);
        }
    }
    
    console.log(`\n[Simulación] Sesión completada: ${spins} giros`);
    
    // Mostrar análisis completo
    hotColdCalculator.printAnalysis('medium');
    sessionStats.printStats();
}

/**
 * Exporta estadísticas a JSON
 */
function exportSession() {
    const data = sessionStats.exportJSON();
    console.log('\n[Export] Estadísticas de sesión (JSON):');
    console.log(data);
    return data;
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case ' ':
            testSpin();
            break;
        case 's':
            printStats();
            break;
        case 'h':
            if (historyManager.history.length >= 20) {
                hotColdCalculator.printAnalysis('medium');
            }
            break;
        case 'r':
            realityCheck.forceCheck();
            break;
        case 'm':
            const musicOn = audioManager.toggleMusic();
            console.log(`[Main] Música ${musicOn ? '♫ ON' : '♪ OFF'}`);
            break;
    }
});

// ===== AUTO-INIT =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('[Main] main.js cargado - Esperando DOMContentLoaded...');
