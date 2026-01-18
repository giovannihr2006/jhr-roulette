/**
 * AccessibilityUtils.js
 * Utilidades para mejorar la accesibilidad del juego
 */

/**
 * Genera props ARIA para botones con solo iconos
 * @param {string} label - Descripción del botón
 * @returns {Object} Props para el botón
 */
export const getIconButtonProps = (label) => ({
    'aria-label': label,
    role: 'button',
    tabIndex: 0
})

/**
 * Genera props para handlers de teclado accesibles
 * @param {Function} onClick - Handler de click
 * @returns {Object} Props de teclado
 */
export const getKeyboardProps = (onClick) => ({
    onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.(e)
        }
    }
})

/**
 * Props para regiones live que anuncian cambios
 * @param {'polite'|'assertive'} politeness - Nivel de urgencia
 * @returns {Object} Props ARIA live
 */
export const getLiveRegionProps = (politeness = 'polite') => ({
    'aria-live': politeness,
    'aria-atomic': true,
    role: 'status'
})

/**
 * Props para elementos que describen tooltips
 * @param {string} tooltipId - ID del tooltip
 * @returns {Object} Props ARIA
 */
export const getTooltipTriggerProps = (tooltipId) => ({
    'aria-describedby': tooltipId
})

/**
 * ARIA labels para el juego de ruleta
 */
export const ARIA_LABELS = {
    // Rueda
    ROULETTE_WHEEL: 'Rueda de ruleta interactiva',
    SPIN_BUTTON: 'Girar la ruleta',
    SPIN_BUTTON_DISABLED: 'No se puede girar, giro en progreso',

    // Tablero de apuestas
    BETTING_BOARD: 'Tablero de apuestas de ruleta',
    NUMBER_CELL: (num) => `Apostar al número ${num}`,
    RED_BET: 'Apostar a rojo',
    BLACK_BET: 'Apostar a negro',
    EVEN_BET: 'Apostar a par',
    ODD_BET: 'Apostar a impar',
    LOW_BET: 'Apostar a bajo (1-18)',
    HIGH_BET: 'Apostar a alto (19-36)',
    DOZEN_1: 'Apostar a primera docena (1-12)',
    DOZEN_2: 'Apostar a segunda docena (13-24)',
    DOZEN_3: 'Apostar a tercera docena (25-36)',
    COLUMN_1: 'Apostar a primera columna',
    COLUMN_2: 'Apostar a segunda columna',
    COLUMN_3: 'Apostar a tercera columna',

    // Controles
    CLEAR_BETS: 'Limpiar todas las apuestas',
    REPEAT_BETS: 'Repetir apuestas anteriores',
    DOUBLE_BETS: 'Doblar apuestas actuales',
    UNDO_BET: 'Deshacer última apuesta',

    // Panel financiero
    BALANCE_DISPLAY: 'Saldo actual',
    TOTAL_BET: 'Apuesta total actual',
    POTENTIAL_WIN: 'Ganancia potencial',

    // Historial
    WINNING_NUMBER: (num) => `Número ganador: ${num}`,
    HISTORY_PANEL: 'Panel de historial de números',

    // Modales
    HELP_MODAL: 'Modal de ayuda del juego',
    SETTINGS_MODAL: 'Modal de configuración',
    HISTORY_MODAL: 'Modal de historial detallado',

    // Estados
    IS_SPINNING: 'La ruleta está girando',
    WIN_ANNOUNCEMENT: (amount) => `¡Ganaste ${amount}!`,
    LOSS_ANNOUNCEMENT: 'No ganaste esta ronda'
}

/**
 * Roles ARIA para elementos del juego
 */
export const ARIA_ROLES = {
    APPLICATION: 'application',
    GRID: 'grid',
    GRIDCELL: 'gridcell',
    BUTTON: 'button',
    STATUS: 'status',
    ALERT: 'alert',
    DIALOG: 'dialog',
    COMPLEMENTARY: 'complementary',
    REGION: 'region'
}

/**
 * Announce a message to screen readers
 * Creates a temporary live region to announce messages
 * @param {string} message - Message to announce
 * @param {'polite'|'assertive'} priority - Announcement priority
 */
export const announceToScreenReader = (message, priority = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.setAttribute('role', 'status')
    announcement.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    `
    announcement.textContent = message
    document.body.appendChild(announcement)

    // Remove after announcement is read
    setTimeout(() => {
        document.body.removeChild(announcement)
    }, 1000)
}
