/**
 * FinancialStateValidator - Validación de datos con Zod
 *
 * Valida el estado de FinancialSimulator antes de cargar desde localStorage.
 * Previene crashes causados por datos corruptos.
 *
 * Uso:
 * - En FinancialSimulator.js en onRehydrateStorage
 * - Llamar: const isValid = validateFinancialState(state)
 */

import { z } from 'zod'

/**
 * Schema de validación del estado financiero
 * Define la estructura esperada y tipos para cada campo
 */
const FinancialStateSchema = z.object({
  // Estado básico
  sessionStart: z.number().int().positive('sessionStart debe ser un timestamp válido'),
  gameMode: z.enum(['REAL', 'DEMO'], {
    errorMap: () => ({ message: 'gameMode debe ser REAL o DEMO' })
  }),

  // Capitales
  realCapital: z.number().min(0, 'realCapital no puede ser negativo'),
  demoCapital: z.number().min(0, 'demoCapital no puede ser negativo'),

  // Límites de parada
  targetProfit: z.number().min(0, 'targetProfit no puede ser negativo').optional().default(0),
  stopLossLimit: z.number().min(0, 'stopLossLimit no puede ser negativo').optional().default(0),

  // Estadísticas
  peakCapital: z.number().min(0, 'peakCapital no puede ser negativo'),
  netProfit: z.number('netProfit debe ser un número'),
  totalSpins: z.number().int().min(0, 'totalSpins no puede ser negativo').default(0),
  currentRoundBet: z.number().min(0, 'currentRoundBet no puede ser negativo'),
  initialCapital: z.number().min(0, 'initialCapital no puede ser negativo').optional(),
  lastActionTime: z.number().int().optional(),
  totalIdleTime: z.number().min(0).optional(),
  baseWaitThreshold: z.number().int().min(1, 'baseWaitThreshold debe ser al menos 1').default(300),

  // Historiales (arrays)
  numberHistory: z.array(
    z.number().int().min(0).max(36, 'Número de ruleta debe estar entre 0-36')
  ).default([]),

  roundHistory: z.array(
    z.object({
      id: z.number().int().positive().optional(),
      spin: z.number().int().min(0).optional(),
      timestamp: z.number().int().positive(),
      winningNumber: z.number().int().min(0).max(36).optional(),
      bets: z.record(z.string(), z.number()).optional().default({}),
      totalBet: z.number().min(0),
      totalWin: z.number().min(0),
      netResult: z.number(),
      balanceAfter: z.number().min(0),
      mode: z.enum(['REAL', 'DEMO']).optional()
    })
  ).default([]),

  history: z.array(z.unknown()).default([]),

  transactionLog: z.array(
    z.object({
      id: z.number().int().positive(),
      time: z.string(),
      type: z.enum(['DEPOSIT', 'BET', 'WIN', 'LOSS', 'REFUND', 'WITHDRAW', 'WITHDRAWAL']),
      amount: z.number(),
      detail: z.string(),
      balanceAfter: z.number().min(0)
    })
  ).default([])
})

/**
 * Validar estado financiero
 * @param {unknown} state - Estado a validar
 * @returns {Object} { isValid: boolean, errors?: string[], data?: cleanData }
 */
export const validateFinancialState = (state) => {
  try {
    // Si state es null/undefined, inicializar
    if (!state) {
      return {
        isValid: false,
        reason: 'Estado nulo o indefinido'
      }
    }

    // Parsear si es string (localStorage devuelve strings)
    let parsedState = state
    if (typeof state === 'string') {
      parsedState = JSON.parse(state)
    }

    // Validar con schema
    const result = FinancialStateSchema.safeParse(parsedState)

    if (!result.success) {
      const errors = result.error.errors.map(err =>
        `${err.path.join('.')}: ${err.message}`
      )
      return {
        isValid: false,
        reason: 'Validación fallida',
        errors
      }
    }

    // Todo válido
    return {
      isValid: true,
      data: result.data
    }
  } catch (error) {
    return {
      isValid: false,
      reason: `Error durante validación: ${error.message}`
    }
  }
}

/**
 * Crear estado inicial válido como fallback
 * @returns {Object} Estado inicial limpio
 */
export const createInitialFinancialState = () => ({
  sessionStart: Date.now(),
  gameMode: 'REAL',
  realCapital: 0,
  demoCapital: 1000, // Demo comienza con 1000
  targetProfit: 0,
  stopLossLimit: 0,
  peakCapital: 0,
  netProfit: 0,
  totalSpins: 0,
  currentRoundBet: 0,
  initialCapital: 0,
  lastActionTime: Date.now(),
  totalIdleTime: 0,
  numberHistory: [],
  roundHistory: [],
  history: [],
  transactionLog: [],
  baseWaitThreshold: 300
})

/**
 * Limpiar datos corruptos manteniendo lo que se pueda salvar
 * @param {Object} state - Estado parcialmente válido
 * @returns {Object} Estado limpio
 */
export const sanitizeFinancialState = (state) => {
  const initial = createInitialFinancialState()

  if (!state || typeof state !== 'object') {
    return initial
  }

  // Intentar mantener campos válidos
  const sanitized = {
    ...initial,
    ...(typeof state.sessionStart === 'number' && state.sessionStart > 0
      ? { sessionStart: state.sessionStart }
      : {}),
    ...(state.gameMode === 'REAL' || state.gameMode === 'DEMO'
      ? { gameMode: state.gameMode }
      : {}),
    ...(typeof state.realCapital === 'number' && state.realCapital >= 0
      ? { realCapital: state.realCapital }
      : {}),
    ...(typeof state.demoCapital === 'number' && state.demoCapital >= 0
      ? { demoCapital: state.demoCapital }
      : {}),
    ...(typeof state.targetProfit === 'number' && state.targetProfit >= 0
      ? { targetProfit: state.targetProfit }
      : { targetProfit: 0 }),
    ...(typeof state.stopLossLimit === 'number' && state.stopLossLimit >= 0
      ? { stopLossLimit: state.stopLossLimit }
      : { stopLossLimit: 0 }),
    ...(typeof state.totalSpins === 'number' && state.totalSpins >= 0
      ? { totalSpins: state.totalSpins }
      : {}),
    ...(Array.isArray(state.numberHistory)
      ? { numberHistory: state.numberHistory.filter(n => n >= 0 && n <= 36) }
      : {}),
    ...(Array.isArray(state.roundHistory)
      ? { roundHistory: state.roundHistory }
      : {}),
    ...(Array.isArray(state.transactionLog)
      ? { transactionLog: state.transactionLog.slice(-100) } // Último 100
      : {}),
    ...(typeof state.baseWaitThreshold === 'number' && state.baseWaitThreshold >= 1
      ? { baseWaitThreshold: state.baseWaitThreshold }
      : { baseWaitThreshold: 300 })
  }

  return sanitized
}

export default {
  validateFinancialState,
  createInitialFinancialState,
  sanitizeFinancialState
}
