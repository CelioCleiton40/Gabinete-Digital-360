
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie quem tem acesso ao gabinete e suas permissões.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro</DialogTitle>
              <DialogDescription>
                Envie um convite para um novo assessor acessar o sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMembro}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Corporativo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nivel">Nível de Acesso</Label>
                  <Select value={nivelAcesso} onValueChange={setNivelAcesso}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador (Total)</SelectItem>
                      <SelectItem value="assessor">Assessor (Gabinete)</SelectItem>
                      <SelectItem value="campo">Liderança (Apenas App)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {error && <p className="text-sm text-red-500">{error}</p>}
                
                <div className="bg-yellow-50 p-3 rounded-md text-xs text-yellow-800 border border-yellow-200">
                  <p>⚠️ Nota: O sistema de convites via e-mail será ativado na versão final.</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Enviar Convite</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : equipe.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Nenhum membro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              equipe.map((membro) => (
                <TableRow key={membro.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <User size={16} />
                    </div>
                    {membro.nome}
                  </TableCell>
                  <TableCell>{membro.email}</TableCell>
                  <TableCell>
                    <Badge variant={membro.nivel_acesso === 'admin' ? 'default' : 'secondary'}>
                      {membro.nivel_acesso === 'admin' ? 'Administrador' : 
                       membro.nivel_acesso === 'assessor' ? 'Assessor' : 'Liderança'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={membro.ativo ? 'outline' : 'destructive'} className={membro.ativo ? "text-green-600 border-green-200 bg-green-50" : ""}>
                      {membro.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
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
