import React from 'react';
import { ForensicBadge } from './ForensicBadge';

export const AuditTowerWidget = ({
    onShowRubricManual,
    onShowRubricApplied,
    onShowVisualManual,
    onShowVisualApplied,
    onShowValueManual,
    onShowValueApplied,
    onShowAppValue,
    onShowForensicManual // Added prop
}) => {
    return (
        <div className="panel-tray-dark" style={{
            width: '100%',
            height: '100%',
            minWidth: '340px',
            background: 'rgba(10, 10, 10, 0.95)',
            border: '1px solid #444',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* HEADER UNIFICADO */}
            <div style={{
                padding: '12px',
                background: 'linear-gradient(to bottom, #222, #111)',
                borderBottom: '1px solid #333',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
                    SISTEMA DE AUDITORÍA
                </div>
                <div style={{
                    fontSize: '1.2rem', color: '#d4af37', fontWeight: '900', letterSpacing: '1px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                    <ForensicBadge id="auditTowerWidget" />
                    CERTIFICACIÓN FORENSE
                </div>
            </div>

            {/* SECCIÓN 0: ACADEMIA (NUEVO ENTRY POINT) */}
            <div style={{ padding: '15px', borderBottom: '2px solid #d4af37', background: 'rgba(212, 175, 55, 0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#d4af37', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🎓 ACADEMIA & PROTOCOLOS
                </div>
                <button
                    onClick={onShowForensicManual}
                    style={{
                        width: '100%',
                        background: 'linear-gradient(45deg, #d4af37, #b8860b)',
                        border: 'none',
                        color: '#000',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '900',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    CURSO DE OPERADOR
                </button>
            </div>

            {/* SECCIÓN 1: INGENIERÍA (28, 29) */}
            <div style={{ padding: '15px', borderBottom: '1px solid #222' }}>
                <div style={{ fontSize: '0.7rem', color: '#4fc3f7', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                    🛡️ INGENIERÍA & CAT
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button onClick={onShowRubricManual} style={{
                        background: 'rgba(79, 195, 247, 0.1)', border: '1px solid #4fc3f7', color: '#4fc3f7',
                        padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center'
                    }}>
                        <ForensicBadge id="rubric40" style={{ width: '22px', height: '18px', fontSize: '10px' }} />
                        RÚBRICA APP
                    </button>
                    <button onClick={onShowRubricApplied} style={{
                        background: 'rgba(0, 230, 118, 0.1)', border: '1px solid #00e676', color: '#00e676',
                        padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center'
                    }}>
                        <ForensicBadge id="rubricApplied" style={{ width: '22px', height: '18px', fontSize: '10px' }} />
                        CERTIFICACIÓN APP
                    </button>
                </div>
            </div>

            {/* SECCIÓN 2: DISEÑO (30, 31) */}
            <div style={{ padding: '15px', borderBottom: '1px solid #222' }}>
                <div style={{ fontSize: '0.7rem', color: '#ff00ff', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                    🎨 DISEÑO VISUAL
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button onClick={onShowVisualManual} style={{
                        background: 'rgba(255, 0, 255, 0.1)', border: '1px solid #ff00ff', color: '#ff00ff',
                        padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center'
                    }}>
                        <ForensicBadge id="visualRubric" style={{ width: '22px', height: '18px', fontSize: '10px' }} />
                        RÚBRICA DISEÑO
                    </button>
                    <button onClick={onShowVisualApplied} style={{
                        background: 'rgba(0, 188, 212, 0.1)', border: '1px solid #00bcd4', color: '#00bcd4',
                        padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center'
                    }}>
                        <ForensicBadge id="appliedVisualRubric" style={{ width: '22px', height: '18px', fontSize: '10px' }} />
                        CERTIFICACIÓN DISEÑO
                    </button>
                </div>
            </div>

            {/* SECCIÓN 3: VALOR (32, 33, 5) */}
            <div style={{ padding: '15px', background: 'rgba(212, 175, 55, 0.03)' }}>
                <div style={{ fontSize: '0.7rem', color: '#ffd700', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                    💎 VALOR & IP
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' }}>
                    <button onClick={onShowValueManual} style={{
                        background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #ffd700', color: '#ffd700',
                        padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center'
                    }}>
                        <ForensicBadge id="valueRubricButton" style={{ width: '22px', height: '18px', fontSize: '10px' }} />
                        RÚBRICA VALOR APP
                    </button>
                    <button onClick={onShowValueApplied} style={{
                        background: '#ffd700', border: '1px solid #fff', color: '#000',
                        padding: '8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center'
                    }}>
                        <ForensicBadge id="appliedValueRubricButton" style={{ width: '22px', height: '18px', fontSize: '10px' }} />
                        CERTIFICACIÓN VALOR APP
                    </button>
                </div>

                {/* APP VALUE DISPLAY (E5) */}
                <div
                    onClick={onShowAppValue}
                    style={{
                        background: 'rgba(212, 175, 55, 0.08)', border: '1px dashed #d4af37', borderRadius: '8px',
                        padding: '12px', textAlign: 'center', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <ForensicBadge id="appValueWidget" style={{ width: '22px', height: '18px', fontSize: '10px' }} />
                        <span style={{ fontSize: '0.65rem', color: '#d4af37', textTransform: 'uppercase' }}>Valor de la App</span>
                    </div>
                    <div style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 'bold', fontFamily: 'Roboto Mono' }}>$1,000M COP</div>
                </div>
            </div>
        </div>
    );
};
