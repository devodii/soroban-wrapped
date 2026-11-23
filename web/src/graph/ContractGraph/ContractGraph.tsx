import * as React from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import type { Graph } from '../../lib/api-schema'
import { cssColor, useTheme } from '../../lib/theme'
import { ContractId } from '../../ui/ContractId/ContractId'
import { place } from './layout'
import './ContractGraph.scss'

const compact = (n: number) =>
  n.toLocaleString('en', { notation: 'compact', maximumFractionDigits: 1 })

function Scene({
  graph,
  selected,
  onSelect,
}: {
  graph: Graph
  selected: number | null
  onSelect: (index: number | null) => void
}) {
  const theme = useTheme()
  const placed = React.useMemo(() => place(graph), [graph])
  const index = React.useMemo(() => new Map(placed.map((p, i) => [p.id, i])), [placed])
  const mesh = React.useRef<THREE.InstancedMesh>(null)
  const controls = React.useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const [hovered, setHovered] = React.useState<number | null>(null)
  const active = hovered ?? selected

  const linked = React.useMemo(() => {
    const set = new Set<number>()
    if (active === null) return set
    graph.edges.forEach((e) => {
      const a = index.get(e.caller)
      const b = index.get(e.callee)
      if (a === active && b !== undefined) set.add(b)
      if (b === active && a !== undefined) set.add(a)
    })
    return set
  }, [active, graph.edges, index])

  React.useLayoutEffect(() => {
    const target = mesh.current
    if (!target) return
    const hot = new THREE.Color(cssColor('primary'))
    const warm = new THREE.Color(cssColor('chart-2'))
    const cool = new THREE.Color(cssColor('secondary'))
    const dim = new THREE.Color(cssColor('muted-foreground'))
    const matrix = new THREE.Matrix4()
    placed.forEach((p, i) => {
      matrix.compose(
        new THREE.Vector3(p.x, p.y, p.z),
        new THREE.Quaternion(),
        new THREE.Vector3(p.radius, p.radius, p.radius),
      )
      target.setMatrixAt(i, matrix)
      const base = p.rank < 8 ? hot : p.rank < 40 ? warm : cool
      const faded = active !== null && i !== active && !linked.has(i)
      target.setColorAt(i, faded ? dim : base)
    })
    target.instanceMatrix.needsUpdate = true
    if (target.instanceColor) target.instanceColor.needsUpdate = true
  }, [placed, active, linked, theme])

  const lines = React.useMemo(() => {
    const positions: number[] = []
    const lit: number[] = []
    graph.edges.forEach((e) => {
      const a = index.get(e.caller)
      const b = index.get(e.callee)
      if (a === undefined || b === undefined) return
      const from = placed[a]!
      const to = placed[b]!
      const target = a === active || b === active ? lit : positions
      target.push(from.x, from.y, from.z, to.x, to.y, to.z)
    })
    const make = (values: number[]) => {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(values, 3))
      return geometry
    }
    return { base: make(positions), lit: make(lit) }
  }, [graph.edges, index, placed, active])

  useFrame((_, delta) => {
    const control = controls.current
    if (!control) return
    const goal = selected === null ? null : placed[selected]
    if (goal) {
      control.target.lerp(new THREE.Vector3(goal.x, goal.y, goal.z), Math.min(delta * 3, 1))
    }
  })

  return (
    <>
      <ambientLight intensity={1.4} />
      <pointLight position={[60, 60, 60]} intensity={2200} />
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, placed.length]}
        onPointerMove={(e) => {
          e.stopPropagation()
          setHovered(e.instanceId ?? null)
        }}
        onPointerOut={() => setHovered(null)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(e.instanceId ?? null)
        }}
      >
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial roughness={0.35} metalness={0.1} />
      </instancedMesh>
      <lineSegments geometry={lines.base}>
        <lineBasicMaterial color={cssColor('muted-foreground')} transparent opacity={0.22} />
      </lineSegments>
      <lineSegments geometry={lines.lit}>
        <lineBasicMaterial color={cssColor('primary')} transparent opacity={0.95} />
      </lineSegments>
      <OrbitControls
        ref={controls}
        enableDamping
        autoRotate={selected === null && hovered === null}
        autoRotateSpeed={0.5}
        minDistance={20}
        maxDistance={260}
      />
      <EffectComposer>
        <Bloom intensity={theme === 'dark' ? 0.8 : 0.25} luminanceThreshold={0.4} mipmapBlur />
      </EffectComposer>
    </>
  )
}

export function ContractGraph({ graph }: { graph: Graph }) {
  const [selected, setSelected] = React.useState<number | null>(null)
  const node = selected === null ? undefined : graph.nodes[selected]
  const partners = React.useMemo(() => {
    if (!node) return []
    return graph.edges
      .filter((e) => e.caller === node.contract_id || e.callee === node.contract_id)
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 5)
  }, [graph.edges, node])

  return (
    <div className="sw-contractgraph">
      <Canvas
        camera={{ position: [0, 0, 120], fov: 55 }}
        dpr={[1, 2]}
        onPointerMissed={() => setSelected(null)}
      >
        <Scene graph={graph} selected={selected} onSelect={setSelected} />
      </Canvas>
      <div className="sw-contractgraph-legend" aria-hidden>
        <span>
          <i className="sw-contractgraph-hot" /> top 8
        </span>
        <span>
          <i className="sw-contractgraph-warm" /> next 32
        </span>
        <span>
          <i className="sw-contractgraph-cool" /> the rest
        </span>
        <span>size is calls through the contract</span>
      </div>
      {node ? (
        <aside className="sw-contractgraph-card">
          <ContractId id={node.contract_id} />
          <p className="sw-contractgraph-figure">{compact(node.edge_calls)}</p>
          <p className="sw-contractgraph-label">calls to and from other contracts</p>
          {node.functions.length > 0 && (
            <p className="sw-contractgraph-functions">{node.functions.join(' · ')}</p>
          )}
          <ul className="sw-contractgraph-partners">
            {partners.map((p) => (
              <li key={`${p.caller}-${p.callee}`}>
                <ContractId id={p.caller === node.contract_id ? p.callee : p.caller} />
                <span>
                  {p.caller === node.contract_id ? 'calls' : 'called by'} · {compact(p.calls)}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      ) : (
        <p className="sw-contractgraph-hint">Drag to orbit, scroll to zoom, click a contract.</p>
      )}
    </div>
  )
}

export default ContractGraph
