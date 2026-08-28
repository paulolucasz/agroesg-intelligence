import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppLayout } from '../layouts/AppLayout'
import NotFound from '../pages/NotFound'

const AmbienteCarbono = lazy(() => import('../pages/AmbienteCarbono'))
const CenariosRobustez = lazy(() => import('../pages/CenariosRobustez'))
const ExploradorMunicipios = lazy(() => import('../pages/ExploradorMunicipios'))
const MetodologiaNotas = lazy(() => import('../pages/MetodologiaNotas'))
const PriorizacaoTerritorial = lazy(() => import('../pages/PriorizacaoTerritorial'))
const ProducaoClima = lazy(() => import('../pages/ProducaoClima'))
const VisaoExecutiva = lazy(() => import('../pages/VisaoExecutiva'))

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<VisaoExecutiva />} />
          <Route path="/producao-clima" element={<ProducaoClima />} />
          <Route path="/ambiente-carbono" element={<AmbienteCarbono />} />
          <Route
            path="/priorizacao"
            element={<PriorizacaoTerritorial />}
          />
          <Route path="/municipios" element={<ExploradorMunicipios />} />
          <Route
            path="/cenarios-robustez"
            element={<CenariosRobustez />}
          />
          <Route path="/metodologia" element={<MetodologiaNotas />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
