import React from 'react'

export const UnifiedTelemetry = ({ physicsState }) => {
    return (
        <div style={{
            fontSize: '12px',
            color: '#ccc',
            background: 'rgba(10, 10, 10, 0.95)',
            padding: '15px',
            borderRadius: '12px',
            textAlign: 'left',
            border: '1px solid #444',
            boxShadow: '0 4px 15px rgba(0,0,0,0.8)',
            minWidth: '280px',
            fontFamily: 'SF Mono, Roboto Mono, monospace',
            backdropFilter: 'blur(5px)'
        }}>
            {/* WRAPPER HEADER */}
            <div style={{
                marginBottom: '10px',
                color: '#d4af37',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontSize: '10px',
                fontWeight: 'bold',
                borderBottom: '1px solid #333',
                paddingBottom: '5px'
            }}>
                📡 Telemetría Quántica
            </div>

            {/* DATA GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', rowGap: '8px' }}>

                {/* ROW 1: BALL TYPE */}
                <div style={labelStyle}>Masa / Bola</div>
                <div style={valueStyle('#fff')}>
                    {physicsState.ballType.name}
                </div>

                {/* ROW 2: START POINT */}
                <div style={labelStyle}>Punto Lanz.</div>
                <div style={valueStyle('#fff')}>
                    {physicsState.startPoint.name}
                </div>

                {/* ROW 3: BALL DIRECTION */}
                <div style={labelStyle}>Sentido Bola</div>
                <div style={valueStyle(physicsState.ballDirection === 'CW' ? '#4ff' : '#f88')}>
                    {physicsState.ballDirection === 'CW' ? '⟳ HORARIO' : '⟲ ANTI-HORARIO'}
                </div>

                {/* ROW 4: WHEEL DIRECTION */}
                <div style={labelStyle}>Sentido Rotor</div>
                <div style={valueStyle(physicsState.wheelDirection === 'CW' ? '#4ff' : '#f88')}>
                    {physicsState.wheelDirection === 'CW' ? '⟳ HORARIO' : '⟲ ANTI-HORARIO'}
                </div>

                {/* ROW 5: SPEEDS */}
                <div style={labelStyle}>Vel. Bola</div>
                <div style={valueStyle('#aaa')}>
                    {physicsState.ballSpeed.name}
                </div>

                <div style={labelStyle}>Vel. Rotor</div>
                <div style={valueStyle('#aaa')}>
                    {physicsState.wheelSpeed}
                </div>

            </div>

            {/* FOOTER: ENTROPY */}
            <div style={{
                marginTop: '12px',
                paddingTop: '8px',
                borderTop: '1px dashed #444',
                textAlign: 'center',
                color: '#666',
                fontSize: '10px'
            }}>
                Permutaciones Activas: <span style={{ color: '#d4af37', fontWeight: 'bold' }}>432</span>
            </div>
        </div>
    )
}

const labelStyle = {
    color: '#888',
    fontSize: '11px',
    fontWeight: 'normal',
    display: 'flex',
    alignItems: 'center'
}

const valueStyle = (color) => ({
    color: color,
    fontWeight: 'bold',
    textAlign: 'right',
    fontSize: '11px'
})
