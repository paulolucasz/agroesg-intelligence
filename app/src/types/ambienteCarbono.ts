export interface AmbienteCarbonoQuery {
  regiao?: string
  uf?: string
}

export interface EscopoAmbienteCarbono {
  cultura: string
  regioes: string[]
  ufs: string[]
  ano_inicio: number
  ano_fim: number
}

export interface ResumoAmbienteCarbono {
  carbono_solo_medio_municipal_2024_t_ha: number | null
  cobertura_natural_media_municipal_2024_pct: number | null
  soja_mapbiomas_media_municipal_2024_pct: number | null
  agricultura_media_municipal_2024_pct: number | null
  area_conversao_para_soja_2000_2019_total_ha: number | null
  ano_ultima_emissao_seeg_disponivel: number | null
  emissao_total_seeg_ultimo_ano_disponivel_t: number | null
}

export interface FotografiaSoloCobertura2024 {
  carbono_solo_medio_municipal_t_ha: number | null
  cobertura_natural_media_municipal_pct: number | null
  soja_mapbiomas_media_municipal_pct: number | null
  agricultura_media_municipal_pct: number | null
}

export interface TendenciasSoloCobertura {
  carbono_solo_tendencia_media_municipal_t_ha_ano: number | null
  carbono_solo_variacao_media_municipal_2019_2024_t_ha: number | null
  cobertura_natural_tendencia_media_municipal_pp_ano: number | null
  cobertura_natural_variacao_media_municipal_2019_2024_pp: number | null
  soja_mapbiomas_tendencia_media_municipal_pp_ano: number | null
  soja_mapbiomas_variacao_media_municipal_2019_2024_pp: number | null
}

export interface CoberturaSoloCobertura {
  municipios_considerados: number
  municipios_com_carbono_solo_2024: number
  municipios_com_cobertura_natural_2024: number
  municipios_com_soja_mapbiomas_2024: number
  municipios_com_agricultura_2024: number
}

export interface SoloCobertura {
  fotografia_2024: FotografiaSoloCobertura2024
  tendencias_consolidadas: TendenciasSoloCobertura
  cobertura_dados: CoberturaSoloCobertura
}

export interface CoberturaBrluc {
  municipios_considerados: number
  municipios_com_area_conversao_para_soja: number
  municipios_com_area_origem_natural: number
}

export interface ContextoBrluc {
  periodo_inicio_brluc: number | null
  periodo_fim_brluc: number | null
  area_conversao_para_soja_2000_2019_total_ha: number | null
  area_origem_natural_total_ha: number | null
  cobertura_dados: CoberturaBrluc
}

export interface CoberturaSeegAnual {
  municipios_considerados: number
  municipios_com_seeg_direta_disponivel: number
  municipios_com_seeg_indireta_disponivel: number
  municipios_com_seeg_total_disponivel: number
}

export interface StatusDadoSeeg {
  status: string | null
  municipios: number
}

export interface SerieEmissoesSeegItem {
  ano: number
  emissao_direta_co2e_gwp_ar6_soma_disponivel_t: number | null
  emissao_indireta_co2e_gwp_ar6_soma_disponivel_t: number | null
  emissao_total_co2e_gwp_ar6_soma_disponivel_t: number | null
  cobertura_dados: CoberturaSeegAnual
  status_dado_seeg: StatusDadoSeeg[]
}

export interface AmbienteCarbonoResponse {
  escopo: EscopoAmbienteCarbono
  resumo: ResumoAmbienteCarbono
  solo_cobertura: SoloCobertura
  contexto_brluc: ContextoBrluc
  serie_emissoes_seeg: SerieEmissoesSeegItem[]
}
