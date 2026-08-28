interface MetricCardProps {
  title: string
  value: string
  caption: string
}

export function MetricCard({ title, value, caption }: MetricCardProps) {
  return (
    <article className="metric-card">
      <p className="metric-title">{title}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-caption">{caption}</p>
    </article>
  )
}
