import type { TrendPoint } from '../../domain/progress'

export const CHART_WIDTH = 320

export const CHART_HEIGHT = 112

export const MIN_TREND_POINTS = 2

const INSET = 8
const TOP = 32
const BOTTOM = CHART_HEIGHT - INSET

const round = (value: number) => Math.round(value * 10) / 10

export function trendGeometry(points: TrendPoint[]): { path: string; dots: { x: number; y: number }[] } {
  const times = points.map((point) => point.startedAt)
  const weights = points.map((point) => point.weight)
  const [minTime, maxTime] = [Math.min(...times), Math.max(...times)]
  const [minWeight, maxWeight] = [Math.min(...weights), Math.max(...weights)]

  const dots = points.map((point) => ({
    x: round(INSET + ((point.startedAt - minTime) / (maxTime - minTime)) * (CHART_WIDTH - 2 * INSET)),
    y: round(
      maxWeight === minWeight
        ? (TOP + BOTTOM) / 2
        : BOTTOM - ((point.weight - minWeight) / (maxWeight - minWeight)) * (BOTTOM - TOP),
    ),
  }))

  return { path: dots.map((dot, index) => `${index === 0 ? 'M' : 'L'}${dot.x} ${dot.y}`).join(' '), dots }
}
