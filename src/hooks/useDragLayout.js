import { useState } from 'react'
import { useToastStore } from '../logic/ToastStore'

// DEFAULT POSITIONS (Updated to User-Defined "Gold Master" Layout v9)
const DEFAULT_POSITIONS = {
    paytable: { x: 20, y: 20 },
    layoutControls: { x: 80, y: 18 },
    history: { x: 876, y: 703 },
    statistics: { x: 1972, y: 35 },
    opportunity: { x: 393, y: 18 },
    telemetry: { x: 34, y: 921 },
    wheel: { x: 20, y: 80 },
    racetrack: { x: 20, y: 687 },
    banking: { x: 1578, y: 35 },
    clock: { x: 1255, y: 679 },
    projections: { x: 553, y: 700 },
    win: { x: 1550, y: 400 },
    board: { x: 626, y: 117 },
    controls: { x: 629, y: 521 },
    autoplay: { x: 676, y: 44 },
    chips: { x: 1172, y: 513 },
    spinCounter: { x: 1450, y: 20 },
    detailedHistory: { x: 1700, y: 300 },
    activeBets: { x: 20, y: 500 }, // New Panel
    title: { x: 700, y: 20, w: 500, h: 80 },
    modeToggle: { x: 800, y: 20 },
    // Control Icons (Draggable) - Relocated to Top Header (Far from Table)
    dollarIcon: { x: 1220, y: 30 },

    methodsIcon: { x: 1320, y: 30 },
    scannerIcon: { x: 1420, y: 30 }, // Next to Methods
    toolBox: { x: 20, y: 550 }
}

export const useDragLayout = () => {
    const addToast = useToastStore(state => state.addToast)
    const [isEditMode, setIsEditMode] = useState(false)
    const [showLayoutHelp, setShowLayoutHelp] = useState(false)

    // Load positions from localStorage or default
    const [positions, setPositions] = useState(() => {
        try {
            const saved = localStorage.getItem('casinoLayout_v11')
            if (saved) {
                const parsed = JSON.parse(saved)
                // SANITY CHECK
                if (parsed.wheel && parsed.wheel.x === 0 && parsed.wheel.y === 0) return DEFAULT_POSITIONS
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
            localStorage.setItem('casinoLayout_v11', JSON.stringify(next))
            return next
        })
    }

    const resetLayout = () => {
        if (confirm("¿Restaurar diseño de fábrica?")) {
            setPositions(DEFAULT_POSITIONS)
            localStorage.removeItem('casinoLayout_v11')
        }
    }

    const handleSaveLayout = async () => {
        const dataStr = JSON.stringify(positions, null, 2)
        const now = new Date()
        const timestamp = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + '_' + String(now.getHours()).padStart(2, '0') + '-' + String(now.getMinutes()).padStart(2, '0') + '-' + String(now.getSeconds()).padStart(2, '0')
        const suggestedName = `GHR_Ruleta_Royale_${timestamp}.json`

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
                const parsed = JSON.parse(event.target.result)
                if (parsed && typeof parsed === 'object') {
                    setPositions(prev => ({ ...prev, ...parsed }))
                    localStorage.setItem('casinoLayout_v11', JSON.stringify({ ...positions, ...parsed }))
                    addToast("Diseño cargado exitosamente", "success")
                } else {
                    addToast("Archivo de diseño inválido", "error")
                }
            } catch (err) {
                console.error("Load Layout Error", err)
                addToast("Error al cargar el diseño", "error")
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
