declare module 'd3-force-3d' {
  export interface SimNode {
    index?: number
    x: number
    y: number
    z?: number
    vx?: number
    vy?: number
    vz?: number
  }
  export interface Force {
    strength: (value: number | ((node: never, index: number) => number)) => Force
    distance: (value: number | ((link: never) => number)) => Force
    id: (accessor: (node: never) => string) => Force
    distanceMax: (value: number) => Force
    theta: (value: number) => Force
  }
  export interface Simulation {
    force: (name: string, force?: Force | null) => Simulation | Force
    alpha: (value?: number) => number & Simulation
    alphaMin: (value?: number) => Simulation
    alphaDecay: (value?: number) => Simulation
    velocityDecay: (value?: number) => Simulation
    tick: (iterations?: number) => Simulation
    stop: () => Simulation
    nodes: () => SimNode[]
  }
  export function forceSimulation(nodes: unknown[], dimensions?: number): Simulation
  export function forceLink(links: unknown[]): Force
  export function forceManyBody(): Force
  export function forceX(x?: number): Force
  export function forceY(y?: number): Force
  export function forceZ(z?: number): Force
  export function forceCenter(x?: number, y?: number, z?: number): Force
}
