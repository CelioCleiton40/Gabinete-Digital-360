
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Home from '@/pages/Home'
import Eleitores from '@/pages/Eleitores'

import Equipe from '@/pages/Equipe'

// Placeholder components for routes
import Demandas from '@/pages/Demandas'
import Configuracoes from '@/pages/Configuracoes'

import Integracoes from '@/pages/Integracoes'
import Financeiro from '@/pages/Financeiro'
import Documentos from '@/pages/Documentos'
import Relatorios from '@/pages/Relatorios'
import PrestacaoContas from '@/pages/PrestacaoContas'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="eleitores" element={<Eleitores />} />
            <Route path="demandas" element={<Demandas />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="prestacao-contas" element={<PrestacaoContas />} />
            <Route path="equipe" element={<Equipe />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="integracoes" element={<Integracoes />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
