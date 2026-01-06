
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    mandatoNome: '',
    cargo: 'vereador',
    municipio: '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // 2. Create Mandato
      const { data: mandatoData, error: mandatoError } = await supabase
        .from('mandatos')
        .insert([
          {
            nome_parlamentar: formData.mandatoNome,
            cargo: formData.cargo,
            municipio_estado: formData.municipio,
            status_assinatura: 'ativo', // Auto-active for dev
          },
        ])
        .select()
        .single()

      if (mandatoError) throw mandatoError

      // 3. Create Usuario linked to Mandato
      const { error: userError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: authData.user.id,
            mandato_id: mandatoData.id,
            nome: formData.nome,
            email: formData.email,
            nivel_acesso: 'admin',
          },
        ])

      if (userError) throw userError

      alert('Cadastro realizado com sucesso! Faça login.')
      navigate('/login')
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message || 'Erro ao realizar cadastro')
      } else {
        setError('Erro ao realizar cadastro')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-600 via-yellow-400 to-blue-800 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl border-t-4 border-blue-800 relative overflow-hidden my-8">
        {/* Decorative Brazilian Strip */}
        <div className="absolute top-0 left-0 w-full h-1 flex">
            <div className="w-1/3 bg-green-600 h-full"></div>
            <div className="w-1/3 bg-yellow-400 h-full"></div>
            <div className="w-1/3 bg-blue-800 h-full"></div>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-800"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-blue-900">Criar Nova Conta</h2>
          <p className="mt-2 text-sm text-gray-600">Comece seu Gabinete Digital 360 hoje mesmo.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome" className="text-blue-900 font-semibold">Seu Nome</Label>
              <Input
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-blue-900 font-semibold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="seunome@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-blue-900 font-semibold">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="••••••••"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wide">Dados do Mandato</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mandatoNome" className="text-gray-700 font-medium">Nome do Parlamentar</Label>
                  <Input
                    id="mandatoNome"
                    name="mandatoNome"
                    placeholder="Ex: Vereador João"
                    required
                    value={formData.mandatoNome}
                    onChange={handleChange}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="cargo" className="text-gray-700 font-medium">Cargo</Label>
                  <select
                    id="cargo"
                    name="cargo"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 mt-1"
                    value={formData.cargo}
                    onChange={handleChange}
                  >
                    <option value="vereador">Vereador</option>
                    <option value="prefeito">Prefeito</option>
                    <option value="deputado_estadual">Deputado Estadual</option>
                    <option value="deputado_federal">Deputado Federal</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="municipio" className="text-gray-700 font-medium">Município/Estado</Label>
                  <Input
                    id="municipio"
                    name="municipio"
                    placeholder="Ex: São Paulo - SP"
                    required
                    value={formData.municipio}
                    onChange={handleChange}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 shadow-lg transition-all hover:scale-[1.02]" 
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
          </Button>
          
          <div className="text-center text-sm pt-2">
            <span className="text-gray-500">Já tem uma conta? </span>
            <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-900 hover:underline">
              Acesse aqui
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Desenvolvido para o Brasil 🇧🇷</p>
        </div>
      </div>
    </div>
  )
}
