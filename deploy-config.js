/**
 * deploy-config.js
 * Version: 2.0.1 - Configuración para Deploy
 * 
 * Configuración optimizada para producción
 * - URLs de assets
 * - Configuración de performance
 * - Analytics (opcional)
 * 
 * Autor: JHR Quantum Roulette
 */

const DeployConfig = {
    // Información del proyecto
    name: 'JHR Quantum Roulette',
    version: '2.0.1',
    description: 'Simulador de ruleta europea con motor 3D y física realista',
    author: 'Giovanni Holguin',
    email: 'giovannihro2006@gmail.com',
    
    // URLs de assets (ya hosteados)
    assets: {
        audio: {
            spinStart: 'https://www.genspark.ai/api/files/s/QJdUtzzS',
            ballDrop: 'https://www.genspark.ai/api/files/s/uYCiZ1If',
            chipPlace: 'https://www.genspark.ai/api/files/s/9P3gNEA0',
            winSmall: 'https://www.genspark.ai/api/files/s/TyzsIpte',
            winBig: 'https://www.genspark.ai/api/files/s/qD5qdLvP',
            ambient: 'https://www.genspark.ai/api/files/s/JyEV0obs'
        },
        images: {
            logo: 'https://www.genspark.ai/api/files/s/YmaJRGAB',
            chips: 'https://www.genspark.ai/api/files/s/Z6OsLKFX',
            felt: 'https://www.genspark.ai/api/files/s/pk1Glqi6',
            screenshot: 'https://www.genspark.ai/api/files/s/3crWAGwx',
            icons: 'https://www.genspark.ai/api/files/s/WxBZjCLl',
            splash: 'https://www.genspark.ai/api/files/s/kIAmAyOi',
            banner: 'https://www.genspark.ai/api/files/s/TB84vipq',
            favicon: 'https://www.genspark.ai/api/files/s/m7ZXdmBM'
        },
        models3D: {
            wheel: 'https://www.genspark.ai/api/files/s/07FAB1Ll',
            ball: 'https://www.genspark.ai/api/files/s/amiXkQQt',
            table: 'https://www.genspark.ai/api/files/s/rF8Shnfa'
        },
        video: {
            demo: 'https://www.genspark.ai/api/files/s/kplYnOmm'
        }
    },
    
    // Configuración de performance
    performance: {
        targetFPS: 60,
        enableShadows: true,
        enableParticles: true,
        maxParticles: 50,
        audioPreload: true,
        textureQuality: 'high' // 'low', 'medium', 'high'
    },
    
    // Configuración de juego
    game: {
        initialBalance: 10000,
        historySize: 500,
        realityCheckInterval: 30, // minutos
        enableTutorial: true,
        enable3D: true // true = 3D por defecto, false = 2D
    },
    
    // Redes sociales (para compartir)
    social: {
        twitter: '',
        facebook: '',
        github: 'https://github.com/tu-usuario/jhr-roulette'
    },
    
    // Plataformas de hosting recomendadas
    hosting: {
        recommended: 'netlify',
        alternatives: ['vercel', 'github-pages', 'cloudflare-pages']
    },
    
    // Meta tags para SEO
    meta: {
        title: 'JHR Quantum Roulette - Simulador 3D de Ruleta Europea',
        description: 'Experiencia de casino profesional con motor 3D, física realista y audio inmersivo. Juego responsable con análisis estadístico y gestión de bankroll.',
        keywords: 'ruleta, casino, 3D, simulador, juego responsable, Three.js, física realista',
        ogImage: 'https://www.genspark.ai/api/files/s/3crWAGwx'
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DeployConfig = DeployConfig;
}

// Para Node.js (si se usa build process)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeployConfig;
}
