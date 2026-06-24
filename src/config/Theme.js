/**
 * Centralized Theme Configuration
 * Helps manage global styles, colors, and layering (Z-Index).
 */

export const Z_LAYERS = {
    BASE: 0,
    BOARD: 10,
    WHEEL: 10,

    // HUD Elements (Chips, Controls, Clock)
    HUD: 100,

    // Floating Panels (History, Stats, Racetrack)
    PANELS: 200,

    // Projections Panel (needs to be above basic panels)
    PROJECTIONS: 300,

    // Standard Modals (Help, Settings, Strategies) - Managed by GameOverlayManager
    MODAL_BACKDROP: 900,
    MODAL_CONTENT: 1000,

    // Tooltips & Hover Effects
    TOOLTIP: 1500,

    // Magnifying Lens (Must be above Tooltips)
    LENS: 1600,

    // Active Bets Panel (User requested high visibility)
    ACTIVE_BETS: 2000,

    // Giant Status Overlay (Win/Loss Splash)
    STATUS_OVERLAY: 3000,

    // Critical Modals (Reset, Withdraw, Bankruptcy) - Must block everything
    CRITICAL_MODAL: 20000,

    // Toast Notifications (Usually defined in Toast container, but for reference)
    TOAST: 9999
}

export const COLORS = {
    GOLD: '#d4af37',
    RED: '#ff4444',
    GREEN: '#4caf50',
    BLUE: '#2196f3',
    DARK_BG: 'rgba(0, 0, 0, 0.9)'
}
