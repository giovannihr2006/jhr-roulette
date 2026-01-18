import React from 'react'
import { useGenesisStore } from '../logic/MasterConfig'

export const FloatingDock = () => {
    const { ui, setUI } = useGenesisStore()

    const btnStyle = (active) => ({
        background: active ? 'rgba(0, 255, 204, 0.2)' : 'rgba(0,0,0,0.5)',
        border: `1px solid ${active ? '#00ffcc' : 'rgba(255,255,255,0.2)'}`,
        color: active ? '#00ffcc' : 'white',
        padding: '10px 15px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '1.2rem',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease',
        minWidth: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    })

    return (
        <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '15px',
            zIndex: 100,
            padding: '10px 20px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            {/* Stats Toggle */}
            <button
                title="Estadísticas (Matrix)"
                style={btnStyle(ui.showStats)}
                onClick={() => setUI({ showStats: !ui.showStats })}
            >
                📊
            </button>

            {/* Graph Toggle */}
            <button
                title="Gráfica de Balance"
                style={btnStyle(ui.showGraph)}
                onClick={() => setUI({ showGraph: !ui.showGraph })}
            >
                📈
            </button>

            {/* Financial Toggle */}
            <button
                title="Panel Financiero"
                style={btnStyle(ui.showFinance)}
                onClick={() => setUI({ showFinance: !ui.showFinance })}
            >
                💰
            </button>

            {/* Separator */}
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />

            {/* Settings/Controls Toggle */}
            <button
                title="Configuración Avanzada"
                style={btnStyle(ui.showControls)}
                onClick={() => setUI({ showControls: !ui.showControls })}
            >
                ⚙️
            </button>
        </div>
    )
}
