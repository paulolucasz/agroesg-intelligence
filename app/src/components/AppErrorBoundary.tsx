import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="placeholder-page">
          <p className="eyebrow">AGROESG INTELLIGENCE</p>
          <h1>Não foi possível exibir esta área</h1>
          <p>
            Ocorreu um erro inesperado na interface. Você pode retornar à Visão
            Executiva e tentar novamente.
          </p>
          <Link className="sidebar-link" to="/">
            Voltar para Visão Executiva
          </Link>
        </section>
      )
    }

    return this.props.children
  }
}
