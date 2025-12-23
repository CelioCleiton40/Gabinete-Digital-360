
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocorreu um erro inesperado')
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
          <h2 className="text-3xl font-extrabold tracking-tight text-blue-900">Gabinete Digital 360</h2>
          <p className="mt-2 text-sm text-gray-600">A tecnologia a favor do seu mandato.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-blue-900 font-semibold">Email Oficial</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="seunome@mandato.leg.br"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-blue-900 font-semibold">Senha de Acesso</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
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
            {loading ? 'Acessando Gabinete...' : 'Entrar no Sistema'}
          </Button>

          <div className="text-center text-sm pt-2">
            <span className="text-gray-500">Novo por aqui? </span>
            <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-900 hover:underline">
              Criar conta do Mandato
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
