import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProducaoClimaSerieAnual } from '../types/producaoClima'

function formatNumber(value: number | null): string {
  return value === null
    ? '—'
    : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export function YieldChart({ items }: { items: ProducaoClimaSerieAnual[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={items} margin={{ top: 16, right: 20, left: 28, bottom: 8 }}>
        <CartesianGrid stroke="#e5ece5" strokeDasharray="3 3" />
        <XAxis dataKey="ano" tick={{ fill: '#68776d', fontSize: 12 }} />
        <YAxis
          width={62}
          tick={{ fill: '#68776d', fontSize: 11 }}
          tickFormatter={(value: number) => formatNumber(value)}
          label={{ value: 'kg/ha', angle: -90, position: 'insideLeft', offset: 12, fill: '#68776d', fontSize: 12 }}
        />
        <Tooltip
          labelFormatter={(label) => `Ano ${label}`}
          formatter={(value) => [formatNumber(typeof value === 'number' ? value : null), 'Rendimento (kg/ha)']}
          contentStyle={{ borderColor: '#dfe7df', borderRadius: '0.5rem' }}
        />
        <Line
          type="monotone"
          dataKey="rendimento_agregado_kg_ha"
          name="Rendimento (kg/ha)"
          stroke="#3f7658"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
