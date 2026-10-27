import type { TrendPoint } from '../../domain/progress'

export const CHART_WIDTH = 320

export const CHART_HEIGHT = 112

const INSET = 8
const TOP = 32
const BOTTOM = CHART_HEIGHT - INSET

const round = (n: number) => Math.round(n * 10) / 10

export function trendGeometry(points: TrendPoint[]): { path: string; dots: { x: number; y: number }[] } {
  const times = points.map((p) => p.startedAt)
  const weights = points.map((p) => p.weight)
  const [t0, t1] = [Math.min(...times), Math.max(...times)]
  const [w0, w1] = [Math.min(...weights), Math.max(...weights)]

  const dots = points.map((p) => ({
    x: round(INSET + ((p.startedAt - t0) / (t1 - t0)) * (CHART_WIDTH - 2 * INSET)),
    y: round(w1 === w0 ? (TOP + BOTTOM) / 2 : BOTTOM - ((p.weight - w0) / (w1 - w0)) * (BOTTOM - TOP)),
  }))

  return { path: dots.map((d, i) => `${i === 0 ? 'M' : 'L'}${d.x} ${d.y}`).join(' '), dots }
}
