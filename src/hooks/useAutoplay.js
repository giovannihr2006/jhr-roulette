import { useState, useEffect } from 'react'
import { useToastStore } from '../logic/ToastStore' // Fixed import path from CasinoTable
// Note: CasinoTable imported from logic/ToastStore as 'useToastStore' is exported there?
// CasinoTable imports: import { useToastStore } from '../logic/ToastStore'
// Wait, looking at CasinoTable.jsx imports in previous view_file:
// Line 51: import { useToastStore } from '../logic/ToastStore'
// But wait, line 7 in useForensicSystem I used '../components/ToastSystem' - I might have guessed wrong there or CasinoTable has mixed imports.
// Let's verify ToastStore path. In CasinoTable it is '../logic/ToastStore'.

/**
 * Hook to handle Autoplay logic.
 * Manages the countdown and automatic interaction with game controls.
 */
export const useAutoplay = (isSpinning, currentBets, lastBets, handleRepeat, handleSpin) => {
    const [autoPlayCount, setAutoPlayCount] = useState(0)
    const addToast = useToastStore(state => state.addToast)

    useEffect(() => {
        if (!isSpinning && autoPlayCount > 0) {
            const timer = setTimeout(() => {
                // 1. Repeat Bets if table is empty but we have history
                if (Object.keys(currentBets).length === 0 && Object.keys(lastBets).length > 0) {
                    handleRepeat()
                } else if (Object.keys(currentBets).length === 0) {
                    // No bets to repeat and empty table? Stop.
                    addToast("Autoplay detenido: No hay apuestas para repetir", "error")
                    setAutoPlayCount(0)
                    return
                }

                // 2. Spin
                // Ensure we call spin only if valid
                handleSpin()

                // 3. Decrement
                setAutoPlayCount(prev => prev - 1)

            }, 2000) // 2 seconds between spins
            return () => clearTimeout(timer)
        }
    }, [isSpinning, autoPlayCount, currentBets, lastBets, handleRepeat, handleSpin, addToast])

    return {
        autoPlayCount,
        setAutoPlayCount
    }
}
