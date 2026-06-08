import React, { useState } from 'react'

const MODULES = [
    {
        id: 1,
        title: "MÓDULO 1: LA FILOSOFÍA (MINDSET)",
        subtitle: "De Jugador a Operador Forense",
        icon: "🧠",
        color: "#d4af37",
        sections: [
            {
                heading: "1.1. Neutralidad Emocional",
                content: "El Operador Forense trata el capital como inventario y la apuesta como una orden de compra. Si hay adrenalina, hay error. La app es una herramienta de extracción de datos, no un juego."
            },
            {
                heading: "1.2. La Ley de la Inevitabilidad",
                content: "No predecimos el futuro; identificamos ineficiencias matemáticas que DEBEN equilibrarse. El azar es ruido; la estadística es la música que aprendemos a escuchar."
            }
        ]
    },
    {
        id: 2,
        title: "MÓDULO 2: ANATOMÍA DE LA CABINA",
        subtitle: "Arquitectura de Instrumentación Forense",
        icon: "🖥️",
        color: "#3498db",
        sections: [
            {
                heading: "2.1. El Cilindro Balístico",
                content: "Simulación 3D avanzada. No es un generador de números aleatorios simple; es un modelo físico que calcula rebotes y fricción. El rotor variable previene patrones fijos."
            },
            {
                heading: "2.2. Panel de Telemetría (Física de la Bola)",
                content: "Datos en tiempo real sobre m/s y revoluciones. El sistema detecta cuándo una bola entra en 'Zona de Predicción' vs 'Zona de Caos'."
            }
        ]
    },
    {
        id: 3,
        title: "MÓDULO 3: INTELIGENCIA DE SEÑALES",
        subtitle: "Interpretación del Ratio F/N y Alertas ATAQUE",
        icon: "👁️",
        color: "#2ecc71",
        sections: [
            {
                heading: "3.1. El Santo Grial: Ratio F/N",
                content: "Frecuencia sobre Normalidad. Un valor 1.0 es equilibrio perfecto. Valores > 2.5 indican una anomalía estructural que el sistema marca como 'Oportunidad Forense'."
            },
            {
                heading: "3.2. Estados del Motor: ESPERA vs ATAQUE",
                content: "Si el sistema dice 'ESPERA', el mercado tiene demasiado ruido. No se dispara. El estado 'ATAQUE' significa que la señal ha roto la barrera de confianza estadística."
            }
        ]
    },
    {
        id: 4,
        title: "MÓDULO 4: PROTOCOLO ANTIGRAVEDAD",
        subtitle: "Seguridad Estructural y Persistencia (Nivel 3)",
        icon: "🛡️",
        color: "#e67e22",
        sections: [
            {
                heading: "4.1. Seguridad Estructural de 3 Capas",
                content: "Capa 1: Validación de Schema (Default Merging). Capa 2: Sanidad de Coordenadas (Viewport Clamping). Capa 3: Persistencia Atómica (Immediate LocalStorage Lock)."
            },
            {
                heading: "4.2. Recuperación de Layouts",
                content: "Tus paneles GHR nunca se perderán. El sistema guarda la configuración exacta de tus herramientas tácticas incluso tras un cierre inesperado del navegador."
            }
        ]
    },
    {
        id: 5,
        title: "MÓDULO 5: TERMINAL DE PROYECCIONES (E9)",
        subtitle: "Análisis de Ganancia Proyectada y Profit Graph",
        icon: "📉",
        color: "#4dabf7",
        sections: [
            {
                heading: "5.1. El Gráfico de Ganancia Forense",
                content: "Muestra la tendencia real de tu capital vs el tiempo. Un Operador busca una curva ascendente estable. Las caídas bruscas indican fallos en el Protocolo de Riesgo."
            },
            {
                heading: "5.2. Proyección a 8 Horas",
                content: "El sistema calcula cuánto ganarías si mantuvieras tu eficiencia actual durante una jornada laboral completa. Es tu KPI de productividad operativa."
            }
        ]
    },
    {
        id: 6,
        title: "MÓDULO 6: TORRE DE AUDITORÍA (E40)",
        subtitle: "Certificación Forense y Rúbricas de Calidad",
        icon: "⚖",
        color: "#d4af37",
        sections: [
            {
                heading: "6.1. Auditoría de Ingeniería & CAT",
                content: "Verificación de que los algoritmos de cálculo (CAT) están operando sin bugs y con precisión de coma flotante de 64 bits."
            },
            {
                heading: "6.2. Dictamen Visual y Valorización de IP",
                content: "Certifica que la interfaz cumple con los estándares Premium Tray y que el Valor de Mercado de la App (Elemento 5) está respaldado por su capacidad de extracción."
            }
        ]
    },
    {
        id: 7,
        title: "MÓDULO 7: HISTORIAL Y TENDENCIAS (E7)",
        subtitle: "Análisis de Calientes vs Fríos",
        icon: "📜",
        color: "#ff6b6b",
        sections: [
            {
                heading: "7.1. Los Últimos 20: El Micro-Ciclo",
                content: "Aquí buscamos 'Sleepers' (números fríos) que están a punto de despertar o 'Hot Numbers' que dominan el rotor actual por sesgos del crupier."
            },
            {
                heading: "7.2. Marcadores de Referencia",
                content: "Los indicadores (5, 10, 15, 20) en el historial permiten medir la velocidad de rotación de las tendencias."
            }
        ]
    },
    {
        id: 8,
        title: "MÓDULO 8: GRADUACIÓN Y MAESTRÍA",
        subtitle: "Certificación Final como Operador Senior",
        icon: "🎓",
        color: "#bdc3c7",
        sections: [
            {
                heading: "8.1. El Cockpit Personalizado",
                content: "Organiza tus herramientas según tu dominancia ocular o manual. Un cockpit eficiente reduce la fatiga cognitiva durante sesiones largas (> 2 horas)."
            },
            {
                heading: "8.2. Tu Firma Forense",
                content: "Al completar estos módulos, tu forma de operar es una firma única. Ya no juegas a la ruleta; administras un flujo de caja matemático certificado."
            }
        ]
    },
    {
        id: 9,
        title: "MÓDULO 9: GESTIÓN DEL TIEMPO (E14/E24)",
        subtitle: "Cronometría Forense y Ritmo Operativo",
        icon: "⏱️",
        color: "#f39c12",
        sections: [
            {
                heading: "9.1. El Reloj de Sesión (E14)",
                content: "Factor crítico para medir el agotamiento cognitivo. El sistema rastrea cada segundo para correlacionar tiempo con efectividad. Sesiones > 60 min requieren revisión de balance."
            },
            {
                heading: "9.2. Control de Barra Temporal (E24)",
                content: "Sincroniza tu análisis con el ciclo de la mesa. El timer 'AUTO' garantiza que no pierdas oportunidades por parálisis de decisión, manteniendo un flujo constante de datos."
            }
        ]
    }
]

export const ForensicManualModal = ({ onClose }) => {
    const [activeModule, setActiveModule] = useState(1)
    const currentModule = MODULES.find(m => m.id === activeModule)

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.92)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(20px)'
        }} onClick={onClose}>
            <div style={{
                background: '#0a0a0a',
                width: '1240px', height: '88vh',
                borderRadius: '24px',
                border: '1px solid #333',
                display: 'flex',
                overflow: 'hidden',
                boxShadow: '0 0 100px rgba(0,0,0,0.9)',
                borderTop: '2px solid #444'
            }} onClick={e => e.stopPropagation()}>

                {/* SIDEBAR NAVIGATION */}
                <div style={{ width: '340px', background: '#0d0d0d', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '30px', borderBottom: '1px solid #333', textAlign: 'center', background: 'linear-gradient(to bottom, #111, #0d0d0d)' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🎓</div>
                        <h2 style={{ color: '#fff', fontSize: '1.4rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}>ACADEMIA GHR</h2>
                        <div style={{ color: '#d4af37', fontSize: '0.8rem', marginTop: '8px', fontWeight: 'bold' }}>SISTEMA DE ENTRENAMIENTO FORENSE</div>
                    </div>

                    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '15px', scrollbarWidth: 'thin' }}>
                        {MODULES.map(m => (
                            <div key={m.id}
                                onClick={() => setActiveModule(m.id)}
                                style={{
                                    padding: '18px',
                                    marginBottom: '10px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    background: activeModule === m.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                    border: `1px solid ${activeModule === m.id ? m.color + '44' : 'transparent'}`,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: activeModule === m.id ? '#fff' : '#888' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Módulo {m.id}</div>
                                </div>
                                <div style={{ marginLeft: '35px', fontSize: '0.8rem', color: activeModule === m.id ? m.color : '#555', marginTop: '4px' }}>
                                    {m.subtitle}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '25px', borderTop: '1px solid #333', background: '#0a0a0a' }}>
                        <button onClick={onClose} style={{
                            width: '100%', padding: '15px', background: 'linear-gradient(45deg, #222, #333)', color: '#fff',
                            border: '1px solid #444', borderRadius: '12px',
                            cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'
                        }}>Cerrar Estación</button>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: '#050505', position: 'relative' }}>
                    {/* BACKGROUND WATERMARK */}
                    <div style={{ position: 'absolute', bottom: '20px', right: '20px', fontSize: '10rem', opacity: 0.03, pointerEvents: 'none' }}>
                        {currentModule.icon}
                    </div>

                    {/* HEADER */}
                    <div style={{
                        padding: '60px',
                        background: `linear-gradient(90deg, ${currentModule.color}15, transparent)`,
                        borderBottom: '1px solid #222'
                    }}>
                        <div style={{ color: currentModule.color, fontSize: '1rem', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '15px', textTransform: 'uppercase' }}>
                            PROTOCOLO {currentModule.id} / 8
                        </div>
                        <h1 style={{ color: '#fff', fontSize: '3.5rem', margin: 0, fontWeight: '900', letterSpacing: '-1px' }}>
                            {currentModule.subtitle}
                        </h1>
                    </div>

                    {/* CONTENT SCROLL */}
                    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '60px' }}>
                        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                            {currentModule.sections.map((sec, idx) => (
                                <div key={idx} style={{ marginBottom: '60px' }}>
                                    <h3 style={{
                                        color: currentModule.color,
                                        fontSize: '1.8rem',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '15px'
                                    }}>
                                        <div style={{ width: '4px', height: '30px', background: currentModule.color }}></div>
                                        {sec.heading}
                                    </h3>
                                    <p style={{
                                        color: '#e0e0e0',
                                        fontSize: '1.25rem',
                                        lineHeight: '1.9',
                                        background: 'rgba(255,255,255,0.03)',
                                        padding: '35px',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                                    }}>
                                        {sec.content}
                                    </p>
                                </div>
                            ))}

                            {/* NAVIGATION FOOTER */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '100px', paddingTop: '40px', borderTop: '1px solid #222' }}>
                                <button
                                    disabled={activeModule === 1}
                                    onClick={() => setActiveModule(prev => prev - 1)}
                                    style={{
                                        background: 'transparent', color: activeModule === 1 ? '#222' : '#666', border: 'none',
                                        cursor: activeModule === 1 ? 'default' : 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold'
                                    }}
                                >
                                    {activeModule !== 1 && '← Anterior'}
                                </button>

                                {activeModule < 8 ? (
                                    <button
                                        onClick={() => setActiveModule(prev => prev + 1)}
                                        style={{
                                            background: currentModule.color, color: '#000', border: 'none', borderRadius: '40px',
                                            padding: '18px 45px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem',
                                            boxShadow: `0 10px 30px ${currentModule.color}55`, textTransform: 'uppercase'
                                        }}
                                    >
                                        Siguiente Módulo →
                                    </button>
                                ) : (
                                    <button
                                        onClick={onClose}
                                        style={{
                                            background: '#fff', color: '#000', border: 'none', borderRadius: '40px',
                                            padding: '18px 45px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem',
                                            boxShadow: '0 10px 40px rgba(255,255,255,0.4)', textTransform: 'uppercase'
                                        }}
                                    >
                                        🎓 FINALIZAR ACADEMIA
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
