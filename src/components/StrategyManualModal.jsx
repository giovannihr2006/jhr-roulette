import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { MANUAL_DATA } from '../logic/ManualData'

export const StrategyManualModal = ({ onClose }) => {
    const [expandedId, setExpandedId] = useState(null)

    const toggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id)
    }

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.9)', zIndex: 10002,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div style={{
                background: '#121212', border: '1px solid #d4af37',
                width: '900px', maxHeight: '95vh', overflowY: 'auto',
                borderRadius: '12px', position: 'relative',
                boxShadow: '0 0 50px rgba(212, 175, 55, 0.2)',
                display: 'flex', flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div style={{
                    padding: '25px', borderBottom: '1px solid #333',
                    background: 'linear-gradient(180deg, #1a1a1a 0%, #111 100%)',
                    position: 'sticky', top: 0, zIndex: 10
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{
                                color: '#d4af37', margin: 0,
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '2.2rem', letterSpacing: '1px'
                            }}>
                                📜 El Códice GHR
                            </h2>
                            <span style={{ color: '#888', fontSize: '1rem', marginTop: '5px', display: 'block' }}>
                                Manual de Estrategias Maestras de Alta Frecuencia
                            </span>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'transparent', border: 'none',
                            color: '#fff', fontSize: '2.5rem', cursor: 'pointer',
                            lineHeight: 0.5
                        }}>&times;</button>
                    </div>
                </div>

                {/* LIST */}
                <div style={{ padding: '20px' }}>
                    {MANUAL_DATA.map(strategy => (
                        <AccordionItem
                            key={strategy.id}
                            data={strategy}
                            isOpen={expandedId === strategy.id}
                            onToggle={() => toggleExpand(strategy.id)}
                        />
                    ))}


                </div>
            </div>
        </div>,
        document.body
    )
}

const AccordionItem = ({ data, isOpen, onToggle }) => {
    return (
        <div style={{
            marginBottom: '15px',
            border: isOpen ? `1px solid ${data.tierColor}` : '1px solid #333',
            background: isOpen ? '#1a1a1a' : '#0a0a0a',
            borderRadius: '8px', overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            {/* TITLE BAR (CLICKABLE) */}
            <div
                onClick={onToggle}
                style={{
                    padding: '20px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isOpen ? `linear-gradient(90deg, ${data.tierColor}22, transparent)` : 'transparent'
                }}
            >
                <div>
                    <div style={{ color: data.tierColor, fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
                        {data.tier}
                    </div>
                    <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'serif' }}>
                        {data.title}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '1.1rem' }}>{data.score}</div>
                    <div style={{ color: '#666', fontSize: '1.5rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                        ▼
                    </div>
                </div>
            </div>

            {/* EXPANDED CONTENT */}
            {isOpen && (
                <div style={{ padding: '25px', borderTop: '1px solid #333', color: '#ddd', lineHeight: '1.7' }}>

                    {/* SUMMARY */}
                    <div style={{ fontStyle: 'italic', marginBottom: '20px', color: '#fff', fontSize: '1.1rem' }}>
                        "{data.summary}"
                    </div>

                    {/* RUBRIC GRID */}
                    {data.rubric && (
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '25px',
                            border: `1px solid ${data.tierColor}44`,
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>🧪 Fundamento Científico</span>
                                <span style={{ color: data.tierColor, fontWeight: 'bold' }}>{data.rubric.scientific}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>📡 Eficiencia Cobertura</span>
                                <span style={{ color: data.tierColor, fontWeight: 'bold' }}>{data.rubric.coverage}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>🛡️ Perfil de Riesgo</span>
                                <span style={{ color: data.tierColor, fontWeight: 'bold' }}>{data.rubric.risk}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>🦢 Potencial Cisne Negro</span>
                                <span style={{ color: data.tierColor, fontWeight: 'bold' }}>{data.rubric.swan}%</span>
                            </div>
                        </div>
                    )}

                    {/* EXTENDED 20-POINT RUBRIC */}
                    {data.rubricDetails && data.rubricDetails.length > 0 && (
                        <div style={{ marginBottom: '30px' }}>
                            <h4 style={{ color: '#aaa', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>📊 Rúbrica de Análisis Profundo (20 Puntos)</h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '8px'
                            }}>
                                {data.rubricDetails.map((item, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        border: '1px solid #333'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <span style={{ color: '#ccc' }}>{item.name}</span>
                                            <span style={{ color: data.tierColor, fontWeight: 'bold' }}>{item.score}/20</span>
                                        </div>
                                        {item.note && <div style={{ color: '#777', fontSize: '0.75rem', fontStyle: 'italic' }}>{item.note}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTIONS */}
                    <h4 style={{ color: data.tierColor, borderBottom: `1px solid ${data.tierColor}`, paddingBottom: '5px' }}>🧬 Fundamento Científico (El Por Qué)</h4>
                    <p style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>{data.concept}</p>

                    <h4 style={{ color: data.tierColor, borderBottom: `1px solid ${data.tierColor}`, paddingBottom: '5px' }}>⚔️ Ejecución Táctica (El Cómo)</h4>
                    <p style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>{data.execution}</p>

                    {/* BET TABLE */}
                    <h4 style={{ color: '#d4af37', borderBottom: '1px solid #d4af37', paddingBottom: '5px', marginTop: '30px' }}>📋 Tabla de Apuestas (Paso a Paso)</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '1rem' }}>
                        <thead>
                            <tr style={{ background: '#333', color: '#fff', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>TIPO</th>
                                <th style={{ padding: '12px' }}>CASILLA (OBJETIVO)</th>
                                <th style={{ padding: '12px' }}>CANTIDAD EXACTA</th>
                                <th style={{ padding: '12px' }}>¿POR QUÉ?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.bets.map((bet, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #444', background: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#aaa' }}>{bet.type}</td>
                                    <td style={{ padding: '12px', color: '#fff', fontWeight: 'bold' }}>{bet.target}</td>
                                    <td style={{ padding: '12px', color: '#ffd700', fontWeight: '900', fontSize: '1.1rem', textTransform: 'uppercase' }}>{bet.amount}</td>
                                    <td style={{ padding: '12px', fontStyle: 'italic', color: '#888' }}>{bet.why}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* OPTIMIZATION NOTE */}
                    {data.optimizationNote && (
                        <div style={{
                            marginTop: '25px',
                            padding: '15px',
                            background: 'rgba(50, 205, 50, 0.1)',
                            border: '1px solid #32cd32',
                            borderRadius: '8px',
                            color: '#32cd32',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '10px'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>✅</span>
                            <div>
                                <strong style={{ display: 'block', marginBottom: '4px' }}>VERIFICACIÓN MATEMÁTICA:</strong>
                                {data.optimizationNote}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
