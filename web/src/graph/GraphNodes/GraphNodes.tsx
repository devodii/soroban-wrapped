import * as React from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { GraphStore } from '../GraphStore/GraphStore'
import { KINDS, nodeSize, type ColourBy, type Kind } from '../model'
import { baseColor, type Palette } from '../palette'

const BOUNDS_EVERY = 24
const DIM = 0.82
const GLOW = 2.3
const HOT_SCALE = 1.55
const NEIGHBOUR_SCALE = 1.18

function geometryFor(kind: Kind): THREE.BufferGeometry {
  switch (kind) {
    case 'proposal':
      return new THREE.IcosahedronGeometry(1, 0)
    case 'repo':
      return new THREE.SphereGeometry(1, 14, 10)
    case 'contract':
      return new THREE.BoxGeometry(1.5, 1.5, 1.5)
    case 'library':
      return new THREE.OctahedronGeometry(1.2, 0)
    case 'bug_class':
      return new THREE.TetrahedronGeometry(1.3, 0)
  }
}

interface Props {
  store: GraphStore
  palette: Palette
  colourBy: ColourBy
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}

function KindMesh({
  kind,
  ids,
  store,
  palette,
  colourBy,
  onHover,
  onSelect,
}: Props & { kind: Kind; ids: number[] }) {
  const mesh = React.useRef<THREE.InstancedMesh>(null)
  const geometry = React.useMemo(() => geometryFor(kind), [kind])
  const dummy = React.useMemo(() => new THREE.Object3D(), [])
  const color = React.useMemo(() => new THREE.Color(), [])
  const seen = React.useRef({ layout: -1, style: -1, paint: '', frame: 0 })

  useFrame(() => {
    const target = mesh.current
    if (!target) return
    const last = seen.current
    const paint = `${colourBy}:${palette.background.getHex()}`
    last.frame++
    if (
      last.layout === store.layoutVersion &&
      last.style === store.styleVersion &&
      last.paint === paint &&
      !store.moving
    ) {
      return
    }
    last.layout = store.layoutVersion
    last.style = store.styleVersion
    last.paint = paint
    const focusing = store.focusIndex() >= 0
    ids.forEach((index, slot) => {
      const node = store.nodes[index]!
      const [x, y, z] = store.position(index)
      const state = store.state[index]!
      const visible = store.visible[index] === 1
      const scale = nodeSize(node) * (state === 2 ? HOT_SCALE : state === 1 ? NEIGHBOUR_SCALE : 1)
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(visible ? scale : 0)
      dummy.updateMatrix()
      target.setMatrixAt(slot, dummy.matrix)
      color.copy(baseColor(node, palette, colourBy))
      if (state === 2) color.multiplyScalar(GLOW)
      else if (state === 0 && focusing) color.lerp(palette.background, DIM)
      target.setColorAt(slot, color)
    })
    target.instanceMatrix.needsUpdate = true
    if (target.instanceColor) target.instanceColor.needsUpdate = true
    if (last.frame % BOUNDS_EVERY === 0 || !store.moving) target.computeBoundingSphere()
  })

  const pick = (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    event.stopPropagation()
    const index = ids[event.instanceId ?? -1]
    return index === undefined ? null : store.nodes[index]!.id
  }

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, ids.length]}
      frustumCulled={false}
      onPointerMove={(event) => {
        const id = pick(event)
        onHover(id)
        document.body.style.cursor = id ? 'pointer' : ''
      }}
      onPointerOut={() => {
        onHover(null)
        document.body.style.cursor = ''
      }}
      onClick={(event) => {
        const id = pick(event)
        if (id) onSelect(id)
      }}
    >
      <meshStandardMaterial roughness={0.45} metalness={0.05} toneMapped={false} />
    </instancedMesh>
  )
}

export function GraphNodes(props: Props) {
  const nodes = React.useSyncExternalStore(props.store.subscribe, () => props.store.nodes)
  const groups = React.useMemo(
    () =>
      KINDS.map((kind) => ({
        kind,
        ids: nodes.flatMap((node, index) => (node.kind === kind ? [index] : [])),
      })).filter((group) => group.ids.length > 0),
    [nodes],
  )
  return (
    <>
      {groups.map((group) => (
        <KindMesh key={`${group.kind}:${group.ids.length}:${nodes.length}`} {...props} {...group} />
      ))}
    </>
  )
}
