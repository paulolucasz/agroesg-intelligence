import { get } from './client'
import type { SensibilidadeResumoResponse } from '../types/sensibilidade'

export function getSensibilidadeResumo(): Promise<SensibilidadeResumoResponse> {
  return get<SensibilidadeResumoResponse>('/api/v1/sensibilidade/resumo')
}
