import { create } from 'zustand'
import { getBetGroups, ALL_BET_IDS } from './RouletteUtils'

// Initialize counters: everything starts at 0 wait (or N/A).
// Actually, 'wait' means how many spins SINCE it appeared.
// If we start fresh, we don't know the wait. We'll start at 0.
const initialWaits = {}
ALL_BET_IDS.forEach(id => initialWaits[id] = 0)
for (let i = 0; i <= 36; i++) initialWaits[`NUMBER_${i}`] = 0

export const useStatTracker = create((set) => ({
    history: [],
    waits: initialWaits,

    // Main action: Record a new result
    addResult: (number) => {
        set(state => {
            const newHistory = [number, ...state.history]
            const hitGroups = getBetGroups(number)
            hitGroups.push(`NUMBER_${number}`) // The number itself

            const newWaits = { ...state.waits }

            // Update logic:
            // For every known ID:
            // If it was hit -> wait resets to 0
            // If it wasn't hit -> wait increments by 1

            // Optimization: Increment ALL first, then reset hits.
            Object.keys(newWaits).forEach(key => {
                newWaits[key] += 1
            })

            hitGroups.forEach(group => {
                newWaits[group] = 0
            })

            return {
                history: newHistory,
                waits: newWaits
            }
        })
    },

    resetStats: () => set({ history: [], waits: initialWaits })
}))
