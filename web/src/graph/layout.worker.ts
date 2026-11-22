import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  forceZ,
  type SimNode,
} from 'd3-force-3d'
import type { WorkerIn, WorkerOut } from './model'

const TICKS_PER_POST = 3
const SETTLED_ALPHA = 0.018
const GRAVITY = 0.05
const CHARGE: Record<string, number> = {
  proposal: -120,
  library: -90,
  bug_class: -70,
  repo: -26,
  contract: -22,
}

let timer: ReturnType<typeof setTimeout> | undefined

function start(message: WorkerIn) {
  if (timer) clearTimeout(timer)
  const nodes = message.nodes.map((n) => ({ ...n }))
  const links = message.links.map((l) => ({ ...l }))
  const simulation = forceSimulation(nodes, message.dims)
    .alphaDecay(0.03)
    .velocityDecay(0.4)
    .alpha(message.alpha)
    .stop()
  const link = forceLink(links)
    .id((n) => (n as { id: string }).id)
    .distance(((l: { weight: number }) => 16 + 22 / (1 + l.weight)) as never)
    .strength(0.35)
  const charge = forceManyBody()
    .strength(((n: { kind: string }) => CHARGE[n.kind] ?? -25) as never)
    .theta(0.95)
    .distanceMax(420)
  simulation.force('link', link)
  simulation.force('charge', charge)
  simulation.force('center', forceCenter(0, 0, 0))
  simulation.force('x', forceX(0).strength(GRAVITY) as never)
  simulation.force('y', forceY(0).strength(GRAVITY) as never)
  if (message.dims === 3) simulation.force('z', forceZ(0).strength(GRAVITY) as never)

  const post = (settled: boolean) => {
    const positions = new Float32Array(nodes.length * 3)
    nodes.forEach((node: SimNode, i) => {
      positions[i * 3] = node.x
      positions[i * 3 + 1] = node.y
      positions[i * 3 + 2] = node.z ?? 0
    })
    const out: WorkerOut = { gen: message.gen, positions, alpha: simulation.alpha(), settled }
    ;(self as unknown as Worker).postMessage(out, [positions.buffer])
  }

  const loop = () => {
    simulation.tick(TICKS_PER_POST)
    const settled = simulation.alpha() < SETTLED_ALPHA
    post(settled)
    if (!settled) timer = setTimeout(loop, 16)
  }
  loop()
}

self.onmessage = (event: MessageEvent<WorkerIn>) => {
  if (event.data.type === 'init') start(event.data)
}
