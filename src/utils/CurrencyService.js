export const CurrencyService = {
    async fetchRates() {
        try {
            // Using open.er-api.com (Free, reliable, based on USD)
            const response = await fetch('https://open.er-api.com/v6/latest/USD')
            if (!response.ok) throw new Error('Network response was not ok')
            const data = await response.json()

            return {
                COP: data.rates.COP,
                EUR: data.rates.EUR,
                isValid: true
            }
        } catch (error) {
            console.error("Currency Fetch Error:", error)
            return { isValid: false }
        }
    }
}
