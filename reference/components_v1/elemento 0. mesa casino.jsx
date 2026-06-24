import React, { useState, useEffect, useMemo } from 'react'
import { RouletteWheel } from './RouletteWheel'
import { BettingBoard } from './BettingBoard'
import { Draggable } from './Draggable'
import { useFinancialStore } from '../logic/FinancialSimulator'
import { soundManager } from '../utils/SoundManager'
import { dealer } from '../utils/DealerVoice'
import './CasinoTable.css'

// --- HOOKS ---
import { useCurrency } from '../hooks/useCurrency'
import { useBetActions } from '../hooks/useBetActions' // FASE 6
import { useBetHistory } from '../hooks/useBetHistory' // FASE 6
import { useRouletteGame } from '../hooks/useRouletteGame' // FIXED
import { useDragLayout } from '../hooks/useDragLayout' // NEW
import { useForensicSystem } from '../hooks/useForensicSystem' // FASE 4
import { useAutoplay } from '../hooks/useAutoplay' // FASE 4
import { usePotentialWin } from '../hooks/usePotentialWin' // FASE 4
import { useStrategyBot } from '../hooks/useStrategyBot' // FASE 4

// --- COMPONENTS ---
import { Roulette3D } from './Roulette3D'
import { ReloadModal } from './ReloadModal'
import { StrategiesModal } from './StrategiesModal'
import { RubricModal } from './RubricModal'
import { StrategyManualModal } from './StrategyManualModal'
import { AudioSettingsModal } from './AudioSettingsModal'
import { Racetrack } from './Racetrack'
import { DetailedHistoryModal } from './DetailedHistoryModal'
import { DetailedHistoryWidget } from './DetailedHistoryWidget'
import { SessionClock } from './SessionClock'
import { StatisticsPanel } from './StatisticsPanel'
import SpinCounter from './SpinCounter'
import { useToastStore } from '../logic/ToastStore'
import { getCoveredNumbers } from '../logic/RouletteUtils'

// MÓDULOS DEL SISTEMA
import { RecentNumbersPanel } from './RecentNumbersPanel'
import { TopOpportunityWidget } from './TopOpportunityWidget'
import ProjectionsPanel from './ProjectionsPanel'
import { TimeBar } from './TimeBar'
import InternalScannerModal from './InternalScannerModal'
import SystemEfficiencyModal from './SystemEfficiencyModal'
import MethodsTable from './MethodsTable'
import { ChipSelector } from './ChipSelector'
import { ActiveBetsPanel } from './ActiveBetsPanel'
import { UnifiedTelemetry } from './UnifiedTelemetry'
import { useTimerController } from './TimerController'

export const CasinoTable = () => {
    // --- GLOBAL STORES ---
    const addToast = useToastStore(state => state.addToast)

    // Optimized atomic selectors to prevent unnecessary re-renders (Fixes Infinite Loop)
    const gameMode = useFinancialStore(state => state.gameMode)
    const realCapital = useFinancialStore(state => state.realCapital)
    const demoCapital = useFinancialStore(state => state.demoCapital)
    const currentRoundBet = useFinancialStore(state => state.currentRoundBet)
    const roundHistory = useFinancialStore(state => state.roundHistory)
    const placeBet = useFinancialStore(state => state.placeBet)
    const withdraw = useFinancialStore(state => state.withdraw)
    const reloadCapital = useFinancialStore(state => state.reloadCapital)
    const resolveRound = useFinancialStore(state => state.resolveRound) // Explicitly needed for hook
    const maxBalance = useFinancialStore(state => state.peakCapital) // RESTORED
    const initialCapital = useFinancialStore(state => state.initialCapital) // RESTORED
    const sessionStart = useFinancialStore(state => state.sessionStart) // RESTORED

    const balance = gameMode === 'REAL' ? realCapital : demoCapital

    // --- LOCAL STATE ---
    const [currentBets, setCurrentBets] = useState({})
    const [lastBets, setLastBets] = useState(() => {
        try {
            const saved = localStorage.getItem('casinoLastBets')
            return saved ? JSON.parse(saved) : {}
        } catch { return {} }
    })
    const [betHistory, setBetHistory] = useState([])
    const [selectedChip, setSelectedChip] = useState(100)
    const [hoveredNumbers, setHoveredNumbers] = useState([])
    const [showActiveBets, setShowActiveBets] = useState(true)
    const [viewMode3D, setViewMode3D] = useState(false)
    const [neighborCount, setNeighborCount] = useState(2)

    // --- MODALS STATE ---
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [showBankruptcy, setShowBankruptcy] = useState(false)
    const [showRecordModal, setShowRecordModal] = useState(false)
    const [showStrategiesModal, setShowStrategiesModal] = useState(false)
    const [showManualModal, setShowManualModal] = useState(false)
    const [showRubricModal, setShowRubricModal] = useState(false)
    const [showAudioSettingsModal, setShowAudioSettingsModal] = useState(false)
    const [showHelpModal, setShowHelpModal] = useState(false) // Added missing state
    const [showReloadModal, setShowReloadModal] = useState(false)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [buyInAmount, setBuyInAmount] = useState('')
    const [showScanner, setShowScanner] = useState(false) // RESTORED
    const [showSigma, setShowSigma] = useState(false) // RESTORED
    const [showMethods, setShowMethods] = useState(false) // RESTORED
    const [showResetModal, setShowResetModal] = useState(false) // RESTORED
    const [showProjectionsModal, setShowProjectionsModal] = useState(false) // RESTORED

    // --- CURRENCY & VIEW ---
    const { viewCurrency, setViewCurrency, formatValue, formatBalance, DISPLAY_RATES } = useCurrency()

    // 0. Store Actions
    // resolveRound is already declared above at line 63

    // --- CORE GAME HOOKS ---
    // 1. Core Logic (Roulette Engine)
    const {
        isSpinning, handleSpin, physicsState, wheelRotation, ballRotation,
        showBall, lastWin, lastWinAmount, animState, ballResetKey
    } = useRouletteGame({
        currentBets, setCurrentBets, setLastBets, setBetHistory,
        resolveRound
    })

    // --- TIMED BETTING ---
    const {
        timerMode, timerDuration, timeLeft, toggleTimer, updateDuration
    } = useTimerController({ isSpinning, handleSpin, defaultDuration: 15 })

    // --- ARCHITECTURE HOOKS (NEW) ---
    // 1. Forensic System (Crash Protection & Bankruptcy)
    const forensic = useForensicSystem(currentBets, setCurrentBets, balance, isSpinning)

    // 2. Potential Win Calculation
    const { potentialWin, bestPayout } = usePotentialWin(currentBets, hoveredNumbers) // EXPANDED

    // 3. Bet Actions (Atomized Phase 6) - MOVED UP
    const {
        handlePlaceBet,
        handleBatchBets,
        handleRepeat,
        handleDouble,
        handleNeighborBet
    } = useBetActions({
        currentBets,
        setCurrentBets,
        setBetHistory,
        isSpinning,
        gameMode,
        currentRoundBet,
        lastBets
    })

    // 4. Bet History (Atomized Phase 6) - MOVED UP
    const {
        handleUndo,
        handleClear
    } = useBetHistory({
        currentBets,
        setCurrentBets,
        betHistory,
        setBetHistory,
        isSpinning,
        currentRoundBet
    })

    // 5. Simple Autoplay (Timer) - NOW SAFE
    const { autoPlayCount, setAutoPlayCount } = useAutoplay(isSpinning, currentBets, lastBets, handleRepeat, handleSpin)

    // 6. Strategy Bot (Smart Autoplay & Strategies) - NOW SAFE
    const { handleApplyStrategy, smartAutoActive } = useStrategyBot(
        balance, placeBet, handleClear, setCurrentBets, setBetHistory, handleSpin,
        isSpinning, roundHistory, lastWinAmount, selectedChip, setSelectedChip
    )

    // --- EFFECTS & HELPERS ---
    useEffect(() => {
        if (forensic.shouldShowBankruptcy()) setShowBankruptcy(true)
        else if (balance > 0) setShowBankruptcy(false)
    }, [balance, currentBets, isSpinning, forensic])

    // Save Last Bets
    useEffect(() => {
        localStorage.setItem('casinoLastBets', JSON.stringify(lastBets))
    }, [lastBets])

    // Live Mode Mock
    const [isLiveMode, setIsLiveMode] = useState(false)

    // Layout
    const {
        positions, onUpdatePos, isEditMode, setIsEditMode, resetLayout,
        handleSaveLayout, handleLoadLayout, showLayoutHelp, setShowLayoutHelp
    } = useDragLayout()

    // Wrappers for Bet Logic (Error handling)
    const onBatchBet = (ids, val) => {
        const result = handleBatchBets(ids, val)
        if (result?.error === 'INSUFFICIENT_FUNDS') setShowReloadModal(true)
    }
    const onPlaceBet = (id) => {
        const result = handlePlaceBet(id, selectedChip)
        if (result?.error === 'INSUFFICIENT_FUNDS') setShowReloadModal(true)
    }
    const onNeighborBetWrapper = (num) => {
        handleNeighborBet(num, neighborCount, selectedChip)
    }

    // Modal Handlers
    const handleReloadSubmit = (val) => {
        // Val comes already converted from ReloadModal if we change logic,
        // BUT ReloadModal currently passes value divided by rate?
        // Let's check ReloadModal: onReload(amountVal / rate).
        // So 'val' here IS the chips amount.
        if (val > 0) {
            reloadCapital(val) // already calculated in chips
            setBuyInAmount('')
            setShowBankruptcy(false)
            setShowReloadModal(false)
            addToast("Recarga Exitosa", "success")
        }
    }

    const placedNumbers = useMemo(() => getCoveredNumbers(currentBets), [currentBets])
    const isNewRecord = useMemo(() => balance > maxBalance, [balance, maxBalance]) // RESTORED

    const handleToggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                addToast(`Error al activar pantalla completa: ${err.message}`, "error");
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    const TOTAL_DRAGGABLES = 29;

    // --- RENDER ---
    return (
        <div className="casino-table" style={{ display: 'block' }}>
            {/* 1. HEADER */}
            <Draggable index={1} totalCount={TOTAL_DRAGGABLES} id="title" isEnabled={isEditMode} initialPos={positions.title} onDragEnd={onUpdatePos} style={{ zIndex: 4001 }}>
                <div style={{
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.98) 100%)',
                    padding: '15px 40px',
                    borderRadius: '12px',
                    border: '2px solid #d4af37',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.2)'
                }}>
                    <div style={{
                        color: '#d4af37',
                        fontSize: '2.2rem',
                        fontFamily: 'Georgia, serif',
                        fontWeight: 'bold',
                        letterSpacing: '3px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.3)',
                        textTransform: 'uppercase'
                    }}>
                        GHR Ruleta Royale
                    </div>
                    <div style={{
                        color: '#888',
                        fontSize: '16px',
                        fontFamily: 'Roboto Mono, monospace',
                        marginTop: '5px',
                        letterSpacing: '1px'
                    }}>
                        v1.0.0 | 180120261454
                    </div>
                </div>
            </Draggable>

            {/* 2. LAYOUT CONTROLS */}
            <Draggable index={2} totalCount={TOTAL_DRAGGABLES} id="layoutControls" isEnabled={isEditMode} initialPos={positions.layoutControls} onDragEnd={onUpdatePos} style={{ zIndex: 5000 }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {isEditMode && <button onClick={handleSaveLayout} className="ct-control-btn">💾 GUARDAR</button>}
                    <button onClick={() => setShowStrategiesModal(true)} className="ct-control-btn">ESTRATEGIAS</button>
                    <button onClick={() => setViewMode3D(!viewMode3D)} className="ct-control-btn">{viewMode3D ? '2D' : '3D'}</button>
                </div>
            </Draggable>

            {/* 3. TOOLBOX (CONTROLE QUE PERMITE MOVER ELEMENTOS) */}
            <Draggable index={3} totalCount={TOTAL_DRAGGABLES} id="toolBox" isEnabled={isEditMode} initialPos={positions.toolBox} onDragEnd={onUpdatePos} style={{ zIndex: 4002 }}>
                <div style={{ display: 'flex', gap: '5px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px' }}>
                    <button onClick={() => setShowRubricModal(true)} className="ct-round-btn" title="Rúbrica">📊</button>
                    <button onClick={() => setShowAudioSettingsModal(true)} className="ct-round-btn" title="Audio">🔊</button>
                    <button onClick={handleToggleFullScreen} className="ct-round-btn" title="Pantalla Completa">📺</button>
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`ct-round-btn ${isEditMode ? 'active' : ''}`}
                        style={{ border: isEditMode ? '2px solid #d4af37' : 'none' }}
                        title={isEditMode ? "Bloquear Diseño" : "Desbloquear Diseño (MOVER ELEMENTOS)"}
                    >
                        {isEditMode ? '🔒' : '🔓'}
                    </button>
                </div>
            </Draggable>

            {/* 4. PAYTABLE (INFO) */}
            <Draggable index={4} totalCount={TOTAL_DRAGGABLES} id="paytable" isEnabled={isEditMode} initialPos={positions.paytable} onDragEnd={onUpdatePos}>
                <div className="ct-help-controls">
                    <div onClick={() => setShowHelpModal(true)} className="ct-round-btn ct-btn-gold" title="Ver Guía de Apuestas">?</div>
                    <div onClick={() => setShowManualModal(true)} className="ct-round-btn ct-btn-white" title="Códice GHR (Manual)">📖</div>
                </div>
            </Draggable>

            {/* 5. WHEEL */}
            <Draggable index={5} totalCount={TOTAL_DRAGGABLES} id="wheel" isEnabled={isEditMode} initialPos={positions.wheel} onDragEnd={onUpdatePos}>
                {viewMode3D ?
                    <Roulette3D wheelRotation={wheelRotation} ballRotation={ballRotation} showBall={showBall} size={500} /> :
                    <RouletteWheel
                        wheelRotation={wheelRotation} ballRotation={ballRotation} showBall={showBall} ballResetKey={ballResetKey}
                        highlightedNumbers={hoveredNumbers} placedNumbers={placedNumbers} lastWin={lastWin} size={500}
                        isLiveMode={isLiveMode} onManualWin={(n) => useFinancialStore.getState().resolveRound(n)} animState={animState}
                    />
                }
            </Draggable>

            {/* 6. BOARD */}
            <Draggable index={6} totalCount={TOTAL_DRAGGABLES} id="board" isEnabled={isEditMode} initialPos={positions.board} onDragEnd={onUpdatePos}>
                <div style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>
                    <BettingBoard
                        bets={currentBets} onPlaceBet={onPlaceBet} onBatchBet={(b) => onBatchBet(b, selectedChip)}
                        lastWin={lastWin} onHoverNumbers={setHoveredNumbers} history={roundHistory}
                        onNeighborBet={onNeighborBetWrapper} showActiveBets={showActiveBets} setShowActiveBets={setShowActiveBets}
                    />
                </div>
            </Draggable>

            {/* 7. TELEMETRIA AVANZADA */}
            <Draggable index={7} totalCount={TOTAL_DRAGGABLES} id="telemetry" isEnabled={isEditMode} initialPos={positions.telemetry} onDragEnd={onUpdatePos}>
                <UnifiedTelemetry physicsState={physicsState} />
            </Draggable>

            {/* 8. SPIN COUNTER */}
            <Draggable index={8} totalCount={TOTAL_DRAGGABLES} id="spinCounter" isEnabled={isEditMode} initialPos={positions.spinCounter} onDragEnd={onUpdatePos}>
                <SpinCounter />
            </Draggable>

            {/* 9. DETAILED HISTORY */}
            <Draggable index={9} totalCount={TOTAL_DRAGGABLES} id="detailedHistory" isEnabled={isEditMode} initialPos={positions.detailedHistory} onDragEnd={onUpdatePos}>
                <DetailedHistoryWidget onClick={() => setShowHistoryModal(true)} />
            </Draggable>

            {/* 10. HISTORY PANEL */}
            <Draggable index={10} totalCount={TOTAL_DRAGGABLES} id="history" isEnabled={isEditMode} initialPos={positions.history} onDragEnd={onUpdatePos}>
                <RecentNumbersPanel />
            </Draggable>

            {/* 11. STATISTICS PANEL */}
            <Draggable index={11} totalCount={TOTAL_DRAGGABLES} id="statistics" isEnabled={isEditMode} initialPos={positions.statistics} onDragEnd={onUpdatePos}>
                <StatisticsPanel />
            </Draggable>

            {/* 12. BANKING HUD */}
            <Draggable index={12} totalCount={TOTAL_DRAGGABLES} id="banking" isEnabled={isEditMode} initialPos={positions.banking} onDragEnd={onUpdatePos}>
                <div className="panel-tray-dark" style={{ width: '320px', minWidth: '320px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                    <div className="panel-tray-header">🏦 BANCA Y ESTADO</div>
                    <div className="panel-tray-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
                        {/* CONTROLS */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={(e) => { e.stopPropagation(); setShowReloadModal(true) }} className="ct-control-btn" style={{ background: '#2e7d32', fontSize: '0.8rem' }}>💲 Recargar</button>
                            <button onClick={(e) => { e.stopPropagation(); useFinancialStore.getState().hardReset() }} className="ct-control-btn" style={{ background: '#3e1a1a', color: '#ff4444', border: '1px solid #ff4444', fontSize: '0.8rem' }}>⚠ Reiniciar</button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px', marginTop: '-5px' }}>
                            <button onClick={(e) => { e.stopPropagation(); setShowWithdrawModal(true) }} className="ct-control-btn" style={{ background: '#333', color: '#aaa', fontSize: '0.8rem' }}>⬇ Retirar</button>
                            <button onClick={(e) => { e.stopPropagation(); setShowProjectionsModal(true) }} className="ct-control-btn" style={{ background: '#d4af37', color: '#000', fontSize: '0.8rem' }}>📈 Proy</button>
                        </div>
                        {/* DATA */}
                        <div className="ct-banking-row">
                            <div style={{ fontSize: '1rem', color: '#aaa', fontWeight: 'bold' }}>Saldo</div>
                            <div style={{ fontSize: '1.9rem', color: '#ffd700', fontWeight: 'bold', fontFamily: 'Roboto Mono' }}>{formatBalance(balance)}</div>
                        </div>
                        <div className="ct-banking-row">
                            <div style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold' }}>Mejor Pago</div>
                            <div style={{ fontSize: '1.4rem', color: bestPayout.amount > 0 ? '#ffcc00' : '#444', fontFamily: 'Roboto Mono' }}>{formatValue(bestPayout.amount)}</div>
                        </div>
                        <div className="ct-banking-row">
                            <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>Saldo Inicial</div>
                            <div style={{ fontSize: '1.4rem', color: '#888', fontFamily: 'Roboto Mono' }}>{formatValue(initialCapital)}</div>
                        </div>
                        <div className="ct-banking-row">
                            <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>Ganancia Neta</div>
                            <div style={{ fontSize: '1.9rem', color: (balance - initialCapital) >= 0 ? '#4caf50' : '#ff4444', fontFamily: 'Roboto Mono' }}>{formatValue(balance - initialCapital)}</div>
                        </div>
                        <div className="ct-banking-row">
                            <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>Apuesta</div>
                            <div style={{ fontSize: '1.4rem', color: '#fff', fontFamily: 'Roboto Mono' }}>{formatValue(currentRoundBet)}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                            {['COL', 'USA', 'EUR'].map(curr => (
                                <button key={curr} onClick={() => setViewCurrency(curr)} className={`ct-currency-btn ${viewCurrency === curr ? 'active' : ''}`}>{curr}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </Draggable>

            {/* 13. RACETRACK */}
            <Draggable index={13} totalCount={TOTAL_DRAGGABLES} id="racetrack" isEnabled={isEditMode} initialPos={positions.racetrack} onDragEnd={onUpdatePos}>
                <Racetrack
                    onBatchBets={(b) => onBatchBet(b, selectedChip)} onHoverNumbers={setHoveredNumbers}
                    neighborCount={neighborCount} setNeighborCount={setNeighborCount}
                />
            </Draggable>

            {/* 14. TOP OPPORTUNITY WIDGET */}
            <Draggable index={14} totalCount={TOTAL_DRAGGABLES} id="opportunity" isEnabled={isEditMode} initialPos={positions.opportunity} onDragEnd={onUpdatePos}>
                <TopOpportunityWidget />
            </Draggable>

            {/* 15. PROJECTIONS PANEL */}
            <Draggable index={15} totalCount={TOTAL_DRAGGABLES} id="projections" isEnabled={isEditMode} initialPos={positions.projections} onDragEnd={onUpdatePos}>
                <ProjectionsPanel currentBets={currentBets} viewCurrency={viewCurrency} />
            </Draggable>

            {/* 16. ACTIVE BETS SUMMARY */}
            <Draggable index={16} totalCount={TOTAL_DRAGGABLES} id="activeBets" isEnabled={isEditMode} initialPos={positions.activeBets} onDragEnd={onUpdatePos}>
                <ActiveBetsPanel currentBets={currentBets} viewCurrency={viewCurrency} onClose={() => setShowActiveBets(false)} />
            </Draggable>

            {/* 17. SESSION CLOCK */}
            <Draggable index={17} totalCount={TOTAL_DRAGGABLES} id="clock" isEnabled={isEditMode} initialPos={positions.clock} onDragEnd={onUpdatePos}>
                <SessionClock />
            </Draggable>

            {/* 18. TIMER (TIME BAR) */}
            <Draggable index={18} totalCount={TOTAL_DRAGGABLES} id="timer" isEnabled={isEditMode} initialPos={positions.timer} onDragEnd={onUpdatePos}>
                <TimeBar
                    timerMode={timerMode}
                    duration={timerDuration}
                    timeLeft={timeLeft}
                    onToggle={toggleTimer}
                    onChangeDuration={updateDuration}
                />
            </Draggable>

            {/* 19. CHIP SELECTOR */}
            <Draggable index={19} totalCount={TOTAL_DRAGGABLES} id="chips" isEnabled={isEditMode} initialPos={positions.chips} onDragEnd={onUpdatePos}>
                <ChipSelector selectedChip={selectedChip} onSelectChip={setSelectedChip} />
            </Draggable>

            {/* 20. GAME CONTROLS (PREMIUM CASINO STYLE) */}
            <Draggable index={20} totalCount={TOTAL_DRAGGABLES} id="controls" isEnabled={isEditMode} initialPos={positions.controls} onDragEnd={onUpdatePos}>
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
                    padding: '12px 20px',
                    borderRadius: '16px',
                    border: '2px solid #333',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                    alignItems: 'center'
                }}>
                    {/* GIRAR - Primary Action */}
                    <button
                        onClick={handleSpin}
                        disabled={isSpinning || timerMode}
                        style={{
                            background: isSpinning ? '#333' : 'linear-gradient(180deg, #ffd700 0%, #b8860b 50%, #8b6914 100%)',
                            border: '2px solid #ffd700',
                            borderRadius: '12px',
                            padding: '12px 35px',
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            color: isSpinning ? '#666' : '#000',
                            cursor: isSpinning ? 'not-allowed' : 'pointer',
                            boxShadow: isSpinning ? 'none' : '0 4px 15px rgba(255,215,0,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
                            textShadow: '0 1px 0 rgba(255,255,255,0.3)',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}
                    >
                        🎰 GIRAR
                    </button>

                    {/* Separator */}
                    <div style={{ width: '2px', height: '40px', background: 'linear-gradient(180deg, transparent, #444, transparent)' }} />

                    {/* REPETIR */}
                    <button
                        onClick={handleRepeat}
                        disabled={isSpinning}
                        style={{
                            background: 'linear-gradient(180deg, #2e7d32 0%, #1b5e20 100%)',
                            border: '1px solid #4caf50',
                            borderRadius: '8px',
                            padding: '10px 18px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            cursor: isSpinning ? 'not-allowed' : 'pointer',
                            opacity: isSpinning ? 0.5 : 1,
                            boxShadow: '0 3px 10px rgba(76,175,80,0.3)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        🔄 REPETIR
                    </button>

                    {/* DOBLAR */}
                    <button
                        onClick={handleDouble}
                        disabled={isSpinning}
                        style={{
                            background: 'linear-gradient(180deg, #1565c0 0%, #0d47a1 100%)',
                            border: '1px solid #2196f3',
                            borderRadius: '8px',
                            padding: '10px 18px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            cursor: isSpinning ? 'not-allowed' : 'pointer',
                            opacity: isSpinning ? 0.5 : 1,
                            boxShadow: '0 3px 10px rgba(33,150,243,0.3)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        ✖️2 DOBLAR
                    </button>

                    {/* DESHACER */}
                    <button
                        onClick={handleUndo}
                        disabled={isSpinning}
                        style={{
                            background: 'linear-gradient(180deg, #424242 0%, #212121 100%)',
                            border: '1px solid #616161',
                            borderRadius: '8px',
                            padding: '10px 18px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: '#bbb',
                            cursor: isSpinning ? 'not-allowed' : 'pointer',
                            opacity: isSpinning ? 0.5 : 1,
                            boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        ↩️ DESHACER
                    </button>

                    {/* LIMPIAR */}
                    <button
                        onClick={handleClear}
                        disabled={isSpinning}
                        style={{
                            background: 'linear-gradient(180deg, #c62828 0%, #8e0000 100%)',
                            border: '1px solid #ef5350',
                            borderRadius: '8px',
                            padding: '10px 18px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            cursor: isSpinning ? 'not-allowed' : 'pointer',
                            opacity: isSpinning ? 0.5 : 1,
                            boxShadow: '0 3px 10px rgba(198,40,40,0.3)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        🗑️ LIMPIAR
                    </button>
                </div>
            </Draggable>

            {/* 21. AUTOPLAY PANEL */}
            <Draggable index={21} totalCount={TOTAL_DRAGGABLES} id="autoplay" isEnabled={isEditMode} initialPos={positions.autoplay} onDragEnd={onUpdatePos}>
                <div style={{ background: 'rgba(102, 16, 242, 0.2)', padding: '10px', borderRadius: '8px', border: '1px solid #6610f2', color: '#fff', fontSize: '0.8rem' }}>
                    AUTOPLAY: {autoPlayCount > 0 ? `${autoPlayCount} Giros Restantes` : 'INACTIVO'}
                </div>
            </Draggable>

            {/* 22. WIN OVERLAY */}
            <Draggable index={22} totalCount={TOTAL_DRAGGABLES} id="win" isEnabled={isEditMode} initialPos={positions.win} onDragEnd={onUpdatePos}>
                {lastWin !== null && (
                    <div className="win-number-display" style={{ background: '#000', border: '3px solid #ffd700', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#ffd700', boxShadow: '0 0 20px #ffd700' }}>
                        {lastWin}
                    </div>
                )}
            </Draggable>

            {/* 23. GAME MODE TOGGLE */}
            <Draggable index={23} totalCount={TOTAL_DRAGGABLES} id="modeToggle" isEnabled={isEditMode} initialPos={positions.modeToggle} onDragEnd={onUpdatePos}>
                <button
                    onClick={() => useFinancialStore.getState().toggleMode()}
                    className="ct-control-btn"
                    style={{ background: gameMode === 'REAL' ? '#b71c1c' : '#1b5e20', minWidth: '120px' }}
                >
                    MODO: {gameMode}
                </button>
            </Draggable>

            {/* 24. DOLLAR ICON ($) */}
            <Draggable index={24} totalCount={TOTAL_DRAGGABLES} id="dollarIcon" isEnabled={isEditMode} initialPos={positions.dollarIcon} onDragEnd={onUpdatePos} style={{ zIndex: 4500 }}>
                <button onClick={() => setShowReloadModal(true)} className="ct-round-btn ct-btn-gold" style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}>💲</button>
            </Draggable>

            {/* 25. SCANNER ICON (🔍) */}
            <Draggable index={25} totalCount={TOTAL_DRAGGABLES} id="scannerIcon" isEnabled={isEditMode} initialPos={positions.scannerIcon} onDragEnd={onUpdatePos} style={{ zIndex: 4500 }}>
                <button onClick={() => setShowScanner(true)} className="ct-round-btn ct-btn-gold" style={{ width: '50px', height: '50px', fontSize: '1.5rem', border: '2px solid cyan' }}>📡</button>
            </Draggable>

            {/* 26. METHODS ICON (M) */}
            <Draggable index={26} totalCount={TOTAL_DRAGGABLES} id="methodsIcon" isEnabled={isEditMode} initialPos={positions.methodsIcon} onDragEnd={onUpdatePos} style={{ zIndex: 4500 }}>
                <button onClick={() => setShowMethods(!showMethods)} className="ct-round-btn ct-btn-gold" style={{ width: '50px', height: '50px', fontSize: '1.5rem', border: '2px solid orange' }}>📋</button>
            </Draggable>

            {/* 27. SIGMA ICON (Σ) */}
            <Draggable index={27} totalCount={TOTAL_DRAGGABLES} id="sigmaIcon" isEnabled={isEditMode} initialPos={positions.sigmaIcon} onDragEnd={onUpdatePos} style={{ zIndex: 4500 }}>
                <button onClick={() => setShowSigma(true)} className="ct-round-btn ct-btn-gold" style={{ width: '50px', height: '50px', fontSize: '1.5rem', border: '2px solid magenta' }}>Σ</button>
            </Draggable>

            {/* 28. MODE SWITCH (EXTRA) */}
            <Draggable index={28} totalCount={TOTAL_DRAGGABLES} id="modeSwitch" isEnabled={isEditMode} initialPos={positions.modeSwitch} onDragEnd={onUpdatePos}>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', fontSize: '10px', color: '#666' }}>SYS ENDPOINT: OK</div>
            </Draggable>

            {/* MODALS */}
            {showScanner && <InternalScannerModal onClose={() => setShowScanner(false)} history={roundHistory} />}
            {showSigma && <SystemEfficiencyModal onClose={() => setShowSigma(false)} history={roundHistory} />}
            {showMethods && <MethodsTable onClose={() => setShowMethods(false)} />}
            {showHistoryModal && <DetailedHistoryModal onClose={() => setShowHistoryModal(false)} />}
            {showStrategiesModal && <StrategiesModal onClose={() => setShowStrategiesModal(false)} onApplyStrategy={handleApplyStrategy} />}
            {showRubricModal && <RubricModal onClose={() => setShowRubricModal(false)} />}
            {showAudioSettingsModal && <AudioSettingsModal onClose={() => setShowAudioSettingsModal(false)} />}
            {/* 29. RELOAD MODAL */}
            {(showReloadModal || showBankruptcy) && (
                <ReloadModal
                    onClose={() => {
                        setShowReloadModal(false)
                        setShowBankruptcy(false)
                    }}
                    onReload={handleReloadSubmit}
                    viewCurrency={viewCurrency}
                    rates={DISPLAY_RATES}
                    savedPosition={positions.reloadModal}
                    onPositionUpdate={(pos) => onUpdatePos('reloadModal', pos)}
                    elementIndex={29}
                    totalElements={TOTAL_DRAGGABLES}
                />
            )}
        </div>
    )
}
