import React, { useState, useEffect } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { ForensicBadge } from './ForensicBadge';

export const TimeManagementWidget = ({
    isActive,
    timerMode,
    duration,
    timeLeft,
    onToggle,
    onChangeDuration,
    onShowJustificationE24,
    totalSpins,
    totalIdleTime,
    lastActionTime
}) => {
    // 1. SESSION CLOCK LOGIC
    const sessionStart = useFinancialStore(state => state.sessionStart);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sessionDuration, setSessionDuration] = useState('00:00:00');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            const start = sessionStart || Date.now();
            const diff = now.getTime() - start;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setSessionDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(timer);
    }, [sessionStart]);

    // 2. TIME BAR LOGIC (Duration Edit)
    const [localDuration, setLocalDuration] = useState(duration);
    useEffect(() => { setLocalDuration(duration); }, [duration]);

    const handleDurationBlur = () => {
        let val = Math.max(1, Math.min(60, parseInt(localDuration, 10) || 1));
        onChangeDuration(val);
        setLocalDuration(val);
    };

    const percentage = timerMode ? (timeLeft / duration) * 100 : 100;

    // Derived values for the telemetry grid
    const elapsedMs = sessionStart ? (currentTime.getTime() - sessionStart) : 0;
    const lastAction = lastActionTime || sessionStart || Date.now();
    const currentIdleGap = currentTime.getTime() - lastAction;
    const inactivityThreshold = 60000; // 60 seconds threshold for inactivity
    const currentUnrecordedIdle = currentIdleGap > inactivityThreshold ? (currentIdleGap - inactivityThreshold) : 0;
    const displayIdleTime = totalIdleTime + currentUnrecordedIdle;
    const activeMs = Math.max(0, elapsedMs - displayIdleTime);
    const efficiency = elapsedMs > 0 ? (activeMs / elapsedMs) * 100 : 100;

    const formatMs = (ms) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="panel-tray-dark" style={{
            minWidth: '350px',
            width: '100%',
            height: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* HEADER */}
            <div className="panel-tray-header">
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ForensicBadge id="timeManagement" />
                    <span style={{ color: '#fff' }}>GESTIÓN DE TIEMPO</span>
                </span>
                <button onClick={(e) => { e.stopPropagation(); onShowJustificationE24(); }}
                    className="ct-control-btn"
                    style={{
                        background: 'transparent', border: '1px solid #2196f3', color: '#2196f3',
                        width: '24px', height: '24px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', cursor: 'pointer', marginLeft: 'auto',
                        boxShadow: '0 0 5px rgba(33, 150, 243, 0.3)'
                    }}
                    title="Manual Táctico E24: Gestión del Tiempo"
                >⚖</button>
            </div>

            {/* BODY - AUTO-ADJUSTABLE BOX */}
            <div className="panel-tray-content" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '12px'
            }}>

                {/* ROW 1: CLOCK & SESSION */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{
                            color: '#d4af37',
                            fontSize: '2.8rem',
                            fontWeight: '900',
                            fontFamily: 'Roboto Mono',
                            textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                            lineHeight: '1'
                        }}>
                            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '4px' }}>
                            {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ForensicBadge id="clock" style={{ minWidth: '22px', height: '20px', fontSize: '10px', borderRadius: '10px' }} />
                            <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>SESIÓN</span>
                        </div>

                    </div>
                    <span style={{
                        color: '#fff',
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        fontFamily: 'Roboto Mono',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '4px 10px',
                        borderRadius: '4px'
                    }}>{sessionDuration}</span>
                </div>

                {/* TELEMETRÍA DE SESIÓN GRID */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginTop: '5px',
                    borderTop: '1px solid rgba(212, 175, 55, 0.2)',
                    paddingTop: '12px'
                }}>
                    {/* TIEMPO ACTIVO (SMART) */}
                    <div style={{
                        background: 'rgba(76, 175, 80, 0.05)',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <span style={{ fontSize: '0.65rem', color: '#4caf50', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⏱️ Tiempo Activo</span>
                        <span style={{ fontSize: '1.2rem', color: '#fff', fontFamily: 'Roboto Mono, monospace', fontWeight: 'bold', marginTop: '2px' }}>
                            {formatMs(activeMs)}
                        </span>
                    </div>

                    {/* TIEMPO INACTIVO (IDLE) */}
                    <div style={{
                        background: 'rgba(255, 152, 0, 0.05)',
                        border: '1px solid rgba(255, 152, 0, 0.2)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <span style={{ fontSize: '0.65rem', color: '#ff9800', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💤 Tiempo Muerto</span>
                        <span style={{ fontSize: '1.2rem', color: '#fff', fontFamily: 'Roboto Mono, monospace', fontWeight: 'bold', marginTop: '2px' }}>
                            {formatMs(displayIdleTime)}
                        </span>
                    </div>

                    {/* EFICIENCIA OPERATIVA */}
                    <div style={{
                        background: 'rgba(33, 150, 243, 0.05)',
                        border: '1px solid rgba(33, 150, 243, 0.2)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <span style={{ fontSize: '0.65rem', color: '#2196f3', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📈 Eficiencia</span>
                        <span style={{ fontSize: '1.2rem', color: efficiency >= 75 ? '#4f4' : '#ffb938', fontFamily: 'Roboto Mono, monospace', fontWeight: 'bold', marginTop: '2px' }}>
                            {efficiency.toFixed(1)}%
                        </span>
                    </div>

                    {/* TOTAL DE JUGADAS (SPINS) */}
                    <div style={{
                        background: 'rgba(212, 175, 55, 0.05)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <span style={{ fontSize: '0.65rem', color: '#d4af37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏆 Total Jugadas</span>
                        <span style={{ fontSize: '1.2rem', color: '#fff', fontFamily: 'Roboto Mono, monospace', fontWeight: 'bold', marginTop: '2px' }}>
                            {totalSpins} spins
                        </span>
                    </div>
                </div>

            </div>

            {/* ROW 2: COUNTDOWN BAR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* TOGGLE */}
                <div onClick={onToggle} style={{ cursor: 'pointer', minWidth: '85px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '40px', height: '20px', background: timerMode ? '#2e7d32' : '#333',
                        borderRadius: '12px', position: 'relative', transition: '0.3s'
                    }}>
                        <div style={{
                            width: '16px', height: '16px', background: '#fff', borderRadius: '50%',
                            position: 'absolute', top: '2px', left: timerMode ? '22px' : '2px', transition: '0.3s'
                        }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: timerMode ? '#4caf50' : '#888' }}>
                        {timerMode ? "AUTO" : "OFF"}
                    </span>
                </div>

                {/* BAR */}
                <div style={{ flex: 1, height: '12px', background: '#1a1a1a', borderRadius: '6px', border: '1px solid #333', overflow: 'hidden' }}>
                    <div style={{
                        width: `${percentage}%`, height: '100%',
                        background: timerMode ? (timeLeft <= 3 ? '#ff4444' : '#2196f3') : '#444',
                        transition: timerMode ? 'width 1s linear, background 0.3s' : '0.3s',
                        boxShadow: timerMode ? '0 0 10px rgba(33, 150, 243, 0.4)' : 'none'
                    }} />
                </div>

                {/* INPUT / COUNTDOWN */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="number" value={localDuration}
                        onChange={(e) => setLocalDuration(e.target.value)}
                        onBlur={handleDurationBlur}
                        style={{
                            background: '#111', border: '1px solid #444', color: '#fff', width: '50px',
                            textAlign: 'center', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold',
                            padding: '2px 0'
                        }}
                    />
                    {timerMode && (
                        <span style={{
                            color: timeLeft <= 3 ? '#ff4444' : '#fff',
                            fontWeight: '900', fontSize: '2.2rem', minWidth: '55px', textAlign: 'right',
                            fontFamily: 'Roboto Mono',
                            textShadow: timeLeft <= 3 ? '0 0 10px rgba(255, 68, 68, 0.5)' : 'none'
                        }}>
                            {timeLeft}s
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
