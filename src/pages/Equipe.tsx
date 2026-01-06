
import { useEffect, useState } from 'react'
import { Plus, Trash2, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Usuario {
  id: string
  nome: string
  email: string
  nivel_acesso: 'admin' | 'assessor' | 'campo'
  ativo: boolean
  created_at: string
}

export default function Equipe() {
  const { user } = useAuth()
  const [equipe, setEquipe] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mandatoId, setMandatoId] = useState<string | null>(null)

  // Form state
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [nivelAcesso, setNivelAcesso] = useState('assessor')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchEquipe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchEquipe = async () => {
    try {
      setLoading(true)
      // Get mandato_id
      const { data: userData } = await supabase
        .from('usuarios')
        .select('mandato_id')
        .eq('id', user?.id)
        .single()

      if (!userData) return
      setMandatoId(userData.mandato_id)

      // Fetch Equipe
      const { data: equipeData, error: equipeError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('mandato_id', userData.mandato_id)
        .order('nome')

      if (equipeError) throw equipeError
      setEquipe(equipeData || [])

    } catch (error) {
      console.error('Erro ao carregar equipe:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMembro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mandatoId) return
    setError(null)

    try {
      // 1. Create User in Auth
      // Note: In a real app, you would likely use an invite system or Supabase Admin API 
      // via Edge Function to create users without logging out the current user.
      // For this MVP, we will simulate the creation by just inserting into the public table
      // and assuming the user would be created via a separate process or admin panel.
      
      // However, since RLS depends on auth.uid(), we need a real auth user.
      // A common pattern for MVPs without Edge Functions is to use a secondary client or 
      // just show a message that "Convite enviado" (simulated).
      
      // Let's implement a "Convite" simulation where we just insert into the table
      // assuming the user will register later or we are using a trigger (not implemented yet).
      
      // WAIT: The 'usuarios' table ID is a foreign key to auth.users. 
      // We cannot insert into 'usuarios' without a corresponding auth user.
      
      // SOLUTION for MVP: We will assume the user has already signed up or we mock the ID for now
      // if we can't call Admin API from client.
      // ACTUALLY: We can't create a user from the client side while logged in as another user easily.
      
      // WORKAROUND: We will create a "Convite" flow.
      // But to keep it simple and functional for the "Test", 
      // we will just show an alert that this feature requires Backend Logic (Edge Functions)
      // to create the Auth User securely.
      
      alert("Nota: Em produção, isso enviaria um e-mail de convite. Para este MVP, você precisaria usar as Edge Functions para criar o usuário no Auth.")
      
      // For demonstration purposes, we will close the dialog.
      setIsDialogOpen(false)
      
    } catch (error: unknown) {
      console.error('Erro ao adicionar membro:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Ocorreu um erro desconhecido')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Carregando equipe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-900">Gerenciamento de Equipe</h1>
          <p className="text-gray-600 text-lg">
            Gerencie quem tem acesso ao gabinete e suas permissões.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition-all hover:scale-105 h-11 px-6">
              <Plus className="mr-2 h-5 w-5" /> Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-t-4 border-blue-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-blue-900">Adicionar Novo Membro</DialogTitle>
              <DialogDescription>
                Envie um convite para um novo assessor acessar o sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMembro}>
              <div className="grid gap-5 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="nome" className="text-blue-900 font-semibold">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-blue-900 font-semibold">Email Corporativo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nivel" className="text-blue-900 font-semibold">Nível de Acesso</Label>
                  <Select value={nivelAcesso} onValueChange={setNivelAcesso}>
                    <SelectTrigger className="h-11 border-gray-300 focus:ring-green-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador (Total)</SelectItem>
                      <SelectItem value="assessor">Assessor (Gabinete)</SelectItem>
                      <SelectItem value="campo">Liderança (Apenas App)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{error}</p>}
                
                <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 border border-yellow-200 flex gap-2 items-start">
                  <span className="text-lg">⚠️</span>
                  <p>Nota: O sistema de convites via e-mail será ativado na versão final.</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold h-11">Enviar Convite</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold text-blue-900 pl-6 h-12">Nome</TableHead>
              <TableHead className="font-bold text-blue-900 h-12">Email</TableHead>
              <TableHead className="font-bold text-blue-900 h-12">Nível de Acesso</TableHead>
              <TableHead className="font-bold text-blue-900 h-12">Status</TableHead>
              <TableHead className="text-right font-bold text-blue-900 pr-6 h-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipe.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <User className="h-10 w-10 text-gray-300" />
                    <p className="font-medium">Nenhum membro encontrado.</p>
                    <p className="text-sm">Adicione membros para começar a colaborar.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              equipe.map((membro) => (
                <TableRow key={membro.id} className="hover:bg-blue-50/50 transition-colors">
                  <TableCell className="pl-6 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shadow-sm border border-blue-200">
                        {membro.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-900">{membro.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{membro.email}</TableCell>
                  <TableCell>
                    <Badge variant={membro.nivel_acesso === 'admin' ? 'default' : 'secondary'} 
                      className={
                        membro.nivel_acesso === 'admin' 
                          ? 'bg-blue-800 hover:bg-blue-900' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }
                    >
                      {membro.nivel_acesso === 'admin' ? 'Administrador' : 
                       membro.nivel_acesso === 'assessor' ? 'Assessor' : 'Liderança'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={membro.ativo 
                      ? "text-green-700 border-green-200 bg-green-50 px-2 py-0.5" 
                      : "text-red-700 border-red-200 bg-red-50 px-2 py-0.5"
                    }>
                      {membro.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
