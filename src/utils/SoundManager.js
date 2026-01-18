class SoundManager {
    constructor() {
        this.ctx = null
        this.masterGain = null
        this.ambienceNodes = null
        this.ballLoopNodes = null
        this.initialized = false
        this.isMuted = false
    }

    init() {
        if (this.initialized) return
        const AudioContext = window.AudioContext || window.webkitAudioContext
        this.ctx = new AudioContext()

        // MIXER BUSES
        this.masterGain = this.ctx.createGain()
        this.sfxGain = this.ctx.createGain()
        this.ambienceGain = this.ctx.createGain()

        // Defaults - Slightly lower master to be polite
        this.masterGain.gain.value = 0.4
        this.sfxGain.gain.value = 1.0
        this.ambienceGain.gain.value = 0.5

        // Routing
        this.sfxGain.connect(this.masterGain)
        this.ambienceGain.connect(this.masterGain)
        this.masterGain.connect(this.ctx.destination)

        this.initialized = true
    }

    setVolume(channel, value) {
        if (!this.initialized) return
        const time = this.ctx.currentTime + 0.1
        if (channel === 'MASTER') this.masterGain.gain.linearRampToValueAtTime(value, time)
    }

    setMute(mute) {
        this.isMuted = mute
        if (this.ctx) {
            if (mute) this.ctx.suspend()
            else this.ctx.resume()
        }
    }

    // --- 1. CHIPS (ASMR Click) ---
    playChip() {
        if (this.isMuted) return
        try {
            if (!this.initialized) this.init()
            if (this.ctx.state === 'suspended') this.ctx.resume()

            const t = this.ctx.currentTime
            // Multi-layered click for realism
            // Layer 1: High Snap
            const osc = this.ctx.createOscillator()
            const gain = this.ctx.createGain()
            osc.frequency.setValueAtTime(2500 + Math.random() * 500, t)
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.05)
            gain.gain.setValueAtTime(0.3, t)
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05)
            osc.connect(gain)
            gain.connect(this.sfxGain)
            osc.start(t)
            osc.stop(t + 0.1)

            // Layer 2: Ceramic "Thud" Body
            const osc2 = this.ctx.createOscillator()
            const gain2 = this.ctx.createGain()
            osc2.type = 'triangle'
            osc2.frequency.setValueAtTime(300 + Math.random() * 50, t)
            gain2.gain.setValueAtTime(0.2, t)
            gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.1)
            osc2.connect(gain2)
            gain2.connect(this.sfxGain)
            osc2.start(t)
            osc2.stop(t + 0.1)
        } catch (e) { }
    }

    // --- 2. SPIN START (WHOOSH) - SKIP ---
    playSpinStart() { return }

    // --- 3. BALL ROLLING (Improved - Soft Rolling) ---
    playBallLoop() {
        if (this.isMuted) return
        try {
            if (!this.initialized) this.init()
            if (this.ctx.state === 'suspended') this.ctx.resume()
            if (this.ballLoopNodes) return // Already playing

            // Pink Noise for texture
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

            const noise = this.ctx.createBufferSource()
            noise.buffer = buffer
            noise.loop = true

            // Lowpass Filter - Dynamic movement
            const filter = this.ctx.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.setValueAtTime(400, this.ctx.currentTime)

            // LFO for "Revolution" whoosh (Left/Right + Volume swell)
            const panner = this.ctx.createStereoPanner()
            const lfo = this.ctx.createOscillator()
            lfo.type = 'sine'
            lfo.frequency.value = 0.8 // Revs per second

            const gain = this.ctx.createGain()
            gain.gain.setValueAtTime(0, this.ctx.currentTime)
            gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 1) // Soft fade in

            // Connections
            lfo.connect(panner.pan)
            noise.connect(filter)
            filter.connect(panner)
            panner.connect(gain)
            gain.connect(this.masterGain)

            noise.start()
            lfo.start()

            // Auto-modulate filter for realism (slow down effect simulation)
            // We won't simulate full physics here, just a pleasant texture

            this.ballLoopNodes = { noise, lfo, gain, filter }
        } catch (e) { }
    }

    stopBallLoop() {
        try {
            if (this.ballLoopNodes) {
                const t = this.ctx.currentTime
                // Fast fade out to avoid clicks, but feels immediate
                this.ballLoopNodes.gain.gain.setTargetAtTime(0, t, 0.05)
                this.ballLoopNodes.noise.stop(t + 0.2)
                this.ballLoopNodes.lfo.stop(t + 0.2)
                this.ballLoopNodes = null

                // Trigger Land
                this.playBallLand()
            }
        } catch (e) { }
    }

    // --- 4. BALL LAND (Clack-Clack) ---
    playBallLand() {
        if (this.isMuted) return
        try {
            const t = this.ctx.currentTime
            // simulate 3 bounces
            [0, 0.08, 0.18].forEach((offset, i) => {
                const osc = this.ctx.createOscillator()
                const gain = this.ctx.createGain()

                osc.type = 'square' // Harder surface sound
                osc.frequency.setValueAtTime(800 - (i * 100), t + offset)

                // Short percussive envelope
                gain.gain.setValueAtTime(0, t + offset)
                gain.gain.linearRampToValueAtTime(0.1 - (i * 0.02), t + offset + 0.005)
                gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.05)

                const filter = this.ctx.createBiquadFilter()
                filter.type = 'lowpass'
                filter.frequency.value = 2000

                osc.connect(filter)
                filter.connect(gain)
                gain.connect(this.masterGain)

                osc.start(t + offset)
                osc.stop(t + offset + 0.1)
            })
        } catch (e) { }
    }

    // --- 5. WIN ELEGANT (Harp/Piano) ---
    playWin(amount) {
        if (this.isMuted) return
        try {
            if (!this.initialized) this.init()
            const t = this.ctx.currentTime

            // Major pentatonic run (harp style)
            const notes = [440, 554.37, 659.25, 880, 1108.73] // A Major

            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator()
                const gain = this.ctx.createGain()
                osc.type = 'triangle' // Softer than sine/square

                osc.frequency.setValueAtTime(freq, t)

                const start = t + (i * 0.06)
                gain.gain.setValueAtTime(0, start)
                gain.gain.linearRampToValueAtTime(0.1, start + 0.02)
                gain.gain.exponentialRampToValueAtTime(0.001, start + 1.5) // Long sustain

                osc.connect(gain)
                gain.connect(this.masterGain)
                osc.start(start)
                osc.stop(start + 2)
            })
        } catch (e) { }
    }

    // --- 6. RECORD (Ovation) ---
    playRecord() {
        if (this.isMuted) return
        try {
            if (!this.initialized) this.init()
            const t = this.ctx.currentTime

            // Bright fanfare
            const notes = [523.25, 659.25, 783.99, 1046.50] // C Major Chord

            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator()
                const gain = this.ctx.createGain()
                osc.type = 'sawtooth' // Brassy

                osc.frequency.setValueAtTime(freq, t)

                const start = t
                gain.gain.setValueAtTime(0, start)
                gain.gain.linearRampToValueAtTime(0.1, start + 0.05)
                gain.gain.exponentialRampToValueAtTime(0.001, start + 2)

                // Lowpass to soften brightness
                const filter = this.ctx.createBiquadFilter()
                filter.type = 'lowpass'
                filter.frequency.value = 3000

                osc.connect(filter)
                filter.connect(gain)
                gain.connect(this.masterGain)

                osc.start(start)
                osc.stop(start + 2.5)
            })
        } catch (e) { }
    }

    // --- IGNORED ---
    startAmbience() { return }
    stopAmbience() { return }
    playBackgroundClink() { return }

    stopAll() {
        try {
            this.stopBallLoop()
            if (this.ctx && this.ctx.state !== 'closed') {
                this.ctx.close().then(() => { this.initialized = false })
            } else {
                this.initialized = false
            }
        } catch (e) { }
    }
}

export const soundManager = new SoundManager()

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        soundManager.stopAll()
    })
}
