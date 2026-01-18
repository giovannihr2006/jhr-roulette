/**
 * PremiumPanel.jsx
 * Reusable premium-styled panel component
 * Used across multiple UI elements for consistent styling
 */
import React from 'react'
import PropTypes from 'prop-types'

/**
 * Premium styled panel with gold accents
 */
export const PremiumPanel = ({
    children,
    title,
    compact = false,
    className = '',
    style = {}
}) => {
    return (
        <div
            className={`premium-panel ${className}`}
            style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
                border: '2px solid #d4af37',
                borderTop: '2px solid #fecb00',
                borderBottom: '2px solid #8a6e20',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.2)',
                color: '#e0e0e0',
                fontFamily: 'Roboto Mono, monospace',
                padding: compact ? '10px 15px' : '15px 20px',
                ...style
            }}
        >
            {title && (
                <div
                    style={{
                        color: '#d4af37',
                        fontWeight: 'bold',
                        fontSize: compact ? '0.8rem' : '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: compact ? '8px' : '12px',
                        borderBottom: '1px solid #333',
                        paddingBottom: '8px'
                    }}
                >
                    {title}
                </div>
            )}
            {children}
        </div>
    )
}

PremiumPanel.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    compact: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object
}

/**
 * Premium styled button component
 */
export const PremiumButton = ({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
    size = 'medium',
    ...props
}) => {
    const variants = {
        primary: {
            background: 'linear-gradient(135deg, #d4af37, #aa8c2c)',
            color: '#000',
            border: '1px solid #ffd700'
        },
        secondary: {
            background: '#333',
            color: '#fff',
            border: '1px solid #555'
        },
        danger: {
            background: 'linear-gradient(135deg, #dc3545, #a71d2a)',
            color: '#fff',
            border: '1px solid #ff4444'
        },
        success: {
            background: 'linear-gradient(135deg, #28a745, #1e7e34)',
            color: '#fff',
            border: '1px solid #44ff44'
        }
    }

    const sizes = {
        small: { padding: '6px 12px', fontSize: '0.85rem' },
        medium: { padding: '10px 20px', fontSize: '1rem' },
        large: { padding: '14px 28px', fontSize: '1.1rem' }
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                ...variants[variant],
                ...sizes[size],
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}
            {...props}
        >
            {children}
        </button>
    )
}

PremiumButton.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large'])
}

export default PremiumPanel
