import React, { useState, useEffect, useRef } from 'react'

export const Draggable = ({ children, id, initialPos = { x: 0, y: 0 }, isEnabled = false, onDragEnd, style = {} }) => {
    const [pos, setPos] = useState(initialPos)
    const [isDragging, setIsDragging] = useState(false)
    const [rel, setRel] = useState(null) // Relative position cursor-to-element
    const nodeRef = useRef(null)

    useEffect(() => {
        if (!isEnabled) return

        const onMouseMove = (e) => {
            if (!isDragging) return
            const newX = e.clientX - rel.x
            const newY = e.clientY - rel.y
            setPos({ x: newX, y: newY })
            e.preventDefault() // Prevent selection
        }

        const onMouseUp = () => {
            if (isDragging) {
                setIsDragging(false)
                if (onDragEnd) onDragEnd(id, pos)
            }
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)

        return () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
    }, [isDragging, rel, isEnabled, id, pos, onDragEnd])

    const onMouseDown = (e) => {
        if (!isEnabled || e.button !== 0) return // Left click only
        const rect = nodeRef.current.getBoundingClientRect()
        setRel({
            x: e.clientX - rect.left, // Offset inside element
            y: e.clientY - rect.top
        })


        // We need to calculate the initial offset correctly if it's the first drag
        // But simplifying: just take the mouse offset relative to the div top/left
        // Actually, cleaner logic:
        // setRel({ x: e.clientX - pos.x, y: e.clientY - pos.y }) 
        // Logic above assumes pos is screen coords, but pos is absolute.

        // Let's use the mouse offset from the element corner
        setRel({
            x: e.clientX - pos.x,
            y: e.clientY - pos.y
        })

        setIsDragging(true)
        e.stopPropagation()
    }

    return (
        <div
            ref={nodeRef}
            onMouseDown={onMouseDown}
            style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                cursor: isEnabled ? (isDragging ? 'grabbing' : 'grab') : 'default',
                zIndex: isDragging ? 2000 : 100, // Pop on top when dragging
                border: isEnabled ? '2px dashed #d4af37' : 'none', // Visual Guide
                background: isEnabled ? 'rgba(0,0,0,0.2)' : 'transparent',
                ...style // Allow overrides
            }}
        >
            {/* DRAG HANDLE LABEL (Only in Edit Mode) */}
            {isEnabled && (
                <div style={{
                    position: 'absolute', top: -25, left: 0,
                    background: '#d4af37', color: 'black', padding: '2px 5px',
                    fontSize: '10px', fontWeight: 'bold', borderRadius: '4px'
                }}>
                    {id}
                </div>
            )}
            {children}
        </div>
    )
}
