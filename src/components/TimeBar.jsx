import React, { useState, useEffect } from 'react';

export const TimeBar = ({
    isActive,
    timerMode,
    duration,
    timeLeft,
    onToggle,
    onChangeDuration
}) => {
    // Local state for editing duration to avoid jitter
    const [localDuration, setLocalDuration] = useState(duration);

    useEffect(() => {
        setLocalDuration(duration);
    }, [duration]);

    const handleDurationChange = (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 0;
        if (val > 60) val = 60;
        setLocalDuration(val);
    };

    const handleDurationBlur = () => {
        let val = localDuration;
        if (val < 1) val = 1; // Minimum 1 second
        onChangeDuration(val);
        setLocalDuration(val);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Triggers handleDurationBlur
        }
    };

    // Calculate percentage for bar width
    const percentage = timerMode ? (timeLeft / duration) * 100 : 100;

    return (
        <div className="time-bar-container" style={{
            width: '100%',
            maxWidth: '500px', // Reduced to fit controls container
            background: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '10px 15px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginTop: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            pointerEvents: 'auto' // Ensure clicks work inside draggable area
        }}>

            {/* 1. TOGGLE SWITCH */}
            <div
                onClick={onToggle}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    minWidth: '100px'
                }}
                title={timerMode ? "Desactivar Temporizador" : "Activar Temporizador"}
            >
                <div style={{
                    width: '40px',
                    height: '20px',
                    background: timerMode ? '#4caf50' : '#444',
                    borderRadius: '20px',
                    position: 'relative',
                    transition: 'background 0.3s'
                }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        background: '#fff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: timerMode ? '22px' : '2px',
                        transition: 'left 0.3s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
                    }} />
                </div>
                <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: timerMode ? '#fff' : '#888',
                    textTransform: 'uppercase'
                }}>
                    {timerMode ? "AUTO" : "MANUAL"}
                </span>
            </div>

            {/* 2. PROGRESS BAR AREA */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                {/* Bar Background */}
                <div style={{
                    width: '100%',
                    height: '12px',
                    background: '#222',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid #444'
                }}>
                    {/* Fill */}
                    <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: timerMode
                            ? (timeLeft <= 3 ? '#ff4444' : '#2196f3') // Red alert at 3s
                            : '#555', // Grey in manual mode
                        borderRadius: '6px',
                        transition: timerMode ? 'width 1s linear, background 0.3s' : 'width 0.3s ease',
                        boxShadow: timerMode ? '0 0 10px rgba(33, 150, 243, 0.4)' : 'none'
                    }} />
                </div>
            </div>

            {/* 3. TIME INPUT / DISPLAY */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
            }}>
                <input
                    type="number"
                    value={localDuration}
                    onChange={handleDurationChange}
                    onBlur={handleDurationBlur}
                    onKeyDown={handleKeyDown}
                    style={{
                        background: '#222',
                        border: '1px solid #444',
                        color: timerMode ? '#fff' : '#666',
                        width: '70px',
                        padding: '5px',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        mozAppearance: 'textfield'
                    }}
                />
                <span style={{ color: '#666', fontSize: '0.8rem' }}>SEG</span>
            </div>

            {/* 4. COUNTDOWN DISPLAY (BIG NUMBER) */}
            {timerMode && (
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: timeLeft <= 3 ? '#ff4444' : '#fff',
                    minWidth: '40px',
                    textAlign: 'right',
                    fontFamily: 'Roboto Mono, monospace'
                }}>
                    {timeLeft}s
                </div>
            )}

        </div>
    );
};
