from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.orm import Session


SORT_COLUMN_MAP = {
    "municipio": "municipio",
    "uf": "uf",
    "score_relevancia_produtiva": "score_relevancia_produtiva",
    "score_pressao_agroambiental": "score_pressao_agroambiental",
    "producao_media_t": "producao_media_t",
    "rendimento_medio_kg_ha": "rendimento_medio_kg_ha",
    "quantidade_cenarios_estrategico": "quantidade_cenarios_estrategico",
}

ORDER_DIRECTION_MAP = {
    "asc": "ASC",
    "desc": "DESC",
}


@dataclass(frozen=True)
class PriorizacaoFiltros:
    regiao: str | None = None
    uf: str | None = None
    municipio: str | None = None
    quadrante: str | None = None
    confianca: str | None = None
    robustez: str | None = None
    prioridade_estrategica: bool | None = None
    prioridade_robusta: bool | None = None
    elegivel: bool | None = None


def _build_where_clause(
    filtros: PriorizacaoFiltros,
) -> tuple[str, dict[str, object]]:
    conditions: list[str] = []
    params: dict[str, object] = {}

    if filtros.regiao is not None:
        conditions.append("regiao = :regiao")
        params["regiao"] = filtros.regiao

    if filtros.uf is not None:
        conditions.append("uf = :uf")
        params["uf"] = filtros.uf

    if filtros.municipio is not None:
        conditions.append("LOWER(municipio) LIKE :municipio_pattern")
        params["municipio_pattern"] = f"%{filtros.municipio.lower()}%"

    if filtros.quadrante is not None:
        conditions.append("quadrante_priorizacao = :quadrante")
        params["quadrante"] = filtros.quadrante

    if filtros.confianca is not None:
        conditions.append("faixa_confianca_modelo = :confianca")
        params["confianca"] = filtros.confianca

    if filtros.robustez is not None:
        conditions.append("faixa_robustez_priorizacao = :robustez")
        params["robustez"] = filtros.robustez

    if filtros.prioridade_estrategica is not None:
        conditions.append(
            "flag_prioridade_estrategica_base = :prioridade_estrategica"
        )
        params["prioridade_estrategica"] = filtros.prioridade_estrategica

    if filtros.prioridade_robusta is not None:
        conditions.append(
            "flag_prioridade_robusta_3_ou_4_cenarios = :prioridade_robusta"
        )
        params["prioridade_robusta"] = filtros.prioridade_robusta

    if filtros.elegivel is not None:
        conditions.append("elegivel_cruzamento_priorizacao = :elegivel")
        params["elegivel"] = filtros.elegivel

    if not conditions:
        return "", params

    return f" WHERE {' AND '.join(conditions)}", params


def buscar_priorizacao(
    db: Session,
    filtros: PriorizacaoFiltros,
    page: int,
    page_size: int,
    sort: str,
    order: str,
) -> tuple[int, list[dict[str, object]]]:
    where_clause, filter_params = _build_where_clause(filtros)
    total_items = db.execute(
        text(
            "SELECT COUNT(*) FROM mart_priorizacao_municipal"
            + where_clause
        ),
        filter_params,
    ).scalar_one()

    sort_column = SORT_COLUMN_MAP[sort]
    sort_direction = ORDER_DIRECTION_MAP[order]
    query_params = {
        **filter_params,
        "limit": page_size,
        "offset": (page - 1) * page_size,
    }
    rows = db.execute(
        text(
            """
            SELECT
                codigo_ibge,
                municipio,
                uf,
                regiao,
                producao_media_t,
                rendimento_medio_kg_ha,
                precipitacao_media_mm,
                carbono_solo_2024_t_ha,
                cobertura_natural_2024_pct,
                soja_mapbiomas_2024_pct,
                score_relevancia_produtiva,
                score_pressao_agroambiental,
                quadrante_priorizacao,
                faixa_confianca_modelo,
                quantidade_cenarios_estrategico,
                faixa_robustez_priorizacao,
                flag_prioridade_estrategica_base,
                flag_prioridade_robusta_3_ou_4_cenarios
            FROM mart_priorizacao_municipal
            """
            + where_clause
            + f" ORDER BY {sort_column} {sort_direction}, codigo_ibge ASC"
            + " LIMIT :limit OFFSET :offset"
        ),
        query_params,
    ).mappings().all()

    return total_items, [dict(row) for row in rows]
