import { useEffect, useState } from 'react'

import { getCatalogoFiltros } from '../../api/catalogo'
import { getPriorizacao } from '../../api/priorizacao'
import type { CatalogoFiltros } from '../../types/catalogo'
import type {
  PriorizacaoItem,
  PriorizacaoResponse,
} from '../../types/priorizacao'

type FilterState = {
  regiao: string
  uf: string
  quadrante: string
  confianca: string
  robustez: string
  prioridade_estrategica: string
  prioridade_robusta: string
}

const initialFilters: FilterState = {
  regiao: '',
  uf: '',
  quadrante: '',
  confianca: '',
  robustez: '',
  prioridade_estrategica: '',
  prioridade_robusta: '',
}

function formatNumber(value: number | null, maximumFractionDigits = 0) {
  return value === null
    ? '—'
    : value.toLocaleString('pt-BR', { maximumFractionDigits })
}

function parseBooleanFilter(value: string): boolean | undefined {
  if (value === '') {
    return undefined
  }

  return value === 'true'
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

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
  getOptionLabel = (option) => option,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  disabled?: boolean
  getOptionLabel?: (option: string) => string
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
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function PriorizacaoTerritorial() {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [catalogo, setCatalogo] = useState<CatalogoFiltros | null>(null)
  const [catalogoLoading, setCatalogoLoading] = useState(true)
  const [catalogoError, setCatalogoError] = useState(false)
  const [priorizacao, setPriorizacao] = useState<PriorizacaoResponse | null>(
    null,
  )
  const [tableLoading, setTableLoading] = useState(true)
  const [tableError, setTableError] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let isMounted = true
    setCatalogoLoading(true)
    setCatalogoError(false)

    getCatalogoFiltros(filters.regiao ? { regiao: filters.regiao } : {})
      .then((data) => {
        if (isMounted) {
          setCatalogo(data)
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
  }, [filters.regiao])

  useEffect(() => {
    let isMounted = true
    setTableLoading(true)
    setTableError(false)

    getPriorizacao({
      page,
      page_size: 20,
      ...(filters.regiao ? { regiao: filters.regiao } : {}),
      ...(filters.uf ? { uf: filters.uf } : {}),
      ...(filters.quadrante ? { quadrante: filters.quadrante } : {}),
      ...(filters.confianca ? { confianca: filters.confianca } : {}),
      ...(filters.robustez ? { robustez: filters.robustez } : {}),
      ...(filters.prioridade_estrategica
        ? {
            prioridade_estrategica: parseBooleanFilter(
              filters.prioridade_estrategica,
            ),
          }
        : {}),
      ...(filters.prioridade_robusta
        ? {
            prioridade_robusta: parseBooleanFilter(filters.prioridade_robusta),
          }
        : {}),
    })
      .then((data) => {
        if (isMounted) {
          setPriorizacao(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setTableError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setTableLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [filters, page])

  function updateFilter<Key extends keyof FilterState>(
    key: Key,
    value: FilterState[Key],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === 'regiao' ? { uf: '' } : {}),
    }))
    setPage(1)
  }

  function renderTableRow(item: PriorizacaoItem) {
    return (
      <tr key={item.codigo_ibge}>
        <td className="municipality-cell">
          <strong>{item.municipio ?? '—'}</strong>
          <small>{item.codigo_ibge}</small>
        </td>
        <td>{item.uf ?? '—'}</td>
        <td>
          <span
            className={`quadrant-badge ${getQuadrantClass(
              item.quadrante_priorizacao,
            )}`}
          >
            {item.quadrante_priorizacao ?? '—'}
          </span>
        </td>
        <td>{formatNumber(item.score_relevancia_produtiva, 2)}</td>
        <td>{formatNumber(item.score_pressao_agroambiental, 2)}</td>
        <td>{formatNumber(item.producao_media_t, 2)}</td>
        <td>{formatNumber(item.quantidade_cenarios_estrategico)}</td>
        <td>{item.faixa_confianca_modelo ?? '—'}</td>
      </tr>
    )
  }

  const pagination = priorizacao?.pagination
  const hasRows = Boolean(priorizacao && priorizacao.items.length > 0)

  return (
    <div className="priorizacao-page">
      <section className="territorial-heading">
        <p className="eyebrow">Análise territorial</p>
        <h1>Priorização Territorial</h1>
        <p>
          Classificação relativa dos municípios a partir da combinação entre
          relevância produtiva e pressão agroambiental.
        </p>
        <p className="territorial-note">
          A priorização representa triagem territorial e não corresponde à
          certificação ou geração de créditos de carbono.
        </p>
      </section>

      <section className="filter-panel" aria-labelledby="filters-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Exploração</p>
            <h2 id="filters-title">Filtros da classificação</h2>
          </div>
          {catalogoLoading && (
            <p className="inline-status" role="status">
              Carregando filtros...
            </p>
          )}
        </div>

        {catalogoError && (
          <p className="inline-error" role="alert">
            Não foi possível carregar os filtros.
          </p>
        )}

        <div className="filter-grid">
          <SelectField
            label="Região"
            value={filters.regiao}
            options={catalogo?.regioes ?? []}
            onChange={(value) => updateFilter('regiao', value)}
            disabled={catalogoLoading}
          />
          <SelectField
            label="UF"
            value={filters.uf}
            options={catalogo?.ufs ?? []}
            onChange={(value) => updateFilter('uf', value)}
            disabled={catalogoLoading}
          />
          <SelectField
            label="Quadrante"
            value={filters.quadrante}
            options={catalogo?.quadrantes ?? []}
            onChange={(value) => updateFilter('quadrante', value)}
            disabled={catalogoLoading}
          />
          <SelectField
            label="Confiança"
            value={filters.confianca}
            options={catalogo?.faixas_confianca ?? []}
            onChange={(value) => updateFilter('confianca', value)}
            disabled={catalogoLoading}
          />
          <SelectField
            label="Robustez"
            value={filters.robustez}
            options={catalogo?.faixas_robustez ?? []}
            onChange={(value) => updateFilter('robustez', value)}
            disabled={catalogoLoading}
          />
          <SelectField
            label="Prioridade estratégica"
            value={filters.prioridade_estrategica}
            options={['true', 'false']}
            onChange={(value) => updateFilter('prioridade_estrategica', value)}
            getOptionLabel={(option) => (option === 'true' ? 'Sim' : 'Não')}
            disabled={catalogoLoading}
          />
          <SelectField
            label="Prioridade robusta"
            value={filters.prioridade_robusta}
            options={['true', 'false']}
            onChange={(value) => updateFilter('prioridade_robusta', value)}
            getOptionLabel={(option) => (option === 'true' ? 'Sim' : 'Não')}
            disabled={catalogoLoading}
          />
        </div>
      </section>

      <section className="table-panel" aria-labelledby="ranking-title">
        <div className="table-heading">
          <div>
            <p className="section-kicker">Resultado paginado</p>
            <h2 id="ranking-title">Municípios priorizados</h2>
          </div>
          {pagination && (
            <div className="table-summary">
              <strong>
                {pagination.total_items.toLocaleString('pt-BR')} municípios
                encontrados
              </strong>
              <span>
                Página {pagination.page} de {pagination.total_pages}
              </span>
            </div>
          )}
        </div>

        {tableLoading && (
          <p className="table-status" role="status">
            Carregando municípios...
          </p>
        )}

        {tableError && (
          <p className="table-status table-status-error" role="alert">
            Não foi possível carregar os municípios.
          </p>
        )}

        {!tableLoading && !tableError && !hasRows && (
          <p className="table-status">
            Nenhum município encontrado para os filtros selecionados.
          </p>
        )}

        {!tableError && hasRows && (
          <div className="table-scroll">
            <table className="priorizacao-table">
              <thead>
                <tr>
                  <th scope="col">Município</th>
                  <th scope="col">UF</th>
                  <th scope="col">Quadrante</th>
                  <th scope="col">Relevância</th>
                  <th scope="col">Pressão</th>
                  <th scope="col">Produção média (t)</th>
                  <th scope="col">Cenários estratégicos</th>
                  <th scope="col">Confiança</th>
                </tr>
              </thead>
              <tbody>{priorizacao?.items.map(renderTableRow)}</tbody>
            </table>
          </div>
        )}

        {pagination && pagination.total_pages > 0 && (
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-button"
              disabled={pagination.page <= 1 || tableLoading}
              onClick={() => setPage((current) => current - 1)}
            >
              Anterior
            </button>
            <span>
              Página {pagination.page} de {pagination.total_pages}
            </span>
            <button
              type="button"
              className="pagination-button"
              disabled={
                pagination.page >= pagination.total_pages || tableLoading
              }
              onClick={() => setPage((current) => current + 1)}
            >
              Próxima
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
