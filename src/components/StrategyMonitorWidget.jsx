import React, { useMemo, useState } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { useForensicAnalysis } from '../hooks/useForensicAnalysis';
import JustificationModal from './JustificationModal';
import { ELEMENT_DESCRIPTIONS } from '../config/ElementDescriptions';
import { ForensicBadge } from './ForensicBadge';

export const StrategyMonitorWidget = ({ currentRoundBet, bestPayoutAmount }) => {
    const [showJustification, setShowJustification] = useState(false);
    const { bestCandidate } = useForensicAnalysis();

    // Logic: Nx (Efficiency Ratio)
    const nx = useMemo(() => {
        if (!currentRoundBet || currentRoundBet <= 0) return 0;
        return (bestPayoutAmount / currentRoundBet).toFixed(1);
    }, [bestPayoutAmount, currentRoundBet]);

    // Logic: Tactical Conviction
    const isTierS = bestCandidate?.tier === 'S';
    const isHighNx = parseFloat(nx) >= 10;
    const canAttack = isTierS && isHighNx;

    // Tactical Status Message
    const getStatus = () => {
        if (currentRoundBet === 0) return "ESPERANDO APUESTA";
        if (canAttack) return "ATAQUE SELECTIVO";
        if (isTierS) return "CONVICCIÓN ALTA (NX BAJO)";
        return "OBSERVACIÓN TÁCTICA";
    };

    const statusColor = canAttack ? '#00ffff' : (isTierS ? '#ffd700' : '#888');

    return (
        <div className="panel-tray-dark" style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: canAttack ? '1px solid #00ffff' : '1px solid #333',
            boxShadow: canAttack ? '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.1)' : 'none',
            transition: 'all 0.4s ease'
        }}>
            {/* HEADER */}
            <div className="panel-tray-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ForensicBadge id="strategyMonitorWidget" />
                    <span style={{ color: '#fff', letterSpacing: '1px' }}>MONITOR TÉCNICO</span>
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', fontSize: '1rem'
                    }}
                >
                    ⚖
                </button>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center' }}>

                {/* NX DISPLAY */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>DENSIDAD DE GANANCIA</div>
                    <div style={{
                        fontSize: '3rem',
                        fontFamily: 'Roboto Mono, monospace',
                        fontWeight: '900',
                        color: parseFloat(nx) > 0 ? (isHighNx ? '#00ffff' : '#fff') : '#333',
                        lineHeight: '1',
                        textShadow: isHighNx ? '0 0 15px rgba(0, 255, 255, 0.5)' : 'none'
                    }}>
                        {nx}x
                    </div>
                </div>

                {/* STATUS SIGNAL */}
                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '4px',
                    padding: '8px',
                    borderLeft: `3px solid ${statusColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{ fontSize: '0.65rem', color: statusColor, fontWeight: 'bold', marginBottom: '2px' }}>
                        ESTADO ESTRATÉGICO
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: '#fff',
                        textAlign: 'center',
                        animation: canAttack ? 'pulse 1s infinite' : 'none'
                    }}>
                        {getStatus()}
                    </div>
                </div>
            </div>

            {showJustification && (
                <JustificationModal
                    {...ELEMENT_DESCRIPTIONS[42]}
                    onClose={() => setShowJustification(false)}
                />
            )}
        </div>
    );
};
