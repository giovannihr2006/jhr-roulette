import React from 'react'
import { useStatTracker } from '../logic/StatTracker'

// Premium heat coloring with traslucid glowing borders
const getHeatColor = (wait, threshold) => {
    if (wait > threshold) {
        return {
            bg: 'rgba(255, 56, 56, 0.2)',
            border: '1px solid rgba(255, 56, 56, 0.6)',
            color: '#ff4d4d',
            glow: '0 0 8px rgba(255, 56, 56, 0.4)'
        }
    }
    if (wait > threshold * 0.7) {
        return {
            bg: 'rgba(255, 159, 26, 0.15)',
            border: '1px solid rgba(255, 159, 26, 0.4)',
            color: '#ffb938',
            glow: 'none'
        }
    }
    if (wait < 5) {
        return {
            bg: 'rgba(0, 255, 204, 0.12)',
            border: '1px solid rgba(0, 255, 204, 0.4)',
            color: '#00ffcc',
            glow: '0 0 6px rgba(0, 255, 204, 0.2)'
        }
    }
    return {
        bg: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        color: '#fff',
        glow: 'none'
    }
}

const StatCell = ({ label, id, threshold = 50 }) => {
    const wait = useStatTracker(state => state.waits[id] || 0)
    const style = getHeatColor(wait, threshold)

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: style.bg,
            padding: '6px 4px',
            borderRadius: '6px',
            minWidth: '60px',
            alignItems: 'center',
            border: style.border,
            boxShadow: style.glow,
            transition: 'all 0.3s ease'
        }}>
            <span style={{ fontSize: '0.55rem', opacity: 0.6, fontWeight: 700, letterSpacing: '0.5px' }}>{label}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: style.color, fontFamily: 'monospace' }}>{wait}</span>
        </div>
    )
}

export const StatsHUD = () => {
    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(6, 18, 12, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: '12px',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            width: '420px',
            maxHeight: '75vh',
            overflowY: 'auto',
            pointerEvents: 'auto',
            zIndex: 900
        }}>
            <h3 style={{
                margin: '0 0 5px 0',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                fontSize: '0.95rem',
                fontWeight: 900,
                letterSpacing: '2.5px',
                color: '#d4af37',
                textShadow: '0 0 10px rgba(212, 175, 55, 0.4)',
                textAlign: 'center'
            }}>
                DEEP DATA TELEMETRY
            </h3>

            {/* CHANCES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                <StatCell label="ROJO" id="COLOR_RED" threshold={10} />
                <StatCell label="NEGRO" id="COLOR_BLACK" threshold={10} />
                <StatCell label="PAR" id="EVEN" threshold={10} />
                <StatCell label="IMPAR" id="ODD" threshold={10} />
                <StatCell label="1-18" id="LOW_18" threshold={10} />
                <StatCell label="19-36" id="HIGH_18" threshold={10} />
            </div>

            {/* DOZENS & COLUMNS */}
            <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '4px' }}>DOCENAS (#12)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                    <StatCell label="1ª DOCENA" id="DOZEN_1" threshold={15} />
                    <StatCell label="2ª DOCENA" id="DOZEN_2" threshold={15} />
                    <StatCell label="3ª DOCENA" id="DOZEN_3" threshold={15} />
                </div>
            </div>

            <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '4px' }}>COLUMNAS (#12)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                    <StatCell label="COLUMNA 1" id="COLUMN_1" threshold={15} />
                    <StatCell label="COLUMNA 2" id="COLUMN_2" threshold={15} />
                    <StatCell label="COLUMNA 3" id="COLUMN_3" threshold={15} />
                </div>
            </div>

            {/* LINES (Lineas) */}
            <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '4px' }}>LÍNEAS (#6)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                    {Array.from({ length: 6 }, (_, i) => (
                        <StatCell key={`LINE_${i + 1}`} label={`L${i + 1}`} id={`LINE_${i + 1}`} threshold={12} />
                    ))}
                </div>
            </div>

            {/* STREETS (Calles) */}
            <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '4px' }}>CALLES (#3)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <StatCell key={`STREET_${i + 1}`} label={`C${i + 1}`} id={`STREET_${i + 1}`} threshold={18} />
                    ))}
                </div>
            </div>

            {/* COMBOS (Triadas) */}
            <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '4px' }}>COMBINACIONES (3 VÍAS)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    <StatCell label="LO-RD-EV" id="COMBO_LOW_RED_EVEN" threshold={16} />
                    <StatCell label="LO-RD-OD" id="COMBO_LOW_RED_ODD" threshold={16} />
                    <StatCell label="LO-BK-EV" id="COMBO_LOW_BLACK_EVEN" threshold={16} />
                    <StatCell label="LO-BK-OD" id="COMBO_LOW_BLACK_ODD" threshold={16} />
                    <StatCell label="HI-RD-EV" id="COMBO_HIGH_RED_EVEN" threshold={16} />
                    <StatCell label="HI-RD-OD" id="COMBO_HIGH_RED_ODD" threshold={16} />
                    <StatCell label="HI-BK-EV" id="COMBO_HIGH_BLACK_EVEN" threshold={16} />
                    <StatCell label="HI-BK-OD" id="COMBO_HIGH_BLACK_ODD" threshold={16} />
                </div>
            </div>

            {/* PAIRS (Diadas) */}
            <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '4px' }}>COMBINACIONES (2 VÍAS)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                    <StatCell label="LO-RD" id="PAIR_LOW_RED" threshold={8} />
                    <StatCell label="LO-BK" id="PAIR_LOW_BLACK" threshold={8} />
                    <StatCell label="HI-RD" id="PAIR_HIGH_RED" threshold={8} />
                    <StatCell label="HI-BK" id="PAIR_HIGH_BLACK" threshold={8} />
                    <StatCell label="LO-EV" id="PAIR_LOW_EVEN" threshold={8} />
                    <StatCell label="LO-OD" id="PAIR_LOW_ODD" threshold={8} />
                    <StatCell label="HI-EV" id="PAIR_HIGH_EVEN" threshold={8} />
                    <StatCell label="HI-OD" id="PAIR_HIGH_ODD" threshold={8} />
                    <StatCell label="RD-EV" id="PAIR_RED_EVEN" threshold={8} />
                    <StatCell label="RD-OD" id="PAIR_RED_ODD" threshold={8} />
                    <StatCell label="BK-EV" id="PAIR_BLACK_EVEN" threshold={8} />
                    <StatCell label="BK-OD" id="PAIR_BLACK_ODD" threshold={8} />
                </div>
            </div>

            {/* NUMBERS (Top Cold) */}
            <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '6px' }}>NÚMEROS MÁS FRÍOS (EN ESPERA)</div>
                <HotColdNumbers />
            </div>

        </div>
    )
}

const HotColdNumbers = () => {
    const waits = useStatTracker(state => state.waits)
    // Find top 10 numbers with highest wait
    const topCold = Array.from({ length: 37 }, (_, i) => ({
        num: i, wait: waits[`NUMBER_${i}`] || 0
    })).sort((a, b) => b.wait - a.wait).slice(0, 10)

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {topCold.map(item => (
                <div key={item.num} style={{
                    background: item.wait > 50 ? 'rgba(255,56,56,0.1)' : 'rgba(255,255,255,0.03)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: item.wait > 50 ? '1px solid rgba(255,56,56,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.3s ease',
                    fontFamily: 'monospace'
                }}>
                    #{item.num}: <span style={{ color: item.wait > 50 ? '#ff4d4d' : '#ffb938' }}>{item.wait}</span>
                </div>
            ))}
        </div>
    )
}
