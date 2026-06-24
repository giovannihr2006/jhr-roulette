import React from 'react'
import { createPortal } from 'react-dom'

export const LayoutHelpModal = ({ onClose }) => {
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
                padding: '30px',
                width: '600px',
                maxWidth: '90vw',
                color: '#fff',
                fontFamily: 'sans-serif',
                position: 'relative',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'transparent', border: 'none', color: '#ff4444',
                        fontSize: '24px', cursor: 'pointer'
                    }}
                >
                    ✕
                </button>

                <h2 style={{ color: '#d4af37', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                    Gestión de Diseño Personalizado
                </h2>

                <div style={{ marginTop: '20px', lineHeight: '1.6' }}>
                    <h3 style={{ color: '#17a2b8' }}>1. Guardar tu Diseño (IMPORTANTE)</h3>
                    <p>
                        Tu navegador puede borrar tus configuraciones si limpias el historial o actualizas.
                        Para <strong>evitar perder tu diseño</strong>:
                    </p>
                    <ul>
                        <li>Haz clic en <strong>💾 GUARDAR</strong>.</li>
                        <li>Elige una carpeta segura en tu PC (ej. Documentos).</li>
                        <li>Dale un nombre que recuerdes.</li>
                    </ul>

                    <h3 style={{ color: '#28a745' }}>2. Restaurar tu Diseño</h3>
                    <p>
                        Si tu diseño se pierde o cambia:
                    </p>
                    <ul>
                        <li>Haz clic en <strong>📂 CARGAR</strong>.</li>
                        <li>Busca el archivo <code>.json</code> que guardaste anteriormente.</li>
                        <li>Tu diseño volverá exactamente a como estaba.</li>
                    </ul>

                    <h3 style={{ color: '#d4af37' }}>3. Restaurar Valores de Fábrica</h3>
                    <p>
                        El botón <strong>↺ RESTAURAR DISEÑO</strong> borra tu configuración actual y
                        devuelve todo a la posición original "de fábrica". Úsalo si quieres empezar de cero.
                    </p>
                </div>

                <div style={{ marginTop: '30px', textAlign: 'right' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: '#d4af37',
                            color: 'black',
                            border: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        ENTENDIDO
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
