from sqlalchemy import text
from sqlalchemy.orm import Session


CULTURA = "soja"
ANO_INICIO = 2019
ANO_FIM = 2024


def existe_recorte_producao_clima(
    db: Session,
    regiao: str | None = None,
    uf: str | None = None,
) -> bool:
    return (
        db.execute(
            text(
                """
                SELECT 1
                FROM fato_agroambiental_anual
                WHERE cultura = :cultura
                  AND ano BETWEEN :ano_inicio AND :ano_fim
                  AND regiao IN ('Centro-Oeste', 'Sul')
                  AND uf IN ('DF', 'GO', 'MS', 'MT', 'PR', 'RS', 'SC')
                  AND (:regiao IS NULL OR regiao = :regiao)
                  AND (:uf IS NULL OR uf = :uf)
                LIMIT 1
                """
            ),
            {
                "cultura": CULTURA,
                "ano_inicio": ANO_INICIO,
                "ano_fim": ANO_FIM,
                "regiao": regiao,
                "uf": uf,
            },
        ).scalar()
        is not None
    )


def listar_serie_producao_clima(
    db: Session,
    regiao: str | None = None,
    uf: str | None = None,
) -> list[dict[str, object]]:
    rows = db.execute(
        text(
            """
            SELECT
                ano,
                COUNT(DISTINCT codigo_ibge) AS municipios_considerados,
                COUNT(
                    DISTINCT CASE
                        WHEN quantidade_produzida_t IS NOT NULL THEN codigo_ibge
                    END
                ) AS municipios_com_producao,
                COUNT(
                    DISTINCT CASE
                        WHEN area_colhida_ha IS NOT NULL THEN codigo_ibge
                    END
                ) AS municipios_com_area_colhida,
                COUNT(
                    DISTINCT CASE
                        WHEN quantidade_produzida_t IS NOT NULL
                         AND area_colhida_ha IS NOT NULL
                         AND area_colhida_ha > 0
                        THEN codigo_ibge
                    END
                ) AS municipios_com_producao_e_area_colhida,
                COUNT(
                    DISTINCT CASE
                        WHEN precipitacao_anual_mm IS NOT NULL
                          OR temperatura_media_anual_c IS NOT NULL
                          OR umidade_media_anual_pct IS NOT NULL
                        THEN codigo_ibge
                    END
                ) AS municipios_com_clima,
                SUM(quantidade_produzida_t) AS producao_total_t,
                SUM(area_colhida_ha) AS area_colhida_total_ha,
                CASE
                    WHEN SUM(
                        CASE
                            WHEN quantidade_produzida_t IS NOT NULL
                             AND area_colhida_ha IS NOT NULL
                             AND area_colhida_ha > 0
                            THEN area_colhida_ha
                        END
                    ) > 0
                    THEN 1000.0 * SUM(
                        CASE
                            WHEN quantidade_produzida_t IS NOT NULL
                             AND area_colhida_ha IS NOT NULL
                             AND area_colhida_ha > 0
                            THEN quantidade_produzida_t
                        END
                    ) / SUM(
                        CASE
                            WHEN quantidade_produzida_t IS NOT NULL
                             AND area_colhida_ha IS NOT NULL
                             AND area_colhida_ha > 0
                            THEN area_colhida_ha
                        END
                    )
                    ELSE NULL
                END AS rendimento_agregado_kg_ha,
                AVG(precipitacao_anual_mm) AS precipitacao_media_municipal_mm,
                AVG(temperatura_media_anual_c) AS temperatura_media_municipal_c,
                AVG(umidade_media_anual_pct) AS umidade_media_municipal_pct
            FROM fato_agroambiental_anual
            WHERE cultura = :cultura
              AND ano BETWEEN :ano_inicio AND :ano_fim
              AND regiao IN ('Centro-Oeste', 'Sul')
              AND uf IN ('DF', 'GO', 'MS', 'MT', 'PR', 'RS', 'SC')
              AND (:regiao IS NULL OR regiao = :regiao)
              AND (:uf IS NULL OR uf = :uf)
            GROUP BY ano
            ORDER BY ano ASC
            """
        ),
        {
            "cultura": CULTURA,
            "ano_inicio": ANO_INICIO,
            "ano_fim": ANO_FIM,
            "regiao": regiao,
            "uf": uf,
        },
    ).mappings().all()

    return [dict(row) for row in rows]


def obter_solo_cobertura_ambiente_carbono(
    db: Session,
    regiao: str | None = None,
    uf: str | None = None,
) -> dict[str, object]:
    row = db.execute(
        text(
            """
            SELECT
                COUNT(DISTINCT codigo_ibge) AS municipios_considerados,
                COUNT(
                    DISTINCT CASE
                        WHEN carbono_solo_2024_t_ha IS NOT NULL THEN codigo_ibge
                    END
                ) AS municipios_com_carbono_solo_2024,
                COUNT(
                    DISTINCT CASE
                        WHEN cobertura_natural_2024_pct IS NOT NULL THEN codigo_ibge
                    END
                ) AS municipios_com_cobertura_natural_2024,
                COUNT(
                    DISTINCT CASE
                        WHEN soja_mapbiomas_2024_pct IS NOT NULL THEN codigo_ibge
                    END
                ) AS municipios_com_soja_mapbiomas_2024,
                COUNT(
                    DISTINCT CASE
                        WHEN agricultura_2024_pct IS NOT NULL THEN codigo_ibge
                    END
                ) AS municipios_com_agricultura_2024,
                AVG(carbono_solo_2024_t_ha)
                    AS carbono_solo_medio_municipal_2024_t_ha,
                AVG(cobertura_natural_2024_pct)
                    AS cobertura_natural_media_municipal_2024_pct,
                AVG(soja_mapbiomas_2024_pct)
                    AS soja_mapbiomas_media_municipal_2024_pct,
                AVG(agricultura_2024_pct)
                    AS agricultura_media_municipal_2024_pct,
                AVG(carbono_solo_tendencia_t_ha_ano)
                    AS carbono_solo_tendencia_media_municipal_t_ha_ano,
                AVG(carbono_solo_variacao_2019_2024_t_ha)
                    AS carbono_solo_variacao_media_municipal_2019_2024_t_ha,
                AVG(cobertura_natural_tendencia_pp_ano)
                    AS cobertura_natural_tendencia_media_municipal_pp_ano,
                AVG(cobertura_natural_variacao_2019_2024_pp)
                    AS cobertura_natural_variacao_media_municipal_2019_2024_pp,
                AVG(soja_mapbiomas_tendencia_pp_ano)
                    AS soja_mapbiomas_tendencia_media_municipal_pp_ano,
                AVG(soja_mapbiomas_variacao_2019_2024_pp)
                    AS soja_mapbiomas_variacao_media_municipal_2019_2024_pp
            FROM mart_priorizacao_municipal
            WHERE regiao IN ('Centro-Oeste', 'Sul')
              AND uf IN ('DF', 'GO', 'MS', 'MT', 'PR', 'RS', 'SC')
              AND (:regiao IS NULL OR regiao = :regiao)
              AND (:uf IS NULL OR uf = :uf)
            """
        ),
        {"regiao": regiao, "uf": uf},
    ).mappings().one()

    return dict(row)


def obter_contexto_brluc_ambiente_carbono(
    db: Session,
    regiao: str | None = None,
    uf: str | None = None,
) -> dict[str, object]:
    row = db.execute(
        text(
            """
            SELECT
                MIN(periodo_inicio_brluc) AS periodo_inicio_brluc,
                MAX(periodo_fim_brluc) AS periodo_fim_brluc,
                COUNT(DISTINCT codigo_ibge) AS municipios_considerados,
                COUNT(
                    DISTINCT CASE
                        WHEN area_conversao_para_soja_2000_2019_ha IS NOT NULL
                        THEN codigo_ibge
                    END
                ) AS municipios_com_area_conversao_para_soja,
                COUNT(
                    DISTINCT CASE
                        WHEN area_origem_natural_ha IS NOT NULL THEN codigo_ibge
                    END
                ) AS municipios_com_area_origem_natural,
                SUM(area_conversao_para_soja_2000_2019_ha)
                    AS area_conversao_para_soja_2000_2019_total_ha,
                SUM(area_origem_natural_ha) AS area_origem_natural_total_ha
            FROM mart_priorizacao_municipal
            WHERE regiao IN ('Centro-Oeste', 'Sul')
              AND uf IN ('DF', 'GO', 'MS', 'MT', 'PR', 'RS', 'SC')
              AND (:regiao IS NULL OR regiao = :regiao)
              AND (:uf IS NULL OR uf = :uf)
            """
        ),
        {"regiao": regiao, "uf": uf},
    ).mappings().one()

    return dict(row)


def listar_serie_emissoes_seeg(
    db: Session,
    regiao: str | None = None,
    uf: str | None = None,
) -> list[dict[str, object]]:
    rows = db.execute(
        text(
            """
            SELECT
                ano,
                COUNT(DISTINCT codigo_ibge) AS municipios_considerados,
                COUNT(
                    DISTINCT CASE
                        WHEN emissao_direta_co2e_gwp_ar6_soma_disponivel_t
                            IS NOT NULL
                        THEN codigo_ibge
                    END
                ) AS municipios_com_seeg_direta_disponivel,
                COUNT(
                    DISTINCT CASE
                        WHEN emissao_indireta_co2e_gwp_ar6_soma_disponivel_t
                            IS NOT NULL
                        THEN codigo_ibge
                    END
                ) AS municipios_com_seeg_indireta_disponivel,
                COUNT(
                    DISTINCT CASE
                        WHEN emissao_total_co2e_gwp_ar6_soma_disponivel_t
                            IS NOT NULL
                        THEN codigo_ibge
                    END
                ) AS municipios_com_seeg_total_disponivel,
                SUM(emissao_direta_co2e_gwp_ar6_soma_disponivel_t)
                    AS emissao_direta_co2e_gwp_ar6_soma_disponivel_t,
                SUM(emissao_indireta_co2e_gwp_ar6_soma_disponivel_t)
                    AS emissao_indireta_co2e_gwp_ar6_soma_disponivel_t,
                SUM(emissao_total_co2e_gwp_ar6_soma_disponivel_t)
                    AS emissao_total_co2e_gwp_ar6_soma_disponivel_t
            FROM fato_agroambiental_anual
            WHERE cultura = :cultura
              AND ano BETWEEN :ano_inicio AND :ano_fim
              AND regiao IN ('Centro-Oeste', 'Sul')
              AND uf IN ('DF', 'GO', 'MS', 'MT', 'PR', 'RS', 'SC')
              AND (:regiao IS NULL OR regiao = :regiao)
              AND (:uf IS NULL OR uf = :uf)
            GROUP BY ano
            ORDER BY ano ASC
            """
        ),
        {
            "cultura": CULTURA,
            "ano_inicio": ANO_INICIO,
            "ano_fim": ANO_FIM,
            "regiao": regiao,
            "uf": uf,
        },
    ).mappings().all()

    return [dict(row) for row in rows]


def listar_status_dado_seeg_por_ano(
    db: Session,
    regiao: str | None = None,
    uf: str | None = None,
) -> list[dict[str, object]]:
    rows = db.execute(
        text(
            """
            SELECT
                ano,
                status_dado_seeg,
                COUNT(DISTINCT codigo_ibge) AS municipios
            FROM fato_agroambiental_anual
            WHERE cultura = :cultura
              AND ano BETWEEN :ano_inicio AND :ano_fim
              AND regiao IN ('Centro-Oeste', 'Sul')
              AND uf IN ('DF', 'GO', 'MS', 'MT', 'PR', 'RS', 'SC')
              AND (:regiao IS NULL OR regiao = :regiao)
              AND (:uf IS NULL OR uf = :uf)
            GROUP BY ano, status_dado_seeg
            ORDER BY ano ASC, status_dado_seeg ASC
            """
        ),
        {
            "cultura": CULTURA,
            "ano_inicio": ANO_INICIO,
            "ano_fim": ANO_FIM,
            "regiao": regiao,
            "uf": uf,
        },
    ).mappings().all()

    return [dict(row) for row in rows]
