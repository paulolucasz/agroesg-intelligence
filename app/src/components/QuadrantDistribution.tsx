import type { DistribuicaoQuadrante } from '../types/dashboard'

interface QuadrantDistributionProps {
  quadrants: DistribuicaoQuadrante[]
}

export function QuadrantDistribution({
  quadrants,
}: QuadrantDistributionProps) {
  const maximumQuantity = Math.max(
    ...quadrants.map(({ quantidade }) => quantidade),
    0,
  )

  return (
    <div className="quadrant-list">
      {quadrants.map(({ quadrante, quantidade }) => {
        const barWidth = maximumQuantity
          ? (quantidade / maximumQuantity) * 100
          : 0

        return (
          <div className="quadrant-item" key={quadrante}>
            <div className="quadrant-item-heading">
              <span>{quadrante}</span>
              <strong>{quantidade.toLocaleString('pt-BR')}</strong>
            </div>
            <div
              className="quadrant-bar-track"
              role="progressbar"
              aria-label={`Quantidade em ${quadrante}`}
              aria-valuemin={0}
              aria-valuemax={maximumQuantity}
              aria-valuenow={quantidade}
            >
              <span
                className="quadrant-bar-fill"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
