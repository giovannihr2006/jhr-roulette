/**
 * BrandingHeader.jsx
 * Componente extraído de CasinoTable.jsx para mostrar el título y versión del juego
 */
import React from 'react'
import PropTypes from 'prop-types'

export const BrandingHeader = ({ title, version }) => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none'
        }}>
            <svg viewBox="0 0 500 85" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle"
                    fill="#d4af37"
                    fontFamily="Times New Roman, serif"
                    fontWeight="bold"
                    fontSize="42"
                    letterSpacing="2px"
                    style={{
                        textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.4)',
                        textTransform: 'uppercase'
                    }}
                >
                    {title}
                </text>
                <text x="50%" y="85%" dominantBaseline="middle" textAnchor="middle"
                    fill="#aaa"
                    fontFamily="'Roboto Mono', monospace"
                    fontSize="14"
                    letterSpacing="1px"
                    style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}
                >
                    {version}
                </text>
            </svg>
        </div>
    )
}

// PropTypes for type safety and documentation
BrandingHeader.propTypes = {
    /** Title text to display */
    title: PropTypes.string,
    /** Version text to display */
    version: PropTypes.string
}

BrandingHeader.defaultProps = {
    title: 'GHR Ruleta Royale',
    version: 'Version 1.0, 10 Enero 2025'
}
