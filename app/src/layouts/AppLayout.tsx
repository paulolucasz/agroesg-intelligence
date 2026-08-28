import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { AppErrorBoundary } from '../components/AppErrorBoundary'

const navigationItems = [
  { to: '/', label: 'Visão Executiva', end: true },
  { to: '/producao-clima', label: 'Produção & Clima' },
  { to: '/ambiente-carbono', label: 'Ambiente & Carbono' },
  { to: '/priorizacao', label: 'Priorização Territorial' },
  { to: '/municipios', label: 'Explorador de Municípios' },
  { to: '/cenarios-robustez', label: 'Cenários & Robustez' },
  { to: '/metodologia', label: 'Metodologia & Notas' },
]

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand-block">
          <p className="sidebar-kicker">AgroESG</p>
          <p className="sidebar-brand">Intelligence</p>
          <div className="sidebar-context" aria-label="Contexto do projeto">
            <span>SOJA</span>
            <span>2019–2024</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          {navigationItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' sidebar-link-active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="app-main">
        <AppErrorBoundary>
          <Suspense
            fallback={
              <p className="inline-status" role="status" aria-live="polite">
                Carregando área...
              </p>
            }
          >
            <Outlet />
          </Suspense>
        </AppErrorBoundary>
      </main>
    </div>
  )
}
