import React from 'react';

export const ComponentListWidget = ({ onClose }) => {
    const componentMap = [
        { id: 'E1', name: 'Ruleta', desc: 'Panel de control de la rueda física/3D.' },
        { id: 'E2', name: 'Tapete de Apuestas', desc: 'Interfaz principal para colocar fichas.' },
        { id: 'E3', name: 'Banca y Estado', desc: 'Control de saldo, apuestas y rendimiento.' },
        { id: 'E4', name: 'Mandos y Fichas', desc: 'Selector de valor de apuesta y controles de giro.' },
        { id: 'E5', name: 'Valor de la App', desc: 'Indicador de valor de mercado y activos de la app.' },
        { id: 'E6', name: 'Mejor Oportunidad', desc: 'Widget de sugerencia táctica de alta probabilidad.' },
        { id: 'E7', name: 'Historial Básico', desc: 'Panel lateral de últimos números y tendencias.' },
        { id: 'E8', name: 'Apuestas Activas', desc: 'Resumen de posiciones abiertas en la mesa.' },
        { id: 'E9', name: 'Gráfico de Sesión', desc: 'Visualización de la curva de rentabilidad.' },
        { id: 'E10', name: 'Control de Fondos', desc: 'Acceso rápido a recarga de saldo ($).' },
        { id: 'E11', name: 'Métodos de Juego', desc: 'Panel de selección de estrategias predefinidas.' },
        { id: 'E12', name: 'Escáner de Mercado', desc: 'Búsqueda de ineficiencias en apuestas internas.' },
        { id: 'E13', name: 'Sistemas GHR', desc: 'Configuración de algoritmos de ataque.' },
        { id: 'E14', name: 'Reloj de Sesion', desc: 'Cronómetro de tiempo transcurrido (integrado en E24).' },
        { id: 'E15', name: 'Contador de Giros', desc: 'Métrica de volumen de juego por sesión.' },
        { id: 'E16', name: 'Pantalla Completa', desc: 'Alternador de modo inmersivo.' },
        { id: 'E17', name: 'Estadísticas', desc: 'Panel avanzado de frecuencias y sectores.' },
        { id: 'E18', name: 'Racetrack / Vecinos', desc: 'Tapete de apuestas por sectores físicos (Combate).' },
        { id: 'E19', name: 'Telemetría Física', desc: 'Predicción basada en balística (Inteligencia Física).' },
        { id: 'E20', name: 'Guía de Pagos', desc: 'Referencia rápida de cuotas y reglas (Paytable).' },
        { id: 'E21', name: 'Historial Detallado', desc: 'Forense completo de cada jugada realizada.' },
        { id: 'E22', name: 'Control de Diseño', desc: 'Herramientas de bloqueo y guardado de layout.' },
        { id: 'E42', name: 'Monitor de Estrategia', desc: 'Panel de control de tácticas activas.' },
        { id: 'E43', name: 'Calles Frías', desc: 'Top 3 calles más antiguas sin salir.' },
        { id: 'E44', name: 'Líneas Frías', desc: 'Top 3 líneas más antiguas sin salir.' },
        { id: 'E24', name: 'Temporizador', desc: 'Reloj de betting window (integrado con E14).' },
        { id: 'E25', name: 'Selector de Modo', desc: 'Alterna entre Modo Live y Simulación.' },
        { id: 'E26', name: 'Branding', desc: 'Identidad organizacional GHR Ruleta Royale.' },
        { id: 'E27', name: 'Eficiencia de Fichas', desc: 'Análisis de optimización de banca.' },
        { id: 'E28', name: 'Manual Ingeniería', desc: 'Protocolo de diseño estructural (Audit Tower).' },
        { id: 'E29', name: 'Ingeniería Aplicada', desc: 'Ejecución de protocolos CAT (Audit Tower).' },
        { id: 'E30', name: 'Rúbrica Visual', desc: 'Estándar de calidad estética (Audit Tower).' },
        { id: 'E31', name: 'Dictamen Visual', desc: 'Certificación de cumplimiento UI (Audit Tower).' },
        { id: 'E32', name: 'Manual de Valor', desc: 'Referencia de tasación de activos (Audit Tower).' },
        { id: 'E33', name: 'Certificación de Valor', desc: 'Validación de capital intelectual (Audit Tower).' },
        { id: 'E34', name: 'Academia', desc: 'Cursos y protocolos de operador (Audit Tower).' },
        { id: 'E35', name: 'AlphaWidget Engine', desc: 'Motor principal de convergencia estadística.' },
        { id: 'E36', name: 'Justificación Alpha', desc: 'Análisis forense de señales Tier S.' },
        { id: 'E37', name: 'Audit Tower', desc: 'Escudo de Armas y Sentinel de Auditoría.' },
        { id: 'E38', name: 'Unified Dashboard', desc: 'Vista consolidada multi-tab (Banca/Stats).' },
        // E39 Strategy Monitor - REMOVED (Redundant with E35)
        { id: 'E40', name: 'Lista de Componentes', desc: 'Directorio maestro de identificación de activos.' }
    ];

    return (
        <div className="panel-tray-dark" style={{
            width: 'auto',
            minWidth: '400px',
            maxWidth: '1200px',
            height: 'auto',
            background: 'rgba(10, 10, 10, 0.99)',
            border: '1px solid #d4af37',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* HEADER */}
            <div style={{
                padding: '12px 15px',
                background: 'linear-gradient(to bottom, #222, #000)',
                borderBottom: '1px solid #d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        background: '#ffeb3b',
                        color: '#000',
                        width: '32px',
                        height: '24px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: '900',
                        border: '1px solid #000',
                        boxShadow: '0 0 5px rgba(255, 235, 59, 0.3)',
                        flexShrink: 0
                    }}>E40</div>
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold', letterSpacing: '1px' }}>
                        LISTA DE COMPONENTES GHR
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', color: '#d4af37', fontSize: '1.5rem', cursor: 'pointer', lineHeight: '1'
                    }}>×</button>
                )}
            </div>

            {/* LIST CONTENT */}
            <div style={{ padding: '15px', maxHeight: '70vh', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 5px', color: '#eee', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ color: '#d4af37', textAlign: 'left', fontSize: '0.9rem' }}>
                            <th style={{ padding: '10px', borderBottom: '1px solid #333', width: '60px' }}>ID</th>
                            <th style={{ padding: '10px', borderBottom: '1px solid #333' }}>Componente & Propósito</th>
                        </tr>
                    </thead>
                    <tbody>
                        {componentMap.map((comp, idx) => (
                            <tr key={comp.id} style={{
                                background: idx % 2 === 0 ? 'rgba(212, 175, 55, 0.05)' : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s'
                            }}>
                                <td style={{ padding: '10px 15px', fontWeight: 'bold', color: '#ffd700', fontSize: '0.95rem', borderLeft: '2px solid #d4af37' }}>{comp.id}</td>
                                <td style={{ padding: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '2px', color: '#fff' }}>{comp.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#bbb', lineHeight: '1.4' }}>{comp.desc}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FOOTER */}
            <div style={{
                padding: '10px',
                textAlign: 'center',
                background: 'rgba(212, 175, 55, 0.05)',
                fontSize: '0.75rem',
                color: '#d4af37',
                borderTop: '1px solid #222',
                fontWeight: 'bold',
                letterSpacing: '1px'
            }}>
                PROTOCOLO DE IDENTIFICACIÓN GHR v3.5 - 2026
            </div>
        </div>
    );
};
