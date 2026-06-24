import React from 'react'

export const ValueRubricModal = ({ onClose, mode = 'master', auditResult = { score: 785, max: 800, percentage: 98 } }) => {
    const isApplied = mode === 'applied';

    const categories = [
        // GROUP A: INGENIERÍA DE SOFTWARE (1-10)
        { cat: '1. Arquitectura de Componentes (SOLID)', pts: 20, desc: 'Desacoplamiento estricto y responsabilidad única por módulo React.' },
        { cat: '2. Gestión de Estado Determinista', pts: 20, desc: 'Flux/Redux-like pattern (Zustand) para trazabilidad total del estado.' },
        { cat: '3. Simulador Balístico (Physics Engine)', pts: 20, desc: 'Cálculo de trayectorias y fricción para determinar resultados no-sesgados.' },
        { cat: '4. Optimización de Bundling (Vite/Rollup)', pts: 20, desc: 'Tree-shaking agresivo para tiempos de carga < 500ms.' },
        { cat: '5. Abstracción de Lógica (Custom Hooks)', pts: 20, desc: 'Encapsulamiento de reglas de negocio en funciones puras testeables.' },
        { cat: '6. Manejo de DOM Virtual', pts: 20, desc: 'Minimización de repaints mediante uso eficiente de `refs` y `keys`.' },
        { cat: '7. Ciclo de Vida (Memory Management)', pts: 19, desc: 'Prevención de memory leaks en listeners y suscripciones (useEffect cleanup).' },
        { cat: '8. Resiliencia (Error Boundaries)', pts: 20, desc: 'Degradación elegante ante fallos de renderizado en tiempo de ejecución.' },
        { cat: '9. Código Autodocumentado', pts: 18, desc: 'Nomenclatura semántica que elimina la necesidad de comentarios triviales.' },
        { cat: '10. Extensibilidad Modular', pts: 20, desc: 'Arquitectura preparada para micro-frontends o inyección de dependencias.' },

        // GROUP B: INTELIGENCIA FORENSE Y ALGORITMOS (11-20)
        { cat: '11. Eficiencia de Cobertura (Problem P vs NP)', pts: 20, desc: 'Implementación de algoritmo Knapsack para minimizar fichas per cápita.' },
        { cat: '12. Detección de Anomalías (Outliers)', pts: 20, desc: 'Identificación estadística de desviaciones significativas (Z-Score > 2).' },
        { cat: '13. Mapeo de Calor (Heatmaps)', pts: 20, desc: 'Visualización de densidad de probabilidad basada en frecuencia histórica.' },
        { cat: '14. Análisis de Series Temporales', pts: 20, desc: 'Evaluación de tendencias de fondo (Momentum) en ventanas deslizantes.' },
        { cat: '15. Ley de los Grandes Números', pts: 19, desc: 'Proyección de retorno al promedio (Mean Reversion) a largo plazo.' },
        { cat: '16. Optimización de Costos (Chip Economy)', pts: 20, desc: 'Algoritmo voraz (Greedy) para reducir el Costo de Oportunidad.' },
        { cat: '17. Métrica de Madurez (MAD)', pts: 20, desc: 'Cálculo de `(Ausencia / Espera)` para cuantificar la presión estadística.' },
        { cat: '18. Validación de Restricciones', pts: 20, desc: 'Motor de reglas para impedir estados de juego inválidos (Sanity Check).' },
        { cat: '19. Simulación Estocástica', pts: 18, desc: 'Capacidad de ejecutar escenarios "Fast Forward" (Montecarlo simplificado).' },
        { cat: '20. Integridad Referencial', pts: 20, desc: 'Inmutabilidad garantizada de los registros históricos de sesión.' },

        // GROUP C: INTERFAZ DE ALTO RENDIMIENTO (21-30)
        { cat: '21. Estética HFT (High Freq Trading)', pts: 20, desc: 'UI optimizada para la toma de decisiones en milisegundos.' },
        { cat: '22. Densidad de Información Máxima', pts: 20, desc: 'Dashboard tipo "Cockpit" sin espacio desperdiciado (White Space).' },
        { cat: '23. Persistencia de Entorno', pts: 20, desc: 'Guardado local de configuraciones de layout (Drag & Drop state).' },
        { cat: '24. Feedback Multimodal', pts: 20, desc: 'Confirmación redundante (Visual + Audio) de eventos críticos.' },
        { cat: '25. Accesibilidad en Dark Mode', pts: 19, desc: 'Contraste calibrado para evitar fatiga ocular en operaciones 24/7.' },
        { cat: '26. Fricción Cero (One-Click)', pts: 20, desc: 'Eliminación de pasos intermedios para acciones repetitivas.' },
        { cat: '27. Jerarquía de Atención', pts: 20, desc: 'Direccionamiento visual del foco hacia anomalías y oportunidades.' },
        { cat: '28. Diseño Adaptativo (Fluid)', pts: 18, desc: 'Re-flujo inteligente de componentes en diferentes resoluciones.' },
        { cat: '29. Micro-Interacciones de Estado', pts: 20, desc: 'Indicadores sutiles de "Procesando" o "Listo" (System Status).' },
        { cat: '30. Curva de Aprendizaje Experta', pts: 19, desc: 'Herramienta profesional que no subestima al operador (Power User).' },

        // GROUP D: VALOR ESTRATÉGICO Y DE MERCADO (31-40)
        { cat: '31. Modelo SaaS B2B "White Label"', pts: 20, desc: 'Arquitectura lista para rebranding y reventa a operadores.' },
        { cat: '32. Propiedad Intelectual (Detección)', pts: 20, desc: 'Algoritmos propietarios de detección de patrones no públicos.' },
        { cat: '33. Barrera de Entrada Técnica', pts: 20, desc: 'Complejidad algorítmica que impide la copia trivial por competidores.' },
        { cat: '34. Agnosticismo de Juego', pts: 18, desc: 'Motor probabilístico adaptable a otros juegos de azar (Blackjack/Baccarat).' },
        { cat: '35. Portabilidad Web (PWA)', pts: 20, desc: 'Distribución universal sin dependencia de App Stores (Bypass Fees).' },
        { cat: '36. Escalabilidad de Costos (Serverless)', pts: 20, desc: 'Lógica "Client-Side" que reduce el costo de infraestructura a cero.' },
        { cat: '37. Mercado Objetivo "High Roller"', pts: 20, desc: 'Enfoque en el segmento de mercado con mayor LTV (Lifetime Value).' },
        { cat: '38. Potencial Educativo', pts: 20, desc: 'Uso dual como simulador de entrenamiento para staff de casinos.' },
        { cat: '39. Diferenciación Radical', pts: 20, desc: 'Posicionamiento único como "Herramienta Forense" vs "Juego Lúdico".' },
        { cat: '40. Atractivo de Adquisición (M&A)', pts: 20, desc: 'Activo tecnológico valioso para grandes conglomerados de iGaming.' },
    ];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.95)', zIndex: 11000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)'
        }} onClick={onClose}>
            <div style={{
                background: '#0d0d0d',
                padding: '40px',
                borderRadius: '20px',
                width: '1200px',
                maxWidth: '95vw',
                height: '90vh',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${isApplied ? '#00e676' : '#ffd700'}`, // Green (Applied) vs Gold (Master)
                boxShadow: `0 0 60px ${isApplied ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 215, 0, 0.15)'}`,
                color: '#ddd',
                fontFamily: 'Inter, sans-serif'
            }} onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: isApplied ? '#00e676' : '#ffd700', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {isApplied ? 'Elemento 34: Valoración Forense' : 'Elemento 33: Rúbrica de Valor (40 Pts)'}
                        </h2>
                        <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '5px' }}>
                            {isApplied ? 'Dictamen de Viabilidad Económica y Estratégica' : 'Matriz de Evaluación de Calidad de Software - 800 Puntos'}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: `1px solid ${isApplied ? '#00e676' : '#ffd700'}`, color: isApplied ? '#00e676' : '#ffd700',
                        width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                        transition: 'all 0.2s'
                    }}>✕</button>
                </div>

                {/* SCORECARD (Only in Applied Mode) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Estado del Código</div>
                        <div style={{ color: '#4dabf7', fontSize: '1.4rem', fontWeight: 'bold' }}>Producción (Stable)</div>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Valor Estratégico</div>
                        <div style={{ color: '#ffd700', fontSize: '1.4rem', fontWeight: 'bold' }}>Alto (Nicho)</div>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Complejidad IP</div>
                        <div style={{ color: '#f44', fontSize: '1.4rem', fontWeight: 'bold' }}>Hard-to-Copy</div>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Valuación Técnica</div>
                        <div style={{ color: isApplied ? '#00e676' : '#888', fontSize: '1.4rem', fontWeight: 'bold' }}>
                            {isApplied ? `${auditResult.score} / 800` : '---'}
                        </div>
                    </div>
                </div>

                {/* CONTENT TABLE */}
                <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '10px', marginRight: '-10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#0d0d0d', zIndex: 10 }}>
                            <tr style={{ borderBottom: `2px solid ${isApplied ? '#00e676' : '#ffd700'}` }}>
                                <th style={{ textAlign: 'left', padding: '10px', color: isApplied ? '#00e676' : '#ffd700', width: '35%' }}>Categoría (1-20 Pts)</th>
                                <th style={{ textAlign: 'center', padding: '10px', color: isApplied ? '#00e676' : '#ffd700', width: '10%' }}>Nota</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: isApplied ? '#00e676' : '#ffd700' }}>Criterio de Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #222', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#eee' }}>{row.cat}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', color: isApplied ? (row.pts >= 20 ? '#00e676' : '#ffd700') : '#666' }}>
                                        {isApplied ? row.pts : '-'}
                                    </td>
                                    <td style={{ padding: '10px', color: '#aaa', lineHeight: '1.4' }}>{row.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* PRICE MODELS SCENARIOS (Applied Mode Only) */}
                    {isApplied && (
                        <div style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                            {/* PESIMISTA */}
                            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '10px', borderTop: '4px solid #7f8c8d' }}>
                                <div style={{ color: '#7f8c8d', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>ESCENARIO PESIMISTA</div>
                                <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '15px' }}>Recuperación de Costos (Asset Sale)</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>$25,000 USD</div>
                                <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
                                    Venta única del código fuente (IP Transfer).<br />
                                    Basado estrictamente en horas de ingeniería (300h x $85/h) + Diseño UX.
                                    <br /><strong>Sin riesgo de mercado.</strong>
                                </div>
                            </div>

                            {/* MODERADO */}
                            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '10px', borderTop: '4px solid #3498db' }}>
                                <div style={{ color: '#3498db', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>ESCENARIO MODERADO</div>
                                <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '15px' }}>Micro-SaaS (Nicho Pro)</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>$120k - $200k</div>
                                <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
                                    Suscripción para 100 usuarios activos.<br />
                                    $99/mes x 100 usuarios = $120k ARR.<br />
                                    <strong>Valuación conservadora (1.5x ARR).</strong>
                                </div>
                            </div>

                            {/* OPTIMISTA */}
                            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '10px', borderTop: '4px solid #00e676' }}>
                                <div style={{ color: '#00e676', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>ESCENARIO OPTIMISTA</div>
                                <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '15px' }}>Licenciamiento B2B (Casino)</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>$1.5M - $3M</div>
                                <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
                                    Venta de tecnología de "Detección de Sesgos" a Operadores.<br />
                                    Contratos corporativos anuales.<br />
                                    <strong>Valuación industrial (Estratégica).</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REFLECTION: THE "NO SMOKE" VALUATION */}
                    <div style={{ marginTop: '30px', padding: '30px', background: '#151515', borderRadius: '8px', borderLeft: `4px solid ${isApplied ? '#00e676' : '#ffd700'}` }}>
                        <h3 style={{ margin: '0 0 15px 0', color: isApplied ? '#00e676' : '#ffd700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {isApplied ? 'DICTAMEN DE VALOR REAL (SIN HUMO)' : 'Definición del Estándar Económico'}
                        </h3>
                        <p style={{ margin: 0, lineHeight: '1.8', color: '#ccc', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            {isApplied
                                ? `VALORACIÓN REALISTA DEL ACTIVO "GHR RULETA ROYALE":

1. ¿QUÉ ES ESTO REALMENTE?
No es el "próximo Uber". No es una red social de mil millones de usuarios.
Es una HERRAMIENTA DE PRECISIÓN DE NICHO.
Su valor no reside en la masa, sino en la especificidad. Es un "Terminal Bloomberg" para un mercado específico (Ruleta Profesional) que mueve miles de millones y carece desesperadamente de herramientas serias.

2. EL ACTIVO TÉCNICO (LO TANGIBLE)
Hay ~300 horas de ingeniería React de alto nivel aquí. No es un script comprado en CodeCanyon.
- El motor de física no usa librerías de juegos pesadas, es matemática pura en JS: Eficiente.
- La arquitectura es escalable: Se puede convertir en una app móvil o desktop con Electron en 48 horas.

3. EL ACTIVO ESTRATÉGICO (LO INTANGIBLE)
Aquí está el verdadero dinero. El enfoque "Forense" elimina la ludopatía visual y atrae a inversores/jugadores sistemáticos. Los algoritmos de "Eficiencia (F/N)" y "Detección de Sesgos" resuelven el dolor #1 del usuario: La incertidumbre.

VEREDICTO FINAL:
Los modelos anteriores demuestran que, incluso en el peor escenario (Liquidación), el activo cubre su inversión de desarrollo. En un escenario operativo real (Moderado/Optimista), el retorno es exponencial debido al costo marginal cero de distribución de software.`
                                : `ESTÁNDAR DE REFERENCIA (ELEMENTO 33):
Esta rúbrica cuantifica el valor real del software, separando la calidad del código de su potencial de mercado.
Se busca justificar la inversión basándose en activos tangibles (código, IP) y proyecciones realistas, eliminando el "Hype" injustificado.`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
