/**
 * HighContrastToggle.jsx
 * Toggle for high contrast accessibility mode
 */
import React from 'react'
import PropTypes from 'prop-types'

/**
 * High contrast mode toggle for accessibility
 * Applies a CSS class to the root element that enables high contrast styles
 */
export const HighContrastToggle = ({ isEnabled, onToggle }) => {
    const handleToggle = () => {
        onToggle(!isEnabled)

        // Apply/remove high contrast class to document
        if (!isEnabled) {
            document.documentElement.classList.add('high-contrast')
        } else {
            document.documentElement.classList.remove('high-contrast')
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
        }
    }

    return (
        <div
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            role="switch"
            aria-checked={isEnabled}
            aria-label={isEnabled ? 'Desactivar modo alto contraste' : 'Activar modo alto contraste'}
            tabIndex={0}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: isEnabled ? '#fff' : '#333',
                color: isEnabled ? '#000' : '#fff',
                border: `2px solid ${isEnabled ? '#000' : '#666'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease'
            }}
        >
            <span
                style={{
                    fontSize: '1.2rem'
                }}
                aria-hidden="true"
            >
                {isEnabled ? '☀️' : '🌙'}
            </span>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                Alto Contraste
            </span>
            <div
                style={{
                    width: '36px',
                    height: '20px',
                    background: isEnabled ? '#000' : '#555',
                    borderRadius: '10px',
                    position: 'relative',
                    transition: 'background 0.2s'
                }}
                aria-hidden="true"
            >
                <div
                    style={{
                        width: '16px',
                        height: '16px',
                        background: '#fff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: isEnabled ? '18px' : '2px',
                        transition: 'left 0.2s'
                    }}
                />
            </div>
        </div>
    )
}

HighContrastToggle.propTypes = {
    /** Whether high contrast mode is enabled */
    isEnabled: PropTypes.bool.isRequired,
    /** Toggle callback */
    onToggle: PropTypes.func.isRequired
}

export default HighContrastToggle
