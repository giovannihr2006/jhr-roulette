import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useInternalScanner } from '../hooks/useInternalScanner';

// --- STYLES (Inline for portability as per project style) ---
const MODAL_OVERLAY_STYLE = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.92)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)'
};

const MODAL_CONTENT_STYLE = {
    background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
    border: '1px solid #333', borderRadius: '12px',
    boxShadow: '0 0 50px rgba(0,0,0,0.8)',
    width: '90vw', maxWidth: '1200px', height: '85vh',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    fontFamily: 'Roboto Mono, monospace'
};

// Add Global Style for Animation (Cleaned)

const InternalScannerModal = ({ isOpen, onClose, numberHistory, onBatchBet, selectedChip }) => {
    // 1. Data Analysis
    // Analyze ALL history (or last 300 for meaningful stats? User implied "analyzed cylinder/simples", implies full history)
    // Using full history passed from prop.
    const opportunities = useInternalScanner(numberHistory || []);

    // 2. Filters
    const [filterType, setFilterType] = useState('ALL');
    const [minEfficiency, setMinEfficiency] = useState(0); // 0 = No filter per user request "damelos todos"

    const filteredData = useMemo(() => {
        return opportunities.filter(op => {
            if (filterType !== 'ALL' && op.type !== filterType) return false;
            // if (op.efficiency < minEfficiency) return false; // Filter disabled for now
            return true;
        });
    }, [opportunities, filterType]);

    if (!isOpen) return null;

    // Verificar que el DOM esté disponible para el portal
    if (typeof document === 'undefined' || !document.body) return null;

    // Helper for betting
    const handleBet = (pattern) => {
        if (onBatchBet && selectedChip) {
            // Pattern has a unique 'betId' field (e.g. SPLIT_1_2)
            // OR we can pass the explicit numbers (better for complex patterns if IDs aren't standard in board)
            // The BettingBoard logic supports batch definitions?
            // useRouletteLogic -> handleBatchBets takes IDs.
            // internalPatterns.js assigns betIds compatible with BettingBoard logic (hopefully).
            // Let's pass the single ID as a batch of 1 to reuse the batch logic which handles arrays.
            onBatchBet([pattern.betId], selectedChip);
        }
    };

    return createPortal(
        <div style={MODAL_OVERLAY_STYLE} onClick={onClose}>
            <div style={MODAL_CONTENT_STYLE} onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #333', background: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, color: '#b388ff', fontSize: '1.4rem', textTransform: 'uppercase' }}>
                            🔍 Scanner de Mercado Interno
                        </h2>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                            {opportunities.length} Patrones Analizados
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '5px' }}
                        >
                            <option value="ALL">Todos</option>
                            <option value="STRAIGHT">Plenos</option>
                            <option value="SPLIT">Caballos</option>
                            <option value="STREET">Calles</option>
                            <option value="CORNER">Cuadros</option>
                            <option value="LINE">Líneas</option>
                        </select>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                    </div>
                </div>

                {/* TABLE */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd', fontSize: '0.9rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#222', zIndex: 10 }}>
                            <tr>
                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #444' }}>Patrón</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #444' }}>Tipo</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #444' }}>Números</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #444' }}>Aciertos</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #444' }}>Esperado</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #444', color: '#4fc3f7' }}>F/N (Eficiencia)</th>
                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #444' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, idx) => {
                                const isHot = row.efficiency >= 2.0;
                                const isWarm = row.efficiency >= 1.5;
                                const bg = idx % 2 === 0 ? '#161616' : '#1c1c1c';

                                return (
                                    <tr key={idx} style={{ background: bg, borderLeft: isHot ? '4px solid #00e676' : '4px solid transparent' }}>
                                        <td
                                            onClick={() => handleBet(row)}
                                            style={{ padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold', color: isHot ? '#fff' : '#aaa', textDecoration: 'underline' }}
                                            title="Click para apostar"
                                        >
                                            {row.name} (#{row.numbers.length})
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{row.type === 'LINE' ? 'LÍNEA' : row.type} (#{row.numbers.length})</td>
                                        <td style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
                                            {row.numbers.length > 6 ? row.numbers.length + ' nums' : row.numbers.join(', ')}
                                        </td>
                                        <td style={{ textAlign: 'center', color: isHot ? '#00e676' : '#fff' }}>{row.hits}</td>
                                        <td style={{ textAlign: 'center', color: '#888' }}>{row.expected}</td>
                                        <td style={{
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            color: isHot ? '#00e676' : (isWarm ? '#ffd700' : '#888'),
                                            fontSize: '1.1rem'
                                        }}>
                                            {row.efficiency.toFixed(2)}x
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                background: isHot ? 'rgba(0, 230, 118, 0.2)' : (isWarm ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.05)'),
                                                color: isHot ? '#00e676' : (isWarm ? '#ffd700' : '#666')
                                            }}>
                                                {row.rating}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default InternalScannerModal;
