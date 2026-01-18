/**
 * WheelErrorBoundary.jsx
 * Error boundary specifically for RouletteWheel/3D components
 */
import React from 'react'
import PropTypes from 'prop-types'

class WheelErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('[WheelErrorBoundary] Caught error:', error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        width: this.props.size || 600,
                        height: this.props.size || 600,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)',
                        borderRadius: '50%',
                        border: '4px solid #d4af37',
                        color: '#fff',
                        textAlign: 'center',
                        padding: '20px'
                    }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎰</div>
                    <h3 style={{ color: '#d4af37', marginBottom: '10px' }}>
                        Error en la Ruleta
                    </h3>
                    <p style={{ color: '#888', marginBottom: '20px', fontSize: '0.9rem' }}>
                        Hubo un problema al renderizar la ruleta.
                    </p>
                    <button
                        onClick={this.handleRetry}
                        style={{
                            background: 'linear-gradient(135deg, #d4af37, #aa8c2c)',
                            color: '#000',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

WheelErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    size: PropTypes.number
}

WheelErrorBoundary.defaultProps = {
    size: 600
}

export default WheelErrorBoundary
