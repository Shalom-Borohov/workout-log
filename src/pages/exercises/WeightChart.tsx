import { IonLabel, IonList, IonListHeader } from '@ionic/react'
import { dayMonth, formatWeight } from '../../domain/format'
import type { TrendPoint } from '../../domain/progress'
import { CHART_HEIGHT, CHART_WIDTH, trendGeometry } from './trendGeometry'

const MAX_DOTS = 20

export function WeightChart({ points }: { points: TrendPoint[] }) {
  const first = points[0]
  const last = points[points.length - 1]
  const { path, dots } = trendGeometry(points)
  const end = dots[dots.length - 1]
  const shown = dots.length <= MAX_DOTS ? dots : [end]
  const label = `משקל מרבי: מ־${formatWeight(first.weight)} ב־${dayMonth(first.startedAt)} ל־${formatWeight(last.weight)} ב־${dayMonth(last.startedAt)}`

  return (
    <section>
      <IonListHeader>
        <IonLabel>משקל מרבי</IonLabel>
      </IonListHeader>
      <IonList inset>
        <div className="weight-chart" dir="ltr" role="img" aria-label={label}>
          <div className="weight-chart-plot">
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
              <line
                className="weight-chart-baseline"
                x1="0"
                x2={CHART_WIDTH}
                y1={CHART_HEIGHT - 0.5}
                y2={CHART_HEIGHT - 0.5}
                vectorEffect="non-scaling-stroke"
              />
              <path className="weight-chart-line" d={path} vectorEffect="non-scaling-stroke" />
              {shown.map((d, i) => (
                <circle key={i}className="weight-chart-dot" cx={d.x} cy={d.y} r="4" />
              ))}
            </svg>
            <span
              className="weight-chart-value"
              style={{ insetBlockEnd: `calc(${100 - (end.y / CHART_HEIGHT) * 100}% + 0.5rem)` }}
            >
              <span dir="rtl">{formatWeight(last.weight)}</span>
            </span>
          </div>
          <div className="weight-chart-axis">
            <span>{dayMonth(first.startedAt)}</span>
            <span>{dayMonth(last.startedAt)}</span>
          </div>
        </div>
      </IonList>
    </section>
  )
}
