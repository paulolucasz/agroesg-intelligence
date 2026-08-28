from pydantic import BaseModel


class IdentificacaoMunicipio(BaseModel):
    codigo_ibge: str
    municipio: str | None
    uf: str | None
    regiao: str | None
    quantidade_anos: int | None
    primeiro_ano_disponivel: int | None
    ultimo_ano_disponivel: int | None


class ProducaoMunicipio(BaseModel):
    producao_media_t: float | None
    area_colhida_media_ha: float | None
    rendimento_medio_kg_ha: float | None
    rendimento_cv_pct: float | None
    rendimento_tendencia_kg_ha_ano: float | None
    rendimento_variacao_2019_2024_kg_ha: float | None


class ClimaMunicipio(BaseModel):
    precipitacao_media_mm: float | None
    precipitacao_cv_pct: float | None
    temperatura_media_c: float | None
    temperatura_desvio_padrao_c: float | None
    umidade_media_pct: float | None
    umidade_desvio_padrao_pct: float | None
    pior_qualidade_climatica: str | None


class SoloCoberturaMunicipio(BaseModel):
    carbono_solo_2024_t_ha: float | None
    carbono_solo_tendencia_t_ha_ano: float | None
    carbono_solo_variacao_2019_2024_t_ha: float | None
    cobertura_natural_2024_pct: float | None
    cobertura_natural_tendencia_pp_ano: float | None
    cobertura_natural_variacao_2019_2024_pp: float | None
    soja_mapbiomas_2024_pct: float | None
    soja_mapbiomas_tendencia_pp_ano: float | None
    soja_mapbiomas_variacao_2019_2024_pp: float | None
    agricultura_2024_pct: float | None


class ContextoBrlucMunicipio(BaseModel):
    periodo_inicio_brluc: int | None
    periodo_fim_brluc: int | None
    area_conversao_para_soja_2000_2019_ha: float | None
    percentual_conversao_para_soja_pct: float | None
    area_origem_natural_ha: float | None
    emissao_absoluta_co2_t_ano: float | None
    taxa_emissao_co2_t_ha_ano: float | None
    taxa_emissao_co2_ic95_inf: float | None
    taxa_emissao_co2_ic95_sup: float | None
    flag_ic95_taxa_cruza_zero: bool | None


class PriorizacaoMunicipio(BaseModel):
    score_relevancia_produtiva: float | None
    score_pressao_agroambiental: float | None
    quadrante_priorizacao: str | None
    subscore_escala_produtiva: float | None
    subscore_eficiencia_produtiva: float | None
    subscore_presenca_soja: float | None
    subscore_instabilidade_produtiva: float | None
    subscore_variabilidade_climatica: float | None
    subscore_mudancas_ambientais: float | None
    subscore_historico_brluc: float | None
    faixa_confianca_modelo: str | None
    quantidade_cenarios_estrategico: int | None
    faixa_robustez_priorizacao: str | None
    flag_prioridade_estrategica_base: bool | None
    flag_prioridade_robusta_3_ou_4_cenarios: bool | None


class MunicipioDetalheResponse(BaseModel):
    identificacao: IdentificacaoMunicipio
    producao: ProducaoMunicipio
    clima: ClimaMunicipio
    solo_cobertura: SoloCoberturaMunicipio
    contexto_brluc: ContextoBrlucMunicipio
    priorizacao: PriorizacaoMunicipio


class MunicipioHistoricoIdentificacao(BaseModel):
    codigo_ibge: str
    municipio: str | None
    uf: str | None
    regiao: str | None


class PeriodoHistoricoMunicipio(BaseModel):
    ano_inicio: int
    ano_fim: int
    quantidade_registros: int


class HistoricoAnualItem(BaseModel):
    ano: int
    cultura: str | None
    area_plantada_ha: float | None
    area_colhida_ha: float | None
    area_nao_colhida_ha: float | None
    aproveitamento_area_pct: float | None
    quantidade_produzida_t: float | None
    rendimento_medio_kg_ha: float | None
    valor_producao_mil_reais: float | None
    precipitacao_anual_mm: float | None
    temperatura_media_anual_c: float | None
    umidade_media_anual_pct: float | None
    score_qualidade_climatica: int | None
    qualidade_climatica_geral: str | None
    carbono_solo_t_ha: float | None
    pct_cobertura_natural: float | None
    pct_floresta: float | None
    pct_agropecuaria: float | None
    pct_pastagem: float | None
    pct_agricultura: float | None
    pct_soja_mapbiomas: float | None
    status_dado_seeg: str | None
    emissao_direta_co2e_gwp_ar6_soma_disponivel_t: float | None
    emissao_indireta_co2e_gwp_ar6_soma_disponivel_t: float | None
    emissao_total_co2e_gwp_ar6_soma_disponivel_t: float | None
    emissao_total_co2e_gwp_ar6_t: float | None


class MunicipioHistoricoResponse(BaseModel):
    municipio: MunicipioHistoricoIdentificacao
    periodo: PeriodoHistoricoMunicipio
    items: list[HistoricoAnualItem]


class MunicipioSensibilidadeIdentificacao(BaseModel):
    codigo_ibge: str
    municipio: str | None
    uf: str | None
    regiao: str | None


class ResumoSensibilidadeMunicipio(BaseModel):
    quantidade_cenarios: int
    quantidade_cenarios_estrategico: int | None
    faixa_robustez_priorizacao: str | None
    prioridade_estrategica_base: bool | None
    prioridade_robusta: bool | None


class CenarioSensibilidadeMunicipio(BaseModel):
    cenario: str
    score_relevancia: float | None
    score_pressao: float | None
    estrategico: bool | None


class MunicipioSensibilidadeResponse(BaseModel):
    municipio: MunicipioSensibilidadeIdentificacao
    resumo: ResumoSensibilidadeMunicipio
    cenarios: list[CenarioSensibilidadeMunicipio]
