# Contribuyendo a GHR Ruleta Royale

¡Gracias por tu interés en contribuir! 🎰

## Cómo Contribuir

### 1. Fork y Clone
```bash
git clone https://github.com/tu-usuario/baryonic-blazar.git
cd baryonic-blazar
npm install
```

### 2. Crear Branch
```bash
git checkout -b feature/mi-nueva-funcionalidad
```

### 3. Desarrollo
```bash
npm run dev  # Iniciar servidor de desarrollo
npm test     # Ejecutar tests
npm run lint # Verificar código
```

### 4. Commit
Usa mensajes descriptivos:
- `feat: agregar nueva funcionalidad`
- `fix: corregir bug en X`
- `docs: actualizar documentación`
- `refactor: mejorar estructura de código`
- `test: agregar tests para X`

### 5. Pull Request
1. Push a tu fork
2. Abre un PR con descripción clara
3. Espera revisión

## Estándares de Código

- **ESLint** - Ejecutar `npm run lint` antes de commit
- **Tests** - Agregar tests para nueva funcionalidad
- **PropTypes** - Documentar props de componentes
- **JSDoc** - Comentarios para funciones exportadas

## Estructura de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bugs |
| `docs` | Solo documentación |
| `style` | Formateo, sin cambio de lógica |
| `refactor` | Refactorización |
| `test` | Agregar tests |
| `chore` | Tareas de mantenimiento |

## Reportar Bugs

1. Busca si el issue ya existe
2. Crea un nuevo issue con:
   - Descripción clara
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Capturas de pantalla si aplica

## Preguntas

Abre un issue con la etiqueta `question`.

---

¡Gracias por contribuir! 🚀
