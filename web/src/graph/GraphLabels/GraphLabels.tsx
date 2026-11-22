import * as React from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GraphStore } from '../GraphStore/GraphStore'
import { cx } from '../../ui/cx'
import './GraphLabels.scss'

const NEIGHBOUR_LABELS = 9
const DEFAULT_LABELS = 5

const SLOTS = 14

function Label({
  store,
  pick,
}: {
  store: GraphStore
  pick: { index: number; hot: boolean } | null
}) {
  const group = React.useRef<THREE.Group>(null)
  const index = pick?.index ?? -1
  useFrame(() => {
    const g = group.current
    if (!g) return
    if (index < 0) {
      g.visible = false
      return
    }
    const [x, y, z] = store.position(index)
    g.position.set(x, y, z)
    g.visible = store.visible[index] === 1
  })
  const node = index >= 0 ? store.nodes[index] : undefined
  return (
    <group ref={group} visible={false}>
      <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        {node && (
          <div className={cx('sw-graphlabel', pick?.hot && 'sw-graphlabel-hot')}>{node.label}</div>
        )}
      </Html>
    </group>
  )
}

export function GraphLabels({ store }: { store: GraphStore }) {
  React.useSyncExternalStore(store.subscribe, () => store.styleVersion)
  const nodes = React.useSyncExternalStore(store.subscribe, () => store.nodes)
  const focus = store.focusIndex()
  const picked: { index: number; hot: boolean }[] = []
  if (focus >= 0) {
    picked.push({ index: focus, hot: true })
    if (store.selected >= 0 && store.selected !== focus)
      picked.push({ index: store.selected, hot: true })
    store
      .neighbourIndices(focus)
      .filter((i) => store.visible[i] === 1)
      .sort((a, b) => nodes[b]!.weight - nodes[a]!.weight)
      .slice(0, NEIGHBOUR_LABELS)
      .forEach((index) => picked.push({ index, hot: false }))
  } else {
    nodes
      .map((node, index) => ({ node, index }))
      .filter(({ node }) => node.kind === 'proposal')
      .sort((a, b) => b.node.weight - a.node.weight)
      .slice(0, DEFAULT_LABELS)
      .forEach(({ index }) => picked.push({ index, hot: false }))
  }
  return (
    <>
      {Array.from({ length: SLOTS }, (_, slot) => (
        <Label key={slot} store={store} pick={picked[slot] ?? null} />
      ))}
    </>
  )
}
