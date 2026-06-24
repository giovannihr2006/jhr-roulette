import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// --- LOGIC ENGINE ---
const NUMBERS = Array.from({ length: 37 }, (_, i) => i);
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const isRed = (n) => n !== 0 && REDS.includes(n);
const isBlack = (n) => n !== 0 && !REDS.includes(n);
const isEven = (n) => n !== 0 && n % 2 === 0;
const isOdd = (n) => n !== 0 && n % 2 !== 0;
const isLow = (n) => n >= 1 && n <= 18;
const isHigh = (n) => n >= 19 && n <= 36;

const getCol = (c) => NUMBERS.filter(n => n !== 0 && n % 3 === (c === 3 ? 0 : c));
const getDoz = (d) => NUMBERS.filter(n => n !== 0 && Math.ceil(n / 12) === d);

const CONTAINERS = [
    { name: 'Columna 1', id: 'COL1', nums: getCol(1), type: 'COL' },
    { name: 'Columna 2', id: 'COL2', nums: getCol(2), type: 'COL' },
    { name: 'Columna 3', id: 'COL3', nums: getCol(3), type: 'COL' },
    { name: 'Docena 1', id: 'DOZ1', nums: getDoz(1), type: 'DOZ' },
    { name: 'Docena 2', id: 'DOZ2', nums: getDoz(2), type: 'DOZ' },
    { name: 'Docena 3', id: 'DOZ3', nums: getDoz(3), type: 'DOZ' }
];

const ATTRIBUTES = [
    { name: 'Rojo', prop: 'red', check: isRed, color: '#e57373' },
    { name: 'Negro', prop: 'black', check: isBlack, color: '#90a4ae' }, // Grey-Blue
    { name: 'Par', prop: 'even', check: isEven, color: '#64b5f6' }, // Blue
    { name: 'Impar', prop: 'odd', check: isOdd, color: '#81c784' }, // Green
    { name: 'Bajo (1-18)', prop: 'low', check: isLow, color: '#fff176' }, // Yellow
    { name: 'Alto (19-36)', prop: 'high', check: isHigh, color: '#ffb74d' }  // Orange
];

const SimpleEfficiencyModal = ({ onClose, onBatchBet, currentBets }) => {
    const [data, setData] = useState([]);
    const [complexCombos, setComplexCombos] = useState([]);

    // --- COMPLEX COMBOS LOGIC ---
    const calculateComplexCombos = () => {
        const combos = [];
        CONTAINERS.forEach(cont => {
            // 2-Factor: Cont + Attr1 + Attr2
            ATTRIBUTES.forEach(attr1 => {
                const nums1 = cont.nums.filter(attr1.check);
                ATTRIBUTES.forEach(attr2 => {
                    if (attr1 === attr2) return;
                    // Avoid conflict/duplicates
                    if (
                        (attr1.prop === 'red' && attr2.prop === 'black') || (attr1.prop === 'black' && attr2.prop === 'red') ||
                        (attr1.prop === 'even' && attr2.prop === 'odd') || (attr1.prop === 'odd' && attr2.prop === 'even') ||
                        (attr1.prop === 'low' && attr2.prop === 'high') || (attr1.prop === 'high' && attr2.prop === 'low')
                    ) return;
                    if (attr1.name > attr2.name) return; // Unique order

                    const nums2 = nums1.filter(attr2.check);
                    // Only keep if meaningful density (>= 4 numbers out of 12 is baseline, but we want Super clusters >= 5)
                    if (nums2.length >= 4) {
                        combos.push({
                            id: cont.id, // Parent Bet
                            name: `${cont.name}`,
                            attrs: [attr1, attr2],
                            count: nums2.length,
                            nums: nums2
                        });
                    }
                });
            });
        });
        // Sort by Count DESC
        return combos.sort((a, b) => b.count - a.count).slice(0, 16);
    };

    useEffect(() => {
        const results = [];
        CONTAINERS.forEach(cont => {
            const row = {
                name: cont.name,
                id: cont.id,
                total: 12
            };

            ATTRIBUTES.forEach(attr => {
                const count = cont.nums.filter(attr.check).length;
                row[attr.prop] = {
                    count,
                    fraction: `${count}/12`,
                    decimal: (count / 12).toFixed(3),
                    efficiency: count / 12
                };
            });
            results.push(row);
        });
        setData(results);
        setComplexCombos(calculateComplexCombos());
    }, []);

    const handleContainerClick = (betId) => {
        if (onBatchBet && betId) {
            // Place ONE chip on the container (simplest way to catch the cluster)
            onBatchBet([betId]);
        }
    };

    const renderCell = (cellData, attr, betId) => {
        // Richness Highlight: > 0.5 (6/12) is Rich (e.g. 8/12). == 0.5 is Neutral. < 0.5 is Poor.
        const isRich = cellData.efficiency > 0.5;
        const isVeryRich = cellData.efficiency >= 0.66; // 8/12 or more
        const isPoor = cellData.efficiency < 0.5;

        // Highlight if the container is currently bet on
        // currentBets is likely object { 'COL1': 100, ... } or similar structure
        // We need to parse keys.
        const active = currentBets && Object.keys(currentBets).includes(betId);

        return (
            <td
                onClick={() => handleContainerClick(betId)}
                style={{
                    padding: '2px 4px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: active
                        ? 'rgba(0, 255, 0, 0.2)'
                        : isRich ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    border: active ? '1px solid #0f0' : isRich ? '1px dashed #444' : '1px solid #222',
                    transition: 'all 0.2s'
                }}
                title={`Click to bet on ${betId} (Captures ${cellData.count} ${attr.name}s)`}
            >
                <div style={{
                    fontSize: '1.2em',
                    fontWeight: isVeryRich ? 'bold' : 'normal',
                    color: active ? '#fff' : isVeryRich ? '#ffd700' : isPoor ? '#666' : attr.color
                }}>
                    {cellData.fraction}
                </div>
                <div style={{ fontSize: '0.75em', color: active ? '#ddd' : '#888' }}>
                    {cellData.decimal}
                </div>
                {isVeryRich && <span style={{ fontSize: '0.8em' }}>🔥</span>}
            </td>
        );
    };

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.92)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div style={{
                background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                border: '1px solid #333',
                borderRadius: '20px',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                width: '90vw',
                height: '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '20px 30px',
                    borderBottom: '1px solid #333',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#111'
                }}>
                    <h2 style={{
                        margin: 0, color: '#4fc3f7', fontSize: '1.5rem',
                        textTransform: 'uppercase', letterSpacing: '1px',
                        fontFamily: 'Roboto Mono, monospace'
                    }}>
                        RANKING DE EFICIENCIA SIMPLE (S)
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', color: '#888',
                        fontSize: '2rem', cursor: 'pointer', lineHeight: '1'
                    }}>&times;</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    <table style={{ width: 'auto', margin: '0 auto', borderCollapse: 'collapse', color: '#ccc', fontFamily: 'Roboto Mono, monospace', fontSize: '1rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#111', zIndex: 10 }}>
                            <tr>
                                <th style={{ padding: '4px 4px', textAlign: 'left', borderBottom: '2px solid #555', color: '#fff' }}>CONTENEDOR</th>
                                {ATTRIBUTES.map(attr => (
                                    <th key={attr.name} style={{ padding: '4px 4px', textAlign: 'center', borderBottom: `2px solid ${attr.color}`, color: attr.color }}>
                                        {attr.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={row.id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '2px 2px', fontWeight: 'bold', color: '#fff', borderRight: '1px solid #333' }}>
                                        {row.name} <span style={{ fontSize: '0.8em', color: '#666' }}>(12)</span>
                                    </td>
                                    {ATTRIBUTES.map(attr => renderCell(row[attr.prop], attr, row.id))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* COMPLEX COMBOS SECTION */}
                    <div style={{ marginTop: '20px', padding: '0 20px' }}>
                        <h3 style={{ color: '#ffd700', fontFamily: 'Roboto Mono', textTransform: 'uppercase', fontSize: '1.1rem', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                            💎 Combinaciones Maestras (Top Densidad)
                        </h3>
                        <table style={{ width: 'auto', margin: '10px auto', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #444', color: '#888', fontSize: '0.8rem', textAlign: 'left' }}>
                                    <th style={{ padding: '2px 4px' }}>MÓDULO</th>
                                    <th style={{ padding: '2px 4px' }}>COMBINACIÓN</th>
                                    <th style={{ padding: '2px 4px', textAlign: 'right' }}>NÚMEROS</th>
                                    <th style={{ padding: '2px 4px', textAlign: 'right' }}>EFIC %</th>
                                    <th style={{ padding: '2px 4px', textAlign: 'center' }}>VALORACIÓN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complexCombos.map((combo, idx) => {
                                    const isTopPick = idx < 3; // Highlight top 3
                                    let rating = { text: 'NORMAL', color: '#666', icon: '' };
                                    if (combo.count >= 5) rating = { text: 'EXCELENTE', color: '#ffd700', icon: '💎' };
                                    else if (combo.count === 4) rating = { text: 'MUY BUENA', color: '#81c784', icon: '⭐' };

                                    return (
                                        <tr
                                            key={idx}
                                            onClick={() => handleContainerClick(combo.id)}
                                            style={{
                                                borderBottom: '1px solid #222',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                transition: 'background 0.2s',
                                                background: isTopPick ? 'rgba(255, 215, 0, 0.08)' : 'transparent',
                                                borderLeft: isTopPick ? '2px solid #ffd700' : 'none'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,215,0,0.15)'}
                                            onMouseOut={e => e.currentTarget.style.background = isTopPick ? 'rgba(255, 215, 0, 0.08)' : 'transparent'}
                                        >
                                            <td style={{ padding: '2px 4px', color: '#fff', fontWeight: 'bold' }}>
                                                {combo.name}
                                            </td>
                                            <td style={{ padding: '2px 4px' }}>
                                                <span style={{ color: combo.attrs[0].color }}>{combo.attrs[0].name}</span>
                                                <span style={{ color: '#666', margin: '0 4px' }}>+</span>
                                                <span style={{ color: combo.attrs[1].color }}>{combo.attrs[1].name}</span>
                                            </td>
                                            <td style={{ padding: '2px 4px', textAlign: 'right', color: isTopPick ? '#ffd700' : '#888', fontWeight: 'bold' }}>
                                                {combo.count}
                                            </td>
                                            <td style={{ padding: '2px 4px', textAlign: 'right', color: '#666', fontFamily: 'monospace' }}>
                                                {((combo.count / 12) * 100).toFixed(1)}%
                                            </td>
                                            <td style={{ padding: '2px 4px', textAlign: 'center', color: rating.color, fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                {rating.icon} {rating.text}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* STRATEGY EXPLANATION */}
                        <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 235, 59, 0.05)', borderRadius: '4px', border: '1px solid rgba(255, 235, 59, 0.3)', fontSize: '0.85rem', color: '#ccc', maxWidth: '550px', margin: '15px auto' }}>
                            <div style={{ color: '#ffeb3b', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>⚠️ AUDITORÍA FORENSE: REGLA 5X UNIFICADA</div>
                            <div style={{ textAlign: 'center', marginBottom: '8px', color: '#fff' }}>
                                Todas las apuestas externas (Simples, Docenas y Columnas) requieren <strong>5 unidades</strong>.
                            </div>
                            <div style={{ lineHeight: '1.4', textAlign: 'justify' }}>
                                <strong>Análisis de Valor:</strong> Bajo esta regla, las Docenas y Columnas con alta densidad (ej. 8/12) son superiores a las Suertes Sencillas (Rojo/Par).
                                <br />
                                <span style={{ color: '#81c784', display: 'block', marginTop: '5px', textAlign: 'center' }}>
                                    <em>¡Busca la máxima concentración de números por el mismo costo de 5 fichas!</em>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SimpleEfficiencyModal;
