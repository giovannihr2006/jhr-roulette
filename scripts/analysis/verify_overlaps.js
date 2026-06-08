
const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

function getRelativeSectors(centerNum) {
    const centerIndex = WHEEL_ORDER.indexOf(centerNum)
    if (centerIndex === -1) return { nucleo: [], vecinos: [], tiers: [], orphelins: [] }

    // Helper for circular slice
    const getSlice = (startOffset, endOffset) => {
        const nums = []
        for (let i = startOffset; i <= endOffset; i++) {
            let idx = (centerIndex + i) % 37
            if (idx < 0) idx += 37
            nums.push(WHEEL_ORDER[idx])
        }
        return nums
    }

    const set = { n: [-3, 3], v: [-9, 9] }

    const nucleo = getSlice(set.n[0], set.n[1])
    const vecinos = getSlice(set.v[0], set.v[1])
    const tiers = getSlice(11, 22)

    // Orphelins logic
    const orphRight = getSlice(set.v[1] + 1, 10)

    let gap2End = set.v[0] - 1
    if (gap2End < 23) gap2End += 37

    const orphLeft = getSlice(23, gap2End)

    const orphelins = [...orphRight, ...orphLeft]

    return { nucleo, vecinos, tiers, orphelins }
}

const centers = Array.from({ length: 37 }, (_, i) => i)
const systems = {}

centers.forEach(c => {
    systems[c] = getRelativeSectors(c)
})

console.log("--- FULL FORENSIC REPORT (0-36) ---")

// 1. Check Internal Overlaps (Nucleo vs Vecinos) consistency
let internalErrors = 0
centers.forEach(c => {
    const s = systems[c]
    const nSet = new Set(s.nucleo)
    const vSet = new Set(s.vecinos)
    const n_in_v = s.nucleo.filter(x => !vSet.has(x))
    if (n_in_v.length > 0) {
        console.log(`[ERROR] System ${c}: Nucleo NOT subset of Vecinos!`)
        internalErrors++
    }
})
if (internalErrors === 0) console.log("✔ INTERNAL CONSISTENCY: Nucleo is always 100% subset of Vecinos for all 37 numbers.")


// 2. Check Overlaps BETWEEN Systems (Nucleo vs Nucleo)
console.log("\n--- CROSS-SYSTEM NUCLEO CONFLICTS (Max Chip Economy Violation) ---")
console.log("Threshold: Reporting overlaps > 2 numbers")

let overlapCount = 0
for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
        const c1 = centers[i]
        const c2 = centers[j]
        const n1 = systems[c1].nucleo
        const n2 = systems[c2].nucleo
        const overlap = n1.filter(x => n2.includes(x))
        if (overlap.length >= 3) {
            console.log(`⚠ Nucleo ${c1} vs Nucleo ${c2}: SHARE ${overlap.length} NUMBERS! (${overlap})`)
            overlapCount++
        }
    }
}
console.log(`Total Significant Conflicts found: ${overlapCount}`)

// 3. Summary of "Cleanest" Systems (Least overlap with neighbors)
// Actually, Nucleo is geometric. Overlap is function of wheel distance.
// Distance 1: Overlap 6 nums.
// Distance 2: Overlap 5 nums.
// Distance 3: Overlap 4 nums.
// Distance 4: Overlap 3 nums.
// Distance 5: Overlap 2 nums.
// Distance 6: Overlap 1 num.
// Distance 7: Overlap 0 nums.

// Let's verify this hypothesis.
console.log("\n--- GEOMETRIC DISTANCE VERIFICATION ---")
const center = 0
const s0 = systems[0].nucleo
console.log(`Nucleo 0: ${s0}`)
centers.forEach(c => {
    if (c === 0) return
    const idx0 = WHEEL_ORDER.indexOf(0)
    const idxC = WHEEL_ORDER.indexOf(c)
    let dist = Math.abs(idx0 - idxC)
    if (dist > 18) dist = 37 - dist

    const sc = systems[c].nucleo
    const overlap = s0.filter(x => sc.includes(x)).length

    // Only print if relevant to understanding the pattern
    if (c === 26 || c === 3 || c === 32 || c === 15) {
        console.log(`Nucleo 0 vs Nucleo ${c} (Dist ${dist}): Overlap ${overlap}`)
    }
})
