# Changelog

Todos los cambios notables en este proyecto serán documentados aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-17

### Agregado
- Sistema de tests unitarios con Vitest (157 tests)
- Tests de snapshot para componentes UI
- Componentes extraídos: BrandingHeader, LayoutControls, ModeToggle, SmartAutoPlayController, TimerController
- PropTypes en componentes nuevos
- Sistema de accesibilidad (AccessibilityUtils.js)
- Validación de inputs (InputValidation.js)
- Manejo de errores consistente (ErrorHandling.js)
- Hook useLoadingState para estados de carga
- Hook useOptimizedHover para hover debounced
- Preloader de audio (AudioPreloader.js)
- Encriptación de localStorage (StorageEncryption.js)
- Sistema de feature flags (FeatureFlags.js)
- Archivos i18n (es.json, en.json)
- CI/CD con GitHub Actions
- PWA manifest y service worker
- Documentación: README.md, CONTRIBUTING.md, ADR.md
- Configuración TypeScript (tsconfig.json)
- Husky + lint-staged para pre-commit hooks

### Mejorado
- RouletteWheel envuelto en React.memo
- Código limpio: console.logs eliminados
- Código muerto removido (backup files, comentarios)

### Seguridad
- Encriptación XOR para datos sensibles en localStorage
- Validación de inputs numéricos

## [1.0.0] - 2025-12-30

### Agregado
- Ruleta europea completa (37 números)
- Sistema financiero con Zustand
- Múltiples tipos de apuestas
- Sistemas especiales (System 26, 23, 10)
- Modo LIVE y SIMULACIÓN
- Layout drag & drop personalizable
- Panel de estadísticas y oportunidades
- Animaciones y efectos de sonido
- Historial detallado de jugadas
- Proyecciones financieras
- Selector de moneda (COP, USD, EUR)
