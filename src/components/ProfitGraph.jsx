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

export const ProfitGraph = ({
    history = [],
    balance,
    startBalance,
    startTime,
    viewCurrency = 'COL',
    rates = {},
    isWidgetMode = false,
    workHours = 8
}) => {
    const [visibleLines, setVisibleLines] = useState({
        balance: true,
        min: false,
        hour: false,
        day: false,
        week: false,
        month: false,
        year: false
    })

    const chartData = useMemo(() => {
        const sortedHistory = [...(history || [])].sort((a, b) => a.id - b.id)

        return sortedHistory.map((tx, index) => {
            const currentProfit = tx.balanceAfter - startBalance
            const totalSpins = index + 1
            const perSpinProfit = currentProfit / totalSpins

            const perMin = perSpinProfit
            const perHour = perSpinProfit * 60
            const perDay = perHour * workHours
            const perWeek = perDay * 7
            const perMonth = perDay * 30
            const perYear = perDay * 360

            return {
                index: index + 1,
                balance: tx.balanceAfter,
                profit: currentProfit,
                min: perMin,
                hour: perHour,
                day: perDay,
                week: perWeek,
                month: perMonth,
                year: perYear
            }
        })
    }, [history, startBalance, workHours])

    const formatMoney = (val) => {
        const rate = rates[viewCurrency] || 1
        const converted = val * rate

        if (viewCurrency === 'COL') {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0
            }).format(converted)
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: viewCurrency === 'USA' ? 'USD' : 'EUR',
            maximumFractionDigits: 0
        }).format(converted)
    }

    const formatYAxis = (val) => {
        const rate = rates[viewCurrency] || 1
        const converted = val * rate
        const symbol = viewCurrency === 'COL' ? '$' : (viewCurrency === 'USA' ? '$' : 'EUR')

        if (Math.abs(converted) >= 1000000) return `${symbol}${(converted / 1000000).toFixed(1)}M`
        if (Math.abs(converted) >= 1000) return `${symbol}${Math.round(converted / 1000)}k`
        return `${symbol}${Math.round(converted)}`
    }

    const toggleLine = (key) => {
        setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const LINES = [
        { key: 'balance', label: 'Saldo', color: '#ffffff', width: 3 },
        { key: 'min', label: 'Minuto', color: '#4caf50', width: 2 },
        { key: 'hour', label: 'Hora', color: '#2196f3', width: 2 },
        { key: 'day', label: 'Dia', color: '#ff9800', width: 2 },
        { key: 'week', label: 'Semana', color: '#e91e63', width: 2 },
        { key: 'month', label: 'Mes', color: '#9c27b0', width: 2 },
        { key: 'year', label: 'Ano', color: '#f44336', width: 2 }
    ]

    if (!history || history.length === 0) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                minHeight: isWidgetMode ? '180px' : '350px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: isWidgetMode ? 'rgba(20,20,20,0.4)' : '#222',
                borderRadius: '8px',
                padding: '15px',
                border: '1px dashed rgba(212, 175, 55, 0.3)',
                color: '#aaa',
                textAlign: 'center',
                boxSizing: 'border-box'
            }}>
                <span style={{ fontSize: isWidgetMode ? '1.8rem' : '2.8rem', marginBottom: '8px', filter: 'drop-shadow(0 0 5px rgba(212,175,55,0.4))' }}>CHART</span>
                <p style={{ margin: 0, fontSize: isWidgetMode ? '0.75rem' : '1rem', color: '#d4af37', fontFamily: 'Cinzel, serif', fontWeight: 'bold', letterSpacing: '1px' }}>
                    SIN DATOS DE SESION
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: isWidgetMode ? '0.65rem' : '0.8rem', color: '#888', maxWidth: '280px', lineHeight: '1.4' }}>
                    Realiza giros en la ruleta para comenzar a proyectar y visualizar la curva de ganancias en tiempo real.
                </p>
            </div>
        )
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: isWidgetMode ? 'transparent' : '#222',
            borderRadius: '8px',
            padding: '5px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: isWidgetMode ? '3px' : '5px',
                marginBottom: '5px',
                justifyContent: 'center',
                padding: '4px',
                background: isWidgetMode ? 'rgba(0,0,0,0.5)' : '#111',
                borderRadius: '8px'
            }}>
                {LINES.map(line => (
                    <button
                        key={line.key}
                        onClick={(e) => { e.stopPropagation(); toggleLine(line.key); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: visibleLines[line.key] ? `${line.color}33` : 'transparent',
                            border: `1px solid ${visibleLines[line.key] ? line.color : '#444'}`,
                            color: visibleLines[line.key] ? '#fff' : '#888',
                            padding: isWidgetMode ? '2px 5px' : '3px 8px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: isWidgetMode ? '0.62rem' : '0.8rem',
                            fontWeight: 'bold',
                            transition: 'all 0.15s ease-in-out'
                        }}
                    >
                        <div style={{
                            width: isWidgetMode ? '4px' : '6px',
                            height: isWidgetMode ? '4px' : '6px',
                            borderRadius: '50%',
                            background: line.color,
                            opacity: visibleLines[line.key] ? 1 : 0.3
                        }} />
                        {line.label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, minHeight: '0', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                        <XAxis
                            dataKey="index"
                            stroke="#666"
                            tick={{ fontSize: isWidgetMode ? 9 : 13, fontWeight: 'bold', fill: '#888' }}
                        />
                        <YAxis
                            stroke="#ccc"
                            width={isWidgetMode ? 45 : 75}
                            tickFormatter={formatYAxis}
                            domain={['auto', 'auto']}
                            tick={{ fontSize: isWidgetMode ? 9 : 13, fontWeight: 'bold', fill: '#ccc' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(10,10,10,0.95)',
                                borderColor: '#d4af37',
                                borderRadius: '8px',
                                fontSize: isWidgetMode ? '0.7rem' : '0.8rem',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ padding: 0 }}
                            formatter={(value, name) => [formatMoney(value), LINES.find(l => l.key === name)?.label || name]}
                            labelFormatter={(label) => `Jugada #${label}`}
                        />
                        {!isWidgetMode && <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#aaa', marginTop: '5px' }} />}

                        {LINES.map(line => visibleLines[line.key] && (
                            <Line
                                key={line.key}
                                type="monotone"
                                dataKey={line.key}
                                stroke={line.color}
                                strokeWidth={isWidgetMode ? 1.5 : line.width}
                                dot={false}
                                activeDot={{ r: 4 }}
                                name={line.label}
                                animationDuration={300}
                                isAnimationActive={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
