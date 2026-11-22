import * as React from 'react'
import type { GraphStore } from '../GraphStore/GraphStore'
import { usePalette } from '../palette'
import { tracePath } from '../shapes'
import './Minimap.scss'

const WIDTH = 168
const HEIGHT = 120
const PAD = 8
const MIN_FRAME_MS = 100

export function Minimap({
  store,
  onSelect,
}: {
  store: GraphStore
  onSelect: (id: string) => void
}) {
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const palette = usePalette()
  const scale = React.useRef({ x: 0, y: 0, k: 1 })

  React.useEffect(() => {
    const node = canvas.current
    if (!node) return
    const ctx = node.getContext('2d')!
    const ratio = window.devicePixelRatio || 1
    node.width = WIDTH * ratio
    node.height = HEIGHT * ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    let last = 0
    let frame = 0
    let seen = ''
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      const key = `${store.layoutVersion}:${store.styleVersion}:${store.cameraTarget.join(',')}:${palette.background.getHex()}`
      if (now - last < MIN_FRAME_MS || key === seen) return
      last = now
      seen = key
      const { center, radius } = store.bounds()
      const k = Math.min((WIDTH - PAD * 2) / (radius * 2), (HEIGHT - PAD * 2) / (radius * 2))
      scale.current = { k, x: WIDTH / 2 - center[0] * k, y: HEIGHT / 2 - center[1] * k }
      ctx.clearRect(0, 0, WIDTH, HEIGHT)
      store.nodes.forEach((n, i) => {
        if (!store.visible[i]) return
        const [x, y] = store.position(i)
        ctx.fillStyle = `#${(n.kind === 'proposal' ? palette.kind.proposal : n.kind === 'contract' ? palette.kind.contract : palette.kind.repo).getHexString()}`
        ctx.globalAlpha = store.state[i] === 2 ? 1 : 0.65
        tracePath(
          ctx,
          'repo',
          x * k + scale.current.x,
          y * k + scale.current.y,
          store.state[i] === 2 ? 3.2 : 1.1,
        )
        ctx.fill()
      })
      ctx.globalAlpha = 1
      const [tx, ty] = store.cameraTarget
      ctx.strokeStyle = `#${palette.foreground.getHexString()}`
      ctx.lineWidth = 1.5
      ctx.strokeRect(tx * k + scale.current.x - 12, ty * k + scale.current.y - 9, 24, 18)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [store, palette])

  const click = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = ((event.clientX - rect.left) / rect.width) * WIDTH
    const py = ((event.clientY - rect.top) / rect.height) * HEIGHT
    const { k, x, y } = scale.current
    let best = -1
    let bestDistance = Infinity
    store.nodes.forEach((_, i) => {
      if (!store.visible[i]) return
      const [nx, ny] = store.position(i)
      const d = Math.hypot(nx * k + x - px, ny * k + y - py)
      if (d < bestDistance) {
        best = i
        bestDistance = d
      }
    })
    if (best >= 0 && bestDistance < 14) onSelect(store.nodes[best]!.id)
  }

  return (
    <canvas
      ref={canvas}
      className="sw-minimap"
      style={{ width: WIDTH, height: HEIGHT }}
      onClick={click}
      role="img"
      aria-label="Minimap of the graph, click a point to fly there"
    />
  )
}
