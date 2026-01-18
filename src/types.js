/**
 * @fileoverview JSDoc Type Definitions for GHR Ruleta Royale
 * This file provides type definitions for better IDE support and documentation.
 */

// ============================================================================
// GAME TYPES
// ============================================================================

/**
 * @typedef {'REAL' | 'DEMO'} GameMode
 * The current game mode - REAL uses actual balance, DEMO uses virtual funds
 */

/**
 * @typedef {0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36} RouletteNumber
 * Valid roulette numbers (0-36 for European roulette)
 */

/**
 * @typedef {'RED' | 'BLACK' | 'EVEN' | 'ODD' | 'LOW' | 'HIGH'} SimpleChance
 * Simple chance bet types (1:1 payout)
 */

/**
 * @typedef {'DOZ1' | 'DOZ2' | 'DOZ3'} DozenBet
 * Dozen bet types (2:1 payout)
 */

/**
 * @typedef {'COL1' | 'COL2' | 'COL3'} ColumnBet
 * Column bet types (2:1 payout)
 */

/**
 * @typedef {string} BetId
 * Bet identifier - can be a number (0-36), simple chance, dozen, column,
 * or complex bet (SPLIT_1_4, CORNER_1_2_4_5, STREET_1, LINE_1, etc.)
 */

// ============================================================================
// FINANCIAL TYPES
// ============================================================================

/**
 * @typedef {Object} Transaction
 * @property {string} type - Transaction type ('BET', 'WIN', 'RELOAD', 'WITHDRAW', 'REFUND')
 * @property {number} amount - Amount in credits
 * @property {number} timestamp - Unix timestamp
 * @property {string} [description] - Optional description
 */

/**
 * @typedef {Object} RoundResult
 * @property {RouletteNumber} winningNumber - The winning number
 * @property {number} totalBet - Total amount bet
 * @property {number} totalWin - Total amount won
 * @property {number} netResult - Net profit/loss (totalWin - totalBet)
 * @property {number} balanceAfter - Balance after the round
 * @property {number} timestamp - Unix timestamp
 */

/**
 * @typedef {Object} FinancialState
 * @property {GameMode} mode - Current game mode
 * @property {number} balance - Current balance (REAL mode)
 * @property {number} demoBalance - Current balance (DEMO mode)
 * @property {number} initialCapital - Initial deposit amount
 * @property {number} totalWagered - Total amount wagered
 * @property {number} totalWon - Total amount won
 * @property {number} totalDeposited - Total amount deposited
 * @property {number} totalWithdrawn - Total amount withdrawn
 * @property {number} totalSpins - Total number of spins
 * @property {number} sessionStart - Session start timestamp
 * @property {RouletteNumber[]} numberHistory - History of winning numbers
 * @property {RoundResult[]} roundHistory - History of round results
 * @property {Transaction[]} transactionLog - Log of all transactions
 */

// ============================================================================
// BET TYPES
// ============================================================================

/**
 * @typedef {Object.<BetId, number>} CurrentBets
 * Map of bet IDs to amounts
 */

/**
 * @typedef {Object} BetInfo
 * @property {BetId} id - Bet identifier
 * @property {number} amount - Bet amount
 * @property {number} payout - Payout multiplier
 * @property {RouletteNumber[]} numbers - Numbers covered by this bet
 */

/**
 * @typedef {Object} BetValidation
 * @property {boolean} success - Whether the bet is valid
 * @property {string} [error] - Error message if invalid
 * @property {number} [minBet] - Minimum bet amount
 * @property {number} [maxBet] - Maximum bet amount
 */

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * @typedef {Object} RouletteWheelProps
 * @property {number} [wheelRotation=0] - Current wheel rotation in degrees
 * @property {number} [ballRotation=0] - Current ball rotation in degrees
 * @property {boolean} [showBall=false] - Whether to show the ball
 * @property {RouletteNumber[]} [highlightedNumbers=[]] - Numbers to highlight
 * @property {RouletteNumber[]} [placedNumbers=[]] - Numbers with bets
 * @property {number} [size=600] - Size of the wheel in pixels
 * @property {RouletteNumber|null} [lastWin=null] - Last winning number
 * @property {boolean} [isLiveMode=false] - Whether in live input mode
 * @property {function(RouletteNumber): void} [onManualWin] - Handler for manual win input
 */

/**
 * @typedef {Object} BettingBoardProps
 * @property {CurrentBets} bets - Current bets object
 * @property {function(BetId, number): void} onPlaceBet - Handler for placing a bet
 * @property {function(BetId[]): void} [onBatchBet] - Handler for batch bets
 * @property {RouletteNumber|null} [lastWin] - Last winning number
 * @property {function(RouletteNumber[]): void} [onHoverNumbers] - Handler for hover highlight
 * @property {RouletteNumber[]} [history] - Number history for statistics
 */

/**
 * @typedef {Object} ChipSelectorProps
 * @property {number} selectedChip - Currently selected chip value
 * @property {function(number): void} onSelectChip - Handler for chip selection
 */

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * @typedef {Object} Position
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} DragLayoutPosition
 * @property {Position} position - Current position
 * @property {number} [width] - Optional width
 * @property {number} [height] - Optional height
 */

/**
 * @typedef {Object.<string, DragLayoutPosition>} LayoutPositions
 * Map of element IDs to their positions
 */

// Export for JSDoc references
export const Types = {}
