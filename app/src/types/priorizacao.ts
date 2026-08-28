export interface FiltrosPriorizacaoAplicados {
  regiao: string | null
  uf: string | null
  municipio: string | null
  quadrante: string | null
  confianca: string | null
  robustez: string | null
  prioridade_estrategica: boolean | null
  prioridade_robusta: boolean | null
  elegivel: boolean | null
}

export interface PriorizacaoItem {
  codigo_ibge: string
  municipio: string | null
  uf: string | null
  regiao: string | null
  producao_media_t: number | null
  rendimento_medio_kg_ha: number | null
  precipitacao_media_mm: number | null
  carbono_solo_2024_t_ha: number | null
  cobertura_natural_2024_pct: number | null
  soja_mapbiomas_2024_pct: number | null
  score_relevancia_produtiva: number | null
  score_pressao_agroambiental: number | null
  quadrante_priorizacao: string | null
  faixa_confianca_modelo: string | null
  quantidade_cenarios_estrategico: number | null
  faixa_robustez_priorizacao: string | null
  flag_prioridade_estrategica_base: boolean | null
  flag_prioridade_robusta_3_ou_4_cenarios: boolean | null
}

export interface PaginacaoPriorizacao {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface PriorizacaoSort {
  field: string
  order: 'asc' | 'desc'
}

export interface PriorizacaoResponse {
  items: PriorizacaoItem[]
  pagination: PaginacaoPriorizacao
  sort: PriorizacaoSort
  filtros_aplicados: FiltrosPriorizacaoAplicados
}

export interface PriorizacaoQuery {
  page: number
  page_size: number
  municipio?: string
  regiao?: string
  uf?: string
  quadrante?: string
  confianca?: string
  robustez?: string
  prioridade_estrategica?: boolean
  prioridade_robusta?: boolean
}
