/**
 * i18n.js
 * Configuration for react-i18next internationalization
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import es from './locales/es.json'
import en from './locales/en.json'

// Language resources
const resources = {
    es: { translation: es },
    en: { translation: en }
}

// Get saved language or default to Spanish
const savedLanguage = localStorage.getItem('language') || 'es'

// Initialize i18next
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'es',

        interpolation: {
            escapeValue: false // React already escapes values
        },

        // Key separator for nested keys
        keySeparator: '.',

        // Return key if translation not found
        returnEmptyString: false,

        // Debug mode (disable in production)
        debug: false
    })

// Save language preference when changed
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('language', lng)
    document.documentElement.lang = lng
})

export default i18n
