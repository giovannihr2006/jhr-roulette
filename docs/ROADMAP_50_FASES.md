# ROADMAP: GHR RULETA ROYALE (50 FASES)

## FASE 1: LOS CIMIENTOS (Elementos 0, 1)
*   **Objetivo**: Crear la "Mesa Infinita". El escenario perfecto.
*   **Entregable**: Fondo de fieltro ultra-realista con viñetas, iluminación dinámica y el branding "GHR Royale" dorado.

## FASE 2: EL MOTOR GRÁFICO (Preparación 2D/3D)
*   **Objetivo**: Configurar el viewport para soportar capas de alta calidad.
*   **Entregable**: Estructura de capas (Z-Index) perfecta: Fondo -> Paño -> Fichas -> UI.

## FASE 3: EL CILINDRO - ESTRUCTURA (Elemento 2 - Parte A)
*   **Objetivo**: Renderizar el cuerpo de madera y metal de la rueda.

## FASE 4: EL CILINDRO - NÚMEROS (Elemento 2 - Parte B)
*   **Objetivo**: Colocar los 37 números con tipografía y espaciado exacto.

## FASE 5: EL CILINDRO - GIRATORIO (Elemento 2 - Parte C)
*   **Objetivo**: Lograr la animación de giro perfecta (no lineal).

## FASE 6: EL PAÑO - GRILLA (Elemento 3)
*   **Objetivo**: Dibujado vectorial de la grilla 0-36 sobre el fieltro.

## FASE 7: EL PAÑO - EXTERNAS (Elemento 4)
*   **Objetivo**: Añadir zonas de Suertes Sencillas, Docenas y Columnas.

## FASE 8: INTERACTIVIDAD DEL PAÑO
*   **Objetivo**: Hover effects y "Snap areas" para detectar dondé cae la ficha.

## FASE 9: LA PISTA (Elemento 5)
*   **Objetivo**: Implementar el Racetrack ovalado.

## FASE 10: FICHAS - DISEÑO (Elemento 6 - Parte A)
*   **Objetivo**: Diseñar los sprites/CSS de las fichas (1, 5, 25, 100...).

## FASE 11: FICHAS - FÍSICA (Elemento 6 - Parte B)
*   **Objetivo**: Animación de "Vuelo" desde la bandeja al paño.

## FASE 12: GESTOR DE APUESTAS (Lógica)
*   **Objetivo**: Backend (Store) que memoriza dónde está cada ficha.

## FASE 13: BOTONERA PRINCIPAL (Elemento 7)
*   **Objetivo**: Botón GIRAR con estados (Activo, Deshabilitado, Hover).

## FASE 14: ACCIONES DE MESA A (Elementos 8, 9)
*   **Objetivo**: Implementar REPETIR y DOBLAR.

## FASE 15: ACCIONES DE MESA B (Elementos 10, 11)
*   **Objetivo**: Implementar DESHACER y LIMPIAR.

## FASE 16: MOTOR FINANCIERO (Elementos 12, 13)
*   **Objetivo**: Paneles de Saldo y Apuesta Total conectados a la lógica.

## FASE 17: LA BOLA (Física Simulada)
*   **Objetivo**: La "protagonista". Trayectoria independiente a la rueda.

## FASE 18: COLISIÓN Y RESULTADO
*   **Objetivo**: Detectar en qué número "cae" la bola (RNG seguro).

## FASE 19: PAGOS Y GANANCIAS (Elemento 14)
*   **Objetivo**: Calcular pagos (35:1, etc) y mostrar "WIN AMOUNT".

## FASE 20: MARCADOR GANADOR (Elemento 16)
*   **Objetivo**: El "Dolly" digital o marcador grande que anuncia el número.

## FASE 21: HISTORIAL VISUAL (Elemento 15)
*   **Objetivo**: Columna/Fila de últimos números con codificación de color.

## FASE 22: ESTADÍSTICAS BÁSICAS (Elemento 17)
*   **Objetivo**: Gráficos de Hot/Cold numbers.

## FASE 23: AUDIO AMBIENTAL Y FX (Elemento 18)
*   **Objetivo**: Sonidos de fichas, giro y ambiente.

## FASE 24: VOZ DEL CRUPIER (Elemento 44)
*   **Objetivo**: Síntesis o samples de "No more bets", "22 Black", etc.

## FASE 25: TEMPORIZADOR DE APUESTAS (Elemento 20)
*   **Objetivo**: Reloj regresivo y lógica de bloqueo.

## FASE 26: ESTADOS DE RONDA (Elementos 23, 24)
*   **Objetivo**: Máquina de estados clara (BETTING -> SPINNING -> PAYOUT).

## FASE 27: LÍMITES DE MESA (Elemento 21)
*   **Objetivo**: Validaciones de Min/Max y cartel visual.

## FASE 28: IDENTIFICADOR ÚNICO (Elemento 22)
*   **Objetivo**: Hash GUID por ronda visible en pantalla.

## FASE 29: TICKET DE APUESTAS (Elemento 27)
*   **Objetivo**: Panel detallado de qué se apostó.

## FASE 30: MENSAJES Y ALERTAS (Elemento 28)
*   **Objetivo**: Toasts o notificaciones de sistema elegantes.

## FASE 31: VISTA DE CÁMARAS (Elemento 35)
*   **Objetivo**: Selector para cambiar entre zoom de rueda y mesa completa.

## FASE 32: CHAT EN VIVO (Elemento 36)
*   **Objetivo**: Simulación de chat multijugador.

## FASE 33: APUESTAS FAVORITAS (Elemento 45)
*   **Objetivo**: Guardar/Cargar presets de apuestas.

## FASE 34: CAMBIO DE MODO (Elemento 30)
*   **Objetivo**: Interfaz para modo "Speed" o "Normal".

## FASE 35: TABLA DE PAGOS (Elemento 19/31)
*   **Objetivo**: Modal interactivo de ayuda.

## FASE 36: INDICADOR INSIDE/OUTSIDE (Elemento 32)
*   **Objetivo**: Highlight visual de zonas.

## FASE 37: AUTOPLAY BÁSICO
*   **Objetivo**: Botón para repetir N rondas.

## FASE 38: AUTOPLAY AVANZADO (Elemento 40)
*   **Objetivo**: Condiciones de parada (Stop Loss/Win).

## FASE 39: PANEL CAJA (Elemento 37)
*   **Objetivo**: Simulación de depósito/retiro.

## FASE 40: REPLAY VISUAL (Elemento 39)
*   **Objetivo**: Zoom o repetición del momento en que cae la bola.

## FASE 41: PERSONALIZACIÓN DE CALIDAD (Elemento 46)
*   **Objetivo**: Selector de performance gráfica.

## FASE 42: BOTÓN LOBBY (Elemento 47)
*   **Objetivo**: Navegación de salida.

## FASE 43: ESTILO LIVE CASINO (Elemento 34)
*   **Objetivo**: Integración de video fondo (simulado) para realismo.

## FASE 44: EVENTOS ESPECIALES (Elemento 38)
*   **Objetivo**: Multiplicadores visuales (estilo Lightning).

## FASE 45: PULIDO GRÁFICO A
*   **Objetivo**: Iluminación, destellos y sombras finales.

## FASE 46: PULIDO DE ANIMACIONES
*   **Objetivo**: Suavizar todas las transiciones CSS/JS.

## FASE 47: OPTIMIZACIÓN DE CÓDIGO
*   **Objetivo**: Refactor final y limpieza de logs.

## FASE 48: AUDITORÍA DE SEGURIDAD
*   **Objetivo**: Verificar RNG y prevención de trampas.

## FASE 49: CROSS-BROWSER TESTING
*   **Objetivo**: Verificar en Chrome, Firefox, Edge.

## FASE 50: LANZAMIENTO GOLD (V1.0)
*   **Objetivo**: Empaquetado final y despliegue.
