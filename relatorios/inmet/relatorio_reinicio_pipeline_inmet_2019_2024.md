# Relatório de Reinício da Pipeline INMET

## Projeto AgroESG Analytics

### Período

2019 a 2024.

### Fonte

Instituto Nacional de Meteorologia - INMET.

Os dados utilizados a partir desta etapa são os arquivos ZIP originais
baixados diretamente da fonte oficial.

---

## Problema identificado

Durante a validação da base previamente processada (`INMET_LIMPO`),
foram encontrados valores incompatíveis para precipitação.

Um exemplo importante foi a estação A001 - Brasília.

Na base anteriormente processada, a precipitação anual de 2019 aparecia
como 0 mm.

Ao consultar diretamente o arquivo original do INMET foram encontrados:

- 8760 registros horários;
- 8744 registros válidos de precipitação;
- 16 registros ausentes;
- 8259 registros com precipitação igual a zero;
- 485 registros com precipitação maior que zero;
- precipitação horária máxima de 43,4 mm;
- precipitação acumulada de 1369,4 mm.

Isso demonstrou que os valores de precipitação existiam na fonte bruta
e foram perdidos ou transformados incorretamente durante o processamento
anterior.

---

## Auditoria geral

Foram analisados 1195 arquivos estação-ano correspondentes ao período
2019-2024 para as UFs DF, GO, MS, MT, PR, RS e SC.

Resultado da leitura:

- arquivos analisados: 1195;
- erros de leitura: 0.

Também foi executada uma busca por arquivos contendo pelo menos
5000 registros válidos de precipitação e nenhuma precipitação positiva.

Resultado:

- casos encontrados: 0.

---

## Decisão metodológica

A base `INMET_LIMPO` deixa de ser utilizada na construção dos indicadores
climáticos finais.

A nova pipeline utilizará exclusivamente os arquivos ZIP brutos originais
do INMET.

Os arquivos brutos permanecerão imutáveis.

A leitura será realizada diretamente dos ZIPs, sem necessidade de
descompactação manual.

---

## Nova arquitetura

RAW
→ PROCESSED HOURLY
→ PROCESSED DAILY
→ PROCESSED STATION YEAR
→ associação espacial estação-município
→ CURATED MUNICIPIO ANO
→ integração com as demais bases do projeto
→ Power BI

---

## Status

Auditoria da fonte bruta concluída.

Fonte RAW aprovada para reconstrução da pipeline climática.
