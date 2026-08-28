from pydantic import BaseModel


class EscopoProducaoClimaResponse(BaseModel):
    cultura: str
    regioes: list[str]
    ufs: list[str]
    ano_inicio: int
    ano_fim: int


class CoberturaProducaoClimaAnual(BaseModel):
    municipios_considerados: int
    municipios_com_producao: int
    municipios_com_area_colhida: int
    municipios_com_producao_e_area_colhida: int
    municipios_com_clima: int


class SerieProducaoClimaItem(BaseModel):
    ano: int
    cobertura: CoberturaProducaoClimaAnual
    producao_total_t: float | None
    area_colhida_total_ha: float | None
    rendimento_agregado_kg_ha: float | None
    precipitacao_media_municipal_mm: float | None
    temperatura_media_municipal_c: float | None
    umidade_media_municipal_pct: float | None


class ResumoProducaoClimaResponse(BaseModel):
    producao_total_periodo_t: float | None
    producao_ultimo_ano_t: float | None
    area_colhida_ultimo_ano_ha: float | None
    rendimento_ultimo_ano_kg_ha: float | None
    precipitacao_media_anual_periodo_mm: float | None
    temperatura_media_anual_periodo_c: float | None
    umidade_media_anual_periodo_pct: float | None


class ProducaoClimaResponse(BaseModel):
    escopo: EscopoProducaoClimaResponse
    resumo: ResumoProducaoClimaResponse
    serie_anual: list[SerieProducaoClimaItem]


class EscopoAmbienteCarbonoResponse(BaseModel):
    cultura: str
    regioes: list[str]
    ufs: list[str]
    ano_inicio: int
    ano_fim: int


class ResumoAmbienteCarbonoResponse(BaseModel):
    carbono_solo_medio_municipal_2024_t_ha: float | None
    cobertura_natural_media_municipal_2024_pct: float | None
    soja_mapbiomas_media_municipal_2024_pct: float | None
    agricultura_media_municipal_2024_pct: float | None
    area_conversao_para_soja_2000_2019_total_ha: float | None
    ano_ultima_emissao_seeg_disponivel: int | None
    emissao_total_seeg_ultimo_ano_disponivel_t: float | None


class FotografiaSoloCobertura2024Response(BaseModel):
    carbono_solo_medio_municipal_t_ha: float | None
    cobertura_natural_media_municipal_pct: float | None
    soja_mapbiomas_media_municipal_pct: float | None
    agricultura_media_municipal_pct: float | None


class TendenciasSoloCoberturaResponse(BaseModel):
    carbono_solo_tendencia_media_municipal_t_ha_ano: float | None
    carbono_solo_variacao_media_municipal_2019_2024_t_ha: float | None
    cobertura_natural_tendencia_media_municipal_pp_ano: float | None
    cobertura_natural_variacao_media_municipal_2019_2024_pp: float | None
    soja_mapbiomas_tendencia_media_municipal_pp_ano: float | None
    soja_mapbiomas_variacao_media_municipal_2019_2024_pp: float | None


class CoberturaSoloCoberturaResponse(BaseModel):
    municipios_considerados: int
    municipios_com_carbono_solo_2024: int
    municipios_com_cobertura_natural_2024: int
    municipios_com_soja_mapbiomas_2024: int
    municipios_com_agricultura_2024: int


class SoloCoberturaResponse(BaseModel):
    fotografia_2024: FotografiaSoloCobertura2024Response
    tendencias_consolidadas: TendenciasSoloCoberturaResponse
    cobertura_dados: CoberturaSoloCoberturaResponse


class CoberturaBrlucResponse(BaseModel):
    municipios_considerados: int
    municipios_com_area_conversao_para_soja: int
    municipios_com_area_origem_natural: int


class ContextoBrlucResponse(BaseModel):
    """O bloco BRLUC apresenta contexto histórico municipal de conversão para soja no período de 2000–2019. Não representa uma série anual de 2019–2024."""

    periodo_inicio_brluc: int | None
    periodo_fim_brluc: int | None
    area_conversao_para_soja_2000_2019_total_ha: float | None
    area_origem_natural_total_ha: float | None
    cobertura_dados: CoberturaBrlucResponse


class CoberturaSeegAnualResponse(BaseModel):
    municipios_considerados: int
    municipios_com_seeg_direta_disponivel: int
    municipios_com_seeg_indireta_disponivel: int
    municipios_com_seeg_total_disponivel: int


class StatusDadoSeegResponse(BaseModel):
    status: str | None
    municipios: int


class SerieEmissoesSeegItem(BaseModel):
    """N₂O associado a resíduos agrícolas da soja em solos manejados, incluindo componentes diretos e indiretos quando disponíveis, expresso em CO₂e GWP-AR6. Não representa todas as emissões da soja, o inventário completo da cultura ou emissões nacionais totais."""

    ano: int
    emissao_direta_co2e_gwp_ar6_soma_disponivel_t: float | None
    emissao_indireta_co2e_gwp_ar6_soma_disponivel_t: float | None
    emissao_total_co2e_gwp_ar6_soma_disponivel_t: float | None
    cobertura_dados: CoberturaSeegAnualResponse
    status_dado_seeg: list[StatusDadoSeegResponse]


class AmbienteCarbonoResponse(BaseModel):
    escopo: EscopoAmbienteCarbonoResponse
    resumo: ResumoAmbienteCarbonoResponse
    solo_cobertura: SoloCoberturaResponse
    contexto_brluc: ContextoBrlucResponse
    serie_emissoes_seeg: list[SerieEmissoesSeegItem]
