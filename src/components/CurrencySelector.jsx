import React from 'react'

export const CurrencySelector = ({ currentCurrency, onSelectCurrency }) => {
    return (
        <div style={{
            display: 'flex',
            gap: '5px',
            padding: '8px',
            background: 'rgba(0,0,0,0.85)',
            borderRadius: '8px',
            border: '2px solid #555',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.6)'
        }}>
            {['COL', 'USA', 'EUR'].map(curr => (
                <button
                    key={curr}
                    onClick={() => onSelectCurrency(curr)}
                    style={{
                        background: currentCurrency === curr ? '#d4af37' : 'transparent',
                        color: currentCurrency === curr ? '#000' : '#888',
                        border: currentCurrency === curr ? '1px solid #ffd700' : '1px solid #444',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {curr}
                </button>
            ))}
        </div>
    )
}
