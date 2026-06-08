import React, { useState, useEffect } from 'react';

const LayoutGridOverlay = ({ visible, opacity = 0.5 }) => {
    if (!visible) return null;

    // Grid configuration
    const MAJOR_GRID = 100;
    const MINOR_GRID = 50;
    const TERTIARY_GRID = 10;

    // Ruler configuration
    const RULER_SIZE = 30; // Size of the ruler headers

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '5000px',
            height: '5000px',
            zIndex: 9999,
            pointerEvents: 'none', // Allow clicks to pass through grid
            overflow: 'hidden'
        }}>
            {/* --- GRID LINES --- */}
            <div style={{
                position: 'absolute',
                top: RULER_SIZE,
                left: RULER_SIZE,
                right: 0,
                bottom: 0,
                opacity: opacity,
                // Combine gradients for Major, Minor, and Tertiary lines
                backgroundImage: `
                    linear-gradient(to right, rgba(0, 255, 255, 0.8) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 255, 255, 0.8) 1px, transparent 1px),
                    linear-gradient(to right, rgba(0, 255, 255, 0.3) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0, 255, 255, 0.3) 1px, transparent 1px),
                    linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: `
                    ${MAJOR_GRID}px ${MAJOR_GRID}px,
                    ${MAJOR_GRID}px ${MAJOR_GRID}px,
                    ${MINOR_GRID}px ${MINOR_GRID}px,
                    ${MINOR_GRID}px ${MINOR_GRID}px,
                    ${TERTIARY_GRID}px ${TERTIARY_GRID}px,
                    ${TERTIARY_GRID}px ${TERTIARY_GRID}px
                `
            }} />

            {/* --- HEADERS (RULERS) --- */}

            {/* Top X-Axis Ruler */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: RULER_SIZE, // Starts after Corner
                right: 0,
                height: RULER_SIZE,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderBottom: '1px solid cyan',
                display: 'flex',
                overflow: 'hidden',
                pointerEvents: 'auto', // Blocking
                userSelect: 'none',
                zIndex: 9998 // Below Corner
            }}>
                {Array.from({ length: 51 }).map((_, i) => {
                    const value = i * 100;
                    return (
                        <div key={`x-${value}`} style={{
                            position: 'absolute',
                            left: value,
                            width: 100,
                            height: '100%',
                            borderLeft: '1px solid rgba(0, 255, 255, 0.5)',
                            color: 'cyan',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            paddingLeft: '4px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {i}
                        </div>
                    );
                })}
            </div>

            {/* Left Y-Axis Ruler */}
            <div style={{
                position: 'absolute',
                top: RULER_SIZE, // Starts after Corner
                left: 0,
                width: RULER_SIZE,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderRight: '1px solid cyan',
                overflow: 'hidden',
                pointerEvents: 'auto', // Blocking
                userSelect: 'none',
                zIndex: 9998 // Below Corner
            }}>
                {Array.from({ length: 51 }).map((_, i) => {
                    const value = i * 100;
                    return (
                        <div key={`y-${value}`} style={{
                            position: 'absolute',
                            top: value,
                            width: '100%',
                            height: 100,
                            borderTop: '1px solid rgba(0, 255, 255, 0.5)',
                            color: 'cyan',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'center',
                            paddingTop: '4px'
                        }}>
                            {i}
                        </div>
                    );
                })}
            </div>

            {/* Corner Block with Indicators */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: RULER_SIZE,
                height: RULER_SIZE,
                backgroundColor: '#002222',
                borderRight: '1px solid cyan',
                borderBottom: '1px solid cyan',
                pointerEvents: 'auto',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <svg width="28" height="28" viewBox="0 0 28 28">
                    {/* X Arrow (Top Right) */}
                    <path d="M14 6 L24 6 M21 3 L24 6 L21 9" stroke="cyan" strokeWidth="1.5" fill="none" />
                    <text x="25" y="10" fill="cyan" fontSize="8" fontWeight="bold" textAnchor="middle">X</text>

                    {/* Y Arrow (Bottom Left) */}
                    <path d="M6 14 L6 24 M3 21 L6 24 L9 21" stroke="cyan" strokeWidth="1.5" fill="none" />
                    <text x="8" y="26" fill="cyan" fontSize="8" fontWeight="bold" textAnchor="start">Y</text>
                </svg>
            </div>

            {/* Coordinate Tooltip Follower (Optional enhancement) */}
            <MouseCoordinates />
        </div>
    );
};

const MouseCoordinates = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: mousePos.y + 15,
            left: mousePos.x + 15,
            padding: '4px 8px',
            background: 'rgba(0,0,0,0.8)',
            color: 'cyan',
            border: '1px solid cyan',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            zIndex: 10000
        }}>
            X: {Math.round(mousePos.x)} | Y: {Math.round(mousePos.y)}
        </div>
    );
};

export default LayoutGridOverlay;
