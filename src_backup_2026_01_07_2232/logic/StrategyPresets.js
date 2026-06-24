export const STRATEGY_PRESETS = {
    "GENESIS_DEFAULT": {
        label: "Genesis Default (Balanced)",
        description: "Configuración equilibrada para pruebas generales.",
        values: {
            ballMass: 0.05,
            friction: 0.01,
            gravity: 9.81,
            spinForce: 0.2, // Randomness
            tilt: 0,
            simSpeed: 1.0,
            waitThreshold: 51.42, // Standard deviation derived
            stopWin: 10000
        }
    },
    "THORP_PHYSICS": {
        label: "Tier 1: Thorp's Physics (Eudaemonic)",
        description: "Física determinista. Baja aleatoriedad para permitir Balística Visual.",
        values: {
            ballMass: 0.065, // Heavier ball is more predictable
            friction: 0.008, // Less friction variance
            gravity: 9.81,
            spinForce: 0.05, // Very consistent spinner
            tilt: 0.2, // Slight bias to exploit
            simSpeed: 1.0,
            waitThreshold: 100, // Irrelevant for physics play
            stopWin: 50000 // Higher targets
        }
    },
    "FIBONACCI_DEFENSE": {
        label: "Tier 2: Fibonacci Defense",
        description: "Gestión conservadora. Alto Stop Loss, perfiles de seguridad activados.",
        values: {
            ballMass: 0.05,
            friction: 0.015, // Standard chaos
            gravity: 9.81,
            spinForce: 0.25,
            tilt: 0,
            simSpeed: 1.0,
            waitThreshold: 34, // Fibo number
            stopWin: 2500 // Modest goal
        }
    },
    "CHAOS_SCALPING": {
        label: "Tier 5: Chaos Scalping (High Freq)",
        description: "Velocidad máxima para simular millones de tiradas en segundos.",
        values: {
            ballMass: 0.05,
            friction: 0.01,
            gravity: 9.81,
            spinForce: 0.3,
            tilt: 0,
            simSpeed: 20.0, // Hyper speed for 'Ensayo'
            waitThreshold: 15, // Aggressive entry
            stopWin: 500
        }
    }
}
