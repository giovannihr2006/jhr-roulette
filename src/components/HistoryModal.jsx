import React, { useRef } from 'react'
import { createPortal } from 'react-dom'

export const HistoryModal = ({ history, onClose }) => {
    // history is array from useFinancialStore.roundHistory

    const exportToCSV = () => {
        const headers = ["ID", "Fecha", "Hora", "Número", "Apuesta Total", "Ganancia", "Saldo Final"]
        const rows = history.map(row => [
            row.id,
            new Date(row.timestamp).toLocaleDateString(),
            new Date(row.timestamp).toLocaleTimeString(),
            row.winningNumber,
            row.totalBet,
            row.totalWin,
            row.balanceAfter
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `ghr_historial_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999
        }}>
            <div style={{
                background: '#1a1a1a',
                border: '2px solid #d4af37',
                padding: '0', // No padding on main container
                width: '900px',
                maxWidth: '95vw',
                height: '80vh',
                color: '#fff',
                fontFamily: 'sans-serif',
                position: 'relative',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* HEAD */}
                <div style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: '#d4af37', margin: 0 }}>📜 Historial Detallado</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={exportToCSV} style={{
                            background: '#005c35', color: 'white', border: '1px solid #fff',
                            padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold'
                        }}>
                            📥 EXPORTAR CSV
                        </button>
                        <button onClick={onClose} style={{
                            background: 'transparent', border: 'none', color: '#ff4444',
                            fontSize: '24px', cursor: 'pointer'
                        }}>✖</button>
                    </div>
                </div>

                {/* BODY - SCROLLABLE */}
                <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#333', zIndex: 1 }}>
                            <tr>
                                <th style={thStyle}>Fecha</th>
                                <th style={thStyle}>Hora</th>
                                <th style={thStyle}>N°</th>
                                <th style={thStyle}>Apuesta</th>
                                <th style={thStyle}>Ganancia</th>
                                <th style={thStyle}>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                        No hay historial registrado aún.
                                    </td>
                                </tr>
                            ) : (
                                history.map((row, idx) => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #333', background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                        <td style={tdStyle}>{new Date(row.timestamp).toLocaleDateString()}</td>
                                        <td style={tdStyle}>{new Date(row.timestamp).toLocaleTimeString()}</td>
                                        <td style={{ ...tdStyle, color: '#d4af37', fontWeight: 'bold' }}>{row.winningNumber}</td>
                                        <td style={tdStyle}>${row.totalBet}</td>
                                        <td style={{ ...tdStyle, color: row.totalWin > 0 ? '#0f0' : '#888' }}>
                                            {row.totalWin > 0 ? `+$${row.totalWin}` : '-'}
                                        </td>
                                        <td style={tdStyle}>${row.balanceAfter}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div style={{ padding: '15px', borderTop: '1px solid #333', textAlign: 'right', fontSize: '0.9rem', color: '#666' }}>
                    Mostrando últimos {history.length} giros
                </div>
            </div>
        </div>,
        document.body
    )
}

const thStyle = {
    padding: '12px 15px',
    color: '#bbb',
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    borderBottom: '2px solid #444'
}

const tdStyle = {
    padding: '10px 15px',
    fontSize: '0.9rem',
    color: '#eee'
}
