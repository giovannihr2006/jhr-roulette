/**
 * audio-manager.js
 * Version: 1.0.1 - Audio System
 * 
 * Gestor de audio profesional
 * - Efectos de sonido del juego
 * - Música ambiente opcional
 * - Control de volumen
 * - Preload y cache
 * 
 * Autor: JHR Quantum Roulette
 */

class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isEnabled = true;
        this.musicEnabled = false;
        this.volume = {
            master: 0.7,
            sfx: 0.8,
            music: 0.3
        };
        
        // URLs de los audios generados
        this.audioUrls = {
            spinStart: 'https://www.genspark.ai/api/files/s/QJdUtzzS',
            ballDrop: 'https://www.genspark.ai/api/files/s/uYCiZ1If',
            chipPlace: 'https://www.genspark.ai/api/files/s/9P3gNEA0',
            winSmall: 'https://www.genspark.ai/api/files/s/TyzsIpte',
            winBig: 'https://www.genspark.ai/api/files/s/qD5qdLvP',
            ambient: 'https://www.genspark.ai/api/files/s/JyEV0obs'
        };
        
        console.log('[AudioManager] Inicializado');
    }
    
    /**
     * Precarga todos los audios
     */
    async preloadAll() {
        console.log('[AudioManager] Precargando audios...');
        
        const promises = [];
        
        for (const [key, url] of Object.entries(this.audioUrls)) {
            if (key === 'ambient') continue; // Cargar música bajo demanda
            
            promises.push(
                this.loadSound(key, url)
            );
        }
        
        try {
            await Promise.all(promises);
            console.log('[AudioManager] ✓ Todos los audios precargados');
            return true;
        } catch (error) {
            console.error('[AudioManager] Error al precargar audios:', error);
            return false;
        }
    }
    
    /**
     * Carga un sonido individual
     */
    loadSound(key, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.src = url;
            audio.preload = 'auto';
            
            audio.addEventListener('canplaythrough', () => {
                this.sounds[key] = audio;
                console.log(`[AudioManager] ✓ ${key} cargado`);
                resolve();
            }, { once: true });
            
            audio.addEventListener('error', (e) => {
                console.error(`[AudioManager] Error cargando ${key}:`, e);
                reject(e);
            });
            
            audio.load();
        });
    }
    
    /**
     * Reproduce un efecto de sonido
     */
    playSFX(soundKey) {
        if (!this.isEnabled) return;
        
        const sound = this.sounds[soundKey];
        if (!sound) {
            console.warn(`[AudioManager] Sonido no encontrado: ${soundKey}`);
            return;
        }
        
        try {
            // Clonar el audio para permitir overlapping
            const clone = sound.cloneNode();
            clone.volume = this.volume.master * this.volume.sfx;
            clone.play().catch(err => {
                console.warn('[AudioManager] Error al reproducir:', err);
            });
        } catch (error) {
            console.warn('[AudioManager] Error reproduciendo SFX:', error);
        }
    }
    
    /**
     * Reproduce el sonido de giro
     */
    playSpinStart() {
        this.playSFX('spinStart');
    }
    
    /**
     * Reproduce el sonido de bola cayendo
     */
    playBallDrop() {
        this.playSFX('ballDrop');
    }
    
    /**
     * Reproduce el sonido de colocar ficha
     */
    playChipPlace() {
        this.playSFX('chipPlace');
    }
    
    /**
     * Reproduce sonido de victoria según cantidad
     */
    playWin(amount) {
        if (amount >= 1000) {
            this.playSFX('winBig');
        } else if (amount > 0) {
            this.playSFX('winSmall');
        }
    }
    
    /**
     * Inicia música ambiente
     */
    async startMusic() {
        if (!this.musicEnabled || this.music) return;
        
        if (!this.sounds.ambient) {
            await this.loadSound('ambient', this.audioUrls.ambient);
        }
        
        this.music = this.sounds.ambient;
        this.music.loop = true;
        this.music.volume = this.volume.master * this.volume.music;
        
        try {
            await this.music.play();
            console.log('[AudioManager] Música ambiente iniciada');
        } catch (error) {
            console.warn('[AudioManager] No se pudo iniciar la música:', error);
        }
    }
    
    /**
     * Detiene música ambiente
     */
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
            this.music = null;
            console.log('[AudioManager] Música detenida');
        }
    }
    
    /**
     * Toggle música
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        
        if (this.musicEnabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }
        
        console.log(`[AudioManager] Música ${this.musicEnabled ? 'activada' : 'desactivada'}`);
        return this.musicEnabled;
    }
    
    /**
     * Habilita/deshabilita todo el audio
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (!enabled && this.music) {
            this.stopMusic();
        }
        
        console.log(`[AudioManager] Audio ${enabled ? 'habilitado' : 'deshabilitado'}`);
    }
    
    /**
     * Ajusta el volumen master
     */
    setMasterVolume(volume) {
        this.volume.master = Math.max(0, Math.min(1, volume));
        
        if (this.music) {
            this.music.volume = this.volume.master * this.volume.music;
        }
        
        console.log(`[AudioManager] Volumen master: ${(this.volume.master * 100).toFixed(0)}%`);
    }
    
    /**
     * Ajusta el volumen de SFX
     */
    setSFXVolume(volume) {
        this.volume.sfx = Math.max(0, Math.min(1, volume));
        console.log(`[AudioManager] Volumen SFX: ${(this.volume.sfx * 100).toFixed(0)}%`);
    }
    
    /**
     * Ajusta el volumen de música
     */
    setMusicVolume(volume) {
        this.volume.music = Math.max(0, Math.min(1, volume));
        
        if (this.music) {
            this.music.volume = this.volume.master * this.volume.music;
        }
        
        console.log(`[AudioManager] Volumen música: ${(this.volume.music * 100).toFixed(0)}%`);
    }
    
    /**
     * Obtiene el estado actual
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            musicEnabled: this.musicEnabled,
            musicPlaying: this.music && !this.music.paused,
            volumes: this.volume,
            soundsLoaded: Object.keys(this.sounds).length
        };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}
