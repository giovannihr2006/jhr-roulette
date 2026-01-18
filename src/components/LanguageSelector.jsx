/**
 * LanguageSelector.jsx
 * Language selection component for i18n
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
]

/**
 * Language selector dropdown component
 */
export const LanguageSelector = ({ compact = false }) => {
    const { i18n } = useTranslation()
    const currentLang = i18n.language

    const handleChange = (langCode) => {
        i18n.changeLanguage(langCode)
    }

    if (compact) {
        // Compact mode: just flags
        return (
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                }}
                role="group"
                aria-label="Selección de idioma"
            >
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleChange(lang.code)}
                        aria-pressed={currentLang === lang.code}
                        aria-label={`Cambiar a ${lang.name}`}
                        style={{
                            background: currentLang === lang.code ? '#d4af37' : '#333',
                            border: currentLang === lang.code ? '2px solid #fff' : '2px solid #555',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {lang.flag}
                    </button>
                ))}
            </div>
        )
    }

    // Full mode: dropdown
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
        >
            <label
                htmlFor="language-select"
                style={{
                    color: '#888',
                    fontSize: '0.9rem'
                }}
            >
                🌐
            </label>
            <select
                id="language-select"
                value={currentLang}
                onChange={(e) => handleChange(e.target.value)}
                style={{
                    background: '#222',
                    color: '#fff',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                }}
                aria-label="Seleccionar idioma"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

LanguageSelector.propTypes = {
    /** Use compact mode (flags only) */
    compact: PropTypes.bool
}

LanguageSelector.defaultProps = {
    compact: false
}

export default LanguageSelector
