import React from 'react'
import { useGenesisStore } from '../logic/MasterConfig'

export const FloatingDock = () => {
    const { ui, setUI } = useGenesisStore()

    const btnStyle = (active) => ({
        background: active ? 'rgba(0, 255, 204, 0.15)' : 'rgba(0, 0, 0, 0.4)',
        border: `1px solid ${active ? '#00ffcc' : 'rgba(212, 175, 55, 0.2)'}`,
        color: active ? '#00ffcc' : '#fff',
        padding: '12px 18px',
        borderRadius: '14px',
        cursor: 'pointer',
        fontSize: '1.4rem',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        minWidth: '55px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: active ? '0 0 15px rgba(0, 255, 204, 0.2)' : 'none',
        outline: 'none',
        userSelect: 'none'
    })

    // Hover effect is handled dynamically via CSS hover injection or standard style.
    // To keep it standard, we inject a style tag for the hover transition scale, which is extremely robust.
    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .premium-dock-btn {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }
                .premium-dock-btn:hover {
                    transform: translateY(-5px) scale(1.08) !important;
                    border-color: #d4af37 !important;
                    box-shadow: 0 5px 15px rgba(212, 175, 55, 0.25) !important;
                }
                .premium-dock-btn:active {
                    transform: translateY(-2px) scale(0.95) !important;
                }
            `}} />

            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '12px',
                zIndex: 1000,
                padding: '10px 18px',
                background: 'rgba(6, 18, 12, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '22px',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
                pointerEvents: 'auto'
            }}>
                {/* Stats Toggle */}
                <button
                    className="premium-dock-btn"
                    title="Estadísticas (Matrix)"
                    style={btnStyle(ui.showStats)}
                    onClick={() => setUI({ showStats: !ui.showStats })}
                >
                    📊
                </button>

                {/* Graph Toggle */}
                <button
                    className="premium-dock-btn"
                    title="Gráfica de Balance"
                    style={btnStyle(ui.showGraph)}
                    onClick={() => setUI({ showGraph: !ui.showGraph })}
                >
                    📈
                </button>

                {/* Financial Toggle */}
                <button
                    className="premium-dock-btn"
                    title="Panel Financiero"
                    style={btnStyle(ui.showFinance)}
                    onClick={() => setUI({ showFinance: !ui.showFinance })}
                >
                    💸
                </button>

                {/* Separator */}
                <div style={{ width: '1px', background: 'rgba(212, 175, 55, 0.2)', margin: '4px 6px' }} />

                {/* Settings/Controls Toggle */}
                <button
                    className="premium-dock-btn"
                    title="Configuración de Motor"
                    style={btnStyle(ui.showControls)}
                    onClick={() => setUI({ showControls: !ui.showControls })}
                >
                    ⚙️
                </button>
            </div>
        </>
    )
}
