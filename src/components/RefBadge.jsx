import React from 'react'
import { UI_REFERENCES } from '../config/UIReferences'

export const RefBadge = ({ id, style = {} }) => {
    const number = UI_REFERENCES[id]
    if (!number) return null

    return (
        <div style={{
            position: 'absolute',
            left: '-28px', // Position to the left
            top: '0',
            width: '24px',
            height: '24px',
            background: '#ffeb3b', // Bright Yellow
            color: '#000',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 10000,
            border: '2px solid #000',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            pointerEvents: 'none', // Critical: Don't block clicks
            ...style
        }}>
            {number}
        </div>
    )
}
