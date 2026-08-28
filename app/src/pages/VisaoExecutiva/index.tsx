import { useEffect, useState } from 'react'

import { getDashboardResumo } from '../../api/dashboard'
import { AnalyticalFlow } from '../../components/AnalyticalFlow'
import { MetricCard } from '../../components/MetricCard'
import { QuadrantDistribution } from '../../components/QuadrantDistribution'
import type { DashboardResumo } from '../../types/dashboard'

function formatNumber(value: number | null): string {
  return value === null ? '—' : value.toLocaleString('pt-BR')
}

function formatPercentage(value: number | null): string {
  return value === null
    ? '—'
    : `${value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}%`
}

export default function VisaoExecutiva() {
  const [dashboard, setDashboard] = useState<DashboardResumo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    getDashboardResumo()
      .then((data) => {
        if (isMounted) {
          setDashboard(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="status-state" role="status">
        <span className="status-kicker">AgroESG Intelligence</span>
        <p>Carregando indicadores agroambientais...</p>
      </div>
    )
  }

  if (hasError || dashboard === null) {
    return (
      <div className="status-state" role="alert">
        <span className="status-kicker">AgroESG Intelligence</span>
        <p>Não foi possível carregar os dados da API.</p>
      </div>
    )
  }

  const { escopo, indicadores, distribuicao_quadrantes } = dashboard
  const regionLabel = escopo.regioes.length
    ? escopo.regioes.join(' + ')
    : '—'
  const periodLabel =
    escopo.ano_inicio === null || escopo.ano_fim === null
      ? '—'
      : `${escopo.ano_inicio}–${escopo.ano_fim}`

  return (
    <div className="dashboard-page">
      <section className="hero-section" aria-labelledby="visao-executiva-title">
        <div className="hero-copy">
          <p className="eyebrow">AgroESG Intelligence</p>
          <h1 id="visao-executiva-title">
            Inteligência agroambiental aplicada à soja
          </h1>
          <p className="hero-subtitle">
            Análise integrada de produção, clima, solo, cobertura da terra e
            pressão agroambiental para apoio à priorização territorial.
          </p>
        </div>

        <div className="scope-chips" aria-label="Escopo da análise">
          <span className="scope-chip">{escopo.cultura}</span>
          <span className="scope-chip">{regionLabel}</span>
          <span className="scope-chip">{periodLabel}</span>
        </div>
      </section>

      <section className="dashboard-section" aria-labelledby="indicadores-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Leitura executiva</p>
            <h2 id="indicadores-title">Indicadores principais</h2>
          </div>
          <p className="section-description">
            Síntese do recorte territorial analisado.
          </p>
        </div>

        <div className="indicator-grid">
          <MetricCard
            title="Total de municípios"
            value={formatNumber(indicadores.total_municipios)}
            caption="Municípios presentes no recorte territorial."
          />
          <MetricCard
            title="Municípios elegíveis"
            value={formatNumber(indicadores.municipios_elegiveis)}
            caption="Municípios com dados suficientes para a priorização."
          />
          <MetricCard
            title="Dados insuficientes"
            value={formatNumber(indicadores.municipios_dados_insuficientes)}
            caption="Municípios fora do cruzamento por insuficiência de dados."
          />
          <MetricCard
            title="Estratégicos no cenário base"
            value={formatNumber(indicadores.municipios_estrategicos_base)}
            caption="Alta relevância produtiva e alta pressão agroambiental."
          />
          <MetricCard
            title="Prioridade robusta"
            value={formatNumber(indicadores.municipios_prioridade_robusta)}
            caption="Estratégicos em pelo menos três dos quatro cenários."
          />
          <MetricCard
            title="Estratégicos robustos"
            value={formatPercentage(
              indicadores.percentual_estrategicos_robustos,
            )}
            caption="Proporção dos estratégicos-base com priorização robusta."
          />
        </div>
      </section>

      <div className="dashboard-columns">
        <section
          className="dashboard-section quadrant-section"
          aria-labelledby="quadrantes-title"
        >
          <div className="section-heading">
            <div>
              <p className="section-kicker">Classificação territorial</p>
              <h2 id="quadrantes-title">Distribuição dos quadrantes</h2>
            </div>
            <p className="section-description">
              Distribuição retornada pela classificação persistida.
            </p>
          </div>
          <QuadrantDistribution quadrants={distribuicao_quadrantes} />
        </section>

        <section
          className="dashboard-section scope-section"
          aria-labelledby="scope-detail-title"
        >
          <div className="section-heading">
            <div>
              <p className="section-kicker">Contexto analítico</p>
              <h2 id="scope-detail-title">Escopo da leitura</h2>
            </div>
          </div>
          <dl className="scope-list">
            <div>
              <dt>Cultura</dt>
              <dd>{escopo.cultura}</dd>
            </div>
            <div>
              <dt>Regiões</dt>
              <dd>{regionLabel}</dd>
            </div>
            <div>
              <dt>Período</dt>
              <dd>{periodLabel}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="dashboard-section" aria-labelledby="fluxo-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Como a análise se organiza</p>
            <h2 id="fluxo-title">Fluxo analítico</h2>
          </div>
        </div>
        <AnalyticalFlow />
      </section>

      <aside className="methodology-note">
        <strong>
          Os resultados representam triagem e priorização agroambiental
          territorial e não correspondem a créditos de carbono certificados.
        </strong>
        <p>
          A identificação de créditos comercializáveis depende de metodologia
          aplicável, linha de base, adicionalidade, MRV e demais requisitos do
          padrão de certificação adotado.
        </p>
      </aside>
    </div>
  )
}
