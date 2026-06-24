// Coordinates optimized for 1920x1080 Full Screen
// "Elite Dashboard" Layout (Revised: Vertical Banking Reversion)

export const ELITE_LAYOUT = {
    // 1. Core Elements (Centered Axis)
    wheel: { x: 710, y: 100 },      // Centered Top (Width 500) -> Center X=960
    board: { x: 555, y: 640 },      // Centered Bottom (Width ~810) -> Center X=960

    // 2. HUD Panels (Vertical Banking is Back!)
    banking: { x: 20, y: 600 },     // Left Vertical Tower (Width ~240, Height ~400)
    telemetry: { x: 1550, y: 880 }, // Bottom Right (Horizontal Panel)

    // 3. Header Items (TopBar is Fixed)
    clock: { x: 1700, y: 20 },
    spinCounter: { x: 1550, y: 20 },

    // 4. Floating Tools
    racetrack: { x: 20, y: 100 },     // Top Left Wing
    statistics: { x: 1450, y: 100 },  // Top Right Wing
    paytable: { x: 1850, y: 100 },    // Far Right edge

    // 5. Modals/Popups
    detailedHistory: { x: 1250, y: 120 },

    // 6. Controls
    chipSelector: { x: 760, y: 920 }, // Centered Bottom (Width ~400)
    currency: { x: 300, y: 920 }      // Bottom Left (Next to Chips)
}

export const getDefaultLayout = () => JSON.parse(JSON.stringify(ELITE_LAYOUT))
