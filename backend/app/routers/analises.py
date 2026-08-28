from collections import defaultdict
from collections.abc import Iterable

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..repositories.analises import (
    ANO_FIM,
    ANO_INICIO,
    CULTURA,
    existe_recorte_producao_clima,
    listar_serie_emissoes_seeg,
    listar_serie_producao_clima,
    listar_status_dado_seeg_por_ano,
    obter_contexto_brluc_ambiente_carbono,
    obter_solo_cobertura_ambiente_carbono,
)
from ..schemas.analises import (
    AmbienteCarbonoResponse,
    CoberturaBrlucResponse,
    CoberturaProducaoClimaAnual,
    CoberturaSeegAnualResponse,
    CoberturaSoloCoberturaResponse,
    ContextoBrlucResponse,
    EscopoAmbienteCarbonoResponse,
    EscopoProducaoClimaResponse,
    FotografiaSoloCobertura2024Response,
    ProducaoClimaResponse,
    ResumoAmbienteCarbonoResponse,
    ResumoProducaoClimaResponse,
    SerieEmissoesSeegItem,
    SerieProducaoClimaItem,
    SoloCoberturaResponse,
    StatusDadoSeegResponse,
    TendenciasSoloCoberturaResponse,
)


router = APIRouter(prefix="/api/v1/analises", tags=["Análises"])

UFS_POR_REGIAO = {
    "Centro-Oeste": ("DF", "GO", "MS", "MT"),
    "Sul": ("PR", "RS", "SC"),
}
UFS_ESCOPO = tuple(uf for ufs in UFS_POR_REGIAO.values() for uf in ufs)


def _media_valores_nao_nulos(values: Iterable[float | None]) -> float | None:
    valores_disponiveis = [value for value in values if value is not None]
    if not valores_disponiveis:
        return None

    return sum(valores_disponiveis) / len(valores_disponiveis)


def _soma_valores_nao_nulos(values: Iterable[float | None]) -> float | None:
    valores_disponiveis = [value for value in values if value is not None]
    if not valores_disponiveis:
        return None

    return sum(valores_disponiveis)


def _validar_filtros_territoriais(
    db: Session,
    regiao: str | None,
    uf: str | None,
) -> None:
    if regiao is not None and regiao not in UFS_POR_REGIAO:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Região inválida.",
        )

    if uf is not None and uf not in UFS_ESCOPO:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="UF inválida.",
        )

    if regiao is not None and uf is not None and uf not in UFS_POR_REGIAO[regiao]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A UF não pertence à região informada.",
        )

    if regiao is not None and not existe_recorte_producao_clima(db, regiao=regiao):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Região inválida.",
        )

    if uf is not None and not existe_recorte_producao_clima(db, uf=uf):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="UF inválida.",
        )

    if (
        regiao is not None
        and uf is not None
        and not existe_recorte_producao_clima(db, regiao=regiao, uf=uf)
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A UF não pertence à região informada.",
        )


def _resolver_escopo(
    regiao: str | None,
    uf: str | None,
) -> EscopoProducaoClimaResponse:
    if uf is not None:
        regiao_resolvida = next(
            nome_regiao
            for nome_regiao, ufs in UFS_POR_REGIAO.items()
            if uf in ufs
        )
        regioes = [regiao_resolvida]
        ufs = [uf]
    elif regiao is not None:
        regioes = [regiao]
        ufs = list(UFS_POR_REGIAO[regiao])
    else:
        regioes = list(UFS_POR_REGIAO)
        ufs = list(UFS_ESCOPO)

    return EscopoProducaoClimaResponse(
        cultura=CULTURA,
        regioes=regioes,
        ufs=ufs,
        ano_inicio=ANO_INICIO,
        ano_fim=ANO_FIM,
    )


@router.get(
    "/producao-clima",
    response_model=ProducaoClimaResponse,
    summary="Série anual territorial de produção e clima da soja",
    description=(
        "Agrega o recorte territorial fixo de soja de 2019 a 2024. Produção "
        "e área são totais territoriais; rendimento é a razão entre produção "
        "e área colhida calculada sobre a mesma cobertura elegível. Clima "
        "representa a média simples das estatísticas municipais disponíveis. "
        "Valores nulos representam ausência de dado."
    ),
)
def obter_producao_clima(
    regiao: str | None = Query(default=None),
    uf: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> ProducaoClimaResponse:
    try:
        _validar_filtros_territoriais(db, regiao, uf)
        serie_anual = [
            SerieProducaoClimaItem(
                ano=item["ano"],
                cobertura=CoberturaProducaoClimaAnual(
                    municipios_considerados=item["municipios_considerados"],
                    municipios_com_producao=item["municipios_com_producao"],
                    municipios_com_area_colhida=item[
                        "municipios_com_area_colhida"
                    ],
                    municipios_com_producao_e_area_colhida=item[
                        "municipios_com_producao_e_area_colhida"
                    ],
                    municipios_com_clima=item["municipios_com_clima"],
                ),
                producao_total_t=item["producao_total_t"],
                area_colhida_total_ha=item["area_colhida_total_ha"],
                rendimento_agregado_kg_ha=item["rendimento_agregado_kg_ha"],
                precipitacao_media_municipal_mm=item[
                    "precipitacao_media_municipal_mm"
                ],
                temperatura_media_municipal_c=item[
                    "temperatura_media_municipal_c"
                ],
                umidade_media_municipal_pct=item[
                    "umidade_media_municipal_pct"
                ],
            )
            for item in listar_serie_producao_clima(db, regiao, uf)
        ]
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from None

    ultimo_ano = serie_anual[-1] if serie_anual else None

    return ProducaoClimaResponse(
        escopo=_resolver_escopo(regiao, uf),
        resumo=ResumoProducaoClimaResponse(
            producao_total_periodo_t=_soma_valores_nao_nulos(
                item.producao_total_t for item in serie_anual
            ),
            producao_ultimo_ano_t=(
                ultimo_ano.producao_total_t if ultimo_ano is not None else None
            ),
            area_colhida_ultimo_ano_ha=(
                ultimo_ano.area_colhida_total_ha if ultimo_ano is not None else None
            ),
            rendimento_ultimo_ano_kg_ha=(
                ultimo_ano.rendimento_agregado_kg_ha
                if ultimo_ano is not None
                else None
            ),
            precipitacao_media_anual_periodo_mm=_media_valores_nao_nulos(
                item.precipitacao_media_municipal_mm for item in serie_anual
            ),
            temperatura_media_anual_periodo_c=_media_valores_nao_nulos(
                item.temperatura_media_municipal_c for item in serie_anual
            ),
            umidade_media_anual_periodo_pct=_media_valores_nao_nulos(
                item.umidade_media_municipal_pct for item in serie_anual
            ),
        ),
        serie_anual=serie_anual,
    )


@router.get(
    "/ambiente-carbono",
    response_model=AmbienteCarbonoResponse,
    summary="Indicadores territoriais de ambiente e carbono da soja",
    description=(
        "Agrega fotografia ambiental de 2024 e tendências municipais "
        "consolidadas da soja para o recorte territorial fixo. Solo e "
        "percentuais de cobertura são médias simples municipais; valores "
        "nulos representam ausência de dado. O bloco BRLUC apresenta contexto "
        "histórico municipal de conversão para soja no período de 2000–2019. "
        "Não representa uma série anual de 2019–2024. A série SEEG representa "
        "N₂O associado a resíduos agrícolas da soja em solos manejados, "
        "incluindo componentes diretos e indiretos quando disponíveis, expresso "
        "em CO₂e GWP-AR6. Não representa todas as emissões da soja, o "
        "inventário completo da cultura ou emissões nacionais totais."
    ),
)
def obter_ambiente_carbono(
    regiao: str | None = Query(default=None),
    uf: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> AmbienteCarbonoResponse:
    try:
        _validar_filtros_territoriais(db, regiao, uf)
        solo_cobertura = obter_solo_cobertura_ambiente_carbono(db, regiao, uf)
        contexto_brluc = obter_contexto_brluc_ambiente_carbono(db, regiao, uf)
        serie_emissoes = listar_serie_emissoes_seeg(db, regiao, uf)
        status_por_ano = listar_status_dado_seeg_por_ano(db, regiao, uf)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from None

    status_dado_seeg_por_ano: dict[int, list[StatusDadoSeegResponse]] = defaultdict(
        list
    )
    for item in status_por_ano:
        status_dado_seeg_por_ano[item["ano"]].append(
            StatusDadoSeegResponse(
                status=item["status_dado_seeg"],
                municipios=item["municipios"],
            )
        )

    serie_emissoes_seeg = [
        SerieEmissoesSeegItem(
            ano=item["ano"],
            emissao_direta_co2e_gwp_ar6_soma_disponivel_t=item[
                "emissao_direta_co2e_gwp_ar6_soma_disponivel_t"
            ],
            emissao_indireta_co2e_gwp_ar6_soma_disponivel_t=item[
                "emissao_indireta_co2e_gwp_ar6_soma_disponivel_t"
            ],
            emissao_total_co2e_gwp_ar6_soma_disponivel_t=item[
                "emissao_total_co2e_gwp_ar6_soma_disponivel_t"
            ],
            cobertura_dados=CoberturaSeegAnualResponse(
                municipios_considerados=item["municipios_considerados"],
                municipios_com_seeg_direta_disponivel=item[
                    "municipios_com_seeg_direta_disponivel"
                ],
                municipios_com_seeg_indireta_disponivel=item[
                    "municipios_com_seeg_indireta_disponivel"
                ],
                municipios_com_seeg_total_disponivel=item[
                    "municipios_com_seeg_total_disponivel"
                ],
            ),
            status_dado_seeg=status_dado_seeg_por_ano[item["ano"]],
        )
        for item in serie_emissoes
    ]
    ultima_emissao_seeg_disponivel = next(
        (
            item
            for item in reversed(serie_emissoes_seeg)
            if item.emissao_total_co2e_gwp_ar6_soma_disponivel_t is not None
        ),
        None,
    )
    escopo_resolvido = _resolver_escopo(regiao, uf)

    return AmbienteCarbonoResponse(
        escopo=EscopoAmbienteCarbonoResponse(
            cultura=escopo_resolvido.cultura,
            regioes=escopo_resolvido.regioes,
            ufs=escopo_resolvido.ufs,
            ano_inicio=escopo_resolvido.ano_inicio,
            ano_fim=escopo_resolvido.ano_fim,
        ),
        resumo=ResumoAmbienteCarbonoResponse(
            carbono_solo_medio_municipal_2024_t_ha=solo_cobertura[
                "carbono_solo_medio_municipal_2024_t_ha"
            ],
            cobertura_natural_media_municipal_2024_pct=solo_cobertura[
                "cobertura_natural_media_municipal_2024_pct"
            ],
            soja_mapbiomas_media_municipal_2024_pct=solo_cobertura[
                "soja_mapbiomas_media_municipal_2024_pct"
            ],
            agricultura_media_municipal_2024_pct=solo_cobertura[
                "agricultura_media_municipal_2024_pct"
            ],
            area_conversao_para_soja_2000_2019_total_ha=contexto_brluc[
                "area_conversao_para_soja_2000_2019_total_ha"
            ],
            ano_ultima_emissao_seeg_disponivel=(
                ultima_emissao_seeg_disponivel.ano
                if ultima_emissao_seeg_disponivel is not None
                else None
            ),
            emissao_total_seeg_ultimo_ano_disponivel_t=(
                ultima_emissao_seeg_disponivel.emissao_total_co2e_gwp_ar6_soma_disponivel_t
                if ultima_emissao_seeg_disponivel is not None
                else None
            ),
        ),
        solo_cobertura=SoloCoberturaResponse(
            fotografia_2024=FotografiaSoloCobertura2024Response(
                carbono_solo_medio_municipal_t_ha=solo_cobertura[
                    "carbono_solo_medio_municipal_2024_t_ha"
                ],
                cobertura_natural_media_municipal_pct=solo_cobertura[
                    "cobertura_natural_media_municipal_2024_pct"
                ],
                soja_mapbiomas_media_municipal_pct=solo_cobertura[
                    "soja_mapbiomas_media_municipal_2024_pct"
                ],
                agricultura_media_municipal_pct=solo_cobertura[
                    "agricultura_media_municipal_2024_pct"
                ],
            ),
            tendencias_consolidadas=TendenciasSoloCoberturaResponse(
                carbono_solo_tendencia_media_municipal_t_ha_ano=solo_cobertura[
                    "carbono_solo_tendencia_media_municipal_t_ha_ano"
                ],
                carbono_solo_variacao_media_municipal_2019_2024_t_ha=solo_cobertura[
                    "carbono_solo_variacao_media_municipal_2019_2024_t_ha"
                ],
                cobertura_natural_tendencia_media_municipal_pp_ano=solo_cobertura[
                    "cobertura_natural_tendencia_media_municipal_pp_ano"
                ],
                cobertura_natural_variacao_media_municipal_2019_2024_pp=solo_cobertura[
                    "cobertura_natural_variacao_media_municipal_2019_2024_pp"
                ],
                soja_mapbiomas_tendencia_media_municipal_pp_ano=solo_cobertura[
                    "soja_mapbiomas_tendencia_media_municipal_pp_ano"
                ],
                soja_mapbiomas_variacao_media_municipal_2019_2024_pp=solo_cobertura[
                    "soja_mapbiomas_variacao_media_municipal_2019_2024_pp"
                ],
            ),
            cobertura_dados=CoberturaSoloCoberturaResponse(
                municipios_considerados=solo_cobertura["municipios_considerados"],
                municipios_com_carbono_solo_2024=solo_cobertura[
                    "municipios_com_carbono_solo_2024"
                ],
                municipios_com_cobertura_natural_2024=solo_cobertura[
                    "municipios_com_cobertura_natural_2024"
                ],
                municipios_com_soja_mapbiomas_2024=solo_cobertura[
                    "municipios_com_soja_mapbiomas_2024"
                ],
                municipios_com_agricultura_2024=solo_cobertura[
                    "municipios_com_agricultura_2024"
                ],
            ),
        ),
        contexto_brluc=ContextoBrlucResponse(
            periodo_inicio_brluc=contexto_brluc["periodo_inicio_brluc"],
            periodo_fim_brluc=contexto_brluc["periodo_fim_brluc"],
            area_conversao_para_soja_2000_2019_total_ha=contexto_brluc[
                "area_conversao_para_soja_2000_2019_total_ha"
            ],
            area_origem_natural_total_ha=contexto_brluc[
                "area_origem_natural_total_ha"
            ],
            cobertura_dados=CoberturaBrlucResponse(
                municipios_considerados=contexto_brluc["municipios_considerados"],
                municipios_com_area_conversao_para_soja=contexto_brluc[
                    "municipios_com_area_conversao_para_soja"
                ],
                municipios_com_area_origem_natural=contexto_brluc[
                    "municipios_com_area_origem_natural"
                ],
            ),
        ),
        serie_emissoes_seeg=serie_emissoes_seeg,
    )
