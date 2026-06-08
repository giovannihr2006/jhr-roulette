import { useState } from 'react'
import { useToastStore } from '../logic/ToastStore'

// --- GHR RULETA ROYAL GOLD SNAPSHOT V6.0 FORENSIC DASHBOARD ---
const DEFAULT_POSITIONS = {
    // --- LAYOUT CAPAS PRINCIPALES (Layer 1 - Permanentes) ---
    "title": { "x": 10, "y": 8, "w": 400, "h": 70, "scale": 0.65 },
    "fullscreenIcon": { "x": 10, "y": 80, "w": 110, "h": 24, "scale": 0.65 },
    "layoutControls": { "x": 130, "y": 80, "scale": 0.65 },
    "modeToggle": { "x": 580, "y": 20, "scale": 0.65 },

    // Rueda Clásica (Cilindro) -> Preponderante a la izquierda
    "wheel": { "x": 10, "y": 125, "w": 480, "h": 480, "scale": 0.95 },

    // Mesa de Apuestas (Paño/Tablero) -> Centrada
    "board": { "x": 505, "y": 125, "w": "auto", "h": "auto", "scale": 0.8 },

    // Fichas y Controles
    "controls": { "x": 505, "y": 500, "w": 380, "h": 90, "scale": 0.8 },
    "chips": { "x": 895, "y": 500, "w": 140, "h": 90, "scale": 0.8 },
    "eliteSystems": { "x": 10, "y": 605, "w": 1025, "h": 90, "scale": 0.95 },

    // --- PANEL DE CONTROL FORENSE MULTICAPA (Capa 2 & Capa 3) ---
    "sidebar": { "x": 1050, "y": 10, "w": 520, "h": 730, "scale": 0.95 },

    // --- ELEMENTOS CONSOLIDADOS (Posiciones de Respaldo Off-Screen) ---
    "racetrack": { "x": -999, "y": -999 },
    "telemetry": { "x": -999, "y": -999 },
    "unifiedDashboard": { "x": -999, "y": -999 },
    "history": { "x": -999, "y": -999 },
    "auditTowerWidget": { "x": -999, "y": -999 },
    "timeManagement": { "x": -999, "y": -999 },
    "systemsWidget": { "x": -999, "y": -999 },
    "opportunity": { "x": -999, "y": -999 },
    "internalScannerWidget": { "x": -999, "y": -999 },
    "methodsWidget": { "x": -999, "y": -999 },
    "alphaWidget": { "x": -999, "y": -999 },
    "strategyMonitorWidget": { "x": -999, "y": -999 },
    "forensicManualButton": { "x": -999, "y": -999 },
    "paytable": { "x": -999, "y": -999 },
    "clock": { "x": -999, "y": -999 },
    "activeBets": { "x": -999, "y": -999 },
    "activeBetsIcon": { "x": -999, "y": -999 },
    "spinCounter": { "x": -999, "y": -999 },
    "detailedHistory": { "x": -999, "y": -999 },
    "oldestStreets": { "x": -999, "y": -999 },
    "oldestLines": { "x": -999, "y": -999 },
    "chipEconomyIcon": { "x": -999, "y": -999 },
    "chipEconomyModal": { "x": -999, "y": -999 },
    "forensicSentinel": { "x": -999, "y": -999 },
    "graphLauncher": { "x": -999, "y": -999 },
    "methodsTableLauncher": { "x": -999, "y": -999 },
    "systemsTableLauncher": { "x": -999, "y": -999 }
}

const STORAGE_KEY = 'casinoLayout_GHR_FORENSIC_V60_TABBED_SIDEBAR'

export const useDragLayout = () => {
    const addToast = useToastStore(state => state.addToast)
    const [isEditMode, setIsEditMode] = useState(false)
    const [showLayoutHelp, setShowLayoutHelp] = useState(false)

    // Load positions from localStorage or default
    const [positions, setPositions] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                if (parsed.sidebar) {
                    parsed.sidebar.w = 520
                }
                return { ...DEFAULT_POSITIONS, ...parsed }
            }
            return DEFAULT_POSITIONS
        } catch (e) {
            console.warn("Failed to load layout", e)
            return DEFAULT_POSITIONS
        }
    })

    const onUpdatePos = (id, newPos) => {
        if (!newPos || isNaN(newPos.x) || isNaN(newPos.y)) return

        setPositions(prev => {
            const next = { ...prev, [id]: newPos }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            return next
        })
    }

    const resetLayout = () => {
        if (confirm("¿Restaurar diseño de fábrica?")) {
            setPositions(DEFAULT_POSITIONS)
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    const handleSaveLayout = async (forceAuto = false) => {
        const dataStr = JSON.stringify(positions, null, 2)
        const now = new Date()
        const dd = String(now.getDate()).padStart(2, '0')
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const aaaa = now.getFullYear()
        const hh = String(now.getHours()).padStart(2, '0')
        const min = String(now.getMinutes()).padStart(2, '0')

        const timestamp = `${dd}${mm}${aaaa}${hh}${min}`
        const suggestedName = `GHR RULETA ROYAL ${timestamp}.json`

        // CHECK IF AUTO BACKUP (Ignore event objects from clicks)
        const isAuto = typeof forceAuto === 'boolean' && forceAuto;

        if (isAuto) {
            // DIRECT DOWNLOAD (No Prompts)
            try {
                const blob = new Blob([dataStr], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.download = suggestedName
                link.href = url
                document.body.appendChild(link) // Required for Firefox sometimes
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                // Play explicit layout save sound if available or just toast
                addToast(`Backup Guardado: ${suggestedName}`, "success")
            } catch (e) {
                console.error("Auto Backup Failed", e)
                addToast("Error creando backup automático", "error")
            }
            return
        }

        // MANUAL SAVE (Prompts)
        try {
            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: suggestedName,
                    types: [{ description: 'GHR Layout File', accept: { 'application/json': ['.json'] } }],
                })
                const writable = await handle.createWritable()
                await writable.write(dataStr)
                await writable.close()
                addToast("Diseño guardado exitosamente", "success")
            } else {
                const fileName = prompt("Nombre del archivo:", suggestedName)
                if (!fileName) return
                const blob = new Blob([dataStr], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.download = fileName.endsWith('.json') ? fileName : `${fileName}.json`
                link.href = url
                link.click()
                addToast("Diseño guardado exitosamente", "success")
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err)
                addToast("Error al guardar el diseño", "error")
            }
        }
    }

    const handleLoadLayout = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const raw = JSON.parse(event.target.result)
                if (!raw || typeof raw !== 'object') {
                    addToast("Archivo corrupto o inválido", "error")
                    return
                }

                // LAYER 1: FALLBACK TO FACTORY DEFAULTS
                // We start with a clean default slate to ensure no missing keys
                const secureLayout = { ...DEFAULT_POSITIONS }

                // LAYER 2: VALIDATION & SANITIZATION LOOP
                Object.keys(DEFAULT_POSITIONS).forEach(key => {
                    if (raw[key]) {
                        // Inherit from backup
                        const candidate = { ...raw[key] }

                        // SECURITY: Clamp Coordinates to prevent "Lost in Space"
                        // Ensure it's a number, otherwise revert to default
                        const safeX = isNaN(Number(candidate.x)) ? DEFAULT_POSITIONS[key].x : Number(candidate.x)
                        const safeY = isNaN(Number(candidate.y)) ? DEFAULT_POSITIONS[key].y : Number(candidate.y)

                        // Viewport Safety: Prevent extreme negatives
                        // Allow some negative for "peeking" but not beyond -500
                        secureLayout[key] = {
                            ...candidate,
                            x: Math.max(-200, safeX),
                            y: Math.max(-200, safeY)
                        }
                        if (key === 'sidebar') {
                            secureLayout[key].w = 520
                        }
                    } else {
                        // Key missing in backup? Keep default!
                        // This prevents crashes if a new element is added to app but not in old backup
                        console.warn(`Restoring missing key: ${key}`)
                    }
                })

                // LAYER 3: ATOMIC PERSISTENCE
                // Verify one last time before committing
                if (secureLayout.wheel && secureLayout.board) {
                    setPositions(secureLayout)
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(secureLayout))
                    addToast("Diseño Restaurado (Verificado)", "success")
                } else {
                    addToast("Error de integridad en backup", "error")
                }

            } catch (err) {
                console.error("Load Layout Error", err)
                addToast("Error crítico al cargar diseño", "error")
            }
        }
        reader.readAsText(file)
    }

    return {
        positions,
        onUpdatePos,
        isEditMode,
        setIsEditMode,
        resetLayout,
        handleSaveLayout,
        handleLoadLayout,
        showLayoutHelp,
        setShowLayoutHelp
    }
}
