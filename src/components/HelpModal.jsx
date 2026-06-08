import React, { useState } from 'react'
import { LIMITS, PAYOUTS } from '../config/GameLimits'

export const HelpModal = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('internal')

    const styles = {
        overlay: {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        },
        modal: {
            background: '#1a1a1a', width: '800px', maxHeight: '90vh',
            border: '2px solid #d4af37', borderRadius: '8px',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 0 20px #d4af37'
        },
        header: {
            background: '#111', padding: '15px', borderBottom: '1px solid #333',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        },
        title: { color: '#d4af37', margin: 0, fontSize: '1.2rem' },
        closeBtn: {
            background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer'
        },
        nav: {
            display: 'flex', background: '#222', borderBottom: '1px solid #444'
        },
        navItem: (isActive) => ({
            padding: '12px 20px', cursor: 'pointer',
            background: isActive ? '#d4af37' : 'transparent',
            color: isActive ? '#000' : '#888',
            fontWeight: 'bold', borderRight: '1px solid #333',
            transition: 'all 0.2s'
        }),
        content: {
            padding: '20px', color: '#ddd', overflowY: 'auto', lineHeight: '1.6'
        },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.9rem' },
        th: { textAlign: 'left', borderBottom: '1px solid #555', padding: '8px', color: '#d4af37' },
        td: { borderBottom: '1px solid #333', padding: '8px' },
        odds: { color: '#ffd700', textAlign: 'right', fontWeight: 'bold' },
        prob: { color: '#aaa', textAlign: 'center', fontFamily: 'monospace' }
    }

    const renderTable = (rows) => (
        <table style={styles.table}>
            <thead>
                <tr>
                    <th style={styles.th}>Apuesta</th>
                    <th style={styles.th}>Descripción</th>
                    <th style={styles.th}>Pago</th>
                    <th style={styles.th}>Probabilidad</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i}>
                        <td style={{ ...styles.td, fontWeight: 'bold', color: '#fff' }}>{r.name}</td>
                        <td style={styles.td}>{r.desc}</td>
                        <td style={{ ...styles.td, ...styles.odds }}>{r.payout}</td>
                        <td style={{ ...styles.td, ...styles.prob }}>{r.prob}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>📘 Guía Completa de Ruleta Europea</h2>
                    <button style={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div style={styles.nav}>
                    {['Básicos', 'Controles', 'Internas', 'Externas', 'Especiales', 'Límites', 'Reglas'].map(tab => {
                        const key = tab.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        return (
                            <div
                                key={key}
                                style={styles.navItem(activeTab === key)}
                                onClick={() => setActiveTab(key)}
                            >
                                {tab}
                            </div>
                        )
                    })}
                </div>

                <div style={styles.content}>
                    {activeTab === 'basicos' && (
                        <div>
                            <h3 style={{ color: '#fff' }}>🎯 Funcionamiento General</h3>
                            <p>La <strong>Ruleta Europea (Single Zero)</strong> es la versión más favorable para el jugador.</p>
                            <ul>
                                <li><strong>Objetivo:</strong> Predecir el número (0-36) donde caerá la bola.</li>
                                <li><strong>Ventaja de la Casa:</strong> 2.7% (Muy baja comparada con slots o ruleta americana).</li>
                            </ul>
                            <div style={{ background: '#222', padding: '10px', borderLeft: '3px solid #d4af37', marginTop: '15px' }}>
                                💡 <em>Tip Pro:</em> Usa las <strong>Proyecciones</strong> (Monte Carlo) para testear si tu estrategia es matemáticamente viable antes de arriesgar saldo real.
                            </div>
                        </div>
                    )}

                    {activeTab === 'controles' && (
                        <div>
                            <h3 style={{ color: '#fff' }}>🎮 Guía de Controles</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                <div style={{ background: '#222', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #ffd700' }}>
                                    <strong style={{ color: '#ffd700', fontSize: '1.1rem' }}>GIRAR (SPIN)</strong>
                                    <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>Lanza la bola. Requiere al menos una apuesta en la mesa. Puedes usar la barra espaciadora como atajo.</p>
                                </div>
                                <div style={{ background: '#222', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #336699' }}>
                                    <strong style={{ color: '#336699', fontSize: '1.1rem' }}>REPETIR</strong>
                                    <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>Vuelve a colocar exactamente las mismas fichas de la ronda anterior. Útil para estrategias sistemáticas.</p>
                                </div>
                                <div style={{ background: '#222', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #336699' }}>
                                    <strong style={{ color: '#336699', fontSize: '1.1rem' }}>x2 (DOBLAR)</strong>
                                    <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>Duplica el valor de todas las fichas en la mesa actual. ¡Cuidado con los límites de mesa!</p>
                                </div>
                                <div style={{ background: '#222', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #663333' }}>
                                    <strong style={{ color: '#663333', fontSize: '1.1rem' }}>DESHACER</strong>
                                    <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>Elimina la última acción de apuesta realizada. Funciona paso a paso hacia atrás.</p>
                                </div>
                                <div style={{ background: '#222', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #444' }}>
                                    <strong style={{ color: '#aaa', fontSize: '1.1rem' }}>GESTIÓN DE VENTANAS</strong>
                                    <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>Haz clic en el icono 🖊️ (Lápiz) para desbloquear la interfaz. Puedes <strong>arrastrar y mover</strong> todos los paneles (Historial, Proyecciones, Racetrack) a tu gusto.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'internas' && (
                        <div>
                            <h3 style={{ color: '#ff8888' }}>🔴 Apuestas Internas</h3>
                            <p>Alta volatilidad: Pagos grandes, aciertos menos frecuentes.</p>
                            {renderTable([
                                { name: 'Pleno (#1)', desc: '1 Número exacto', payout: '35 a 1', prob: '2.7%' },
                                { name: 'Medio (#2)', desc: '2 números adyacentes', payout: '17 a 1', prob: '5.4%' },
                                { name: 'Calle (#3)', desc: '3 números en fila', payout: '11 a 1', prob: '8.1%' },
                                { name: 'Cuadro (#4)', desc: '4 números en esquina', payout: '8 a 1', prob: '10.8%' },
                                { name: 'Linea (#6)', desc: '6 números (2 calles)', payout: '5 a 1', prob: '16.2%' }
                            ])}
                        </div>
                    )}

                    {activeTab === 'externas' && (
                        <div>
                            <h3 style={{ color: '#88aaff' }}>🔵 Apuestas Externas</h3>
                            <p>Baja volatilidad: Ideales para jugar más tiempo con menor riesgo.</p>
                            {renderTable([
                                { name: 'Columna (#12)', desc: '1 de 3 columnas', payout: '2 a 1', prob: '32.4%' },
                                { name: 'Docena (#12)', desc: '1-12, 13-24, etc', payout: '2 a 1', prob: '32.4%' },
                                { name: 'Rojo / Negro (#18)', desc: '18 números por color', payout: '1 a 1', prob: '48.6%' },
                                { name: 'Par / Impar (#18)', desc: '18 números según paridad', payout: '1 a 1', prob: '48.6%' },
                                { name: 'Bajo / Alto (#18)', desc: '1-18 o 19-36', payout: '1 a 1', prob: '48.6%' }
                            ])}
                        </div>
                    )}

                    {activeTab === 'especiales' && (
                        <div>
                            <h3 style={{ color: '#d4af37' }}>🏎️ Racetrack (Call Bets)</h3>
                            <p>Apuestas clásicas basadas en la posición física de los números en la rueda.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ background: '#222', padding: '10px', borderRadius: '4px', borderTop: '2px solid #fff' }}>
                                    <strong style={{ color: '#fff' }}>Voisins (#17)</strong>
                                    <p style={{ fontSize: '0.85rem' }}>17 números alrededor del 0.</p>
                                </div>
                                <div style={{ background: '#222', padding: '10px', borderRadius: '4px', borderTop: '2px solid #55a' }}>
                                    <strong style={{ color: '#fff' }}>Tier (#12)</strong>
                                    <p style={{ fontSize: '0.85rem' }}>Sector opuesto al 0.</p>
                                </div>
                                <div style={{ background: '#222', padding: '10px', borderRadius: '4px', borderTop: '2px solid #5a5' }}>
                                    <strong style={{ color: '#fff' }}>Orphelins (#8)</strong>
                                    <p style={{ fontSize: '0.85rem' }}>8 números restantes.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'limites' && (
                        <div>
                            <h3 style={{ color: '#d4af37' }}>⚠️ Límites de Apuesta</h3>
                            <p>Tu <strong>Pago Máximo ({LIMITS.REAL.MAX_WIN_PER_SPIN})</strong> determina cuánto puedes apostar en cada posición.</p>

                            <div style={{ padding: '15px', background: '#221', border: '1px solid #552', borderRadius: '5px' }}>
                                <strong>¿Por qué existe un límite?</strong>
                                <br />
                                <small style={{ color: '#aaa' }}>Para garantizar que la banca siempre pueda pagar una ganancia masiva (ej: Pleno con apuesta máxima). Si intentas excederlo, el sistema bloqueará la ficha y te avisará.</small>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reglas' && (
                        <div>
                            <h3 style={{ color: '#aaa' }}>📜 Reglas de la Casa</h3>
                            <ul>
                                <li style={{ marginBottom: '15px' }}>
                                    <strong style={{ color: '#fff' }}>Sin "La Partage":</strong>
                                    <span style={{ color: '#f88', marginLeft: '5px' }}>Inactiva</span>
                                    <br />
                                    <small>Si sale CERO (0), todas las apuestas externas (Rojo/Negro, etc.) se pierden completamente, siguiendo el estándar internacional más común. No se devuelve la mitad.</small>
                                </li>
                                <li>
                                    <strong style={{ color: '#fff' }}>RTP Teórico:</strong>
                                    <span style={{ color: '#4f4', marginLeft: '5px' }}>97.30%</span>
                                    <br />
                                    <small>El retorno teórico al jugador es estándar para ruleta europea de un solo cero.</small>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
