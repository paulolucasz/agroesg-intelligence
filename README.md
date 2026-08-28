# AgroESG Intelligence

> Plataforma de inteligência agroambiental para análise da soja, integração de dados e priorização territorial.

O AgroESG Intelligence integra dados produtivos, climáticos e ambientais para apoiar a leitura territorial da soja no Centro-Oeste e no Sul do Brasil. A plataforma combina processamento de dados, indicadores municipais, API e dashboard analítico em uma arquitetura integrada.

O recorte principal considera a cultura da soja, o período de 2019 a 2024 e o município como unidade de análise. A priorização apresentada é uma triagem territorial analítica relativa ao recorte estudado; não representa geração, certificação ou comercialização de créditos de carbono.

## Objetivo do projeto

O projeto organiza diferentes dimensões da análise agroambiental para:

- analisar a dinâmica produtiva da soja;
- avaliar o contexto climático municipal;
- analisar carbono do solo e cobertura da terra;
- incorporar o histórico de conversão de uso da terra no contexto BRLUC;
- analisar o recorte específico de emissões da SEEG;
- construir uma priorização territorial relativa;
- testar a robustez da priorização sob diferentes cenários.

A priorização não corresponde à certificação, geração ou comercialização de créditos de carbono. Os resultados devem ser interpretados como indicadores e triagem territorial para análise, planejamento e investigação posterior.

## Arquitetura

```text
Fontes de dados
      ↓
ETL / Python
      ↓
Bases processadas
      ↓
MySQL
      ↓
FastAPI
      ↓
React + TypeScript
      ↓
Dashboard AgroESG Intelligence
```

Principais tecnologias utilizadas:

- **Python** e **Pandas** no processamento e integração dos dados;
- **MySQL** como banco de dados;
- **FastAPI**, **SQLAlchemy** e **Pydantic** na API;
- **React** e **TypeScript** no frontend;
- **Vite** no build e desenvolvimento do frontend;
- **Recharts** nas visualizações analíticas.

## Fontes de dados

- **IBGE / PAM:** produção agrícola, área e rendimento da soja por município e ano.
- **INMET:** variáveis climáticas agregadas para o contexto municipal.
- **MapBiomas:** cobertura e uso da terra, incluindo a presença territorial da soja.
- **MapBiomas Solo:** indicadores de carbono do solo.
- **BRLUC / Embrapa:** contexto histórico de conversão de uso da terra para soja.
- **SEEG:** recorte específico de emissões de N₂O associado a resíduos agrícolas da soja em solos manejados.
- **IBGE Malhas Municipais:** referência territorial e padronização dos municípios.

## Escopo analítico

| Item | Escopo |
|---|---|
| Cultura | Soja |
| Período principal | 2019–2024 |
| Regiões | Centro-Oeste e Sul |
| UFs | DF, GO, MS, MT, PR, RS, SC |
| Unidade territorial | Município |
| Chave anual | `codigo_ibge + ano` |

## Pipeline de dados

O fluxo de dados segue as etapas abaixo:

```text
Raw data
  → limpeza
  → padronização municipal
  → integração anual
  → indicadores
  → priorização
  → análise de sensibilidade
  → banco MySQL
  → API
  → dashboard
```

Os notebooks e scripts de processamento apoiam a exploração, limpeza, integração e consolidação das fontes. As bases resultantes alimentam o modelo analítico e as consultas disponibilizadas pela API.

## Priorização territorial

A priorização organiza os municípios em quadrantes a partir de dois eixos analíticos.

### Score de relevância produtiva

O score de relevância produtiva combina, com pesos iguais:

- produção média;
- rendimento médio;
- participação da soja segundo o MapBiomas em 2024.

### Score de pressão agroambiental

O score de pressão agroambiental combina quatro blocos com pesos iguais:

- instabilidade produtiva;
- variabilidade climática;
- mudanças ambientais;
- histórico BRLUC.

### Quadrantes

- Alta relevância + Alta pressão;
- Alta relevância + Baixa pressão;
- Baixa relevância + Alta pressão;
- Baixa relevância + Baixa pressão;
- Dados insuficientes.

O grupo **Alta relevância + Alta pressão** é o grupo estratégico do cenário base. Essa classificação representa priorização relativa dentro do recorte analisado e não deve ser interpretada como potencial de créditos de carbono.

## Análise de sensibilidade

A estabilidade da priorização é avaliada em quatro cenários:

- **Base**;
- **Produtivo**;
- **Ambiental**;
- **Climático**.

As principais métricas são:

- **Retenção:** proporção dos municípios estratégicos do cenário base que permanecem estratégicos no cenário analisado;
- **Jaccard:** similaridade entre os conjuntos de municípios estratégicos;
- **Spearman:** correlação de ordem entre os scores dos cenários;
- **Prioridade robusta:** município estratégico em pelo menos 3 dos 4 cenários.

## BRLUC

BRLUC representa o contexto histórico de conversão para soja no período de **2000–2019**.

Esse bloco não representa uma série anual de 2019–2024. Seus indicadores são utilizados como contexto histórico dentro da análise de pressão agroambiental.

## SEEG

O recorte de SEEG representa:

> N₂O associado a resíduos agrícolas da soja em solos manejados, incluindo componentes diretos e indiretos quando disponíveis, expresso em CO₂e GWP-AR6.

Esse recorte não representa todas as emissões da soja nem um inventário completo da cultura. A disponibilidade dos componentes pode variar por município e ano.

## Dashboard

O frontend React/TypeScript organiza a análise nas seguintes áreas:

1. **Visão Executiva** — apresenta os principais indicadores e uma visão geral do recorte analisado.
2. **Produção & Clima** — mostra a dinâmica produtiva, rendimento, área e condições climáticas ao longo do período.
3. **Ambiente & Carbono** — reúne carbono do solo, cobertura da terra, contexto BRLUC e o recorte específico de emissões SEEG.
4. **Priorização Territorial** — apresenta os scores, quadrantes, filtros territoriais e municípios priorizados.
5. **Explorador de Municípios** — permite consultar detalhes produtivos, climáticos, ambientais, históricos e de sensibilidade por município.
6. **Cenários & Robustez** — compara os cenários de sensibilidade e a estabilidade da priorização.
7. **Metodologia & Notas** — documenta o escopo, os conceitos, as métricas e as limitações da análise.

Rotas do dashboard:

```text
/                    Visão Executiva
/producao-clima      Produção & Clima
/ambiente-carbono    Ambiente & Carbono
/priorizacao         Priorização Territorial
/municipios          Explorador de Municípios
/cenarios-robustez   Cenários & Robustez
/metodologia         Metodologia & Notas
```

## API

A API FastAPI disponibiliza os principais endpoints abaixo:

```text
GET /
GET /health
GET /ready
GET /api/v1/catalogo/filtros
GET /api/v1/dashboard/resumo
GET /api/v1/analises/producao-clima
GET /api/v1/analises/ambiente-carbono
GET /api/v1/priorizacao
GET /api/v1/municipios/{codigo_ibge}
GET /api/v1/municipios/{codigo_ibge}/historico
GET /api/v1/municipios/{codigo_ibge}/sensibilidade
GET /api/v1/sensibilidade/resumo
```

Os endpoints analíticos aceitam os filtros previstos por seus contratos, incluindo o recorte territorial quando aplicável. Os endpoints de município usam `codigo_ibge` como identificador territorial.

## Como executar localmente

### Backend

A partir da raiz do projeto, configure o ambiente local com base no arquivo `.env.example`. Os valores de banco, usuário e senha devem ser preenchidos apenas no arquivo local `.env`, que não deve ser versionado.

Execute a API com:

```powershell
& '.venv\Scripts\python.exe' -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

O backend utiliza as configurações do `.env` da raiz, incluindo conexão MySQL, host e porta da API e origens permitidas para CORS.

### Frontend

Configure `app/.env` com base em `app/.env.example`. A variável principal do frontend é:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Depois, a partir da raiz do projeto:

```powershell
cd app
npm install
npm run dev
```

O frontend será executado pelo Vite e consumirá a API definida em `VITE_API_BASE_URL`.

## Estrutura do projeto

```text
app/          Frontend React + TypeScript e configuração do Vite
backend/      API FastAPI, schemas, routers e acesso ao banco
data/        Dados e artefatos de processamento
docs/         Documentação de apoio
notebooks/    Exploração, integração e consolidação de dados
powerbi/      Artefatos relacionados a análises e visualizações Power BI
relatorios/   Relatórios e materiais analíticos
sql/          Scripts e objetos SQL
src/          Código e apoio ao processamento de dados
tests/        Testes do projeto
```

Os diretórios `data/`, `notebooks/`, `sql/`, `src/` e `tests/` podem conter artefatos de diferentes etapas do ciclo analítico. O dashboard publicado localmente é composto principalmente por `app/` e `backend/`.

## Segurança e configuração

Nunca versionar:

- `.env`;
- credenciais MySQL;
- senhas;
- tokens;
- arquivos de ambiente locais.

Use os arquivos `.env.example` e `app/.env.example` apenas como referência de configuração. Não coloque credenciais reais no README, no código ou em arquivos de exemplo.

## Limitações

- A disponibilidade e a heterogeneidade das fontes podem variar entre municípios e anos.
- As variáveis climáticas são agregadas em nível municipal e não substituem uma avaliação local detalhada.
- A priorização é relativa ao recorte Centro-Oeste + Sul e não deve ser extrapolada automaticamente para outras regiões.
- O contexto BRLUC é limitado ao período de 2000–2019.
- O recorte SEEG é limitado ao escopo específico de N₂O associado a resíduos agrícolas da soja em solos manejados.
- A análise não substitui avaliação de campo.
- A análise não substitui processos de MRV.
- Os resultados não representam créditos de carbono certificados, gerados ou comercializados.

## Status do projeto

Atualmente estão concluídos:

- ETL e consolidação de dados;
- modelo de priorização territorial;
- análise de sensibilidade;
- banco MySQL;
- API FastAPI;
- frontend React/TypeScript;
- dashboard analítico.

O projeto está documentado para execução local e não é apresentado neste README como um sistema em deploy público ou em produção.
