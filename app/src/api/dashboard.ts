import { get } from './client'
import type { DashboardResumo } from '../types/dashboard'

export function getDashboardResumo(): Promise<DashboardResumo> {
  return get<DashboardResumo>('/api/v1/dashboard/resumo')
}
