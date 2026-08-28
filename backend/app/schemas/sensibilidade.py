from pydantic import BaseModel


class ReferenciaSensibilidadeResponse(BaseModel):
    cenario_base: str
    estrategicos_base: int | None
    quantidade_cenarios: int


class CenarioSensibilidadeResumo(BaseModel):
    cenario: str
    estrategicos_cenario: int | None
    estrategicos_em_comum_com_base: int | None
    retencao_dos_225_base_pct: float | None
    jaccard_pct: float | None
    spearman_relevancia_vs_base: float | None
    spearman_pressao_vs_base: float | None


class SensibilidadeResumoResponse(BaseModel):
    referencia: ReferenciaSensibilidadeResponse
    cenarios: list[CenarioSensibilidadeResumo]
