
import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Edit, MessageCircle } from 'lucide-react'
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

interface Eleitor {
  id: string
  nome: string
  whatsapp: string
  bairro: string | null
  cidade: string | null
  created_at: string
}

export default function Eleitores() {
  const { user } = useAuth()
  const [eleitores, setEleitores] = useState<Eleitor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mandatoId, setMandatoId] = useState<string | null>(null)

  // Form state
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')

  useEffect(() => {
    if (user) {
      fetchMandatoAndEleitores()
    }
  }, [user])

  const fetchMandatoAndEleitores = async () => {
    try {
      setLoading(true)
      // Get mandato_id from usuarios table
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('mandato_id')
        .eq('id', user?.id)
        .single()

      if (userError) throw userError
      
      setMandatoId(userData.mandato_id)

      // Fetch eleitores
      const { data: eleitoresData, error: eleitoresError } = await supabase
        .from('eleitores')
        .select('*')
        .eq('mandato_id', userData.mandato_id)
        .order('created_at', { ascending: false })

      if (eleitoresError) throw eleitoresError

      setEleitores(eleitoresData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEleitor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mandatoId) return

    try {
      const { error } = await supabase.from('eleitores').insert([
        {
          mandato_id: mandatoId,
          nome,
          whatsapp,
          bairro,
          cidade,
          // cpf_criptografado would be encrypted here in a real app
        },
      ])

      if (error) throw error

      setIsDialogOpen(false)
      resetForm()
      fetchMandatoAndEleitores()
    } catch (error) {
      console.error('Erro ao adicionar eleitor:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este eleitor?')) return

    try {
      const { error } = await supabase.from('eleitores').delete().eq('id', id)
      if (error) throw error
      fetchMandatoAndEleitores()
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  const resetForm = () => {
    setNome('')
    setWhatsapp('')
    setBairro('')
    setCidade('')
  }

  const filteredEleitores = eleitores.filter((eleitor) =>
    eleitor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eleitor.whatsapp.includes(searchTerm) ||
    (eleitor.bairro && eleitor.bairro.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Eleitores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Eleitor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Eleitor</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo eleitor na base.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEleitor}>
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
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, whatsapp ou bairro..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead>Cidade</TableHead>
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
            ) : filteredEleitores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Nenhum eleitor encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredEleitores.map((eleitor) => (
                <TableRow key={eleitor.id}>
                  <TableCell className="font-medium">{eleitor.nome}</TableCell>
                  <TableCell>
                    <a 
                      href={`https://wa.me/55${eleitor.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:underline"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {eleitor.whatsapp}
                    </a>
                  </TableCell>
                  <TableCell>{eleitor.bairro || '-'}</TableCell>
                  <TableCell>{eleitor.cidade || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(eleitor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
