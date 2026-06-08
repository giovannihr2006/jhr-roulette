import React, { useMemo, useState } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { useInternalScanner } from '../hooks/useInternalScanner';
import JustificationModal from './JustificationModal';
import { ELEMENT_DESCRIPTIONS } from '../config/ElementDescriptions';
import { ForensicBadge } from './ForensicBadge';

export const InternalScannerWidget = ({ onBet }) => {
    const [showJustification, setShowJustification] = useState(false);
    const history = useFinancialStore(state => state.numberHistory || []);
    const opportunities = useInternalScanner(history);

    const bestOpportunity = useMemo(() => {
        // Solo aceptamos patrones con al menos 2 Hits (Impactos)
        // para evitar señales falsas de números aleatorios únicos.
        const filtered = opportunities.filter(op => op.hits >= 2 && op.efficiency > 1.1);
        return filtered.length > 0 ? filtered[0] : null;
    }, [opportunities]);

    const handleBet = () => {
        if (!onBet || !bestOpportunity) return;
        onBet([bestOpportunity.betId]);
    };

    if (!bestOpportunity) return (
        <div className="panel-tray-dark" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
            <div className="panel-tray-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'transparent', width: '100%' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <ForensicBadge id="internalScannerWidget" />
                    <span style={{ color: '#fff', letterSpacing: '1px' }}>ESCÁNER MERCADO</span>
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                    style={{
                        width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #00f3ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', color: '#00f3ff', background: 'rgba(20, 20, 20, 0.8)',
                        cursor: 'help', transition: 'all 0.2s', padding: 0
                    }}
                >⚖</button>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#666', fontSize: '1.2rem', fontStyle: 'italic' }}>Escaneando Mercado...</span>
            </div>
            {showJustification && <JustificationModal {...ELEMENT_DESCRIPTIONS[12]} onClose={() => setShowJustification(false)} />}
        </div>
    );

    const isAttack = bestOpportunity.efficiency >= 2.0;

    return (
        <>
            <div
                className="panel-tray-dark"
                onClick={handleBet}
                style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    cursor: 'pointer', transition: 'transform 0.1s',
                    border: `1px solid ${isAttack ? '#00C853' : '#00f3ff'}`,
                    boxShadow: `0 0 10px ${isAttack ? '#00C853' : '#00f3ff'}40`,
                    position: 'relative'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title={`Apostar Mejor Eficiencia: ${bestOpportunity.name}`}
            >
                {/* HEADER */}
                <div className="panel-tray-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'transparent' }}>
                    <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                        <ForensicBadge id="internalScannerWidget" />
                        <span style={{ color: '#fff', letterSpacing: '1px' }}>ESCÁNER MERCADO</span>
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                        style={{
                            width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #00f3ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', color: '#00f3ff', background: 'rgba(20, 20, 20, 0.8)',
                            cursor: 'help', transition: 'all 0.2s', padding: 0
                        }}
                    >⚖</button>
                </div>

                {/* BODY */}
                <div className="panel-tray-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', paddingBottom: '5px' }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

                        {/* LEFT: HITS/EXP */}
                        <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>HITS/ESP</div>
                            <div style={{
                                fontWeight: 'bold', fontSize: '1.6rem', color: '#fff',
                                display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'center'
                            }}>
                                {bestOpportunity.hits}<span style={{ color: '#777', fontSize: '1.2rem' }}>/{parseFloat(bestOpportunity.expected).toFixed(0)}</span>
                            </div>
                        </div>

                        {/* CENTER: PATTERN NAME */}
                        <div style={{ flex: 1.2, textAlign: 'center' }}>
                            <div style={{
                                fontSize: '4.5rem', fontWeight: '900', color: '#fff',
                                textShadow: '0 0 30px rgba(0, 243, 255, 0.5)',
                                lineHeight: '0.9', letterSpacing: '-2px'
                            }}>
                                {(() => {
                                    const name = bestOpportunity.name;
                                    const isLong = name.length > 4;
                                    return <span style={{ fontSize: isLong ? '2.2rem' : '4.5rem' }}>{name}</span>;
                                })()}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#ccc', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '5px' }}>
                                {bestOpportunity.type === 'LINE' ? 'LÍNEA' : bestOpportunity.type}
                            </div>
                        </div>

                        {/* RIGHT: EFFICIENCY & ACTION */}
                        <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                textAlign: 'center', background: 'linear-gradient(135deg, #444, #222)',
                                color: isAttack ? '#00C853' : '#ffd700',
                                padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.4rem',
                                border: `1px solid ${isAttack ? '#00C853' : '#ffd700'}40`, width: 'max-content'
                            }}>
                                {bestOpportunity.efficiency.toFixed(2)}x
                            </div>

                            <div style={{
                                background: isAttack ? '#00C853' : '#D32F2F',
                                color: 'white', fontWeight: '900', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px',
                                border: '1px solid rgba(255,255,255,0.3)', width: 'max-content',
                                textTransform: 'uppercase'
                            }}>
                                {isAttack ? 'ATAQUE' : 'ESPERA'}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM: REFERENCE */}
                    <div style={{
                        width: '100%', background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px',
                        fontSize: '0.85rem', color: '#ddd', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', border: '1px solid #333', textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ color: '#00C853', fontWeight: 'bold', fontSize: '1rem' }}>&gt; 2.0x</span>
                            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>ATAQUE</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid #444', borderRight: '1px solid #444' }}>
                            <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '1rem' }}>1.2-2.0x</span>
                            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>NORMAL</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '1rem' }}>&lt; 0.5x</span>
                            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>FRÍO</span>
                        </div>
                    </div>
                </div>
            </div>
            {showJustification && <JustificationModal {...ELEMENT_DESCRIPTIONS[12]} onClose={() => setShowJustification(false)} />}
        </>
    );
};
