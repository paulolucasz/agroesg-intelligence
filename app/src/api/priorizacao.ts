import { get } from './client'
import type {
  PriorizacaoQuery,
  PriorizacaoResponse,
} from '../types/priorizacao'

export function getPriorizacao(
  params: PriorizacaoQuery,
): Promise<PriorizacaoResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.page_size),
  })

  if (params.municipio) {
    searchParams.set('municipio', params.municipio)
  }

  if (params.regiao) {
    searchParams.set('regiao', params.regiao)
  }

  if (params.uf) {
    searchParams.set('uf', params.uf)
  }

  if (params.quadrante) {
    searchParams.set('quadrante', params.quadrante)
  }

  if (params.confianca) {
    searchParams.set('confianca', params.confianca)
  }

  if (params.robustez) {
    searchParams.set('robustez', params.robustez)
  }

  if (params.prioridade_estrategica !== undefined) {
    searchParams.set(
      'prioridade_estrategica',
      String(params.prioridade_estrategica),
    )
  }

  if (params.prioridade_robusta !== undefined) {
    searchParams.set('prioridade_robusta', String(params.prioridade_robusta))
  }

  return get<PriorizacaoResponse>(
    `/api/v1/priorizacao?${searchParams.toString()}`,
  )
}
