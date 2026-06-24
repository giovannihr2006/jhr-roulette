export const PERSONALITIES = {
    FORMAL: {
        welcome: [
            "Bienvenidos a GHR Ruleta Royale. Les invitamos a cargar sus fichas para comenzar la sesión.",
            "La mesa está abierta, señores. Por favor, carguen sus fichas.",
            "Bienvenidos. Carguen sus fichas y hagan sus apuestas."
        ],
        betsOpen: [
            "Hagan sus apuestas, por favor.",
            "Apuestas abiertas.",
            "Es el momento de decidir."
        ],
        betsClosing: [
            "Cerramos apuestas...",
            "Últimos segundos.",
            "Casi no hay más tiempo."
        ],
        noMoreBets: [
            "¡No va más!",
            "¡No se admiten más apuestas!",
            "Juego cerrado. Suerte."
        ],
        win: (num, col) => [
            `Ganador: ${num}, ${col}.`,
            `Número ${num}, color ${col}.`,
            `${num}, ${col}.`
        ],
        profit: [
            "Excelente ganancia.",
            "Buena jugada.",
            "Victoria para el jugador."
        ],
        record: "Nuevo récord de saldo establecido. Felicidades.",
        tip: "Comienza de nuevo con apuestas mínimas."
    },
    COACH: {
        welcome: [
            "¡Bienvenidos! Es hora de romper la banca. ¡Carguen sus fichas y vamos con todo!",
            "Nueva oportunidad de ganar. ¡Carga tus fichas y prepárate!",
            "¡No pierdas tiempo! Carga tus fichas y toma el control."
        ],
        betsOpen: [
            "¡Ataquemos! Haz tu jugada maestra.",
            "El dinero está esperando. Apuesta con cabeza.",
            "Visualiza la victoria y pon las fichas."
        ],
        betsClosing: [
            "¡Rápido! ¿Estás seguro de esa cobertura?",
            "El tren se va, últimas fichas.",
            "¡Decídete ya!"
        ],
        noMoreBets: [
            "¡Alto ahí! La suerte está echada.",
            "¡Manos fuera! Veamos qué traes.",
            "¡Bloqueado! Ahora a rezar... o a cobrar."
        ],
        win: (num, col) => [
            `¡Boom! ${num}, ${col}. ¡Lo sabía!`,
            `¡Ahí lo tienes! ${num}, ${col}.`,
            `¡Clinch! ${num}, ${col}. ¡A cobrar!`
        ],
        profit: [
            "¡Eso es! Directo al bolsillo.",
            "¡El sistema funciona! Sigue así.",
            "¡Impresionante! Estamos en racha."
        ],
        record: "¡ESTO ES DE LO QUE HABLO! ¡NUEVO RÉCORD!",
        tip: "¡Oye! Ya ganaste mucho. ¡No seas codicioso, baja la apuesta ahora!"
    },
    FRIENDLY: { // "Mateo" style
        welcome: [
            "¡Hola amigos! Qué alegría verlos. No olviden cargar sus fichas para jugar un rato.",
            "Mesa lista. ¡Carguen sus fichas y que empiece la diversión!",
            "¡Hola, hola! Qué buen día para jugar. Carga unas fichas y acompáñanos."
        ],
        betsOpen: [
            "¿Cuál es tu número de la suerte?",
            "Ponle fe a ese cero.",
            "Yo que tú, le voy al rojo."
        ],
        betsClosing: [
            "Venga, que la bola ya casi cae.",
            "Apresúrate amigo.",
            "Cerrando el chiringuito..."
        ],
        noMoreBets: [
            "¡Listo! Se acabó lo que se daba.",
            "¡Dedos cruzados! No va más.",
            "¡Suerte a todos!"
        ],
        win: (num, col) => [
            `¡Qué bien! Salió el ${num}, ${col}.`,
            `Mira nada más, el ${num}, ${col}.`,
            `¡Premio! ${num}, ${col}.`
        ],
        profit: [
            "¡Invítame a una copa con eso!",
            "¡Qué buena mano tienes hoy!",
            "¡Vaya suerte! Te felicito."
        ],
        record: "¡Wow! Nunca había visto tanto dinero junto.",
        tip: "Amigo, vas ganando mucho. Mejor asegura y juega suave."
    }
}

export class DealerVoice {
    constructor() {
        this.synth = window.speechSynthesis
        this.voice = null
        this.enabled = true // RE-ENABLED
        this.personality = 'FORMAL' // Default
        this.gender = 'FEMALE' // FEMALE, MALE
        this.init()
    }

    init() {
        if (!this.synth) {
            console.warn("Speech Synthesis not supported")
            this.enabled = false
            return
        }
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.setVoice()
        }
        this.setVoice()
    }

    setVoice() {
        const voices = this.synth.getVoices()
        console.log("Available Voices:", voices.map(v => v.name))

        // Strategy: Use keywords to find gendered voices if possible
        // Heuristic: "Helena", "Sabina", "Hilda" = Female. "Raul", "Pablo", "David" = Male.
        // Google voices often don't specify gender in name, so we default to standard ES.

        let targetVoice = null

        if (this.gender === 'FEMALE') {
            targetVoice = voices.find(v => (v.name.includes('Sabin') || v.name.includes('Helen') || v.name.includes('Laura')) && v.lang.includes('es'))
                || voices.find(v => v.lang === 'es-ES' && v.name.includes('Google')) // Google Español is usually female-ish
                || voices.find(v => v.lang.includes('es'))
        } else { // MALE
            targetVoice = voices.find(v => (v.name.includes('Raul') || v.name.includes('Pablo') || v.name.includes('David') || v.name.includes('Mark')) && v.lang.includes('es'))
                || voices.find(v => v.lang === 'es-MX' && v.name.includes('Google')) // Often different from ES-ES
                || voices.find(v => v.name.includes('Microsoft') && v.lang.includes('es')) // Fallback
        }

        this.voice = targetVoice || voices.find(v => v.lang.includes('es')) || voices[0]
        console.log(`Dealer Voice Set: ${this.voice ? this.voice.name : 'System Default'} (${this.gender})`)
    }

    setPersonality(key) {
        if (PERSONALITIES[key]) {
            this.personality = key
            console.log("Personality set to:", key)
        }
    }

    setGender(gender) {
        this.gender = gender
        this.setVoice()
    }

    speak(text, priority = false) {
        if (!this.enabled || !this.synth) return

        try {
            // Critical Fix: Many browsers (Chrome/Edge/Safari) requires a resume() call
            // and sometimes the synth "freezes" if not called regularly.
            if (this.synth.paused) {
                this.synth.resume()
            }

            if (priority) this.synth.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            if (this.voice) utterance.voice = this.voice

            // Tweaks based on personality?
            if (this.personality === 'COACH') {
                utterance.rate = 1.15 // Fast, energetic
                utterance.pitch = 1.1
            } else if (this.personality === 'FRIENDLY') {
                utterance.rate = 1.05
                utterance.pitch = 0.95 // Relaxed
            } else {
                utterance.rate = 1.0 // Formal
                utterance.pitch = 1.0
            }

            utterance.volume = 1.0
            this.synth.speak(utterance)
        } catch (e) {
            console.error("DealerVoice SpeechSynthesis failed:", e)
        }
    }

    // --- INTERFACE UTILS ---
    getLine(key, ...args) {
        const dict = PERSONALITIES[this.personality] || PERSONALITIES.FORMAL
        const entry = dict[key]

        if (Array.isArray(entry)) {
            return entry[Math.floor(Math.random() * entry.length)]
        } else if (typeof entry === 'function') {
            return entry(...args)[Math.floor(Math.random() * 3)] // Random from array return
        }
        return entry
    }

    // --- GAME EVENTS ---
    welcome() { this.speak(this.getLine('welcome')) }
    betsOpen() { this.speak(this.getLine('betsOpen')) }
    betsClosing() { this.speak(this.getLine('betsClosing'), true) }
    noMoreBets() { this.speak(this.getLine('noMoreBets'), true) }
    winner(n, c) { this.speak(this.getLine('win', n, c), true) }
    profitWin() { this.speak(this.getLine('profit'), true) }
    tipMinBets() { this.speak(this.getLine('tip'), true) }
    announceRecord() { this.speak(this.getLine('record'), true) } // New method!
}

export const dealer = new DealerVoice()
