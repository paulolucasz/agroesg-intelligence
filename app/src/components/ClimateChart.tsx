import {
  CartesianGrid,
  ComposedChart,
  Line,
  Legend,
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

export function ClimateChart({ items }: { items: ProducaoClimaSerieAnual[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={items} margin={{ top: 16, right: 28, left: 24, bottom: 8 }}>
        <CartesianGrid stroke="#e5ece5" strokeDasharray="3 3" />
        <XAxis dataKey="ano" tick={{ fill: '#68776d', fontSize: 12 }} />
        <YAxis
          yAxisId="rainfall"
          width={76}
          tick={{ fill: '#68776d', fontSize: 11 }}
          tickFormatter={(value: number) => formatNumber(value)}
          label={{ value: 'Precipitação (mm)', angle: -90, position: 'insideLeft', offset: 12, fill: '#68776d', fontSize: 12 }}
        />
        <YAxis
          yAxisId="temperature"
          orientation="right"
          width={76}
          tick={{ fill: '#68776d', fontSize: 11 }}
          tickFormatter={(value: number) => formatNumber(value)}
          label={{ value: 'Temperatura (°C)', angle: 90, position: 'insideRight', offset: 12, fill: '#68776d', fontSize: 12 }}
        />
        <Tooltip
          labelFormatter={(label) => `Ano ${label}`}
          formatter={(value, name) => [formatNumber(typeof value === 'number' ? value : null), String(name)]}
          contentStyle={{ borderColor: '#dfe7df', borderRadius: '0.5rem' }}
        />
        <Legend />
        <Line
          yAxisId="rainfall"
          type="monotone"
          dataKey="precipitacao_media_municipal_mm"
          name="Precipitação (mm)"
          stroke="#3f7658"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
        <Line
          yAxisId="temperature"
          type="monotone"
          dataKey="temperatura_media_municipal_c"
          name="Temperatura (°C)"
          stroke="#9a7451"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
