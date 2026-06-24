import React, { useMemo, useState } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { createPortal } from 'react-dom';
import JustificationModal from './JustificationModal';
import { ELEMENT_DESCRIPTIONS } from '../config/ElementDescriptions';
import { getCoveredNumbers } from '../logic/RouletteUtils';
import { ForensicBadge } from './ForensicBadge';

// --- SHARED UTILS (Extracted from MethodsTable) ---
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const isRed = (n) => REDS.includes(n);
const isBlack = (n) => n !== 0 && !REDS.includes(n);
const isEven = (n) => n !== 0 && n % 2 === 0;
const isOdd = (n) => n !== 0 && n % 2 !== 0;
const isLow = (n) => n >= 1 && n <= 18;
const isHigh = (n) => n >= 19 && n <= 36;
const isDoc1 = (n) => n >= 1 && n <= 12;
const isDoc2 = (n) => n >= 13 && n <= 24;
const isDoc3 = (n) => n >= 25 && n <= 36;
const isCol1 = (n) => n !== 0 && n % 3 === 1;
const isCol2 = (n) => n !== 0 && n % 3 === 2;
const isCol3 = (n) => n !== 0 && n % 3 === 0;

const calculateEconomics = (bajoAlto, color, parImpar, docCol) => {
    let safetyCount = 0; let powerCount = 0; let totalNet = 0;
    for (let n = 0; n <= 36; n++) {
        let returns = 0;
        if (n !== 0) {
            if (bajoAlto === 'BAJO' && isLow(n)) returns += 2; else if (bajoAlto === 'ALTO' && isHigh(n)) returns += 2;
            if (color === 'NEGRO' && isBlack(n)) returns += 2; else if (color === 'ROJO' && isRed(n)) returns += 2;
            if (parImpar === 'PAR' && isEven(n)) returns += 2; else if (parImpar === 'IMPAR' && isOdd(n)) returns += 2;
            if (docCol.includes('DOC')) {
                const d1 = docCol.includes('1RA'), d2 = docCol.includes('2DA');
                if ((d1 && isDoc1(n)) || (d2 && isDoc2(n)) || (!d1 && !d2 && isDoc3(n))) returns += 3;
            } else {
                const c1 = docCol.includes('1RA'), c2 = docCol.includes('2DA');
                if ((c1 && isCol1(n)) || (c2 && isCol2(n)) || (!c1 && !c2 && isCol3(n))) returns += 3;
            }
        }
        const net = returns - 4; totalNet += net;
        if (net >= 0) safetyCount++; if (net > 0) powerCount++;
    }
    return { safety: (safetyCount / 37) * 100, power: (powerCount / 37) * 100, ev: totalNet / 37 };
};

const generateMethods = () => {
    const pattern = [
        [1, 'BAJO', 'NEGRO', 'PAR', '1RA DOC'], [2, 'BAJO', 'NEGRO', 'PAR', '2DA DOC'], [3, 'BAJO', 'NEGRO', 'PAR', '3RA DOC'],
        [4, 'BAJO', 'NEGRO', 'PAR', '1RA COL'], [5, 'BAJO', 'NEGRO', 'PAR', '2DA COL'], [6, 'BAJO', 'NEGRO', 'PAR', '3RA COL'],
        [7, 'ALTO', 'NEGRO', 'PAR', '1RA DOC'], [8, 'ALTO', 'NEGRO', 'PAR', '2DA DOC'], [9, 'ALTO', 'NEGRO', 'PAR', '3RA DOC'],
        [10, 'ALTO', 'NEGRO', 'PAR', '1RA COL'], [11, 'ALTO', 'NEGRO', 'PAR', '2DA COL'], [12, 'ALTO', 'NEGRO', 'PAR', '3RA COL'],
        [13, 'BAJO', 'NEGRO', 'IMPAR', '1RA DOC'], [14, 'BAJO', 'NEGRO', 'IMPAR', '2DA DOC'], [15, 'BAJO', 'NEGRO', 'IMPAR', '3RA DOC'],
        [16, 'BAJO', 'NEGRO', 'IMPAR', '1RA COL'], [17, 'BAJO', 'NEGRO', 'IMPAR', '2DA COL'], [18, 'BAJO', 'NEGRO', 'IMPAR', '3RA COL'],
        [19, 'ALTO', 'NEGRO', 'IMPAR', '1RA DOC'], [20, 'ALTO', 'NEGRO', 'IMPAR', '2DA DOC'], [21, 'ALTO', 'NEGRO', 'IMPAR', '3RA DOC'],
        [22, 'ALTO', 'NEGRO', 'IMPAR', '2DA COL'], [23, 'ALTO', 'NEGRO', 'IMPAR', '2DA COL'], [24, 'ALTO', 'NEGRO', 'IMPAR', '3RA COL'],
        [25, 'BAJO', 'ROJO', 'PAR', '1RA DOC'], [26, 'BAJO', 'ROJO', 'PAR', '2DA DOC'], [27, 'BAJO', 'ROJO', 'PAR', '3RA DOC'],
        [28, 'BAJO', 'ROJO', 'PAR', '1RA COL'], [29, 'BAJO', 'ROJO', 'PAR', '2DA COL'], [30, 'BAJO', 'ROJO', 'PAR', '3RA COL'],
        [31, 'ALTO', 'ROJO', 'PAR', '1RA DOC'], [32, 'ALTO', 'ROJO', 'PAR', '2DA DOC'], [33, 'ALTO', 'ROJO', 'PAR', '3RA DOC'],
        [34, 'ALTO', 'ROJO', 'PAR', '1RA COL'], [35, 'ALTO', 'ROJO', 'PAR', '2DA COL'], [36, 'ALTO', 'ROJO', 'PAR', '3RA COL'],
        [37, 'BAJO', 'ROJO', 'IMPAR', '1RA DOC'], [38, 'BAJO', 'ROJO', 'IMPAR', '2DA DOC'], [39, 'BAJO', 'ROJO', 'IMPAR', '3RA DOC'],
        [40, 'BAJO', 'ROJO', 'IMPAR', '1RA COL'], [41, 'BAJO', 'ROJO', 'IMPAR', '2DA COL'], [42, 'BAJO', 'ROJO', 'IMPAR', '3RA COL'],
        [43, 'ALTO', 'ROJO', 'IMPAR', '1RA DOC'], [44, 'ALTO', 'ROJO', 'IMPAR', '2DA DOC'], [45, 'ALTO', 'ROJO', 'IMPAR', '3RA DOC'],
        [46, 'ALTO', 'ROJO', 'IMPAR', '1RA COL'], [47, 'ALTO', 'ROJO', 'IMPAR', '2DA COL'], [48, 'ALTO', 'ROJO', 'IMPAR', '3RA COL'],
    ];

    return pattern.map(([metodo, ba, col, pi, dc]) => {
        const econ = calculateEconomics(ba, col, pi, dc);
        const betIds = [
            ba === 'BAJO' ? 'LOW' : 'HIGH',
            col === 'NEGRO' ? 'BLACK' : 'RED',
            pi === 'PAR' ? 'EVEN' : 'ODD',
            dc.includes('DOC') ? (dc.includes('1RA') ? 'DOZ1' : dc.includes('2DA') ? 'DOZ2' : 'DOZ3') : (dc.includes('1RA') ? 'COL1' : dc.includes('2DA') ? 'COL2' : 'COL3')
        ];
        return { metodo, ba, col, pi, dc, ...econ, betIds };
    });
};

const METHODS = generateMethods();


export const MethodsWidget = ({ onBet, onToggleTable, placedNumbers = [] }) => {
    const history = useFinancialStore(state => state.numberHistory || []);
    const [showJustification, setShowJustification] = useState(false);

    const bestMethod = useMemo(() => {
        if (!history || history.length === 0) {
            // Pick a random one from the top theoretical performers to start with variety
            const topPerformers = METHODS.filter(m => m.power >= 40);
            return topPerformers[Math.floor(Date.now() / 1000) % topPerformers.length];
        }

        const recentMedium = history.slice(-50);
        const recentShort = history.slice(-15);

        const scored = METHODS.map(m => {
            let mediumHits = 0; // Stability
            let shortHits = 0;  // Trend
            let staleness = 0;
            let found = false;

            // Calculate Staleness (Spins since last win)
            for (let i = history.length - 1; i >= 0; i--) {
                const n = history[i];
                if (n === 0) { staleness++; continue; }

                let covered = false;
                // Check if n is covered by method m
                const isBa = (m.ba === 'BAJO' && isLow(n)) || (m.ba === 'ALTO' && isHigh(n));
                const isCol = (m.col === 'NEGRO' && isBlack(n)) || (m.col === 'ROJO' && isRed(n));
                const isPi = (m.pi === 'PAR' && isEven(n)) || (m.pi === 'IMPAR' && isOdd(n));
                let isDc = false;
                if (m.dc.includes('DOC')) {
                    const d1 = m.dc.includes('1RA'), d2 = m.dc.includes('2DA');
                    if ((d1 && isDoc1(n)) || (d2 && isDoc2(n)) || (!d1 && !d2 && isDoc3(n))) isDc = true;
                } else {
                    const c1 = m.dc.includes('1RA'), c2 = m.dc.includes('2DA');
                    if ((c1 && isCol1(n)) || (c2 && isCol2(n)) || (!c1 && !c2 && isCol3(n))) isDc = true;
                }

                if (isBa && isCol && isPi && isDc) {
                    found = true;
                    break;
                }
                staleness++;
            }
            if (!found) staleness = history.length; // Never hit

            // ... (Rest of existing calculation)
            // Medium Term
            recentMedium.forEach(n => {
                // ... (existing code, ensure it matches exactly or I need to rewrite the whole block)
                // To act safely, I will rewrite the whole block in the replacement content
                if (n === 0) return;
                let wc = 0;
                if ((m.ba === 'BAJO' && isLow(n)) || (m.ba === 'ALTO' && isHigh(n))) wc++;
                if ((m.col === 'NEGRO' && isBlack(n)) || (m.col === 'ROJO' && isRed(n))) wc++;
                if ((m.pi === 'PAR' && isEven(n)) || (m.pi === 'IMPAR' && isOdd(n))) wc++;
                if (m.dc.includes('DOC')) {
                    const d1 = m.dc.includes('1RA'), d2 = m.dc.includes('2DA');
                    if ((d1 && isDoc1(n)) || (d2 && isDoc2(n)) || (!d1 && !d2 && isDoc3(n))) wc++;
                } else {
                    const c1 = m.dc.includes('1RA'), c2 = m.dc.includes('2DA');
                    if ((c1 && isCol1(n)) || (c2 && isCol2(n)) || (!c1 && !c2 && isCol3(n))) wc++;
                }
                mediumHits += wc;
            });


            recentShort.forEach(n => {
                if (n === 0) return;
                let returns = 0;
                if ((m.ba === 'BAJO' && isLow(n)) || (m.ba === 'ALTO' && isHigh(n))) returns += 2;
                if ((m.col === 'NEGRO' && isBlack(n)) || (m.col === 'ROJO' && isRed(n))) returns += 2;
                if ((m.pi === 'PAR' && isEven(n)) || (m.pi === 'IMPAR' && isOdd(n))) returns += 2;
                if (m.dc.includes('DOC')) {
                    const d1 = m.dc.includes('1RA'), d2 = m.dc.includes('2DA');
                    if ((d1 && isDoc1(n)) || (d2 && isDoc2(n)) || (!d1 && !d2 && isDoc3(n))) returns += 3;
                } else {
                    const c1 = m.dc.includes('1RA'), c2 = m.dc.includes('2DA');
                    if ((c1 && isCol1(n)) || (c2 && isCol2(n)) || (!c1 && !c2 && isCol3(n))) returns += 3;
                }
                if (returns > 4) shortHits += 2;
                if (returns > 6) shortHits += 3;
            });

            const trendFactor = (shortHits / 15) * 20;
            const stabilityFactor = (mediumHits / 50) * 10;
            const score = m.power + stabilityFactor + trendFactor;

            return { ...m, score, staleness }; // Added staleness to return object
        });

        // TIE-BREAKING & ROTATION:
        // If scores are very close, use a deterministic rotation based on history length
        // to show different symmetric candidates (like 19 vs 31)
        return scored.sort((a, b) => {
            const diff = b.score - a.score;
            if (Math.abs(diff) < 0.1) {
                // Determine rotation index based on number of rounds played
                return (history.length % 2 === 0) ? (b.metodo - a.metodo) : (a.metodo - b.metodo);
            }
            return diff;
        })[0];
    }, [history]);

    // Forensic Lighting Logic
    const methodNumbers = useMemo(() => {
        if (!bestMethod) return [];
        const dummyBets = {};
        bestMethod.betIds.forEach(id => dummyBets[id] = 1);
        return getCoveredNumbers(dummyBets);
    }, [bestMethod]);

    const hasActiveBets = methodNumbers.length > 0 && methodNumbers.some(num => placedNumbers.includes(num));
    const isAttack = bestMethod.safety > 60 && bestMethod.power > 25;

    return (
        <div className="panel-tray-dark" onClick={() => onBet && onBet(bestMethod.betIds)}
            style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: hasActiveBets ? 'rgba(0, 255, 255, 0.15)' : 'rgba(20, 20, 20, 0.95)',
                border: hasActiveBets ? '1px solid rgba(0, 255, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: hasActiveBets
                    ? '0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)'
                    : 'none'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            <div className="panel-tray-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'transparent' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <ForensicBadge id="methodsWidget" />
                    <span style={{ color: '#fff', letterSpacing: '1px' }}>MEJOR MÉTODO</span>
                </span>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleTable && onToggleTable(); }}
                        title="Abrir Tabla de Métodos (E11)"
                        style={{
                            width: '26px', height: '26px',
                            borderRadius: '50%',
                            border: '1px solid #4f4',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', color: '#4f4', background: 'rgba(20, 20, 20, 0.8)',
                            cursor: 'pointer'
                        }}
                    >
                        📊
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowJustification(true); }} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#d4af37', background: 'rgba(20, 20, 20, 0.8)', cursor: 'help' }}>⚖</button>
                </div>
            </div>

            <div className="panel-tray-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', paddingBottom: '5px' }}>
                {/* 3 COLUMNS: [ ESCUDO ] [ METODO ] [ POTENCIA/ATAQUE ] */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    {/* LEFT: ESCUDO */}
                    <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>ESCUDO</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.9rem', color: bestMethod.safety > 60 ? '#4f4' : '#fff' }}>
                            {bestMethod.safety.toFixed(0)}%
                        </div>
                    </div>

                    {/* CENTER: METODO */}
                    <div style={{ flex: 1.2, textAlign: 'center' }}>
                        <div style={{ fontSize: '4.5rem', fontWeight: '900', color: '#fff', lineHeight: '0.9', letterSpacing: '-2px' }}>
                            {bestMethod.metodo}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#ccc', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '5px' }}>MÉTODO</div>
                    </div>

                    {/* RIGHT: POTENCIA & ACTION */}
                    <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            textAlign: 'center', background: 'linear-gradient(135deg, #444, #222)', color: '#ffd700',
                            padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.4rem',
                            border: '1px solid rgba(212, 175, 55, 0.4)', width: 'max-content'
                        }}>
                            {bestMethod.power.toFixed(0)}%
                        </div>
                        <div style={{
                            background: isAttack ? '#00C853' : '#D32F2F', color: 'white', fontWeight: '900', fontSize: '0.8rem',
                            padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.3)'
                        }}>
                            {isAttack ? 'ATAQUE' : 'ESPERA'}
                        </div>
                    </div>
                </div>

                {/* BOTTOM: REFERENCE TABLE */}
                <div style={{
                    width: '100%', background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px',
                    fontSize: '0.85rem', color: '#ddd', display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '2px', border: '1px solid #333', textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ color: '#4f4', fontWeight: 'bold', fontSize: '1rem' }}>{bestMethod.safety.toFixed(0)}%</span>
                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>ESCUDO</span>
                    </div>
                    {/* CENTER: DYNAMIC METHOD CONFIGURATION */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #444', borderRight: '1px solid #444', padding: '0 5px' }}>
                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', lineHeight: '1.1', textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>
                            {bestMethod.col === 'ROJO' ? '🔴' : '⚫'} {bestMethod.ba === 'ALTO' ? 'HI' : 'LO'} {bestMethod.pi === 'PAR' ? 'EV' : 'OD'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: bestMethod.staleness > 10 ? '#ff00ff' : '#d4af37', fontWeight: 'bold', marginTop: '2px' }}>
                            {bestMethod.dc} <span style={{ fontSize: '0.7rem', color: '#aaa', marginLeft: '4px' }}>({bestMethod.staleness}σ)</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ color: bestMethod.power > 30 ? '#00C853' : '#00bfff', fontWeight: 'bold', fontSize: '1rem' }}>{bestMethod.power.toFixed(0)}%</span>
                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>POTENCIA</span>
                    </div>
                </div>
            </div>
            {showJustification && <JustificationModal {...ELEMENT_DESCRIPTIONS[11]} onClose={() => setShowJustification(false)} />}
        </div>
    );
};
