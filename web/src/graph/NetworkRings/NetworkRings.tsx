import * as React from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GraphStore } from '../GraphStore/GraphStore'
import { nodeSize } from '../model'
import type { Palette } from '../palette'

const INNER = 1.35
const OUTER = 1.65

export function NetworkRings({ store, palette }: { store: GraphStore; palette: Palette }) {
  const nodes = React.useSyncExternalStore(store.subscribe, () => store.nodes)
  const ids = React.useMemo(
    () => nodes.flatMap((n, i) => (n.network === 'mainnet' || n.network === 'both' ? [i] : [])),
    [nodes],
  )
  const mesh = React.useRef<THREE.InstancedMesh>(null)
  const dummy = React.useMemo(() => new THREE.Object3D(), [])
  const geometry = React.useMemo(() => new THREE.RingGeometry(INNER, OUTER, 32), [])
  const color = React.useMemo(() => new THREE.Color(), [])
  const last = React.useRef({ layout: -1, style: -1, quat: new THREE.Quaternion() })

  useFrame(({ camera }) => {
    const target = mesh.current
    if (!target) return
    const seen = last.current
    const turned = !seen.quat.equals(camera.quaternion)
    if (
      !turned &&
      seen.layout === store.layoutVersion &&
      seen.style === store.styleVersion &&
      !store.moving
    )
      return
    seen.layout = store.layoutVersion
    seen.style = store.styleVersion
    seen.quat.copy(camera.quaternion)
    const focusing = store.focusIndex() >= 0
    ids.forEach((index, slot) => {
      const [x, y, z] = store.position(index)
      const state = store.state[index]!
      dummy.position.set(x, y, z)
      dummy.quaternion.copy(camera.quaternion)
      dummy.scale.setScalar(store.visible[index] ? nodeSize(store.nodes[index]!) : 0)
      dummy.updateMatrix()
      target.setMatrixAt(slot, dummy.matrix)
      color.copy(palette.network.mainnet!)
      if (focusing && state === 0) color.lerp(palette.background, 0.85)
      target.setColorAt(slot, color)
    })
    target.instanceMatrix.needsUpdate = true
    if (target.instanceColor) target.instanceColor.needsUpdate = true
  })

  if (!ids.length) return null
  return (
    <instancedMesh
      key={ids.length}
      ref={mesh}
      args={[geometry, undefined, ids.length]}
      frustumCulled={false}
      raycast={() => null}
    >
      <meshBasicMaterial
        side={THREE.DoubleSide}
        transparent
        opacity={0.75}
        toneMapped={false}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
