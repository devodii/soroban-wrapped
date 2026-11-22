import * as React from 'react'
import * as THREE from 'three'
import { cssColor, useTheme } from '../lib/theme'
import { KIND_COLOR, KINDS, NETWORK_COLOR, type ColourBy, type GraphNode, type Kind } from './model'

export interface Palette {
  kind: Record<Kind, THREE.Color>
  network: Record<string, THREE.Color>
  background: THREE.Color
  foreground: THREE.Color
  primary: THREE.Color
}

export function usePalette(): Palette {
  const theme = useTheme()
  return React.useMemo(() => {
    const read = (name: string) => new THREE.Color(cssColor(name))
    return {
      kind: Object.fromEntries(KINDS.map((k) => [k, read(KIND_COLOR[k])])) as Record<
        Kind,
        THREE.Color
      >,
      network: Object.fromEntries(Object.entries(NETWORK_COLOR).map(([k, v]) => [k, read(v)])),
      background: read('background'),
      foreground: read('foreground'),
      primary: read('primary'),
    }
  }, [theme])
}

export function baseColor(node: GraphNode, palette: Palette, by: ColourBy): THREE.Color {
  if (by === 'kind') return palette.kind[node.kind]
  return palette.network[node.network ?? 'none'] ?? palette.network.none!
}
