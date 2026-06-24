# Architecture Decision Records

Este directorio contiene registros de decisiones de arquitectura (ADRs) para GHR Ruleta Royale.

## ¿Qué es un ADR?

Un Architecture Decision Record documenta una decisión de diseño importante junto con su contexto y consecuencias.

## Índice de ADRs

| ID | Título | Estado | Fecha |
|----|--------|--------|-------|
| 001 | Usar Zustand para State Management | Aceptado | 2025-01 |
| 002 | Separar lógica de UI en hooks | Aceptado | 2025-01 |
| 003 | Usar localStorage para persistencia | Aceptado | 2025-01 |

---

## ADR-001: Usar Zustand para State Management

### Estado
Aceptado

### Contexto
Necesitamos una solución de state management que sea:
- Simple de configurar
- Performante
- Fácil de persistir en localStorage

### Decisión
Usamos Zustand en lugar de Redux o Context API.

### Consecuencias
- ✅ Menos boilerplate que Redux
- ✅ Mejor performance que Context
- ✅ Persistencia built-in con middleware
- ⚠️ Menos ecosistema que Redux

---

## ADR-002: Separar lógica de UI en hooks

### Estado
Aceptado

### Contexto
Los componentes grandes como CasinoTable tienen demasiada lógica mezclada con UI.

### Decisión
Extraer lógica a custom hooks:
- `useRouletteGame` - Física y RNG
- `useDragLayout` - Sistema de layout
- `useCurrency` - Conversión de monedas

### Consecuencias
- ✅ Componentes más pequeños y legibles
- ✅ Lógica reutilizable
- ✅ Más fácil de testear
- ⚠️ Más archivos que mantener

---

## ADR-003: Usar localStorage para persistencia

### Estado
Aceptado

### Contexto
Necesitamos persistir el estado del juego entre sesiones sin backend.

### Decisión
Usar localStorage con encriptación básica para datos sensibles.

### Consecuencias
- ✅ Sin necesidad de backend
- ✅ Funciona offline
- ⚠️ Límite de 5-10MB
- ⚠️ No es seguro contra manipulación local
