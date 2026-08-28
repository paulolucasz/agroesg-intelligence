from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..schemas.catalogo import CatalogoFiltrosResponse, FiltrosAplicados


router = APIRouter(prefix="/api/v1/catalogo", tags=["Catálogo"])


def _resource_exists(db: Session, query: str, params: dict[str, str]) -> bool:
    return db.execute(text(query), params).scalar() is not None


def _territorial_where_clause(
    non_null_column: str,
    regiao: str | None,
    uf: str | None,
) -> tuple[str, dict[str, str]]:
    conditions = [f"{non_null_column} IS NOT NULL"]
    params: dict[str, str] = {}

    if regiao is not None:
        conditions.append("regiao = :regiao")
        params["regiao"] = regiao

    if uf is not None:
        conditions.append("uf = :uf")
        params["uf"] = uf

    return f" WHERE {' AND '.join(conditions)}", params


def _distinct_values(db: Session, query: str, params: dict[str, str]) -> list[str]:
    return list(db.execute(text(query), params).scalars().all())


@router.get("/filtros", response_model=CatalogoFiltrosResponse)
def listar_filtros(
    regiao: str | None = Query(default=None),
    uf: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> CatalogoFiltrosResponse:
    try:
        if regiao is not None and not _resource_exists(
            db,
            """
            SELECT 1
            FROM mart_priorizacao_municipal
            WHERE regiao = :regiao
            LIMIT 1
            """,
            {"regiao": regiao},
        ):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Região inválida.",
            )

        if uf is not None and not _resource_exists(
            db,
            """
            SELECT 1
            FROM mart_priorizacao_municipal
            WHERE uf = :uf
            LIMIT 1
            """,
            {"uf": uf},
        ):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="UF inválida.",
            )

        if regiao is not None and uf is not None and not _resource_exists(
            db,
            """
            SELECT 1
            FROM mart_priorizacao_municipal
            WHERE regiao = :regiao
              AND uf = :uf
            LIMIT 1
            """,
            {"regiao": regiao, "uf": uf},
        ):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="A UF não pertence à região informada.",
            )

        mart_where, mart_params = _territorial_where_clause(
            "quadrante_priorizacao",
            regiao,
            uf,
        )
        anos_where, anos_params = _territorial_where_clause("ano", regiao, uf)

        regioes = _distinct_values(
            db,
            """
            SELECT DISTINCT regiao
            FROM mart_priorizacao_municipal
            WHERE regiao IS NOT NULL
            ORDER BY regiao
            """,
            {},
        )

        ufs_query = """
            SELECT DISTINCT uf
            FROM mart_priorizacao_municipal
            WHERE uf IS NOT NULL
        """
        ufs_params: dict[str, str] = {}
        if regiao is not None:
            ufs_query += " AND regiao = :regiao"
            ufs_params["regiao"] = regiao
        ufs_query += " ORDER BY uf"
        ufs = _distinct_values(db, ufs_query, ufs_params)

        quadrantes = _distinct_values(
            db,
            """
            SELECT DISTINCT quadrante_priorizacao
            FROM mart_priorizacao_municipal
            """ + mart_where + " ORDER BY quadrante_priorizacao",
            mart_params,
        )
        faixas_confianca = _distinct_values(
            db,
            """
            SELECT DISTINCT faixa_confianca_modelo
            FROM mart_priorizacao_municipal
            """
            + mart_where.replace(
                "quadrante_priorizacao IS NOT NULL",
                "faixa_confianca_modelo IS NOT NULL",
            )
            + " ORDER BY faixa_confianca_modelo",
            mart_params,
        )
        faixas_robustez = _distinct_values(
            db,
            """
            SELECT DISTINCT faixa_robustez_priorizacao
            FROM mart_priorizacao_municipal
            """
            + mart_where.replace(
                "quadrante_priorizacao IS NOT NULL",
                "faixa_robustez_priorizacao IS NOT NULL",
            )
            + " ORDER BY faixa_robustez_priorizacao",
            mart_params,
        )
        anos = list(
            db.execute(
                text(
                    """
                    SELECT DISTINCT ano
                    FROM fato_agroambiental_anual
                    """
                    + anos_where
                    + " ORDER BY ano"
                ),
                anos_params,
            )
            .scalars()
            .all()
        )
        cenarios = _distinct_values(
            db,
            """
            SELECT DISTINCT cenario
            FROM dim_cenario_sensibilidade
            WHERE cenario IS NOT NULL
            ORDER BY cenario
            """,
            {},
        )
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from None

    return CatalogoFiltrosResponse(
        filtros_aplicados=FiltrosAplicados(regiao=regiao, uf=uf),
        regioes=regioes,
        ufs=ufs,
        anos=anos,
        quadrantes=quadrantes,
        faixas_confianca=faixas_confianca,
        faixas_robustez=faixas_robustez,
        cenarios=cenarios,
    )
