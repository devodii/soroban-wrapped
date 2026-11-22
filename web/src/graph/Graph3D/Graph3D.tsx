import * as React from 'react'
import { useInView } from 'motion/react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { CameraRig, type RigApi } from '../CameraRig/CameraRig'
import { GraphEdges } from '../GraphEdges/GraphEdges'
import { GraphLabels } from '../GraphLabels/GraphLabels'
import { GraphNodes } from '../GraphNodes/GraphNodes'
import type { GraphStore } from '../GraphStore/GraphStore'
import { NetworkRings } from '../NetworkRings/NetworkRings'
import type { ColourBy } from '../model'
import { usePalette } from '../palette'
import './Graph3D.scss'

const BLOOM_THRESHOLD = 1
const FOG_NEAR = 360
const FOG_FAR = 1700

function Stepper({ store }: { store: GraphStore }) {
  useFrame((_, dt) => {
    store.step(Math.min(dt, 0.05))
  }, -1)
  return null
}

export function Graph3D({
  store,
  colourBy,
  glow,
  selectedId,
  onHover,
  onSelect,
  onRig,
}: {
  store: GraphStore
  colourBy: ColourBy
  glow: boolean
  selectedId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
  onRig: (api: RigApi) => void
}) {
  const palette = usePalette()
  const wrapper = React.useRef<HTMLDivElement>(null)
  const visible = useInView(wrapper)
  const background = `#${palette.background.getHexString()}`
  return (
    <div ref={wrapper} className="sw-graph3d-frame">
      <Canvas
        className="sw-graph3d"
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 320], fov: 50, near: 0.5, far: 4000 }}
        onPointerMissed={() => onSelect(null)}
      >
        <color attach="background" args={[background]} />
        <fog attach="fog" args={[background, FOG_NEAR, FOG_FAR]} />
        <ambientLight intensity={1.1} />
        <directionalLight position={[120, 200, 160]} intensity={1.6} />
        <Stepper store={store} />
        <GraphEdges store={store} palette={palette} />
        <GraphNodes
          store={store}
          palette={palette}
          colourBy={colourBy}
          onHover={onHover}
          onSelect={onSelect}
        />
        <NetworkRings store={store} palette={palette} />
        <GraphLabels store={store} />
        <CameraRig store={store} selectedId={selectedId} onReady={onRig} />
        {glow && (
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={0.9}
              luminanceThreshold={BLOOM_THRESHOLD}
              luminanceSmoothing={0.15}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
