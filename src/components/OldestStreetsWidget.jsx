import React, { useMemo } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { ALL_STREETS, optimizeBets } from '../logic/RouletteUtils';
import { ForensicBadge } from './ForensicBadge';

export const OldestStreetsWidget = ({ onBet }) => {
    const history = useFinancialStore(state => state.numberHistory || []);
    const baseWaitThreshold = useFinancialStore(state => state.baseWaitThreshold) || 300;

    const oldestStreets = useMemo(() => {
        if (!history.length) return [];

        const tCalle = Math.round(baseWaitThreshold / 3);

        const streets = ALL_STREETS.map(street => {
            let misses = 0;
            for (let i = history.length - 1; i >= 0; i--) {
                if (street.numbers.includes(history[i])) break;
                misses++;
            }

            // Logic for ID consistent with BettingBoard
            const sorted = [...street.numbers].sort((a, b) => a - b);
            let id = `STREET_${sorted[0]}`;
            if (street.numbers.includes(0)) id = `TRIO_${sorted.join('_')}`;

            const ratio = misses / tCalle;
            return { ...street, misses, ratio, id };
        });

        return streets.sort((a, b) => b.misses - a.misses).slice(0, 5);
    }, [history, baseWaitThreshold]);

    return (
        <div className="panel-tray-dark" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* HEADER */}
            <div className="panel-tray-header" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '5px 8px', background: 'transparent', width: '100%'
            }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <ForensicBadge id="streetsTracker" />
                    <span style={{ color: '#fff' }}>CALLES FRÍAS (E43)</span>
                </span>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, padding: '5px', overflowY: 'auto' }}>
                {oldestStreets.length === 0 ? (
                    <div style={{ color: '#666', fontSize: '0.75rem', textAlign: 'center', padding: '10px' }}>
                        Esperando datos...
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {oldestStreets.map((street, i) => (
                            <div key={street.id}
                                onClick={() => onBet && onBet([street.id])}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: street.ratio >= 1.0 ? 'rgba(255, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                                    padding: '6px 8px', borderRadius: '4px', cursor: 'pointer',
                                    borderLeft: street.ratio >= 1.0 ? '3px solid #ff4444' : '3px solid transparent',
                                    border: street.ratio >= 1.0 ? '1px solid rgba(255, 68, 68, 0.3)' : '1px solid transparent'
                                }}
                                title="Click para apostar"
                            >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                        {street.name.replace('Calle', 'Cal')} {street.ratio >= 1.0 && '🔥'}
                                    </span>
                                    <span style={{ color: '#888', fontSize: '0.7rem' }}>
                                        [{street.numbers.join(', ')}]
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: street.ratio >= 1.0 ? '#ff4444' : '#d4af37', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                        {street.misses}
                                    </div>
                                    <div style={{ color: street.ratio >= 1.0 ? '#ff8888' : '#888', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        {Math.round(street.ratio * 100)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
