import React, { useState, useMemo } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

export const ProjectionsModal = ({ isOpen, onClose, balance, startBalance, startTime, history = [] }) => {
    if (!isOpen) return null

    const [isFull, setIsFull] = useState(false)
    const [visibleLines, setVisibleLines] = useState({
        balance: true,
        min: false,
        hour: false,
        day: false,
        month: false,
        year: false
    })

    // Process Data efficiently
    const chartData = useMemo(() => {
        // Safe Start Time fallback
        const sessionStart = startTime || Date.now()

        // Transform Log to Chart Data
        // Typically transactionLog is Newest First. We need Oldest First for the X-Axis.
        const sortedHistory = [...history].sort((a, b) => a.id - b.id)

        return sortedHistory.map((tx, index) => {
            const elapsedMs = Math.max(tx.id - sessionStart, 1000)
            const elapsedMin = elapsedMs / 60000

            // Current Profit AT THAT MOMENT
            const currentProfit = tx.balanceAfter - startBalance

            // Rates
            const perMin = currentProfit / (elapsedMin || 1) // Avoid Infinity
            const perHour = perMin * 60
            const perDay = perHour * 24
            const perMonth = perDay * 30
            const perYear = perDay * 365

            return {
                index: index + 1,
                balance: tx.balanceAfter,
                profit: currentProfit,
                min: perMin,
                hour: perHour,
                day: perDay,
                month: perMonth,
                year: perYear
            }
        })
    }, [history, startBalance, startTime])

    const formatMoney = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD',
            maximumFractionDigits: 0
        }).format(val)
    }

    const formatYAxis = (val) => {
        if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
        if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}k`
        return `$${val}`
    }

    const toggleLine = (key) => {
        setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }))
    }

    // Line Configuration
    const LINES = [
        { key: 'balance', label: 'Saldo Real', color: '#ffffff', width: 3 },
        { key: 'min', label: 'Proy. Minuto', color: '#4caf50', width: 2 },
        { key: 'hour', label: 'Proy. Hora', color: '#2196f3', width: 2 },
        { key: 'day', label: 'Proy. Día', color: '#ff9800', width: 2 },
        { key: 'month', label: 'Proy. Mes', color: '#9c27b0', width: 2 },
        { key: 'year', label: 'Proy. Año', color: '#f44336', width: 2 }
    ]

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 10000, backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: '#1a1a1a', border: '2px solid #d4af37',
                borderRadius: '15px', padding: '20px',
                width: '95%', maxWidth: '1100px', maxHeight: '95vh',
                overflowY: 'auto', boxShadow: '0 0 50px rgba(212, 175, 55, 0.2)',
                display: isFull ? 'none' : 'flex', flexDirection: 'column'
            }}>
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#d4af37', margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.8rem' }}>
                        ANALÍTICA MAESTRA (LINEAS)
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'none', border: '1px solid #d4af37', color: '#d4af37',
                        fontSize: '1rem', cursor: 'pointer', padding: '5px 15px', borderRadius: '5px'
                    }}>
                        CERRAR
                    </button>
                </div>

                {/* CONTROLS (TOGGLES) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px', padding: '10px', background: '#111', borderRadius: '10px' }}>
                    {LINES.map(line => (
                        <button
                            key={line.key}
                            onClick={() => toggleLine(line.key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: visibleLines[line.key] ? `${line.color}22` : 'transparent',
                                border: `1px solid ${visibleLines[line.key] ? line.color : '#444'}`,
                                color: visibleLines[line.key] ? '#fff' : '#666',
                                padding: '8px 15px', borderRadius: '20px', cursor: 'pointer',
                                transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: 'bold'
                            }}
                        >
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: line.color, opacity: visibleLines[line.key] ? 1 : 0.3 }} />
                            {line.label}
                        </button>
                    ))}
                </div>

                {/* SUMMARY STATS (The "Table" User refers to) */}
                {chartData.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                        {(() => {
                            const last = chartData[chartData.length - 1];
                            return LINES.map(line => {
                                const val = last[line.key];
                                // Special styling for HOUR
                                const isHour = line.key === 'hour';
                                return (
                                    <div key={line.key} style={{
                                        background: isHour ? '#1565c0' : '#222', // Solid Blue
                                        border: `1px solid ${line.color}`,
                                        borderRadius: '8px', padding: '15px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        boxShadow: isHour ? '0 0 20px #2196f3' : 'none',
                                        animation: isHour ? 'pulse-blue 1s infinite' : 'none',
                                        transform: isHour ? 'scale(1.05)' : 'scale(1)'
                                    }}>
                                        <div style={{ color: isHour ? '#fff' : '#888', fontSize: '0.8rem', marginBottom: '5px' }}>{line.label}</div>
                                        <div style={{
                                            color: '#fff',
                                            fontSize: isHour ? '1.5rem' : '1.1rem',
                                            fontWeight: 'bold',
                                            textShadow: isHour ? '0 0 10px #fff' : 'none'
                                        }}>
                                            {formatMoney(val)}
                                        </div>
                                    </div>
                                )
                            })
                        })()}
                    </div>
                )}

                {/* CHART CONTAINER */}
                <div style={isFull ? {
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: '#0a0a0a', zIndex: 11000, padding: '40px', boxSizing: 'border-box'
                } : {
                    height: '500px', width: '100%', marginBottom: '20px', background: '#222',
                    padding: '10px', borderRadius: '10px', position: 'relative'
                }}>
                    <button onClick={() => setIsFull(!isFull)} style={{
                        position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                        background: '#333', color: '#fff', border: '1px solid #555',
                        padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8rem'
                    }}>
                        {isFull ? '🗗 RESTAURAR' : '🗖 EXPANDIR'}
                    </button>

                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="index"
                                stroke="#666"
                                label={{ value: 'Jugadas', position: 'insideBottomRight', offset: -5, fill: '#666' }}
                            />
                            <YAxis
                                stroke="#ccc"
                                width={60}
                                tickFormatter={formatYAxis}
                                domain={['auto', 'auto']}
                                style={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#d4af37', borderRadius: '8px' }}
                                itemStyle={{ padding: 0 }}
                                formatter={(value, name) => [formatMoney(value), LINES.find(l => l.key === name)?.label || name]}
                                labelFormatter={(label) => `Jugada #${label}`}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />

                            {LINES.map(line => visibleLines[line.key] && (
                                <Line
                                    key={line.key}
                                    type="monotone"
                                    dataKey={line.key}
                                    stroke={line.color}
                                    strokeWidth={line.width}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                    name={line.label} // For Legend/Tooltip
                                    animationDuration={500}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    )
}
