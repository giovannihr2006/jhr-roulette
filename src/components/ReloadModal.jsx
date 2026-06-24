import React, { useState } from 'react'
import { createPortal } from 'react-dom'
const formatValue = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}
import { soundManager } from '../utils/SoundManager'
import { Z_LAYERS } from '../config/Theme' // NEW

export const ReloadModal = ({ onClose, onReload, viewCurrency, rates }) => {
    const [amount, setAmount] = useState('')

    const handleReload = () => {
        const amountVal = Number(amount)
        if (amountVal > 0) {
            const rate = rates[viewCurrency] || 1
            onReload(amountVal / rate)
            onClose()
        } else {
            alert("Por favor ingresa un monto válido")
        }
    }

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            zIndex: Z_LAYERS.CRITICAL_MODAL,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                border: '1px solid #333',
                padding: '40px',
                borderRadius: '20px',
                textAlign: 'center',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                maxWidth: '450px',
                width: '90%'
            }}>
                <h2 style={{ color: '#d4af37', fontSize: '1.8rem', marginBottom: '10px', textTransform: 'uppercase' }}>Recargar Fondos</h2>
                <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '1rem', lineHeight: '1.5' }}>
                    Ingresa la cantidad de fichas que deseas añadir a tu saldo actual.
                </p>

                <div style={{ marginBottom: '30px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '1.2rem' }}>$</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={amount}
                        placeholder="0"
                        autoFocus
                        onMouseDown={(e) => { e.stopPropagation(); e.target.focus(); }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '')
                            setAmount(val)
                        }}
                        style={{
                            width: '100%',
                            padding: '15px 15px 15px 35px',
                            background: '#000',
                            border: '1px solid #444',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            outline: 'none',
                            fontFamily: 'Roboto Mono, monospace',
                            pointerEvents: 'all',
                            userSelect: 'text',
                            cursor: 'text'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '15px 30px',
                            borderRadius: '50px',
                            border: '1px solid #444',
                            background: 'transparent',
                            color: '#888',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={handleReload}
                        style={{
                            padding: '15px 40px',
                            borderRadius: '50px',
                            border: 'none',
                            background: 'linear-gradient(145deg, #2e7d32, #1b5e20)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 15px rgba(46, 125, 50, 0.4)',
                            transform: 'scale(1.05)',
                            textTransform: 'uppercase'
                        }}
                    >
                        RECARGAR
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
