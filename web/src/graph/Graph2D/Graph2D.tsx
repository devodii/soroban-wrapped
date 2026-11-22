import * as React from 'react'
import type { GraphStore } from '../GraphStore/GraphStore'
import { nodeSize, type ColourBy } from '../model'
import { baseColor, usePalette, type Palette } from '../palette'
import { tracePath } from '../shapes'
import './Graph2D.scss'

const PICK_SLACK = 4
const ZOOM_STEP = 1.12
const MIN_ZOOM = 0.2
const MAX_ZOOM = 12
const EDGE_ALPHA = 0.12
const LABEL_LIMIT = 9

interface View {
  x: number
  y: number
  k: number
}

const hex = (c: { getHexString: () => string }) => `#${c.getHexString()}`

function pick(store: GraphStore, view: View, px: number, py: number): number {
  let best = -1
  let bestDistance = Infinity
  store.nodes.forEach((node, i) => {
    if (!store.visible[i]) return
    const [x, y] = store.position(i)
    const d = Math.hypot(x * view.k + view.x - px, y * view.k + view.y - py)
    const reach = nodeSize(node) * view.k + PICK_SLACK
    if (d < reach && d < bestDistance) {
      best = i
      bestDistance = d
    }
  })
  return best
}

function draw(
  ctx: CanvasRenderingContext2D,
  store: GraphStore,
  view: View,
  palette: Palette,
  by: ColourBy,
  w: number,
  h: number,
) {
  ctx.clearRect(0, 0, w, h)
  const focusing = store.focusIndex() >= 0
  const fg = hex(palette.foreground)
  ctx.lineWidth = 1
  store.edges.forEach((edge, e) => {
    const a = store.src[e]!
    const b = store.dst[e]!
    if (!store.visible[a] || !store.visible[b]) return
    const hot = store.state[a] === 2 || store.state[b] === 2
    ctx.globalAlpha = focusing ? (hot ? 0.9 : 0.03) : EDGE_ALPHA
    ctx.strokeStyle = hot ? hex(palette.primary) : fg
    const [ax, ay] = store.position(a)
    const [bx, by] = store.position(b)
    ctx.beginPath()
    ctx.moveTo(ax * view.k + view.x, ay * view.k + view.y)
    ctx.lineTo(bx * view.k + view.x, by * view.k + view.y)
    ctx.stroke()
    void edge
  })
  store.nodes.forEach((node, i) => {
    if (!store.visible[i]) return
    const [x, y] = store.position(i)
    const state = store.state[i]!
    ctx.globalAlpha = focusing && state === 0 ? 0.18 : 1
    ctx.fillStyle = hex(baseColor(node, palette, by))
    tracePath(
      ctx,
      node.kind,
      x * view.k + view.x,
      y * view.k + view.y,
      nodeSize(node) * view.k * (state === 2 ? 1.5 : 1),
    )
    ctx.fill()
    if (node.network === 'mainnet' || node.network === 'both') {
      ctx.strokeStyle = hex(palette.network.mainnet!)
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.lineWidth = 1
    }
  })
  ctx.globalAlpha = 1
  ctx.font = '12px Outfit, sans-serif'
  const labelled = store.nodes
    .map((node, i) => ({ node, i }))
    .filter(({ i }) => store.state[i]! > 0 && store.visible[i])
    .sort((a, b) => store.state[b.i]! - store.state[a.i]! || b.node.weight - a.node.weight)
    .slice(0, LABEL_LIMIT)
  labelled.forEach(({ node, i }) => {
    const [x, y] = store.position(i)
    const text = node.label
    const tx = x * view.k + view.x
    const ty = y * view.k + view.y - nodeSize(node) * view.k - 6
    const width = ctx.measureText(text).width
    ctx.fillStyle = hex(palette.background)
    ctx.fillRect(tx - width / 2 - 4, ty - 12, width + 8, 17)
    ctx.fillStyle = fg
    ctx.textAlign = 'center'
    ctx.fillText(text, tx, ty)
  })
}

export function Graph2D({
  store,
  colourBy,
  onHover,
  onSelect,
}: {
  store: GraphStore
  colourBy: ColourBy
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
}) {
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const palette = usePalette()
  const view = React.useRef<View>({ x: 0, y: 0, k: 3 })
  const dirty = React.useRef(true)
  const drag = React.useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const fitted = React.useRef(false)

  React.useEffect(() => {
    const node = canvas.current
    if (!node) return
    const ctx = node.getContext('2d')!
    let frame = 0
    let seen = ''
    const loop = () => {
      store.step(0.016)
      const rect = node.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      if (node.width !== Math.round(rect.width * ratio)) {
        node.width = Math.round(rect.width * ratio)
        node.height = Math.round(rect.height * ratio)
        dirty.current = true
      }
      if (store.settled && !fitted.current) {
        fitted.current = true
        const { center, radius } = store.bounds()
        const k = Math.min(rect.width, rect.height) / (radius * 2.3)
        view.current = { k, x: rect.width / 2 - center[0] * k, y: rect.height / 2 - center[1] * k }
        dirty.current = true
      }
      const key = `${store.layoutVersion}:${store.styleVersion}:${colourBy}:${palette.background.getHex()}`
      if (dirty.current || store.moving || key !== seen) {
        seen = key
        dirty.current = false
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
        draw(ctx, store, view.current, palette, colourBy, rect.width, rect.height)
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [store, palette, colourBy])

  React.useEffect(() => {
    fitted.current = false
    return store.subscribe(() => {
      if (!store.settled) fitted.current = false
    })
  }, [store])

  const local = (event: React.PointerEvent | React.WheelEvent) => {
    const rect = canvas.current!.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  return (
    <canvas
      ref={canvas}
      className="sw-graph2d"
      role="img"
      aria-label="Two dimensional view of the graph"
      onWheel={(event) => {
        const p = local(event)
        const v = view.current
        const k = Math.min(
          Math.max(v.k * (event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP), MIN_ZOOM),
          MAX_ZOOM,
        )
        view.current = { k, x: p.x - ((p.x - v.x) / v.k) * k, y: p.y - ((p.y - v.y) / v.k) * k }
        dirty.current = true
      }}
      onPointerDown={(event) => {
        canvas.current?.setPointerCapture(event.pointerId)
        drag.current = { ...local(event), moved: false }
      }}
      onPointerMove={(event) => {
        const p = local(event)
        const d = drag.current
        if (d) {
          d.moved ||= Math.hypot(p.x - d.x, p.y - d.y) > 3
          if (d.moved) {
            view.current = {
              ...view.current,
              x: view.current.x + p.x - d.x,
              y: view.current.y + p.y - d.y,
            }
            d.x = p.x
            d.y = p.y
            dirty.current = true
          }
          return
        }
        const index = pick(store, view.current, p.x, p.y)
        onHover(index >= 0 ? store.nodes[index]!.id : null)
        canvas.current!.style.cursor = index >= 0 ? 'pointer' : 'grab'
      }}
      onPointerUp={(event) => {
        const d = drag.current
        drag.current = null
        if (d?.moved) return
        const p = local(event)
        const index = pick(store, view.current, p.x, p.y)
        onSelect(index >= 0 ? store.nodes[index]!.id : null)
      }}
      onPointerLeave={() => onHover(null)}
    />
  )
}
