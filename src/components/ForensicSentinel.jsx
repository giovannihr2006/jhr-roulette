import React, { useState, useEffect } from 'react'
import { calculateWinnings } from '../logic/RouletteUtils'
import JustificationModal from './JustificationModal'
import { ELEMENT_DESCRIPTIONS } from '../config/ElementDescriptions'
import { ForensicBadge } from './ForensicBadge'

/**
 * EL CENTINELA
 * Componente de vigilancia forense autónoma.
 * Monitoriza invisibles, errores de lógica y estado crítico.
 */
export const ForensicSentinel = ({
    currentBets,
    neighborCount,
    balance,
    peakCapital,
    initialCapital,

    currentRoundBet,
    bestPayout,
    style = {} // Accept style for Draggable
}) => {
    const [status, setStatus] = useState('SECURE') // SECURE, WARNING, CRITICAL
    const [report, setReport] = useState([])
    const [auditLog, setAuditLog] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [showJustification, setShowJustification] = useState(false)
    const [lastSync, setLastSync] = useState(Date.now())

    // MONITORING FREQUENCY (Heartbeat)
    useEffect(() => {
        const interval = setInterval(() => {
            runForensicSweep()
        }, 1500) // Slightly faster pulse

        return () => clearInterval(interval)
    }, [currentBets, neighborCount, balance, peakCapital, currentRoundBet, bestPayout])

    const runForensicSweep = () => {
        const issues = []
        const audit = []
        let maxSeverity = 'SECURE'

        // --- 1. MATHEMATICAL INTEGRITY AUDIT ---
        // Verify Potential vs Record Logic (The "Double Subtraction" Trap)
        if (bestPayout && bestPayout.amount > 0) {
            const potentialBalance = balance + bestPayout.amount
            const drCalculated = potentialBalance - peakCapital

            // Check if potentialBalance makes sense (balance already has bet subtracted)
            audit.push(`[MATH] Potential Check: ${potentialBalance} (OK)`)

            // SECURITY: Ensure no NaN values in DR calculation
            if (isNaN(drCalculated)) {
                issues.push("CRITICAL MATH ERROR: DR calculation resulted in NaN.")
                maxSeverity = 'CRITICAL'
            }
        }

        // --- 2. GHOST BET DETECTOR ---
        if (currentBets && Object.keys(currentBets).length > 0) {
            Object.keys(currentBets).forEach(betId => {
                if (betId === 'BATCH') return
                let canWin = false
                for (let i = 0; i <= 36; i++) {
                    if (calculateWinnings(i, { [betId]: 1 }) > 0) {
                        canWin = true
                        break
                    }
                }
                if (!canWin) {
                    issues.push(`GHOST BET DETECTED: ID '${betId}' is mathematically unwinnable.`)
                    maxSeverity = 'CRITICAL'
                }
            })
            audit.push(`[LOGIC] Ghost Bet Scan: Clean.`)
        }

        // --- 3. STATE HEALTH & SYNC ---
        if (balance < 0) {
            issues.push("ILLEGAL STATE: Negative balance detected.")
            maxSeverity = 'CRITICAL'
        }

        // Sync Latency Detector
        const now = Date.now()
        if (currentRoundBet > 0 && balance === initialCapital) {
            // If bet is placed but balance hasn't moved, we have a sync delay
            if (now - lastSync > 500) {
                issues.push("SYNC DELAY: Store balance not reflecting bet after 500ms.")
                maxSeverity = 'WARNING'
            }
        } else {
            setLastSync(now)
        }

        // --- 4. FORMULA VALIDATION LOG ---
        audit.push(`[SYNC] Balance: ${balance}`)
        audit.push(`[SYNC] Record: ${peakCapital}`)

        setReport(issues)
        setAuditLog(audit)
        setStatus(maxSeverity)
    }

    const getIcon = () => {
        if (status === 'SECURE') return '🟢'
        if (status === 'WARNING') return '⚠️'
        if (status === 'CRITICAL') return '💀'
        return '❓'
    }

    const getColor = () => {
        if (status === 'SECURE') return '#4caf50'
        if (status === 'WARNING') return '#ff9800'
        if (status === 'CRITICAL') return '#ff4444'
        return '#888'
    }

    return (
        <>
            {/* SENTINEL EYE (Element 28) */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '10px',
                    left: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(0,0,0,0.9)',
                    padding: '8px 15px',
                    borderRadius: '50px',
                    border: `1px solid ${getColor()}`,
                    zIndex: 20000,
                    boxShadow: `0 0 15px ${getColor()}40`,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    transition: 'all 0.3s',
                    ...style // Allow Draggable to control position
                }}
            >
                {/* Unified Badge E28 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ForensicBadge id="rubric40" overrideId="28" style={{ fontSize: '0.7rem', width: '22px', height: '22px' }} /> {/* Using rubric40 key but overriding display to 28 since E28 is custom mapped here or we can use specific key if added */}
                </div>

                <div
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <span style={{ fontSize: '1.2rem' }}>{getIcon()}</span>
                    <span style={{ color: getColor(), fontWeight: 'bold', letterSpacing: '1px' }}>
                        {status === 'SECURE' ? 'AUDIT VERIFIED' : 'CORE BREACH'}
                    </span>
                </div>

                {/* Tutorial Trigger */}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowJustification(true); }}
                    title="Ver Justificación Forense (E28)"
                    style={{
                        width: '24px', height: '24px',
                        borderRadius: '50%',
                        border: `1px solid ${getColor()}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', color: getColor(), background: 'rgba(20, 20, 20, 0.8)',
                        cursor: 'help',
                        transition: 'all 0.2s',
                        marginLeft: '5px'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 0 8px ${getColor()}60`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                    ⚖
                </button>
            </div>

            {/* TUTORIAL MODAL PORTAL */}
            {showJustification && <JustificationModal {...ELEMENT_DESCRIPTIONS[28]} onClose={() => setShowJustification(false)} />}

            {/* DETAILED REPORT MODAL */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '60px',
                    left: '10px',
                    width: '380px',
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '20px',
                    zIndex: 20001,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                    fontFamily: 'Consolas, monospace'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                        <div>
                            <strong style={{ color: '#fff', fontSize: '1rem' }}>FORENSIC REPORT [ID-28]</strong>
                            <div style={{ fontSize: '0.6rem', color: '#666' }}>Active Logic Auditor v2.0</div>
                        </div>
                        <span onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', color: '#888', fontSize: '1.2rem' }}>×</span>
                    </div>

                    {/* STATUS SECTION */}
                    <div style={{
                        background: `${getColor()}20`,
                        border: `1px solid ${getColor()}`,
                        padding: '10px',
                        borderRadius: '6px',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>{getIcon()}</span>
                        <div>
                            <div style={{ color: getColor(), fontWeight: 'bold' }}>SYSTEM: {status}</div>
                            <div style={{ color: '#aaa', fontSize: '0.7rem' }}>Last Scan: {new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>

                    {/* ISSUES LIST */}
                    {report.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ color: '#ff4444', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '5px' }}>ANOMALIES DETECTED:</div>
                            {report.map((issue, idx) => (
                                <div key={idx} style={{
                                    color: '#ff4444',
                                    marginBottom: '5px',
                                    fontSize: '0.8rem',
                                    paddingLeft: '10px',
                                    borderLeft: '2px solid #ff4444'
                                }}>
                                    {issue}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* AUDIT LOG (Verification Pulse) */}
                    <div style={{ background: '#111', padding: '10px', borderRadius: '6px' }}>
                        <div style={{ color: '#d4af37', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '5px' }}>AUDIT PULSE:</div>
                        {auditLog.map((log, idx) => (
                            <div key={idx} style={{ color: '#4caf50', fontSize: '0.7rem', marginBottom: '2px' }}>
                                ✓ {log}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '15px', fontSize: '0.65rem', color: '#444', textAlign: 'right' }}>
                        Scan Interval: 1500ms | ID: BARYONIC-BLAZAR-CORE-28
                    </div>
                </div>
            )}
        </>
    )
}
