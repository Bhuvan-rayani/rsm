'use client'

import { Suspense, lazy } from 'react'

// Lazy load Spline component
const Spline = lazy(() => 
  import('@splinetool/react-spline').catch(() => {
    // Fallback if package fails to load
    return {
      default: ({ scene, className }: any) => (
        <div className={className} style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '18px'
        }}>
          3D Scene Loading...
        </div>
      )
    }
  })
)

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🚀</div>
            <span>Loading 3D Scene...</span>
          </div>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
      />
    </Suspense>
  )
}
