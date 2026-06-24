# Política de Seguridad

## Versiones Soportadas

Actualmente soportamos parches de seguridad para las siguientes versiones de GHR Ruleta Royale:

| Versión | Soportada | Notas |
| ------- | ------------------ | ------------------------------------------------ |
| 1.x | :white_check_mark: | Actualizaciones de seguridad críticas y parches. |
| < 1.0 | :x: | Versiones de desarrollo obsoletas. |

## Reportar una Vulnerabilidad

Nos tomamos la seguridad de **GHR Ruleta Royale** muy en serio. Si descubres una vulnerabilidad de seguridad, por favor sigue estos pasos:

1.  **NO** abras un Issue público en GitHub.
2.  Envía un correo electrónico detallado a **security@ghr-ruleta.com** (o contacta directamente al administrador del repositorio).
3.  Incluye pasos para reproducir la vulnerabilidad.

### Proceso de Respuesta

1.  Daremos acuse de recibo de tu reporte en un plazo de 48 horas.
2.  Te enviaremos una estimación de tiempo para la solución.
3.  Te notificaremos cuando la corrección haya sido desplegada.

### Alcance

Esta política cubre:
*   Integridad del motor RNG (`RouletteWheel.jsx`, `useRouletteGame.js`).
*   Seguridad de los datos financieros (`FinancialSimulator.js`).
*   Protección contra inyección de código o manipulación de estado (`activeBets`).

¡Gracias por ayudar a mantener GHR Ruleta Royale segura!
