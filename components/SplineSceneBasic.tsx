'use client'

import Spline from '@splinetool/react-spline'
 
export function SplineSceneBasic() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      position: 'relative',
      overflow: 'visible'
    }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spline 
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        />
      </div>
    </div>
  )
}
