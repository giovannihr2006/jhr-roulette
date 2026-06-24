import React, { useState, useEffect, useRef } from 'react'
import { Z_LAYERS } from '../config/Theme'

export const Draggable = ({ children, id, initialPos = { x: 0, y: 0 }, isEnabled = false, onDragEnd, onDrag, style = {}, className = '', overflow = 'hidden' }) => {
    // Determine initial state with fallbacks
    const [pos, setPos] = useState({
        x: initialPos.x || 0,
        y: initialPos.y || 0,
        w: initialPos.w || 'auto',
        h: initialPos.h || 'auto',
        scale: initialPos.scale || 1
    })

    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [rel, setRel] = useState(null)
    const nodeRef = useRef(null)

    // FORENSIC FIX: Prevent "Snap Back" / Vertical Lock
    // Only update position from props if NOT dragging.
    // This prevents parent re-renders (triggered by clock, state, etc.) from resetting the drag progress.
    useEffect(() => {
        if (isDragging) return;

        setPos(prev => ({
            ...prev,
            x: initialPos.x !== undefined ? initialPos.x : prev.x,
            y: initialPos.y !== undefined ? initialPos.y : prev.y,
            w: initialPos.w || prev.w || 'auto',
            h: initialPos.h || prev.h || 'auto',
            scale: initialPos.scale || prev.scale || 1
        }))
    }, [initialPos, isDragging])

    useEffect(() => {
        if (!isEnabled) return

        const onMouseMove = (e) => {
            if (isDragging) {
                const newX = e.clientX - rel.x
                const newY = e.clientY - rel.y
                setPos(prev => {
                    const nextPos = { ...prev, x: newX, y: newY }
                    if (onDrag) onDrag(id, nextPos) // EMIT REAL-TIME POSITION
                    return nextPos
                })
                e.preventDefault()
                e.stopPropagation()
            } else if (isResizing) {
                const newW = Math.max(50, e.clientX - pos.x)
                const newH = Math.max(50, e.clientY - pos.y)
                setPos(prev => ({ ...prev, w: newW, h: newH }))
                e.preventDefault()
                e.stopPropagation()
            }
        }

        const onMouseUp = () => {
            if (isDragging || isResizing) {
                setIsDragging(false)
                setIsResizing(false)
                if (onDragEnd) onDragEnd(id, pos)
            }
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)

        return () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
    }, [isDragging, isResizing, rel, isEnabled, id, pos, onDragEnd])

    const onMouseDown = (e) => {
        if (!isEnabled || e.button !== 0) return
        const target = e.target
        // Prevent drag on interactive elements
        if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.closest('button')) {
            return
        }

        const rect = nodeRef.current.getBoundingClientRect()
        setRel({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })

        setIsDragging(true)
        e.stopPropagation()
    }

    const onResizeStart = (e) => {
        if (!isEnabled) return
        e.stopPropagation()
        setIsResizing(true)
    }

    return (
        <div
            id={id}
            ref={nodeRef}
            onMouseDown={onMouseDown}
            className={className}
            style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: typeof pos.w === 'number' ? `${pos.w}px` : pos.w,
                height: typeof pos.h === 'number' ? `${pos.h}px` : pos.h,
                cursor: isEnabled ? (isDragging ? 'grabbing' : 'grab') : 'default',
                zIndex: (isDragging || isResizing) ? 2000000 : Z_LAYERS?.DRAGGABLE || 100,
                border: isEnabled ? '2px dashed #d4af37' : 'none',
                backgroundColor: 'transparent',
                touchAction: 'none',
                userSelect: 'none', // NEW: Prevent text selection causing drag fail
                transition: isDragging ? 'none' : 'all 0.1s ease-out',
                transform: `scale(${pos.scale || 1})`,
                transformOrigin: 'top left',
                ...style // Allow style overrides
            }}
        >
            {/* DRAG SHIELD - Prevents child interaction during drag */}
            {isDragging && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 1000000,
                    cursor: 'grabbing',
                    backgroundColor: 'transparent'
                }} />
            )}

            {/* ID LABEL (Visible only in Edit Mode) */}
            {isEnabled && id !== 'board' && (
                <div style={{
                    position: 'absolute', top: 3, left: 3,
                    background: '#d4af37', color: 'black', padding: '2px 5px',
                    fontSize: '10px', fontWeight: 'bold', borderRadius: '4px',
                    whiteSpace: 'nowrap', pointerEvents: 'none',
                    zIndex: 999999 // Ensure visibility
                }}>
                    {id}
                </div>
            )}

            {/* CONTENT */}
            <div style={{ width: '100%', height: '100%', overflow: overflow }}>
                {children}
            </div>

            {/* RESIZE HANDLE */}
            {isEnabled && (
                <div
                    onMouseDown={onResizeStart}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '20px',
                        height: '20px',
                        cursor: 'se-resize',
                        background: 'linear-gradient(135deg, transparent 50%, #d4af37 50%)',
                        zIndex: 5000
                    }}
                />
            )}
        </div>
    )
}
