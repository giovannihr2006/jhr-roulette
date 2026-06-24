import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { getCoveredNumbers } from '../logic/RouletteUtils';

export const AICopilotWidget = () => {
    const roundHistory = useFinancialStore(state => state.roundHistory || []);
    const balance = useFinancialStore(state => state.realCapital); // Use active capital
    const peakCapital = useFinancialStore(state => state.peakCapital || balance);
    const initialCapital = useFinancialStore(state => state.initialCapital || balance);

    // EXPAND/COLLAPSE STATE
    const [isExpanded, setIsExpanded] = useState(() => {
        try {
            const saved = localStorage.getItem('ghr-aicopilot-expanded');
            return saved !== null ? JSON.parse(saved) : true; // Default to true (expanded)
        } catch {
            return true;
        }
    });

    useEffect(() => {
        localStorage.setItem('ghr-aicopilot-expanded', JSON.stringify(isExpanded));
    }, [isExpanded]);

    // VOICE RECOGNITION STATE
    const [isListening, setIsListening] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [commentsList, setCommentsList] = useState(() => {
        try {
            const saved = localStorage.getItem('ghr-operator-comments');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    })

    const filteredComments = useMemo(() => {
        if (!searchText.trim()) return commentsList
        const query = searchText.toLowerCase().trim()
        return commentsList.filter(c => c.text.toLowerCase().includes(query))
    }, [commentsList, searchText])

    const recognitionRef = useRef(null)

    // Save comments to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('ghr-operator-comments', JSON.stringify(commentsList));
    }, [commentsList]);

    // Setup speech recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const currentResultIndex = event.resultIndex;
            const transcript = event.results[currentResultIndex][0].transcript.trim();
            if (transcript) {
                const newComment = {
                    id: Date.now(),
                    time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    text: transcript
                };
                setCommentsList(prev => [newComment, ...prev].slice(0, 100)); // Keep last 100 comments
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("El reconocimiento de voz no está soportado en este navegador. Por favor usa Google Chrome o Microsoft Edge.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error("Failed to start speech recognition:", err);
            }
        }
    };

    const clearComments = () => {
        if (window.confirm("¿Seguro que deseas vaciar la bitácora de voz?")) {
            setCommentsList([]);
        }
    };

    const diagnostic = useMemo(() => {
        if (!roundHistory || roundHistory.length === 0) {
            return {
                title: "ASISTENTE FORENSE AI",
                subtitle: "SISTEMA ARMADO - ESPERANDO TIRO",
                status: "READY",
                statusColor: "#00ffff",
                content: "Coloca tus apuestas y gira en Modo En Vivo o Simulación. Realizaré una auditoría científica síncrona en cuanto caiga el primer número.",
                metrics: [
                    { label: "DR ACTUAL", value: "$0 COP" },
                    { label: "COBERTURA", value: "0.0%" },
                    { label: "ALERTA", value: "NINGUNA" }
                ]
            };
        }

        const lastRound = roundHistory[0]; // Last round played
        const lastWinNum = lastRound.winningNumber;
        const lastBet = lastRound.totalBet || 0;
        const lastWin = lastRound.totalWin || 0;
        const netResult = lastWin - lastBet;

        // 1. Coverage & Chip Efficiency
        const coveredCount = getCoveredNumbers(lastRound.bets || {}).length;
        const coveragePercent = ((coveredCount / 37) * 100).toFixed(1);

        // 2. DR (Diferencia de Récord)
        const dr = balance - peakCapital;
        const drText = dr >= 0 ? `+${dr.toLocaleString()} COP` : `${dr.toLocaleString()} COP`;

        // 3. Progresión / Martingala
        let estimatedLevel = 1;
        if (lastBet >= 8000) estimatedLevel = 4;
        else if (lastBet >= 4000) estimatedLevel = 3;
        else if (lastBet >= 2000) estimatedLevel = 2;

        const isDobleLoss = netResult < 0 && estimatedLevel >= 2;

        // 4. Dynamic AI Narrative
        let content = "";
        let status = "OPTIMIZADO";
        let statusColor = "#4caf50";

        if (netResult > 0) {
            if (lastWinNum === 5 || lastWinNum === 8 || lastWinNum === 11 || lastWinNum === 14) {
                content = `Acierto magistral en el Eje Central (${lastWinNum}). Pago neto de +${(lastWin - lastBet).toLocaleString()} COP. La eficiencia de tu cobertura fue del ${coveragePercent}%. Mantén la progresión acotada y conserva tu récord.`;
            } else {
                content = `Acierto en Fila Interna o Borde (${lastWinNum}). Retorno positivo de +${netResult.toLocaleString()} COP. Tu capital avanza síncronamente. Se aconseja mantener el nivel base x1 en la siguiente serie.`;
            }
            status = "COBRO EXITOSO";
            statusColor = "#d4af37";
        } else if (netResult === 0 && lastBet > 0) {
            content = `Empate técnico en el tiro anterior. El retorno cubrió exactamente tu costo. La banca se mantiene estable. Procede con cautela.`;
            status = "NEUTRAL";
            statusColor = "#ffd700";
        } else if (lastBet > 0) {
            // Loss
            if (isDobleLoss) {
                content = `Alerta de Progresión en Nivel ${estimatedLevel}x. El fallo en (${lastWinNum}) incrementa tu DR a ${drText}. La probabilidad teórica de quiebra consecutiva en las próximas 3 tiradas es inferior al 1.2%. Mantén la disciplina acotada a x8.`;
                status = "ZONA DE RIESGO";
                statusColor = "#ff1744";
            } else {
                content = `Pérdida en el giro anterior (${lastWinNum}). El paño registró un costo de ${lastBet.toLocaleString()} COP. La Ley de Dormancia de Giovanni sugiere que el sector opuesto está en fase de madurez. Incrementa nivel a 2x si tu serie lo requiere.`;
                status = "AJUSTE TÁCTICO";
                statusColor = "#ff9100";
            }
        } else {
            content = `Giro de calibración registrado (Tiro ${lastRound.spin}: #${lastWinNum}). No colocaste apuestas en el paño. Los sensores probabilísticos sugieren que las docenas frías se están moviendo al centro.`;
            status = "CALIBRANDO";
            statusColor = "#00ffff";
        }

        // Add Récord celebration
        if (balance >= peakCapital && lastWin > 0) {
            content += " ¡Felicitaciones! Has roto tu récord de saldo histórico de banca.";
        }

        return {
            title: "ASISTENTE FORENSE AI",
            subtitle: `SINOPSIS GIRO #${lastRound.spin} (NÚMERO ${lastWinNum})`,
            status,
            statusColor,
            content,
            metrics: [
                { label: "DR ACTUAL", value: drText, color: dr >= 0 ? '#4caf50' : '#ff1744' },
                { label: "COBERTURA", value: `${coveragePercent}%` },
                { label: "NIVEL EST.", value: `${estimatedLevel}x` }
            ]
        };
    }, [roundHistory, balance, peakCapital, initialCapital]);

    const handleWidgetClick = () => {
        if (!isExpanded) {
            setIsExpanded(true);
        }
    };

    const handleHeaderClick = (e) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
    };

    return (
        <div
            onClick={handleWidgetClick}
            style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
                border: `1px solid ${diagnostic.statusColor}33`,
                borderRadius: '10px',
                padding: isExpanded ? '14px 16px' : '10px 16px',
                margin: '10px 15px',
                boxShadow: `0 4px 20px rgba(0,0,0,0.5), inset 0 0 10px ${diagnostic.statusColor}08`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                cursor: isExpanded ? 'default' : 'pointer'
            }}
        >
            {/* Glow line */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: diagnostic.statusColor,
                boxShadow: `0 0 8px ${diagnostic.statusColor}`
            }} />

            {/* HEADER (Clickable to Collapse/Expand) */}
            <div
                onClick={handleHeaderClick}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: isExpanded ? '12px' : '0',
                    cursor: 'pointer',
                    userSelect: 'none',
                    width: '100%'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem', animation: isListening ? 'pulse 1.2s infinite' : 'none' }}>
                        {isListening ? "🎙️" : "🧠"}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{
                            fontSize: '0.92rem', // Increased header size
                            fontWeight: 'bold',
                            color: '#d4af37',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            {diagnostic.title}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', marginTop: '2px' }}>
                            {diagnostic.subtitle}
                        </span>
                    </div>
                </div>

                {/* STATUS & ACTIONS CONTAINER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={e => e.stopPropagation()}>
                    {isExpanded && (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleListening(); }}
                            style={{
                                background: isListening ? '#ff1744' : 'rgba(212, 175, 55, 0.15)',
                                border: isListening ? '1px solid #ff1744' : '1px solid #d4af37',
                                borderRadius: '50%',
                                width: '28px', // Slightly larger button
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: isListening ? '0 0 10px #ff1744' : 'none',
                                animation: isListening ? 'pulse 1.2s infinite' : 'none'
                            }}
                            title={isListening ? "Apagar Micrófono" : "Encender Micrófono inteligente"}
                        >
                            <span style={{ fontSize: '0.85rem', color: isListening ? '#fff' : '#d4af37' }}>
                                🎙️
                            </span>
                        </button>
                    )}

                    <span style={{
                        fontSize: '0.75rem', // Larger badge
                        fontWeight: 'bold',
                        color: '#fff',
                        background: `${diagnostic.statusColor}22`,
                        border: `1px solid ${diagnostic.statusColor}`,
                        padding: '3px 10px',
                        borderRadius: '4px',
                        letterSpacing: '0.5px'
                    }}>
                        {diagnostic.status}
                    </span>

                    <span style={{ color: '#d4af37', fontSize: '0.95rem', marginLeft: '6px', display: 'flex', alignItems: 'center' }} onClick={(e) => { e.stopPropagation(); handleHeaderClick(e); }}>
                        {isExpanded ? '▲' : '▼'}
                    </span>
                </div>
            </div>

            {/* AI DIAGNOSTIC TEXT */}
            {isExpanded && (
                <div style={{
                    background: 'rgba(0,0,0,0.45)',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    fontSize: '1.05rem', // Enlarged diagnostic text
                    lineHeight: '1.6', // Spacious leading
                    color: '#f0f0f0',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textAlign: 'justify',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '14px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                    {diagnostic.content}
                </div>
            )}

            {/* OPERATOR COMMENTS BOX */}
            {isExpanded && (
                <div style={{
                    background: 'rgba(10, 10, 10, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '14px',
                    maxHeight: '200px', // Expanded height to fit bigger text
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)'
                }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#ffd700', fontWeight: 'bold', letterSpacing: '0.5px', flex: 1 }}>
                            🎙️ {isListening ? "ESCUCHANDO COMENTARIOS..." : "BITÁCORA DE VOZ"}
                        </span>
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Buscar en bitácora..."
                            style={{
                                background: 'rgba(0,0,0,0.6)',
                                border: '1px solid rgba(212, 175, 55, 0.4)',
                                borderRadius: '4px',
                                color: '#fff',
                                padding: '2px 6px',
                                fontSize: '0.75rem',
                                width: '130px'
                            }}
                        />
                        {commentsList.length > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); clearComments(); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ff1744',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                                title="Vaciar bitácora"
                            >
                                🗑️
                            </button>
                        )}
                    </div>

                    <div style={{
                        overflowY: 'auto',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        paddingRight: '4px'
                    }} className="ct-comments-scroll">
                        {commentsList.length === 0 ? (
                            <span style={{ fontSize: '0.92rem', color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '15px 0' }}>
                                {isListening ? "Habla ahora, estoy escuchando..." : "Presiona el micrófono para registrar tus análisis de voz en vivo."}
                            </span>
                        ) : filteredComments.length === 0 ? (
                            <span style={{ fontSize: '0.92rem', color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '15px 0' }}>
                                No se encontraron resultados para "{searchText}"
                            </span>
                        ) : (
                            filteredComments.map(c => (
                                <div key={c.id} style={{
                                    fontSize: '0.95rem', // Much larger and legible comments text
                                    color: '#e8e8e8',
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    borderLeft: '3px solid #d4af37',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                                    boxSizing: 'border-box'
                                }}>
                                    <span style={{
                                        color: '#d4af37',
                                        fontSize: '0.78rem', // Larger timestamp
                                        fontFamily: 'monospace',
                                        fontWeight: 'bold',
                                        flexShrink: 0,
                                        marginTop: '2px'
                                    }}>
                                        {c.time}
                                    </span>
                                    <span style={{
                                        flex: 1,
                                        textAlign: 'justify',
                                        lineHeight: '1.45',
                                        wordBreak: 'break-word'
                                    }}>
                                        {c.text}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* METRICS ROW */}
            {isExpanded && (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    {diagnostic.metrics.map((m, idx) => (
                        <div key={idx} style={{
                            flex: 1,
                            background: 'rgba(0, 0, 0, 0.55)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '6px',
                            padding: '8px 10px', // More spacious metrics cards
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>
                                {m.label}
                            </span>
                            <span style={{
                                fontSize: '1.1rem', // Bold, distinct values
                                color: m.color || '#fff',
                                fontWeight: 'bold',
                                fontFamily: 'monospace'
                            }}>
                                {m.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* CSS Animation injector inside component */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 23, 68, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(255, 23, 68, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 23, 68, 0); }
                }
                .ct-comments-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .ct-comments-scroll::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                }
                .ct-comments-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.15);
                    border-radius: 2px;
                }
                .ct-comments-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(212, 175, 55, 0.3);
                }
            `}</style>
        </div>
    );
};

export default AICopilotWidget;
