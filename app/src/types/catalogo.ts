export interface CatalogoFiltrosAplicados {
  regiao: string | null
  uf: string | null
}

export interface CatalogoFiltros {
  filtros_aplicados: CatalogoFiltrosAplicados
  regioes: string[]
  ufs: string[]
  anos: number[]
  quadrantes: string[]
  faixas_confianca: string[]
  faixas_robustez: string[]
  cenarios: string[]
}

export interface CatalogoFiltrosQuery {
  regiao?: string
  uf?: string
}
