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
                    {['Básicos', 'Internas', 'Externas', 'Especiales', 'Límites', 'Reglas'].map(tab => {
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
                            <h3 style={{ color: '#fff' }}>Funcionamiento General</h3>
                            <p>La **Ruleta Europea** se caracteriza por tener un solo cero (**0**), lo que ofrece mejores probabilidades para el jugador en comparación con la versión americana (que tiene 0 y 00).</p>
                            <ul>
                                <li><strong>Total de Números:</strong> 37 (del 0 al 36).</li>
                                <li><strong>Ventaja de la Casa:</strong> Solo 2.7% (frente al 5.26% de la Americana).</li>
                                <li><strong>Objetivo:</strong> Predecir en qué casilla caerá la bola lanzada por el crupier.</li>
                            </ul>
                            <div style={{ background: '#222', padding: '10px', borderLeft: '3px solid #d4af37', marginTop: '15px' }}>
                                💡 <em>Dato:</em> Al tener un solo cero, la probabilidad de acierto en apuestas sencillas (Rojo/Negro) es del <strong>48.6%</strong>.
                            </div>
                        </div>
                    )}

                    {activeTab === 'internas' && (
                        <div>
                            <h3 style={{ color: '#ff8888' }}>Apuestas Internas</h3>
                            <p>Se realizan en la cuadrícula numérica. Tienen **pagos altos** pero menor probabilidad.</p>
                            {renderTable([
                                { name: 'Pleno', desc: 'Apuesta a 1 solo número.', payout: '35 a 1', prob: '1 de 37 (2.7%)' },
                                { name: 'Caballo (Split)', desc: '2 números adyacentes.', payout: '17 a 1', prob: '1 de 18.5 (5.4%)' },
                                { name: 'Calle (Trío)', desc: '3 números en fila horizontal.', payout: '11 a 1', prob: '1 de 12.3 (8.1%)' },
                                { name: 'Cuadro (Corner)', desc: '4 números formando un cuadrado.', payout: '8 a 1', prob: '1 de 9.25 (10.8%)' },
                                { name: 'Sexteto (Seisena)', desc: '6 números (2 filas adyacentes).', payout: '5 a 1', prob: '1 de 6.2 (16.2%)' },
                                { name: 'Canasta (Basket)', desc: '0, 1, 2, 3 (Primeros cuatro).', payout: '8 a 1', prob: '1 de 9.25 (10.8%)' }
                            ])}
                        </div>
                    )}

                    {activeTab === 'externas' && (
                        <div>
                            <h3 style={{ color: '#88aaff' }}>Apuestas Externas</h3>
                            <p>Cubren grandes grupos. Tienen **pagos bajos** pero alta probabilidad de acierto.</p>
                            {renderTable([
                                { name: 'Columna', desc: '12 números en vertical.', payout: '2 a 1', prob: '1 de 3.1 (32.4%)' },
                                { name: 'Docena', desc: '1-12, 13-24 o 25-36.', payout: '2 a 1', prob: '1 de 3.1 (32.4%)' },
                                { name: 'Rojo / Negro', desc: 'Color del número.', payout: '1 a 1', prob: '1 de 2.06 (48.6%)' },
                                { name: 'Par / Impar', desc: 'Propiedad matemática.', payout: '1 a 1', prob: '1 de 2.06 (48.6%)' },
                                { name: 'Falta / Pasa', desc: '1-18 (Falta) o 19-36 (Pasa).', payout: '1 a 1', prob: '1 de 2.06 (48.6%)' }
                            ])}
                        </div>
                    )}

                    {activeTab === 'especiales' && (
                        <div>
                            <h3 style={{ color: '#d4af37' }}>Apuestas Especiales (Call Bets)</h3>
                            <p>Modalidades clásicas de la ruleta francesa/europea, generalmente jugadas en el "Racetrack".</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ background: '#222', padding: '10px', borderRadius: '4px' }}>
                                    <strong style={{ color: '#fff' }}>Vecinos del Cero</strong>
                                    <p style={{ fontSize: '0.85rem' }}>Cubre 17 números alrededor del 0 (casi la mitad de la rueda). Requiere 9 fichas.</p>
                                </div>
                                <div style={{ background: '#222', padding: '10px', borderRadius: '4px' }}>
                                    <strong style={{ color: '#fff' }}>Tercios (Tiers)</strong>
                                    <p style={{ fontSize: '0.85rem' }}>Los 12 números opuestos al cero. Requiere 6 fichas.</p>
                                </div>
                                <div style={{ background: '#222', padding: '10px', borderRadius: '4px' }}>
                                    <strong style={{ color: '#fff' }}>Huérfanos</strong>
                                    <p style={{ fontSize: '0.85rem' }}>Los 8 números que no están ni en Vecinos ni en Tercios. Requiere 5 fichas.</p>
                                </div>
                                <div style={{ background: '#222', padding: '10px', borderRadius: '4px' }}>
                                    <strong style={{ color: '#fff' }}>Juego Cero (Jeu 0)</strong>
                                    <p style={{ fontSize: '0.85rem' }}>Los 7 números más cercanos al cero. Versión reducida de los vecinos.</p>
                                </div>
                            </div>

                            <h4 style={{ marginTop: '20px' }}>Apuestas Finales</h4>
                            <p>Apostar a todos los números que terminan en un dígito. Ejemplo: <strong>"Final 4"</strong> cubre 4, 14, 24, 34.</p>
                        </div>
                    )}

                    {activeTab === 'limites' && (
                        <div>
                            <h3 style={{ color: '#d4af37' }}>Límites de Apuesta (Modo Real)</h3>
                            <p>Los límites máximos por posición se calculan dinámicamente según el <strong>Pago Máximo ({LIMITS.REAL.MAX_WIN_PER_SPIN})</strong>.</p>

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ background: '#222', padding: '10px', borderRadius: '4px', border: '1px solid #444' }}>
                                    <small style={{ color: '#888' }}>Mínimo General</small>
                                    <div style={{ fontSize: '1.2rem', color: '#fff' }}>${LIMITS.REAL.MIN_BET}</div>
                                </div>
                                <div style={{ background: '#222', padding: '10px', borderRadius: '4px', border: '1px solid #444' }}>
                                    <small style={{ color: '#888' }}>Máximo Mesa Total</small>
                                    <div style={{ fontSize: '1.2rem', color: '#fff' }}>${LIMITS.REAL.MAX_TOTAL_BET}</div>
                                </div>
                                <div style={{ background: '#222', padding: '10px', borderRadius: '4px', border: '1px solid #d4af37' }}>
                                    <small style={{ color: '#d4af37' }}>Pago Máx. x Giro</small>
                                    <div style={{ fontSize: '1.2rem', color: '#ffd700' }}>${LIMITS.REAL.MAX_WIN_PER_SPIN}</div>
                                </div>
                            </div>

                            {renderTable([
                                { name: 'Pleno', desc: '1 Número', payout: '35:1', prob: `$${Math.floor(LIMITS.REAL.MAX_WIN_PER_SPIN / PAYOUTS.STRAIGHT)}` },
                                { name: 'Caballo', desc: '2 Números', payout: '17:1', prob: `$${Math.floor(LIMITS.REAL.MAX_WIN_PER_SPIN / PAYOUTS.SPLIT)}` },
                                { name: 'Calle', desc: '3 Números', payout: '11:1', prob: `$${Math.floor(LIMITS.REAL.MAX_WIN_PER_SPIN / PAYOUTS.STREET)}` },
                                { name: 'Cuadro', desc: '4 Números', payout: '8:1', prob: `$${Math.floor(LIMITS.REAL.MAX_WIN_PER_SPIN / PAYOUTS.CORNER)}` },
                                { name: 'Seisena', desc: '6 Números', payout: '5:1', prob: `$${Math.floor(LIMITS.REAL.MAX_WIN_PER_SPIN / PAYOUTS.LINE)}` },
                                { name: 'Columna / Docena', desc: '12 Números', payout: '2:1', prob: `$${Math.floor(LIMITS.REAL.MAX_WIN_PER_SPIN / PAYOUTS.DOZEN)}` },
                                { name: 'Suertes Sencillas', desc: 'Rojo/Negro, Par/Impar...', payout: '1:1', prob: `$${Math.floor(LIMITS.REAL.MAX_WIN_PER_SPIN / PAYOUTS.SIMPLE)}` },
                            ].map(x => ({ ...x, prob: x.prob })))} {/* Reusing 'prob' column for Max Bet visually */}

                            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px' }}>
                                * El límite máximo indica cuánto puedes apostar en una sola posición sin exceder el pago máximo permitido.
                            </p>
                        </div>
                    )}

                    {activeTab === 'reglas' && (
                        <div>
                            <h3 style={{ color: '#aaa' }}>Reglas de Protección (Solo Informativo)</h3>
                            <p>En algunas mesas europeas físicas existen reglas que protegen las apuestas externas cuando sale el CERO (0). <br /><em>Nota: Verificar si esta mesa aplica estas reglas.</em></p>
                            <ul>
                                <li style={{ marginBottom: '10px' }}>
                                    <strong style={{ color: '#fff' }}>En Prisión:</strong> Si sale 0, tu apuesta (ej: Rojo) no se pierde. Se "retiene". Si en el siguiente giro sale Rojo, recuperas tu dinero. Si sale Negro, lo pierdes.
                                </li>
                                <li>
                                    <strong style={{ color: '#fff' }}>La Partage:</strong> Si sale 0, inmediatamente recuperas la <strong>mitad</strong> de tu apuesta externa. La otra mitad se la queda la casa.
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
