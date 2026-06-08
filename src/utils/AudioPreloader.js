/**
 * AudioPreloader.js
 * Sistema de precarga de assets de audio
 */

/**
 * Preloader para assets de audio usando Web Audio API
 */
class AudioPreloader {
    constructor() {
        this.ctx = null
        this.buffers = new Map()
        this.isReady = false
    }

    /**
     * Inicializa el contexto de audio
     * @returns {boolean} Si la inicialización fue exitosa
     */
    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            if (!AudioContext) {
                console.warn('[AudioPreloader] Web Audio API not supported')
                return false
            }
            this.ctx = new AudioContext()
            return true
        } catch (error) {
            console.error('[AudioPreloader] Init error:', error)
            return false
        }
    }

    /**
     * Genera y cachea un buffer de ruido para el ball loop
     * @returns {AudioBuffer|null}
     */
    preloadBallNoise() {
        if (!this.ctx) return null
        if (this.buffers.has('ballNoise')) return this.buffers.get('ballNoise')

        try {
            const bufferSize = this.ctx.sampleRate * 2
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
            const data = buffer.getChannelData(0)

            let lastOut = 0
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1
                const pink = (lastOut + (0.02 * white)) / 1.02
                data[i] = pink * 3.5
                lastOut = pink
            }

            this.buffers.set('ballNoise', buffer)
            return buffer
        } catch (error) {
            console.error('[AudioPreloader] Ball noise error:', error)
            return null
        }
    }

    /**
     * Genera y cachea notas comunes para win sounds
     */
    preloadWinNotes() {
        // Win notes are generated dynamically via oscillators
        // No buffer needed, but we can warm up the context
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => { })
        }
    }

    /**
     * Precarga todos los sonidos frecuentes
     * @returns {Promise<boolean>}
     */
    async preloadAll() {
        if (!this.init()) return false

        try {
            // Generate commonly used buffers
            this.preloadBallNoise()
            this.preloadWinNotes()

            this.isReady = true
            // console.log('[AudioPreloader] All sounds preloaded')
            return true
        } catch (error) {
            console.error('[AudioPreloader] Preload error:', error)
            return false
        }
    }

    /**
     * Obtiene un buffer precargado
     * @param {string} name - Nombre del buffer
     * @returns {AudioBuffer|null}
     */
    getBuffer(name) {
        return this.buffers.get(name) || null
    }

    /**
     * Verifica si el preloader está listo
     * @returns {boolean}
     */
    get ready() {
        return this.isReady
    }

    /**
     * Resume el contexto de audio (para user gesture requirement)
     */
    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume()
            } catch (e) {
                // Ignore resume errors
            }
        }
    }

    /**
     * Cleanup
     */
    dispose() {
        try {
            if (this.ctx && this.ctx.state !== 'closed') {
                this.ctx.close()
            }
            this.buffers.clear()
            this.isReady = false
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

// Singleton instance
export const audioPreloader = new AudioPreloader()

// Auto-preload on module load (non-blocking)
if (typeof window !== 'undefined') {
    // Wait for first user interaction to preload (browser requirement)
    const preloadOnInteraction = () => {
        audioPreloader.preloadAll()
        window.removeEventListener('click', preloadOnInteraction)
        window.removeEventListener('keydown', preloadOnInteraction)
    }
    window.addEventListener('click', preloadOnInteraction, { once: true })
    window.addEventListener('keydown', preloadOnInteraction, { once: true })
}

export default AudioPreloader
