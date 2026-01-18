import { useState, useEffect } from 'react'
import { CurrencyService } from '../utils/CurrencyService'

export const useCurrency = () => {
    const [exchangeRates, setExchangeRates] = useState(null)
    const [viewCurrency, setViewCurrency] = useState('COL')

    useEffect(() => {
        let mounted = true
        CurrencyService.fetchRates().then(data => {
            if (mounted && data && data.isValid) {
                setExchangeRates(data)
            }
        })
        return () => { mounted = false }
    }, [])

    const formatCurrency = (amount, currencyIdx = viewCurrency) => {
        // ... logic if needed, or just expose raw rates
        // For now, the table handles formatting, this just provides data.
    }

    return {
        exchangeRates,
        viewCurrency,
        setViewCurrency
    }
}
