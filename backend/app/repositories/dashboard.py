from sqlalchemy import text
from sqlalchemy.orm import Session


def buscar_indicadores_dashboard(
    db: Session,
) -> dict[str, object]:
    row = db.execute(
        text(
            """
            SELECT
                COUNT(*) AS total_municipios,
                SUM(elegivel_cruzamento_priorizacao) AS municipios_elegiveis,
                SUM(quadrante_priorizacao = 'Dados insuficientes')
                    AS municipios_dados_insuficientes,
                SUM(flag_prioridade_estrategica_base)
                    AS municipios_estrategicos_base,
                SUM(flag_prioridade_robusta_3_ou_4_cenarios)
                    AS municipios_prioridade_robusta
            FROM mart_priorizacao_municipal
            """
        )
    ).mappings().one()

    return dict(row)


def listar_regioes_dashboard(
    db: Session,
) -> list[str]:
    return list(
        db.execute(
            text(
                """
                SELECT DISTINCT regiao
                FROM mart_priorizacao_municipal
                WHERE regiao IS NOT NULL
                ORDER BY regiao ASC
                """
            )
        ).scalars().all()
    )


def buscar_periodo_dashboard(
    db: Session,
) -> dict[str, object]:
    row = db.execute(
        text(
            """
            SELECT
                MIN(ano) AS ano_inicio,
                MAX(ano) AS ano_fim
            FROM fato_agroambiental_anual
            """
        )
    ).mappings().one()

    return dict(row)


def listar_distribuicao_quadrantes_dashboard(
    db: Session,
) -> list[dict[str, object]]:
    rows = db.execute(
        text(
            """
            SELECT
                quadrante_priorizacao AS quadrante,
                COUNT(*) AS quantidade
            FROM mart_priorizacao_municipal
            WHERE quadrante_priorizacao IS NOT NULL
            GROUP BY quadrante_priorizacao
            ORDER BY quadrante_priorizacao ASC
            """
        )
    ).mappings().all()

    return [dict(row) for row in rows]
