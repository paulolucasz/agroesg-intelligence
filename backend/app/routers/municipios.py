from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..repositories.municipios import (
    buscar_cenarios_sensibilidade_municipio,
    buscar_historico_municipio,
    buscar_identificacao_municipio,
    buscar_municipio,
    buscar_resumo_sensibilidade_municipio,
)
from ..schemas.municipios import (
    CenarioSensibilidadeMunicipio,
    ClimaMunicipio,
    ContextoBrlucMunicipio,
    HistoricoAnualItem,
    IdentificacaoMunicipio,
    MunicipioDetalheResponse,
    MunicipioHistoricoIdentificacao,
    MunicipioHistoricoResponse,
    MunicipioSensibilidadeIdentificacao,
    MunicipioSensibilidadeResponse,
    PeriodoHistoricoMunicipio,
    PriorizacaoMunicipio,
    ProducaoMunicipio,
    ResumoSensibilidadeMunicipio,
    SoloCoberturaMunicipio,
)


router = APIRouter(prefix="/api/v1/municipios", tags=["Municípios"])


@router.get(
    "/{codigo_ibge}/historico",
    response_model=MunicipioHistoricoResponse,
    summary="Histórico anual municipal agroambiental",
    description=(
        "Retorna a série anual de 2019–2024 dos indicadores agroambientais "
        "da soja para um município, sem preencher anos ausentes. Os campos "
        "SEEG representam emissões de N2O associadas a resíduos agrícolas da "
        "soja em solos manejados, em CO2e GWP-AR6 quando disponível; não "
        "representam todas as emissões da soja. `status_dado_seeg` e valores "
        "de cobertura parcial são retornados exatamente como persistidos. "
        "BRLUC não faz parte desta série anual."
    ),
)
def obter_historico_municipio(
    codigo_ibge: Annotated[
        str,
        Path(
            pattern=r"^\d{7}$",
            description="Código IBGE municipal com exatamente sete dígitos.",
        ),
    ],
    ano_inicio: Annotated[
        int | None,
        Query(
            ge=2019,
            le=2024,
            description="Primeiro ano do intervalo anual consultado.",
        ),
    ] = None,
    ano_fim: Annotated[
        int | None,
        Query(
            ge=2019,
            le=2024,
            description="Último ano do intervalo anual consultado.",
        ),
    ] = None,
    db: Session = Depends(get_db),
) -> MunicipioHistoricoResponse:
    ano_inicio_efetivo = ano_inicio if ano_inicio is not None else 2019
    ano_fim_efetivo = ano_fim if ano_fim is not None else 2024

    if ano_inicio_efetivo > ano_fim_efetivo:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="ano_inicio must be less than or equal to ano_fim.",
        )

    try:
        municipio = buscar_identificacao_municipio(db, codigo_ibge)
        historico = (
            buscar_historico_municipio(
                db,
                codigo_ibge,
                ano_inicio_efetivo,
                ano_fim_efetivo,
            )
            if municipio is not None
            else []
        )
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from None

    if municipio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Município não encontrado.",
        )

    items = [HistoricoAnualItem(**item) for item in historico]

    return MunicipioHistoricoResponse(
        municipio=MunicipioHistoricoIdentificacao(**municipio),
        periodo=PeriodoHistoricoMunicipio(
            ano_inicio=ano_inicio_efetivo,
            ano_fim=ano_fim_efetivo,
            quantidade_registros=len(items),
        ),
        items=items,
    )


@router.get(
    "/{codigo_ibge}/sensibilidade",
    response_model=MunicipioSensibilidadeResponse,
    summary="Sensibilidade da priorização municipal",
    description=(
        "Retorna testes de sensibilidade do modelo municipal de priorização, "
        "usados para avaliar a estabilidade e a robustez da classificação "
        "territorial. Os cenários não são probabilidades e não representam "
        "créditos de carbono certificados. `score_relevancia` e "
        "`score_pressao` são scores na escala do modelo municipal, "
        "aproximadamente de 0 a 100, e não probabilidades. Os valores são "
        "persistidos, sem recálculo. A resposta projeta quatro grupos "
        "persistidos na ordem de apresentação base, produtivo, ambiental e "
        "climático; essa não é uma ordem oficial de "
        "`dim_cenario_sensibilidade`."
    ),
)
def obter_sensibilidade_municipio(
    codigo_ibge: Annotated[
        str,
        Path(
            pattern=r"^\d{7}$",
            description="Código IBGE municipal com exatamente sete dígitos.",
        ),
    ],
    db: Session = Depends(get_db),
) -> MunicipioSensibilidadeResponse:
    try:
        resumo_municipio = buscar_resumo_sensibilidade_municipio(db, codigo_ibge)
        cenarios = (
            buscar_cenarios_sensibilidade_municipio(db, codigo_ibge)
            if resumo_municipio is not None
            else []
        )
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from None

    if resumo_municipio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Município não encontrado.",
        )

    return MunicipioSensibilidadeResponse(
        municipio=MunicipioSensibilidadeIdentificacao(**resumo_municipio),
        resumo=ResumoSensibilidadeMunicipio(
            quantidade_cenarios=4,
            quantidade_cenarios_estrategico=resumo_municipio[
                "quantidade_cenarios_estrategico"
            ],
            faixa_robustez_priorizacao=resumo_municipio[
                "faixa_robustez_priorizacao"
            ],
            prioridade_estrategica_base=resumo_municipio[
                "prioridade_estrategica_base"
            ],
            prioridade_robusta=resumo_municipio["prioridade_robusta"],
        ),
        cenarios=[
            CenarioSensibilidadeMunicipio(**cenario) for cenario in cenarios
        ],
    )


@router.get(
    "/{codigo_ibge}",
    response_model=MunicipioDetalheResponse,
    summary="Detalhe municipal de priorização agroambiental",
    description=(
        "Retorna uma síntese municipal/agregada dos indicadores persistidos "
        "para o município. O bloco `contexto_brluc` representa contexto "
        "histórico de 2000–2019 e não deve ser interpretado como estimativa "
        "anual de 2019–2024. Os resultados representam triagem e priorização "
        "agroambiental; não representam créditos de carbono certificados."
    ),
)
def obter_municipio(
    codigo_ibge: Annotated[
        str,
        Path(
            pattern=r"^\d{7}$",
            description="Código IBGE municipal com exatamente sete dígitos.",
        ),
    ],
    db: Session = Depends(get_db),
) -> MunicipioDetalheResponse:
    try:
        municipio = buscar_municipio(db, codigo_ibge)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from None

    if municipio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Município não encontrado.",
        )

    return MunicipioDetalheResponse(
        identificacao=IdentificacaoMunicipio(**municipio),
        producao=ProducaoMunicipio(**municipio),
        clima=ClimaMunicipio(**municipio),
        solo_cobertura=SoloCoberturaMunicipio(**municipio),
        contexto_brluc=ContextoBrlucMunicipio(**municipio),
        priorizacao=PriorizacaoMunicipio(**municipio),
    )
