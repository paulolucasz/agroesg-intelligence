export interface ReferenciaSensibilidade {
  cenario_base: string
  estrategicos_base: number | null
  quantidade_cenarios: number
}

export interface CenarioSensibilidadeResumo {
  cenario: string
  estrategicos_cenario: number | null
  estrategicos_em_comum_com_base: number | null
  retencao_dos_225_base_pct: number | null
  jaccard_pct: number | null
  spearman_relevancia_vs_base: number | null
  spearman_pressao_vs_base: number | null
}

export interface SensibilidadeResumoResponse {
  referencia: ReferenciaSensibilidade
  cenarios: CenarioSensibilidadeResumo[]
}
