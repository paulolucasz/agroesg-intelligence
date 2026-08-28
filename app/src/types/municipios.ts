export interface IdentificacaoMunicipio {
  codigo_ibge: string
  municipio: string | null
  uf: string | null
  regiao: string | null
  quantidade_anos: number | null
  primeiro_ano_disponivel: number | null
  ultimo_ano_disponivel: number | null
}

export interface ProducaoMunicipio {
  producao_media_t: number | null
  area_colhida_media_ha: number | null
  rendimento_medio_kg_ha: number | null
  rendimento_cv_pct: number | null
  rendimento_tendencia_kg_ha_ano: number | null
  rendimento_variacao_2019_2024_kg_ha: number | null
}

export interface ClimaMunicipio {
  precipitacao_media_mm: number | null
  precipitacao_cv_pct: number | null
  temperatura_media_c: number | null
  temperatura_desvio_padrao_c: number | null
  umidade_media_pct: number | null
  umidade_desvio_padrao_pct: number | null
  pior_qualidade_climatica: string | null
}

export interface SoloCoberturaMunicipio {
  carbono_solo_2024_t_ha: number | null
  carbono_solo_tendencia_t_ha_ano: number | null
  carbono_solo_variacao_2019_2024_t_ha: number | null
  cobertura_natural_2024_pct: number | null
  cobertura_natural_tendencia_pp_ano: number | null
  cobertura_natural_variacao_2019_2024_pp: number | null
  soja_mapbiomas_2024_pct: number | null
  soja_mapbiomas_tendencia_pp_ano: number | null
  soja_mapbiomas_variacao_2019_2024_pp: number | null
  agricultura_2024_pct: number | null
}

export interface ContextoBrlucMunicipio {
  periodo_inicio_brluc: number | null
  periodo_fim_brluc: number | null
  area_conversao_para_soja_2000_2019_ha: number | null
  percentual_conversao_para_soja_pct: number | null
  area_origem_natural_ha: number | null
  emissao_absoluta_co2_t_ano: number | null
  taxa_emissao_co2_t_ha_ano: number | null
  taxa_emissao_co2_ic95_inf: number | null
  taxa_emissao_co2_ic95_sup: number | null
  flag_ic95_taxa_cruza_zero: boolean | null
}

export interface PriorizacaoMunicipio {
  score_relevancia_produtiva: number | null
  score_pressao_agroambiental: number | null
  quadrante_priorizacao: string | null
  subscore_escala_produtiva: number | null
  subscore_eficiencia_produtiva: number | null
  subscore_presenca_soja: number | null
  subscore_instabilidade_produtiva: number | null
  subscore_variabilidade_climatica: number | null
  subscore_mudancas_ambientais: number | null
  subscore_historico_brluc: number | null
  faixa_confianca_modelo: string | null
  quantidade_cenarios_estrategico: number | null
  faixa_robustez_priorizacao: string | null
  flag_prioridade_estrategica_base: boolean | null
  flag_prioridade_robusta_3_ou_4_cenarios: boolean | null
}

export interface MunicipioDetalheResponse {
  identificacao: IdentificacaoMunicipio
  producao: ProducaoMunicipio
  clima: ClimaMunicipio
  solo_cobertura: SoloCoberturaMunicipio
  contexto_brluc: ContextoBrlucMunicipio
  priorizacao: PriorizacaoMunicipio
}

export interface MunicipioHistoricoIdentificacao {
  codigo_ibge: string
  municipio: string | null
  uf: string | null
  regiao: string | null
}

export interface PeriodoHistoricoMunicipio {
  ano_inicio: number
  ano_fim: number
  quantidade_registros: number
}

export interface HistoricoAnualItem {
  ano: number
  cultura: string | null
  area_plantada_ha: number | null
  area_colhida_ha: number | null
  area_nao_colhida_ha: number | null
  aproveitamento_area_pct: number | null
  quantidade_produzida_t: number | null
  rendimento_medio_kg_ha: number | null
  valor_producao_mil_reais: number | null
  precipitacao_anual_mm: number | null
  temperatura_media_anual_c: number | null
  umidade_media_anual_pct: number | null
  score_qualidade_climatica: number | null
  qualidade_climatica_geral: string | null
  carbono_solo_t_ha: number | null
  pct_cobertura_natural: number | null
  pct_floresta: number | null
  pct_agropecuaria: number | null
  pct_pastagem: number | null
  pct_agricultura: number | null
  pct_soja_mapbiomas: number | null
  status_dado_seeg: string | null
  emissao_direta_co2e_gwp_ar6_soma_disponivel_t: number | null
  emissao_indireta_co2e_gwp_ar6_soma_disponivel_t: number | null
  emissao_total_co2e_gwp_ar6_soma_disponivel_t: number | null
}

export interface MunicipioHistoricoResponse {
  municipio: MunicipioHistoricoIdentificacao
  periodo: PeriodoHistoricoMunicipio
  items: HistoricoAnualItem[]
}

export interface MunicipioSensibilidadeIdentificacao {
  codigo_ibge: string
  municipio: string | null
  uf: string | null
  regiao: string | null
}

export interface ResumoSensibilidadeMunicipio {
  quantidade_cenarios: number
  quantidade_cenarios_estrategico: number | null
  faixa_robustez_priorizacao: string | null
  prioridade_estrategica_base: boolean | null
  prioridade_robusta: boolean | null
}

export interface CenarioSensibilidadeMunicipio {
  cenario: string
  score_relevancia: number | null
  score_pressao: number | null
  estrategico: boolean | null
}

export interface MunicipioSensibilidadeResponse {
  municipio: MunicipioSensibilidadeIdentificacao
  resumo: ResumoSensibilidadeMunicipio
  cenarios: CenarioSensibilidadeMunicipio[]
}
