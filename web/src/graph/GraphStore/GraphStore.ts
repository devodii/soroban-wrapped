import { type Dims, type GraphEdge, type GraphNode, type WorkerIn, type WorkerOut } from '../model'

const LERP = 9
const SEED_JITTER = 7

export class GraphStore {
  nodes: GraphNode[] = []
  edges: GraphEdge[] = []
  index = new Map<string, number>()
  src = new Int32Array(0)
  dst = new Int32Array(0)
  adjacency: number[][] = []
  target = new Float32Array(0)
  shown = new Float32Array(0)
  visible = new Uint8Array(0)
  state = new Uint8Array(0)
  hover = -1
  selected = -1
  dims: Dims = 3
  gen = 0
  layoutVersion = 0
  styleVersion = 0
  settled = false
  moving = false
  cameraTarget: [number, number, number] = [0, 0, 0]
  private worker: Worker | null = null
  private listeners = new Set<() => void>()

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit() {
    this.listeners.forEach((listener) => listener())
  }

  private ensureWorker() {
    if (this.worker) return this.worker
    this.worker = new Worker(new URL('../layout.worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = (event: MessageEvent<WorkerOut>) => {
      const data = event.data
      if (data.gen !== this.gen) return
      this.target.set(data.positions)
      this.layoutVersion++
      this.moving = true
      if (data.settled) {
        this.settled = true
        this.emit()
      }
    }
    return this.worker
  }

  setData(nodes: GraphNode[], edges: GraphEdge[], dims: Dims, reheat: boolean) {
    const previous = new Map<string, [number, number, number]>()
    this.nodes.forEach((node, i) => {
      previous.set(node.id, [this.target[i * 3]!, this.target[i * 3 + 1]!, this.target[i * 3 + 2]!])
    })
    const selectedId = this.nodes[this.selected]?.id
    const hoverId = this.nodes[this.hover]?.id
    this.nodes = nodes
    this.edges = edges
    this.dims = dims
    this.index = new Map(nodes.map((n, i) => [n.id, i]))
    const valid = edges.filter((e) => this.index.has(e.src) && this.index.has(e.dst))
    this.edges = valid
    this.src = Int32Array.from(valid, (e) => this.index.get(e.src)!)
    this.dst = Int32Array.from(valid, (e) => this.index.get(e.dst)!)
    this.adjacency = nodes.map(() => [])
    valid.forEach((_, i) => {
      this.adjacency[this.src[i]!]!.push(i)
      this.adjacency[this.dst[i]!]!.push(i)
    })
    const radius = Math.cbrt(nodes.length) * 14
    const seed = nodes.map((node, i) => {
      const old = previous.get(node.id)
      if (old) return old
      for (const e of this.adjacency[i]!) {
        const other = this.nodes[this.src[e] === i ? this.dst[e]! : this.src[e]!]!
        const there = previous.get(other.id)
        if (there)
          return there.map((v) => v + (Math.random() - 0.5) * SEED_JITTER) as [
            number,
            number,
            number,
          ]
      }
      const u = Math.random() * 2 - 1
      const t = Math.random() * Math.PI * 2
      const r = radius * Math.cbrt(Math.random())
      const flat = dims === 2 ? 0 : 1
      return [
        r * Math.sqrt(1 - u * u) * Math.cos(t),
        r * Math.sqrt(1 - u * u) * Math.sin(t),
        flat * r * u,
      ] as [number, number, number]
    })
    this.target = new Float32Array(nodes.length * 3)
    this.shown = new Float32Array(nodes.length * 3)
    seed.forEach((p, i) => {
      this.target.set(p, i * 3)
      this.shown.set(p, i * 3)
    })
    this.visible = new Uint8Array(nodes.length).fill(1)
    this.state = new Uint8Array(nodes.length)
    this.selected = selectedId ? (this.index.get(selectedId) ?? -1) : -1
    this.hover = hoverId ? (this.index.get(hoverId) ?? -1) : -1
    this.recomputeState()
    this.gen++
    this.settled = false
    const message: WorkerIn = {
      type: 'init',
      gen: this.gen,
      dims,
      alpha: reheat ? 0.45 : 1,
      nodes: nodes.map((n, i) => ({
        id: n.id,
        kind: n.kind,
        x: seed[i]![0],
        y: seed[i]![1],
        z: dims === 2 ? 0 : seed[i]![2],
      })),
      links: valid.map((e) => ({ source: e.src, target: e.dst, weight: e.weight })),
    }
    this.ensureWorker().postMessage(message)
    this.layoutVersion++
    this.styleVersion++
    this.emit()
  }

  step(dt: number): boolean {
    if (!this.moving) return false
    const k = 1 - Math.exp(-LERP * dt)
    let largest = 0
    for (let i = 0; i < this.target.length; i++) {
      const delta = this.target[i]! - this.shown[i]!
      this.shown[i] = this.shown[i]! + delta * k
      largest = Math.max(largest, Math.abs(delta))
    }
    if (largest < 0.02 && this.settled) {
      this.shown.set(this.target)
      this.moving = false
    }
    return true
  }

  position(i: number): [number, number, number] {
    return [this.shown[i * 3]!, this.shown[i * 3 + 1]!, this.shown[i * 3 + 2]!]
  }

  neighbourIndices(i: number): number[] {
    return (this.adjacency[i] ?? []).map((e) => (this.src[e] === i ? this.dst[e]! : this.src[e]!))
  }

  focusIndex(): number {
    return this.hover >= 0 ? this.hover : this.selected
  }

  recomputeState() {
    this.state.fill(0)
    const focus = this.focusIndex()
    if (focus >= 0) {
      this.neighbourIndices(focus).forEach((n) => (this.state[n] = 1))
      this.state[focus] = 2
    }
    if (this.selected >= 0 && this.selected !== focus) this.state[this.selected] = 2
    this.styleVersion++
  }

  setHover(id: string | null) {
    const next = id ? (this.index.get(id) ?? -1) : -1
    if (next === this.hover) return
    this.hover = next
    this.recomputeState()
    this.emit()
  }

  setSelected(id: string | null) {
    const next = id ? (this.index.get(id) ?? -1) : -1
    this.selected = next
    this.recomputeState()
    this.emit()
  }

  setVisible(mask: Uint8Array<ArrayBuffer>) {
    this.visible = mask
    this.styleVersion++
  }

  bounds(): { center: [number, number, number]; radius: number } {
    const n = this.nodes.length
    if (!n) return { center: [0, 0, 0], radius: 50 }
    const c = [0, 0, 0]
    for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) c[a]! += this.target[i * 3 + a]!
    const center = c.map((v) => v / n) as [number, number, number]
    const dists: number[] = []
    for (let i = 0; i < n; i++) {
      dists.push(
        Math.hypot(
          this.target[i * 3]! - center[0],
          this.target[i * 3 + 1]! - center[1],
          this.target[i * 3 + 2]! - center[2],
        ),
      )
    }
    dists.sort((a, b) => a - b)
    return { center, radius: Math.max(dists[Math.floor(n * 0.96)] ?? 50, 30) }
  }

  dispose() {
    this.worker?.terminate()
    this.worker = null
  }
}
