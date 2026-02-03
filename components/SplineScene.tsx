'use client'

import React from 'react'

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <iframe
        src={scene}
        width="100%"
        height="100%"
        style={{
          border: 'none',
          borderRadius: 'inherit',
          display: 'block'
        }}
        allowFullScreen
        loading="lazy"
        title="Spline 3D Scene"
      />
    </div>
  )
}
