import { get } from './client'
import type {
  CatalogoFiltros,
  CatalogoFiltrosQuery,
} from '../types/catalogo'

export function getCatalogoFiltros(
  params: CatalogoFiltrosQuery = {},
): Promise<CatalogoFiltros> {
  const searchParams = new URLSearchParams()

  if (params.regiao) {
    searchParams.set('regiao', params.regiao)
  }

  if (params.uf) {
    searchParams.set('uf', params.uf)
  }

  const query = searchParams.toString()
  return get<CatalogoFiltros>(
    `/api/v1/catalogo/filtros${query ? `?${query}` : ''}`,
  )
}
