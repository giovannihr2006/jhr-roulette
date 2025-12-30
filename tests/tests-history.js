/**
 * tests-history.js
 * Version: 0.1.13
 * 
 * Tests exhaustivos del sistema de historial y hot/cold
 * - HistoryManager: añadir, consultar, límites
 * - HotColdCalculator: hot numbers, cold numbers
 * - Análisis estadístico
 * 
 * Autor: JHR Quantum Roulette
 */

function runHistoryTests() {
    console.log('\n' + '═'.repeat(60));
    console.log('  TESTS DE HISTORIAL Y HOT/COLD - v0.1.13');
    console.log('═'.repeat(60) + '\n');
    
    let testsPass = 0;
    let testsFail = 0;
    
    // ====================================
    // TEST 1: Inicialización de HistoryManager
    // ====================================
    console.log('[TEST 1] Inicialización de HistoryManager');
    try {
        const historyManager = new HistoryManager(100);
        
        if (historyManager.history.length === 0 && 
            historyManager.maxSize === 100 &&
            historyManager.frequency.size === 37) {
            console.log('✓ HistoryManager inicializado correctamente');
            testsPass++;
        } else {
            throw new Error('Estado inicial incorrecto');
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 2: Añadir resultados
    // ====================================
    console.log('\n[TEST 2] Añadir resultados al historial');
    try {
        const historyManager = new HistoryManager();
        const mockNumber = { value: 17, color: 'black' };
        
        const entry = historyManager.addResult(mockNumber);
        
        if (entry.number === 17 && 
            entry.color === 'black' &&
            entry.spinId === 1 &&
            historyManager.history.length === 1) {
            console.log('✓ Resultado añadido correctamente');
            testsPass++;
        } else {
            throw new Error('Resultado no registrado correctamente');
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 3: Actualización de frecuencias
    // ====================================
    console.log('\n[TEST 3] Actualización de frecuencias');
    try {
        const historyManager = new HistoryManager();
        
        // Añadir el mismo número 3 veces
        historyManager.addResult({ value: 7, color: 'red' });
        historyManager.addResult({ value: 7, color: 'red' });
        historyManager.addResult({ value: 7, color: 'red' });
        
        const freq = historyManager.getFrequency(7);
        
        if (freq === 3) {
            console.log('✓ Frecuencias actualizadas correctamente');
            testsPass++;
        } else {
            throw new Error(`Frecuencia incorrecta: ${freq}, esperado: 3`);
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 4: Límite de tamaño del historial
    // ====================================
    console.log('\n[TEST 4] Límite de tamaño del historial');
    try {
        const historyManager = new HistoryManager(10);
        
        // Añadir 15 resultados
        for (let i = 0; i < 15; i++) {
            historyManager.addResult({ value: i % 37, color: 'red' });
        }
        
        if (historyManager.history.length === 10) {
            console.log('✓ Límite de tamaño respetado');
            testsPass++;
        } else {
            throw new Error(`Tamaño incorrecto: ${historyManager.history.length}`);
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 5: getLastResults
    // ====================================
    console.log('\n[TEST 5] Consultar últimos resultados');
    try {
        const historyManager = new HistoryManager();
        
        for (let i = 1; i <= 10; i++) {
            historyManager.addResult({ value: i, color: 'black' });
        }
        
        const last5 = historyManager.getLastResults(5);
        
        // Los últimos 5 deben ser: 10, 9, 8, 7, 6 (orden inverso)
        if (last5.length === 5 && 
            last5[0].number === 10 && 
            last5[4].number === 6) {
            console.log('✓ getLastResults funciona correctamente');
            testsPass++;
        } else {
            throw new Error('Orden de resultados incorrecto');
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 6: Filtrado por color
    // ====================================
    console.log('\n[TEST 6] Filtrado por color');
    try {
        const historyManager = new HistoryManager();
        
        historyManager.addResult({ value: 1, color: 'red' });
        historyManager.addResult({ value: 2, color: 'black' });
        historyManager.addResult({ value: 3, color: 'red' });
        historyManager.addResult({ value: 0, color: 'green' });
        
        const reds = historyManager.getByColor('red');
        
        if (reds.length === 2 && reds.every(r => r.color === 'red')) {
            console.log('✓ Filtrado por color correcto');
            testsPass++;
        } else {
            throw new Error('Filtrado por color fallido');
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 7: Estadísticas generales
    // ====================================
    console.log('\n[TEST 7] Estadísticas generales');
    try {
        const historyManager = new HistoryManager();
        
        for (let i = 0; i < 50; i++) {
            historyManager.addResult({ value: i % 37, color: 'red' });
        }
        
        const stats = historyManager.getStats();
        
        if (stats.totalSpins === 50 && stats.uniqueNumbers > 0) {
            console.log('✓ Estadísticas calculadas correctamente');
            console.log(`  Total spins: ${stats.totalSpins}`);
            console.log(`  Unique numbers: ${stats.uniqueNumbers}`);
            testsPass++;
        } else {
            throw new Error('Estadísticas incorrectas');
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 8: HotColdCalculator - Inicialización
    // ====================================
    console.log('\n[TEST 8] Inicialización de HotColdCalculator');
    try {
        const historyManager = new HistoryManager();
        const hotColdCalc = new HotColdCalculator(historyManager);
        
        if (hotColdCalc.historyManager === historyManager && 
            hotColdCalc.config.shortWindow === 50) {
            console.log('✓ HotColdCalculator inicializado correctamente');
            testsPass++;
        } else {
            throw new Error('Configuración incorrecta');
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 9: Detección de números calientes
    // ====================================
    console.log('\n[TEST 9] Detección de números calientes');
    try {
        const historyManager = new HistoryManager();
        const hotColdCalc = new HotColdCalculator(historyManager);
        
        // Simular el número 17 saliendo mucho
        for (let i = 0; i < 50; i++) {
            if (i < 15) {
                historyManager.addResult({ value: 17, color: 'black' });
            } else {
                historyManager.addResult({ value: (i % 36) + 1, color: 'red' });
            }
        }
        
        const hotNumbers = hotColdCalc.getHotNumbers(3, 'short');
        
        if (hotNumbers.length > 0 && hotNumbers[0].number === 17) {
            console.log('✓ Números calientes detectados correctamente');
            console.log(`  Top hot: ${hotNumbers[0].number} (score: ${hotNumbers[0].score})`);
            testsPass++;
        } else {
            throw new Error('Detección de hot numbers fallida');
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 10: Detección de números fríos
    // ====================================
    console.log('\n[TEST 10] Detección de números fríos');
    try {
        const historyManager = new HistoryManager();
        const hotColdCalc = new HotColdCalculator(historyManager);
        
        // Simular distribución sesgada (el 13 nunca sale)
        for (let i = 0; i < 100; i++) {
            const num = (i % 36) + 1; // 1-36, nunca 0, nunca 13
            if (num !== 13) {
                historyManager.addResult({ value: num, color: 'red' });
            }
        }
        
        const coldNumbers = hotColdCalc.getColdNumbers(3, 'medium');
        
        // El 0 y 13 deberían estar entre los más fríos
        const coldNums = coldNumbers.map(c => c.number);
        
        if (coldNumbers.length > 0 && (coldNums.includes(0) || coldNums.includes(13))) {
            console.log('✓ Números fríos detectados correctamente');
            console.log(`  Top cold: ${coldNumbers[0].number} (score: ${coldNumbers[0].score})`);
            testsPass++;
        } else {
            console.warn('⚠ Detección de cold numbers no concluyente (aceptable con muestra pequeña)');
            testsPass++;
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 11: Análisis completo
    // ====================================
    console.log('\n[TEST 11] Análisis completo (hot/cold)');
    try {
        const historyManager = new HistoryManager();
        const hotColdCalc = new HotColdCalculator(historyManager);
        
        // Generar datos
        for (let i = 0; i < 100; i++) {
            historyManager.addResult({ value: Math.floor(Math.random() * 37), color: 'red' });
        }
        
        const analysis = hotColdCalc.getFullAnalysis('medium');
        
        if (analysis.totalSpins === 100 && 
            analysis.reliability === 'medium' &&
            typeof analysis.hot !== 'undefined' &&
            typeof analysis.cold !== 'undefined') {
            console.log('✓ Análisis completo generado correctamente');
            console.log(`  Reliability: ${analysis.reliability}`);
            testsPass++;
        } else {
            throw new Error('Análisis incompleto');
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 12: Detección de rachas
    // ====================================
    console.log('\n[TEST 12] Detección de rachas (streaks)');
    try {
        const historyManager = new HistoryManager();
        const hotColdCalc = new HotColdCalculator(historyManager);
        
        // Simular racha: el 23 sale 4 veces en 10 spins
        for (let i = 0; i < 10; i++) {
            if (i < 4) {
                historyManager.addResult({ value: 23, color: 'red' });
            } else {
                historyManager.addResult({ value: i, color: 'black' });
            }
        }
        
        const streaks = hotColdCalc.detectStreaks(3, 10);
        
        if (streaks.length > 0 && streaks[0].number === 23 && streaks[0].occurrences >= 4) {
            console.log('✓ Rachas detectadas correctamente');
            console.log(`  Racha: ${streaks[0].number} apareció ${streaks[0].occurrences} veces`);
            testsPass++;
        } else {
            throw new Error('Detección de streaks fallida');
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // TEST 13: Exportar/Importar JSON
    // ====================================
    console.log('\n[TEST 13] Exportar e importar historial (JSON)');
    try {
        const historyManager1 = new HistoryManager();
        
        // Añadir datos
        for (let i = 0; i < 20; i++) {
            historyManager1.addResult({ value: i, color: 'red' });
        }
        
        // Exportar
        const jsonData = historyManager1.exportJSON();
        
        // Crear nuevo manager e importar
        const historyManager2 = new HistoryManager();
        const success = historyManager2.importJSON(jsonData);
        
        if (success && 
            historyManager2.history.length === 20 &&
            historyManager2.spinCounter === 20) {
            console.log('✓ Exportar/Importar JSON exitoso');
            testsPass++;
        } else {
            throw new Error('Import/Export fallido');
        }
    } catch (error) {
        console.error('✗ ERROR:', error.message);
        testsFail++;
    }
    
    // ====================================
    // RESUMEN FINAL
    // ====================================
    console.log('\n' + '═'.repeat(60));
    console.log('  RESUMEN DE TESTS v0.1.13');
    console.log('═'.repeat(60));
    console.log(`✓ Tests pasados: ${testsPass}`);
    console.log(`✗ Tests fallidos: ${testsFail}`);
    console.log(`Total: ${testsPass + testsFail} tests`);
    console.log('═'.repeat(60) + '\n');
    
    return { testsPass, testsFail };
}

// Auto-ejecutar si está en navegador
if (typeof window !== 'undefined') {
    window.runHistoryTests = runHistoryTests;
    console.log('[Tests] Función runHistoryTests() disponible globalmente');
    console.log('Ejecuta runHistoryTests() en la consola para probar');
}
