/**
 * RouletteUtils.test.js
 * Tests unitarios para las funciones de lógica de ruleta
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
    calculateWinnings,
    getCoveredNumbers,
    calculateCoverage,
    calculateMaxPotentialWin,
    RED_NUMBERS,
    ROULETTE_NUMBERS,
    getBetGroups,
    ALL_SPLITS,
    ALL_STREETS,
    ALL_CORNERS,
    ALL_LINES
} from '../logic/RouletteUtils'

// ============================================
// CONSTANTES DE REFERENCIA
// ============================================
describe('Constantes de Ruleta', () => {
    it('ROULETTE_NUMBERS debe tener 37 números (0-36)', () => {
        expect(ROULETTE_NUMBERS).toHaveLength(37)
        expect(ROULETTE_NUMBERS).toContain(0)
        expect(ROULETTE_NUMBERS).toContain(36)
    })

    it('RED_NUMBERS debe tener 18 números rojos', () => {
        expect(RED_NUMBERS).toHaveLength(18)
        expect(RED_NUMBERS).toContain(1)
        expect(RED_NUMBERS).toContain(36)
        expect(RED_NUMBERS).not.toContain(0)
        expect(RED_NUMBERS).not.toContain(2) // 2 es negro
    })

    it('ALL_SPLITS debe contener splits válidos incluyendo zero splits', () => {
        expect(ALL_SPLITS.length).toBeGreaterThan(50)
        // Zero splits
        const zeroSplits = ALL_SPLITS.filter(s => s.numbers.includes(0))
        expect(zeroSplits.length).toBe(3) // 0-1, 0-2, 0-3
    })

    it('ALL_STREETS debe tener 12 calles principales + 2 del cero', () => {
        expect(ALL_STREETS.length).toBe(14)
    })

    it('ALL_CORNERS debe incluir la canasta 0-1-2-3', () => {
        const basket = ALL_CORNERS.find(c => c.name.includes('Canasta'))
        expect(basket).toBeDefined()
        expect(basket.numbers).toEqual([0, 1, 2, 3])
    })

    it('ALL_LINES debe tener 11 seisenas', () => {
        expect(ALL_LINES.length).toBe(11)
    })
})

// ============================================
// getBetGroups
// ============================================
describe('getBetGroups', () => {
    it('debe retornar ZERO para el número 0', () => {
        const groups = getBetGroups(0)
        expect(groups).toEqual(['ZERO'])
    })

    it('debe clasificar el número 1 correctamente (rojo, impar, bajo)', () => {
        const groups = getBetGroups(1)
        expect(groups).toContain('COLOR_RED')
        expect(groups).toContain('ODD')
        expect(groups).toContain('LOW_18')
        expect(groups).toContain('DOZEN_1')
        expect(groups).toContain('COLUMN_1')
    })

    it('debe clasificar el número 36 correctamente (rojo, par, alto)', () => {
        const groups = getBetGroups(36)
        expect(groups).toContain('COLOR_RED')
        expect(groups).toContain('EVEN')
        expect(groups).toContain('HIGH_18')
        expect(groups).toContain('DOZEN_3')
        expect(groups).toContain('COLUMN_3')
    })

    it('debe clasificar el número 2 como negro', () => {
        const groups = getBetGroups(2)
        expect(groups).toContain('COLOR_BLACK')
    })
})

// ============================================
// calculateWinnings - APUESTAS SIMPLES
// ============================================
describe('calculateWinnings - Apuestas Simples', () => {
    it('debe pagar 35:1 en pleno (straight up)', () => {
        const bets = { '17': 100 }
        const winnings = calculateWinnings(17, bets)
        // 100 (apuesta) + 100 * 35 (ganancia) = 3600
        expect(winnings).toBe(3600)
    })

    it('debe retornar 0 si el pleno no gana', () => {
        const bets = { '17': 100 }
        const winnings = calculateWinnings(18, bets)
        expect(winnings).toBe(0)
    })

    it('debe pagar 1:1 en rojo cuando gana rojo', () => {
        const bets = { 'RED': 100 }
        const winnings = calculateWinnings(1, bets) // 1 es rojo
        expect(winnings).toBe(200) // 100 + 100*1
    })

    it('no debe pagar rojo cuando sale 0', () => {
        const bets = { 'RED': 100 }
        const winnings = calculateWinnings(0, bets)
        expect(winnings).toBe(0)
    })

    it('debe pagar 1:1 en negro cuando gana negro', () => {
        const bets = { 'BLACK': 100 }
        const winnings = calculateWinnings(2, bets) // 2 es negro
        expect(winnings).toBe(200)
    })

    it('debe pagar 1:1 en par cuando sale par', () => {
        const bets = { 'EVEN': 100 }
        const winnings = calculateWinnings(4, bets)
        expect(winnings).toBe(200)
    })

    it('no debe pagar par cuando sale 0', () => {
        const bets = { 'EVEN': 100 }
        const winnings = calculateWinnings(0, bets)
        expect(winnings).toBe(0)
    })

    it('debe pagar 1:1 en impar cuando sale impar', () => {
        const bets = { 'ODD': 100 }
        const winnings = calculateWinnings(5, bets)
        expect(winnings).toBe(200)
    })

    it('debe pagar 1:1 en bajos (1-18) cuando gana', () => {
        const bets = { 'LOW': 100 }
        const winnings = calculateWinnings(18, bets)
        expect(winnings).toBe(200)
    })

    it('debe pagar 1:1 en altos (19-36) cuando gana', () => {
        const bets = { 'HIGH': 100 }
        const winnings = calculateWinnings(19, bets)
        expect(winnings).toBe(200)
    })
})

// ============================================
// calculateWinnings - DOCENAS Y COLUMNAS
// ============================================
describe('calculateWinnings - Docenas y Columnas', () => {
    it('debe pagar 2:1 en primera docena (1-12)', () => {
        const bets = { 'DOZ1': 100 }
        const winnings = calculateWinnings(12, bets)
        expect(winnings).toBe(300) // 100 + 100*2
    })

    it('debe pagar 2:1 en segunda docena (13-24)', () => {
        const bets = { 'DOZ2': 100 }
        const winnings = calculateWinnings(13, bets)
        expect(winnings).toBe(300)
    })

    it('debe pagar 2:1 en tercera docena (25-36)', () => {
        const bets = { 'DOZ3': 100 }
        const winnings = calculateWinnings(36, bets)
        expect(winnings).toBe(300)
    })

    it('no debe pagar docena cuando sale 0', () => {
        const bets = { 'DOZ1': 100, 'DOZ2': 100, 'DOZ3': 100 }
        const winnings = calculateWinnings(0, bets)
        expect(winnings).toBe(0)
    })

    it('debe pagar 2:1 en primera columna (1,4,7...34)', () => {
        const bets = { 'COL1': 100 }
        const winnings = calculateWinnings(1, bets)
        expect(winnings).toBe(300)
    })

    it('debe pagar 2:1 en segunda columna (2,5,8...35)', () => {
        const bets = { 'COL2': 100 }
        const winnings = calculateWinnings(35, bets)
        expect(winnings).toBe(300)
    })

    it('debe pagar 2:1 en tercera columna (3,6,9...36)', () => {
        const bets = { 'COL3': 100 }
        const winnings = calculateWinnings(36, bets)
        expect(winnings).toBe(300)
    })
})

// ============================================
// calculateWinnings - APUESTAS COMBINADAS
// ============================================
describe('calculateWinnings - Apuestas Combinadas', () => {
    it('debe pagar 17:1 en split (medio)', () => {
        const bets = { 'SPLIT_1_2': 100 }
        const winnings = calculateWinnings(1, bets)
        expect(winnings).toBe(1800) // 100 + 100*17
    })

    it('debe pagar 17:1 en split cuando cae segundo número', () => {
        const bets = { 'SPLIT_1_2': 100 }
        const winnings = calculateWinnings(2, bets)
        expect(winnings).toBe(1800)
    })

    it('no debe pagar split cuando no cae ninguno', () => {
        const bets = { 'SPLIT_1_2': 100 }
        const winnings = calculateWinnings(3, bets)
        expect(winnings).toBe(0)
    })

    it('debe pagar 8:1 en corner (cuadro)', () => {
        const bets = { 'CORNER_1_2_4_5': 100 }
        const winnings = calculateWinnings(4, bets)
        expect(winnings).toBe(900) // 100 + 100*8
    })

    it('debe pagar 11:1 en street (calle)', () => {
        const bets = { 'STREET_1': 100 }
        const winnings = calculateWinnings(2, bets) // 1, 2, 3 están en calle 1
        expect(winnings).toBe(1200) // 100 + 100*11
    })

    it('debe pagar 5:1 en line (seisena)', () => {
        const bets = { 'LINE_1': 100 }
        const winnings = calculateWinnings(6, bets) // 1-6 están en línea 1
        expect(winnings).toBe(600) // 100 + 100*5
    })

    it('debe pagar 11:1 en trio', () => {
        const bets = { 'TRIO_0_1_2': 100 }
        const winnings = calculateWinnings(0, bets)
        expect(winnings).toBe(1200)
    })

    it('debe pagar 8:1 en basket (canasta)', () => {
        const bets = { 'BASKET_0_1_2_3': 100 }
        const winnings = calculateWinnings(3, bets)
        expect(winnings).toBe(900)
    })
})

// ============================================
// calculateWinnings - MÚLTIPLES APUESTAS
// ============================================
describe('calculateWinnings - Múltiples Apuestas', () => {
    it('debe sumar ganancias de múltiples apuestas ganadoras', () => {
        const bets = {
            '17': 100,  // Pleno en 17 -> 3600
            'BLACK': 50, // Negro -> 100
            'ODD': 50    // Impar -> 100
        }
        const winnings = calculateWinnings(17, bets)
        // 17 es negro e impar
        expect(winnings).toBe(3600 + 100 + 100)
    })

    it('debe manejar apuestas mixtas correctamente', () => {
        const bets = {
            'RED': 100,   // Pierde
            '17': 50,     // Gana 35:1 = 1800
            'DOZ2': 100   // Gana 2:1 = 300 (17 está en docena 2)
        }
        const winnings = calculateWinnings(17, bets)
        expect(winnings).toBe(1800 + 300)
    })
})

// ============================================
// getCoveredNumbers
// ============================================
describe('getCoveredNumbers', () => {
    it('debe retornar array vacío para apuestas vacías', () => {
        const covered = getCoveredNumbers({})
        expect(covered).toEqual([])
    })

    it('debe retornar el número para apuesta pleno', () => {
        const covered = getCoveredNumbers({ '17': 100 })
        expect(covered).toContain(17)
        expect(covered).toHaveLength(1)
    })

    it('debe retornar 18 números para apuesta rojo', () => {
        const covered = getCoveredNumbers({ 'RED': 100 })
        expect(covered).toHaveLength(18)
        expect(covered).toContain(1)
        expect(covered).not.toContain(0)
        expect(covered).not.toContain(2)
    })

    it('debe retornar 18 números para apuesta negro', () => {
        const covered = getCoveredNumbers({ 'BLACK': 100 })
        expect(covered).toHaveLength(18)
        expect(covered).toContain(2)
        expect(covered).not.toContain(1)
    })

    it('debe retornar 12 números para docena', () => {
        const covered = getCoveredNumbers({ 'DOZ1': 100 })
        expect(covered).toHaveLength(12)
        expect(covered).toContain(1)
        expect(covered).toContain(12)
        expect(covered).not.toContain(13)
    })

    it('debe retornar 12 números para columna', () => {
        const covered = getCoveredNumbers({ 'COL1': 100 })
        expect(covered).toHaveLength(12)
        expect(covered).toContain(1)
        expect(covered).toContain(34)
        expect(covered).not.toContain(2)
    })

    it('debe retornar 2 números para split', () => {
        const covered = getCoveredNumbers({ 'SPLIT_1_4': 100 })
        expect(covered).toHaveLength(2)
        expect(covered).toContain(1)
        expect(covered).toContain(4)
    })

    it('debe retornar 4 números para corner', () => {
        const covered = getCoveredNumbers({ 'CORNER_1_2_4_5': 100 })
        expect(covered).toHaveLength(4)
        expect(covered).toContain(1)
        expect(covered).toContain(5)
    })

    it('debe retornar 3 números para street', () => {
        const covered = getCoveredNumbers({ 'STREET_1': 100 })
        expect(covered).toHaveLength(3)
        expect(covered).toContain(1)
        expect(covered).toContain(3)
    })

    it('debe retornar 6 números para línea', () => {
        const covered = getCoveredNumbers({ 'LINE_1': 100 })
        expect(covered).toHaveLength(6)
        expect(covered).toContain(1)
        expect(covered).toContain(6)
    })

    it('debe combinar múltiples apuestas sin duplicados', () => {
        const covered = getCoveredNumbers({
            '17': 100,
            'SPLIT_17_20': 50
        })
        // 17 aparece en ambas pero solo debe contarse una vez
        expect(covered).toContain(17)
        expect(covered).toContain(20)
        expect(covered).toHaveLength(2)
    })
})

// ============================================
// calculateCoverage
// ============================================
describe('calculateCoverage', () => {
    it('debe retornar 0% para apuestas vacías', () => {
        const coverage = calculateCoverage({})
        expect(coverage).toBe(0)
    })

    it('debe calcular cobertura correcta para un pleno (~2.7%)', () => {
        const coverage = calculateCoverage({ '17': 100 })
        expect(coverage).toBeCloseTo(2.7, 0)
    })

    it('debe calcular cobertura correcta para rojo (~48.6%)', () => {
        const coverage = calculateCoverage({ 'RED': 100 })
        expect(coverage).toBeCloseTo(48.6, 0)
    })

    it('debe calcular cobertura correcta para docena (~32.4%)', () => {
        const coverage = calculateCoverage({ 'DOZ1': 100 })
        expect(coverage).toBeCloseTo(32.4, 0)
    })
})

// ============================================
// calculateMaxPotentialWin
// ============================================
describe('calculateMaxPotentialWin', () => {
    it('debe retornar 0 para apuestas vacías', () => {
        const { maxWin, bestNumbers } = calculateMaxPotentialWin({})
        expect(maxWin).toBe(0)
        expect(bestNumbers).toEqual([])
    })

    it('debe identificar el mejor número para un pleno', () => {
        const { maxWin, bestNumbers } = calculateMaxPotentialWin({ '17': 100 })
        expect(maxWin).toBe(3600) // 35:1
        expect(bestNumbers).toContain(17)
        expect(bestNumbers).toHaveLength(1)
    })

    it('debe identificar múltiples números con igual pago máximo', () => {
        const { maxWin, bestNumbers } = calculateMaxPotentialWin({ 'RED': 100 })
        expect(maxWin).toBe(200) // 1:1
        expect(bestNumbers).toHaveLength(18) // Todos los rojos
    })

    it('debe calcular correctamente con apuestas múltiples', () => {
        const { maxWin, bestNumbers } = calculateMaxPotentialWin({
            '17': 100,   // 3600 si cae 17
            'BLACK': 50, // +100 si es negro
            'ODD': 50    // +100 si es impar
        })
        // 17 es negro e impar, así que gana todo: 3600 + 100 + 100 = 3800
        expect(maxWin).toBe(3800)
        expect(bestNumbers).toContain(17)
    })

    it('debe priorizar el número con mayor ganancia combinada', () => {
        const { maxWin, bestNumbers } = calculateMaxPotentialWin({
            '17': 100,  // 3600 si cae 17
            '18': 50    // 1800 si cae 18
        })
        expect(maxWin).toBe(3600)
        expect(bestNumbers).toContain(17)
        expect(bestNumbers).not.toContain(18)
    })
})

// ============================================
// EDGE CASES
// ============================================
describe('Edge Cases', () => {
    it('debe manejar el número 0 correctamente en apuestas simples', () => {
        const bets = { 'RED': 100, 'BLACK': 100, 'EVEN': 100, 'ODD': 100 }
        const winnings = calculateWinnings(0, bets)
        expect(winnings).toBe(0) // 0 pierde todas las apuestas simples
    })

    it('debe manejar apuestas con monto 0', () => {
        const bets = { '17': 0 }
        const winnings = calculateWinnings(17, bets)
        expect(winnings).toBe(0)
    })

    it('debe manejar pleno en 0', () => {
        const bets = { '0': 100 }
        const winnings = calculateWinnings(0, bets)
        expect(winnings).toBe(3600)
    })

    it('debe manejar splits con 0', () => {
        const bets = { 'SPLIT_0_1': 100 }
        const winnings = calculateWinnings(0, bets)
        expect(winnings).toBe(1800)
    })
})
