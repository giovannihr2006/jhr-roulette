import React from 'react'
import { useToastStore } from '../logic/ToastStore'

export const ToastContainer = () => {
    const toasts = useToastStore((state) => state.toasts)
    const removeToast = useToastStore((state) => state.removeToast)

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none' // Allow clicks through container
        }}>
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    onClick={() => removeToast(toast.id)}
                    style={{
                        pointerEvents: 'auto',
                        minWidth: '300px',
                        background: toast.type === 'error' ? 'rgba(220, 53, 69, 0.95)' :
                            toast.type === 'success' ? 'rgba(40, 167, 69, 0.95)' :
                                'rgba(33, 37, 41, 0.95)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '500',
                        animation: 'fadeIn 0.3s ease-out',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {toast.type === 'error' && '⚠️ '}
                    {toast.type === 'success' && '✅ '}
                    {toast.message}
                </div>
            ))}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
