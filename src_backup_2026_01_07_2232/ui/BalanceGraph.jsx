import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useFinancialStore } from '../logic/FinancialSimulator'

export const BalanceGraph = () => {
    // We need to access the history. 
    // We'll update FinancialSimulator to track history first, but for now let's scaffold the component.
    // Assuming store has `history` array of objects { spin: n, balance: $ }
    const history = useFinancialStore(state => state.history || [])
    // const currentCapital = useFinancialStore(state => state.currentCapital)
    // const netProfit = useFinancialStore(state => state.netProfit)

    return (
        <div style={{
            position: 'absolute', bottom: 20, right: 450, // Moved left to avoid StatsHUD overlap
            width: '400px', height: '200px',
            background: 'rgba(5, 15, 10, 0.9)',
            border: '1px solid #004400',
            borderRadius: '4px',
            padding: '10px',
            pointerEvents: 'none' // Click through just in case
        }}>
            <div style={{ fontSize: '0.7rem', color: '#0f0', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                <span>PERFORMANCE CURVE (COM SHEET)</span>
                <span>{history.length} SPINS</span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                    <XAxis dataKey="spin" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip
                        contentStyle={{ background: '#000', border: '1px solid #0f0', color: '#0f0' }}
                        itemStyle={{ color: '#0f0' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value) => [`$${value}`, 'Balance']}
                    />
                    <ReferenceLine y={useFinancialStore.getState().initialCapital} stroke="#444" strokeDasharray="3 3" />
                    <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#00ffcc"
                        strokeWidth={2}
                        dot={false}
                        animationDuration={300}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
