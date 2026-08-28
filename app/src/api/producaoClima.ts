import { get } from './client'
import type {
  ProducaoClimaQuery,
  ProducaoClimaResponse,
} from '../types/producaoClima'

export function getProducaoClima(
  params: ProducaoClimaQuery = {},
): Promise<ProducaoClimaResponse> {
  const searchParams = new URLSearchParams()

  if (params.regiao) {
    searchParams.set('regiao', params.regiao)
  }

  if (params.uf) {
    searchParams.set('uf', params.uf)
  }

  const query = searchParams.toString()
  return get<ProducaoClimaResponse>(
    `/api/v1/analises/producao-clima${query ? `?${query}` : ''}`,
  )
}
