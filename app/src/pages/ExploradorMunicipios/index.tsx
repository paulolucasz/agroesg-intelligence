import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import {
  getMunicipioDetalhe,
  getMunicipioHistorico,
  getMunicipioSensibilidade,
} from '../../api/municipios'
import { getPriorizacao } from '../../api/priorizacao'
import type { PriorizacaoItem } from '../../types/priorizacao'
import type {
  CenarioSensibilidadeMunicipio,
  HistoricoAnualItem,
  MunicipioDetalheResponse,
  MunicipioHistoricoResponse,
  MunicipioSensibilidadeResponse,
} from '../../types/municipios'

type DataEntry = {
  label: string
  value: string
}

function formatNumber(value: number | null, maximumFractionDigits = 2): string {
  return value === null
    ? '—'
    : value.toLocaleString('pt-BR', { maximumFractionDigits })
}

function formatYear(value: number | null): string {
  return value === null ? '—' : String(value)
}

function formatPercent(value: number | null): string {
  return value === null ? '—' : `${formatNumber(value)}%`
}

function formatBoolean(value: boolean | null): string {
  if (value === null) {
    return '—'
  }

  return value ? 'Sim' : 'Não'
}

function formatText(value: string | null): string {
  return value ?? '—'
}

function getQuadrantClass(quadrante: string | null): string {
  switch (quadrante) {
    case 'Alta relevância + Alta pressão':
      return 'quadrant-badge-high'
    case 'Alta relevância + Baixa pressão':
      return 'quadrant-badge-positive'
    case 'Baixa relevância + Alta pressão':
      return 'quadrant-badge-attention'
    case 'Baixa relevância + Baixa pressão':
      return 'quadrant-badge-neutral'
    case 'Dados insuficientes':
      return 'quadrant-badge-muted'
    default:
      return 'quadrant-badge-neutral'
  }
}

function DataList({ entries }: { entries: DataEntry[] }) {
  return (
    <dl className="municipal-data-list">
      {entries.map((entry) => (
        <div key={entry.label}>
          <dt>{entry.label}</dt>
          <dd>{entry.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function MunicipalPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="municipal-panel">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function RequestState({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <p
      className="municipal-state"
      role={error ? 'alert' : 'status'}
      aria-live={error ? undefined : 'polite'}
    >
      {message}
    </p>
  )
}

function SearchResult({
  item,
  selected,
  onSelect,
}: {
  item: PriorizacaoItem
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      className={`municipal-result${selected ? ' municipal-result-selected' : ''}`}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="municipal-result-main">
        <strong>{formatText(item.municipio)}</strong>
        <small>
          {formatText(item.uf)} · Código IBGE {item.codigo_ibge}
        </small>
      </span>
      <span
        className={`quadrant-badge ${getQuadrantClass(item.quadrante_priorizacao)}`}
      >
        {formatText(item.quadrante_priorizacao)}
      </span>
    </button>
  )
}

function DetailContent({ detail }: { detail: MunicipioDetalheResponse }) {
  const { identificacao, producao, clima, solo_cobertura, contexto_brluc, priorizacao } =
    detail

  return (
    <div className="municipal-detail-grid">
      <MunicipalPanel title="Identificação">
        <DataList
          entries={[
            { label: 'Código IBGE', value: identificacao.codigo_ibge },
            { label: 'Município', value: formatText(identificacao.municipio) },
            { label: 'UF', value: formatText(identificacao.uf) },
            { label: 'Região', value: formatText(identificacao.regiao) },
            {
              label: 'Anos disponíveis',
              value: formatNumber(identificacao.quantidade_anos, 0),
            },
            {
              label: 'Primeiro ano',
              value: formatYear(identificacao.primeiro_ano_disponivel),
            },
            {
              label: 'Último ano',
              value: formatYear(identificacao.ultimo_ano_disponivel),
            },
          ]}
        />
      </MunicipalPanel>

      <MunicipalPanel title="Produção">
        <DataList
          entries={[
            { label: 'Produção média (t)', value: formatNumber(producao.producao_media_t) },
            {
              label: 'Área colhida média (ha)',
              value: formatNumber(producao.area_colhida_media_ha),
            },
            {
              label: 'Rendimento médio (kg/ha)',
              value: formatNumber(producao.rendimento_medio_kg_ha),
            },
            { label: 'CV do rendimento', value: formatPercent(producao.rendimento_cv_pct) },
            {
              label: 'Tendência do rendimento (kg/ha/ano)',
              value: formatNumber(producao.rendimento_tendencia_kg_ha_ano),
            },
            {
              label: 'Variação 2019–2024 (kg/ha)',
              value: formatNumber(producao.rendimento_variacao_2019_2024_kg_ha),
            },
          ]}
        />
      </MunicipalPanel>

      <MunicipalPanel title="Clima">
        <DataList
          entries={[
            {
              label: 'Precipitação média (mm)',
              value: formatNumber(clima.precipitacao_media_mm),
            },
            { label: 'CV da precipitação', value: formatPercent(clima.precipitacao_cv_pct) },
            {
              label: 'Temperatura média (°C)',
              value: formatNumber(clima.temperatura_media_c),
            },
            {
              label: 'Desvio padrão da temperatura (°C)',
              value: formatNumber(clima.temperatura_desvio_padrao_c),
            },
            { label: 'Umidade média', value: formatPercent(clima.umidade_media_pct) },
            {
              label: 'Desvio padrão da umidade',
              value: formatPercent(clima.umidade_desvio_padrao_pct),
            },
            {
              label: 'Pior qualidade climática',
              value: formatText(clima.pior_qualidade_climatica),
            },
          ]}
        />
      </MunicipalPanel>

      <MunicipalPanel title="Solo e cobertura">
        <DataList
          entries={[
            {
              label: 'Carbono do solo em 2024 (t/ha)',
              value: formatNumber(solo_cobertura.carbono_solo_2024_t_ha),
            },
            {
              label: 'Tendência do carbono (t/ha/ano)',
              value: formatNumber(solo_cobertura.carbono_solo_tendencia_t_ha_ano),
            },
            {
              label: 'Variação do carbono 2019–2024 (t/ha)',
              value: formatNumber(solo_cobertura.carbono_solo_variacao_2019_2024_t_ha),
            },
            {
              label: 'Cobertura natural em 2024',
              value: formatPercent(solo_cobertura.cobertura_natural_2024_pct),
            },
            {
              label: 'Tendência da cobertura natural (pp/ano)',
              value: formatNumber(solo_cobertura.cobertura_natural_tendencia_pp_ano),
            },
            {
              label: 'Soja MapBiomas em 2024',
              value: formatPercent(solo_cobertura.soja_mapbiomas_2024_pct),
            },
            {
              label: 'Tendência da soja MapBiomas (pp/ano)',
              value: formatNumber(solo_cobertura.soja_mapbiomas_tendencia_pp_ano),
            },
            {
              label: 'Agricultura em 2024',
              value: formatPercent(solo_cobertura.agricultura_2024_pct),
            },
          ]}
        />
      </MunicipalPanel>

      <MunicipalPanel title="Contexto BRLUC">
        <p className="municipal-panel-note">
          Contexto histórico de conversão para soja entre 2000 e 2019; não é uma
          estimativa anual de 2019–2024.
        </p>
        <DataList
          entries={[
            {
              label: 'Período',
              value:
                contexto_brluc.periodo_inicio_brluc === null ||
                contexto_brluc.periodo_fim_brluc === null
                  ? '—'
                  : `${contexto_brluc.periodo_inicio_brluc}–${contexto_brluc.periodo_fim_brluc}`,
            },
            {
              label: 'Área convertida para soja (ha)',
              value: formatNumber(contexto_brluc.area_conversao_para_soja_2000_2019_ha),
            },
            {
              label: 'Conversão para soja',
              value: formatPercent(contexto_brluc.percentual_conversao_para_soja_pct),
            },
            {
              label: 'Área de origem natural (ha)',
              value: formatNumber(contexto_brluc.area_origem_natural_ha),
            },
            {
              label: 'Emissão absoluta (t CO₂/ano)',
              value: formatNumber(contexto_brluc.emissao_absoluta_co2_t_ano),
            },
            {
              label: 'Taxa de emissão (t CO₂/ha/ano)',
              value: formatNumber(contexto_brluc.taxa_emissao_co2_t_ha_ano),
            },
            {
              label: 'IC95% da taxa',
              value:
                contexto_brluc.taxa_emissao_co2_ic95_inf === null ||
                contexto_brluc.taxa_emissao_co2_ic95_sup === null
                  ? '—'
                  : `${formatNumber(contexto_brluc.taxa_emissao_co2_ic95_inf)} a ${formatNumber(contexto_brluc.taxa_emissao_co2_ic95_sup)}`,
            },
            {
              label: 'IC95% cruza zero',
              value: formatBoolean(contexto_brluc.flag_ic95_taxa_cruza_zero),
            },
          ]}
        />
      </MunicipalPanel>

      <MunicipalPanel title="Priorização">
        <DataList
          entries={[
            {
              label: 'Score de relevância produtiva',
              value: formatNumber(priorizacao.score_relevancia_produtiva),
            },
            {
              label: 'Score de pressão agroambiental',
              value: formatNumber(priorizacao.score_pressao_agroambiental),
            },
            {
              label: 'Quadrante',
              value: formatText(priorizacao.quadrante_priorizacao),
            },
            { label: 'Confiança do modelo', value: formatText(priorizacao.faixa_confianca_modelo) },
            {
              label: 'Cenários estratégicos',
              value: formatNumber(priorizacao.quantidade_cenarios_estrategico, 0),
            },
            {
              label: 'Faixa de robustez',
              value: formatText(priorizacao.faixa_robustez_priorizacao),
            },
            {
              label: 'Prioridade estratégica base',
              value: formatBoolean(priorizacao.flag_prioridade_estrategica_base),
            },
            {
              label: 'Prioridade robusta em 3 ou 4 cenários',
              value: formatBoolean(priorizacao.flag_prioridade_robusta_3_ou_4_cenarios),
            },
            {
              label: 'Subscore de escala produtiva',
              value: formatNumber(priorizacao.subscore_escala_produtiva),
            },
            {
              label: 'Subscore de eficiência produtiva',
              value: formatNumber(priorizacao.subscore_eficiencia_produtiva),
            },
            {
              label: 'Subscore de presença de soja',
              value: formatNumber(priorizacao.subscore_presenca_soja),
            },
            {
              label: 'Subscore de instabilidade produtiva',
              value: formatNumber(priorizacao.subscore_instabilidade_produtiva),
            },
            {
              label: 'Subscore de variabilidade climática',
              value: formatNumber(priorizacao.subscore_variabilidade_climatica),
            },
            {
              label: 'Subscore de mudanças ambientais',
              value: formatNumber(priorizacao.subscore_mudancas_ambientais),
            },
            {
              label: 'Subscore de histórico BRLUC',
              value: formatNumber(priorizacao.subscore_historico_brluc),
            },
          ]}
        />
      </MunicipalPanel>
    </div>
  )
}

function HistoryTable({ history }: { history: MunicipioHistoricoResponse }) {
  return (
    <div className="table-scroll municipal-history-scroll">
      <table className="municipal-history-table">
        <thead>
          <tr>
            <th scope="col">Ano</th>
            <th scope="col">Cultura</th>
            <th scope="col">Produção (t)</th>
            <th scope="col">Área colhida (ha)</th>
            <th scope="col">Rendimento (kg/ha)</th>
            <th scope="col">Precipitação (mm)</th>
            <th scope="col">Temperatura (°C)</th>
            <th scope="col">Carbono do solo (t/ha)</th>
            <th scope="col">Cobertura natural</th>
            <th scope="col">Soja MapBiomas</th>
            <th scope="col">Total SEEG disponível (t CO₂e)</th>
            <th scope="col">Status SEEG</th>
          </tr>
        </thead>
        <tbody>
          {history.items.map((item: HistoricoAnualItem) => (
            <tr key={item.ano}>
              <td>{item.ano}</td>
              <td>{formatText(item.cultura)}</td>
              <td>{formatNumber(item.quantidade_produzida_t)}</td>
              <td>{formatNumber(item.area_colhida_ha)}</td>
              <td>{formatNumber(item.rendimento_medio_kg_ha)}</td>
              <td>{formatNumber(item.precipitacao_anual_mm)}</td>
              <td>{formatNumber(item.temperatura_media_anual_c)}</td>
              <td>{formatNumber(item.carbono_solo_t_ha)}</td>
              <td>{formatPercent(item.pct_cobertura_natural)}</td>
              <td>{formatPercent(item.pct_soja_mapbiomas)}</td>
              <td>{formatNumber(item.emissao_total_co2e_gwp_ar6_soma_disponivel_t)}</td>
              <td>{formatText(item.status_dado_seeg)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SensitivityContent({
  sensitivity,
}: {
  sensitivity: MunicipioSensibilidadeResponse
}) {
  const { resumo } = sensitivity

  return (
    <>
      <div className="municipal-sensitivity-summary">
        <div>
          <span>Cenários avaliados</span>
          <strong>{resumo.quantidade_cenarios}</strong>
        </div>
        <div>
          <span>Cenários estratégicos</span>
          <strong>{formatNumber(resumo.quantidade_cenarios_estrategico, 0)}</strong>
        </div>
        <div>
          <span>Faixa de robustez</span>
          <strong>{formatText(resumo.faixa_robustez_priorizacao)}</strong>
        </div>
        <div>
          <span>Prioridade estratégica base</span>
          <strong>{formatBoolean(resumo.prioridade_estrategica_base)}</strong>
        </div>
        <div>
          <span>Prioridade robusta</span>
          <strong>{formatBoolean(resumo.prioridade_robusta)}</strong>
        </div>
      </div>

      <div className="table-scroll municipal-sensitivity-scroll">
        <table className="municipal-sensitivity-table">
          <thead>
            <tr>
              <th scope="col">Cenário</th>
              <th scope="col">Score de relevância</th>
              <th scope="col">Score de pressão</th>
              <th scope="col">Estratégico</th>
            </tr>
          </thead>
          <tbody>
            {sensitivity.cenarios.map((cenario: CenarioSensibilidadeMunicipio) => (
              <tr key={cenario.cenario}>
                <td>{cenario.cenario}</td>
                <td>{formatNumber(cenario.score_relevancia)}</td>
                <td>{formatNumber(cenario.score_pressao)}</td>
                <td>{formatBoolean(cenario.estrategico)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function ExploradorMunicipios() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<PriorizacaoItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selected, setSelected] = useState<PriorizacaoItem | null>(null)
  const [detail, setDetail] = useState<MunicipioDetalheResponse | null>(null)
  const [history, setHistory] = useState<MunicipioHistoricoResponse | null>(null)
  const [sensitivity, setSensitivity] =
    useState<MunicipioSensibilidadeResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [sensitivityLoading, setSensitivityLoading] = useState(false)
  const [detailError, setDetailError] = useState(false)
  const [historyError, setHistoryError] = useState(false)
  const [sensitivityError, setSensitivityError] = useState(false)

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const municipio = searchTerm.trim()

    setHasSearched(true)
    setSearchError(false)

    if (!municipio) {
      setResults([])
      return
    }

    setSearchLoading(true)
    getPriorizacao({ page: 1, page_size: 10, municipio })
      .then((response) => {
        setResults(response.items)
      })
      .catch(() => {
        setResults([])
        setSearchError(true)
      })
      .finally(() => {
        setSearchLoading(false)
      })
  }

  useEffect(() => {
    if (!selected) {
      return
    }

    let isMounted = true
    const codigoIbge = selected.codigo_ibge

    setDetail(null)
    setHistory(null)
    setSensitivity(null)
    setDetailLoading(true)
    setHistoryLoading(true)
    setSensitivityLoading(true)
    setDetailError(false)
    setHistoryError(false)
    setSensitivityError(false)

    getMunicipioDetalhe(codigoIbge)
      .then((response) => {
        if (isMounted) {
          setDetail(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setDetailError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setDetailLoading(false)
        }
      })

    getMunicipioHistorico(codigoIbge)
      .then((response) => {
        if (isMounted) {
          setHistory(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setHistoryError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setHistoryLoading(false)
        }
      })

    getMunicipioSensibilidade(codigoIbge)
      .then((response) => {
        if (isMounted) {
          setSensitivity(response)
        }
      })
      .catch(() => {
        if (isMounted) {
          setSensitivityError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setSensitivityLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selected])

  return (
    <main className="municipal-page">
      <header className="municipal-hero">
        <div className="municipal-hero-copy">
          <p className="eyebrow">EXPLORAÇÃO MUNICIPAL</p>
          <h1>Explorador de Municípios</h1>
          <p>
            Consulta detalhada dos indicadores produtivos, climáticos, ambientais
            e de priorização por município.
          </p>
          <p className="municipal-note">
            Os dados representam análise territorial e não correspondem à
            certificação de créditos de carbono.
          </p>
        </div>

        <form className="municipal-search" onSubmit={handleSearch}>
          <label htmlFor="municipio-search">Buscar município</label>
          <div className="municipal-search-row">
            <input
              id="municipio-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Digite o nome do município"
            />
            <button type="submit" disabled={searchLoading}>
              {searchLoading ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
        </form>
      </header>

      {(hasSearched || searchLoading || searchError) && (
        <section className="municipal-section" aria-labelledby="municipal-results-title">
          <div className="municipal-section-heading">
            <div>
              <p className="section-kicker">Busca territorial</p>
              <h2 id="municipal-results-title">Resultados da busca</h2>
            </div>
            <p className="municipal-section-caption">Até 10 municípios por consulta.</p>
          </div>

          {searchLoading && <RequestState message="Buscando municípios…" />}
          {searchError && (
            <RequestState
              message="Não foi possível realizar a busca. Tente novamente."
              error
            />
          )}
          {!searchLoading && !searchError && results.length === 0 && (
            <RequestState
              message={
                searchTerm.trim()
                  ? 'Nenhum município encontrado para essa busca.'
                  : 'Digite um município para iniciar a busca.'
              }
            />
          )}
          {!searchLoading && !searchError && results.length > 0 && (
            <div className="municipal-results-list">
              {results.map((item) => (
                <SearchResult
                  key={item.codigo_ibge}
                  item={item}
                  selected={item.codigo_ibge === selected?.codigo_ibge}
                  onSelect={() => setSelected(item)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {selected && (
        <section className="municipal-selected" aria-labelledby="selected-municipality-title">
          <div>
            <p className="section-kicker">Município selecionado</p>
            <h2 id="selected-municipality-title">
              {formatText(selected.municipio)}
            </h2>
            <p>
              {formatText(selected.uf)} · Código IBGE {selected.codigo_ibge}
            </p>
          </div>
          <span className={`quadrant-badge ${getQuadrantClass(selected.quadrante_priorizacao)}`}>
            {formatText(selected.quadrante_priorizacao)}
          </span>
        </section>
      )}

      {selected && (
        <>
          <section className="municipal-section" aria-labelledby="municipal-detail-title">
            <div className="municipal-section-heading">
              <div>
                <p className="section-kicker">Indicadores municipais</p>
                <h2 id="municipal-detail-title">Detalhe municipal</h2>
              </div>
            </div>
            {detailLoading && <RequestState message="Carregando detalhe municipal…" />}
            {detailError && (
              <RequestState
                message="Não foi possível carregar o detalhe municipal."
                error
              />
            )}
            {!detailLoading && !detailError && detail && <DetailContent detail={detail} />}
          </section>

          <section className="municipal-section" aria-labelledby="municipal-history-title">
            <div className="municipal-section-heading">
              <div>
                <p className="section-kicker">Série anual</p>
                <h2 id="municipal-history-title">Histórico anual</h2>
              </div>
              {history && (
                <p className="municipal-section-caption">
                  {history.periodo.ano_inicio}–{history.periodo.ano_fim} ·{' '}
                  {history.periodo.quantidade_registros} registros
                </p>
              )}
            </div>
            {historyLoading && <RequestState message="Carregando histórico anual…" />}
            {historyError && (
              <RequestState
                message="Não foi possível carregar o histórico anual."
                error
              />
            )}
            {!historyLoading && !historyError && history && history.items.length === 0 && (
              <RequestState message="Não há registros anuais para este município." />
            )}
            {!historyLoading && !historyError && history && history.items.length > 0 && (
              <HistoryTable history={history} />
            )}
          </section>

          <section className="municipal-section" aria-labelledby="municipal-sensitivity-title">
            <div className="municipal-section-heading">
              <div>
                <p className="section-kicker">Estabilidade do modelo</p>
                <h2 id="municipal-sensitivity-title">Sensibilidade aos cenários</h2>
              </div>
            </div>
            {sensitivityLoading && <RequestState message="Carregando sensibilidade…" />}
            {sensitivityError && (
              <RequestState
                message="Não foi possível carregar a sensibilidade aos cenários."
                error
              />
            )}
            {!sensitivityLoading && !sensitivityError && sensitivity && sensitivity.cenarios.length === 0 && (
              <RequestState message="Não há cenários de sensibilidade para este município." />
            )}
            {!sensitivityLoading && !sensitivityError && sensitivity && sensitivity.cenarios.length > 0 && (
              <SensitivityContent sensitivity={sensitivity} />
            )}
          </section>
        </>
      )}
    </main>
  )
}
