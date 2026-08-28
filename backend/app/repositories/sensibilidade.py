from sqlalchemy import text
from sqlalchemy.orm import Session


def listar_resumo_sensibilidade(
    db: Session,
) -> list[dict[str, object]]:
    rows = db.execute(
        text(
            """
            SELECT
                cenario,
                estrategicos_cenario,
                estrategicos_em_comum_com_base,
                retencao_dos_225_base_pct,
                jaccard_pct,
                spearman_relevancia_vs_base,
                spearman_pressao_vs_base
            FROM dim_cenario_sensibilidade
            ORDER BY
                CASE cenario
                    WHEN 'base' THEN 1
                    WHEN 'produtivo' THEN 2
                    WHEN 'ambiental' THEN 3
                    WHEN 'climatico' THEN 4
                    ELSE 5
                END ASC,
                cenario ASC
            """
        )
    ).mappings().all()

    return [dict(row) for row in rows]
