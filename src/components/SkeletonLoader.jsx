/**
 * SkeletonLoader.jsx
 * Skeleton loading placeholders for initial load
 */
import React from 'react'
import PropTypes from 'prop-types'

const shimmerStyle = {
    background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
}

/**
 * Basic skeleton box
 */
export const SkeletonBox = ({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) => (
    <div
        style={{
            width,
            height,
            borderRadius,
            ...shimmerStyle,
            ...style
        }}
        aria-hidden="true"
    />
)

SkeletonBox.propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    borderRadius: PropTypes.string,
    style: PropTypes.object
}

/**
 * Skeleton circle (for wheel, chips, etc.)
 */
export const SkeletonCircle = ({ size = 100, style = {} }) => (
    <div
        style={{
            width: size,
            height: size,
            borderRadius: '50%',
            ...shimmerStyle,
            ...style
        }}
        aria-hidden="true"
    />
)

SkeletonCircle.propTypes = {
    size: PropTypes.number,
    style: PropTypes.object
}

/**
 * Full page skeleton for initial load
 */
export const SkeletonPage = () => (
    <div
        style={{
            width: '100vw',
            height: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            padding: '20px',
            gap: '20px'
        }}
        role="status"
        aria-label="Cargando aplicación"
    >
        {/* Left side - Wheel */}
        <div style={{ flex: '0 0 auto' }}>
            <SkeletonCircle size={500} />
        </div>

        {/* Center - Betting board */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SkeletonBox height="60px" />
            <SkeletonBox height="300px" borderRadius="8px" />
            <div style={{ display: 'flex', gap: '10px' }}>
                <SkeletonBox width="100px" height="40px" />
                <SkeletonBox width="100px" height="40px" />
                <SkeletonBox width="100px" height="40px" />
            </div>
        </div>

        {/* Right side - Stats */}
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SkeletonBox height="150px" borderRadius="8px" />
            <SkeletonBox height="200px" borderRadius="8px" />
            <SkeletonBox height="100px" borderRadius="8px" />
        </div>
    </div>
)

/**
 * CSS for shimmer animation (inject in index.css or via style tag)
 */
export const skeletonStyles = `
@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
`

export default {
    SkeletonBox,
    SkeletonCircle,
    SkeletonPage
}
