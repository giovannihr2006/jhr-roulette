import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'

const WinEffects = ({ lastWin, lastWinAmount }) => {

    useEffect(() => {
        if (lastWinAmount > 0) {
            // 1. Particle Explosion (Gold & Red Theme)
            const scalar = 2
            const coin = confetti.shapeFromText({ text: '💰', scalar })

            const defaults = {
                origin: { y: 0.7 },
                spread: 360,
                ticks: 100,
                gravity: 0.5,
                decay: 0.94,
                startVelocity: 30,
                colors: ['#FFD700', '#FF0000', '#FFFFFF', '#000000']
            }

            // Fire multiple bursts
            const shoot = () => {
                confetti({
                    ...defaults,
                    particleCount: 50,
                    scalar: 1.2,
                    shapes: ['circle', 'square']
                })

                confetti({
                    ...defaults,
                    particleCount: 20,
                    scalar: 2,
                    shapes: [coin]
                })
            }

            shoot()
            setTimeout(shoot, 100)
            setTimeout(shoot, 200)

            // Huge win? More visuals
            if (lastWinAmount > 1000) {
                setTimeout(() => {
                    confetti({
                        particleCount: 200,
                        spread: 100,
                        origin: { y: 0.6 }
                    })
                }, 500)
            }
        }
    }, [lastWinAmount, lastWin]) // Trigger when these change

    return null // This component renders nothing visual itself, just effects
}

export default WinEffects
