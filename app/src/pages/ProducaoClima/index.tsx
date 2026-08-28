import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { ClimateChart } from '../../components/ClimateChart'
import { ProductionAreaChart } from '../../components/ProductionAreaChart'
import { YieldChart } from '../../components/YieldChart'
import { getCatalogoFiltros } from '../../api/catalogo'
import { getProducaoClima } from '../../api/producaoClima'
import { MetricCard } from '../../components/MetricCard'
import type { CatalogoFiltros } from '../../types/catalogo'
import type {
  ProducaoClimaResponse,
  ProducaoClimaSerieAnual,
} from '../../types/producaoClima'

const REGIOES_ANALISE = ['Centro-Oeste', 'Sul']
const UFS_ANALISE = ['DF', 'GO', 'MS', 'MT', 'PR', 'RS', 'SC']

function formatNumber(value: number | null, maximumFractionDigits = 2): string {
  return value === null
    ? '—'
    : value.toLocaleString('pt-BR', { maximumFractionDigits })
}

function formatMetric(
  value: number | null,
  unit: string,
  maximumFractionDigits = 2,
): string {
  return value === null
    ? '—'
    : `${formatNumber(value, maximumFractionDigits)} ${unit}`
}

function formatScopeList(values: string[]): string {
  return values.length > 0 ? values.join(' + ') : '—'
}

function RequestState({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <p
      className={`production-climate-state${error ? ' production-climate-state-error' : ''}`}
      role={error ? 'alert' : 'status'}
      aria-live={error ? undefined : 'polite'}
    >
      {message}
    </p>
  )
}

function ChartCard({
  title,
  description,
  children,
  wide = false,
}: {
  title: string
  description: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <article className={`production-climate-chart-card${wide ? ' production-climate-chart-card-wide' : ''}`}>
      <div className="production-climate-chart-heading">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="production-climate-chart-area">{children}</div>
    </article>
  )
}

function FilterField({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ScopeSummary({ data }: { data: ProducaoClimaResponse }) {
  return (
    <div className="production-climate-scope" aria-label="Escopo resolvido">
      <span>{data.escopo.cultura.toLocaleUpperCase('pt-BR')}</span>
      <span>{formatScopeList(data.escopo.regioes)}</span>
      <span>{formatScopeList(data.escopo.ufs)}</span>
      <span>
        {data.escopo.ano_inicio}–{data.escopo.ano_fim}
      </span>
    </div>
  )
}

function SummaryCards({ data }: { data: ProducaoClimaResponse }) {
  const { resumo, escopo } = data

  return (
    <div className="indicator-grid production-climate-metric-grid">
      <MetricCard
        title="Produção total do período"
        value={formatMetric(resumo.producao_total_periodo_t, 't', 0)}
        caption={`${escopo.ano_inicio}–${escopo.ano_fim}`}
      />
      <MetricCard
        title="Produção no último ano"
        value={formatMetric(resumo.producao_ultimo_ano_t, 't', 0)}
        caption={`Ano ${escopo.ano_fim}`}
      />
      <MetricCard
        title="Área colhida no último ano"
        value={formatMetric(resumo.area_colhida_ultimo_ano_ha, 'ha', 0)}
        caption={`Ano ${escopo.ano_fim}`}
      />
      <MetricCard
        title="Rendimento no último ano"
        value={formatMetric(resumo.rendimento_ultimo_ano_kg_ha, 'kg/ha', 2)}
        caption={`Ano ${escopo.ano_fim}`}
      />
      <MetricCard
        title="Precipitação média anual"
        value={formatMetric(resumo.precipitacao_media_anual_periodo_mm, 'mm', 2)}
        caption="Média dos agregados anuais"
      />
      <MetricCard
        title="Temperatura média anual"
        value={formatMetric(resumo.temperatura_media_anual_periodo_c, '°C', 2)}
        caption="Média dos agregados anuais"
      />
      <MetricCard
        title="Umidade média anual"
        value={formatMetric(resumo.umidade_media_anual_periodo_pct, '%', 2)}
        caption="Média dos agregados anuais"
      />
    </div>
  )
}

function AnnualSeriesTable({ items }: { items: ProducaoClimaSerieAnual[] }) {
  return (
    <div className="table-scroll production-climate-table-scroll">
      <table className="production-climate-table">
        <thead>
          <tr>
            <th scope="col">Ano</th>
            <th scope="col">Produção total (t)</th>
            <th scope="col">Área colhida (ha)</th>
            <th scope="col">Rendimento agregado (kg/ha)</th>
            <th scope="col">Precipitação média municipal (mm)</th>
            <th scope="col">Temperatura média municipal (°C)</th>
            <th scope="col">Umidade média municipal (%)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.ano}>
              <td>{item.ano}</td>
              <td>{formatNumber(item.producao_total_t, 0)}</td>
              <td>{formatNumber(item.area_colhida_total_ha, 0)}</td>
              <td>{formatNumber(item.rendimento_agregado_kg_ha)}</td>
              <td>{formatNumber(item.precipitacao_media_municipal_mm)}</td>
              <td>{formatNumber(item.temperatura_media_municipal_c)}</td>
              <td>{formatNumber(item.umidade_media_municipal_pct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CoverageTable({ items }: { items: ProducaoClimaSerieAnual[] }) {
  return (
    <div className="table-scroll production-climate-coverage-scroll">
      <table className="production-climate-table production-climate-coverage-table">
        <thead>
          <tr>
            <th scope="col">Ano</th>
            <th scope="col">Municípios considerados</th>
            <th scope="col">Com produção</th>
            <th scope="col">Com área colhida</th>
            <th scope="col">Com produção e área</th>
            <th scope="col">Com clima</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.ano}>
              <td>{item.ano}</td>
              <td>{item.cobertura.municipios_considerados}</td>
              <td>{item.cobertura.municipios_com_producao}</td>
              <td>{item.cobertura.municipios_com_area_colhida}</td>
              <td>{item.cobertura.municipios_com_producao_e_area_colhida}</td>
              <td>{item.cobertura.municipios_com_clima}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ProducaoClima() {
  const [catalogo, setCatalogo] = useState<CatalogoFiltros | null>(null)
  const [catalogoLoading, setCatalogoLoading] = useState(true)
  const [catalogoError, setCatalogoError] = useState(false)
  const [regiao, setRegiao] = useState('')
  const [uf, setUf] = useState('')
  const [analysis, setAnalysis] = useState<ProducaoClimaResponse | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(true)
  const [analysisError, setAnalysisError] = useState(false)

  useEffect(() => {
    let isMounted = true
    setCatalogoLoading(true)
    setCatalogoError(false)

    getCatalogoFiltros(regiao ? { regiao } : {})
      .then((response) => {
        if (isMounted) {
          setCatalogo(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setCatalogoError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setCatalogoLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [regiao])

  useEffect(() => {
    let isMounted = true
    setAnalysisLoading(true)
    setAnalysisError(false)

    getProducaoClima({
      regiao: regiao || undefined,
      uf: uf || undefined,
    })
      .then((response) => {
        if (isMounted) {
          setAnalysis(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setAnalysisError(true)
          setAnalysis(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setAnalysisLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [regiao, uf])

  const regionOptions = catalogo
    ? catalogo.regioes.filter((value) => REGIOES_ANALISE.includes(value))
    : REGIOES_ANALISE
  const ufOptions = catalogo
    ? catalogo.ufs.filter((value) => UFS_ANALISE.includes(value))
    : UFS_ANALISE

  return (
    <main className="production-climate-page">
      <header className="production-climate-hero">
        <div className="production-climate-hero-copy">
          <p className="eyebrow">DINÂMICA PRODUTIVA E CLIMÁTICA</p>
          <h1>Produção &amp; Clima</h1>
          <p>
            Evolução da produção de soja e das condições climáticas médias no
            recorte territorial analisado.
          </p>
          <p className="production-climate-note">
            As métricas climáticas representam médias simples das estatísticas
            municipais disponíveis em cada ano.
          </p>
        </div>
      </header>

      <section className="filter-panel production-climate-filter-panel" aria-labelledby="production-climate-filters-title">
        <div className="table-heading">
          <div>
            <p className="section-kicker">Recorte territorial</p>
            <h2 id="production-climate-filters-title">Filtros</h2>
          </div>
          {catalogoLoading && (
            <p className="inline-status" role="status" aria-live="polite">
              Carregando catálogo…
            </p>
          )}
        </div>
        <div className="filter-grid">
          <FilterField
            label="Região"
            value={regiao}
            options={regionOptions}
            disabled={catalogoLoading}
            onChange={(value) => {
              setRegiao(value)
              setUf('')
            }}
          />
          <FilterField
            label="UF"
            value={uf}
            options={ufOptions}
            disabled={catalogoLoading || !catalogo}
            onChange={setUf}
          />
        </div>
        {catalogoError && (
          <p className="inline-error" role="alert">
            Não foi possível carregar os filtros territoriais.
          </p>
        )}
      </section>

      {analysisLoading && <RequestState message="Carregando produção e clima..." />}
      {analysisError && (
        <RequestState message="Não foi possível carregar os dados de produção e clima." error />
      )}
      {!analysisLoading && !analysisError && analysis && analysis.serie_anual.length === 0 && (
        <RequestState message="Não há dados de produção e clima para o recorte selecionado." />
      )}

      {!analysisLoading && !analysisError && analysis && analysis.serie_anual.length > 0 && (
        <>
          <section className="production-climate-section production-climate-scope-section" aria-labelledby="production-climate-scope-title">
            <div className="production-climate-section-heading">
              <div>
                <p className="section-kicker">Escopo resolvido</p>
                <h2 id="production-climate-scope-title">Recorte analisado</h2>
              </div>
            </div>
            <ScopeSummary data={analysis} />
          </section>

          <section className="production-climate-section" aria-labelledby="production-climate-summary-title">
            <div className="production-climate-section-heading">
              <div>
                <p className="section-kicker">Indicadores principais</p>
                <h2 id="production-climate-summary-title">Resumo do período</h2>
              </div>
            </div>
            <SummaryCards data={analysis} />
          </section>

          <section className="production-climate-section production-climate-charts-section" aria-labelledby="production-climate-charts-title">
            <div className="production-climate-section-heading">
              <div>
                <p className="section-kicker">Visualização temporal</p>
                <h2 id="production-climate-charts-title">Evolução dos indicadores</h2>
                <p className="production-climate-section-description">
                  Leitura temporal da dinâmica produtiva e climática do recorte selecionado.
                </p>
              </div>
            </div>
            <div className="production-climate-chart-grid">
              <ChartCard
                title="Produção e área colhida"
                description="Produção e área usam escalas próprias para facilitar a comparação anual."
                wide
              >
                <ProductionAreaChart items={analysis.serie_anual} />
              </ChartCard>
              <ChartCard
                title="Rendimento agregado"
                description="Evolução do rendimento territorial retornado pelo backend."
              >
                <YieldChart items={analysis.serie_anual} />
              </ChartCard>
              <ChartCard
                title="Precipitação e temperatura"
                description="Médias municipais anuais do recorte selecionado."
              >
                <ClimateChart items={analysis.serie_anual} />
              </ChartCard>
            </div>
          </section>

          <section className="production-climate-section" aria-labelledby="production-climate-series-title">
            <div className="production-climate-section-heading">
              <div>
                <p className="section-kicker">Evolução anual</p>
                <h2 id="production-climate-series-title">
                  Série anual {analysis.escopo.ano_inicio}–{analysis.escopo.ano_fim}
                </h2>
              </div>
            </div>
            <AnnualSeriesTable items={analysis.serie_anual} />
            <p className="production-climate-method-note">
              O rendimento territorial é calculado no backend pela razão entre
              produção total e área colhida, usando somente registros com
              produção e área simultaneamente disponíveis.
            </p>
          </section>

          <section className="production-climate-section" aria-labelledby="production-climate-coverage-title">
            <div className="production-climate-section-heading">
              <div>
                <p className="section-kicker">Qualidade do recorte</p>
                <h2 id="production-climate-coverage-title">Cobertura anual</h2>
              </div>
            </div>
            <CoverageTable items={analysis.serie_anual} />
            <p className="production-climate-method-note">
              A cobertura climática indica municípios com pelo menos uma variável
              climática disponível no ano.
            </p>
          </section>
        </>
      )}
    </main>
  )
}
