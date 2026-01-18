import React from 'react'
import { useStatTracker } from '../logic/StatTracker'
import { RED_NUMBERS } from '../logic/RouletteUtils'

const getNumberColor = (num) => {
    if (num === 0) return '#00d2d3' // Green/Cyan
    return RED_NUMBERS.includes(num) ? '#ff3838' : '#4b4b4b'
}

export const HistoryPanel = () => {
    const history = useStatTracker(state => state.history)

    return (
        <div style={{
            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '5px', padding: '10px',
            background: 'rgba(0,0,0,0.5)', borderRadius: '20px', backdropFilter: 'blur(5px)'
        }}>
            {history.slice(0, 15).map((num, i) => (
                <div key={i} style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: getNumberColor(num),
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '0.9rem',
                    boxShadow: i === 0 ? '0 0 10px white' : 'none',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    {num}
                </div>
            ))}
        </div>
    )
}
