const analyticalSteps = [
  'Produção',
  'Clima',
  'Solo e cobertura',
  'Uso histórico da terra',
  'Priorização agroambiental',
]

export function AnalyticalFlow() {
  return (
    <div className="analytical-flow" aria-label="Fluxo analítico">
      {analyticalSteps.map((step, index) => (
        <div className="flow-step-group" key={step}>
          <div className="flow-step">{step}</div>
          {index < analyticalSteps.length - 1 && (
            <span className="flow-connector" aria-hidden="true">
              →
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
