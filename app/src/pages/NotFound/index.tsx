import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="placeholder-page">
      <p className="eyebrow">AGROESG INTELLIGENCE</p>
      <h1>Página não encontrada</h1>
      <p>
        O endereço informado não corresponde a uma área disponível do AgroESG Intelligence.
      </p>
      <Link className="sidebar-link" to="/">
        Voltar para Visão Executiva
      </Link>
    </section>
  )
}
