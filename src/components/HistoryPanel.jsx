import React, { useMemo, useState } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import JustificationModal from './JustificationModal';
import { ELEMENT_DESCRIPTIONS } from '../config/ElementDescriptions';
import { ForensicBadge } from './ForensicBadge';

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const EMPTY_ARRAY = [];

const NumberBadge = ({ number, size = 30 }) => {
    let bg = '#111'; // Black
    if (number === 0) bg = '#28a745'; // Green
    else if (REDS.includes(number)) bg = '#dc3545'; // Red

    return (
        <div style={{
            width: `${size}px`, height: `${size}px`, borderRadius: '50%',
            backgroundColor: bg, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: `${size * 0.5}px`,
            border: '2px solid #fff', margin: '2px'
        }}>
            {number}
        </div>
    );
};

export const HistoryPanel = () => {
    const history = useFinancialStore(state => state.numberHistory || EMPTY_ARRAY);
    const [showJustification, setShowJustification] = useState(false);

    // Derived Stats (Hot/Cold)
    const { hotNumbers, coldNumbers, last20 } = useMemo(() => {
        try {
            const counts = {};
            const recent = history.slice(-20).reverse(); // Last 20, newest first

            // Count all history
            history.forEach(n => {
                counts[n] = (counts[n] || 0) + 1;
            });

            const entries = [];
            for (let i = 0; i <= 36; i++) {
                entries.push({ num: i, count: counts[i] || 0 });
            }

            const hot = [...entries].sort((a, b) => b.count - a.count).slice(0, 5);
            const cold = [...entries].sort((a, b) => a.count - b.count).slice(0, 5);

            return { hotNumbers: hot, coldNumbers: cold, last20: recent };
        } catch (e) {
            console.error("History Calc Error", e)
            return { hotNumbers: [], coldNumbers: [], last20: [] }
        }
    }, [history]);

    if (!history) return null

    return (
        <div
            className="panel-tray-dark"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto', // Allow vertical scroll if wrapping expands height
                overflowX: 'hidden',
                position: 'relative',
                zIndex: 10
            }}
        >
            {showJustification && <JustificationModal {...ELEMENT_DESCRIPTIONS[7]} onClose={() => setShowJustification(false)} />}

            {/* HEADER - USES STANDARD CLASS */}
            <div className="panel-tray-header" style={{
                background: 'transparent', // Let parent handle it if needed or use class default
                borderBottom: '1px solid #443a22',
                padding: '8px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '5px' // Reduced margin
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ForensicBadge id="history" />
                    <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>HISTORIAL & TENDENCIAS</span>
                </div>

                {/* TUTORIAL BUTTON - STANDARD GOLD DESIGN */}
                <div
                    onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                    title="Manual de Inteligencia (Elemento 7)"
                    style={{
                        cursor: 'pointer',
                        border: '1px solid #d4af37',
                        borderRadius: '50%',
                        width: '24px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem',
                        background: 'rgba(212, 175, 55, 0.1)',
                        boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)',
                        transition: 'all 0.2s',
                        color: '#d4af37'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)';
                        e.currentTarget.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.6)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                        e.currentTarget.style.boxShadow = '0 0 5px rgba(212, 175, 55, 0.3)';
                    }}
                >
                    ⚖
                </div>
            </div>

            <div className="panel-tray-content" style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                {/* LAST 20 - HORIZONTAL SCROLL */}
                <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Últimos 20</div>
                    <div className="history-scroll-container" style={{
                        display: 'flex',
                        flexWrap: 'wrap', // Auto-adjust to multi-line
                        gap: '8px 4px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 5px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        {last20.length === 0 ? <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.8rem' }}>Sin historial...</div> : null}
                        {last20.map((num, i) => {
                            const idx = i + 1;
                            const isMarker = [5, 10, 15, 20].includes(idx);
                            return (
                                <div key={i} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={i === 0 ? { border: '2px solid gold', borderRadius: '50%', padding: '1px', boxShadow: '0 0 10px gold' } : {}}>
                                        <NumberBadge number={num} size={i === 0 ? 32 : 22} />
                                    </div>
                                    <span style={{
                                        fontSize: isMarker ? '0.75rem' : '0.6rem',
                                        color: isMarker ? '#fff' : '#666',
                                        marginTop: '2px',
                                        fontWeight: isMarker ? 'bold' : 'normal',
                                        borderBottom: isMarker ? '1px solid #d4af37' : 'none'
                                    }}>
                                        {idx}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* HOT & COLD - RESPONSIVE STACKING */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap', // Stacks if narrow
                    justifyContent: 'center',
                    gap: '15px 10px',
                    paddingTop: '10px',
                    borderTop: '1px solid #333'
                }}>
                    {/* HOT */}
                    <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#ff6b6b', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', justifyContent: 'center' }}>
                            🔥 CALIENTES
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {hotNumbers.map((item, i) => (
                                <NumberBadge key={i} number={item.num} size={22} />
                            ))}
                        </div>
                    </div>

                    {/* COLD */}
                    <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#4dabf7', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', justifyContent: 'center' }}>
                            ❄️ FRÍOS
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {coldNumbers.map((item, i) => (
                                <NumberBadge key={i} number={item.num} size={22} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
