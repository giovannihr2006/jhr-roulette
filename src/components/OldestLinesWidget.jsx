import React, { useMemo } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { ALL_LINES, optimizeBets } from '../logic/RouletteUtils';
import { ForensicBadge } from './ForensicBadge';

export const OldestLinesWidget = ({ onBet }) => {
    const history = useFinancialStore(state => state.numberHistory || []);
    const baseWaitThreshold = useFinancialStore(state => state.baseWaitThreshold) || 300;

    const oldestLines = useMemo(() => {
        if (!history.length) return [];

        const tLine = Math.round(baseWaitThreshold / 6);

        const lines = ALL_LINES.map(line => {
            let misses = 0;
            for (let i = history.length - 1; i >= 0; i--) {
                if (line.numbers.includes(history[i])) break;
                misses++;
            }

            // Logic for ID consistent with BettingBoard
            const sorted = [...line.numbers].sort((a, b) => a - b);
            const start = sorted[0];
            const nextStart = sorted[3];
            const id = `LINE_${start}_${nextStart}`;

            const ratio = misses / tLine;
            return { ...line, misses, ratio, id };
        });

        return lines.sort((a, b) => b.misses - a.misses).slice(0, 5);
    }, [history, baseWaitThreshold]);

    return (
        <div className="panel-tray-dark" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* HEADER */}
            <div className="panel-tray-header" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '5px 8px', background: 'transparent', width: '100%'
            }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <ForensicBadge id="linesTracker" />
                    <span style={{ color: '#fff' }}>LÍNEAS FRÍAS (E44)</span>
                </span>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, padding: '5px', overflowY: 'auto' }}>
                {oldestLines.length === 0 ? (
                    <div style={{ color: '#666', fontSize: '0.75rem', textAlign: 'center', padding: '10px' }}>
                        Esperando datos...
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {oldestLines.map((line, i) => (
                            <div key={line.id}
                                onClick={() => onBet && onBet([line.id])}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: line.ratio >= 1.0 ? 'rgba(255, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                                    padding: '6px 8px', borderRadius: '4px', cursor: 'pointer',
                                    borderLeft: line.ratio >= 1.0 ? '3px solid #ff4444' : '3px solid transparent',
                                    border: line.ratio >= 1.0 ? '1px solid rgba(255, 68, 68, 0.3)' : '1px solid transparent'
                                }}
                                title="Click para apostar"
                            >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                        {line.name.replace('Linea', 'Ln')} {line.ratio >= 1.0 && '🔥'}
                                    </span>
                                    <span style={{ color: '#888', fontSize: '0.7rem' }}>
                                        [{line.numbers[0]}...{line.numbers[5]}]
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: line.ratio >= 1.0 ? '#ff4444' : '#d4af37', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                        {line.misses}
                                    </div>
                                    <div style={{ color: line.ratio >= 1.0 ? '#ff8888' : '#888', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        {Math.round(line.ratio * 100)}%
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
