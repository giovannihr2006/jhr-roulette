import React from 'react'

export const VerticalBanking = ({
    balance,
    maxBalance,
    bestPayout,
    currentRoundBet,
    formatBalance,
    formatValue,
    setShowReloadModal,
    setShowResetModal,
    setShowWithdrawModal,
    setShowProjectionsModal,
    isNewRecord,
    initialCapital = 0,
    sessionStart = Date.now(),
    lastWinAmount = 0,
    currentBets = {},
    viewCurrency = 'COL',
    setViewCurrency,
    exchangeRates = null,
    targetProfit,
    stopLossLimit,
    setTargetProfit,
    setStopLossLimit,
    roundHistory,
    setCurrentBets,
    placeBet,
    handleClear,
    setBetHistory
}) => {

    // Derived values
    const potentialTotal = balance - currentRoundBet + bestPayout.amount
    const diffRecord = potentialTotal - maxBalance
    const isRecordBreaking = diffRecord > 0
    const netProfit = balance - initialCapital

    // NEW: Giovanni's condition (El mejor pago más el saldo actual tiene que ser mayor que el récord histórico, sino doblar apuesta)
    const isGiovanniConditionMet = (bestPayout.amount + balance) > maxBalance
    const shouldDoubleBetGiovanni = !isGiovanniConditionMet

    // Derived values for times if needed (though already in the other widget)
    const rawDurationMs = sessionStart ? Date.now() - sessionStart : 0;
    const activeMins = Math.max(0.1, rawDurationMs / 60000); // For record profit/min

    // Local templates state
    const [templateName, setTemplateName] = React.useState('')
    const [templates, setTemplates] = React.useState(() => {
        try {
            return JSON.parse(localStorage.getItem('ruleta180_templates')) || {}
        } catch {
            return {}
        }
    })

    const handleSaveTemplate = () => {
        if (!templateName.trim()) {
            alert("Por favor ingresa un nombre para la plantilla.")
            return
        }
        if (!currentBets || Object.keys(currentBets).length === 0) {
            alert("No hay apuestas activas en el paño para guardar.")
            return
        }
        const updated = { ...templates, [templateName.trim()]: currentBets }
        setTemplates(updated)
        localStorage.setItem('ruleta180_templates', JSON.stringify(updated))
        setTemplateName('')
    }

    const handleLoadTemplate = (name) => {
        const template = templates[name]
        if (template) {
            setCurrentBets(template)
        }
    }

    const handleDeleteTemplate = (name) => {
        const updated = { ...templates }
        delete updated[name]
        setTemplates(updated)
        localStorage.setItem('ruleta180_templates', JSON.stringify(updated))
    }

    // Export log handlers
    const handleExportJSON = () => {
        if (!roundHistory || roundHistory.length === 0) {
            alert("No hay historial de rondas para exportar.")
            return
        }
        const jsonString = JSON.stringify(roundHistory, null, 2)
        const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url;
        link.download = `ruleta180_historial_${Date.now()}.json`;
        link.click()
        URL.revokeObjectURL(url)
    }

    const handleExportCSV = () => {
        if (!roundHistory || roundHistory.length === 0) {
            alert("No hay historial de rondas para exportar.")
            return
        }
        const headers = ["Giro", "Fecha/Hora", "Numero Ganador", "Modo", "Apuesta Total", "Ganancia Total", "Resultado Neto", "Saldo"]
        const rows = roundHistory.map(r => [
            r.spin,
            new Date(r.timestamp || r.id).toLocaleString('es-ES'),
            r.winningNumber,
            r.mode,
            r.totalBet,
            r.totalWin,
            r.netResult,
            r.balanceAfter
        ])
        const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.map(val => `"${val}"`).join(";"))].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url;
        link.download = `ruleta180_historial_${Date.now()}.csv`;
        link.click()
        URL.revokeObjectURL(url)
    }

    const calculateCoverageLocal = () => {
        if (!currentBets) return 0;
        const covered = new Set();
        Object.keys(currentBets).forEach(id => {
            if (!isNaN(id)) {
                covered.add(parseInt(id, 10));
            } else if (id.startsWith('SPLIT_')) {
                const parts = id.split('_');
                covered.add(parseInt(parts[1], 10));
                covered.add(parseInt(parts[2], 10));
            } else if (id.startsWith('STREET_')) {
                const start = parseInt(id.split('_')[1], 10);
                covered.add(start); covered.add(start + 1); covered.add(start + 2);
            } else if (id.startsWith('CORNER_')) {
                const parts = id.split('_').slice(1).map(Number);
                parts.forEach(n => covered.add(n));
            } else if (id.startsWith('LINE_')) {
                const start = parseInt(id.split('_')[1], 10);
                for (let k = 0; k < 6; k++) covered.add(start + k);
            } else if (id === 'RED') {
                [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].forEach(n => covered.add(n));
            } else if (id === 'BLACK') {
                [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].forEach(n => covered.add(n));
            } else if (id === 'EVEN') {
                for (let k = 2; k <= 36; k += 2) covered.add(k);
            } else if (id === 'ODD') {
                for (let k = 1; k <= 35; k += 2) covered.add(k);
            } else if (id === 'LOW') {
                for (let k = 1; k <= 18; k++) covered.add(k);
            } else if (id === 'HIGH') {
                for (let k = 19; k <= 36; k++) covered.add(k);
            } else if (id === 'DOZ1') {
                for (let k = 1; k <= 12; k++) covered.add(k);
            } else if (id === 'DOZ2') {
                for (let k = 13; k <= 24; k++) covered.add(k);
            } else if (id === 'DOZ3') {
                for (let k = 25; k <= 36; k++) covered.add(k);
            } else if (id === 'COL1') {
                for (let k = 1; k <= 34; k += 3) covered.add(k);
            } else if (id === 'COL2') {
                for (let k = 2; k <= 35; k += 3) covered.add(k);
            } else if (id === 'COL3') {
                for (let k = 3; k <= 36; k += 3) covered.add(k);
            }
        });
        return (covered.size / 37) * 100;
    };

    const coverage = calculateCoverageLocal();
    const nxMultiplier = currentRoundBet > 0 ? Math.round(diffRecord / currentRoundBet) : 0;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'rgba(10, 10, 10, 0.95)',
            padding: '20px',
            borderRadius: '16px',
            border: '2px solid #d4af37',
            boxShadow: '0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.2)',
            width: '100%',
            boxSizing: 'border-box',
            backdropFilter: 'blur(5px)'
        }}>

            {/* HEADER: ACTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={(e) => { e.stopPropagation(); setShowReloadModal(true) }}
                    title="Recargar" style={btnStyle('#2e7d32', '#fff')}>💲 RECARGAR</button>
                <button onClick={(e) => { e.stopPropagation(); setShowResetModal(true) }}
                    title="Reiniciar" style={btnStyle('#3e1a1a', '#ff4444')}>⚠ REINICIAR</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '-5px' }}>
                <button onClick={() => setShowWithdrawModal(true)}
                    title="Retirar" style={btnStyle('#333', '#aaa')}>⬇ RETIRAR</button>
                <button onClick={() => setShowProjectionsModal(true)}
                    title="Proyecciones" style={btnStyle('#d4af37', '#000')}>📈 PROY</button>
            </div>

            <div style={{ height: '1px', background: 'rgba(212, 175, 55, 0.3)', margin: '5px 0' }}></div>

            {/* BALANCE (HERO) */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={labelStyle}>SALDO ACTUAL</span>
                <span style={{ fontSize: '2rem', color: '#ffd700', fontFamily: 'Roboto Mono, monospace', fontWeight: 'bold', textAlign: 'right', letterSpacing: '-1px' }}>
                    {formatBalance(balance)}
                </span>
            </div>

            {/* NET PROFIT HIGHLIGHTED BOX */}
            <div style={{
                background: netProfit > 0 ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                border: netProfit > 0 ? '1px solid #4caf50' : '1px solid #333',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: netProfit > 0 ? '0 0 10px rgba(76, 175, 80, 0.2)' : 'none'
            }}>
                <span style={{ fontSize: '0.75rem', color: netProfit > 0 ? '#4caf50' : '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Ganancia Neta</span>
                <span style={{ fontSize: '1.4rem', color: netProfit > 0 ? '#4caf50' : '#888', fontFamily: 'Roboto Mono, monospace', fontWeight: 'bold' }}>
                    {netProfit > 0 ? '+' : ''}{formatValue(netProfit)}
                </span>
            </div>

            <div style={{ height: '1px', background: 'rgba(212, 175, 55, 0.1)', margin: '2px 0' }}></div>

            {/* TELEMETRÍA FINANCIERA EN GRID */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 12px',
                fontSize: '0.85rem'
            }}>
                {/* SALDO INICIAL */}
                <div style={gridItemStyle}>
                    <span style={gridLabelStyle}>Saldo Inicial</span>
                    <span style={gridValueStyle}>{formatValue(initialCapital)}</span>
                </div>

                {/* RECORD HISTORICO */}
                <div style={gridItemStyle}>
                    <span style={gridLabelStyle}>Récord Hist.</span>
                    <span style={{ ...gridValueStyle, color: isNewRecord ? '#fff' : '#d4af37', textShadow: isNewRecord ? '0 0 8px gold' : 'none' }}>
                        {formatBalance(maxBalance)} {isNewRecord && '🏆'}
                    </span>
                </div>

                {/* SALDO POTENCIAL */}
                <div style={gridItemStyle}>
                    <span style={gridLabelStyle}>S. Potencial</span>
                    <span style={gridValueStyle}>{formatBalance(potentialTotal)}</span>
                </div>

                {/* DR */}
                <div style={gridItemStyle}>
                    <span style={gridLabelStyle}>DR (Diferencia)</span>
                    <span style={{ ...gridValueStyle, color: isRecordBreaking ? '#4caf50' : '#e53935' }}>
                        {diffRecord > 0 ? '+' + formatBalance(diffRecord) : formatBalance(diffRecord)}
                    </span>
                </div>

                {/* APUESTA DE LA RONDA */}
                <div style={gridItemStyle}>
                    <span style={gridLabelStyle}>Apuesta Actual</span>
                    <span style={gridValueStyle}>{formatValue(currentRoundBet)}</span>
                </div>

                {/* MULTIPLICADOR NX */}
                <div style={gridItemStyle}>
                    <span style={gridLabelStyle}>Coeficiente Nx</span>
                    <span style={{ ...gridValueStyle, color: nxMultiplier >= 0 ? '#4caf50' : '#e53935', fontWeight: 'bold', fontSize: '1.9rem' }}>
                        {nxMultiplier}x
                    </span>
                </div>

                {/* COBERTURA FIELTRO */}
                <div style={gridItemStyle}>
                    <span style={gridLabelStyle}>Cobertura</span>
                    <span style={{ ...gridValueStyle, color: '#2196f3' }}>{coverage.toFixed(1)}%</span>
                </div>

                {/* ULTIMO PAGO */}
                <div style={gridItemStyle}>
                    <span style={gridLabelStyle}>Último Pago</span>
                    <span style={{ ...gridValueStyle, color: lastWinAmount > 0 ? '#4caf50' : '#666', fontWeight: 'bold' }}>
                        {formatValue(lastWinAmount)}
                    </span>
                </div>
            </div>

            {/* MEJOR PAGO POTENCIAL */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '8px 10px',
                marginTop: '4px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ ...gridLabelStyle, color: '#aaa' }}>Mejor Pago</span>
                    <span style={{ color: bestPayout.amount > 0 ? '#ffd700' : '#555', fontWeight: 'bold', fontFamily: 'Roboto Mono, monospace' }}>
                        {formatValue(bestPayout.amount)}
                    </span>
                </div>
                {bestPayout.amount > 0 && (
                    <div style={{ fontSize: '0.65rem', color: '#ffcc00', marginTop: '2px', textAlign: 'right', fontFamily: 'monospace' }}>
                        Spots: {bestPayout.numbers.length > 5 ? 'Varios...' : bestPayout.numbers.join(', ')}
                    </div>
                )}
            </div>

            {/* DOBLA APUESTA ALERTA REACTIVA */}
            {(shouldDoubleBetGiovanni || (bestPayout.amount > 0 && !isRecordBreaking)) && (
                <div style={{
                    background: 'rgba(229, 57, 53, 0.15)',
                    border: '1px solid #c62828',
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: '#ff5252',
                    letterSpacing: '1px',
                    animation: 'pulse 1.5s infinite',
                    boxShadow: '0 0 10px rgba(229, 57, 53, 0.3)'
                }}>
                    ⚠️ DOBLA APUESTA ⤴
                </div>
            )}

            <div style={{ height: '1px', background: 'rgba(212, 175, 55, 0.1)', margin: '2px 0' }}></div>

            {/* CONTROL DE LÍMITES */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '8px',
                padding: '10px'
            }}>
                <span style={{ fontSize: '0.7rem', color: '#ffd700', fontWeight: 'bold', letterSpacing: '0.5px' }}>🚨 LÍMITES DE SEGURIDAD</span>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.6rem', color: '#ff5252', fontWeight: 'bold' }}>STOP-LOSS</span>
                        <input
                            type="number"
                            value={stopLossLimit || ''}
                            onChange={(e) => setStopLossLimit(Math.max(0, parseFloat(e.target.value) || 0))}
                            placeholder="Mínimo"
                            style={{
                                background: 'rgba(0,0,0,0.6)',
                                border: '1px solid #ff5252',
                                borderRadius: '4px',
                                color: '#ff4444',
                                padding: '4px 6px',
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.6rem', color: '#4caf50', fontWeight: 'bold' }}>META</span>
                        <input
                            type="number"
                            value={targetProfit || ''}
                            onChange={(e) => setTargetProfit(Math.max(0, parseFloat(e.target.value) || 0))}
                            placeholder="Máximo"
                            style={{
                                background: 'rgba(0,0,0,0.6)',
                                border: '1px solid #4caf50',
                                borderRadius: '4px',
                                color: '#66bb6a',
                                padding: '4px 6px',
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* EXPORTACIÓN DE LOGS */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '10px'
            }}>
                <span style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 'bold', letterSpacing: '0.5px' }}>💾 EXPORTAR LOG DE SESIÓN</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button onClick={handleExportJSON} style={exportBtnStyle('#1976d2', '#fff')}>
                        📁 JSON
                    </button>
                    <button onClick={handleExportCSV} style={exportBtnStyle('#00796b', '#fff')}>
                        📊 CSV
                    </button>
                </div>
            </div>

            {/* PLANTILLAS DE APUESTAS */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '8px',
                padding: '10px'
            }}>
                <span style={{ fontSize: '0.7rem', color: '#ffd700', fontWeight: 'bold', letterSpacing: '0.5px' }}>✨ PLANTILLAS DE APUESTA</span>

                <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Nombre..."
                        style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.6)',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            color: '#fff',
                            padding: '4px 6px',
                            fontSize: '0.75rem'
                        }}
                    />
                    <button onClick={handleSaveTemplate} style={{
                        background: '#ffd700',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        💾
                    </button>
                </div>

                <div style={{
                    maxHeight: '80px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '4px',
                    paddingRight: '2px'
                }}>
                    {Object.keys(templates).length === 0 ? (
                        <span style={{ fontSize: '0.65rem', color: '#666', fontStyle: 'italic', textAlign: 'center' }}>Sin plantillas</span>
                    ) : (
                        Object.keys(templates).map(name => (
                            <div key={name} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(255,255,255,0.03)',
                                padding: '3px 6px',
                                borderRadius: '4px',
                                border: '1px solid #333'
                            }}>
                                <span style={{ fontSize: '0.7rem', color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }} title={name}>{name}</span>
                                <div style={{ display: 'flex', gap: '3px' }}>
                                    <button onClick={() => handleLoadTemplate(name)} style={{
                                        background: '#388e3c',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '3px',
                                        padding: '2px 4px',
                                        fontSize: '0.6rem',
                                        cursor: 'pointer'
                                    }}>📥</button>
                                    <button onClick={() => handleDeleteTemplate(name)} style={{
                                        background: '#d32f2f',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '3px',
                                        padding: '2px 4px',
                                        fontSize: '0.6rem',
                                        cursor: 'pointer'
                                    }}>✕</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CURRENCY SELECTOR CONTROL */}
            {setViewCurrency && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(212, 175, 55, 0.3)' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', width: '100%' }}>
                        {['COL', 'USA', 'EUR'].map(curr => (
                            <button key={curr} onClick={() => setViewCurrency(curr)}
                                className={`ct-currency-btn ${viewCurrency === curr ? 'active' : ''}`}
                                style={{
                                    flex: 1,
                                    padding: '6px 5px',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: viewCurrency === curr ? '#d4af37' : 'rgba(255,255,255,0.02)',
                                    color: viewCurrency === curr ? '#000' : '#888',
                                    border: viewCurrency === curr ? '1px solid #d4af37' : '1px solid #333',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: 'sans-serif'
                                }}
                            >
                                <span style={{ fontWeight: 'bold' }}>{curr}</span>
                                {curr !== 'COL' && exchangeRates && (
                                    <span style={{ fontSize: '0.6rem', opacity: 0.8, marginTop: '2px', fontFamily: 'monospace' }}>
                                        {curr === 'USA' && exchangeRates.COP ? `TRM ${Math.round(exchangeRates.COP)}` : ''}
                                        {curr === 'EUR' && exchangeRates.EUR && exchangeRates.COP ? `TRM ${Math.round(exchangeRates.COP / exchangeRates.EUR)}` : ''}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}

// STYLES
const labelStyle = { fontSize: '0.7rem', color: '#888', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }

const btnStyle = (bg, color) => ({
    background: bg, color: color, border: 'none', borderRadius: '4px',
    padding: '8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '0.7rem', transition: 'filter 0.2s', fontFamily: 'sans-serif'
})

const exportBtnStyle = (bg, color) => ({
    background: bg, color: color, border: 'none', borderRadius: '4px',
    padding: '6px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '0.7rem', transition: 'opacity 0.2s', fontFamily: 'sans-serif'
})

const gridItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '4px'
}

const gridLabelStyle = {
    fontSize: '0.62rem',
    color: '#666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.2px'
}

const gridValueStyle = {
    fontSize: '0.95rem',
    color: '#fff',
    fontFamily: 'Roboto Mono, monospace',
    marginTop: '1px',
    textAlign: 'right'
}
