import * as React from 'react'
import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { GraphStore } from '../GraphStore/GraphStore'

const FLY_MIN = 90
const FLY_MAX = 320
const FIT_MARGIN = 1.25

export interface RigApi {
  fit: () => void
}

export function CameraRig({
  store,
  selectedId,
  onReady,
}: {
  store: GraphStore
  selectedId: string | null
  onReady: (api: RigApi) => void
}) {
  const controls = React.useRef<React.ComponentRef<typeof CameraControls>>(null)
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const scratch = React.useMemo(() => new THREE.Vector3(), [])
  const aim = React.useMemo(() => new THREE.Vector3(), [])

  const fit = React.useCallback(() => {
    const rig = controls.current
    if (!rig) return
    const { center, radius } = store.bounds()
    const distance = (radius * FIT_MARGIN) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    rig.setLookAt(center[0], center[1], center[2] + distance, center[0], center[1], center[2], true)
  }, [store, camera])

  React.useEffect(() => {
    onReady({ fit })
  }, [fit, onReady])

  React.useEffect(() => {
    let fitted = false
    return store.subscribe(() => {
      if (store.settled && !fitted && store.selected < 0) {
        fitted = true
        fit()
      }
      if (!store.settled) fitted = false
    })
  }, [store, fit])

  React.useEffect(() => {
    const rig = controls.current
    const index = selectedId ? (store.index.get(selectedId) ?? -1) : -1
    if (!rig || index < 0) return
    const x = store.target[index * 3]!
    const y = store.target[index * 3 + 1]!
    const z = store.target[index * 3 + 2]!
    rig.getTarget(aim)
    scratch.copy(camera.position).sub(aim)
    const distance = THREE.MathUtils.clamp(scratch.length() * 0.7, FLY_MIN, FLY_MAX)
    scratch.setLength(distance)
    rig.setLookAt(x + scratch.x, y + scratch.y, z + scratch.z, x, y, z, true)
  }, [selectedId, store, camera, aim, scratch])

  useFrame(() => {
    const rig = controls.current
    if (!rig) return
    rig.getTarget(aim)
    store.cameraTarget = [aim.x, aim.y, aim.z]
  })

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={8}
      maxDistance={1400}
      smoothTime={0.22}
      draggingSmoothTime={0.12}
    />
  )
}
