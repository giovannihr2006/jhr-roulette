import React, { useState, useEffect, useRef } from 'react'

export const Draggable = ({ children, id, initialPos = { x: 0, y: 0 }, isEnabled = false, onDragEnd, style = {}, className = '', index = 0, totalCount = 0 }) => {
    // Force auto sizing for board and controls elements (they should always fit their content)
    const forceAutoSize = id === 'board' || id === 'controls';

    // Determine initial state with fallbacks
    const [pos, setPos] = useState({
        x: initialPos.x || 0,
        y: initialPos.y || 0,
        w: forceAutoSize ? 'auto' : (initialPos.w || 'auto'),
        h: forceAutoSize ? 'auto' : (initialPos.h || 'auto'),
        scale: initialPos.scale || 1 // ZOOM/SCALE value
    })

    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [rel, setRel] = useState(null) // Relative position cursor-to-element
    const nodeRef = useRef(null)

    // Sync props
    useEffect(() => {
        setPos(prev => ({
            ...prev,
            x: initialPos.x || prev.x || 0,
            y: initialPos.y || prev.y || 0,
            w: initialPos.w || prev.w || 'auto',
            h: initialPos.h || prev.h || 'auto',
            scale: initialPos.scale || prev.scale || 1
        }))
    }, [initialPos])

    useEffect(() => {
        if (!isEnabled) return

        const onMouseMove = (e) => {
            if (isDragging) {
                let newX = e.clientX - rel.x
                let newY = e.clientY - rel.y

                // BOUNDARY CHECKS
                const el = nodeRef.current
                if (el) {
                    const maxX = window.innerWidth - el.offsetWidth
                    const maxY = window.innerHeight - el.offsetHeight
                    newX = Math.max(0, Math.min(newX, maxX))
                    newY = Math.max(0, Math.min(newY, maxY))
                }

                setPos(prev => ({ ...prev, x: newX, y: newY }))
                e.preventDefault()
            } else if (isResizing) {
                // Calculate new size based on mouse position relative to element top-left
                // Top-left is pos.x, pos.y
                const newW = Math.max(50, e.clientX - pos.x)
                const newH = Math.max(50, e.clientY - pos.y)
                setPos(prev => ({ ...prev, w: newW, h: newH }))
                e.preventDefault()
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

        // Interactive check
        const target = e.target
        if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.closest('button')) {
            return
        }

        const rect = nodeRef.current.getBoundingClientRect()
        setRel({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })

        // Better initial drag offset logic
        setRel({
            x: e.clientX - pos.x,
            y: e.clientY - pos.y
        })

        setIsDragging(true)
        e.stopPropagation()
    }

    const onResizeStart = (e) => {
        if (!isEnabled) return
        e.stopPropagation() // Prevent drag start
        setIsResizing(true)
    }

    // ZOOM HANDLERS
    const handleZoomIn = (e) => {
        e.stopPropagation()
        const newScale = Math.min(3, pos.scale + 0.01) // +1%
        setPos(prev => ({ ...prev, scale: newScale }))
        if (onDragEnd) onDragEnd(id, { ...pos, scale: newScale })
    }

    const handleZoomOut = (e) => {
        e.stopPropagation()
        const newScale = Math.max(0.1, pos.scale - 0.01) // -1%
        setPos(prev => ({ ...prev, scale: newScale }))
        if (onDragEnd) onDragEnd(id, { ...pos, scale: newScale })
    }

    const handleZoomInput = (e) => {
        e.stopPropagation()
        let val = parseInt(e.target.value, 10)
        if (isNaN(val)) val = 100
        val = Math.max(10, Math.min(300, val)) // 10% to 300%
        const newScale = val / 100
        setPos(prev => ({ ...prev, scale: newScale }))
        if (onDragEnd) onDragEnd(id, { ...pos, scale: newScale })
    }

    return (
        <div
            ref={nodeRef}
            onMouseDown={onMouseDown}
            className={className}
            style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: pos.w === 'auto' ? 'fit-content' : pos.w,
                height: pos.h === 'auto' ? 'fit-content' : pos.h,
                display: 'inline-block',
                cursor: isEnabled ? (isDragging ? 'grabbing' : 'grab') : 'default',
                zIndex: (isDragging || isResizing) ? 2000 : 100,
                border: isEnabled ? '2px dashed #d4af37' : 'none',
                backgroundColor: (pos.w !== 'auto' || pos.h !== 'auto') ? '#000' : (isEnabled ? 'rgba(0,0,0,0.2)' : 'transparent'),
                ...style
            }}
        >
            {/* ID LABEL + ZOOM CONTROLS */}
            {isEnabled && (
                <div style={{
                    position: 'absolute', top: -30, left: 0,
                    display: 'flex', alignItems: 'center', gap: '3px',
                    background: 'rgba(0,0,0,0.9)', padding: '3px 8px',
                    borderRadius: '4px', zIndex: 6000
                }}>
                    {/* ID Label */}
                    <span style={{
                        background: '#d4af37', color: 'black', padding: '2px 5px',
                        fontSize: '10px', fontWeight: 'bold', borderRadius: '4px',
                        whiteSpace: 'nowrap', marginRight: '5px'
                    }}>
                        <span style={{ color: '#000', marginRight: '3px', fontSize: '11px' }}>{index}/{totalCount}</span>
                        {id}
                    </span>

                    {/* Zoom Out (-1%) */}
                    <button
                        onClick={handleZoomOut}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                            width: '20px', height: '20px',
                            background: '#333', border: '1px solid #d4af37',
                            color: '#d4af37', fontSize: '12px', fontWeight: 'bold',
                            borderRadius: '3px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Reducir zoom (-1%)"
                    >−</button>

                    {/* Editable Zoom Input */}
                    <input
                        type="number"
                        value={Math.round(pos.scale * 100)}
                        onChange={handleZoomInput}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '45px', height: '20px',
                            background: '#222', border: '1px solid #d4af37',
                            color: '#d4af37', fontSize: '11px', fontWeight: 'bold',
                            borderRadius: '3px', textAlign: 'center',
                            outline: 'none'
                        }}
                        title="Ingresa el porcentaje de zoom (10-300)"
                        min="10"
                        max="300"
                    />
                    <span style={{ fontSize: '10px', color: '#d4af37' }}>%</span>

                    {/* Zoom In (+1%) */}
                    <button
                        onClick={handleZoomIn}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                            width: '20px', height: '20px',
                            background: '#333', border: '1px solid #d4af37',
                            color: '#d4af37', fontSize: '12px', fontWeight: 'bold',
                            borderRadius: '3px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Aumentar zoom (+1%)"
                    >+</button>
                </div>
            )}

            {/* CONTENT with SCALE TRANSFORM */}
            <div style={{
                width: '100%',
                height: '100%',
                overflow: 'visible',
                position: 'relative',
                transform: `scale(${pos.scale})`,
                transformOrigin: 'top left'
            }}>
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
