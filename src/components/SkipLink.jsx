/**
 * SkipLink.jsx
 * Skip to main content link for keyboard/screen reader users
 */
import React from 'react'

/**
 * Accessible skip link that allows keyboard users to bypass navigation
 * and jump directly to main content
 */
export const SkipLink = ({ targetId = 'main-content' }) => {
    const handleClick = (e) => {
        e.preventDefault()
        const target = document.getElementById(targetId)
        if (target) {
            target.focus()
            target.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <a
            href={`#${targetId}`}
            onClick={handleClick}
            className="skip-link"
            style={{
                position: 'absolute',
                top: '-100px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#d4af37',
                color: '#000',
                padding: '12px 24px',
                borderRadius: '0 0 8px 8px',
                fontWeight: 'bold',
                fontSize: '1rem',
                zIndex: 10000,
                textDecoration: 'none',
                transition: 'top 0.3s ease'
            }}
            onFocus={(e) => {
                e.target.style.top = '0'
            }}
            onBlur={(e) => {
                e.target.style.top = '-100px'
            }}
        >
            Saltar al contenido principal
        </a>
    )
}

export default SkipLink
