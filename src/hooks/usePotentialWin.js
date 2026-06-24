import { useState, useEffect } from 'react'
import { calculateMaxPotentialWin, calculateWinnings } from '../logic/RouletteUtils'

/**
 * Hook to calculate and track potential winnings based on current bets and hover state.
 */
export const usePotentialWin = (currentBets, hoveredNumbers) => {
    const [potentialWin, setPotentialWin] = useState(0)
    const [bestPayout, setBestPayout] = useState({ amount: 0, numbers: [] })

    useEffect(() => {
        if (Object.keys(currentBets).length > 0) {
            const { maxWin, bestNumbers } = calculateMaxPotentialWin(currentBets)
            setBestPayout({ amount: maxWin, numbers: bestNumbers })

            // Check hover for interactive feedback
            if (hoveredNumbers && hoveredNumbers.length > 0) {
                // Iterate through all hovered numbers to find the Max Potential Win in that zone
                let maxWinInZone = 0
                hoveredNumbers.forEach(num => {
                    const w = calculateWinnings(num, currentBets)
                    if (w > maxWinInZone) maxWinInZone = w
                })
                setPotentialWin(maxWinInZone)
            } else {
                setPotentialWin(0) // Reset hover
            }
        } else {
            setBestPayout({ amount: 0, numbers: [] })
            setPotentialWin(0)
        }
    }, [currentBets, hoveredNumbers])

    return {
        potentialWin,
        bestPayout
    }
}
