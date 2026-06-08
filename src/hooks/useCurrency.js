import { useState, useEffect } from 'react'
import { CurrencyService } from '../utils/CurrencyService'

export const useCurrency = () => {
    const [exchangeRates, setExchangeRates] = useState(null)
    const [viewCurrency, setViewCurrency] = useState(() => {
        return localStorage.getItem('viewCurrency') || 'COL'
    })

    useEffect(() => {
        let mounted = true
        CurrencyService.fetchRates().then(data => {
            if (mounted && data && data.isValid) {
                setExchangeRates(data)
            }
        })
        return () => { mounted = false }
    }, [])

    const handleSetViewCurrency = (curr) => {
        setViewCurrency(curr)
        localStorage.setItem('viewCurrency', curr)
    }

    return {
        exchangeRates,
        viewCurrency,
        setViewCurrency: handleSetViewCurrency
    }
}
