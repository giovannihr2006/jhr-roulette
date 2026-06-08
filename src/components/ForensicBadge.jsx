import React from 'react'
import { UI_REFERENCES } from '../config/UIReferences'

/**
 * ForensicBadge
 * Círculo amarillo con el número de referencia forense (E-number)
 * para ser embebido dentro de los encabezados de los widgets.
 */
export const ForensicBadge = ({ id, style = {} }) => {
    const number = UI_REFERENCES[id]
    if (!number) {
        console.warn(`ForensicBadge: No reference found for ID "${id}"`)
        return null
    }

    return (
        <div style={{
            minWidth: '28px',
            height: '24px',
            padding: '0 4px',
            background: '#ffeb3b', // Bright Yellow (RefBadge standard)
            color: '#000',
            borderRadius: '12px', // Pill shape
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 'bold',
            border: '2px solid #000', // Constant border
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            flexShrink: 0,
            fontFamily: 'Roboto Condensed, sans-serif',
            ...style
        }}>
            E{number}
        </div>
    )
}
