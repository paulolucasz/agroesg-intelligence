import type { ReactNode } from 'react'

const fontes = [
  {
    nome: 'IBGE / PAM',
    uso: 'Produção de soja, área plantada, área colhida, rendimento e valor da produção.',
  },
  {
    nome: 'INMET',
    uso: 'Precipitação, temperatura, umidade e variabilidade climática.',
  },
  {
    nome: 'MapBiomas',
    uso: 'Cobertura natural, presença de soja e agricultura.',
  },
  {
    nome: 'MapBiomas Solo',
    uso: 'Carbono orgânico do solo.',
  },
  {
    nome: 'BRLUC / Embrapa',
    uso: 'Contexto histórico de conversão de uso da terra para soja entre 2000 e 2019.',
  },
  {
    nome: 'SEEG',
    uso: 'N₂O associado a resíduos agrícolas da soja em solos manejados, direto e indireto quando disponíveis, expresso em CO₂e GWP-AR6.',
  },
  {
    nome: 'IBGE Malhas Municipais',
    uso: 'Referência territorial e códigos municipais.',
  },
]

const fluxoAnalise = [
  'Produção',
  'Clima',
  'Solo e cobertura',
  'Uso histórico da terra',
  'Priorização',
  'Sensibilidade',
]

function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="methodology-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function MethodologySection({
  eyebrow,
  title,
  children,
  className = '',
}: {
  eyebrow: string
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`methodology-section${className ? ` ${className}` : ''}`}>
      <div className="methodology-section-heading">
        <p className="section-kicker">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function MetodologiaNotas() {
  return (
    <main className="methodology-page">
      <header className="methodology-hero">
        <div className="methodology-hero-copy">
          <p className="eyebrow">METODOLOGIA E TRANSPARÊNCIA</p>
          <h1 id="metodologia-notas-title">Metodologia &amp; Notas</h1>
          <p>
            Premissas, fontes, regras de cálculo e limitações da análise agroambiental aplicada à soja.
          </p>
          <div className="methodology-hero-highlight">
            Os resultados representam triagem e priorização territorial. Não correspondem à certificação, emissão ou comercialização de créditos de carbono.
          </div>
        </div>
      </header>

      <MethodologySection eyebrow="Universo analisado" title="Escopo da análise">
        <div className="methodology-fact-grid">
          <div className="methodology-fact">
            <span>Cultura</span>
            <strong>Soja</strong>
          </div>
          <div className="methodology-fact">
            <span>Período principal</span>
            <strong>2019–2024</strong>
          </div>
          <div className="methodology-fact">
            <span>Regiões</span>
            <strong>Centro-Oeste e Sul</strong>
          </div>
          <div className="methodology-fact">
            <span>UFs</span>
            <strong>DF, GO, MS, MT, PR, RS e SC</strong>
          </div>
          <div className="methodology-fact">
            <span>Unidade territorial</span>
            <strong>Município</strong>
          </div>
          <div className="methodology-fact">
            <span>Chave principal da base anual</span>
            <strong>codigo_ibge + ano</strong>
          </div>
        </div>
        <p className="methodology-paragraph">
          A base anual integra informações produtivas, climáticas e ambientais. A priorização final é consolidada em nível municipal, mantendo a unidade territorial comum entre os indicadores. Valores ausentes permanecem como ausência de dado e não são convertidos artificialmente em zero.
        </p>
      </MethodologySection>

      <MethodologySection eyebrow="Bases consultadas" title="Fontes utilizadas">
        <div className="methodology-source-grid">
          {fontes.map((fonte) => (
            <article className="methodology-source-card" key={fonte.nome}>
              <h3>{fonte.nome}</h3>
              <p>{fonte.uso}</p>
            </article>
          ))}
        </div>
      </MethodologySection>

      <div className="methodology-two-column">
        <MethodologySection eyebrow="Dimensão produtiva" title="Score de relevância produtiva">
          <p className="methodology-paragraph">
            O score combina, com pesos iguais, produção média, rendimento médio e participação de soja MapBiomas em 2024. A relevância produtiva é a média dos componentes produtivos normalizados.
          </p>
          <p className="methodology-callout">
            Quanto maior o score, maior a relevância produtiva relativa do município dentro do recorte analisado. É uma medida relativa ao universo analisado e não representa produtividade absoluta isoladamente.
          </p>
        </MethodologySection>

        <MethodologySection eyebrow="Dimensão de pressão" title="Score de pressão agroambiental">
          <p className="methodology-paragraph">
            O score sintetiza pressão relativa a partir de quatro blocos com pesos iguais:
          </p>
          <InfoList
            items={[
              'Instabilidade produtiva',
              'Variabilidade climática',
              'Mudanças ambientais',
              'Histórico BRLUC',
            ]}
          />
          <p className="methodology-paragraph">
            O resultado não representa dano ambiental certificado. Ativos ou contextos ambientais que não constituem pressão não foram incorporados artificialmente ao score.
          </p>
        </MethodologySection>
      </div>

      <MethodologySection eyebrow="Leitura territorial" title="Classificação territorial">
        <div className="methodology-quadrant-grid">
          <div className="methodology-quadrant methodology-quadrant-highlight">
            <strong>Alta relevância + Alta pressão</strong>
            <span>Grupo estratégico no cenário base</span>
          </div>
          <div className="methodology-quadrant">
            <strong>Alta relevância + Baixa pressão</strong>
            <span>Relevância produtiva relativa com menor pressão relativa</span>
          </div>
          <div className="methodology-quadrant">
            <strong>Baixa relevância + Alta pressão</strong>
            <span>Pressão relativa elevada em menor relevância produtiva</span>
          </div>
          <div className="methodology-quadrant">
            <strong>Baixa relevância + Baixa pressão</strong>
            <span>Menor relevância e menor pressão relativas</span>
          </div>
          <div className="methodology-quadrant methodology-quadrant-muted">
            <strong>Dados insuficientes</strong>
            <span>Sem disponibilidade suficiente para a classificação</span>
          </div>
        </div>
        <p className="methodology-paragraph">
          Um município estratégico é um território de alta relevância produtiva relativa combinado com alta pressão agroambiental relativa.
        </p>
        <p className="methodology-callout methodology-callout-warning">
          A classificação não identifica o melhor ou pior município, não define elegibilidade para crédito e não representa potencial de crédito de carbono.
        </p>
      </MethodologySection>

      <MethodologySection eyebrow="Qualidade dos dados" title="Confiança do modelo">
        <div className="methodology-confidence-grid">
          <div className="methodology-confidence-card">
            <strong>Alta</strong>
            <span>Disponibilidade mais consistente dos dados utilizados.</span>
          </div>
          <div className="methodology-confidence-card">
            <strong>Moderada</strong>
            <span>Disponibilidade intermediária ou cobertura parcialmente heterogênea.</span>
          </div>
          <div className="methodology-confidence-card">
            <strong>Limitada</strong>
            <span>Maior restrição na disponibilidade ou qualidade dos indicadores.</span>
          </div>
          <div className="methodology-confidence-card methodology-confidence-muted">
            <strong>Não aplicável</strong>
            <span>Dados insuficientes para sustentar a classificação.</span>
          </div>
        </div>
        <p className="methodology-paragraph">
          A faixa de confiança representa disponibilidade e qualidade dos dados utilizados na priorização. Não é uma certificação externa.
        </p>
      </MethodologySection>

      <MethodologySection eyebrow="Teste de estabilidade" title="Sensibilidade e robustez">
        <p className="methodology-paragraph">
          Os pesos são alterados em quatro cenários para avaliar a estabilidade da priorização:
        </p>
        <div className="methodology-scenario-grid">
          <div><strong>Base</strong><span>Pesos de referência</span></div>
          <div><strong>Produtivo</strong><span>Maior ênfase na dimensão produtiva</span></div>
          <div><strong>Ambiental</strong><span>Maior ênfase na dimensão ambiental</span></div>
          <div><strong>Climático</strong><span>Maior ênfase na dimensão climática</span></div>
        </div>
        <div className="methodology-definition-grid">
          <div>
            <h3>Retenção</h3>
            <p>Percentual dos municípios estratégicos da base que permanecem estratégicos no cenário analisado.</p>
          </div>
          <div>
            <h3>Jaccard</h3>
            <p>Similaridade entre os conjuntos de municípios estratégicos.</p>
          </div>
          <div>
            <h3>Spearman</h3>
            <p>Correlação de ordem entre os scores do cenário e do cenário base. Não é um percentual.</p>
          </div>
        </div>
        <p className="methodology-callout">
          Prioridade robusta identifica municípios estratégicos em pelo menos três dos quatro cenários.
        </p>
      </MethodologySection>

      <div className="methodology-two-column">
        <MethodologySection eyebrow="Contexto de uso da terra" title="Contexto histórico BRLUC">
          <p className="methodology-quote">
            O bloco BRLUC apresenta contexto histórico municipal de conversão para soja no período de 2000–2019. Não representa uma série anual de 2019–2024.
          </p>
          <InfoList
            items={[
              'É um contexto histórico estático.',
              'Não representa conversão ocorrida anualmente entre 2019–2024.',
              'Não foi transformado em série temporal no dashboard.',
              'Métricas sem agregação territorial metodologicamente sustentada ficaram fora dos agregados globais.',
            ]}
          />
        </MethodologySection>

        <MethodologySection eyebrow="Escopo específico de emissões" title="Emissões SEEG">
          <p className="methodology-quote">
            N₂O associado a resíduos agrícolas da soja em solos manejados, incluindo componentes diretos e indiretos quando disponíveis, expresso em CO₂e GWP-AR6.
          </p>
          <InfoList
            items={[
              'Emissão direta disponível.',
              'Emissão indireta disponível.',
              'Total disponível persistido.',
            ]}
          />
          <p className="methodology-callout methodology-callout-warning">
            O total não é recalculado no frontend. Este recorte não representa todas as emissões da soja, um inventário completo da cultura ou as emissões nacionais totais.
          </p>
        </MethodologySection>
      </div>

      <MethodologySection eyebrow="Sem imputação" title="Tratamento de dados ausentes">
        <div className="methodology-missing-grid">
          <div><strong>NULL</strong><span>Ausência de observação.</span></div>
          <div><strong>—</strong><span>Dado indisponível no dashboard.</span></div>
          <div><strong>0</strong><span>Contagens podem legitimamente ser zero.</span></div>
        </div>
        <p className="methodology-paragraph">
          Métricas analíticas ausentes permanecem ausentes. A ausência não é convertida artificialmente em zero nem tratada como evidência de inexistência do fenômeno.
        </p>
      </MethodologySection>

      <MethodologySection eyebrow="Limite de interpretação" title="O que esta análise NÃO representa" className="methodology-section-emphasis">
        <p className="methodology-paragraph">
          A priorização territorial não corresponde a créditos de carbono certificados.
        </p>
        <p className="methodology-paragraph">
          Para que exista um crédito comercializável, são necessárias etapas adicionais, como:
        </p>
        <InfoList
          items={[
            'Definição de metodologia aplicável.',
            'Linha de base e demonstração de adicionalidade.',
            'Quantificação de reduções ou remoções.',
            'Monitoramento, reporte e verificação (MRV).',
            'Regras do padrão de certificação adotado.',
          ]}
        />
        <p className="methodology-callout methodology-callout-warning">
          Esta página não estima quantidade de créditos e não substitui um processo de certificação.
        </p>
      </MethodologySection>

      <MethodologySection eyebrow="Uso responsável" title="Limitações da análise">
        <InfoList
          items={[
            'A análise depende da disponibilidade das fontes utilizadas.',
            'A cobertura pode ser heterogênea entre os indicadores.',
            'O clima é agregado por estatísticas municipais.',
            'A priorização é relativa ao recorte Centro-Oeste + Sul.',
            'BRLUC é limitado ao contexto histórico 2000–2019.',
            'SEEG é limitado ao escopo específico de N₂O de resíduos agrícolas.',
            'Os resultados não substituem avaliação de campo ou MRV de projeto.',
          ]}
        />
      </MethodologySection>

      <MethodologySection eyebrow="Da informação à decisão" title="Fluxo da análise">
        <div className="methodology-flow" aria-label="Fluxo da análise">
          {fluxoAnalise.map((etapa, index) => (
            <div className="methodology-flow-group" key={etapa}>
              <div className="methodology-flow-step">{etapa}</div>
              {index < fluxoAnalise.length - 1 && (
                <span className="methodology-flow-connector" aria-hidden="true">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </MethodologySection>
    </main>
  )
}
