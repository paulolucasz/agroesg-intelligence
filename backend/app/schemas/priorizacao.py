from typing import Literal

from pydantic import BaseModel


SortField = Literal[
    "municipio",
    "uf",
    "score_relevancia_produtiva",
    "score_pressao_agroambiental",
    "producao_media_t",
    "rendimento_medio_kg_ha",
    "quantidade_cenarios_estrategico",
]
SortOrder = Literal["asc", "desc"]


class FiltrosPriorizacaoAplicados(BaseModel):
    regiao: str | None = None
    uf: str | None = None
    municipio: str | None = None
    quadrante: str | None = None
    confianca: str | None = None
    robustez: str | None = None
    prioridade_estrategica: bool | None = None
    prioridade_robusta: bool | None = None
    elegivel: bool | None = None


class PriorizacaoItem(BaseModel):
    codigo_ibge: str
    municipio: str | None
    uf: str | None
    regiao: str | None
    producao_media_t: float | None
    rendimento_medio_kg_ha: float | None
    precipitacao_media_mm: float | None
    carbono_solo_2024_t_ha: float | None
    cobertura_natural_2024_pct: float | None
    soja_mapbiomas_2024_pct: float | None
    score_relevancia_produtiva: float | None
    score_pressao_agroambiental: float | None
    quadrante_priorizacao: str | None
    faixa_confianca_modelo: str | None
    quantidade_cenarios_estrategico: int | None
    faixa_robustez_priorizacao: str | None
    flag_prioridade_estrategica_base: bool | None
    flag_prioridade_robusta_3_ou_4_cenarios: bool | None


class PaginacaoPriorizacao(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class PriorizacaoSort(BaseModel):
    field: SortField
    order: SortOrder


class PriorizacaoResponse(BaseModel):
    items: list[PriorizacaoItem]
    pagination: PaginacaoPriorizacao
    sort: PriorizacaoSort
    filtros_aplicados: FiltrosPriorizacaoAplicados
