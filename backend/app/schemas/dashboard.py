from pydantic import BaseModel


class EscopoDashboardResponse(BaseModel):
    cultura: str
    regioes: list[str]
    ano_inicio: int | None
    ano_fim: int | None


class IndicadoresDashboardResponse(BaseModel):
    total_municipios: int
    municipios_elegiveis: int | None
    municipios_dados_insuficientes: int | None
    municipios_estrategicos_base: int | None
    municipios_prioridade_robusta: int | None
    percentual_estrategicos_robustos: float | None


class DistribuicaoQuadranteResponse(BaseModel):
    quadrante: str
    quantidade: int


class DashboardResumoResponse(BaseModel):
    escopo: EscopoDashboardResponse
    indicadores: IndicadoresDashboardResponse
    distribuicao_quadrantes: list[DistribuicaoQuadranteResponse]
