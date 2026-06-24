import React, { useMemo } from 'react'
import { useFinancialStore } from '../logic/FinancialSimulator'

const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export const DetailedHistoryModal = ({ onClose }) => {
    const roundHistory = useFinancialStore(state => state.roundHistory || [])

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: 5000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                width: '90%', maxWidth: '800px', height: '80%', display: 'flex', flexDirection: 'column',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
                border: '2px solid #d4af37',
                borderTop: '2px solid #fecb00',
                borderBottom: '2px solid #8a6e20',
                borderRadius: '8px',
                boxShadow: '0 0 50px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.2)',
                color: '#e0e0e0',
                fontFamily: 'Roboto, sans-serif'
            }}>
                {/* HEADER */}
                <div style={{
                    background: 'linear-gradient(to bottom, #2a2a2a, #151515)',
                    borderBottom: '1px solid #443a22',
                    padding: '8px 12px',
                    borderRadius: '6px 6px 0 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: '#d4af37', fontFamily: 'Cinzel, serif', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.2rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#d4af37' }}>Historial Detallado</h2>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer'
                    }}>✕</button>
                </div>

                {/* TABLE HEADER */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '120px 80px 100px 1fr 100px',
                    padding: '10px 20px', background: '#222', fontWeight: 'bold', color: '#aaa',
                    fontSize: '0.9rem', borderBottom: '1px solid #333'
                }}>
                    <div>FECHA / HORA</div>
                    <div>GANADOR</div>
                    <div>RESULTADO</div>
                    <div>APUESTAS (DETALLE)</div>
                    <div>PROFIT</div>
                </div>

                {/* CONTENT */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
                    {roundHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#666', fontStyle: 'italic' }}>
                            No hay historial de jugadas.
                        </div>
                    ) : (
                        roundHistory.slice(0, 100).map((round, i) => (
                            <div key={round.id || i} style={{
                                display: 'grid', gridTemplateColumns: '120px 80px 100px 1fr 100px',
                                padding: '12px 0', borderBottom: '1px solid #333',
                                alignItems: 'center', fontSize: '0.9rem',
                                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                            }}>
                                {/* DATE */}
                                <div style={{ color: '#888', fontSize: '0.8rem' }}>
                                    {new Date(round.timestamp).toLocaleString()}
                                </div>

                                {/* WINNER */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: round.winningNumber === 0 ? '#28a745' : (REDS.includes(round.winningNumber) ? '#dc3545' : '#111'),
                                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', border: '2px solid #fff'
                                    }}>
                                        {round.winningNumber}
                                    </div>
                                </div>

                                {/* RESULT (TEXT) */}
                                <div style={{
                                    color: round.totalWin > 0 ? '#4cd137' : '#e84118',
                                    fontWeight: 'bold'
                                }}>
                                    {round.totalWin > 0 ? 'GANÓ' : 'PERDIÓ'}
                                </div>

                                {/* BETS DETAIL */}
                                <div style={{ fontSize: '0.85rem', color: '#ccc', maxHeight: '60px', overflowY: 'auto' }}>
                                    {Object.entries(round.bets || {}).map(([betId, amount]) => (
                                        <span key={betId} style={{
                                            display: 'inline-block', background: '#333', padding: '2px 6px',
                                            borderRadius: '4px', margin: '2px', border: '1px solid #444'
                                        }}>
                                            {betId}: ${amount}
                                        </span>
                                    ))}
                                </div>

                                {/* NET PROFIT */}
                                <div style={{
                                    fontWeight: 'bold',
                                    color: round.netResult >= 0 ? '#4cd137' : '#e84118',
                                    textAlign: 'right'
                                }}>
                                    {round.netResult >= 0 ? '+' : ''}{round.netResult}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
