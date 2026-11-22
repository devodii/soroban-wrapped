import * as React from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GraphStore } from '../GraphStore/GraphStore'
import type { Palette } from '../palette'

const BASE_ALPHA: Record<string, number> = { calls: 0.38, deploys: 0.2, hand_rolls: 0.1 }
const DEFAULT_ALPHA = 0.16
const DIMMED_ALPHA = 0.025
const HOT_ALPHA = 0.95

export function GraphEdges({ store, palette }: { store: GraphStore; palette: Palette }) {
  const edges = React.useSyncExternalStore(store.subscribe, () => store.edges)
  const ref = React.useRef<THREE.LineSegments>(null)
  const seen = React.useRef({ layout: -1, style: -1, theme: -1 })

  const geometry = React.useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(edges.length * 8), 4))
    return g
  }, [edges])

  useFrame(() => {
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute
    const colors = geometry.getAttribute('color') as THREE.BufferAttribute
    const last = seen.current
    const theme = palette.background.getHex()
    if (
      last.layout === store.layoutVersion &&
      last.style === store.styleVersion &&
      last.theme === theme &&
      !store.moving
    )
      return
    last.layout = store.layoutVersion
    last.style = store.styleVersion
    last.theme = theme
    const focus = store.focusIndex()
    const selected = store.selected
    const net = palette.network
    for (let e = 0; e < edges.length; e++) {
      const a = store.src[e]!
      const b = store.dst[e]!
      const sa = store.shown
      positions.setXYZ(e * 2, sa[a * 3]!, sa[a * 3 + 1]!, sa[a * 3 + 2]!)
      positions.setXYZ(e * 2 + 1, sa[b * 3]!, sa[b * 3 + 1]!, sa[b * 3 + 2]!)
      const shown = store.visible[a] === 1 && store.visible[b] === 1
      const touchesFocus = a === focus || b === focus || a === selected || b === selected
      let alpha = BASE_ALPHA[edges[e]!.kind] ?? DEFAULT_ALPHA
      if (focus >= 0 || selected >= 0) alpha = touchesFocus ? HOT_ALPHA : DIMMED_ALPHA
      if (!shown) alpha = 0
      const c =
        touchesFocus && alpha > 0
          ? palette.primary
          : edges[e]!.kind === 'calls'
            ? net.mainnet!
            : palette.foreground
      colors.setXYZW(e * 2, c.r, c.g, c.b, alpha)
      colors.setXYZW(e * 2 + 1, c.r, c.g, c.b, alpha)
    }
    positions.needsUpdate = true
    colors.needsUpdate = true
    geometry.computeBoundingSphere()
  })

  return (
    <lineSegments ref={ref} geometry={geometry} frustumCulled={false} raycast={() => null}>
      <lineBasicMaterial vertexColors transparent depthWrite={false} toneMapped={false} />
    </lineSegments>
  )
}
