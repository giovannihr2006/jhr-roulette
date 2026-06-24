import React, { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// --- CONSTANTS & PALETTE (From User Spec) ---
const COLORS = {
    mahogany: '#5D4037', // Deep wood
    maple: '#E5C29B', // Light maple wood
    gold: '#FFD700', // Rich Gold
    silver: '#E0E0E0', // Chrome/Silver
    red: '#B31B1B', // Casino Red
    black: '#111111', // Casino Black
    green: '#008F39', // European Green
    felt: '#053010'
}

// EUROPEAN SEQUENCE (Single Zero)
const NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

function ScientificWheel({ rotation, highlightedNumbers = [], placedNumbers = [], bestPayoutNumbers = [], isTurboMode = false }) {
    // --- HIGH RES SECTORS & NUMBERS CANVAS TEXTURE GENERATOR (Tramo 2) ---
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        const size = 2048
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        const cx = size / 2
        const cy = size / 2

        // Clear canvas
        ctx.clearRect(0, 0, size, size)

        const angleStep = (Math.PI * 2) / 37

        // 1. Draw the 37 colored sectors
        for (let i = 0; i < 37; i++) {
            const num = NUMBERS[i]
            // Center angle of sector
            const centerAngle = (i * angleStep) - (Math.PI / 2)
            // Sector boundaries
            const startAngle = centerAngle - (angleStep / 2)
            const endAngle = centerAngle + (angleStep / 2)

            // Determine standard color
            let sectorColor = COLORS.black
            if (num === 0) {
                sectorColor = COLORS.green
            } else if (REDS.includes(num)) {
                sectorColor = COLORS.red
            }

            // Draw solid sector
            ctx.beginPath()
            ctx.moveTo(cx, cy)
            ctx.arc(cx, cy, size / 2, startAngle, endAngle)
            ctx.closePath()
            ctx.fillStyle = sectorColor
            ctx.fill()

            // Draw highlight overlay if active
            const isHovered = highlightedNumbers.includes(num)
            const isBestPayout = bestPayoutNumbers.includes(num)
            const isPlaced = placedNumbers.includes(num)

            if (isHovered) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.45)' // Glowing Gold
                ctx.fill()
            } else if (isBestPayout) {
                ctx.fillStyle = 'rgba(0, 255, 255, 0.45)' // Vibrant Cyan
                ctx.fill()
            } else if (isPlaced) {
                ctx.fillStyle = 'rgba(64, 224, 208, 0.35)' // Turquoise
                ctx.fill()
            }

            // Draw premium gold sector dividers (brass separators)
            ctx.beginPath()
            ctx.moveTo(cx + Math.cos(startAngle) * (size / 2 * 0.583), cy + Math.sin(startAngle) * (size / 2 * 0.583))
            ctx.lineTo(cx + Math.cos(startAngle) * (size / 2), cy + Math.sin(startAngle) * (size / 2))
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)' // Warm Brass Gold
            ctx.lineWidth = 4
            ctx.stroke()

            // 2. Draw Number Text
            ctx.save()
            // Place text near the outer border/edge of the pockets (at 88% of outer radius)
            const textRadius = (size / 2) * 0.88
            const tx = cx + Math.cos(centerAngle) * textRadius
            const ty = cy + Math.sin(centerAngle) * textRadius

            ctx.translate(tx, ty)
            // Rotate radially so numbers face center
            ctx.rotate(centerAngle + Math.PI / 2)

            // Setup elegant bold font
            ctx.font = 'bold 72px "Roboto Condensed", "Arial Black", sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            // Draw high-contrast black outline
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 10
            ctx.strokeText(num.toString(), 0, 0)

            // Choose text color based on highlight state
            if (isHovered) {
                ctx.fillStyle = '#FFD700' // Gold text
            } else if (isBestPayout) {
                ctx.fillStyle = '#00FFFF' // Cyan text
            } else if (isPlaced) {
                ctx.fillStyle = '#40E0D0' // Turquoise text
            } else {
                ctx.fillStyle = '#FFFFFF' // Standard white text
            }
            ctx.fillText(num.toString(), 0, 0)
            ctx.restore()
        }

        // 3. Clear/Mask center circle to keep the inner slope transparent
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(cx, cy, (size / 2) * 0.583, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalCompositeOperation = 'source-over'

        // 4. Draw inner gold molding at pocket boundary
        ctx.beginPath()
        ctx.arc(cx, cy, (size / 2) * 0.583, 0, Math.PI * 2)
        ctx.strokeStyle = '#D4AF37'
        ctx.lineWidth = 8
        ctx.stroke()

        // Convert canvas to WebGL texture
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        return tex
    }, [highlightedNumbers, placedNumbers, bestPayoutNumbers])

    // Trigger texture GPU upload on change
    useEffect(() => {
        if (texture) {
            texture.needsUpdate = true
        }
    }, [texture])

    // Animation refs
    const startRotation = useRef(0)
    const targetRotation = useRef(0)
    const currentAnimRotation = useRef(0)
    const spinStartTime = useRef(0)
    const duration = useRef(12000)

    // Detect target rotation changes
    useEffect(() => {
        startRotation.current = currentAnimRotation.current
        targetRotation.current = rotation
        spinStartTime.current = performance.now()
        duration.current = isTurboMode ? 1000 : 12000
    }, [rotation, isTurboMode])

    // Local ref for the rotating group
    const rotorGroupRef = useRef()

    useFrame(() => {
        if (rotorGroupRef.current) {
            const now = performance.now()
            const elapsed = now - spinStartTime.current
            const progress = Math.min(elapsed / duration.current, 1)

            // Quintic ease-out curve matching CSS bezier transition
            const ease = 1 - Math.pow(1 - progress, 5)
            const current = startRotation.current + (targetRotation.current - startRotation.current) * ease

            currentAnimRotation.current = current
            rotorGroupRef.current.rotation.y = -current * (Math.PI / 180)
        }
    })

    return (
        <group>
            {/* === STATOR (Static Parts) === */}
            {/* Mahogany Bowl (Now openEnded=true to prevent burying the plane!) */}
            <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[5.8, 5.6, 1.2, 80, 1, true]} />
                <meshStandardMaterial color={COLORS.mahogany} roughness={0.06} metalness={0.15} />
            </mesh>
            {/* Top Rounded Lip */}
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[5.65, 0.15, 16, 80]} />
                <meshStandardMaterial color={COLORS.mahogany} roughness={0.06} metalness={0.12} />
            </mesh>
            {/* Base Gold Molding */}
            <mesh position={[0, -0.95, 0]}>
                <cylinderGeometry args={[5.62, 5.62, 0.1, 80]} />
                <meshStandardMaterial color={COLORS.gold} metalness={0.8} roughness={0.15} />
            </mesh>
            {/* Apron (Maple Track) */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[5.5, 4.8, 0.6, 80, 1, true]} />
                <meshStandardMaterial color={COLORS.maple} roughness={0.25} metalness={0.0} side={THREE.DoubleSide} />
            </mesh>
            {/* Deflectors */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const isRadial = i % 2 === 0
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle * Math.PI / 180) * 4.8, 0.3, Math.sin(angle * Math.PI / 180) * 4.8]}
                        rotation={[0.3, (angle + (isRadial ? 0 : 90)) * Math.PI / 180, 0]}
                    >
                        <boxGeometry args={[0.2, 0.08, 0.4]} />
                        <meshStandardMaterial color={COLORS.silver} metalness={0.8} roughness={0.1} />
                    </mesh>
                )
            })}

            {/* === ROTOR (Rotating Parts) === */}
            <group ref={rotorGroupRef}>
                {/* Number Ring - Flat Plane projected perfectly at Y -0.18, above mahogany bottom (resized to 9.6 x 9.6 for radius 4.8) */}
                <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[9.6, 9.6]} />
                    <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
                </mesh>

                {/* 3D Gold molding ring (Inner pocket boundary at radius 2.8) */}
                <mesh position={[0, -0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2.8, 0.03, 16, 80]} />
                    <meshStandardMaterial color={COLORS.gold} metalness={0.8} roughness={0.15} />
                </mesh>

                {/* 3D Gold molding ring (Outer pocket boundary at radius 4.8) */}
                <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[4.82, 0.02, 16, 80]} />
                    <meshStandardMaterial color={COLORS.gold} metalness={0.8} roughness={0.15} />
                </mesh>

                {/* Central Rotor Cone (Realistic multi-stage gold/brass cone) */}
                <mesh position={[0, -0.4, 0]}>
                    <cylinderGeometry args={[1.0, 2.8, 0.8, 64, 1, true]} />
                    <meshStandardMaterial color={COLORS.gold} metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.1, 0]}>
                    <cylinderGeometry args={[0.4, 1.0, 0.4, 64, 1, true]} />
                    <meshStandardMaterial color={COLORS.gold} metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1.0, 0.08, 16, 64]} />
                    <meshStandardMaterial color={COLORS.gold} metalness={0.8} roughness={0.2} />
                </mesh>

                {/* 3D Gold collar ring at cone opening */}
                <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.34, 0.06, 16, 64]} />
                    <meshStandardMaterial color={COLORS.gold} metalness={0.85} roughness={0.15} />
                </mesh>

                {/* Turret Spindle (Majestic Ornate Centerpiece) */}
                <group position={[0, 0.3, 0]}>
                    {/* Fluted chrome pillar */}
                    <mesh position={[0, 0.25, 0]}>
                        <cylinderGeometry args={[0.15, 0.28, 0.5, 32]} />
                        <meshStandardMaterial color={COLORS.silver} metalness={0.9} roughness={0.08} />
                    </mesh>
                    {/* Top gold crown/dome */}
                    <mesh position={[0, 0.52, 0]}>
                        <sphereGeometry args={[0.18, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color={COLORS.gold} metalness={0.85} roughness={0.15} />
                    </mesh>
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 0.04, 32]} />
                        <meshStandardMaterial color={COLORS.gold} metalness={0.85} roughness={0.15} />
                    </mesh>
                    {/* Majestic curved arms and handles */}
                    {[0, 90, 180, 270].map((angle, i) => (
                        <group key={i} rotation={[0, angle * Math.PI / 180, 0]}>
                            {/* Sloping arm */}
                            <mesh position={[0, 0.22, 0.6]} rotation={[0.15, 0, 0]}>
                                <cylinderGeometry args={[0.04, 0.02, 1.2, 16]} />
                                <meshStandardMaterial color={COLORS.silver} metalness={0.9} roughness={0.08} />
                            </mesh>
                            {/* Ornate gold sphere accents */}
                            <mesh position={[0, 0.31, 0.25]}>
                                <sphereGeometry args={[0.08, 16, 16]} />
                                <meshStandardMaterial color={COLORS.gold} metalness={0.8} roughness={0.15} />
                            </mesh>
                            {/* Handle tips */}
                            <mesh position={[0, 0.13, 1.2]}>
                                <sphereGeometry args={[0.13, 32, 32]} />
                                <meshStandardMaterial color={COLORS.gold} metalness={0.85} roughness={0.1} />
                            </mesh>
                        </group>
                    ))}
                </group>

                {/* Physical Separators (Thicker, Longer 3D Chrome Compartments centered at 3.8, length 2.0) */}
                {NUMBERS.map((_, i) => {
                    const angle = (i * ((Math.PI * 2) / 37)) - (Math.PI / 2) - (((Math.PI * 2) / 37) / 2)
                    return (
                        <mesh key={i} position={[Math.cos(angle) * 3.8, -0.14, Math.sin(angle) * 3.8]} rotation={[0, -angle, 0]}>
                            <boxGeometry args={[2.0, 0.08, 0.06]} />
                            <meshStandardMaterial color={COLORS.silver} metalness={0.9} roughness={0.1} />
                        </mesh>
                    )
                })}
            </group>
        </group>
    )
}

function Ball({ rotation, show, isTurboMode = false }) {
    if (!show) return null

    // Animation refs
    const startRotation = useRef(0)
    const targetRotation = useRef(0)
    const currentAnimRotation = useRef(0)
    const spinStartTime = useRef(0)
    const duration = useRef(12000)

    // Detect target rotation changes
    useEffect(() => {
        startRotation.current = currentAnimRotation.current
        targetRotation.current = rotation
        spinStartTime.current = performance.now()
        duration.current = isTurboMode ? 1000 : 12000
    }, [rotation, isTurboMode])

    // Local refs for the ball and shadow
    const ballRef = useRef()
    const shadowRef = useRef()

    useFrame(() => {
        const now = performance.now()
        const elapsed = now - spinStartTime.current
        const progress = Math.min(elapsed / duration.current, 1)

        // Quintic ease-out curve matching CSS bezier transition
        const ease = 1 - Math.pow(1 - progress, 5)
        const current = startRotation.current + (targetRotation.current - startRotation.current) * ease

        currentAnimRotation.current = current

        const radius = 3.8
        const angleRad = (current - 90) * (Math.PI / 180)
        const x = Math.cos(angleRad) * radius
        const z = Math.sin(angleRad) * radius

        if (ballRef.current) {
            ballRef.current.position.set(x, -0.1, z)
        }
        if (shadowRef.current) {
            shadowRef.current.position.set(x, -0.18, z)
        }
    })

    return (
        <group>
            {/* The Ball */}
            <mesh ref={ballRef} position={[0, -0.1, 0]}>
                <sphereGeometry args={[0.18, 32, 32]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.1} />
            </mesh>
            {/* Soft Shadow under the ball */}
            <mesh ref={shadowRef} position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0, 0.22, 16]} />
                <meshBasicMaterial color="#000" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
        </group>
    )
}

export const Roulette3D = ({
    wheelRotation = 0,
    ballRotation = 0,
    showBall = false,
    highlightedNumbers = [],
    placedNumbers = [],
    bestPayoutNumbers = [],
    size = 600,
    lastWin = null,
    isTurboMode = false
}) => {
    return (
        <div style={{ width: size || 600, height: size || 600, background: 'transparent', position: 'relative' }}>
            {/* ISOMETRIC-LIKE CAMERA (45 degrees) */}
            <Canvas camera={{ position: [0, 11, 11], fov: 40 }} gl={{ alpha: true, antialias: true }} shadows>
                {/* STUDIO LIGHTING SETUP */}
                <ambientLight intensity={1.1} />

                {/* Key Light */}
                <spotLight position={[-10, 25, 10]} angle={0.5} penumbra={1} intensity={1800} castShadow />

                {/* Fill Light */}
                <pointLight position={[10, 6, -10]} intensity={600} color="#ffd700" />

                {/* Extra Point Light for Dome Gloss */}
                <pointLight position={[-5, 8, 5]} intensity={450} color="#ffffff" />

                <ScientificWheel
                    rotation={wheelRotation}
                    highlightedNumbers={highlightedNumbers}
                    placedNumbers={placedNumbers}
                    bestPayoutNumbers={bestPayoutNumbers}
                    isTurboMode={isTurboMode}
                />
                <Ball rotation={ballRotation} show={showBall} isTurboMode={isTurboMode} />

                {/* TABLE BASE */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color={COLORS.felt} roughness={0.9} />
                </mesh>

                <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={0.1} />
            </Canvas>

            {/* FLOATING WINNER HUD */}
            {lastWin !== null && !showBall && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(10, 10, 10, 0.9)',
                    border: '2px solid #d4af37',
                    borderRadius: '50%',
                    width: '90px',
                    height: '90px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(212, 175, 55, 0.4), inset 0 0 15px rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 20,
                    pointerEvents: 'none',
                    animation: 'zoomInWinner 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <style>{`
                        @keyframes zoomInWinner {
                            from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        }
                    `}</style>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        fontFamily: "'Roboto Condensed', sans-serif",
                        color: lastWin === 0 ? '#4f4' : (REDS.includes(lastWin) ? '#ff4444' : '#fff'),
                        textShadow: '0 0 10px rgba(0,0,0,0.8)',
                        lineHeight: '1'
                    }}>
                        {lastWin}
                    </div>
                    <div style={{
                        fontSize: '0.55rem',
                        color: '#d4af37',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginTop: '2px'
                    }}>
                        GANADOR
                    </div>
                </div>
            )}

            <div style={{
                position: 'absolute', bottom: 10, right: 10,
                color: '#d4af37', fontFamily: 'Arial', fontSize: '10px', opacity: 0.5,
                pointerEvents: 'none'
            }}>
                3D ENGINE V2: COMPLETO
            </div>
        </div>
    )
}
