import React from 'react'
import { useStatTracker } from '../logic/StatTracker'
// import { useGenesisStore } from '../logic/MasterConfig'

// Helper to colorize cells based on 'heat'
// Green = High wait (Opportunity?), Red = Low wait? 
// Actually in Roulette trackers: 
// High Wait = "Cold" number, but "Hot" opportunity for some strategies.
// Let's use a gradient from Blue (Recent) to Red (High Wait/Warning).
const getHeatColor = (payout, wait, threshold) => {
    if (wait > threshold) return '#ff3838' // Critical Alert
    if (wait > threshold * 0.7) return '#ff9f1a' // Warning
    if (wait < 5) return '#00d2d3' // Just hit
    return 'rgba(255,255,255,0.1)'
}

const StatCell = ({ label, id, threshold = 50 }) => {
    const wait = useStatTracker(state => state.waits[id] || 0)
    const bg = getHeatColor(0, wait, threshold)

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            background: bg, padding: '4px', borderRadius: '4px',
            minWidth: '60px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{label}</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{wait}</span>
        </div>
    )
}

export const StatsHUD = () => {
    // We can pull thresholds from MasterConfig if we want custom alerts per type
    // We can pull thresholds from MasterConfig if we want custom alerts per type
    // const { strategy } = useGenesisStore()

    return (
        <div style={{
            position: 'absolute', bottom: 20, right: 20,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            padding: '15px', borderRadius: '8px', border: '1px solid #333',
            display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '15px',
            color: 'white', fontFamily: 'monospace', width: '400px', maxHeight: '80vh', overflowY: 'auto'
        }}>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555' }}>DEEP DATA ENGINE</h3>

            {/* CHANCES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                <StatCell label="ROJO" id="COLOR_RED" threshold={10} />
                <StatCell label="NEGRO" id="COLOR_BLACK" threshold={10} />
                <StatCell label="PAR" id="EVEN" threshold={10} />
                <StatCell label="IMPAR" id="ODD" threshold={10} />
                <StatCell label="1-18" id="LOW_18" threshold={10} />
                <StatCell label="19-36" id="HIGH_18" threshold={10} />
            </div>

            {/* DOZENS & COLUMNS */}
            <div style={{ fontSize: '0.8rem', marginTop: '10px' }}>DOCENAS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                <StatCell label="1ª DOZEN" id="DOZEN_1" threshold={15} />
                <StatCell label="2ª DOZEN" id="DOZEN_2" threshold={15} />
                <StatCell label="3ª DOZEN" id="DOZEN_3" threshold={15} />
            </div>

            <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>COLUMNAS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                <StatCell label="COL 1" id="COLUMN_1" threshold={15} />
                <StatCell label="COL 2" id="COLUMN_2" threshold={15} />
                <StatCell label="COL 3" id="COLUMN_3" threshold={15} />
            </div>

            {/* LINES (Seisenas) */}
            <div style={{ fontSize: '0.8rem', marginTop: '10px' }}>LINEAS (SEISENAS)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                {Array.from({ length: 6 }, (_, i) => (
                    <StatCell key={`LINE_${i + 1}`} label={`L${i + 1}`} id={`LINE_${i + 1}`} threshold={12} />
                ))}
            </div>

            {/* STREETS (Calles) */}
            <div style={{ fontSize: '0.8rem', marginTop: '10px' }}>CALLES (TRANSVERSALES)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {Array.from({ length: 12 }, (_, i) => (
                    <StatCell key={`STREET_${i + 1}`} label={`C${i + 1}`} id={`STREET_${i + 1}`} threshold={18} />
                ))}
            </div>

            {/* COMBOS (Triadas) */}
            <div style={{ fontSize: '0.8rem', marginTop: '10px' }}>COMBINACIONES (3 VÍAS)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <StatCell label="LOW-RED-EVEN" id="COMBO_LOW_RED_EVEN" threshold={16} />
                <StatCell label="LOW-RED-ODD" id="COMBO_LOW_RED_ODD" threshold={16} />
                <StatCell label="LOW-BLK-EVEN" id="COMBO_LOW_BLACK_EVEN" threshold={16} />
                <StatCell label="LOW-BLK-ODD" id="COMBO_LOW_BLACK_ODD" threshold={16} />
                <StatCell label="HI-RED-EVEN" id="COMBO_HIGH_RED_EVEN" threshold={16} />
                <StatCell label="HI-RED-ODD" id="COMBO_HIGH_RED_ODD" threshold={16} />
                <StatCell label="HI-BLK-EVEN" id="COMBO_HIGH_BLACK_EVEN" threshold={16} />
                <StatCell label="HI-BLK-ODD" id="COMBO_HIGH_BLACK_ODD" threshold={16} />
            </div>

            {/* PAIRS (Diadas) Only showing a few crucial ones to save space or all? Let's show all compact */}
            <div style={{ fontSize: '0.8rem', marginTop: '10px' }}>COMBINACIONES (2 VÍAS)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                {/* Just generating them by props logic manually or using a list would be cleaner, but hardcoding for layout control */}
                <StatCell label="LO-RED" id="PAIR_LOW_RED" threshold={8} />
                <StatCell label="LO-BLK" id="PAIR_LOW_BLACK" threshold={8} />
                <StatCell label="HI-RED" id="PAIR_HIGH_RED" threshold={8} />
                <StatCell label="HI-BLK" id="PAIR_HIGH_BLACK" threshold={8} />

                <StatCell label="LO-EVEN" id="PAIR_LOW_EVEN" threshold={8} />
                <StatCell label="LO-ODD" id="PAIR_LOW_ODD" threshold={8} />
                <StatCell label="HI-EVEN" id="PAIR_HIGH_EVEN" threshold={8} />
                <StatCell label="HI-ODD" id="PAIR_HIGH_ODD" threshold={8} />

                <StatCell label="RED-EV" id="PAIR_RED_EVEN" threshold={8} />
                <StatCell label="RED-ODD" id="PAIR_RED_ODD" threshold={8} />
                <StatCell label="BLK-EV" id="PAIR_BLACK_EVEN" threshold={8} />
                <StatCell label="BLK-ODD" id="PAIR_BLACK_ODD" threshold={8} />
            </div>

            {/* SPECIALS (Calles, etc. - simplified for space, or expandable?) */}
            {/* Let's show hottest/coldest Numbers */}
            <div style={{ fontSize: '0.8rem', marginTop: '10px' }}>NUMBERS (Top Cold)</div>
            <HotColdNumbers />

        </div>
    )
}

const HotColdNumbers = () => {
    const waits = useStatTracker(state => state.waits)
    // Find top 5 numbers with highest wait
    const topCold = Array.from({ length: 37 }, (_, i) => ({
        num: i, wait: waits[`NUMBER_${i}`]
    })).sort((a, b) => b.wait - a.wait).slice(0, 10)

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {topCold.map(item => (
                <div key={item.num} style={{
                    background: '#333', padding: '2px 6px', borderRadius: '4px',
                    fontSize: '0.8rem', border: `1px solid ${item.wait > 50 ? 'red' : '#444'}`
                }}>
                    #{item.num}: <span style={{ color: '#ff9f1a' }}>{item.wait}</span>
                </div>
            ))}
        </div>
    )
}
