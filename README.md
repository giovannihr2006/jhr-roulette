/**
 * README.md - v0.1.18
 * Documentación principal del proyecto
 */

# 🎰 JHR Quantum Roulette

**Versión:** 1.0.0  
**Estado:** Production Ready  
**Licencia:** MIT  

## 📋 Descripción

Simulador de ruleta europea con motor RNG determinista, sistema completo de gestión de bankroll, análisis Hot/Cold, historial de resultados, y características de juego responsable.

## ✨ Características Principales

### Core Features (v0.1.1 - v0.1.7)
- ✅ Motor RNG determinista con modo producción y testing
- ✅ Canvas responsivo 16:9 con detección de orientación
- ✅ Sistema completo de pagos (27 tipos de apuestas)
- ✅ Gestión de bankroll con validación en tiempo real
- ✅ Grid layout 3×12 interactivo
- ✅ Sistema de fichas con stacking visual
- ✅ Outside bets, docenas y columnas

### Advanced Features (v0.1.8 - v0.1.12)
- ✅ Apuestas avanzadas (splits, streets, corners, lines)
- ✅ Motor de giro con estados (READY, SPINNING, PAYING)
- ✅ Animaciones de giro con overlays
- ✅ Cálculo y pago automático de ganancias

### Analytics & History (v0.1.13)
- ✅ Sistema completo de historial (500 resultados)
- ✅ Algoritmo Hot/Cold con scoring estadístico
- ✅ Ticker visual de últimos 12 resultados
- ✅ Panel Hot/Cold con gradientes y frecuencias
- ✅ Detección de rachas y patrones

### Session Management (v0.1.14)
- ✅ Reloj en tiempo real (24h/12h)
- ✅ Temporizador de sesión (HH:MM:SS)
- ✅ Reality Check cada 30 minutos (juego responsable)
- ✅ Estadísticas completas de sesión
- ✅ Exportación JSON

### User Experience (v0.1.15)
- ✅ Tutorial interactivo paso a paso
- ✅ Sistema de ayuda contextual
- ✅ Atajos de teclado
- ✅ UI/UX optimizada

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/jhr-roulette.git
cd jhr-roulette

# Abrir en navegador
open index.html
```

### Uso Básico

```javascript
// Test de giro
testSpin();

// Simulación de 50 giros
simulateSession(50);

// Ver estadísticas
printStats();

// Exportar sesión
exportSession();
```

### Atajos de Teclado

- **SPACE** - Giro de prueba
- **S** - Mostrar estadísticas
- **H** - Análisis Hot/Cold
- **R** - Reality Check manual

## 📊 Arquitectura

```
jhr-roulette/
├── engine/          # Motor RNG
├── betting/         # Sistema de apuestas y pagos
├── ui/              # Componentes visuales
├── session/         # Gestión de sesión
├── tutorial/        # Sistema de tutorial
├── tests/           # Tests automatizados
├── main.js          # Integración principal
└── index.html       # Punto de entrada
```

## 🧪 Testing

```javascript
// Tests de motor RNG
runEngineTests();

// Tests de pagos
runPayoutTests();

// Tests de historial
runHistoryTests();
```

## 📈 Estadísticas

- **Líneas de código:** ~8,000+
- **Archivos JavaScript:** 30+
- **Tests automatizados:** 50+
- **Tipos de apuestas:** 27
- **Números en ruleta:** 37 (0-36, europea)

## 🎯 Roadmap Futuro

### Fase 2: Hiperrealismo Visual
- Cilindro 3D con física realista
- Bola con colisiones y fricción
- Racetrack y call bets
- Modo turbo

### Fase 3: Ecosistema
- Base de datos y autenticación
- Multiplayer en tiempo real
- Leaderboards y logros
- Multi-divisa

### Fase 4: Alta Fidelidad
- Iluminación PBR
- Texturas y materiales avanzados
- Efectos de partículas
- Audio espacial 3D

### Fase 5: IA y Despliegue
- Análisis predictivo con IA
- CI/CD automatizado
- Telemetría y A/B testing
- Marketing y localización

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles

## 📞 Contacto

- **Email:** giovannihro2006@gmail.com
- **GitHub:** [tu-usuario]
- **Website:** [tu-website]

---

**Hecho con ❤️ por Giovanni Holguin**
