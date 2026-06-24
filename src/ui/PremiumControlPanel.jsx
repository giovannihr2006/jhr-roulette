import React, { useState, useEffect } from 'react'
import { useGenesisStore } from '../logic/MasterConfig'
import { useStatTracker } from '../logic/StatTracker'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { STRATEGY_PRESETS } from '../logic/StrategyPresets'
import './PremiumControlPanel.css'

export const PremiumControlPanel = () => {
    const { ui, finance, targets, physics, strategy, ensayo, setFinance, setTargets, setPhysics, setStrategy, setUI } = useGenesisStore()
    const addResult = useStatTracker(state => state.addResult)
    const registerSpin = useFinancialStore(state => state.registerSpin)

    // Accordion active sections state
    const [activeSection, setActiveSection] = useState('PRESETS')

    // Local states for inputs to avoid extreme render lags during typing (debouncing equivalent)
    const [localCapital, setLocalCapital] = useState(finance.capital)
    const [localPointValue, setLocalPointValue] = useState(finance.pointValue)
    const [localStopLoss, setLocalStopLoss] = useState(finance.stopLoss)
    const [localLossAlert, setLocalLossAlert] = useState(finance.lossAlert)
    const [localStopWin, setLocalStopWin] = useState(finance.stopWin)

    // Sync from store when they change externally
    useEffect(() => { setLocalCapital(finance.capital) }, [finance.capital])
    useEffect(() => { setLocalPointValue(finance.pointValue) }, [finance.pointValue])
    useEffect(() => { setLocalStopLoss(finance.stopLoss) }, [finance.stopLoss])
    useEffect(() => { setLocalLossAlert(finance.lossAlert) }, [finance.lossAlert])
    useEffect(() => { setLocalStopWin(finance.stopWin) }, [finance.stopWin])

    const toggleSection = (sectionName) => {
        setActiveSection(activeSection === sectionName ? null : sectionName)
    }

    const handlePresetSelect = (presetKey) => {
        const preset = STRATEGY_PRESETS[presetKey]
        if (preset) {
            console.log("Loading Strategy Preset:", preset.label)
            setPhysics(preset.values)
            setFinance({ stopWin: preset.values.stopWin })
            setStrategy({ waitThreshold: preset.values.waitThreshold })

            if (preset.values.simSpeed) {
                useGenesisStore.setState(state => ({ ensayo: { ...state.ensayo, timeCompression: preset.values.simSpeed } }))
            }
        }
    }

    const handleManualSpin = () => {
        const num = Math.floor(Math.random() * 37)
        addResult(num)

        // Simulación Financiera Simple para testing
        const win = Math.random() > 0.5
        const delta = win ? 3500 : -100
        registerSpin(delta)
    }

    return (
        <div className={`premium-panel-overlay ${ui.showControls ? 'open' : ''}`}>
            {/* HEADER */}
            <div className="premium-panel-header">
                <h2>Ajustes de Motor</h2>
                <button
                    className="premium-panel-close"
                    onClick={() => setUI({ showControls: false })}
                    title="Cerrar Ajustes"
                >
                    ✕
                </button>
            </div>

            {/* BODY WITH COLLAPSIBLERS */}
            <div className="premium-panel-body">

                {/* 1. PRESETS ACCORDION */}
                <div className={`premium-card ${activeSection === 'PRESETS' ? 'active' : ''}`}>
                    <div className="premium-card-header" onClick={() => toggleSection('PRESETS')}>
                        <h3>📈 Perfil Analítico (Presets)</h3>
                        <span className="premium-card-arrow">▶</span>
                    </div>
                    {activeSection === 'PRESETS' && (
                        <div className="premium-card-content">
                            <div className="strategy-grid">
                                {Object.keys(STRATEGY_PRESETS).map((key) => {
                                    const active = strategy.waitThreshold === STRATEGY_PRESETS[key].values.waitThreshold
                                    return (
                                        <div
                                            key={key}
                                            className={`strategy-preset-card ${active ? 'active' : ''}`}
                                            onClick={() => handlePresetSelect(key)}
                                        >
                                            <span className="preset-label">{STRATEGY_PRESETS[key].label}</span>
                                            <span className="preset-desc">Espera: {STRATEGY_PRESETS[key].values.waitThreshold}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. ENGINE PHYSICS ACCORDION */}
                <div className={`premium-card ${activeSection === 'PHYSICS' ? 'active' : ''}`}>
                    <div className="premium-card-header" onClick={() => toggleSection('PHYSICS')}>
                        <h3>⚙️ Motor Físico (Genesis Engine)</h3>
                        <span className="premium-card-arrow">▶</span>
                    </div>
                    {activeSection === 'PHYSICS' && (
                        <div className="premium-card-content">

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Masa de la Bola:</span>
                                    <span className="premium-val-badge">{physics.ballMass}g</span>
                                </div>
                                <input
                                    type="range" min="0.01" max="0.5" step="0.01"
                                    className="premium-slider" value={physics.ballMass}
                                    onChange={(e) => setPhysics({ ballMass: Number(e.target.value) })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Fricción de Pista:</span>
                                    <span className="premium-val-badge">{physics.friction}</span>
                                </div>
                                <input
                                    type="range" min="0" max="0.1" step="0.001"
                                    className="premium-slider" value={physics.friction}
                                    onChange={(e) => setPhysics({ friction: Number(e.target.value) })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Gravedad Virtual:</span>
                                    <span className="premium-val-badge">{physics.gravity} m/s²</span>
                                </div>
                                <input
                                    type="range" min="-20" max="-1" step="0.1"
                                    className="premium-slider" value={physics.gravity}
                                    onChange={(e) => setPhysics({ gravity: Number(e.target.value) })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Velocidad de Rueda:</span>
                                    <span className="premium-val-badge">{physics.wheelSpeed} rad/s</span>
                                </div>
                                <input
                                    type="range" min="0.1" max="2.0" step="0.1"
                                    className="premium-slider" value={physics.wheelSpeed}
                                    onChange={(e) => setPhysics({ wheelSpeed: Number(e.target.value) })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Dispersión (Scatter):</span>
                                    <span className="premium-val-badge">{(physics.scatter * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="1.0" step="0.05"
                                    className="premium-slider" value={physics.scatter}
                                    onChange={(e) => setPhysics({ scatter: Number(e.target.value) })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Inclinación de Mesa:</span>
                                    <span className="premium-val-badge">{physics.tilt}°</span>
                                </div>
                                <input
                                    type="range" min="0" max="1.0" step="0.01"
                                    className="premium-slider" value={physics.tilt}
                                    onChange={(e) => setPhysics({ tilt: Number(e.target.value) })}
                                />
                            </div>

                        </div>
                    )}
                </div>

                {/* 3. FINANCE BASE ACCORDION */}
                <div className={`premium-card ${activeSection === 'FINANCE' ? 'active' : ''}`}>
                    <div className="premium-card-header" onClick={() => toggleSection('FINANCE')}>
                        <h3>💰 Finanzas (Parámetros Base)</h3>
                        <span className="premium-card-arrow">▶</span>
                    </div>
                    {activeSection === 'FINANCE' && (
                        <div className="premium-card-content">

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Capital Inicial ($):</span>
                                </div>
                                <input
                                    type="number" className="premium-input"
                                    value={localCapital}
                                    onChange={(e) => setLocalCapital(Number(e.target.value))}
                                    onBlur={() => setFinance({ capital: localCapital })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Valor del Punto ($):</span>
                                </div>
                                <input
                                    type="number" className="premium-input"
                                    value={localPointValue}
                                    onChange={(e) => setLocalPointValue(Number(e.target.value))}
                                    onBlur={() => setFinance({ pointValue: localPointValue })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Stop Loss ($):</span>
                                </div>
                                <input
                                    type="number" className="premium-input"
                                    value={localStopLoss}
                                    onChange={(e) => setLocalStopLoss(Number(e.target.value))}
                                    onBlur={() => setFinance({ stopLoss: localStopLoss })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Alerta de Pérdida ($):</span>
                                </div>
                                <input
                                    type="number" className="premium-input"
                                    value={localLossAlert}
                                    onChange={(e) => setLocalLossAlert(Number(e.target.value))}
                                    onBlur={() => setFinance({ lossAlert: localLossAlert })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Stop Win (Meta $):</span>
                                </div>
                                <input
                                    type="number" className="premium-input"
                                    value={localStopWin}
                                    onChange={(e) => setLocalStopWin(Number(e.target.value))}
                                    onBlur={() => setFinance({ stopWin: localStopWin })}
                                />
                            </div>

                        </div>
                    )}
                </div>

                {/* 4. STRATEGY ENGINE ACCORDION */}
                <div className={`premium-card ${activeSection === 'STRATEGY' ? 'active' : ''}`}>
                    <div className="premium-card-header" onClick={() => toggleSection('STRATEGY')}>
                        <h3>⚡ Configuración de Estrategia</h3>
                        <span className="premium-card-arrow">▶</span>
                    </div>
                    {activeSection === 'STRATEGY' && (
                        <div className="premium-card-content">

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Umbral de Espera (Threshold):</span>
                                    <span className="premium-val-badge">{strategy.waitThreshold}%</span>
                                </div>
                                <input
                                    type="range" min="10" max="90" step="0.01"
                                    className="premium-slider" value={strategy.waitThreshold}
                                    onChange={(e) => setStrategy({ waitThreshold: Number(e.target.value) })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Jugadas en Máquina:</span>
                                    <span className="premium-val-badge">{strategy.waitMachine} spins</span>
                                </div>
                                <input
                                    type="range" min="5" max="100" step="1"
                                    className="premium-slider" value={strategy.waitMachine}
                                    onChange={(e) => setStrategy({ waitMachine: Number(e.target.value) })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Espera Adicional:</span>
                                    <span className="premium-val-badge">{strategy.waitAdditional} spins</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" step="1"
                                    className="premium-slider" value={strategy.waitAdditional}
                                    onChange={(e) => setStrategy({ waitAdditional: Number(e.target.value) })}
                                />
                            </div>

                            <div className="premium-field">
                                <div className="premium-label-row">
                                    <span>Historial Máximo (Profundidad):</span>
                                    <span className="premium-val-badge">{strategy.historyDepth} spins</span>
                                </div>
                                <input
                                    type="range" min="10" max="200" step="1"
                                    className="premium-slider" value={strategy.historyDepth}
                                    onChange={(e) => setStrategy({ historyDepth: Number(e.target.value) })}
                                />
                            </div>

                            <div className="premium-toggle-row">
                                <span style={{ fontSize: '0.8rem' }}>Modo de Recuperación:</span>
                                <label className="premium-switch">
                                    <input
                                        type="checkbox" checked={strategy.recoveryMode}
                                        onChange={(e) => setStrategy({ recoveryMode: e.target.checked })}
                                    />
                                    <span className="premium-slider-switch"></span>
                                </label>
                            </div>

                        </div>
                    )}
                </div>

                {/* 5. MANUAL CONTROLS ACCORDION */}
                <div className={`premium-card ${activeSection === 'MANUAL' ? 'active' : ''}`}>
                    <div className="premium-card-header" onClick={() => toggleSection('MANUAL')}>
                        <h3>🛠️ Panel de Control Manual (Debug)</h3>
                        <span className="premium-card-arrow">▶</span>
                    </div>
                    {activeSection === 'MANUAL' && (
                        <div className="premium-card-content" style={{ gap: '8px' }}>
                            <button className="premium-btn premium-btn-primary" onClick={handleManualSpin}>
                                🎲 Girar Aleatorio y $
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="premium-btn" style={{ flex: 1 }} onClick={() => addResult(0)}>
                                    🟢 Forzar 0
                                </button>
                                <button className="premium-btn" style={{ flex: 1, borderColor: '#ff4444', color: '#ff4444' }} onClick={() => addResult(1)}>
                                    🔴 Forzar Rojo
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* BOTTOM ACTIONS BAR */}
            <div className="premium-actions-bar">
                <button className="premium-btn" onClick={() => setUI({ showControls: false })}>
                    Confirmar
                </button>
            </div>
        </div>
    )
}
