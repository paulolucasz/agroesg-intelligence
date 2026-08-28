from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..repositories.priorizacao import PriorizacaoFiltros, buscar_priorizacao
from ..schemas.priorizacao import (
    FiltrosPriorizacaoAplicados,
    PaginacaoPriorizacao,
    PriorizacaoItem,
    PriorizacaoResponse,
    PriorizacaoSort,
    SortField,
    SortOrder,
)


router = APIRouter(prefix="/api/v1", tags=["Priorização"])


def _normalizar_filtro_textual(value: str | None) -> str | None:
    if value is None:
        return None

    normalized_value = value.strip()
    return normalized_value or None


@router.get("/priorizacao", response_model=PriorizacaoResponse)
def listar_priorizacao(
    regiao: str | None = Query(default=None),
    uf: str | None = Query(default=None),
    municipio: str | None = Query(default=None),
    quadrante: str | None = Query(default=None),
    confianca: str | None = Query(default=None),
    robustez: str | None = Query(default=None),
    prioridade_estrategica: bool | None = Query(default=None),
    prioridade_robusta: bool | None = Query(default=None),
    elegivel: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort: SortField = Query(default="municipio"),
    order: SortOrder = Query(default="asc"),
    db: Session = Depends(get_db),
) -> PriorizacaoResponse:
    filtros = PriorizacaoFiltros(
        regiao=_normalizar_filtro_textual(regiao),
        uf=_normalizar_filtro_textual(uf),
        municipio=_normalizar_filtro_textual(municipio),
        quadrante=_normalizar_filtro_textual(quadrante),
        confianca=_normalizar_filtro_textual(confianca),
        robustez=_normalizar_filtro_textual(robustez),
        prioridade_estrategica=prioridade_estrategica,
        prioridade_robusta=prioridade_robusta,
        elegivel=elegivel,
    )

    try:
        total_items, rows = buscar_priorizacao(
            db=db,
            filtros=filtros,
            page=page,
            page_size=page_size,
            sort=sort,
            order=order,
        )
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from None

    return PriorizacaoResponse(
        items=[PriorizacaoItem(**row) for row in rows],
        pagination=PaginacaoPriorizacao(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=ceil(total_items / page_size) if total_items else 0,
        ),
        sort=PriorizacaoSort(field=sort, order=order),
        filtros_aplicados=FiltrosPriorizacaoAplicados(
            regiao=filtros.regiao,
            uf=filtros.uf,
            municipio=filtros.municipio,
            quadrante=filtros.quadrante,
            confianca=filtros.confianca,
            robustez=filtros.robustez,
            prioridade_estrategica=filtros.prioridade_estrategica,
            prioridade_robusta=filtros.prioridade_robusta,
            elegivel=filtros.elegivel,
        ),
    )
