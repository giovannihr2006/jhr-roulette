import React, { useEffect } from 'react'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { useGenesisStore } from '../logic/MasterConfig'

export const FinancialHUD = () => {
    // Connect to stores
    const { finance } = useGenesisStore()
    const { currentCapital, netProfit, hourlyRate, initialize } = useFinancialStore()

    // Initialize if needed (hacky check for 0 capital)
    useEffect(() => {
        if (currentCapital === 0) initialize(finance.capital)
    }, [finance.capital, initialize, currentCapital])

    // Get limits for progress bars
    const stopWin = finance.stopWin || 1000 // Default to avoid NaN
    const progress = Math.min((netProfit / stopWin) * 100, 100)
    const isLoss = netProfit < 0

    return (
        <div style={{
            position: 'absolute', top: 20, right: 350, // Moved left to avoid Leva overlap
            width: '300px',
            background: 'rgba(5, 20, 10, 0.9)',
            border: '1px solid #0f0',
            fontFamily: 'Consolas, monospace',
            color: '#0f0',
            padding: '10px',
            borderRadius: '4px',
            boxShadow: '0 0 15px rgba(0, 255, 0, 0.2)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #004400', paddingBottom: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>FINANCIAL ENGINE</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{isLoss ? 'DOWNTREND' : 'UPTREND'}</span>
            </div>

            {/* MAIN BALANCE */}
            <div style={{ fontSize: '2rem', textAlign: 'right', margin: '10px 0', textShadow: '0 0 10px rgba(0,255,0,0.5)' }}>
                ${currentCapital.toLocaleString()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>NET PROFIT:</span>
                <span style={{ color: isLoss ? '#ff3838' : '#0f0' }}>
                    {netProfit > 0 ? '+' : ''}{netProfit.toLocaleString()}
                </span>
            </div>

            {/* VELOCITY METRICS */}
            <div style={{ marginTop: '15px', background: 'rgba(0,50,0,0.3)', padding: '5px' }}>
                <div style={{ fontSize: '0.75rem', color: '#88cc88' }}>VELOCITY (PROJECTION)</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem' }}>${Math.floor(hourlyRate).toLocaleString()}/hr</span>
                    {hourlyRate > 0 && (
                        <span style={{ fontSize: '0.7rem' }}>
                            ~{((stopWin - netProfit) / (hourlyRate / 60)).toFixed(0)}m to Goal
                        </span>
                    )}
                </div>
            </div>

            {/* PROGRESS TO TARGET */}
            <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px' }}>
                    <span>TARGET: +${stopWin}</span>
                    <span>{progress.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#002200' }}>
                    <div style={{
                        width: `${Math.max(0, progress)}%`,
                        height: '100%',
                        background: '#0f0',
                        boxShadow: '0 0 5px #0f0',
                        transition: 'width 0.5s ease-out'
                    }} />
                </div>
            </div>

        </div>
    )
}
