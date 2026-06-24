
import { useFinancialStore } from './src/logic/FinancialSimulator.js';

// Mock local storage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
    };
})();
global.localStorage = localStorageMock;

// Initialize store (mocking createJSONStorage behavior if needed, but for logic check we can just modify state)
// Actually we need to import the hooks properly or just run a simplified logic check.

const DISPLAY_RATES = {
    COL: 100,
    USA: 0.0266666,
    EUR: 0.0245333
}

const checkReload = (amount, currency) => {
    const rate = DISPLAY_RATES[currency] || 1;
    const logicUnits = amount / rate;
    console.log(`Input: ${amount} ${currency}, Rate: ${rate}, LogicUnits: ${logicUnits}`);

    // Simulate formatting
    const formattedVal = logicUnits * rate;
    console.log(`Displayed: ${formattedVal}`);

    return logicUnits;
}

console.log("--- TEST 1: 50000 COP ---");
checkReload(50000, 'COL');

console.log("--- TEST 2: 100 USD ---");
checkReload(100, 'USA');
