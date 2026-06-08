import React from 'react';
import { Z_LAYERS } from '../config/Theme';

export const EconomicValueModal = ({ onClose }) => {
    const valuationLevels = [
        {
            level: 1,
            title: "VALOR DE LIQUIDACIÓN",
            subtitle: "Costo de Reconstrucción (I+D)",
            value: "$19,000 USD",
            desc: "Costo base de ingeniería (190 hrs x $100/hr) para replicar la arquitectura y motores forenses.",
            color: "#aaa" // Neutral/Base
        },
        {
            level: 2,
            title: "VALOR SAAS (COMERCIAL)",
            subtitle: "Potencial de Suscripción",
            value: "$69,600 USD",
            desc: "Valor proyectado como servicio web (100 usuarios x $29/mes x 24 meses).",
            color: "#4dabf7" // Blue/Commercial
        },
        {
            level: 3,
            title: "VALOR ESTRATÉGICO",
            subtitle: "Ventaja Competitiva (Edge)",
            value: "$100,000 USD",
            desc: "Valor para Sindicatos Profesionales por ahorro de capital y optimización de riesgo.",
            color: "#00e676" // Green/Profit
        },
        {
            level: 4,
            title: "VALOR INSTITUCIONAL",
            subtitle: "Propiedad Intelectual (IP)",
            value: "$250,000 USD+",
            desc: "Venta del código fuente y algoritmos a Operadores de Casino o Developers.",
            color: "#ffd700" // Gold/Premium
        }
    ];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.92)', zIndex: Z_LAYERS.CRITICAL_MODAL,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div style={{
                background: '#111',
                border: '2px solid #d4af37',
                borderRadius: '15px',
                padding: '30px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 0 50px rgba(212, 175, 55, 0.15)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{
                        margin: 0,
                        color: '#d4af37',
                        fontSize: '2rem',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        textShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
                    }}>
                        Valoración Forense
                    </h2>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px', fontFamily: 'monospace' }}>
                        ID: VALORACION_ECONOMICA_24012026
                    </div>
                </div>

                {/* LEVELS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {valuationLevels.map((lvl) => (
                        <div key={lvl.level} style={{
                            background: '#1a1a1a',
                            borderLeft: `4px solid ${lvl.color}`,
                            padding: '15px',
                            borderRadius: '0 8px 8px 0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'transform 0.2s',
                            cursor: 'default'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#222'}
                            onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
                        >
                            <div style={{ flex: 1, paddingRight: '15px' }}>
                                <div style={{
                                    color: lvl.color,
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    marginBottom: '3px'
                                }}>
                                    NIVEL {lvl.level}: {lvl.title}
                                </div>
                                <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                    {lvl.subtitle}
                                </div>
                                <div style={{ color: '#888', fontSize: '0.8rem', lineHeight: '1.4' }}>
                                    {lvl.desc}
                                </div>
                            </div>
                            <div style={{
                                textAlign: 'right',
                                minWidth: '120px'
                            }}>
                                <div style={{
                                    color: lvl.color,
                                    fontSize: '1.4rem',
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                    textShadow: `0 0 10px ${lvl.color}40`
                                }}>
                                    {lvl.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <div style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px' }}>
                        ACTIVO DIGITAL: <span style={{ color: '#fff', fontWeight: 'bold' }}>baryonic-blazar</span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#d4af37',
                            color: '#000',
                            border: 'none',
                            padding: '12px 40px',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                            transition: 'transform 0.1s'
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Cerrar Informe
                    </button>
                </div>
            </div>
        </div>
    );
};
