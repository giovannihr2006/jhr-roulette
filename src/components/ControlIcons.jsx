/**
 * ControlIcons.jsx
 * Draggable control icons ($, Σ, M) for quick access to modal functions
 * These can be positioned independently by the user
 */
import React from 'react'
import PropTypes from 'prop-types'

// Individual Icon Button Component
// Blink Animation Style
const blinkStyle = {
    animation: 'blink-pulse 2s infinite'
}

// Add global style for keyframes if not present (simple hack or rely on CSS file)
// Better: Add inline style tag or assume css file has it.
// Let's add the keyframes to the button style directly or via a style tag in the main file.
// For now, I'll add a style tag injection or just use simple opacity pulsing.

const IconButton = ({ icon, color, bgColor, onClick, title, size = 65 }) => ( // Increased size
    <button
        className="control-icon-btn"
        style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            background: bgColor,
            color: color,
            fontSize: size * 0.5,
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: `0 0 15px ${color}`,
            ...blinkStyle // Blinking by default as requested
        }}
        onClick={onClick}
        title={title}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = `0 0 30px ${color}`
            e.currentTarget.style.animation = 'none' // Stop blinking on hover
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = `0 0 15px ${color}`
            e.currentTarget.style.animation = 'blink-pulse 2s infinite'
        }}
    >
        {icon}
        <style>
            {`
            @keyframes blink-pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(0.95); }
                100% { opacity: 1; transform: scale(1); }
            }
            `}
        </style>
    </button>
)

IconButton.propTypes = {
    icon: PropTypes.node.isRequired,
    color: PropTypes.string.isRequired,
    bgColor: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string,
    size: PropTypes.number
}

IconButton.defaultProps = {
    bgColor: 'rgba(0, 0, 0, 0.8)',
    title: '',
    size: 65
}

// Dollar Icon - Opens System Efficiency Modal
export const DollarIcon = ({ onClick }) => (
    <div className="control-icon-wrapper" style={{ padding: '5px' }}>
        <IconButton
            icon="$"
            color="#ffd700"
            bgColor="rgba(255, 215, 0, 0.1)"
            onClick={onClick}
            title="Ranking de Eficiencia (Sistemas)"
        />
    </div>
)

DollarIcon.propTypes = {
    onClick: PropTypes.func.isRequired
}

// Sigma Icon - Opens Simple Efficiency Modal
export const SigmaIcon = ({ onClick }) => (
    <div className="control-icon-wrapper" style={{ padding: '5px' }}>
        <IconButton
            icon="Σ"
            color="#00bfff"
            bgColor="rgba(0, 191, 255, 0.1)"
            onClick={onClick}
            title="Ranking de Eficiencia Simple (Columnas/Docenas)"
        />
    </div>
)

SigmaIcon.propTypes = {
    onClick: PropTypes.func.isRequired
}

// Methods Icon - Opens Methods Table
export const MethodsIcon = ({ onClick }) => (
    <div className="control-icon-wrapper" style={{ padding: '5px' }}>
        <IconButton
            icon="M"
            color="#ffa500"
            bgColor="rgba(255, 165, 0, 0.1)"
            onClick={onClick}
            title="Tabla de Métodos (48 combinaciones)"
        />
    </div>
)

MethodsIcon.propTypes = {
    onClick: PropTypes.func.isRequired
}

// Scanner Icon - Opens Internal Scanner Modal
export const ScannerIcon = ({ onClick }) => (
    <div className="control-icon-wrapper" style={{ padding: '5px' }}>
        <IconButton
            icon="🔍"
            color="#00ff88"
            bgColor="rgba(0, 255, 136, 0.1)"
            onClick={onClick}
            title="Scanner Interno (Apuestas Internas)"
        />
    </div>
)

ScannerIcon.propTypes = {
    onClick: PropTypes.func.isRequired
}

export default { DollarIcon, SigmaIcon, MethodsIcon, ScannerIcon }
