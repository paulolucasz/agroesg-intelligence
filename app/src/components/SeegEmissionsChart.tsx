import {
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SerieEmissoesSeegItem } from '../types/ambienteCarbono'

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

function formatNumber(value: number | null): string {
  return value === null ? '—' : numberFormatter.format(value)
}

function formatAxisTick(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
    })} mi`
  }

  return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

export function SeegEmissionsChart({
  items,
}: {
  items: SerieEmissoesSeegItem[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={items} margin={{ top: 16, right: 28, left: 20, bottom: 8 }}>
        <CartesianGrid stroke="#e5ece5" strokeDasharray="3 3" />
        <XAxis dataKey="ano" tick={{ fill: '#68776d', fontSize: 12 }} />
        <YAxis
          width={72}
          tick={{ fill: '#68776d', fontSize: 11 }}
          tickFormatter={formatAxisTick}
          label={{
            value: 't CO₂e GWP-AR6',
            angle: -90,
            position: 'insideLeft',
            offset: 12,
            fill: '#68776d',
            fontSize: 12,
          }}
        />
        <Tooltip
          labelFormatter={(label) => `Ano ${label}`}
          formatter={(value, name) => {
            const numericValue = typeof value === 'number' ? value : null
            return [`${formatNumber(numericValue)} t CO₂e`, String(name)]
          }}
          contentStyle={{ borderColor: '#dfe7df', borderRadius: '0.5rem' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="emissao_direta_co2e_gwp_ar6_soma_disponivel_t"
          name="Direta"
          stroke="#3f7658"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="emissao_indireta_co2e_gwp_ar6_soma_disponivel_t"
          name="Indireta"
          stroke="#9a7451"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="emissao_total_co2e_gwp_ar6_soma_disponivel_t"
          name="Total disponível"
          stroke="#183b2a"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
