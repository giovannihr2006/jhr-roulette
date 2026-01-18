import React, { useMemo } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { ALL_SPLITS, ALL_STREETS, ALL_CORNERS, ALL_LINES } from '../logic/RouletteUtils'
// import { Draggable } from './Draggable';

const EMPTY_ARRAY = [];

export const TopOpportunityWidget = () => {
    const history = useFinancialStore(state => state.numberHistory || EMPTY_ARRAY);
    const baseWaitThreshold = useFinancialStore(state => state.baseWaitThreshold || 300);

    // SAFETY CHECK: Force return null to check if crash persists
    // return null

    const topOpportunity = useMemo(() => {
        try {
            if (!history || history.length === 0) return null
            if (!ALL_SPLITS || !ALL_STREETS) {
                console.warn("DEBUG: RouletteUtils not loaded yet")
                return null
            }

            const countMisses = (numbers) => {
                let misses = 0
                for (let i = history.length - 1; i >= 0; i--) {
                    if (numbers.includes(history[i])) return misses
                    misses++
                }
                return misses
            }

            const allOps = []

            // 1. Plenos (Straight Up)
            const tPleno = baseWaitThreshold
            for (let i = 0; i <= 36; i++) {
                const m = countMisses([i])
                allOps.push({ type: 'Pleno', name: i.toString(), misses: m, limit: tPleno, ratio: m / tPleno, nums: [i] })
            }

            // 2. Medios (Splits)
            const tMedio = Math.round(baseWaitThreshold / 2)
            ALL_SPLITS.forEach(bet => {
                const m = countMisses(bet.numbers)
                allOps.push({ type: 'Medio', name: bet.name.replace('Medio ', ''), misses: m, limit: tMedio, ratio: m / tMedio, nums: bet.numbers })
            })

            // 3. Calles (Streets)
            const tCalle = Math.round(baseWaitThreshold / 3)
            ALL_STREETS.forEach(bet => {
                const m = countMisses(bet.numbers)
                allOps.push({ type: 'Calle', name: bet.name.replace('Calle ', ''), misses: m, limit: tCalle, ratio: m / tCalle, nums: bet.numbers })
            })

            // 4. Seisenas (Lines)
            const tLine = Math.round(baseWaitThreshold / 6)
            ALL_LINES.forEach(bet => {
                const m = countMisses(bet.numbers)
                allOps.push({ type: 'Seisena', name: bet.name.replace('Seisena ', ''), misses: m, limit: tLine, ratio: m / tLine, nums: bet.numbers })
            })

            // 5. Cuadros (Corners)
            const tCorner = Math.round(baseWaitThreshold / 4)
            ALL_CORNERS.forEach(bet => {
                const m = countMisses(bet.numbers)
                allOps.push({ type: 'Cuadro', name: bet.name.replace('Cuadro ', ''), misses: m, limit: tCorner, ratio: m / tCorner, nums: bet.numbers })
            })

            // Sort by Ratio DESC and take top 1
            const sorted = allOps.sort((a, b) => b.ratio - a.ratio)
            return sorted.length > 0 ? sorted[0] : null

        } catch (err) {
            console.error("CRITICAL ERROR in TopOpportunityWidget:", err)
            return null
        }
    }, [history, baseWaitThreshold])

    // RENDER: Use "panel-tray-dark" to match other widgets
    const content = topOpportunity ? (
        <div className="panel-tray-dark" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* HEADER */}
            <div className="panel-tray-header" style={{ justifyContent: 'center', fontSize: '0.9rem', padding: '8px' }}>
                🏆 MEJOR OPORTUNIDAD
            </div>

            {/* BODY */}
            <div className="panel-tray-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>

                {/* NAME */}
                <div style={{
                    fontSize: '3rem', fontWeight: '900', color: '#fff',
                    textShadow: '0 0 30px rgba(255, 215, 0, 0.9)',
                    lineHeight: '0.9',
                    letterSpacing: '-2px',
                    marginTop: '-5px'
                }}>
                    {topOpportunity.type === 'Pleno' ? '#' : ''}{topOpportunity.name}
                </div>

                {/* TYPE LABEL */}
                <div style={{ fontSize: '1.2rem', color: '#ccc', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
                    {topOpportunity.type}
                </div>

                {/* STATS ROW - SPLIT TO EDGES */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '15px', padding: '0 20px', transform: 'translateY(-50%)' }}>

                    {/* WAIT COUNT (LEFT) */}
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>ESPERA</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#fff' }}>
                            {topOpportunity.misses}<span style={{ color: '#777', fontSize: '1rem' }}>/{topOpportunity.limit}</span>
                        </div>
                    </div>

                    {/* RATIO BADGE (RIGHT) */}
                    <div style={{
                        textAlign: 'right',
                        background: 'linear-gradient(135deg, #ffd700, #b8860b)',
                        color: '#000',
                        padding: '5px 15px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '1.6rem',
                        boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                    }}>
                        {(topOpportunity.ratio * 100).toFixed(0)}%
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="panel-tray-dark" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="panel-tray-header" style={{ justifyContent: 'center', width: '100%', background: 'transparent', border: 'none', fontSize: '1.5rem' }}>
                🏆 MEJOR OPORTUNIDAD
            </div>
            <div style={{ color: '#666', fontSize: '1.2rem', fontStyle: 'italic', marginTop: '10px' }}>
                Escaneando...
            </div>
        </div>
    );

    return content;
};
