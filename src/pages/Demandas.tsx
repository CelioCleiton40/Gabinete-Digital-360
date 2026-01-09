
import { useEffect, useState } from 'react'
import { Plus, Search, AlertCircle, CheckCircle, Clock, FileText, FileDown, Sparkles, Trash2, History, MoreVertical } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import OficioDocument from '@/components/OficioPDF'
import DemandasRelatorioPDF from '@/components/DemandasRelatorioPDF'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Demanda {
  id: string
  titulo: string
  descricao: string
  categoria: string
  status: 'aberto' | 'em_tramite' | 'concluido' | 'oficiado'
  prioridade: 'baixa' | 'media' | 'alta'
  eleitor_id: string | null
  eleitor?: { nome: string }
  created_at: string
}

interface Eleitor {
  id: string
  nome: string
}

interface Mandato {
  id: string
  nome_parlamentar: string
  cargo: string
  municipio_estado: string
  config_identidade: {
    cor_primaria?: string
    logo_url?: string
  }
}

// Simples estrutura de histórico (mock visual, pois não temos tabela de histórico ainda)
interface HistoricoItem {
  data: string
  acao: string
  usuario: string
}

export default function Demandas() {
  const { user } = useAuth()
  const [demandas, setDemandas] = useState<Demanda[]>([])
  const [eleitores, setEleitores] = useState<Eleitor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mandatoId, setMandatoId] = useState<string | null>(null)
  const [mandato, setMandato] = useState<Mandato | null>(null)

  // Histórico Dialog
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedDemandaHistory, setSelectedDemandaHistory] = useState<Demanda | null>(null)
  const [historicoMock, setHistoricoMock] = useState<HistoricoItem[]>([])

  // Form state
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('Saúde')
  const [prioridade, setPrioridade] = useState('media')
  const [eleitorId, setEleitorId] = useState<string>('anonimo')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  useEffect(() => {
    if (user) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchData = async () => {
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

      // Fetch Mandato
      const { data: mandatoData } = await supabase
        .from('mandatos')
        .select('*')
        .eq('id', userData.mandato_id)
        .single()
      
      if (mandatoData) setMandato(mandatoData)

      // Fetch Demandas
      const { data: demandasData, error: demandasError } = await supabase
        .from('demandas')
        .select(`
          *,
          eleitor:eleitores(nome)
        `)
        .eq('mandato_id', userData.mandato_id)
        .order('created_at', { ascending: false })

      if (demandasError) throw demandasError
      setDemandas(demandasData || [])

      // Fetch Eleitores for select
      const { data: eleitoresData } = await supabase
        .from('eleitores')
        .select('id, nome')
        .eq('mandato_id', userData.mandato_id)
        .order('nome')

      setEleitores(eleitoresData || [])

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDemanda = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mandatoId) return

    try {
      const { error } = await supabase.from('demandas').insert([
        {
          mandato_id: mandatoId,
          titulo,
          descricao,
          categoria,
          prioridade,
          status: 'aberto',
          eleitor_id: eleitorId === 'anonimo' ? null : eleitorId,
        },
      ])

      if (error) throw error

      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Erro ao adicionar demanda:', error)
    }
  }

  const handleDeleteDemanda = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta demanda? Esta ação não pode ser desfeita.')) return

    try {
      const { error } = await supabase
        .from('demandas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Remove from local state immediately
      setDemandas(demandas.filter(d => d.id !== id))
    } catch (error) {
      console.error('Erro ao excluir demanda:', error)
      alert('Erro ao excluir demanda.')
    }
  }

  const handleGenerateAI = () => {
    if (!titulo) {
      alert('Por favor, preencha pelo menos o título para a IA ter contexto.')
      return
    }

    setIsGeneratingAI(true)
    
    // Simulating AI delay
    setTimeout(() => {
      const generatedText = `Vimos por meio deste solicitar, em caráter de urgência, providências relacionadas a "${titulo}".\n\nA presente demanda se faz necessária tendo em vista os relatos da comunidade local e a necessidade de garantir o bem-estar dos cidadãos. A situação atual requer intervenção imediata do órgão competente para evitar maiores transtornos.\n\nCertos de contar com sua costumeira atenção, subscrevemo-nos.`
      
      setDescricao(generatedText)
      setIsGeneratingAI(false)
    }, 1500)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('demandas')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      fetchData() // Refresh to update UI
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const openHistory = (demanda: Demanda) => {
    setSelectedDemandaHistory(demanda)
    // Gerar histórico mockado baseado na data de criação
    const history = [
      {
        data: new Date(demanda.created_at).toLocaleString('pt-BR'),
        acao: 'Demanda criada',
        usuario: 'Sistema'
      }
    ]
    
    if (demanda.status !== 'aberto') {
      history.push({
        data: new Date(new Date(demanda.created_at).getTime() + 86400000).toLocaleString('pt-BR'), // +1 dia
        acao: 'Status alterado para Em Trâmite',
        usuario: 'Assessor'
      })
    }

    if (demanda.status === 'concluido' || demanda.status === 'oficiado') {
       history.push({
        data: new Date(new Date(demanda.created_at).getTime() + 172800000).toLocaleString('pt-BR'), // +2 dias
        acao: `Status alterado para ${demanda.status === 'oficiado' ? 'Oficiado' : 'Concluído'}`,
        usuario: 'Chefe de Gabinete'
      })
    }

    setHistoricoMock(history.reverse())
    setIsHistoryOpen(true)
  }

  const resetForm = () => {
    setTitulo('')
    setDescricao('')
    setCategoria('Saúde')
    setPrioridade('media')
    setEleitorId('anonimo')
  }

  const filteredDemandas = demandas.filter((demanda) =>
    demanda.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (demanda.eleitor?.nome && demanda.eleitor.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const columns = {
    aberto: filteredDemandas.filter(d => d.status === 'aberto'),
    em_tramite: filteredDemandas.filter(d => d.status === 'em_tramite'),
    concluido: filteredDemandas.filter(d => ['concluido', 'oficiado'].includes(d.status)),
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando demandas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-900">Gestão de Demandas</h1>
          <p className="text-gray-600">Acompanhe e gerencie as solicitações do gabinete.</p>
        </div>
        <div className="flex gap-2">
            <PDFDownloadLink
              document={<DemandasRelatorioPDF demandas={filteredDemandas} />}
              fileName={`relatorio_demandas_${new Date().toISOString().split('T')[0]}.pdf`}
            >
              {({ loading }) => (
                <Button variant="outline" disabled={loading} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <FileText className="mr-2 h-4 w-4" />
                  {loading ? '...' : 'Relatório Geral'}
                </Button>
              )}
            </PDFDownloadLink>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition-all hover:scale-105">
                  <Plus className="mr-2 h-4 w-4" /> Nova Demanda
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] border-t-4 border-blue-800">
                <DialogHeader>
                  <DialogTitle className="text-blue-900 text-xl font-bold">Registrar Nova Demanda</DialogTitle>
                  <DialogDescription>
                    Crie um ticket para acompanhar uma solicitação de um cidadão ou do gabinete.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDemanda}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="titulo" className="text-blue-900 font-semibold">Título</Label>
                      <Input
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                        placeholder="Ex: Buraco na Rua X"
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="eleitor" className="text-blue-900 font-semibold">Cidadão Solicitante</Label>
                      <Select value={eleitorId} onValueChange={setEleitorId}>
                        <SelectTrigger className="border-gray-300 focus:ring-green-500">
                          <SelectValue placeholder="Selecione um cidadão" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anonimo">-- Sem vínculo (Anônimo) --</SelectItem>
                          {eleitores.map((eleitor) => (
                            <SelectItem key={eleitor.id} value={eleitor.id}>
                              {eleitor.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="categoria" className="text-blue-900 font-semibold">Categoria</Label>
                        <Select value={categoria} onValueChange={setCategoria}>
                          <SelectTrigger className="border-gray-300 focus:ring-green-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Saúde">Saúde</SelectItem>
                            <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                            <SelectItem value="Educação">Educação</SelectItem>
                            <SelectItem value="Segurança">Segurança</SelectItem>
                            <SelectItem value="Assistência Social">Assistência Social</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="prioridade" className="text-blue-900 font-semibold">Prioridade</Label>
                        <Select value={prioridade} onValueChange={setPrioridade}>
                          <SelectTrigger className="border-gray-300 focus:ring-green-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="descricao" className="text-blue-900 font-semibold">Descrição Detalhada</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-6 text-xs gap-1"
                          onClick={handleGenerateAI}
                          disabled={isGeneratingAI}
                        >
                          <Sparkles className="h-3 w-3" />
                          {isGeneratingAI ? 'Gerando...' : 'Melhorar com IA'}
                        </Button>
                      </div>
                      <Textarea
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Detalhes sobre a solicitação..."
                        className="h-24 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold w-full sm:w-auto">Salvar Demanda</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar demandas..."
            className="pl-10 border-none shadow-none focus-visible:ring-0 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full gap-6 min-w-[1000px]">
          
          {/* Column: Aberto */}
          <div className="flex-1 flex flex-col rounded-xl bg-gray-50 border border-gray-200 h-full max-h-[calc(100vh-220px)] shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-xl border-t-4 border-t-red-500">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-gray-800">Aberto</h3>
              </div>
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-100">{columns.aberto.length}</Badge>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 bg-gray-50/50">
              {columns.aberto.map(demanda => (
                <DemandaCard 
                  key={demanda.id} 
                  demanda={demanda} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteDemanda}
                  onHistory={() => openHistory(demanda)}
                  mandato={mandato} 
                />
              ))}
            </div>
          </div>

          {/* Column: Em Trâmite */}
          <div className="flex-1 flex flex-col rounded-xl bg-gray-50 border border-gray-200 h-full max-h-[calc(100vh-220px)] shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-xl border-t-4 border-t-yellow-500">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <h3 className="font-bold text-gray-800">Em Trâmite</h3>
              </div>
              <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100">{columns.em_tramite.length}</Badge>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 bg-gray-50/50">
              {columns.em_tramite.map(demanda => (
                <DemandaCard 
                  key={demanda.id} 
                  demanda={demanda} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteDemanda}
                  onHistory={() => openHistory(demanda)}
                  mandato={mandato} 
                />
              ))}
            </div>
          </div>

          {/* Column: Concluído */}
          <div className="flex-1 flex flex-col rounded-xl bg-gray-50 border border-gray-200 h-full max-h-[calc(100vh-220px)] shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-xl border-t-4 border-t-green-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-bold text-gray-800">Concluído</h3>
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">{columns.concluido.length}</Badge>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 bg-gray-50/50">
              {columns.concluido.map(demanda => (
                <DemandaCard 
                  key={demanda.id} 
                  demanda={demanda} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteDemanda}
                  onHistory={() => openHistory(demanda)}
                  mandato={mandato} 
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Dialog de Histórico */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico da Demanda</DialogTitle>
            <DialogDescription>
              {selectedDemandaHistory?.titulo}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <ScrollArea className="h-[300px] w-full pr-4">
                <div className="space-y-4">
                  {historicoMock.map((item, index) => (
                    <div key={index} className="flex gap-4 text-sm">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                        {index !== historicoMock.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-gray-900">{item.acao}</p>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <span>{item.usuario}</span>
                          <span>•</span>
                          <span>{item.data}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DemandaCard({ 
  demanda, 
  onStatusChange, 
  onDelete,
  onHistory,
  mandato 
}: { 
  demanda: Demanda, 
  onStatusChange: (id: string, status: string) => void, 
  onDelete: (id: string) => void,
  onHistory: () => void,
  mandato: Mandato | null 
}) {
  const priorityColor = {
    baixa: 'bg-blue-100 text-blue-800',
    media: 'bg-yellow-100 text-yellow-800',
    alta: 'bg-red-100 text-red-800',
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white group relative">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge className={cn("text-xs capitalize", priorityColor[demanda.prioridade])} variant="outline">
            {demanda.prioridade}
          </Badge>
          <div className="flex items-center gap-1">
             <span className="text-xs text-muted-foreground mr-1">
               {new Date(demanda.created_at).toLocaleDateString('pt-BR')}
             </span>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={onHistory}>
                  <History className="mr-2 h-3 w-3" /> Ver Histórico
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(demanda.id)} className="text-red-600 focus:text-red-600">
                  <Trash2 className="mr-2 h-3 w-3" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardTitle className="text-sm font-bold mt-2 leading-tight">{demanda.titulo}</CardTitle>
        <CardDescription className="text-xs line-clamp-2 mt-1">
          {demanda.descricao || 'Sem descrição.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
          <FileText className="h-3 w-3" />
          <span>{demanda.categoria}</span>
        </div>
        {demanda.eleitor && (
          <div className="text-xs font-medium text-gray-600 mt-1">
            👤 {demanda.eleitor.nome}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-2 bg-gray-50 rounded-b-lg flex justify-end gap-2">
        {demanda.status === 'aberto' && (
           <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onStatusChange(demanda.id, 'em_tramite')}>
             Iniciar
           </Button>
        )}
        {demanda.status === 'em_tramite' && (
           <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onStatusChange(demanda.id, 'concluido')}>
             Concluir
           </Button>
        )}
        {demanda.status === 'concluido' && mandato && (
          <PDFDownloadLink
            document={
              <OficioDocument 
                numeroOficio={demanda.id.slice(0, 4)} 
                ano={new Date().getFullYear().toString()}
                destinatario="Secretaria Competente"
                assunto={demanda.titulo}
                texto={`Solicitamos providências referentes à demanda de ${demanda.categoria} ${demanda.eleitor?.nome ? 'solicitada por ' + demanda.eleitor.nome : ''}. Descrição: ${demanda.descricao}`}
                mandato={mandato}
              />
            }
            fileName={`oficio_${demanda.id.slice(0, 6)}.pdf`}
          >
            {({ loading }) => (
              <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" disabled={loading}>
                <FileDown className="h-3 w-3" />
                {loading ? '...' : 'Gerar Ofício'}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </CardFooter>
    </Card>
  )
}
