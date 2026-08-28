import { useEffect, useState } from 'react'

import { getAmbienteCarbono } from '../../api/ambienteCarbono'
import { getCatalogoFiltros } from '../../api/catalogo'
import { MetricCard } from '../../components/MetricCard'
import { SeegEmissionsChart } from '../../components/SeegEmissionsChart'
import type { AmbienteCarbonoResponse } from '../../types/ambienteCarbono'
import type { CatalogoFiltros } from '../../types/catalogo'

const UFS_POR_REGIAO_AMBIENTE_CARBONO: Record<string, string[]> = {
  'Centro-Oeste': ['DF', 'GO', 'MS', 'MT'],
  Sul: ['PR', 'RS', 'SC'],
}
const REGIOES_AMBIENTE_CARBONO = Object.keys(
  UFS_POR_REGIAO_AMBIENTE_CARBONO,
)
const UFS_AMBIENTE_CARBONO = Object.values(
  UFS_POR_REGIAO_AMBIENTE_CARBONO,
).flat()

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})
const integerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})

function formatNumber(value: number | null, integer = false): string {
  if (value === null) {
    return '—'
  }

  return (integer ? integerFormatter : numberFormatter).format(value)
}

function formatYear(value: number | null): string {
  return value === null ? '—' : String(value)
}

function formatMetric(
  value: number | null,
  unit: string,
  integer = false,
): string {
  const formatted = formatNumber(value, integer)
  return formatted === '—' ? formatted : `${formatted} ${unit}`
}

function formatScopeList(values: string[]): string {
  return values.length > 0 ? values.join(' + ') : '—'
}

function RequestState({
  message,
  error = false,
}: {
  message: string
  error?: boolean
}) {
  return (
    <p
      className={`environment-carbon-state${error ? ' environment-carbon-state-error' : ''}`}
      role={error ? 'alert' : 'status'}
      aria-live={error ? undefined : 'polite'}
    >
      {message}
    </p>
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

function ScopeSummary({ data }: { data: AmbienteCarbonoResponse }) {
  return (
    <div className="environment-carbon-scope" aria-label="Escopo resolvido">
      <span>{data.escopo.cultura.toLocaleUpperCase('pt-BR')}</span>
      <span>{formatScopeList(data.escopo.regioes)}</span>
      <span>{formatScopeList(data.escopo.ufs)}</span>
      <span>
        {data.escopo.ano_inicio}–{data.escopo.ano_fim}
      </span>
    </div>
  )
}

function SummaryCards({ data }: { data: AmbienteCarbonoResponse }) {
  const { resumo } = data

  return (
    <div className="indicator-grid environment-carbon-metric-grid">
      <MetricCard
        title="Carbono médio do solo em 2024"
        value={formatMetric(resumo.carbono_solo_medio_municipal_2024_t_ha, 't/ha')}
        caption="Média municipal"
      />
      <MetricCard
        title="Cobertura natural média em 2024"
        value={formatMetric(resumo.cobertura_natural_media_municipal_2024_pct, '%')}
        caption="Média municipal"
      />
      <MetricCard
        title="Soja MapBiomas média em 2024"
        value={formatMetric(resumo.soja_mapbiomas_media_municipal_2024_pct, '%')}
        caption="Média municipal"
      />
      <MetricCard
        title="Agricultura média em 2024"
        value={formatMetric(resumo.agricultura_media_municipal_2024_pct, '%')}
        caption="Média municipal"
      />
      <MetricCard
        title="Área histórica convertida para soja"
        value={formatMetric(
          resumo.area_conversao_para_soja_2000_2019_total_ha,
          'ha',
        )}
        caption="BRLUC 2000–2019"
      />
      <MetricCard
        title="Emissão SEEG no último ano disponível"
        value={formatMetric(
          resumo.emissao_total_seeg_ultimo_ano_disponivel_t,
          't CO₂e',
        )}
        caption={
          resumo.ano_ultima_emissao_seeg_disponivel === null
            ? 'Ano não disponível'
            : `Ano ${resumo.ano_ultima_emissao_seeg_disponivel}`
        }
      />
    </div>
  )
}

function KeyValueGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>
}) {
  return (
    <dl className="environment-carbon-key-value-grid">
      {items.map((item) => (
        <div key={item.label} className="environment-carbon-key-value">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function SoilCoverageSection({ data }: { data: AmbienteCarbonoResponse }) {
  const { fotografia_2024, tendencias_consolidadas, cobertura_dados } =
    data.solo_cobertura

  return (
    <section className="environment-carbon-section" aria-labelledby="soil-coverage-title">
      <div className="environment-carbon-section-heading">
        <div>
          <p className="section-kicker">Solo e cobertura</p>
          <h2 id="soil-coverage-title">Solo e cobertura</h2>
          <p className="environment-carbon-section-description">
            Fotografia municipal média de 2024 e tendências consolidadas do período.
          </p>
        </div>
      </div>

      <div className="environment-carbon-subsection-grid">
        <article className="environment-carbon-subsection">
          <h3>Fotografia 2024</h3>
          <KeyValueGrid
            items={[
              {
                label: 'Carbono do solo médio municipal',
                value: formatMetric(fotografia_2024.carbono_solo_medio_municipal_t_ha, 't/ha'),
              },
              {
                label: 'Cobertura natural média municipal',
                value: formatMetric(fotografia_2024.cobertura_natural_media_municipal_pct, '%'),
              },
              {
                label: 'Soja MapBiomas média municipal',
                value: formatMetric(fotografia_2024.soja_mapbiomas_media_municipal_pct, '%'),
              },
              {
                label: 'Agricultura média municipal',
                value: formatMetric(fotografia_2024.agricultura_media_municipal_pct, '%'),
              },
            ]}
          />
        </article>

        <article className="environment-carbon-subsection">
          <h3>Tendências consolidadas</h3>
          <KeyValueGrid
            items={[
              {
                label: 'Tendência de carbono do solo',
                value: formatMetric(
                  tendencias_consolidadas.carbono_solo_tendencia_media_municipal_t_ha_ano,
                  't/ha/ano',
                ),
              },
              {
                label: 'Variação de carbono do solo 2019–2024',
                value: formatMetric(
                  tendencias_consolidadas.carbono_solo_variacao_media_municipal_2019_2024_t_ha,
                  't/ha',
                ),
              },
              {
                label: 'Tendência de cobertura natural',
                value: formatMetric(
                  tendencias_consolidadas.cobertura_natural_tendencia_media_municipal_pp_ano,
                  'pp/ano',
                ),
              },
              {
                label: 'Variação de cobertura natural 2019–2024',
                value: formatMetric(
                  tendencias_consolidadas.cobertura_natural_variacao_media_municipal_2019_2024_pp,
                  'pp',
                ),
              },
              {
                label: 'Tendência de soja MapBiomas',
                value: formatMetric(
                  tendencias_consolidadas.soja_mapbiomas_tendencia_media_municipal_pp_ano,
                  'pp/ano',
                ),
              },
              {
                label: 'Variação de soja MapBiomas 2019–2024',
                value: formatMetric(
                  tendencias_consolidadas.soja_mapbiomas_variacao_media_municipal_2019_2024_pp,
                  'pp',
                ),
              },
            ]}
          />
        </article>
      </div>

      <div className="environment-carbon-subsection environment-carbon-coverage-block">
        <h3>Cobertura dos indicadores</h3>
        <KeyValueGrid
          items={[
            {
              label: 'Municípios considerados',
              value: formatNumber(cobertura_dados.municipios_considerados, true),
            },
            {
              label: 'Com carbono do solo em 2024',
              value: formatNumber(cobertura_dados.municipios_com_carbono_solo_2024, true),
            },
            {
              label: 'Com cobertura natural em 2024',
              value: formatNumber(cobertura_dados.municipios_com_cobertura_natural_2024, true),
            },
            {
              label: 'Com soja MapBiomas em 2024',
              value: formatNumber(cobertura_dados.municipios_com_soja_mapbiomas_2024, true),
            },
            {
              label: 'Com agricultura em 2024',
              value: formatNumber(cobertura_dados.municipios_com_agricultura_2024, true),
            },
          ]}
        />
      </div>
    </section>
  )
}

function BrlucSection({ data }: { data: AmbienteCarbonoResponse }) {
  const { contexto_brluc } = data
  const { cobertura_dados } = contexto_brluc

  return (
    <section className="environment-carbon-section environment-carbon-section-separated" aria-labelledby="brluc-title">
      <div className="environment-carbon-section-heading">
        <div>
          <p className="section-kicker">Contexto histórico</p>
          <h2 id="brluc-title">Uso histórico da terra — BRLUC</h2>
        </div>
      </div>
      <KeyValueGrid
        items={[
          {
            label: 'Período inicial',
            value: formatYear(contexto_brluc.periodo_inicio_brluc),
          },
          {
            label: 'Período final',
            value: formatYear(contexto_brluc.periodo_fim_brluc),
          },
          {
            label: 'Área convertida para soja',
            value: formatMetric(
              contexto_brluc.area_conversao_para_soja_2000_2019_total_ha,
              'ha',
            ),
          },
          {
            label: 'Área de origem natural',
            value: formatMetric(contexto_brluc.area_origem_natural_total_ha, 'ha'),
          },
          {
            label: 'Municípios considerados',
            value: formatNumber(cobertura_dados.municipios_considerados, true),
          },
          {
            label: 'Com área convertida para soja',
            value: formatNumber(
              cobertura_dados.municipios_com_area_conversao_para_soja,
              true,
            ),
          },
          {
            label: 'Com área de origem natural',
            value: formatNumber(cobertura_dados.municipios_com_area_origem_natural, true),
          },
        ]}
      />
      <p className="environment-carbon-method-note">
        O bloco BRLUC apresenta contexto histórico municipal de conversão para soja no período de 2000–2019. Não representa uma série anual de 2019–2024.
      </p>
    </section>
  )
}

function SeegStatus({
  statuses,
}: {
  statuses: AmbienteCarbonoResponse['serie_emissoes_seeg'][number]['status_dado_seeg']
}) {
  if (statuses.length === 0) {
    return <span>—</span>
  }

  return (
    <div className="environment-carbon-status-list">
      {statuses.map((item, index) => (
        <span key={`${item.status ?? 'ausente'}-${index}`}>
          {item.status ?? '—'}: {formatNumber(item.municipios, true)}
        </span>
      ))}
    </div>
  )
}

function SeegSection({ data }: { data: AmbienteCarbonoResponse }) {
  return (
    <section className="environment-carbon-section" aria-labelledby="seeg-title">
      <div className="environment-carbon-section-heading">
        <div>
          <p className="section-kicker">Série anual</p>
          <h2 id="seeg-title">Emissões associadas a resíduos agrícolas</h2>
          <p className="environment-carbon-section-description">
            N₂O associado a resíduos agrícolas da soja em solos manejados, incluindo componentes diretos e indiretos quando disponíveis, expresso em CO₂e GWP-AR6.
          </p>
        </div>
      </div>
      <p className="environment-carbon-method-note">
        Este recorte não representa todas as emissões da soja nem um inventário completo da cultura.
      </p>

      <article className="environment-carbon-chart-card">
        <div className="environment-carbon-chart-heading">
          <h3>Evolução anual das emissões disponíveis</h3>
          <p>
            N₂O associado a resíduos agrícolas da soja em solos manejados, expresso em CO₂e GWP-AR6.
          </p>
        </div>
        <div className="environment-carbon-chart-area">
          <SeegEmissionsChart items={data.serie_emissoes_seeg} />
        </div>
      </article>

      <div className="environment-carbon-table-scroll">
        <table className="environment-carbon-table">
          <thead>
            <tr>
              <th scope="col">Ano</th>
              <th scope="col">Emissão direta (t CO₂e)</th>
              <th scope="col">Emissão indireta (t CO₂e)</th>
              <th scope="col">Total disponível (t CO₂e)</th>
              <th scope="col">Municípios considerados</th>
              <th scope="col">Com total disponível</th>
              <th scope="col">Status dos dados</th>
            </tr>
          </thead>
          <tbody>
            {data.serie_emissoes_seeg.map((item) => (
              <tr key={item.ano}>
                <td>{item.ano}</td>
                <td>
                  {formatNumber(item.emissao_direta_co2e_gwp_ar6_soma_disponivel_t)}
                </td>
                <td>
                  {formatNumber(item.emissao_indireta_co2e_gwp_ar6_soma_disponivel_t)}
                </td>
                <td>
                  {formatNumber(item.emissao_total_co2e_gwp_ar6_soma_disponivel_t)}
                </td>
                <td>{formatNumber(item.cobertura_dados.municipios_considerados, true)}</td>
                <td>
                  {formatNumber(item.cobertura_dados.municipios_com_seeg_total_disponivel, true)}
                </td>
                <td>
                  <SeegStatus statuses={item.status_dado_seeg} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function AmbienteCarbono() {
  const [catalogo, setCatalogo] = useState<CatalogoFiltros | null>(null)
  const [catalogoLoading, setCatalogoLoading] = useState(true)
  const [catalogoError, setCatalogoError] = useState(false)
  const [regiao, setRegiao] = useState('')
  const [uf, setUf] = useState('')
  const [analysis, setAnalysis] = useState<AmbienteCarbonoResponse | null>(null)
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
          setUf((currentUf) => {
            if (regiao && currentUf && !response.ufs.includes(currentUf)) {
              return ''
            }

            return currentUf
          })
        }
      })
      .catch(() => {
        if (isMounted) {
          setCatalogoError(true)
          setCatalogo(null)
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

    getAmbienteCarbono({
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
    ? REGIOES_AMBIENTE_CARBONO.filter((value) => catalogo.regioes.includes(value))
    : []
  const ufsPermitidas = regiao
    ? UFS_POR_REGIAO_AMBIENTE_CARBONO[regiao] ?? []
    : UFS_AMBIENTE_CARBONO
  const ufOptions = catalogo
    ? ufsPermitidas.filter((value) => catalogo.ufs.includes(value))
    : []
  const hasAnalysisData = analysis
    ? analysis.serie_emissoes_seeg.length > 0 ||
      analysis.solo_cobertura.cobertura_dados.municipios_considerados > 0 ||
      analysis.contexto_brluc.cobertura_dados.municipios_considerados > 0
    : false

  return (
    <main className="environment-carbon-page">
      <header className="environment-carbon-hero">
        <div className="environment-carbon-hero-copy">
          <p className="eyebrow">AMBIENTE E CARBONO</p>
          <h1>Ambiente &amp; Carbono</h1>
          <p>
            Indicadores de carbono do solo, cobertura da terra, conversão histórica para soja e emissões associadas a resíduos agrícolas.
          </p>
          <p className="environment-carbon-note">
            Os indicadores apresentados representam contexto agroambiental territorial e não correspondem a créditos de carbono certificados.
          </p>
        </div>
      </header>

      <section className="filter-panel environment-carbon-filter-panel" aria-labelledby="environment-carbon-filters-title">
        <div className="table-heading">
          <div>
            <p className="section-kicker">Recorte territorial</p>
            <h2 id="environment-carbon-filters-title">Filtros</h2>
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

      {analysisLoading && (
        <RequestState message="Carregando indicadores ambientais..." />
      )}
      {analysisError && (
        <RequestState
          message="Não foi possível carregar os dados ambientais."
          error
        />
      )}
      {!analysisLoading && !analysisError && analysis && !hasAnalysisData && (
        <RequestState message="Não há dados ambientais para o recorte selecionado." />
      )}

      {!analysisLoading && !analysisError && analysis && hasAnalysisData && (
        <>
          <section className="environment-carbon-section environment-carbon-scope-section" aria-labelledby="environment-carbon-scope-title">
            <div className="environment-carbon-section-heading">
              <div>
                <p className="section-kicker">Escopo resolvido</p>
                <h2 id="environment-carbon-scope-title">Recorte analisado</h2>
              </div>
            </div>
            <ScopeSummary data={analysis} />
          </section>

          <section className="environment-carbon-section" aria-labelledby="environment-carbon-summary-title">
            <div className="environment-carbon-section-heading">
              <div>
                <p className="section-kicker">Indicadores principais</p>
                <h2 id="environment-carbon-summary-title">Resumo ambiental</h2>
              </div>
            </div>
            <SummaryCards data={analysis} />
          </section>

          <SoilCoverageSection data={analysis} />
          <BrlucSection data={analysis} />
          <SeegSection data={analysis} />
        </>
      )}
    </main>
  )
}
