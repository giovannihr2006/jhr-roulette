import { useState, useEffect } from 'react'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { soundManager } from '../utils/SoundManager'
import { BETTING_STRATEGIES } from '../logic/BettingStrategies'
import { LIMITS } from '../config/GameLimits'
import { getNeighbours } from '../utils/rouletteUtils' // NEW
import { useToastStore } from '../logic/ToastStore'
import { calculateRisk } from '../utils/BetValidator'
import { optimizeBets, getBetType } from '../logic/RouletteUtils'

export const useRouletteLogic = ({
    currentBets,
    setCurrentBets,
    lastBets,
    setLastBets,
    setBetHistory,
    betHistory,
    isSpinning,
    gameMode,
    currentRoundBet
}) => {
    const addToast = useToastStore(state => state.addToast)
    const placeBet = useFinancialStore(state => state.placeBet)
    const refundBet = useFinancialStore(state => state.refundBet)

    // --- BETTING ACTIONS ---

    const handlePlaceBet = (betId, selectedChip) => {
        if (isSpinning) return

        const limits = LIMITS[gameMode] || LIMITS['REAL']
        const betType = getBetType(betId)

        // 1. Min Bet Logic (Standard vs Outside Multiplier)
        const isOutside = betType === 'SIMPLE' || betType === 'DOZEN'
        const effectiveMin = isOutside ? (limits.MIN_BET * 5) : limits.MIN_BET

        if (selectedChip < effectiveMin) {
            if (isOutside) {
                addToast(`Mínimo para apuestas de suertes (Simples/Docenas) es de ${effectiveMin} fichas`, 'error')
            } else {
                addToast(`Mínimo de apuesta es ${limits.MIN_BET}`, 'error')
            }
            return
        }

        // 2. Max Total Exceeded? (Approx check)
        if ((currentRoundBet + selectedChip) > limits.MAX_TOTAL_BET) {
            addToast(`Límite total de apuesta excedido (${limits.MAX_TOTAL_BET})`, 'error')
            return
        }

        // 3. Max Positions
        const currentPositions = Object.keys(currentBets).length
        if (!currentBets[betId] && currentPositions >= limits.MAX_POSITIONS) {
            addToast(`Máximo de ${limits.MAX_POSITIONS} posiciones permitidas.`, 'error')
            return
        }

        // 4. Max Win Check
        const nextBets = { ...currentBets, [betId]: (currentBets[betId] || 0) + selectedChip }
        const { maxWin } = calculateRisk(nextBets)
        if (maxWin > limits.MAX_WIN_PER_SPIN) {
            addToast(`Esta apuesta excede el pago máximo permitido (${limits.MAX_WIN_PER_SPIN}).`, 'error')
            return
        }

        // Exec Store Action
        const currentOnSpot = currentBets[betId] || 0
        const result = placeBet(selectedChip, betType, currentOnSpot)

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') {
                // Return specific error so caller can show ReloadModal
                return { success: false, error: 'INSUFFICIENT_FUNDS' }
            }
            if (result.error === 'MAX_TOTAL_EXCEEDED') addToast(`Límite total de mesa excedido`, 'error')
            if (result.error === 'LIMIT_EXCEEDED') addToast(`Límite individual excedido`, 'error')
            return { success: false, error: result.error }
        }

        soundManager.playChip()

        setCurrentBets(prev => ({ ...prev, [betId]: (prev[betId] || 0) + selectedChip }))
        setBetHistory(prev => [...prev, { bets: { [betId]: selectedChip }, totalCost: selectedChip }])

        return { success: true }
    }

    const handleBatchBets = (betsToPlace, chipValue) => {
        if (isSpinning) return

        // VALIDATION: Check Minimums for Batch
        const limits = LIMITS[gameMode] || LIMITS['REAL']
        for (const betId of betsToPlace) {
            const betType = getBetType(betId)
            const isOutside = betType === 'SIMPLE' || betType === 'DOZEN'
            const effectiveMin = isOutside ? (limits.MIN_BET * 5) : limits.MIN_BET

            if (chipValue < effectiveMin) {
                if (isOutside) {
                    addToast(`Ajuste su ficha: Mínimo para apuestas de suertes es ${effectiveMin}`, 'error')
                } else {
                    addToast(`Ajuste su ficha: Mínimo de apuesta es ${limits.MIN_BET}`, 'error')
                }
                return false
            }
        }

        const totalCost = betsToPlace.length * chipValue
        const result = placeBet(totalCost, 'BATCH')

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') {
                return { success: false, error: 'INSUFFICIENT_FUNDS', cost: totalCost }
            }
            return { success: false, error: result.error }
        }

        soundManager.playChip()

        const newBatch = {}
        betsToPlace.forEach(id => newBatch[id] = chipValue)

        setCurrentBets(prev => {
            const next = { ...prev }
            betsToPlace.forEach(id => {
                next[id] = (next[id] || 0) + chipValue
            })
            return next
        })
        setBetHistory(prev => [...prev, { bets: newBatch, totalCost }])
        return true
    }

    const handleRepeat = () => {
        if (isSpinning || Object.keys(lastBets).length === 0) return false

        const cost = Object.values(lastBets).reduce((a, b) => a + b, 0)
        const result = placeBet(cost, 'BATCH')

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') addToast("Saldo insuficiente", 'error')
            return false
        }

        setCurrentBets(prev => {
            const next = { ...prev }
            Object.entries(lastBets).forEach(([id, amt]) => {
                next[id] = (next[id] || 0) + amt
            })
            return next
        })
        setBetHistory(prev => [...prev, { bets: lastBets, totalCost: cost }])
        soundManager.playChip()
        return true
    }

    const handleDouble = () => {
        if (isSpinning || Object.keys(currentBets).length === 0) return false
        const cost = Object.values(currentBets).reduce((sum, amount) => sum + amount, 0)
        if (cost <= 0) return false

        const result = placeBet(cost, 'BATCH')

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') addToast("Saldo insuficiente para doblar", 'error')
            return false
        }

        const addedBets = { ...currentBets }
        setCurrentBets(prev => {
            const next = { ...prev }
            Object.keys(next).forEach(key => next[key] *= 2)
            return next
        })
        setBetHistory(prev => [...prev, { bets: addedBets, totalCost: cost }])
        soundManager.playChip()
        return true
    }

    const handleRepeatDouble = () => {
        if (isSpinning || Object.keys(lastBets).length === 0) return false

        const doubledBets = Object.fromEntries(
            Object.entries(lastBets).map(([id, amt]) => [id, amt * 2])
        )
        const cost = Object.values(doubledBets).reduce((a, b) => a + b, 0)
        const result = placeBet(cost, 'BATCH')

        if (!result.success) {
            if (result.error === 'INSUFFICIENT_FUNDS') addToast("Saldo insuficiente para repetir y doblar", 'error')
            return false
        }

        setCurrentBets(prev => {
            const next = { ...prev }
            Object.entries(doubledBets).forEach(([id, amt]) => {
                next[id] = (next[id] || 0) + amt
            })
            return next
        })
        setBetHistory(prev => [...prev, { bets: doubledBets, totalCost: cost }])
        soundManager.playChip()
        return true
    }

    const handleUndo = () => {
        if (isSpinning || betHistory.length === 0) return
        const lastAction = betHistory[betHistory.length - 1]

        refundBet(lastAction.totalCost)

        setCurrentBets(prev => {
            const next = { ...prev }
            Object.entries(lastAction.bets).forEach(([id, amt]) => {
                if (next[id]) {
                    next[id] -= amt
                    if (next[id] <= 0) delete next[id]
                }
            })
            return next
        })
        setBetHistory(prev => prev.slice(0, -1))
        // soundManager.playUndo? Or just chip
    }

    const handleClear = () => {
        if (isSpinning || Object.keys(currentBets).length === 0) return
        refundBet(currentRoundBet)
        setCurrentBets({})
        setBetHistory([])
        soundManager.playChip()
    }

    const handleNeighborBet = (number, count, chipValue) => {
        if (isSpinning) return
        const neighbors = getNeighbours(number, count).map(n => parseInt(n))
        const optimized = optimizeBets(neighbors)
        return handleBatchBets(optimized, chipValue)
    }

    return {
        handlePlaceBet,
        handleBatchBets,
        handleRepeat,
        handleDouble,
        handleRepeatDouble,
        handleUndo,
        handleClear,
        handleNeighborBet // NEW
    }
}
