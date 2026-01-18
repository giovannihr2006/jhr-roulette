/**
 * GHR Ruleta Royale - Roulette Game Module
 * 
 * This folder structure prepares for multiple game types.
 * Currently only roulette is implemented.
 */

// Re-export main game components for this game type
export { CasinoTable } from '../../components/CasinoTable'
export { RouletteWheel } from '../../components/RouletteWheel'
export { BettingBoard } from '../../components/BettingBoard'

// Game configuration
export const GAME_INFO = {
    id: 'european-roulette',
    name: 'Ruleta Europea',
    version: '1.1.0',
    type: 'table',
    minPlayers: 1,
    maxPlayers: 1
}
