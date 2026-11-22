import type { Kind } from './model'

const HEX_SIDES = 6

export function tracePath(
  ctx: CanvasRenderingContext2D,
  kind: Kind,
  x: number,
  y: number,
  r: number,
) {
  ctx.beginPath()
  switch (kind) {
    case 'repo':
      ctx.arc(x, y, r, 0, Math.PI * 2)
      break
    case 'contract':
      ctx.rect(x - r, y - r, r * 2, r * 2)
      break
    case 'proposal':
      for (let i = 0; i < HEX_SIDES; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        ctx[i ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a))
      }
      ctx.closePath()
      break
    case 'library':
      ctx.moveTo(x, y - r * 1.2)
      ctx.lineTo(x + r * 1.2, y)
      ctx.lineTo(x, y + r * 1.2)
      ctx.lineTo(x - r * 1.2, y)
      ctx.closePath()
      break
    case 'bug_class':
      ctx.moveTo(x, y - r * 1.2)
      ctx.lineTo(x + r * 1.1, y + r * 0.9)
      ctx.lineTo(x - r * 1.1, y + r * 0.9)
      ctx.closePath()
      break
  }
}

export const SVG_SHAPE: Record<Kind, string> = {
  repo: 'M12 4a8 8 0 1 0 0.01 0z',
  contract: 'M5 5h14v14H5z',
  proposal: 'M12 2.5l8.5 4.75v9.5L12 21.5l-8.5-4.75v-9.5z',
  library: 'M12 2.5l9.5 9.5L12 21.5 2.5 12z',
  bug_class: 'M12 3l10 18H2z',
}
