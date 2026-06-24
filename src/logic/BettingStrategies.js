export const BETTING_STRATEGIES = {
    "HYBRID_HEDGE_PRO": {
        label: "Híbrido Distributivo (Guardia del 5) - AUTOPLAY",
        description: "Estrategia Avanzada: Cruz del 5 (Splits) + Asedio a Docena 1 (Rojo/Impar). Incluye lógica de 'Flotación Positiva': Juega plano mientras gana, dobla si pierde el avance. (Requiere Botón Automático).",
        bets: [
            // Bases (Cruz del 5 - 1 Ficha c/u)
            'SPLIT_2_5', 'SPLIT_5_4', 'SPLIT_6_5', 'SPLIT_5_8',
            // Soportes (5 Fichas c/u)
            'DOZ1', 'DOZ1', 'DOZ1', 'DOZ1', 'DOZ1',
            'BLACK', 'BLACK', 'BLACK', 'BLACK', 'BLACK',
            'EVEN', 'EVEN', 'EVEN', 'EVEN', 'EVEN'
        ]
    },
    "RED_QUADRATIC": {
        label: "Orden del Sol Rojo",
        description: "Basado en la anomalía de los cuadrados rojos: 5 en Columna 3, 1 en 1, 16, 25.",
        bets: [
            'COL3', 'COL3', 'COL3', 'COL3', 'COL3',
            '1', '16', '25'
        ]
    },
    "RED_QUADRATIC_TOTAL": {
        label: "Ataque Cuadrático TOTAL",
        description: "Variante Agresiva: Misma base + Bombardeo a 9 y 36. Maximiza el daño en anomalías de Columna 3.",
        bets: [
            'COL3', 'COL3', 'COL3', 'COL3', 'COL3',
            '1', '16', '25',
            '9', '36'
        ]
    },
    "PRIME_HELIX": {
        label: "La Hélice Prima",
        description: "El Anti-Sistema. Ataca el Caos: Columna 2 (Densidad de Primos) + Primos Huérfanos (3, 7, 13, 19, 31).",
        bets: [
            'COL2', 'COL2', 'COL2', 'COL2', 'COL2',
            '3', '7', '13', '19', '31'
        ]
    },
    "ARRAY_GLITCH": {
        label: "El Glitch del Array (Index 0/36)",
        description: "Ataque a la lógica de construcción del Software. Explota posibles errores de 'Off-by-One' en los límites del Array [0...36]. Apuesta al Primer Elemento (0), Último (26) y el Centro Exacto (10).",
        bets: [
            '0', '26', '10', // The Anchors
            '32', '3' // The neighbor drift (Index 1 and 35)
        ]
    },
    "CROSS_5_SNIPER": {
        label: "🎯 Cruz del 5 Sniper",
        description: "Alta Supervivencia (83%) buscando el Jackpot en el 5. (Splits 5 + Doz1 + Negro + Par)",
        bets: [
            'SPLIT_2_5', 'SPLIT_4_5', 'SPLIT_5_6', 'SPLIT_5_8',
            'DOZ1',
            'BLACK', 'EVEN'
        ]
    },
    "CROSS_5_PLUS_NUCLEO_23": {
        label: "⚔️ Asedio Total (Cruz 5 + Núcleo 23)",
        description: "Cobertura Masiva (10 Fichas). Domina Sector 5 y Sector 23 simultáneamente. Alta inversión, altísima cobertura.",
        bets: [
            // Cruz 5 Base
            'SPLIT_2_5', 'SPLIT_4_5', 'SPLIT_5_6', 'SPLIT_5_8', 'DOZ1', 'BLACK', 'EVEN',
            // Nucleo 23 Add-on (Based on BettingBoard.jsx definition)
            'CORNER_8_11_7_10', 'CORNER_24_27_23_26', 'SPLIT_5_8' // Note: SPLIT_5_8 is already in Cross 5! Double bet on 5/8? Yes, 34x payoff!
        ]
    }
}
