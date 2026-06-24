import React, { useMemo } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { REDS } from '../utils/rouletteUtils';

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
        <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
            border: '2px solid #d4af37',
            borderTop: '2px solid #fecb00',
            borderBottom: '2px solid #8a6e20',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.2)',
            color: '#e0e0e0',
            fontFamily: 'Roboto, sans-serif',
            width: '300px',
            maxHeight: '80vh',
            pointerEvents: 'auto'
        }}>
            {/* HEADER */}
            <div style={{
                background: 'linear-gradient(to bottom, #2a2a2a, #151515)',
                borderBottom: '1px solid #443a22',
                padding: '8px 12px',
                borderRadius: '6px 6px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#d4af37', fontFamily: 'Cinzel, serif', fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                marginBottom: '10px'
            }}>
                Últimos 20 / Fríos y Calientes
            </div>

            <div style={{ padding: '10px' }}>

                {/* LAST 20 */}
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>ÚLTIMOS 20</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                        {last20.length === 0 ? <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.8rem' }}>Sin historial...</div> : null}
                        {last20.map((num, i) => (
                            <div key={i} style={i === 0 ? { border: '2px solid gold', borderRadius: '50%', padding: '2px', boxShadow: '0 0 10px gold' } : {}}>
                                <NumberBadge number={num} size={i === 0 ? 44 : 26} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* HOT & COLD */}
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#ff6b6b', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        🔥 CALIENTES
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {hotNumbers.map((item, i) => (
                        <NumberBadge key={i} number={item.num} size={28} />
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '5px' }}>
                <div style={{ fontSize: '0.8rem', color: '#4dabf7', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    ❄️ FRÍOS
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {coldNumbers.map((item, i) => (
                        <NumberBadge key={i} number={item.num} size={28} />
                    ))}
                </div>
            </div>
        </div>
    );
};
