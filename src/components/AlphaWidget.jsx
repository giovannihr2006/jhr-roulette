import React, { useMemo, useState } from 'react';
import { useForensicAnalysis } from '../hooks/useForensicAnalysis';
import { optimizeBets, getBetType } from '../logic/RouletteUtils';
import { WHEEL_ORDER } from '../utils/rouletteUtils';
import JustificationModal from './JustificationModal';
import { ELEMENT_DESCRIPTIONS } from '../config/ElementDescriptions';
import { ForensicBadge } from './ForensicBadge';
import { useFinancialStore } from '../logic/FinancialSimulator';

export const AlphaWidget = ({ onBet, placedNumbers = [] }) => {
    const { bestCandidate } = useForensicAnalysis();
    const history = useFinancialStore(state => state.numberHistory);
    const [showJustification, setShowJustification] = useState(false);

    // Reconstruct target numbers for the current candidate (Memoized for Visual & Action logic)
    const candidateNumbers = useMemo(() => {
        if (!bestCandidate) return [];
        let nums = [];
        if (bestCandidate.isStandardBet) {
            nums = bestCandidate.targetNums || [];
        } else {
            const centerIndex = WHEEL_ORDER.indexOf(bestCandidate.num);
            if (bestCandidate.code === 'N') {
                for (let i = -3; i <= 3; i++) nums.push(WHEEL_ORDER[(centerIndex + i + 37000) % 37]);
            } else if (bestCandidate.code === 'V') {
                for (let i = -9; i <= 7; i++) nums.push(WHEEL_ORDER[(centerIndex + i + 37000) % 37]);
            } else if (bestCandidate.code === 'T') {
                for (let i = 11; i <= 22; i++) nums.push(WHEEL_ORDER[(centerIndex + i + 37000) % 37]);
            } else if (bestCandidate.code === 'H') {
                for (let i = 8; i <= 10; i++) nums.push(WHEEL_ORDER[(centerIndex + i + 37000) % 37]);
                for (let i = 23; i <= 27; i++) nums.push(WHEEL_ORDER[(centerIndex + i + 37000) % 37]);
            }
        }
        return nums;
    }, [bestCandidate]);

    // Maturity Calculation
    const maturity = useMemo(() => {
        if (!candidateNumbers.length || !history || history.length === 0) return 0;

        let stale = 0;
        for (let i = history.length - 1; i >= 0; i--) {
            if (candidateNumbers.includes(history[i])) break;
            stale++;
        }

        const count = candidateNumbers.length;
        const wait = Math.round(37 / Math.max(count, 1));
        return Math.round((stale / wait) * 100);
    }, [candidateNumbers, history]);

    const handleBet = () => {
        if (!onBet || candidateNumbers.length === 0) return;
        const bets = optimizeBets(candidateNumbers);
        onBet(bets);
    };

    // Derived properties
    const tierColor = bestCandidate?.tier === 'S' ? '#ffd700' : (bestCandidate?.tier === 'A' ? '#e0e0e0' : '#ff4444');
    const hasActiveBets = candidateNumbers.length > 0 && candidateNumbers.some(num => placedNumbers.includes(num));

    if (!bestCandidate) return (
        <div className="panel-tray-dark" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
            <div className="panel-tray-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'transparent', width: '100%' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <ForensicBadge id="alphaWidget" />
                    <span style={{ color: '#fff', letterSpacing: '1px' }}>MEJOR ALPHA</span>
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                    title="Ver Justificación Forense (E35)"
                    style={{
                        width: '26px', height: '26px',
                        borderRadius: '50%',
                        border: '1px solid #d4af37',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', color: '#d4af37', background: 'rgba(20, 20, 20, 0.8)',
                        cursor: 'help',
                        transition: 'all 0.2s',
                        padding: 0,
                        boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.6)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 5px rgba(212, 175, 55, 0.3)'; }}
                >
                    ⚖
                </button>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#666', fontSize: '1.2rem', fontStyle: 'italic' }}>Calculando Alpha...</span>
            </div>
            {showJustification && (
                <JustificationModal
                    {...ELEMENT_DESCRIPTIONS[35]}
                    onClose={() => setShowJustification(false)}
                />
            )}
        </div>
    );

    return (
        <div
            className="panel-tray-dark"
            onClick={handleBet}
            style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: hasActiveBets ? 'rgba(0, 255, 255, 0.15)' : 'rgba(20, 20, 20, 0.95)',
                border: hasActiveBets ? '1px solid rgba(0, 255, 255, 0.6)' : `1px solid ${tierColor}`,
                boxShadow: hasActiveBets
                    ? `0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)`
                    : `0 0 10px ${tierColor}40`,
                position: 'relative',
                animation: bestCandidate.tier === 'S' ? 'pulseGold 1.5s infinite ease-in-out' : 'none'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title={`Apostar Mejor Alpha: ${bestCandidate.type} ${bestCandidate.num}`}
        >
            {/* HEADER */}
            <div className="panel-tray-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'transparent' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <ForensicBadge id="alphaWidget" />
                    <span style={{ color: '#fff', letterSpacing: '1px' }}>MEJOR ALPHA</span>
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                    title="Ver Justificación Forense (E35)"
                    style={{
                        width: '26px', height: '26px',
                        borderRadius: '50%',
                        border: '1px solid #d4af37',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', color: '#d4af37', background: 'rgba(20, 20, 20, 0.8)',
                        cursor: 'help',
                        transition: 'all 0.2s',
                        padding: 0,
                        boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.6)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 5px rgba(212, 175, 55, 0.3)'; }}
                >
                    ⚖
                </button>
            </div>

            {/* BODY - REFACTORED FOR SIDE SPACE USAGE */}
            <div className="panel-tray-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', paddingBottom: '5px' }}>

                {/* MAIN ROW: [ SCORE ] [ NUMBER ] [ ALPHA/ACTION ] */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

                    {/* LEFT: SCORE */}
                    <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>SCORE</div>
                        <div style={{
                            fontWeight: 'bold', fontSize: '1.9rem',
                            color: bestCandidate.activeScore > 4.0 ? '#ff4444' : (bestCandidate.activeScore >= 2.0 ? '#ffd700' : '#00bfff'),
                            textShadow: bestCandidate.activeScore > 4.0 ? '0 0 10px #ff0000' : 'none',
                            display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'center'
                        }}>
                            {bestCandidate.activeScore.toFixed(2)}
                            <span style={{ fontSize: '1.2rem' }}>
                                {bestCandidate.activeScore > 4.0 ? '🔥' : (bestCandidate.activeScore >= 2.0 ? '☀️' : '❄️')}
                            </span>
                        </div>
                    </div>

                    {/* CENTER: NUMBER */}
                    <div style={{ flex: 1.2, textAlign: 'center' }}>
                        <div style={{
                            fontSize: '4.5rem', fontWeight: '900', color: '#fff',
                            textShadow: `0 0 30px ${tierColor}80`,
                            lineHeight: '0.9', letterSpacing: '-3px'
                        }}>
                            {(() => {
                                const valStr = String(bestCandidate.num);
                                const isLong = valStr.length > 3;
                                return (
                                    <span style={{ fontSize: isLong ? '2.2rem' : '4.5rem' }}>
                                        {valStr}
                                    </span>
                                )
                            })()}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#ccc', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '5px', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                            {bestCandidate.type} <span style={{ color: tierColor }}>T-{bestCandidate.tier}</span>
                        </div>
                        {/* MATURITY DISPLAY */}
                        <div style={{ fontSize: '0.8rem', color: '#ff9800', fontWeight: 'bold', marginTop: '2px', textShadow: '0 0 5px rgba(255, 152, 0, 0.5)' }}>
                            MAD: {maturity}%
                        </div>
                    </div>

                    {/* RIGHT: ALPHA & ACTION */}
                    <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            textAlign: 'center', background: 'linear-gradient(135deg, #444, #222)', color: tierColor,
                            padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.4rem',
                            border: `1px solid ${tierColor}40`, width: 'max-content'
                        }}>
                            α {(parseFloat(bestCandidate.nAlpha || bestCandidate.vAlpha || bestCandidate.tAlpha || bestCandidate.hAlpha || 0)).toFixed(1)}
                        </div>
                        {/* BADGE INTEGRATED HERE */}
                        <div style={{
                            background: (bestCandidate.tier === 'S' && bestCandidate.activeScore > 3.0) ? '#00C853' : '#D32F2F',
                            color: 'white', fontWeight: '900', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px',
                            animation: (bestCandidate.tier === 'S' && bestCandidate.activeScore > 3.0) ? 'flashText 1s infinite ease-in-out' : 'none',
                            border: '1px solid rgba(255,255,255,0.3)', width: 'max-content',
                            textTransform: 'uppercase'
                        }}>
                            {(bestCandidate.tier === 'S' && bestCandidate.activeScore > 3.0) ? 'ATAQUE' : 'ESPERA'}
                        </div>
                    </div>
                </div>

                {/* BOTTOM: REFERENCE TABLE (Full Width) */}
                <div style={{
                    width: '100%', background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px',
                    fontSize: '0.85rem', color: '#ddd', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', border: '1px solid #333', textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
                        <span style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '1rem' }}>&gt; 4.0 🔥</span>
                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>INFIERNO</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', borderLeft: '1px solid #444', borderRight: '1px solid #444' }}>
                        <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '1rem' }}>2.0-4.0 ☀️</span>
                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>CALIENTE</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
                        <span style={{ color: '#00bfff', fontWeight: 'bold', fontSize: '1rem' }}>&lt; 2.0 ❄️</span>
                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>FRÍO</span>
                    </div>
                </div>
            </div>
            {showJustification && (
                <JustificationModal
                    {...ELEMENT_DESCRIPTIONS[35]}
                    onClose={() => setShowJustification(false)}
                />
            )}
        </div>
    );
};
