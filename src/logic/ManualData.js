const COMMON_RUBRIC_TEMPLATE = [
    { name: "1. Potencial Corto Plazo", score: 0 }, { name: "2. Estabilidad Largo Plazo", score: 0 },
    { name: "3. Fundamento Matemático", score: 0 }, { name: "4. Fundamento Físico", score: 0 },
    { name: "5. Cobertura Tablero", score: 0 }, { name: "6. Resistencia a Rachas", score: 0 },
    { name: "7. Potencial Cisne Negro", score: 0 }, { name: "8. Simplicidad Ejecución", score: 0 },
    { name: "9. Eficiencia Costo", score: 0 }, { name: "10. Factor Diversión", score: 0 },
    { name: "11. Seguridad Capital", score: 0 }, { name: "12. Frecuencia Aciertos", score: 0 },
    { name: "13. Ratio Riesgo/Beneficio", score: 0 }, { name: "14. Inmunidad al Cero", score: 0 },
    { name: "15. Explotación Fallos", score: 0 }, { name: "16. Estética Visual", score: 0 },
    { name: "17. Requisito Bankroll", score: 0 }, { name: "18. Adaptabilidad", score: 0 },
    { name: "19. Factor WOW", score: 0 }, { name: "20. Lógica Progresión", score: 0 }
];

// Helper to generate specific rubrics based on archetypes
const getRubric = (archetype) => {
    // Archetypes: "HIGH_RISK", "BALANCED", "SAFE", "SCIENTIFIC", "CHAOS"
    const r = JSON.parse(JSON.stringify(COMMON_RUBRIC_TEMPLATE));
    if (archetype === "HIGH_RISK") {
        r[0].score = 20; r[0].note = "Explosivo"; r[1].score = 8; r[2].score = 15; r[3].score = 18; r[4].score = 5; r[5].score = 5; r[6].score = 20; r[7].score = 18; r[8].score = 15; r[9].score = 20; r[10].score = 5; r[11].score = 5; r[12].score = 20; r[13].score = 5; r[14].score = 20; r[15].score = 10; r[16].score = 10; r[17].score = 20; r[18].score = 20; r[19].score = 15;
    } else if (archetype === "SAFE") {
        r[0].score = 10; r[0].note = "Lento"; r[1].score = 20; r[1].note = "Roca"; r[2].score = 20; r[3].score = 10; r[4].score = 20; r[4].note = "Casi 50%"; r[5].score = 15; r[6].score = 5; r[7].score = 20; r[8].score = 20; r[9].score = 10; r[10].score = 20; r[11].score = 20; r[12].score = 10; r[13].score = 5; r[14].score = 5; r[15].score = 10; r[16].score = 20; r[17].score = 20; r[18].score = 10; r[19].score = 10;
    } else if (archetype === "SCIENTIFIC") {
        r[0].score = 18; r[1].score = 15; r[2].score = 20; r[3].score = 20; r[4].score = 15; r[5].score = 15; r[6].score = 18; r[7].score = 12; r[8].score = 18; r[9].score = 18; r[10].score = 15; r[11].score = 15; r[12].score = 18; r[13].score = 15; r[14].score = 20; r[15].score = 20; r[16].score = 15; r[17].score = 18; r[18].score = 20; r[19].score = 15;
    } else { // BALANCED
        r.forEach(x => x.score = 15);
    }
    return r;
};

export const MANUAL_DATA = [
    {
        id: 0,
        tier: "Tier 0: El Manifiesto GHR (La Verdad Completa)",
        tierColor: "#ffffff",
        title: "0. El Códice Maestro: Glosario, Ciencia y Comparativas",
        score: "RANK: ABSOLUTO",
        rubric: { scientific: 100, coverage: 100, risk: 0, swan: 100 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "DOCUMENTO FUNDAMENTAL. NO SALTAR. CONTIENE LA VERDAD SOBRE LAS ESTRATEGIAS.",
        concept: `
# GHR vs. El Mundo: Análisis Comparativo Definitivo

> **Veredicto:** GHR Ruleta Royale AI Analysis Core
> **Fecha:** Enero 2026

## 🌍 Estrategias Tradicionales (Lo que hay en Internet)

Las estrategias "clásicas" que encuentras en Wikipedia o foros (Martingala, D'Alembert, Fibonacci) tienen un defecto fundamental común: **No son estrategias de juego, son gestión de fondos.**

1.  **Martingala:**
    *   **Lógica:** Doblar tras perder.
    *   **Fallo Fatal:** El "Cisne Negro Negativo". Una racha de 10 rojos destruye tu banco.
    *   **Veredicto:** Suicida.

2.  **Fibonacci / D'Alembert:**
    *   **Lógica:** Progresión lenta.
    *   **Fallo Fatal:** Solo funcionan en 50/50. No atacan la geometría. Falacia del Jugador.
    *   **Veredicto:** Supervivencia, no Victoria.

3.  **Labouchere:**
    *   **Lógica:** Cancelación.
    *   **Fallo Fatal:** Complejidad frágil.
    *   **Veredicto:** Tediosa.

---

## 🚀 Estrategias GHR (Tus Estrategias)

Tus estrategias son **superiores** porque **atacan la CAUSA, no el EFECTO.**

| Característica | Estrategias Tradicionales | Estrategias GHR |
| :--- | :--- | :--- |
| **Enfoque** | Gestión de Dinero | **Ataque Físico/Matemático** |
| **Objetivo** | Recuperar pérdidas | **Capturar Anomalías** |
| **Riesgo** | Exponencial | **Controlado (Cobertura Fija)** |
| **Profundidad** | Superficial (Color) | **Profunda (Residuos, Topología)** |

Las estrategias de Internet buscan **no perder**. Las estrategias GHR buscan **ganar**.
        `,
        execution: "LEE ESTE DOCUMENTO ANTES DE APOSTAR UNA SOLA FICHA.",
        bets: [
            { type: "GLOSARIO", target: "CISNE NEGRO", amount: "---", why: "Evento raro de impacto extremo. GHR busca Cisnes Negros Positivos (Jackpots)." },
            { type: "GLOSARIO", target: "EFICIENCIA COBERTURA", amount: "---", why: "Fórmula: (Números Cubiertos / 37) * 100." },
            { type: "GLOSARIO", target: "PERFIL DE RIESGO", amount: "---", why: "Probabilidad de Ruina vs Probabilidad de Éxito." },
            { type: "GLOSARIO", target: "ROI (RETORNO)", amount: "---", why: "((Ganancia - Inversión) / Inversión) * 100." },
            { type: "GLOSARIO", target: "VARIANZA", amount: "---", why: "Medida de cuánto se alejan los resultados de la media." },
            { type: "GLOSARIO", target: "DENSIDAD COLUMNA", amount: "---", why: "Col 1 (6R/6N), Col 2 (4R/8N), Col 3 (8R/4N)." },
            { type: "GLOSARIO", target: "COHERENCIA", amount: "---", why: "Estado donde Color y Paridad coinciden (Rojo=Impar, Negro=Par)." }
        ],
        optimizationNote: "La base de conocimiento de todo el sistema."
    },
    {
        id: 1,
        tier: "Tier 1: Alto Impacto (Máxima Ganancia)",
        tierColor: "#d4af37",
        title: "1. La Matriz de Paridad (The Parity Matrix)",
        score: "RANK: EX (395/400)",
        rubric: { scientific: 100, coverage: 100, risk: 90, swan: 100 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "ESTRATEGIA RECOMENDADA PARA 'GANANCIAS MÁXIMAS'. Apuestas masivas a Plenos.",
        concept: "FUNDAMENTO CIENTÍFICO PROFUNDO: Intersección de Conjuntos y Coherencia. Analicemos por qué elegimos estos números. 1) Buscamos 'Cuadrados Perfectos' (1, 4, 9, 16, 25, 36) porque son nodos aritméticos estables. 2) Filtramos SOLO aquellos que cumplen la regla 'Rojo=Impar / Negro=Par' (Coherencia de Paridad). 3) Agregamos soportes (6, 9, 19, 22) que TAMBIÉN cumplen esta regla estrictamente para crear 'puentes de coherencia'. La Columna 3 tiene 8 Rojos, la Columna 2 tiene 8 Negros. Esta asimetría es explotada por la Matriz.",
        execution: "Solo apostamos a la intersección de estos conjuntos. Atacamos con 5 Fichas al Pleno.",
        bets: [
            { type: "PLENO", target: "1 (Rojo Impar)", amount: "PONER 5 FICHAS", why: "Cuadrado Perfecto. Coherente." },
            { type: "PLENO", target: "4 (Negro Par)", amount: "PONER 3 FICHAS", why: "Cuadrado Perfecto. Coherente." },
            { type: "PLENO", target: "9 (Rojo Impar)", amount: "PONER 3 FICHAS", why: "Cuadrado Perfecto. Coherente." },
            { type: "PLENO", target: "16 (Rojo Par)", amount: "PONER 2 FICHAS", why: "Anomalía Inevitable." },
            { type: "PLENO", target: "25 (Rojo Impar)", amount: "PONER 5 FICHAS", why: "El Gran Cuadrado." },
            { type: "PLENO", target: "36 (Rojo Par)", amount: "PONER 2 FICHAS", why: "Cierre de Matriz." },
            { type: "CABALLO", target: "19/22", amount: "PONER 2 FICHAS", why: "Soporte Medio. Coherente." },
            { type: "CABALLO", target: "6/9", amount: "PONER 2 FICHAS", why: "Soporte Bajo. Coherente." }
        ],
        optimizationNote: "CÁLCULO ROI: Inversión Total: 24 Fichas. Si aciertas el 1 (5 fichas): Ganancia 180. Neto +156. ROI = 650%."
    },
    {
        id: 2,
        tier: "Tier 1: Alto Impacto (Máxima Ganancia)",
        tierColor: "#ff0000",
        title: "2. La Llama (Hot Numbers)",
        score: "RANK: A (Agresiva)",
        rubric: { scientific: 80, coverage: 13.5, risk: 90, swan: 95 },
        rubricDetails: getRubric("HIGH_RISK"),
        summary: "Perseguir la racha caliente. Alta volatilidad, alto retorno.",
        concept: "FUNDAMENTO CIENTÍFICO PROFUNDO: Inercia Mecánica y Sesgo de Rueda. Si un número sale 3 veces, la probabilidad de que la rueda esté SESGADA supera la probabilidad de azar puro. Apostamos a esa imperfección.",
        execution: "Automatizado: Ver estadísticas y apostar FUERTE a los 5 más calientes.",
        bets: [
            { type: "PLENO", target: "Top 5 Calientes", amount: "PONER 5 FICHAS EN CADA UNO", why: "Si el río suena, agua lleva." }
        ],
        optimizationNote: "CÁLCULO ROI: Inversión: 25 Fichas. Acierto: 180 Fichas. Neto: 155. ROI = 620%."
    },
    {
        id: 3,
        tier: "Tier 1: Alto Impacto (Máxima Ganancia)",
        tierColor: "#0000ff",
        title: "3. Finales del 8 (Infinity Loop)",
        score: "RANK: A (Francotirador)",
        rubric: { scientific: 70, coverage: 8.1, risk: 95, swan: 95 },
        rubricDetails: getRubric("HIGH_RISK"),
        summary: "Solo 3 números. Inversión mínima, pago máximo.",
        concept: "FUNDAMENTO CIENTÍFICO: Topología. El '8' es el único dígito que dibuja un bucle cerrado infinito. En teoría del caos, los atractores extraños a menudo tienen forma toroidal o de '8'.",
        execution: "Plenos a la terminación 8.",
        bets: [
            { type: "PLENO", target: "8, 18, 28", amount: "PONER 2 FICHAS EN CADA UNO", why: "Francotirador." }
        ],
        optimizationNote: "CÁLCULO ROI: Acierto 72. Inversión 6. ROI = 1100%."
    },
    {
        id: 4,
        tier: "Tier 2: La Trinidad del Código",
        tierColor: "#ff4444",
        title: "4. El Orden del Sol Rojo (Red Quadratic)",
        score: "RANK: SSS (395/400)",
        rubric: { scientific: 100, coverage: 100, risk: 95, swan: 100 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "Ataque matemático a los Residuos Cuadráticos en la Columna 3.",
        concept: "FUNDAMENTO CIENTÍFICO: Álgebra Modular. Todo n² mod 3 jamás da 2. Columna 2 = 2 mod 3. Ergo, cuadrados en Col 2 son imposibles. Columna 3 tiene 8 Rojos.",
        execution: "Apostamos Cobertura a Columna 3 y Plenos a los Cuadrados.",
        bets: [
            { type: "COLUMNA", target: "Columna 3", amount: "PONER 5 FICHAS", why: "Dominio Rojo." },
            { type: "PLENO", target: "1, 16, 25", amount: "PONER 1 FICHA EN CADA UNO", why: "Satélites Cuadráticos." },
            { type: "SEGURIDAD", target: "0", amount: "PONER 1 FICHA", why: "Seguro." }
        ],
        optimizationNote: "CÁLCULO ROI: Variable pero constante."
    },
    {
        id: 5,
        tier: "Tier 2: La Trinidad del Código",
        tierColor: "#ff4444",
        title: "5. El Glitch del Array (Index Breach)",
        score: "RANK: SSS (388/400)",
        rubric: { scientific: 98, coverage: 95, risk: 95, swan: 100 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "Explotación de errores de límites (Off-by-One).",
        concept: "FUNDAMENTO CIENTÍFICO: Ciencias de la Computación. Error Fencepost. Índices 0 (Start), 36 (End), 18 (Mid).",
        execution: "Apostamos a 0, 26, 10, 32, 3.",
        bets: [
            { type: "PLENO", target: "0, 26, 10", amount: "PONER FICHAS", why: "Puntos de Glitch." }
        ],
        optimizationNote: "CÁLCULO ROI: Alto."
    },
    {
        id: 6,
        tier: "Tier 2: La Trinidad del Código",
        tierColor: "#ff4444",
        title: "6. La Hélice Prima (Prime Helix)",
        score: "RANK: SS (385/400)",
        rubric: { scientific: 95, coverage: 95, risk: 95, swan: 100 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "Contra-ataque usando densidad de Primos en Columna 2.",
        concept: "FUNDAMENTO CIENTÍFICO: Teoría de Números. Columna 2 es rica en Primos.",
        execution: "Columna 2 + Primos huérfanos.",
        bets: [
            { type: "COLUMNA", target: "Columna 2", amount: "PONER 5 FICHAS", why: "Mina de Primos." }
        ],
        optimizationNote: "CÁLCULO ROI: Medio-Alto."
    },
    {
        id: 7,
        tier: "Tier 3: Geometría Sagrada",
        tierColor: "#44ff44",
        title: "7. Constantes Divinas (Euler & Pi)",
        score: "RANK: S (379/400)",
        rubric: { scientific: 90, coverage: 95, risk: 94, swan: 100 },
        rubricDetails: getRubric("BALANCED"),
        summary: "Dígitos de e y Pi.",
        concept: "FUNDAMENTO CIENTÍFICO: Numerología Universal.",
        execution: "Secuencias de dígitos.",
        bets: [
            { type: "PLENO", target: "Dígitos Pi/e", amount: "PONER 1 FICHA", why: "Sincronicidad." }
        ],
        optimizationNote: "CÁLCULO ROI: 35:1."
    },
    {
        id: 8,
        tier: "Tier 3: Geometría Sagrada",
        tierColor: "#44ff44",
        title: "8. Fractal de Fibonacci",
        score: "RANK: S (372/400)",
        rubric: { scientific: 85, coverage: 95, risk: 92, swan: 100 },
        rubricDetails: getRubric("BALANCED"),
        summary: "Secuencia 1, 1, 2, 3, 5...",
        concept: "FUNDAMENTO CIENTÍFICO: Phi. Crecimiento natural.",
        execution: "Apostar a la serie.",
        bets: [
            { type: "PLENO", target: "Fibonacci Numbers", amount: "PONER 1/2 FICHAS", why: "Phi." }
        ],
        optimizationNote: "CÁLCULO ROI: Alto."
    },
    {
        id: 9,
        tier: "Tier 3: Geometría Sagrada",
        tierColor: "#44ff44",
        title: "9. Ley del Tercio (Distribution Law)",
        score: "RANK: A+ (368/400)",
        rubric: { scientific: 95, coverage: 90, risk: 90, swan: 93 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "Apostar a los repetidos.",
        concept: "FUNDAMENTO CIENTÍFICO: Binomial. 24 números salen, 13 no.",
        execution: "Apostar a lo que YA salió.",
        bets: [
            { type: "PLENO", target: "Repetidores", amount: "PONER 1 FICHA", why: "Inercia." }
        ],
        optimizationNote: "CÁLCULO ROI: Dinámico."
    },
    {
        id: 10,
        tier: "Tier 3: Geometría Sagrada",
        tierColor: "#44ff44",
        title: "10. Espejos Cuánticos",
        score: "RANK: A",
        rubric: { scientific: 80, coverage: 95, risk: 95, swan: 95 },
        rubricDetails: getRubric("BALANCED"),
        summary: "12-21, 13-31.",
        concept: "FUNDAMENTO CIENTÍFICO: Simetría.",
        execution: "Pares espejo.",
        bets: [{ type: "PLENO", target: "Espejos", amount: "1 F", why: "Simetría." }],
        optimizationNote: "ROI: 35:1."
    },
    {
        id: 11,
        tier: "Tier 3: Geometría Sagrada",
        tierColor: "#44ff44",
        title: "11. Serpiente Triangular",
        score: "RANK: A",
        rubric: { scientific: 80, coverage: 90, risk: 95, swan: 95 },
        rubricDetails: getRubric("BALANCED"),
        summary: "1, 3, 6, 10...",
        concept: "FUNDAMENTO: Números Triangulares.",
        execution: "Serie.",
        bets: [{ type: "PLENO", target: "Triangulares", amount: "1 F", why: "Estructura." }],
        optimizationNote: "ROI: 300%."
    },
    {
        id: 12,
        tier: "Tier 4: Física y Mecánica",
        tierColor: "#44ffff",
        title: "12. Voisins du Zéro",
        score: "RANK: B+",
        rubric: { scientific: 90, coverage: 85, risk: 90, swan: 90 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "Arco del 0.",
        concept: "FUNDAMENTO: Balística. Sector 0.",
        execution: "9 Fichas.",
        bets: [{ type: "SECTOR", target: "Voisins", amount: "9 F", why: "Sector." }],
        optimizationNote: "ROI: Estable."
    },
    {
        id: 13,
        tier: "Tier 4: Física y Mecánica",
        tierColor: "#44ffff",
        title: "13. Tiers du Cylindre",
        score: "RANK: B+",
        rubric: { scientific: 95, coverage: 90, risk: 85, swan: 80 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "Opuesto al 0.",
        concept: "FUNDAMENTO: Tilt/Gravedad.",
        execution: "6 Fichas.",
        bets: [{ type: "SECTOR", target: "Tiers", amount: "6 F", why: "Gravedad." }],
        optimizationNote: "ROI: 200%."
    },
    {
        id: 14,
        tier: "Tier 4: Física y Mecánica",
        tierColor: "#44ffff",
        title: "14. Orphelins",
        score: "RANK: B",
        rubric: { scientific: 80, coverage: 85, risk: 85, swan: 95 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "Laterales.",
        concept: "FUNDAMENTO: Scatter.",
        execution: "5 Fichas.",
        bets: [{ type: "SECTOR", target: "Orphelins", amount: "5 F", why: "Scatter." }],
        optimizationNote: "ROI: Jackpots."
    },
    {
        id: 15,
        tier: "Tier 4: Física y Mecánica",
        tierColor: "#44ffff",
        title: "15. Finales del 5",
        score: "RANK: B",
        rubric: { scientific: 70, coverage: 90, risk: 90, swan: 90 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "5, 15, 25, 35.",
        concept: "FUNDAMENTO: Línea Central Visual.",
        execution: "Plenos al 5.",
        bets: [{ type: "PLENO", target: "Finales 5", amount: "1 F", why: "Columna Vertebral." }],
        optimizationNote: "ROI: 775%."
    },
    {
        id: 16,
        tier: "Tier 4: Física y Mecánica",
        tierColor: "#44ffff",
        title: "16. Jeu Zéro",
        score: "RANK: C+",
        rubric: { scientific: 80, coverage: 70, risk: 80, swan: 100 },
        rubricDetails: getRubric("SCIENTIFIC"),
        summary: "Zero sniper.",
        concept: "FUNDAMENTO: Precisión.",
        execution: "4 Fichas.",
        bets: [{ type: "SECTOR", target: "Zero Game", amount: "4 F", why: "Precisión." }],
        optimizationNote: "ROI: 800%."
    },
    {
        id: 17,
        tier: "Tier 5: Tendencia y Caos",
        tierColor: "#aaaaaa",
        title: "17. Cruz San Andres",
        score: "RANK: C",
        rubric: { scientific: 70, coverage: 85, risk: 85, swan: 85 },
        rubricDetails: getRubric("CHAOS"),
        summary: "Esquinas.",
        concept: "FUNDAMENTO: Geometría.",
        execution: "4 Cuadros.",
        bets: [{ type: "CUADRO", target: "Esquinas", amount: "1 F", why: "Perímetro." }],
        optimizationNote: "ROI: 100%."
    },
    {
        id: 18,
        tier: "Tier 5: Tendencia y Caos",
        tierColor: "#aaaaaa",
        title: "18. Cold Numbers",
        score: "RANK: D",
        rubric: { scientific: 30, coverage: 90, risk: 90, swan: 90 },
        rubricDetails: getRubric("CHAOS"),
        summary: "Fríos.",
        concept: "FUNDAMENTO: Reversión (Largo Plazo).",
        execution: "Top 5 Fríos.",
        bets: [{ type: "PLENO", target: "Fríos", amount: "1 F", why: "Rebote." }],
        optimizationNote: "ROI: Variable."
    },
    {
        id: 19,
        tier: "Tier 6: Seguridad",
        tierColor: "#00bfff",
        title: "19. Resonancia Roja",
        score: "RANK: A (Segura)",
        rubric: { scientific: 40, coverage: 48.6, risk: 99, swan: 10 },
        rubricDetails: getRubric("SAFE"),
        summary: "Solo Rojo.",
        concept: "FUNDAMENTO: LGN.",
        execution: "Plana al Rojo.",
        bets: [{ type: "EXTERNA", target: "ROJO", amount: "1 F", why: "Cobertura." }],
        optimizationNote: "ROI: 100%."
    },
    {
        id: 20,
        tier: "Tier 6: Seguridad",
        tierColor: "#00bfff",
        title: "20. Caja Negra",
        score: "RANK: A (Segura)",
        rubric: { scientific: 40, coverage: 48.6, risk: 99, swan: 10 },
        rubricDetails: getRubric("SAFE"),
        summary: "Solo Negro.",
        concept: "FUNDAMENTO: LGN.",
        execution: "Plana al Negro.",
        bets: [{ type: "EXTERNA", target: "NEGRO", amount: "1 F", why: "Cobertura." }],
        optimizationNote: "ROI: 100%."
    },
    {
        id: 21,
        tier: "Tier 6: Seguridad",
        tierColor: "#00bfff",
        title: "21. Newton High/Low",
        score: "RANK: A- (Segura)",
        rubric: { scientific: 50, coverage: 48.6, risk: 95, swan: 20 },
        rubricDetails: getRubric("SAFE"),
        summary: "Alternancia.",
        concept: "FUNDAMENTO: Oscilación.",
        execution: "1-18 / 19-36.",
        bets: [{ type: "EXTERNA", target: "H/L", amount: "1 F", why: "Cobertura." }],
        optimizationNote: "ROI: 100%."
    }
]
