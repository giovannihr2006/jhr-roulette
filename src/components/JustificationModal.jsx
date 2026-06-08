/**
 * JustificationModal - Componente genérico para tutoriales educativos
 *
 * Reemplaza 27 componentes individuales (JustificationModalE1-27)
 * Parametrizado con contenido desde ElementDescriptions.js
 *
 * @param {number} elementId - ID del elemento (1-27)
 * @param {string} title - Título del modal
 * @param {string} description - Contenido educativo
 * @param {Function} onClose - Callback cuando se cierra
 */

import React from 'react'
import './JustificationModal.css'

export const JustificationModal = ({
  elementId,
  title,
  description,
  onClose,
  className = ''
}) => {
  if (!elementId || !title || !description) {
    console.warn('JustificationModal missing required props:', { elementId, title })
    return null
  }

  return (
    <div className={`justification-modal-overlay ${className}`}>
      <div className="justification-modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="element-badge">E{elementId}</span>
            {title}
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="modal-description">
            {typeof description === 'string' ? (
              <p>{description}</p>
            ) : (
              description
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-entendido"
            onClick={onClose}
          >
            Entendido ✓
          </button>
        </div>
      </div>
    </div>
  )
}

export default JustificationModal
