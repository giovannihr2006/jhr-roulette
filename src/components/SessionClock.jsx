import React, { useState, useEffect } from 'react';
import { useFinancialStore } from '../logic/FinancialSimulator';

export const SessionClock = () => {
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
            display: 'flex', flexDirection: 'column',
            padding: '15px 20px',
            minWidth: '220px',
            textAlign: 'right',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '2.2rem', marginBottom: '5px', lineHeight: '1' }}>
                {formatTime(currentTime)}
            </div>
            <div style={{ fontSize: '1rem', color: '#aaa', textTransform: 'capitalize', marginBottom: '10px' }}>
                {formatDate(currentTime)}
            </div>

            <div style={{ borderTop: '1px solid #444', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <span>SESIÓN:</span>
                <span style={{ color: '#fff', fontSize: '1.2rem' }}>{duration}</span>
            </div>
        </div>
    );
};
