export interface EscopoDashboard {
  cultura: string
  regioes: string[]
  ano_inicio: number | null
  ano_fim: number | null
}

export interface IndicadoresDashboard {
  total_municipios: number
  municipios_elegiveis: number | null
  municipios_dados_insuficientes: number | null
  municipios_estrategicos_base: number | null
  municipios_prioridade_robusta: number | null
  percentual_estrategicos_robustos: number | null
}

export interface DistribuicaoQuadrante {
  quadrante: string
  quantidade: number
}

export interface DashboardResumo {
  escopo: EscopoDashboard
  indicadores: IndicadoresDashboard
  distribuicao_quadrantes: DistribuicaoQuadrante[]
}
