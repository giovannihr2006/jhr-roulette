import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// --- CONSTANTS & PALETTE (From User Spec) ---
const COLORS = {
    mahogany: '#7B3F32', // Deep Reddish Brown
    maple: '#E5C29B', // Cream/Light Wood
    gold: '#D4AF37', // Polished Brass
    silver: '#F0F0F0', // Chrome
    red: '#D32F2F',
    black: '#1A1A1A',
    green: '#008f39',
    felt: '#053010'
}

// EUROPEAN SEQUENCE (Single Zero)
const NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

function ScientificWheel({ rotation }) {
    // --- HIGH RES TEXTURE ---
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        const size = 2048
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        const cx = size / 2
        const cy = size / 2

        ctx.clearRect(0, 0, size, size)

        const outerR = size / 2
        const innerR = size * 0.6 // Hole for dome
        const angleStep = (Math.PI * 2) / 37

        // 1. POCKET SECTORS (Background Colors)
        NUMBERS.forEach((num, i) => {
            const startAngle = (i * angleStep) - (Math.PI / 2) - (angleStep / 2)
            const endAngle = startAngle + angleStep

            ctx.beginPath()
            ctx.moveTo(cx, cy)
            ctx.arc(cx, cy, outerR, startAngle, endAngle)
            ctx.lineTo(cx, cy)

            if (num === 0) ctx.fillStyle = COLORS.green
            else if (REDS.includes(num)) ctx.fillStyle = COLORS.red
            else ctx.fillStyle = COLORS.black

            ctx.fill()
        })

        // 2. INNER MASK (Clean cut for dome)
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalCompositeOperation = 'source-over'

        // 3. NUMBERS (White Sans-Serif, Medium Stroke)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 130px Arial'
        ctx.fillStyle = '#FFFFFF'

        const textR = size * 0.85 // Near outer edge
        NUMBERS.forEach((num, i) => {
            const angle = (i * angleStep) - (Math.PI / 2)
            const tx = cx + Math.cos(angle) * textR
            const ty = cy + Math.sin(angle) * textR

            ctx.save()
            ctx.translate(tx, ty)
            ctx.rotate(angle + Math.PI / 2)
            ctx.fillText(num.toString(), 0, 0)
            ctx.restore()
        })

        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        return tex
    }, [])

    return (
        <group rotation={[0, -rotation * (Math.PI / 180), 0]}>

            {/* === ZONE 1: OUTER ARMOR (Mahogany Bowl) === */}
            {/* Toroid-like profile */}
            <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[5.8, 5.6, 1.2, 80]} />
                <meshStandardMaterial color={COLORS.mahogany} roughness={0.05} metalness={0.1} /> {/* High gloss */}
            </mesh>
            {/* Top Rounded Lip */}
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[5.65, 0.15, 16, 80]} />
                <meshStandardMaterial color={COLORS.mahogany} roughness={0.05} />
            </mesh>
            {/* Base Gold Molding */}
            <mesh position={[0, -0.95, 0]}>
                <cylinderGeometry args={[5.62, 5.62, 0.1, 80]} />
                <meshStandardMaterial color={COLORS.gold} metalness={1} roughness={0.2} />
            </mesh>


            {/* === ZONE 2: APRON (Maple Track) - 15-20 Deg Slope === */}
            {/* Cone from R=5.5 down to R=4.0 */}
            <mesh position={[0, 0.1, 0]}>
                {/* Height 0.6 to create steep slope */}
                <cylinderGeometry args={[5.5, 4.0, 0.6, 80, 1, true]} />
                <meshStandardMaterial color={COLORS.maple} roughness={0.3} side={THREE.DoubleSide} />
            </mesh>

            {/* DEFLECTORS (8 Prismatic Diamonds) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const isRadial = i % 2 === 0 // 4 Radial, 4 Tangential
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle * Math.PI / 180) * 4.8, 0.3, Math.sin(angle * Math.PI / 180) * 4.8]}
                        rotation={[0.3, (angle + (isRadial ? 0 : 90)) * Math.PI / 180, 0]} // Tilted on slope
                    >
                        {/* Prismatic shape using simple box for now, scaled sharply */}
                        <boxGeometry args={[0.2, 0.08, 0.4]} />
                        <meshStandardMaterial color={COLORS.silver} metalness={1} roughness={0} />
                    </mesh>
                )
            })}


            {/* === ZONE 3: POCKETS (The Rotor) - 5-8 Deg Slope (Shallow) === */}
            {/* Sits below apron. Transition R=4.0 down to R=2.5. Gentle slope. */}
            <group position={[0, -0.3, 0]}>

                {/* The Step/gap is simulated by position Y drop */}

                {/* Number Ring (Shallow Cone) */}
                <mesh position={[0, -0.1, 0]}>
                    <cylinderGeometry args={[4.0, 2.8, 0.4, 80, 1, true]} />
                    {/* BasicMaterial for Texture Visibility as requested before */}
                    <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
                </mesh>

                {/* PHYSICAL SEPARATORS (Wedge Shape) */}
                {NUMBERS.map((_, i) => {
                    const angle = (i * ((Math.PI * 2) / 37)) - (Math.PI / 2) - (((Math.PI * 2) / 37) / 2)
                    return (
                        <mesh key={i} position={[Math.cos(angle) * 3.4, -0.05, Math.sin(angle) * 3.4]} rotation={[0.1, -angle, 0]}>
                            {/* Tapered wedge effect */}
                            <boxGeometry args={[1.2, 0.08, 0.05]} />
                            <meshStandardMaterial color={COLORS.silver} metalness={0.9} roughness={0.2} />
                        </mesh>
                    )
                })}


                {/* === ZONE 4: CENTRAL DOME (Convex Parabolic) === */}
                <group position={[0, -0.4, 0]}>

                    {/* The Dome Geometry */}
                    <mesh position={[0, 0.3, 0]}>
                        <sphereGeometry args={[2.8, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color={COLORS.gold} metalness={1} roughness={0.05} />
                    </mesh>

                    {/* TURRET (Spindle) - Silver Arms on Gold Dome */}
                    <group position={[0, 1.2, 0]}>
                        {/* Central Button */}
                        <mesh position={[0, 0.3, 0]}>
                            <cylinderGeometry args={[0.3, 0.3, 0.5, 32]} />
                            <meshStandardMaterial color={COLORS.silver} metalness={1} />
                        </mesh>

                        {/* 4 Arms */}
                        {[0, 90, 180, 270].map((angle, i) => (
                            <group key={i} rotation={[0, angle * Math.PI / 180, 0]}>
                                {/* Arm Bar */}
                                <mesh position={[0, 0.1, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
                                    <cylinderGeometry args={[0.12, 0.08, 1.6, 16]} />
                                    <meshStandardMaterial color={COLORS.silver} metalness={1} roughness={0.1} />
                                </mesh>
                                {/* Sphere Knob */}
                                <mesh position={[0, 0.1, 1.9]}>
                                    <sphereGeometry args={[0.25, 32, 32]} />
                                    <meshStandardMaterial color={COLORS.silver} metalness={1} roughness={0.05} />
                                </mesh>
                            </group>
                        ))}
                    </group>
                </group>

            </group>

        </group>
    )
}

function Ball({ rotation, show }) {
    if (!show) return null

    // TARGET: NUMBER 32 (Red)
    // 32 is roughly at angle -90 + step (it's the second number in sequence 0, 32...)
    // But rotation prop handles animation. We render it static if needed or animated.
    // User asked for static ball in description but this is a game. We maintain game logic.
    // We position it on the "Pockets" slope.

    const radius = 3.4
    const angleRad = (rotation - 90) * (Math.PI / 180)
    const x = Math.cos(angleRad) * radius
    const z = Math.sin(angleRad) * radius

    return (
        <mesh position={[x, -0.45, z]}>
            <sphereGeometry args={[0.11, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>
    )
}

export const Roulette3D = (props) => {
    return (
        <div style={{ width: props.size || 600, height: props.size || 600, background: 'transparent' }}>
            {/* ISOMETRIC-LIKE CAMERA (45 degrees) */}
            <Canvas camera={{ position: [0, 18, 18], fov: 30 }} gl={{ alpha: true }} shadows>

                {/* STUDIO LIGHTING SETUP (Softbox Top-Left) */}
                <ambientLight intensity={0.8} />

                {/* Key Light (Softbox approx) */}
                <spotLight position={[-10, 20, 10]} angle={0.5} penumbra={1} intensity={1200} castShadow />

                {/* Fill Light (Warmth) */}
                <pointLight position={[10, 5, -10]} intensity={300} color="#ffd700" />

                <ScientificWheel rotation={props.wheelRotation} />
                <Ball rotation={props.ballRotation} show={props.showBall} />

                {/* TABLE BASE */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color={COLORS.felt} roughness={0.9} />
                </mesh>

                <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={0.1} />
            </Canvas>
            <div style={{
                position: 'absolute', bottom: 10, right: 10,
                color: '#d4af37', fontFamily: 'Arial', fontSize: '10px', opacity: 0.5
            }}>
                3D PHASE I: SCIENTIFIC REBUILD
            </div>
        </div>
    )
}
