import { useEffect } from 'react'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { useToastStore } from '../logic/ToastStore'

/**
 * Hook to handle Forensic System tasks:
 * - Crash Recovery (Restoring bets from localStorage)
 * - Real-time Persistence (Syncing bets to store)
 * - Bankruptcy Monitoring
 */
export const useForensicSystem = (currentBets, setCurrentBets, balance, isSpinning) => {
    // Store Actions
    const addToast = useToastStore(state => state.addToast)
    const matchActiveBets = useFinancialStore(state => state.matchActiveBets)
    const storedActiveBets = useFinancialStore(state => state.activeBets)

    // 1. CRASH RECOVERY: Restore bets if any exist in persistent storage
    useEffect(() => {
        if (storedActiveBets && Object.keys(storedActiveBets).length > 0) {
            console.log("♻️ FORENSIC RECOVERY: Restoring active bets from crash/reload", storedActiveBets)
            setCurrentBets(storedActiveBets)
            addToast("Sesión Restaurada: Apuestas recuperadas", "info")
        }
    }, []) // Run once on mount

    // 2. CRASH PROTECTION SYNC: Sync active bets to store
    useEffect(() => {
        matchActiveBets(currentBets)
    }, [currentBets, matchActiveBets])

    // 3. BANKRUPTCY MONITOR
    // Returns true if bankruptcy modal should be shown
    const shouldShowBankruptcy = () => {
        // If balance is 0, no bets on table, and not spinning
        return (balance <= 0 && Object.keys(currentBets).length === 0 && !isSpinning)
    }

    return {
        shouldShowBankruptcy
    }
}
