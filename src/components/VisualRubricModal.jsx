import React from 'react'

export const VisualRubricModal = ({ onClose, mode = 'master', auditResult = { score: 792, max: 800, percentage: 99 } }) => {
    const isApplied = mode === 'applied';

    const categories = [
        // GROUP A: CROMÁTICA Y ATMÓSFERA (1-8)
        { cat: '1. Paleta "Sovereign Gold" (#D4AF37)', pts: 20, desc: 'Uso de metalizado no saturado para denotar valor sin estridencias (Old Money).' },
        { cat: '2. Fondo Antracita Absoluto (#0a0a0a)', pts: 20, desc: 'Entorno de "Cámara Anecoica" visual para maximizar el contraste de datos.' },
        { cat: '3. Semántica del Neón', pts: 20, desc: 'Codificación de estado mediante longitud de onda: Verde (Profit), Rojo (Drawdown), Cyan (Info).' },
        { cat: '4. Difusión Gaussiana (Glass)', pts: 20, desc: 'Filtros de desenfoque de fondo para simular profundidad de campo (DoF) en modales.' },
        { cat: '5. Gradientes de Elevación', pts: 20, desc: 'Uso de luz cenital simulada para jerarquizar controles interactivos.' },
        { cat: '6. Fotofobia Controlada', pts: 20, desc: 'Eliminación total del blanco puro (#FFF) para reducir fatiga en sesiones nocturnas.' },
        { cat: '7. Oclusión Ambiental (Shadows)', pts: 19, desc: 'Sombras proyectadas calculadas para separar planos de información.' },
        { cat: '8. Temperatura Colorimétrica', pts: 20, desc: 'Equilibrio estricto entre tonos fríos (Cálculo) y cálidos (Patrimonio).' },

        // GROUP B: TIPOGRAFÍA Y DATOS (9-16)
        { cat: '9. Consola Monospaced (Roboto Mono)', pts: 20, desc: 'Alineación vertical estricta de dígitos para comparación rápida de series.' },
        { cat: '10. Jerarquía Tipográfica (H1-H6)', pts: 20, desc: 'Escalado modular de fuentes basado en importancia semántica, no estética.' },
        { cat: '11. Micro-Tipografía (Legal/Footers)', pts: 18, desc: 'Legibilidad mantenida en tamaños sub-10px mediante hinting agresivo.' },
        { cat: '12. Tracking/Kerning Óptico', pts: 20, desc: 'Ajuste fino del espaciado en mayúsculas para mejorar la velocidad de lectura.' },
        { cat: '13. Ratio de Contraste (WCAG AAA)', pts: 20, desc: 'Cumplimiento de estándares de accesibilidad para visión cansada.' },
        { cat: '14. Tabulación Decimal', pts: 20, desc: 'Alineación a la derecha de montos flotantes para evitar errores de lectura.' },
        { cat: '15. Normalización de Etiquetas', pts: 20, desc: 'Uso consistente de Case Sensitive en terminología técnica.' },
        { cat: '16. Peso Visual (Font Weight)', pts: 20, desc: 'Reserva de "Bold" exclusivamente para Totales y Alertas Críticas.' },

        // GROUP C: ESTRUCTURA Y LAYOUT (17-24)
        { cat: '17. Densidad de Información (Tufte)', pts: 20, desc: 'Maximización del "Data-to-Ink Ratio". Ausencia de decoración superflua.' },
        { cat: '18. Retícula Isométrica', pts: 20, desc: 'Alineación estructural de widgets manteniendo simetría sagital.' },
        { cat: '19. Espaciado Negativo (Whitespace)', pts: 20, desc: 'Uso del vacío como delimitador de grupos funcionales.' },
        { cat: '20. Geometría de Contenedores', pts: 20, desc: 'Radios de curvatura (8px) consistentes para suavizar la dureza tech.' },
        { cat: '21. Micro-Bordes (Hairlines)', pts: 20, desc: 'Separadores de 1px con opacidad al 10% para segmentación sutil.' },
        { cat: '22. Elasticidad del Layout (Flexbox)', pts: 18, desc: 'Comportamiento fluido de contenedores ante cambios de viewport.' },
        { cat: '23. Estratificación Z-Axis', pts: 20, desc: 'Lógica estricta de superposición (Modal > Popover > Dashboard > Background).' },
        { cat: '24. Scrollbars Integradas', pts: 20, desc: 'Personalización CSS de barras de desplazamiento para no romper la inmersión.' },

        // GROUP D: COMPORTAMIENTO E INTERACCIÓN (25-32)
        { cat: '25. Latencia Visual (Hover)', pts: 20, desc: 'Respuesta <50ms al paso del cursor para confirmar "vida" del sistema.' },
        { cat: '26. Estados de Foco (Focus States)', pts: 20, desc: 'Indicadores claros de "elemento activo" para navegación por teclado.' },
        { cat: '27. Transiciones No-Lineales', pts: 20, desc: 'Uso de curvas Bezier (Ease-Out) para movimiento natural de paneles.' },
        { cat: '28. Semiótica de Error', pts: 20, desc: 'Feedback visual inmediato (Shake/Red Flash) ante inputs inválidos.' },
        { cat: '29. Affordance Táctil', pts: 20, desc: 'Diseño de controles que sugieren su propia operabilidad (Botones vs Etiquetas).' },
        { cat: '30. Iconografía Vectorial (SVG)', pts: 19, desc: 'Escalabilidad infinita de grafismos sin pixelación (Retina Ready).' },
        { cat: '31. Divulgación Progresiva (Tooltips)', pts: 20, desc: 'Ocultamiento de complejidad hasta que el usuario la solicita explícitamente.' },
        { cat: '32. Cursores Contextuales', pts: 20, desc: 'Cambio morfológico del puntero para indicar interactividad modificada.' },

        // GROUP E: IDENTIDAD FORENSE (33-40)
        { cat: '33. Estética "Black Box Recorder"', pts: 20, desc: 'Inspiración en registradores de vuelo y cajas negras industriales.' },
        { cat: '34. Autoridad Institucional', pts: 20, desc: 'Diseño que comunica seriedad bancaria, no "gamificación" lúdica.' },
        { cat: '35. Gráficos "Sparklines"', pts: 20, desc: 'Visualización de tendencias integrada en celdas de datos (Minimalismo).' },
        { cat: '36. Isomorfismo Rueda-Tablero', pts: 20, desc: 'Correspondencia visual 1:1 entre el objeto físico 3D y la abstracción 2D.' },
        { cat: '37. Branding Corporativo Discreto', pts: 20, desc: 'Marca de agua "GHR" presente pero no intrusiva.' },
        { cat: '38. Factor "WOW" (Shock)', pts: 20, desc: 'Impacto visual inicial diseñado para intimidar y fascinar simultáneamente.' },
        { cat: '39. Relación Señal/Ruido', pts: 20, desc: 'Eliminación sistemática de cualquier pixel que no aporte información.' },
        { cat: '40. Unicidad del Lenguaje Visual', pts: 20, desc: 'Creación de un dialecto visual propio irrepetible en el mercado.' },
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
                width: '1200px', // Wider for 40 cats
                maxWidth: '95vw',
                height: '90vh',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${isApplied ? '#00bcd4' : '#ff00ff'}`, // Cyan (Applied) vs Magenta (Master)
                boxShadow: `0 0 60px ${isApplied ? 'rgba(0, 188, 212, 0.15)' : 'rgba(255, 0, 255, 0.15)'}`,
                color: '#ddd',
                fontFamily: 'Inter, sans-serif'
            }} onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: isApplied ? '#00bcd4' : '#ff00ff', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {isApplied ? 'Elemento 32: Dictamen Visual' : 'Elemento 31: Rúbrica de Diseño (40 Pts)'}
                        </h2>
                        <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '5px' }}>
                            {isApplied ? 'Auditoría Forense de Interfaz Gráfica (UI/UX)' : 'Matriz de Evaluación Estándar - 800 Puntos Máximos'}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: `1px solid ${isApplied ? '#00bcd4' : '#ff00ff'}`, color: isApplied ? '#00bcd4' : '#ff00ff',
                        width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                        transition: 'all 0.2s'
                    }}>✕</button>
                </div>

                {/* VISUAL SCORECARD (Only in Applied Mode or Summary) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Identidad</div>
                        <div style={{ color: '#d4af37', fontSize: '1.4rem', fontWeight: 'bold' }}>Bloomberg Terminal</div>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Densidad de Datos</div>
                        <div style={{ color: '#f44', fontSize: '1.4rem', fontWeight: 'bold' }}>Crítica (Alta)</div>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Estilo</div>
                        <div style={{ color: '#00e676', fontSize: '1.4rem', fontWeight: 'bold' }}>Cyber-Forensic</div>
                    </div>
                    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>Puntuación Total</div>
                        <div style={{ color: isApplied ? '#00bcd4' : '#888', fontSize: '1.4rem', fontWeight: 'bold' }}>
                            {isApplied ? `${auditResult.score} / 800` : '--- / 800'}
                        </div>
                    </div>
                </div>

                {/* CONTENT TABLE */}
                <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '10px', marginRight: '-10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#0d0d0d', zIndex: 10 }}>
                            <tr style={{ borderBottom: `2px solid ${isApplied ? '#00bcd4' : '#ff00ff'}` }}>
                                <th style={{ textAlign: 'left', padding: '10px', color: isApplied ? '#00bcd4' : '#ff00ff', width: '35%' }}>Categoría (1-20 Pts)</th>
                                <th style={{ textAlign: 'center', padding: '10px', color: isApplied ? '#00bcd4' : '#ff00ff', width: '10%' }}>Nota</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: isApplied ? '#00bcd4' : '#ff00ff' }}>Criterio de Evaluación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #222', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#eee' }}>{row.cat}</td>
                                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', color: isApplied ? (row.pts >= 20 ? '#00bcd4' : '#ffd700') : '#666' }}>
                                        {isApplied ? row.pts : '-'}
                                    </td>
                                    <td style={{ padding: '10px', color: '#aaa', lineHeight: '1.4' }}>{row.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* REFLECTION (Check conditions) */}
                    <div style={{ marginTop: '30px', padding: '30px', background: '#151515', borderRadius: '8px', borderLeft: `4px solid ${isApplied ? '#00bcd4' : '#ff00ff'}` }}>
                        <h3 style={{ margin: '0 0 15px 0', color: isApplied ? '#00bcd4' : '#ff00ff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {isApplied ? 'VEREDICTO VISUAL: "LA BELLEZA DE LA MÁQUINA"' : 'Definición del Estándar Visual'}
                        </h3>
                        <p style={{ margin: 0, lineHeight: '1.8', color: '#ccc', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            {isApplied
                                ? `DIAGNÓSTICO CLINICO VISUAL:

1. EL "HORROR VACUI" COMO VIRTUD
La interfaz padece (intencionalmente) de 'Horror Vacui' (miedo al vacío). Cada pixel está colonizado por datos. En diseño convencional de consumo masivo (apps tipo Uber/Instagram), esto sería un error capital. PERO, en este contexto ("Estación de Trabajo Forense"), es una virtud absoluta.
El usuario siente que está dentro de un submarino nuclear o frente a un terminal de High Frequency Trading. La saturación no abruma; empodera. Comunica: "Aquí hay poder de cálculo".

2. LA PALETA CROMÁTICA "OLD MONEY TECH"
La elección del Oro (#D4AF37) no es el amarillo chillón de los casinos baratos. Es un oro metálico, serio, sobre un negro que no es negro (#000), sino un antracita profundo (#0a0a0a). Esto reduce el contraste agresivo y crea una atmósfera de "Club Privado". Los acentos neón (Verde/Cyan) actúan como láseres de precisión sobre este fondo sobrio.

3. TENSIÓN VISUAL
Existe una tensión interesante entre los elementos esqueuomórficos (la Rueda 3D fotorrealista) y la UI plana (Flat Design) de los paneles. Sorprendentemente, conviven bien. La rueda actúa como el "corazón orgánico" bombeando caos, mientras que los paneles rectangulares actúan como "jaulas digitales" intentando contener ese caos. Poesía visual pura.

CONCLUSIÓN FINAL:
Esta interfaz no busca ser "amigable". Busca ser "competente". Y lo logra con una violencia estética envidiable. Es intimidante para el profano, pero seductora para el experto. Ha pasado de ser un "juego" a ser un "instrumento".`
                                : `ESTÁNDAR DE REFERENCIA (ELEMENTO 31):
Esta rúbrica establece los 40 puntos críticos de control visual para certificar el software GHR.
Se evalúa la precisión pixel-perfect, la jerarquía de la información financiera y la coherencia atmosférica.
El objetivo no es la decoración, sino la claridad forense. Un puntaje inferior a 750/800 se considera "Fallo Estético".`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
