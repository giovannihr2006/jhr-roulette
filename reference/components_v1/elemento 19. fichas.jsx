import React from 'react'

const CHIPS = [100, 200, 500, 1000, 2000, 5000, 10000, 100000]

// Casino chip configurations - authentic colors
const CHIP_CONFIG = {
    100: { main: '#ffffff', secondary: '#e0e0e0', accent: '#1565c0', text: '#1565c0' },
    200: { main: '#e53935', secondary: '#c62828', accent: '#fff', text: '#fff' },
    500: { main: '#43a047', secondary: '#2e7d32', accent: '#fff', text: '#fff' },
    1000: { main: '#1e88e5', secondary: '#1565c0', accent: '#ffd700', text: '#fff' },
    2000: { main: '#424242', secondary: '#212121', accent: '#e53935', text: '#fff' },
    5000: { main: '#8e24aa', secondary: '#6a1b9a', accent: '#ffd700', text: '#fff' },
    10000: { main: '#ff9800', secondary: '#e65100', accent: '#000', text: '#000' },
    100000: { main: '#ffd700', secondary: '#ffc107', accent: '#000', text: '#000' }
}

export const ChipSelector = ({ selectedChip, onSelectChip }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            width: 'fit-content'
        }}>
            {/* Header */}
            <div style={{
                color: '#d4af37',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
            }}>
                🎰 FICHAS
            </div>

            {/* Chip Tray - Green felt like real casino */}
            <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '6px',
                padding: '8px 10px',
                background: 'linear-gradient(180deg, #0f4c2a 0%, #0a3d22 50%, #052e18 100%)',
                borderRadius: '12px',
                border: '3px solid #8b4513',
                boxShadow: '0 6px 20px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                width: 'fit-content'
            }}>
                {CHIPS.map(value => {
                    const config = CHIP_CONFIG[value]
                    const isSelected = selectedChip === value

                    return (
                        <div
                            key={value}
                            onClick={() => onSelectChip(value)}
                            style={{
                                width: '75px',
                                height: '75px',
                                borderRadius: '50%',
                                position: 'relative',
                                cursor: 'pointer',
                                transform: isSelected ? 'scale(1.15) translateY(-5px)' : 'scale(1)',
                                transition: 'all 0.2s ease',
                                zIndex: isSelected ? 10 : 1
                            }}
                        >
                            {/* Outer ring with edge pattern (stripes) */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '50%',
                                background: `
                                    repeating-conic-gradient(
                                        from 0deg,
                                        ${config.accent} 0deg 10deg,
                                        ${config.main} 10deg 20deg
                                    )
                                `,
                                boxShadow: isSelected
                                    ? `0 0 25px ${config.main}80, 0 8px 20px rgba(0,0,0,0.5)`
                                    : `0 4px 12px rgba(0,0,0,0.5)`,
                                border: isSelected ? '3px solid #ffd700' : '2px solid rgba(0,0,0,0.3)'
                            }} />

                            {/* Middle ring */}
                            <div style={{
                                position: 'absolute',
                                inset: '8px',
                                borderRadius: '50%',
                                background: config.main,
                                border: `3px solid ${config.secondary}`
                            }} />

                            {/* Inner medallion with value */}
                            <div style={{
                                position: 'absolute',
                                inset: '15px',
                                borderRadius: '50%',
                                background: `radial-gradient(circle at 30% 30%, ${config.main} 0%, ${config.secondary} 100%)`,
                                border: `2px solid ${config.accent}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.3), inset 0 -2px 5px rgba(0,0,0,0.2)'
                            }}>
                                {/* Value */}
                                <span style={{
                                    color: config.text,
                                    fontWeight: 'bold',
                                    fontSize: value >= 10000 ? '13px' : '16px',
                                    fontFamily: 'Georgia, serif',
                                    textShadow: config.text === '#fff'
                                        ? '0 1px 2px rgba(0,0,0,0.5)'
                                        : '0 1px 0 rgba(255,255,255,0.3)',
                                    lineHeight: 1
                                }}>
                                    {value >= 1000 ? `${value / 1000}K` : value}
                                </span>
                            </div>

                            {/* 3D Highlight overlay */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                                pointerEvents: 'none'
                            }} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
