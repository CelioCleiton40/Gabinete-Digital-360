
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
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Criar Nova Conta</h2>
          <p className="mt-2 text-sm text-gray-600">Comece seu Gabinete Digital</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Seu Nome</Label>
              <Input
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Dados do Mandato</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mandatoNome">Nome do Parlamentar</Label>
                  <Input
                    id="mandatoNome"
                    name="mandatoNome"
                    placeholder="Ex: Vereador João"
                    required
                    value={formData.mandatoNome}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <select
                    id="cargo"
                    name="cargo"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  <Label htmlFor="municipio">Município/Estado</Label>
                  <Input
                    id="municipio"
                    name="municipio"
                    placeholder="Ex: São Paulo - SP"
                    required
                    value={formData.municipio}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </Button>
          
          <div className="text-center text-sm">
            <Link to="/login" className="text-blue-600 hover:underline">
              Já tem uma conta? Entre aqui.
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
