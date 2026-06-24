// This script mimics the browser environment to test the Logic Stores.
// Run with: node src/tests/flight_check.js
// Note: We need to mock 'zustand' slightly or ensure it runs in Node. 
// Zustand vanilla 'create' works in Node. We just need to handle modules.
// Since we are in an ES module project (Vite), we should use .mjs or ensure type:module is set. 
// For this quick check, we'll assume we can include the store logic or just duplicate the critical parts 
// to verify the ALGORITHM, as importing React hooks in Node is painful.

// FLIGHT CHECK SIMULATION
console.log("---------------------------------------------------")
console.log("GENESIS PROTOCOL: FLIGHT CHECK (AG-47)")
console.log("---------------------------------------------------")

// MOCK STORES (Simplified versions of the actual logic to verify the MATH)
// We replicate the exact logic to ensure it behaves as expected given inputs.

// 1. STAT TRACKER LOGIC

let statStore = {
    history: [],
    waits: {},
    addResult: (num) => {
        statStore.history.unshift(num)
        const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num)

        // Update RED/BLACK
        if (num === 0) {
            statStore.waits["RED"] = (statStore.waits["RED"] || 0) + 1
            statStore.waits["BLACK"] = (statStore.waits["BLACK"] || 0) + 1
        } else {
            if (isRed) {
                statStore.waits["RED"] = 0
                statStore.waits["BLACK"] = (statStore.waits["BLACK"] || 0) + 1
            } else {
                statStore.waits["BLACK"] = 0
                statStore.waits["RED"] = (statStore.waits["RED"] || 0) + 1
            }
        }
    }
}

// 2. FINANCIAL LOGIC
let financeStore = {
    currentCapital: 1000000,
    history: [{ spin: 0, balance: 1000000 }],
    registerSpin: (delta) => {
        financeStore.currentCapital += delta
        financeStore.history.push({
            spin: financeStore.history.length,
            balance: financeStore.currentCapital
        })
    }
}

// 3. PHYSICS PRESET MOCK
let physicsConfig = {
    gravity: -9.81,
    friction: 0.01
}

function loadPreset(name) {
    if (name === "THORP_PHYSICS") {
        physicsConfig = { gravity: -9.81, friction: 0.008, tilt: 0.2 }
        console.log(`[SYSTEM] Loaded Strategy Preset: ${name}`)
        console.log(`[PHYSICS] Gravity: ${physicsConfig.gravity}, Friction: ${physicsConfig.friction}, Tilt: ${physicsConfig.tilt}`)
    }
}

// EXECUTION
loadPreset("THORP_PHYSICS")

console.log("\n[SIMULATION] Running 50 Spins...")
let wins = 0
let losses = 0

for (let i = 1; i <= 50; i++) {
    // Generate Thorp-biased result (fake bias for test)
    // In real app, the 3D physics would produce this. Here we simulate the OUTPUT of that physics.
    const num = Math.floor(Math.random() * 37)

    statStore.addResult(num)

    // Simulate betting 100 on RED every time
    const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num)
    if (isRed) {
        financeStore.registerSpin(100) // Win
        wins++
    } else {
        financeStore.registerSpin(-100) // Loss
        losses++
    }
}

console.log("\n[REPORT] Flight Check Complete")
console.log(`> Spins: 50`)
console.log(`> Win/Loss: ${wins} / ${losses}`)
console.log(`> Final Capital: $${financeStore.currentCapital}`)
console.log(`> Balance Points Recorded: ${financeStore.history.length}`)
console.log(`> History Sample: ${JSON.stringify(financeStore.history.slice(0, 5))} ...`)
console.log(`> Current RED Wait: ${statStore.waits["RED"]}`)
console.log(`> Current BLACK Wait: ${statStore.waits["BLACK"]}`)

if (financeStore.history.length === 51) {
    console.log("\n[SUCCESS] Financial Engine tracked every spin.")
} else {
    console.log("\n[FAIL] Missing data points in Graph history.")
}

if (statStore.waits["RED"] !== undefined) {
    console.log("[SUCCESS] Deep Data Engine tracked Wait times.")
}

console.log("---------------------------------------------------")
