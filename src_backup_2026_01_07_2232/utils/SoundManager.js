class SoundManager {
    constructor() {
        this.ctx = null
        this.masterGain = null
        this.initialized = false
    }

    init() {
        if (this.initialized) return
        const AudioContext = window.AudioContext || window.webkitAudioContext
        this.ctx = new AudioContext()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = 0.5 // Default volume
        this.masterGain.connect(this.ctx.destination)
        this.initialized = true
    }

    playChip() {
        if (!this.initialized) this.init()
        if (this.ctx.state === 'suspended') this.ctx.resume()

        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        // Short, high-pitched "tick" simulating plastic chip
        osc.type = 'sine'
        osc.frequency.setValueAtTime(2000, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.05)

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05)

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.1)
    }

    playSpinStart() {
        if (!this.initialized) this.init()
        if (this.ctx.state === 'suspended') this.ctx.resume()

        // Low frequency hum/wind
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(50, this.ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 2) // Rev up

        gain.gain.setValueAtTime(0, this.ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.5)
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 3) // Fade out

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.start()
        osc.stop(this.ctx.currentTime + 3.1)
    }

    playBallLoop() {
        // Placeholder: Real rolling sound is complex; we'll simulate the "rattle" later if needed
        // For now, let's keep it clean.
    }

    playWin(amount) {
        if (!this.initialized) this.init()
        if (this.ctx.state === 'suspended') this.ctx.resume()

        // Major Arpeggio (C5, E5, G5, C6)
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator()
            const gain = this.ctx.createGain()

            osc.type = 'sine'
            osc.frequency.value = freq

            const start = this.ctx.currentTime + (i * 0.1)
            gain.gain.setValueAtTime(0, start)
            gain.gain.linearRampToValueAtTime(0.2, start + 0.05)
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.8)

            osc.connect(gain)
            gain.connect(this.masterGain)

            osc.start(start)
            osc.stop(start + 1)
        })

        // Vocal Announcement
        if (amount > 0) {
            setTimeout(() => {
                this.speak("¡Ganaste!")
            }, 500)
        }
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            // Cancel pending
            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'es-ES' // Spanish
            utterance.rate = 1.0
            utterance.pitch = 1.0

            // Try to find a distinct voice
            const voices = window.speechSynthesis.getVoices()
            const esVoice = voices.find(v => v.lang.includes('es'))
            if (esVoice) utterance.voice = esVoice

            window.speechSynthesis.speak(utterance)
        }
    }

    announceNumber(number, color) {
        // e.g. "Rojo 14" or "Negro 2"
        const text = `${number}, ${color}`
        this.speak(text)
    }
}

export const soundManager = new SoundManager()
