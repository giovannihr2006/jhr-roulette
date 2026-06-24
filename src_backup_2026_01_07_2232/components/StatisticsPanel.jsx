import React, { useMemo } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';

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

export const StatisticsPanel = () => {
    const history = useFinancialStore(state => state.numberHistory || EMPTY_ARRAY);

    // Derived Stats
    const { hotNumbers, coldNumbers, last20 } = useMemo(() => {
        const counts = {};
        const recent = history.slice(-20).reverse(); // Last 20, newest first

        // Count all history
        history.forEach(n => {
            counts[n] = (counts[n] || 0) + 1;
        });

        // Convert to array [num, count]
        const entries = [];
        for (let i = 0; i <= 36; i++) {
            entries.push({ num: i, count: counts[i] || 0 });
        }

        // Hot: sort by count desc
        const hot = [...entries].sort((a, b) => b.count - a.count).slice(0, 5);

        // Cold: sort by count asc (or longest absence, but simple count for now)
        const cold = [...entries].sort((a, b) => a.count - b.count).slice(0, 5);

        return { hotNumbers: hot, coldNumbers: cold, last20: recent };
    }, [history]);

    if (history.length === 0) return null; // Don't show if empty

    return (
        <div style={{
            background: 'rgba(0,0,0,0.85)', padding: '15px', borderRadius: '10px',
            border: '1px solid #444', color: 'white', minWidth: '300px',
            fontFamily: 'Roboto, sans-serif'
        }}>
            <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555', paddingBottom: '5px', color: '#d4af37' }}>
                ESTADÍSTICAS
            </h4>

            {/* LAST 20 */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px' }}>ÚLTIMOS 20</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                    {last20.map((num, i) => (
                        <NumberBadge key={i} number={num} size={24} />
                    ))}
                </div>
            </div>

            {/* HOT & COLD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                {/* HOT */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#ff6b6b', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        🔥 CALIENTES
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {hotNumbers.map((item, i) => (
                            <NumberBadge key={i} number={item.num} size={28} />
                        ))}
                    </div>
                </div>

                {/* COLD */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#4dabf7', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        ❄️ FRÍOS
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {coldNumbers.map((item, i) => (
                            <NumberBadge key={i} number={item.num} size={28} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
