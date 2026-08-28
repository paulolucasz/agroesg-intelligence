from pydantic import BaseModel


class FiltrosAplicados(BaseModel):
    regiao: str | None = None
    uf: str | None = None


class CatalogoFiltrosResponse(BaseModel):
    filtros_aplicados: FiltrosAplicados
    regioes: list[str]
    ufs: list[str]
    anos: list[int]
    quadrantes: list[str]
    faixas_confianca: list[str]
    faixas_robustez: list[str]
    cenarios: list[str]


class ReadinessResponse(BaseModel):
    status: str
    database: str
