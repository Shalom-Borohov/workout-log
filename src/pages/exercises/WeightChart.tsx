import { EXERCISES_COPY } from './copy'
import { dayMonth, formatWeight } from '../../domain/format'
import type { TrendPoint } from '../../domain/progress'
import { CHART_HEIGHT, CHART_WIDTH, trendGeometry } from './trendGeometry'

const percentOf = (part: number, whole: number) => `${(part / whole) * 100}%`

export function WeightChart({ points }: { points: TrendPoint[] }) {
  const first = points[0]
  const last = points[points.length - 1]
  const { path, dots } = trendGeometry(points)
  const end = dots[dots.length - 1]

  const label = EXERCISES_COPY.maxWeightTrend(
    formatWeight(first.weight),
    dayMonth(first.startedAt),
    formatWeight(last.weight),
    dayMonth(last.startedAt),
  )

  return (
    <section className="weight-chart">
      <p className="weight-chart-caption" aria-hidden="true">
        {EXERCISES_COPY.maxWeight}
      </p>
      <div className="weight-chart-plot" dir="ltr" role="img" aria-label={label}>
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none">
          <path className="weight-chart-line" d={path} vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          className="weight-chart-dot"
          style={{ insetInlineStart: percentOf(end.x, CHART_WIDTH), insetBlockStart: percentOf(end.y, CHART_HEIGHT) }}
        />
      </div>
    </section>
  )
}
