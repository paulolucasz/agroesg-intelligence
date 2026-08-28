export interface ProducaoClimaEscopo {
  cultura: string
  regioes: string[]
  ufs: string[]
  ano_inicio: number
  ano_fim: number
}

export interface ProducaoClimaResumo {
  producao_total_periodo_t: number | null
  producao_ultimo_ano_t: number | null
  area_colhida_ultimo_ano_ha: number | null
  rendimento_ultimo_ano_kg_ha: number | null
  precipitacao_media_anual_periodo_mm: number | null
  temperatura_media_anual_periodo_c: number | null
  umidade_media_anual_periodo_pct: number | null
}

export interface ProducaoClimaCoberturaAnual {
  municipios_considerados: number
  municipios_com_producao: number
  municipios_com_area_colhida: number
  municipios_com_producao_e_area_colhida: number
  municipios_com_clima: number
}

export interface ProducaoClimaSerieAnual {
  ano: number
  cobertura: ProducaoClimaCoberturaAnual
  producao_total_t: number | null
  area_colhida_total_ha: number | null
  rendimento_agregado_kg_ha: number | null
  precipitacao_media_municipal_mm: number | null
  temperatura_media_municipal_c: number | null
  umidade_media_municipal_pct: number | null
}

export interface ProducaoClimaResponse {
  escopo: ProducaoClimaEscopo
  resumo: ProducaoClimaResumo
  serie_anual: ProducaoClimaSerieAnual[]
}

export interface ProducaoClimaQuery {
  regiao?: string
  uf?: string
}
