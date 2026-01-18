export const HELP_DICTIONARY = {
    // Finanzas
    "Capital": "Dinero total disponible en tu 'banca'. No es lo mismo que el dinero en mesa.",
    "Punto Valor": "Valor monetario de 1 unidad de apuesta (Ficha). Ejemplo: 100 COP/USD.",
    "Stop Loss": "Límite de seguridad. Si tu pérdida neta alcanza este valor, el sistema te sugerirá retirarte.",
    "Alerta de Pérdida": "Primer aviso (Warning). Te notifica cuando te acercas a una zona peligrosa antes del Stop Loss.",
    "Meta Mensual (Tasa Mes)": "Objetivo financiero a largo plazo extraído de tu hoja 'ENSAYO'.",

    // Simulación (ENSAYO)
    "Compresión Tiempo": "Acelerador de realidad. 1.0 es Tiempo Real. 10.0 hace que 1 hora pase en 6 minutos.",
    "Proyección Horas": "Base de tiempo para calcular cuánto ganarías en una sesión típica.",

    // Estrategia
    "Espera (Wait)": "Número de giros consecutivos que una suerte (ej: Rojo) no ha salido.",
    "Umbral Espera": "El sistema te alertará cuando una 'Espera' supere este número.",
    "Profundidad Historial": "Cuántos giros pasados recuerda el sistema para sus cálculos.",

    // Conceptos Generales
    "ROI (Eficiencia)": "Retorno de Inversión. Cuánto ganas (o pierdes) en promedio por cada giro.",
    "Velocidad ($/hr)": "Ritmo de ganancia actual proyectado a una hora."
}

export const getHelp = (term) => HELP_DICTIONARY[term] || "Definición no disponible."
