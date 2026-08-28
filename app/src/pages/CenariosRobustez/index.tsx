import { useEffect, useState } from 'react'

import { getSensibilidadeResumo } from '../../api/sensibilidade'
import type {
  CenarioSensibilidadeResumo,
  SensibilidadeResumoResponse,
} from '../../types/sensibilidade'

function formatCount(value: number | null): string {
  return value === null
    ? '—'
    : value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function formatPercent(value: number | null): string {
  return value === null || !Number.isFinite(value)
    ? '—'
    : `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}

function formatCorrelation(value: number | null): string {
  return value === null
    ? '—'
    : value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}

function formatScenarioName(value: string): string {
  return value.toLocaleUpperCase('pt-BR')
}

function SensitivityBar({ value }: { value: number | null }) {
  const hasValue = value !== null && Number.isFinite(value)
  const visualValue = hasValue
    ? Math.min(100, Math.max(0, value))
    : null

  return (
    <div className="sensitivity-bar-track" aria-hidden="true">
      {visualValue !== null && (
        <div
          className="sensitivity-bar-fill"
          style={{ width: `${visualValue}%` }}
        />
      )}
    </div>
  )
}

function RequestState({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <p
      className="sensitivity-state"
      role={error ? 'alert' : 'status'}
      aria-live={error ? undefined : 'polite'}
    >
      {message}
    </p>
  )
}

function ReferenceSummary({
  reference,
}: {
  reference: SensibilidadeResumoResponse['referencia']
}) {
  return (
    <div className="sensitivity-reference-grid">
      <div className="sensitivity-reference-card">
        <span>Cenário de referência</span>
        <strong>{formatScenarioName(reference.cenario_base)}</strong>
      </div>
      <div className="sensitivity-reference-card">
        <span>Estratégicos no cenário base</span>
        <strong>{formatCount(reference.estrategicos_base)}</strong>
      </div>
      <div className="sensitivity-reference-card">
        <span>Cenários avaliados</span>
        <strong>{formatCount(reference.quantidade_cenarios)}</strong>
      </div>
    </div>
  )
}

function ScenarioCard({
  scenario,
  isBase,
}: {
  scenario: CenarioSensibilidadeResumo
  isBase: boolean
}) {
  return (
    <article className={`sensitivity-scenario-card${isBase ? ' sensitivity-scenario-card-base' : ''}`}>
      <div className="sensitivity-scenario-card-heading">
        <div>
          <span className="sensitivity-scenario-label">
            {isBase ? 'Referência' : 'Cenário'}
          </span>
          <h3>{formatScenarioName(scenario.cenario)}</h3>
        </div>
        {isBase && <span className="sensitivity-reference-tag">Base</span>}
      </div>
      <div className="sensitivity-scenario-highlights">
        <div className="sensitivity-scenario-metric">
          <span className="sensitivity-scenario-metric-label">Estratégicos</span>
          <strong>{formatCount(scenario.estrategicos_cenario)}</strong>
        </div>
        <div className="sensitivity-scenario-metric">
          <span className="sensitivity-scenario-metric-label">Retenção</span>
          <strong>{formatPercent(scenario.retencao_dos_225_base_pct)}</strong>
        </div>
        <div className="sensitivity-scenario-metric">
          <span className="sensitivity-scenario-metric-label">Jaccard</span>
          <strong>{formatPercent(scenario.jaccard_pct)}</strong>
        </div>
      </div>
    </article>
  )
}

function ComparisonTable({
  scenarios,
  referenceScenario,
}: {
  scenarios: CenarioSensibilidadeResumo[]
  referenceScenario: string
}) {
  return (
    <div className="table-scroll sensitivity-table-scroll">
      <table className="sensitivity-table">
        <thead>
          <tr>
            <th scope="col">Cenário</th>
            <th scope="col">Estratégicos no cenário</th>
            <th scope="col">Em comum com a base</th>
            <th scope="col">Retenção dos estratégicos-base</th>
            <th scope="col">Índice de Jaccard</th>
            <th scope="col">Spearman — relevância</th>
            <th scope="col">Spearman — pressão</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((scenario) => {
            const isBase = scenario.cenario === referenceScenario

            return (
              <tr key={scenario.cenario}>
                <td>
                  <div className="sensitivity-table-scenario">
                    <strong>{formatScenarioName(scenario.cenario)}</strong>
                    {isBase && <small>Referência</small>}
                  </div>
                </td>
                <td>{formatCount(scenario.estrategicos_cenario)}</td>
                <td>{formatCount(scenario.estrategicos_em_comum_com_base)}</td>
                <td>
                  <div className="sensitivity-table-bar-value">
                    <span>{formatPercent(scenario.retencao_dos_225_base_pct)}</span>
                    <SensitivityBar value={scenario.retencao_dos_225_base_pct} />
                  </div>
                </td>
                <td>
                  <div className="sensitivity-table-bar-value">
                    <span>{formatPercent(scenario.jaccard_pct)}</span>
                    <SensitivityBar value={scenario.jaccard_pct} />
                  </div>
                </td>
                <td>{formatCorrelation(scenario.spearman_relevancia_vs_base)}</td>
                <td>{formatCorrelation(scenario.spearman_pressao_vs_base)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function InterpretationSection() {
  return (
    <section className="sensitivity-interpretation" aria-labelledby="sensitivity-interpretation-title">
      <div>
        <p className="section-kicker">Leitura dos indicadores</p>
        <h2 id="sensitivity-interpretation-title">Como interpretar</h2>
      </div>
      <div className="sensitivity-interpretation-grid">
        <div>
          <strong>Retenção</strong>
          <p>
            Percentual dos municípios estratégicos do cenário base que permanecem
            estratégicos no cenário analisado.
          </p>
        </div>
        <div>
          <strong>Jaccard</strong>
          <p>
            Similaridade entre o conjunto de municípios estratégicos do cenário
            base e do cenário analisado.
          </p>
        </div>
        <div>
          <strong>Spearman</strong>
          <p>
            Correlação de ordem entre os scores do cenário analisado e os scores
            do cenário base.
          </p>
        </div>
      </div>
      <p className="sensitivity-interpretation-note">
        Valores maiores indicam maior estabilidade em relação ao cenário base.
        Essas métricas analisam a estabilidade do modelo e não representam
        créditos de carbono.
      </p>
    </section>
  )
}

export default function CenariosRobustez() {
  const [summary, setSummary] = useState<SensibilidadeResumoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    getSensibilidadeResumo()
      .then((response) => {
        if (isMounted) {
          setSummary(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="sensitivity-page">
      <header className="sensitivity-hero">
        <div className="sensitivity-hero-copy">
          <p className="eyebrow">ESTABILIDADE DO MODELO</p>
          <h1>Cenários &amp; Robustez</h1>
          <p>
            Comparação da estabilidade da priorização territorial sob diferentes
            configurações de pesos analíticos.
          </p>
          <p className="sensitivity-note">
            A análise de sensibilidade avalia a permanência dos municípios
            estratégicos quando os pesos do modelo são alterados.
          </p>
        </div>
      </header>

      {loading && <RequestState message="Carregando análise de sensibilidade..." />}
      {error && (
        <RequestState
          message="Não foi possível carregar a análise de sensibilidade."
          error
        />
      )}
      {!loading && !error && summary && summary.cenarios.length === 0 && (
        <RequestState message="Não há cenários de sensibilidade disponíveis." />
      )}

      {!loading && !error && summary && summary.cenarios.length > 0 && (
        <>
          <section className="sensitivity-section" aria-labelledby="sensitivity-reference-title">
            <div className="sensitivity-section-heading">
              <div>
                <p className="section-kicker">Ponto de comparação</p>
                <h2 id="sensitivity-reference-title">Referência do cenário base</h2>
              </div>
              <p className="sensitivity-section-caption">
                Valores consolidados pela análise global de sensibilidade.
              </p>
            </div>
            <ReferenceSummary reference={summary.referencia} />
          </section>

          <section className="sensitivity-section" aria-labelledby="sensitivity-scenarios-title">
            <div className="sensitivity-section-heading">
              <div>
                <p className="section-kicker">Visão comparativa</p>
                <h2 id="sensitivity-scenarios-title">Cenários avaliados</h2>
              </div>
              <p className="sensitivity-section-caption">
                Destaques de estratégicos, retenção e similaridade.
              </p>
            </div>
            <div className="sensitivity-scenario-grid">
              {summary.cenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.cenario}
                  scenario={scenario}
                  isBase={scenario.cenario === summary.referencia.cenario_base}
                />
              ))}
            </div>
          </section>

          <section className="sensitivity-section" aria-labelledby="sensitivity-table-title">
            <div className="sensitivity-section-heading">
              <div>
                <p className="section-kicker">Métricas persistidas</p>
                <h2 id="sensitivity-table-title">Comparação detalhada</h2>
              </div>
            </div>
            <ComparisonTable
              scenarios={summary.cenarios}
              referenceScenario={summary.referencia.cenario_base}
            />
          </section>

          <InterpretationSection />
        </>
      )}
    </main>
  )
}
