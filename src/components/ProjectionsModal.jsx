import React, { useState } from 'react'
import { ProfitGraph } from './ProfitGraph'

export const ProjectionsModal = ({ isOpen, onClose, balance, startBalance, startTime, history = [], viewCurrency = 'COL', rates = {} }) => {
    if (!isOpen) return null

    const [isFull, setIsFull] = useState(false)

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 10000, backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: '#1a1a1a', border: '2px solid #d4af37',
                borderRadius: '15px', padding: '20px',
                width: isFull ? '100vw' : '95%',
                maxWidth: isFull ? 'none' : '1100px',
                height: isFull ? '100vh' : '95vh',
                maxHeight: isFull ? 'none' : '95vh',
                overflowY: 'hidden', // Graph needs fixed height container
                boxShadow: '0 0 50px rgba(212, 175, 55, 0.2)',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
                    <h2 style={{ color: '#d4af37', margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.8rem' }}>
                        GRÁFICO DE GANANCIAS
                    </h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setIsFull(!isFull)} style={{
                            background: '#333', color: '#fff', border: '1px solid #555',
                            padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.8rem'
                        }}>
                            {isFull ? '🗗 RESTAURAR' : '🗖 EXPANDIR'}
                        </button>
                        <button onClick={onClose} style={{
                            background: 'none', border: '1px solid #d4af37', color: '#d4af37',
                            fontSize: '1rem', cursor: 'pointer', padding: '5px 15px', borderRadius: '5px'
                        }}>
                            CERRAR
                        </button>
                    </div>
                </div>

                {/* CHART CONTAINER */}
                <div style={{ flex: 1, minHeight: 0, background: '#222', borderRadius: '10px', padding: '10px' }}>
                    <ProfitGraph
                        history={history}
                        balance={balance}
                        startBalance={startBalance}
                        startTime={startTime}
                        viewCurrency={viewCurrency}
                        rates={rates}
                        isWidgetMode={false}
                    />
                </div>
            </div>

        </div>
    )
}
