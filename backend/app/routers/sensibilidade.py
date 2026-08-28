from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..repositories.sensibilidade import listar_resumo_sensibilidade
from ..schemas.sensibilidade import (
    CenarioSensibilidadeResumo,
    ReferenciaSensibilidadeResponse,
    SensibilidadeResumoResponse,
)


router = APIRouter(prefix="/api/v1/sensibilidade", tags=["Sensibilidade"])


@router.get(
    "/resumo",
    response_model=SensibilidadeResumoResponse,
    summary="Resumo global de sensibilidade da priorização",
    description=(
        "Retorna métricas globais persistidas dos cenários de sensibilidade "
        "do modelo de priorização. Não são métricas de um município "
        "individual. Os cenários são testes de sensibilidade para avaliar "
        "estabilidade e similaridade dos resultados; não são probabilidades, "
        "não representam créditos de carbono e não recalculam nem certificam "
        "créditos. A ordem base, produtivo, ambiental e climático é uma "
        "decisão de apresentação da API, não uma ordem oficial do banco."
    ),
)
def obter_resumo_sensibilidade(
    db: Session = Depends(get_db),
) -> SensibilidadeResumoResponse:
    try:
        cenarios = listar_resumo_sensibilidade(db)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from None

    estrategicos_base = next(
        (
            cenario["estrategicos_cenario"]
            for cenario in cenarios
            if cenario["cenario"] == "base"
        ),
        None,
    )

    return SensibilidadeResumoResponse(
        referencia=ReferenciaSensibilidadeResponse(
            cenario_base="base",
            estrategicos_base=estrategicos_base,
            quantidade_cenarios=len(cenarios),
        ),
        cenarios=[
            CenarioSensibilidadeResumo(**cenario) for cenario in cenarios
        ],
    )
