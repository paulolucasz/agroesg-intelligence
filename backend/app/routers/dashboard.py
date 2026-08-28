from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..repositories.dashboard import (
    buscar_indicadores_dashboard,
    buscar_periodo_dashboard,
    listar_distribuicao_quadrantes_dashboard,
    listar_regioes_dashboard,
)
from ..schemas.dashboard import (
    DashboardResumoResponse,
    DistribuicaoQuadranteResponse,
    EscopoDashboardResponse,
    IndicadoresDashboardResponse,
)


router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get(
    "/resumo",
    response_model=DashboardResumoResponse,
    summary="Resumo executivo global do dashboard",
    description=(
        "Retorna indicadores de triagem e priorização territorial para o "
        "dashboard executivo. Estratégico significa alta relevância "
        "produtiva e alta pressão agroambiental no cenário base. Prioridade "
        "robusta significa classificação estratégica em três ou quatro dos "
        "quatro cenários, conforme flag persistida. O percentual de robustez "
        "é uma razão executiva derivada de contagens persistidas; não "
        "recalcula o modelo. Os indicadores não representam créditos de "
        "carbono certificados, toneladas de crédito ou garantia de "
        "elegibilidade para projeto de carbono."
    ),
)
def obter_resumo_dashboard(
    db: Session = Depends(get_db),
) -> DashboardResumoResponse:
    try:
        indicadores = buscar_indicadores_dashboard(db)
        regioes = listar_regioes_dashboard(db)
        periodo = buscar_periodo_dashboard(db)
        distribuicao_quadrantes = listar_distribuicao_quadrantes_dashboard(db)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from None

    municipios_estrategicos_base = indicadores["municipios_estrategicos_base"]
    municipios_prioridade_robusta = indicadores["municipios_prioridade_robusta"]
    percentual_estrategicos_robustos = (
        round(
            municipios_prioridade_robusta / municipios_estrategicos_base * 100,
            2,
        )
        if (
            municipios_estrategicos_base is not None
            and municipios_estrategicos_base > 0
            and municipios_prioridade_robusta is not None
        )
        else None
    )

    return DashboardResumoResponse(
        escopo=EscopoDashboardResponse(
            cultura="soja",
            regioes=regioes,
            ano_inicio=periodo["ano_inicio"],
            ano_fim=periodo["ano_fim"],
        ),
        indicadores=IndicadoresDashboardResponse(
            total_municipios=indicadores["total_municipios"],
            municipios_elegiveis=indicadores["municipios_elegiveis"],
            municipios_dados_insuficientes=indicadores[
                "municipios_dados_insuficientes"
            ],
            municipios_estrategicos_base=municipios_estrategicos_base,
            municipios_prioridade_robusta=municipios_prioridade_robusta,
            percentual_estrategicos_robustos=percentual_estrategicos_robustos,
        ),
        distribuicao_quadrantes=[
            DistribuicaoQuadranteResponse(**quadrante)
            for quadrante in distribuicao_quadrantes
        ],
    )
