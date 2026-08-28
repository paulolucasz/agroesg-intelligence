import { get } from './client'
import type {
  MunicipioDetalheResponse,
  MunicipioHistoricoResponse,
  MunicipioSensibilidadeResponse,
} from '../types/municipios'

export interface MunicipioHistoricoQuery {
  ano_inicio?: number
  ano_fim?: number
}

export function getMunicipioDetalhe(
  codigoIbge: string,
): Promise<MunicipioDetalheResponse> {
  return get<MunicipioDetalheResponse>(
    `/api/v1/municipios/${encodeURIComponent(codigoIbge)}`,
  )
}

export function getMunicipioHistorico(
  codigoIbge: string,
  filtros: MunicipioHistoricoQuery = {},
): Promise<MunicipioHistoricoResponse> {
  const searchParams = new URLSearchParams()

  if (filtros.ano_inicio !== undefined) {
    searchParams.set('ano_inicio', String(filtros.ano_inicio))
  }

  if (filtros.ano_fim !== undefined) {
    searchParams.set('ano_fim', String(filtros.ano_fim))
  }

  const query = searchParams.toString()
  const path = `/api/v1/municipios/${encodeURIComponent(codigoIbge)}/historico`

  return get<MunicipioHistoricoResponse>(query ? `${path}?${query}` : path)
}

export function getMunicipioSensibilidade(
  codigoIbge: string,
): Promise<MunicipioSensibilidadeResponse> {
  return get<MunicipioSensibilidadeResponse>(
    `/api/v1/municipios/${encodeURIComponent(codigoIbge)}/sensibilidade`,
  )
}
