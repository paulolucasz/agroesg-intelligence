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

function formatNumber(value: number | null, maximumFractionDigits: number): string {
  return value === null
    ? '—'
    : value.toLocaleString('pt-BR', { maximumFractionDigits })
}

function formatAxisTick(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  }

  return formatNumber(value, 0)
}

export function ProductionAreaChart({
  items,
}: {
  items: ProducaoClimaSerieAnual[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={items} margin={{ top: 16, right: 28, left: 20, bottom: 8 }}>
        <CartesianGrid stroke="#e5ece5" strokeDasharray="3 3" />
        <XAxis dataKey="ano" tick={{ fill: '#68776d', fontSize: 12 }} />
        <YAxis
          yAxisId="production"
          width={64}
          tick={{ fill: '#68776d', fontSize: 11 }}
          tickFormatter={formatAxisTick}
          label={{ value: 'Produção (t)', angle: -90, position: 'insideLeft', offset: 12, fill: '#68776d', fontSize: 12 }}
        />
        <YAxis
          yAxisId="area"
          orientation="right"
          width={72}
          tick={{ fill: '#68776d', fontSize: 11 }}
          tickFormatter={formatAxisTick}
          label={{ value: 'Área colhida (ha)', angle: 90, position: 'insideRight', offset: 12, fill: '#68776d', fontSize: 12 }}
        />
        <Tooltip
          labelFormatter={(label) => `Ano ${label}`}
          formatter={(value, name) => {
            const numericValue = typeof value === 'number' ? value : null
            return [formatNumber(numericValue, 0), String(name)]
          }}
          contentStyle={{ borderColor: '#dfe7df', borderRadius: '0.5rem' }}
        />
        <Legend />
        <Line
          yAxisId="production"
          type="monotone"
          dataKey="producao_total_t"
          name="Produção (t)"
          stroke="#3f7658"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
        <Line
          yAxisId="area"
          type="monotone"
          dataKey="area_colhida_total_ha"
          name="Área colhida (ha)"
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
