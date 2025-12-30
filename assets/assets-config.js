/**
 * assets-config.js
 * Version: 1.0.1 - Visual Assets
 * 
 * Configuración de assets visuales generados
 * - Logo
 * - Texturas de fichas
 * - Fondo de mesa
 * - Screenshots promocionales
 * 
 * Autor: JHR Quantum Roulette
 */

const AssetsConfig = {
    // Logo principal
    logo: {
        main: 'https://www.genspark.ai/api/files/s/YmaJRGAB',
        width: 1376,
        height: 768
    },
    
    // Texturas de fichas
    chips: {
        texture: 'https://www.genspark.ai/api/files/s/Z6OsLKFX',
        denominations: {
            1: { color: '#FFFFFF', accent: '#FFD700' },
            5: { color: '#E41E31', accent: '#FFFFFF' },
            25: { color: '#00AA44', accent: '#FFFFFF' },
            100: { color: '#2D2D2D', accent: '#FFD700' },
            500: { color: '#8B4789', accent: '#FFD700' }
        }
    },
    
    // Fondo de mesa
    background: {
        felt: 'https://www.genspark.ai/api/files/s/pk1Glqi6',
        fallbackColor: '#1a472a'
    },
    
    // Screenshots promocionales
    promotional: {
        gameplay: 'https://www.genspark.ai/api/files/s/3crWAGwx'
    },
    
    // Colores del tema
    colors: {
        primary: '#FFD700',      // Dorado
        secondary: '#1a472a',    // Verde casino
        background: '#0a1f14',   // Verde oscuro
        accent: '#E41E31',       // Rojo ruleta
        text: '#FFFFFF',         // Blanco
        textSecondary: 'rgba(255, 255, 255, 0.7)'
    }
};

// Función para precargar imágenes
function preloadAssets() {
    console.log('[Assets] Precargando imágenes...');
    
    const imagesToLoad = [
        AssetsConfig.logo.main,
        AssetsConfig.chips.texture,
        AssetsConfig.background.felt
    ];
    
    const promises = imagesToLoad.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log('[Assets] ✓ Imagen cargada:', url.substring(0, 50) + '...');
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });
    });
    
    return Promise.all(promises)
        .then(() => {
            console.log('[Assets] ✓ Todas las imágenes precargadas');
            return true;
        })
        .catch(err => {
            console.warn('[Assets] Error precargando imágenes:', err);
            return false;
        });
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.AssetsConfig = AssetsConfig;
    window.preloadAssets = preloadAssets;
}
