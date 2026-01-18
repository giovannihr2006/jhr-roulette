/**
 * ConfirmDialog.jsx
 * Reusable confirmation dialog component
 */
import React from 'react'
import PropTypes from 'prop-types'

export const ConfirmDialog = ({
    isOpen,
    onConfirm,
    onCancel,
    title = 'Confirmar Acción',
    message = '¿Estás seguro?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger'
}) => {
    if (!isOpen) return null

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onCancel()
        if (e.key === 'Enter') onConfirm()
    }

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const variantColors = {
        danger: { bg: 'linear-gradient(135deg, #dc3545, #a71d2a)', border: '#ff4444' },
        warning: { bg: 'linear-gradient(135deg, #ffc107, #d39e00)', border: '#ffcc00' },
        primary: { bg: 'linear-gradient(135deg, #d4af37, #aa8c2c)', border: '#ffd700' }
    }

    const colors = variantColors[variant] || variantColors.danger

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
            }}
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%)',
                    border: '2px solid #d4af37',
                    borderRadius: '12px',
                    padding: '30px',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.9)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3
                    id="confirm-title"
                    style={{
                        color: '#d4af37',
                        marginTop: 0,
                        marginBottom: '15px',
                        fontSize: '1.3rem'
                    }}
                >
                    {title}
                </h3>
                <p style={{ color: '#ccc', marginBottom: '25px' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            background: '#333',
                            color: '#fff',
                            border: '1px solid #555',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        autoFocus
                        style={{
                            background: colors.bg,
                            color: '#fff',
                            border: `1px solid ${colors.border}`,
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

ConfirmDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    variant: PropTypes.oneOf(['danger', 'warning', 'primary'])
}

export default ConfirmDialog
