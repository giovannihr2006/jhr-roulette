/**
 * ModeToggle.jsx
 * Componente para alternar entre modo LIVE y modo SIMULACIÓN
 * Con soporte de accesibilidad ARIA
 */
import React from 'react'
import PropTypes from 'prop-types'

export const ModeToggle = ({ isLiveMode, setIsLiveMode }) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsLiveMode(!isLiveMode)
        }
    }

    return (
        <div
            onClick={() => setIsLiveMode(!isLiveMode)}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-pressed={isLiveMode}
            aria-label={isLiveMode ? 'Modo en vivo activo. Presiona para cambiar a simulación' : 'Modo simulación activo. Presiona para cambiar a modo en vivo'}
            style={{
                background: isLiveMode ? '#ff0044' : '#444',
                padding: '8px 15px',
                borderRadius: '20px',
                border: '2px solid #fff',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}
        >
            <div
                style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isLiveMode ? '#fff' : '#888'
                }}
                aria-hidden="true"
            />
            {isLiveMode ? "MODO EN VIVO" : "MODO SIMULACIÓN"}
        </div>
    )
}

// PropTypes for type safety and documentation
ModeToggle.propTypes = {
    /** Whether live mode is active */
    isLiveMode: PropTypes.bool.isRequired,
    /** Toggle live mode */
    setIsLiveMode: PropTypes.func.isRequired
}
