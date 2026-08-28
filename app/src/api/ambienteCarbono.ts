import { get } from './client'
import type {
  AmbienteCarbonoQuery,
  AmbienteCarbonoResponse,
} from '../types/ambienteCarbono'

export function getAmbienteCarbono(
  params: AmbienteCarbonoQuery = {},
): Promise<AmbienteCarbonoResponse> {
  const searchParams = new URLSearchParams()

  if (params.regiao) {
    searchParams.set('regiao', params.regiao)
  }

  if (params.uf) {
    searchParams.set('uf', params.uf)
  }

  const query = searchParams.toString()
  return get<AmbienteCarbonoResponse>(
    `/api/v1/analises/ambiente-carbono${query ? `?${query}` : ''}`,
  )
}
