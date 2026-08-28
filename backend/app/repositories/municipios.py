from sqlalchemy import text
from sqlalchemy.orm import Session


def buscar_municipio(
    db: Session,
    codigo_ibge: str,
) -> dict[str, object] | None:
    row = db.execute(
        text(
            """
            SELECT
                codigo_ibge,
                municipio,
                uf,
                regiao,
                quantidade_anos,
                primeiro_ano_disponivel,
                ultimo_ano_disponivel,
                producao_media_t,
                area_colhida_media_ha,
                rendimento_medio_kg_ha,
                rendimento_cv_pct,
                rendimento_tendencia_kg_ha_ano,
                rendimento_variacao_2019_2024_kg_ha,
                precipitacao_media_mm,
                precipitacao_cv_pct,
                temperatura_media_c,
                temperatura_desvio_padrao_c,
                umidade_media_pct,
                umidade_desvio_padrao_pct,
                pior_qualidade_climatica,
                carbono_solo_2024_t_ha,
                carbono_solo_tendencia_t_ha_ano,
                carbono_solo_variacao_2019_2024_t_ha,
                cobertura_natural_2024_pct,
                cobertura_natural_tendencia_pp_ano,
                cobertura_natural_variacao_2019_2024_pp,
                soja_mapbiomas_2024_pct,
                soja_mapbiomas_tendencia_pp_ano,
                soja_mapbiomas_variacao_2019_2024_pp,
                agricultura_2024_pct,
                periodo_inicio_brluc,
                periodo_fim_brluc,
                area_conversao_para_soja_2000_2019_ha,
                percentual_conversao_para_soja_pct,
                area_origem_natural_ha,
                emissao_absoluta_co2_t_ano,
                taxa_emissao_co2_t_ha_ano,
                taxa_emissao_co2_ic95_inf,
                taxa_emissao_co2_ic95_sup,
                flag_ic95_taxa_cruza_zero,
                score_relevancia_produtiva,
                score_pressao_agroambiental,
                quadrante_priorizacao,
                subscore_escala_produtiva,
                subscore_eficiencia_produtiva,
                subscore_presenca_soja,
                subscore_instabilidade_produtiva,
                subscore_variabilidade_climatica,
                subscore_mudancas_ambientais,
                subscore_historico_brluc,
                faixa_confianca_modelo,
                quantidade_cenarios_estrategico,
                faixa_robustez_priorizacao,
                flag_prioridade_estrategica_base,
                flag_prioridade_robusta_3_ou_4_cenarios
            FROM mart_priorizacao_municipal
            WHERE codigo_ibge = :codigo_ibge
            LIMIT 1
            """
        ),
        {"codigo_ibge": codigo_ibge},
    ).mappings().one_or_none()

    return dict(row) if row is not None else None


def buscar_identificacao_municipio(
    db: Session,
    codigo_ibge: str,
) -> dict[str, object] | None:
    row = db.execute(
        text(
            """
            SELECT
                codigo_ibge,
                municipio,
                uf,
                regiao
            FROM mart_priorizacao_municipal
            WHERE codigo_ibge = :codigo_ibge
            LIMIT 1
            """
        ),
        {"codigo_ibge": codigo_ibge},
    ).mappings().one_or_none()

    return dict(row) if row is not None else None


def buscar_historico_municipio(
    db: Session,
    codigo_ibge: str,
    ano_inicio: int,
    ano_fim: int,
) -> list[dict[str, object]]:
    rows = db.execute(
        text(
            """
            SELECT
                ano,
                cultura,
                area_plantada_ha,
                area_colhida_ha,
                area_nao_colhida_ha,
                aproveitamento_area_pct,
                quantidade_produzida_t,
                rendimento_medio_kg_ha,
                valor_producao_mil_reais,
                precipitacao_anual_mm,
                temperatura_media_anual_c,
                umidade_media_anual_pct,
                score_qualidade_climatica,
                qualidade_climatica_geral,
                carbono_solo_t_ha,
                pct_cobertura_natural,
                pct_floresta,
                pct_agropecuaria,
                pct_pastagem,
                pct_agricultura,
                pct_soja_mapbiomas,
                status_dado_seeg,
                emissao_direta_co2e_gwp_ar6_soma_disponivel_t,
                emissao_indireta_co2e_gwp_ar6_soma_disponivel_t,
                emissao_total_co2e_gwp_ar6_soma_disponivel_t,
                emissao_total_co2e_gwp_ar6_t
            FROM fato_agroambiental_anual
            WHERE codigo_ibge = :codigo_ibge
              AND ano BETWEEN :ano_inicio AND :ano_fim
            ORDER BY ano ASC
            """
        ),
        {
            "codigo_ibge": codigo_ibge,
            "ano_inicio": ano_inicio,
            "ano_fim": ano_fim,
        },
    ).mappings().all()

    return [dict(row) for row in rows]



def buscar_resumo_sensibilidade_municipio(
    db: Session,
    codigo_ibge: str,
) -> dict[str, object] | None:
    row = db.execute(
        text(
            """
            SELECT
                codigo_ibge,
                municipio,
                uf,
                regiao,
                quantidade_cenarios_estrategico,
                faixa_robustez_priorizacao,
                flag_prioridade_estrategica_base AS prioridade_estrategica_base,
                flag_prioridade_robusta_3_ou_4_cenarios AS prioridade_robusta
            FROM mart_priorizacao_municipal
            WHERE codigo_ibge = :codigo_ibge
            LIMIT 1
            """
        ),
        {"codigo_ibge": codigo_ibge},
    ).mappings().one_or_none()

    return dict(row) if row is not None else None


def buscar_cenarios_sensibilidade_municipio(
    db: Session,
    codigo_ibge: str,
) -> list[dict[str, object]]:
    rows = db.execute(
        text(
            """
            WITH sensibilidade_municipal AS (
                SELECT
                    score_relevancia__base,
                    score_pressao__base,
                    estrategico__base,
                    score_relevancia__produtivo,
                    score_pressao__produtivo,
                    estrategico__produtivo,
                    score_relevancia__ambiental,
                    score_pressao__ambiental,
                    estrategico__ambiental,
                    score_relevancia__climatico,
                    score_pressao__climatico,
                    estrategico__climatico
                FROM fato_sensibilidade_priorizacao
                WHERE codigo_ibge = :codigo_ibge
            )
            SELECT
                cenario,
                score_relevancia,
                score_pressao,
                estrategico
            FROM (
                SELECT
                    1 AS ordem_apresentacao,
                    'base' AS cenario,
                    score_relevancia__base AS score_relevancia,
                    score_pressao__base AS score_pressao,
                    estrategico__base AS estrategico
                FROM sensibilidade_municipal

                UNION ALL

                SELECT
                    2 AS ordem_apresentacao,
                    'produtivo' AS cenario,
                    score_relevancia__produtivo AS score_relevancia,
                    score_pressao__produtivo AS score_pressao,
                    estrategico__produtivo AS estrategico
                FROM sensibilidade_municipal

                UNION ALL

                SELECT
                    3 AS ordem_apresentacao,
                    'ambiental' AS cenario,
                    score_relevancia__ambiental AS score_relevancia,
                    score_pressao__ambiental AS score_pressao,
                    estrategico__ambiental AS estrategico
                FROM sensibilidade_municipal

                UNION ALL

                SELECT
                    4 AS ordem_apresentacao,
                    'climatico' AS cenario,
                    score_relevancia__climatico AS score_relevancia,
                    score_pressao__climatico AS score_pressao,
                    estrategico__climatico AS estrategico
                FROM sensibilidade_municipal
            ) AS cenarios
            ORDER BY ordem_apresentacao ASC
            """
        ),
        {"codigo_ibge": codigo_ibge},
    ).mappings().all()

    return [dict(row) for row in rows]
