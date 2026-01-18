import React from 'react'

const CHIPS = [1, 5, 25, 100, 500, 1000]

export const ChipSelector = ({ selectedChip, onSelectChip }) => {
    return (
        <div style={{
            display: 'flex',
            gap: '15px',
            padding: '10px 20px',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: '50px',
            border: '2px solid #555',
            boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {CHIPS.map(value => (
                <div
                    key={value}
                    onClick={() => onSelectChip(value)}
                    style={{
                        width: '50px', height: '50px',
                        borderRadius: '50%',
                        background: getChipGradient(value),
                        border: selectedChip === value
                            ? '8px solid #fff'
                            : '2px dashed rgba(255,255,255,0.5)',
                        boxShadow: selectedChip === value
                            ? '0 0 15px rgba(255,255,255,0.8), inset 0 0 10px rgba(0,0,0,0.5)'
                            : '0 2px 5px rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: value === 100 || value === 500 ? '#000' : '#fff', // Contrast for lighter chips
                        fontWeight: 'bold', fontSize: '14px',
                        cursor: 'pointer',
                        transform: selectedChip === value ? 'scale(1.15) translateY(-5px)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                >
                    {value}
                </div>
            ))}
        </div>
    )
}

// Helper for chip visuals
const getChipGradient = (value) => {
    switch (value) {
        case 1: return 'radial-gradient(circle at 30% 30%, #888, #444)' // Silver/Grey
        case 5: return 'radial-gradient(circle at 30% 30%, #d32f2f, #9a0007)' // Red
        case 25: return 'radial-gradient(circle at 30% 30%, #388e3c, #1b5e20)' // Green
        case 100: return 'radial-gradient(circle at 30% 30%, #1976d2, #0d47a1)' // Blue? Convention usually Black for 100, checking... standard is Black/100. Let's make it Black.
        // Actually 100 is often Black. 
        case 100: return 'radial-gradient(circle at 30% 30%, #222, #000)' // Black
        case 500: return 'radial-gradient(circle at 30% 30%, #9c27b0, #6a1b9a)' // Purple
        case 1000: return 'radial-gradient(circle at 30% 30%, #ffeb3b, #fbc02d)' // Gold
        default: return '#555'
    }
}
