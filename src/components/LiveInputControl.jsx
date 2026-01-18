import React, { useState, useEffect, useRef } from 'react';

export const LiveInputControl = ({ onSubmit, lastWin }) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    // Auto-focus when component mounts
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const num = parseInt(inputValue, 10);

        if (!isNaN(num) && num >= 0 && num <= 36) {
            onSubmit(num);
            setInputValue('');
        } else {
            // Shake effect or visual feedback for invalid input could go here
            setInputValue('');
        }
    };

    const handleChange = (e) => {
        const val = e.target.value;
        // Only allow up to 2 digits
        if (val.length <= 2) {
            setInputValue(val);
        }
    };

    return (
        <foreignObject x={-60} y={-60} width={120} height={120}>
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                <style>
                    {`
                        .no-spin::-webkit-inner-spin-button, 
                        .no-spin::-webkit-outer-spin-button { 
                            -webkit-appearance: none; 
                            margin: 0; 
                        }
                        .no-spin {
                            -moz-appearance: textfield;
                        }
                    `}
                </style>
                <form onSubmit={handleSubmit} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                        ref={inputRef}
                        type="number"
                        className="no-spin"
                        value={inputValue}
                        onChange={handleChange}
                        placeholder={lastWin !== null ? lastWin.toString() : "?"}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(0, 0, 0, 0.9)',
                            border: '3px solid #00CED1',
                            color: '#00CED1',
                            fontSize: '40px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            outline: 'none',
                            boxShadow: '0 0 15px #00CED1, inset 0 0 10px rgba(0,255,255,0.2)',
                            textShadow: '0 0 5px #00CED1',
                            fontFamily: 'monospace', // Ensures numbers look techy
                            padding: 0 // Remove default padding
                        }}
                    />
                </form>
            </div>
        </foreignObject>
    );
};
