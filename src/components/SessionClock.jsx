import React, { useState, useEffect } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';
import { ForensicBadge } from './ForensicBadge';

export const SessionClock = ({ onShowTutorial }) => {
    // Access store directly
    const sessionStart = useFinancialStore(state => state.sessionStart);

    // Local state for display
    const [currentTime, setCurrentTime] = useState(new Date());
    const [duration, setDuration] = useState('00:00:00');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // Calculate duration based on sessionStart
            const start = sessionStart || Date.now(); // Fallback to prevent NaN
            const diff = now.getTime() - start;

            // Format duration
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            const hh = hours.toString().padStart(2, '0');
            const mm = minutes.toString().padStart(2, '0');
            const ss = seconds.toString().padStart(2, '0');
            setDuration(`${hh}:${mm}:${ss}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [sessionStart]);

    // Formatters
    const formatDate = (date) => {
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
            border: '2px solid #d4af37',
            borderTop: '2px solid #fecb00',
            borderBottom: '2px solid #8a6e20',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.2)',
            color: '#e0e0e0',
            fontFamily: 'Roboto Mono, monospace',
            display: 'flex',
            flexWrap: 'wrap', // Allow wrapping
            alignItems: 'center',
            justifyContent: 'center', // Center content
            gap: '10px 20px', // Gap between items
            padding: '10px',
            width: '100%',
            height: '100%',
            overflow: 'hidden', // Prevent spill
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 10,
            boxSizing: 'border-box' // Fix wrapping border issue
        }}>
            {/* TIME */}
            <div style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '2.2rem', lineHeight: '1', whiteSpace: 'nowrap' }}>
                {formatTime(currentTime)}
            </div>

            {/* DATE */}
            <div style={{ fontSize: '1rem', color: '#aaa', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                {formatDate(currentTime)}
            </div>

            {/* SESSION TIMER */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                color: '#888', fontSize: '0.9rem', fontWeight: 'bold',
                padding: '5px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ForensicBadge id="clock" />
                    <button onClick={(e) => { e.stopPropagation(); onShowTutorial(); }}
                        style={{ background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer', padding: 0, fontSize: '1rem' }}
                        title="Manual Forense E14: Reloj de Sesión"
                    >⚖</button>
                </div>
                <span style={{ color: '#fff', fontSize: '1.2rem' }}>{duration}</span>
            </div>
        </div>
    );
};
