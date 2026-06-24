import React, { useMemo, useState } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { WHEEL_ORDER } from '../utils/rouletteUtils';
import { OFFSETS_0_36, optimizeBets } from '../logic/RouletteUtils';
import JustificationModal from './JustificationModal';
import { ELEMENT_DESCRIPTIONS } from '../config/ElementDescriptions';
import { ForensicBadge } from './ForensicBadge';

// Helper to retrieve exact numbers covered by a specific dynamic sector
const getSystemNumbers = (centerNum, type) => {
    const centerIndex = WHEEL_ORDER.indexOf(centerNum);
    if (centerIndex === -1) return [];

    const getSlice = (start, end) => {
        const nums = [];
        for (let i = start; i <= end; i++) {
            let idx = (centerIndex + i) % 37;
            if (idx < 0) idx += 37;
            nums.push(WHEEL_ORDER[idx]);
        }
        return nums;
    };

    if (type === 'NUCLEO') {
        const nStart = OFFSETS_0_36[centerNum] ? OFFSETS_0_36[centerNum].n[0] : -3;
        const nEnd = OFFSETS_0_36[centerNum] ? OFFSETS_0_36[centerNum].n[1] : 3;
        return getSlice(nStart, nEnd);
    }
    if (type === 'VECINOS') {
        const vStart = OFFSETS_0_36[centerNum] ? OFFSETS_0_36[centerNum].v[0] : -9;
        const vEnd = OFFSETS_0_36[centerNum] ? OFFSETS_0_36[centerNum].v[1] : 9;
        return getSlice(vStart, vEnd);
    }
    return [];
};

export const SystemsWidget = ({ onBet, placedNumbers = [], onToggleTable }) => {
    const history = useFinancialStore(state => state.numberHistory || []);
    const [viewMode, setViewMode] = useState('REC'); // 'REC' (Recommendation) or 'RADAR' (Elite Radar)
    const [showJustification, setShowJustification] = useState(false);

    // --- ELITE PRIORITIZED SYSTEMS DEFINITION ---
    const eliteSystems = useMemo(() => {
        return [
            { id: 'V26', center: 26, type: 'VECINOS', label: 'VECINOS 26', cost: '9F', vol: '9.46', badge: '👑 1°', desc: 'Escudo Cero Core' },
            { id: 'V10', center: 10, type: 'VECINOS', label: 'VECINOS 10', cost: '9F', vol: '9.19', badge: '🛡️ 2°', desc: 'Emperador de Varianza' },
            { id: 'V0', center: 0, type: 'VECINOS', label: 'VECINOS 0', cost: '9F', vol: '9.46', badge: '🛡️ 3°', desc: 'Colchón Cero Absoluto' },
            { id: 'V35', center: 35, type: 'VECINOS', label: 'VECINOS 35', cost: '9F', vol: '9.46', badge: '🎯 4°', desc: 'Flanco Transición' },
            { id: 'N26', center: 26, type: 'NUCLEO', label: 'NUCLEO 26', cost: '4F', vol: '6.30', badge: '💎 5°', desc: 'Jeu Zéro Core' },
            { id: 'N23', center: 23, type: 'NUCLEO', label: 'NUCLEO 23', cost: '4F', vol: '6.30', badge: '⚔️ 6°', desc: 'Tiers Core Shield' }
        ];
    }, []);

    // Helper: Calculate staleness (spins since last hit)
    const getStaleness = (targets) => {
        if (!history || history.length === 0) return 0;
        let count = 0;
        for (let i = history.length - 1; i >= 0; i--) {
            if (targets.includes(history[i])) return count;
            count++;
        }
        return count;
    };

    // Calculate real-time stats for all elite systems
    const radarData = useMemo(() => {
        return eliteSystems.map(sys => {
            const nums = getSystemNumbers(sys.center, sys.type);
            const stale = getStaleness(nums);
            const wait = Math.round(37 / Math.max(nums.length, 1));
            const maturity = Math.round((stale / wait) * 100);
            const optimized = optimizeBets(nums);
            const dynamicCost = `${optimized.length}F`;

            return {
                ...sys,
                nums,
                stale,
                wait,
                maturity,
                cost: dynamicCost
            };
        });
    }, [history, eliteSystems]);

    // Find the single absolute best candidate for the default recommendation view
    // Best based on descending Staleness & Maturity
    const bestSystem = useMemo(() => {
        if (radarData.length === 0) return null;
        const sorted = [...radarData].sort((a, b) => b.stale - a.stale);
        return sorted[0];
    }, [radarData]);

    const handleSystemClick = (sys) => {
        if (onBet && sys.nums && sys.nums.length > 0) {
            const optimizedIds = optimizeBets(sys.nums);
            if (optimizedIds.length > 0) {
                onBet(optimizedIds);
            }
        }
    };

    // Style helper for stale sigma counter
    const getStaleStyle = (count) => {
        if (count === 0) return { color: '#00ff00', textShadow: '0 0 5px rgba(0,255,0,0.5)', fontWeight: 'bold' };
        if (count > 10) return { color: '#ff00ff', textShadow: '0 0 8px #ff00ff', fontWeight: 'bold' };
        if (count > 5) return { color: '#00ffff', textShadow: '0 0 5px #00ffff', fontWeight: 'bold' };
        return { color: '#fff', opacity: 0.8 };
    };

    const isDormancyCritical = bestSystem && bestSystem.stale >= bestSystem.wait * 2;
    const hasActiveBets = bestSystem && bestSystem.nums.some(num => placedNumbers.includes(num));

    return (
        <div className="panel-tray-dark"
            style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                overflow: 'hidden', transition: 'all 0.3s ease',
                background: viewMode === 'RADAR'
                    ? 'linear-gradient(135deg, #0a0e17 0%, #03050a 100%)'
                    : (isDormancyCritical
                        ? 'linear-gradient(135deg, #1e1010 0%, #0d0404 100%)'
                        : (hasActiveBets ? 'rgba(0, 255, 255, 0.15)' : 'rgba(20, 20, 20, 0.95)')),
                boxShadow: viewMode === 'RADAR'
                    ? '0 0 15px rgba(0, 243, 255, 0.2), inset 0 0 10px rgba(0, 243, 255, 0.1)'
                    : (isDormancyCritical
                        ? '0 0 15px rgba(255, 23, 68, 0.3), inset 0 0 10px rgba(255, 23, 68, 0.15)'
                        : (hasActiveBets ? '0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(0, 255, 255, 0.1)' : 'none')),
                border: viewMode === 'RADAR'
                    ? '1px solid rgba(0, 243, 255, 0.4)'
                    : (isDormancyCritical
                        ? '1px solid #ff1744'
                        : (hasActiveBets ? '1px solid rgba(0, 255, 255, 0.5)' : '1px solid rgba(212, 175, 55, 0.3)'))
            }}
        >
            <style>{`
                @keyframes pulseDormancy {
                    0% { opacity: 0.6; transform: scale(0.95); }
                    50% { opacity: 1; transform: scale(1.05); }
                    100% { opacity: 0.6; transform: scale(0.95); }
                }
                .radar-row:hover {
                    background: rgba(0, 243, 255, 0.1) !important;
                }
            `}</style>

            {/* HEADER */}
            <div className="panel-tray-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: 'transparent', flexShrink: 0 }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                    <ForensicBadge id="systemsWidget" />
                    <span style={{ color: viewMode === 'RADAR' ? '#00f3ff' : '#fff', letterSpacing: '1px', textShadow: isDormancyCritical && viewMode !== 'RADAR' ? '0 0 5px rgba(255,23,68,0.5)' : 'none' }}>
                        {viewMode === 'RADAR' ? 'RADAR ELITE 🏆' : 'SISTEMAS'}
                    </span>
                    {isDormancyCritical && viewMode === 'REC' && (
                        <span style={{
                            background: '#ff1744', color: '#fff', fontSize: '0.6rem', fontWeight: '900',
                            padding: '1px 5px', borderRadius: '3px', textTransform: 'uppercase',
                            animation: 'pulseDormancy 1.5s infinite', display: 'inline-block',
                            marginLeft: '2px', letterSpacing: '0.5px'
                        }}>
                            ⚠️ DORM. CRÍTICA
                        </span>
                    )}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* TOGGLE VIEW MODE BUTTON */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setViewMode(prev => prev === 'REC' ? 'RADAR' : 'REC'); }}
                        title={viewMode === 'REC' ? "Ver Radar de Sistemas Élite" : "Ver Recomendación Individual"}
                        style={{
                            background: 'transparent',
                            border: '1px solid ' + (viewMode === 'RADAR' ? '#00f3ff' : '#d4af37'),
                            color: viewMode === 'RADAR' ? '#00f3ff' : '#d4af37',
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: '0 0 5px ' + (viewMode === 'RADAR' ? 'rgba(0,243,255,0.2)' : 'rgba(212,175,55,0.1)')
                        }}
                    >
                        {viewMode === 'REC' ? 'RADAR 📡' : 'VOLVER ↩'}
                    </button>
                    {onToggleTable && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleTable(); }}
                            title="Ver Tabla Completa de Eficiencia"
                            style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                border: '1px solid #d4af37',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '0.75rem',
                                color: '#d4af37',
                                background: 'rgba(20, 20, 20, 0.8)', cursor: 'pointer'
                            }}
                        >
                            📊
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setShowJustification(true); }} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#d4af37', background: 'rgba(20, 20, 20, 0.8)', cursor: 'help' }}>⚖</button>
                </div>
            </div>

            {/* CONTENT LAYER */}
            <div className="panel-tray-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 8px 6px 8px' }}>

                {viewMode === 'RADAR' ? (
                    /* --- VIEW 1: ELITE RADAR LIST (6 Prioritized systems) --- */
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1fr',
                            fontSize: '0.62rem', color: '#666', fontWeight: 'bold',
                            borderBottom: '1px solid #222', paddingBottom: '2px',
                            textAlign: 'center', textTransform: 'uppercase'
                        }}>
                            <div style={{ textAlign: 'left', paddingLeft: '4px' }}>Sistema</div>
                            <div>Costo</div>
                            <div>Varianza</div>
                            <div>Retraso</div>
                            <div>Madurez</div>
                        </div>

                        {/* List Rows */}
                        {radarData.map(sys => {
                            const isRowActive = sys.nums.some(num => placedNumbers.includes(num));
                            return (
                                <div
                                    key={sys.id}
                                    className="radar-row"
                                    onClick={() => handleSystemClick(sys)}
                                    style={{
                                        display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1fr',
                                        fontSize: '0.78rem', color: '#eee', padding: '4px 0',
                                        background: isRowActive ? 'rgba(0, 255, 255, 0.08)' : 'rgba(0,0,0,0.15)',
                                        border: isRowActive ? '1px dashed rgba(0,255,255,0.3)' : '1px solid transparent',
                                        borderRadius: '4px', cursor: 'pointer', textAlign: 'center',
                                        transition: 'all 0.15s', alignItems: 'center'
                                    }}
                                    title={`Click para apostar • ${sys.desc}`}
                                >
                                    {/* System label */}
                                    <div style={{
                                        textAlign: 'left', fontWeight: 'bold', color: '#fff',
                                        paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        <span style={{ fontSize: '0.65rem', color: '#00f3ff' }}>{sys.badge}</span>
                                        {sys.type === 'VECINOS' ? 'V' : 'N'}{sys.center}
                                    </div>
                                    {/* Cost */}
                                    <div style={{ fontFamily: 'monospace', color: '#ffd700', fontWeight: 'bold' }}>{sys.cost}</div>
                                    {/* Volatility */}
                                    <div style={{ fontFamily: 'monospace', color: '#888' }}>{sys.vol}</div>
                                    {/* Stale (Sigma notation!) */}
                                    <div style={{ fontFamily: 'monospace', ...getStaleStyle(sys.stale) }}>{sys.stale}σ</div>
                                    {/* Maturity */}
                                    <div style={{
                                        fontFamily: 'monospace',
                                        color: sys.maturity > 100 ? '#ff9800' : (sys.maturity > 50 ? '#00f3ff' : '#666'),
                                        fontWeight: sys.maturity > 100 ? 'bold' : 'normal'
                                    }}>
                                        {sys.maturity}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* --- VIEW 2: SINGLE BEST RECOMMENDATION (Original Premium Layout) --- */
                    bestSystem && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                {/* Left Column: Wait / Expected */}
                                <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>RETRASO</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.7rem', color: isDormancyCritical ? '#ff1744' : '#fff' }}>
                                        {bestSystem.stale}σ
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#666', fontFamily: 'monospace' }}>ESP: {bestSystem.wait}σ</div>
                                </div>

                                {/* Center Column: System Identifier */}
                                <div style={{ flex: 1.2, textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSystemClick(bestSystem)} title="Click para apostar recomendado">
                                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', lineHeight: '1', letterSpacing: '-1px' }}>
                                        {bestSystem.label}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#ccc', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '3px' }}>
                                        {bestSystem.badge} RECOMENDADO
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#ff9800', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '2px' }}>
                                        MADUREZ: {bestSystem.maturity}%
                                    </div>
                                </div>

                                {/* Right Column: Cost & Action */}
                                <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <div style={{
                                        textAlign: 'center',
                                        background: isDormancyCritical ? 'linear-gradient(135deg, #3a0007, #1a0003)' : 'linear-gradient(135deg, #333, #1a1a1a)',
                                        color: '#ffd700',
                                        padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.2rem',
                                        border: isDormancyCritical ? '1px solid #ff1744' : '1px solid rgba(212, 175, 55, 0.4)',
                                        width: 'max-content'
                                    }}>
                                        {bestSystem.cost}
                                    </div>
                                    <div style={{
                                        background: isDormancyCritical ? '#ff1744' : (bestSystem.maturity >= 100 ? '#00C853' : '#ce93d8'),
                                        color: 'white', fontWeight: '900', fontSize: '0.72rem',
                                        padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase'
                                    }}>
                                        {isDormancyCritical ? 'BREAKOUT' : (bestSystem.maturity >= 100 ? 'ATAQUE' : 'ESPERA')}
                                    </div>
                                </div>
                            </div>

                            {/* Reference Footer */}
                            <div style={{
                                width: '100%', background: 'rgba(0,0,0,0.4)', padding: '6px', borderRadius: '6px',
                                fontSize: '0.75rem', color: '#ddd', display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '2px', border: '1px solid #222', textAlign: 'center'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '0.9rem' }}>{bestSystem.vol}</span>
                                    <span style={{ fontSize: '0.65rem', color: '#888' }}>VARIANZA</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid #333', borderRight: '1px solid #333', padding: '0 2px' }}>
                                    <span style={{ color: '#00f3ff', fontWeight: 'bold', fontSize: '0.82rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%' }}>
                                        {bestSystem.desc}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: '#888' }}>TIPO</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ color: '#00C853', fontWeight: 'bold', fontSize: '0.9rem' }}>{bestSystem.nums.length}N</span>
                                    <span style={{ fontSize: '0.65rem', color: '#888' }}>COBERTURA</span>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
            {showJustification && <JustificationModal {...ELEMENT_DESCRIPTIONS[13]} onClose={() => setShowJustification(false)} />}
        </div>
    );
};
