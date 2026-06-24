import React from 'react'

export const HistoryModal = ({ onClose, logs }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                background: '#1a1a1a', padding: '20px', borderRadius: '12px',
                border: '2px solid #d4af37', width: '800px', maxHeight: '80vh',
                display: 'flex', flexDirection: 'column', color: '#fff',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#d4af37' }}>📜 Auditoría de Transacciones</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer'
                    }}>×</button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #333', borderRadius: '4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ background: '#333', position: 'sticky', top: 0 }}>
                            <tr>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Hora</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Tipo</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Detalle</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Monto</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Sin registros</td></tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '8px', color: '#aaa' }}>{log.time}</td>
                                        <td style={{ padding: '8px', fontWeight: 'bold', color: getTypeColor(log.type) }}>{log.type}</td>
                                        <td style={{ padding: '8px' }}>{log.detail}</td>
                                        <td style={{ padding: '8px', textAlign: 'right', color: log.amount > 0 ? '#4f4' : (log.amount < 0 ? '#f44' : '#888') }}>
                                            {log.amount > 0 ? '+' : ''}{log.amount}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#d4af37' }}>
                                            {log.balanceAfter}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

const getTypeColor = (type) => {
    if (type === 'WIN') return '#4f4'
    if (type === 'LOSS') return '#f44'
    if (type === 'BET') return '#f84'
    if (type === 'REFUND') return '#48f'
    return '#fff'
}
