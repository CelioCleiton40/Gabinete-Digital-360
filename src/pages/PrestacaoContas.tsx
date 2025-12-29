import { useState, useEffect, useRef } from 'react'
import { 
  Wallet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Download,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Plus,
  Loader2,
  Paperclip,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

import { PDFDownloadLink } from '@react-pdf/renderer'
import PrestacaoContasPDF from '@/components/PrestacaoContasPDF'

interface Despesa {
  id: string
  mandato_id: string
  categoria: string
  valor: number
  status: 'aprovado' | 'pendente' | 'analise' | 'rejeitado'
  data: string
  fornecedor: string
  motivo?: string
  created_at?: string
  comprovante_url?: string
}

export default function PrestacaoContas() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [mesSelecionado, setMesSelecionado] = useState('Outubro 2023')
  const [mandatoId, setMandatoId] = useState<string | null>(null)
  
  // State for new expense dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null) // Ref para limpar o input
  
  const [novaDespesa, setNovaDespesa] = useState({
    fornecedor: '',
    categoria: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    status: 'pendente' as Despesa['status']
  })

  const cotaTotal = 45000 // R$ 45.000,00 Cota Parlamentar Exemplo

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 1. Get Mandato ID
      const { data: userData } = await supabase
        .from('usuarios')
        .select('mandato_id')
        .eq('id', user?.id)
        .single()

      if (!userData?.mandato_id) {
        console.error('Mandato não encontrado para o usuário')
        setLoading(false)
        return
      }

      setMandatoId(userData.mandato_id)

      // 2. Fetch Despesas
      const { data: despesasData, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('mandato_id', userData.mandato_id)
        .eq('tipo', 'despesa')
        .order('data', { ascending: false })

      if (error) throw error

      if (despesasData) {
        // Map to Despesa type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedDespesas: Despesa[] = despesasData.map((t: any) => {
          const validStatuses: Despesa['status'][] = ['aprovado', 'pendente', 'analise', 'rejeitado']
          const status = validStatuses.includes(t.status) ? t.status : 'aprovado'

          return {
            id: t.id,
            mandato_id: t.mandato_id,
            categoria: t.categoria,
            valor: Number(t.valor),
            status: status as Despesa['status'],
            data: t.data,
            fornecedor: t.descricao, // Map descricao to fornecedor for consistency
            created_at: t.created_at,
            comprovante_url: t.comprovante_url
          }
        })
        setDespesas(mappedDespesas)
      }

    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArquivo(e.target.files[0])
    }
  }

  const handleSalvarDespesa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mandatoId) return

    try {
      setSaving(true)
      
      let comprovanteUrl = null

      // Upload file if exists
      if (arquivo) {
        const fileExt = arquivo.name.split('.').pop()
        const fileName = `${mandatoId}/${Math.random()}.${fileExt}`
        
        // Note: bucket 'comprovantes' must exist in Supabase
        const { error: uploadError } = await supabase.storage
          .from('comprovantes')
          .upload(fileName, arquivo)

        if (uploadError) {
          console.warn('Erro ao fazer upload (bucket pode não existir):', uploadError)
        } else {
          // Get Public URL
          const { data: publicUrlData } = supabase.storage
            .from('comprovantes')
            .getPublicUrl(fileName)
          
          comprovanteUrl = publicUrlData.publicUrl
        }
      }

      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .insert({
          mandato_id: mandatoId,
          descricao: novaDespesa.fornecedor,
          valor: parseFloat(novaDespesa.valor),
          tipo: 'despesa',
          categoria: novaDespesa.categoria,
          data: novaDespesa.data,
          // status: novaDespesa.status, // Se sua tabela tiver coluna status, descomente
          // comprovante_url: comprovanteUrl 
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        // Map back to Despesa for UI
        const newDespesaMapped: Despesa = {
          id: data.id,
          mandato_id: data.mandato_id,
          categoria: data.categoria,
          valor: data.valor,
          status: novaDespesa.status, // Usa o status definido no state (pendente)
          data: data.data,
          fornecedor: data.descricao,
          created_at: data.created_at,
          comprovante_url: comprovanteUrl || undefined
        }
        
        setDespesas([newDespesaMapped, ...despesas])
        setIsDialogOpen(false)
        
        // Reset form
        setNovaDespesa({
          fornecedor: '',
          categoria: '',
          valor: '',
          data: new Date().toISOString().split('T')[0],
          status: 'pendente'
        })
        setArquivo(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }

    } catch (error) {
      console.error('Erro ao salvar despesa:', error)
      alert('Erro ao salvar despesa. Verifique a conexão com o banco de dados.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return

    try {
      const { error } = await supabase
        .from('transacoes_financeiras')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDespesas(despesas.filter(d => d.id !== id))
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  const totalGasto = despesas.reduce((acc, curr) => curr.status !== 'rejeitado' ? acc + curr.valor : acc, 0)
  const percentualUso = (totalGasto / cotaTotal) * 100
  const saldoRestante = cotaTotal - totalGasto

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  // Determina a cor da barra de progresso
  const getProgressColorClass = (percent: number) => {
    if (percent > 90) return '[&>div]:bg-red-500'
    if (percent > 70) return '[&>div]:bg-yellow-500'
    return '[&>div]:bg-green-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados financeiros...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Wallet className="h-8 w-8 text-green-700" />
              Prestação de Contas
            </h1>
            <p className="text-muted-foreground">
              Gestão da Cota para o Exercício da Atividade Parlamentar (CEAP).
            </p>
          </div>
          <div className="flex items-center gap-2">
             <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
              <SelectTrigger className="w-[180px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Outubro 2023">Outubro 2023</SelectItem>
                <SelectItem value="Setembro 2023">Setembro 2023</SelectItem>
                <SelectItem value="Agosto 2023">Agosto 2023</SelectItem>
              </SelectContent>
            </Select>
            
            <PDFDownloadLink
              document={
                <PrestacaoContasPDF 
                  despesas={despesas} 
                  mesReferencia={mesSelecionado}
                  cotaTotal={cotaTotal}
                />
              }
              fileName={`prestacao_contas_${mesSelecionado.replace(' ', '_').toLowerCase()}.pdf`}
            >
              {({ loading }) => (
                <Button variant="outline" className="gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {loading ? 'Gerando...' : 'Exportar Pacote'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* Visão Geral da Cota */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Utilização da Cota Mensal</CardTitle>
            <CardDescription>
              Acompanhamento do limite disponível para o mês de {mesSelecionado}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="font-medium text-gray-600">Consumido: {formatCurrency(totalGasto)}</span>
                <span className="font-medium text-gray-900">Limite: {formatCurrency(cotaTotal)}</span>
              </div>
              <Progress 
                value={percentualUso} 
                className={`h-4 ${getProgressColorClass(percentualUso)}`}
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {percentualUso.toFixed(1)}% utilizado
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
               <div className="text-center">
                 <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                 <p className="text-xl font-bold text-green-600">{formatCurrency(saldoRestante)}</p>
               </div>
               <div className="text-center border-l">
                 <p className="text-sm text-muted-foreground">Itens Aprovados</p>
                 <p className="text-xl font-bold text-blue-600">
                    {despesas.filter(d => d.status === 'aprovado').length}
                 </p>
               </div>
               <div className="text-center border-l">
                 <p className="text-sm text-muted-foreground">Pendências</p>
                 <p className="text-xl font-bold text-yellow-600">
                    {despesas.filter(d => d.status === 'pendente' || d.status === 'analise').length}
                 </p>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Status de Regularidade</CardTitle>
            <CardDescription className="text-blue-700">Situação atual junto ao órgão controlador.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
             <div className="h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center mb-4 border-4 border-yellow-200">
               <AlertTriangle className="h-10 w-10 text-yellow-600" />
             </div>
             <h3 className="text-xl font-bold text-yellow-800">Em Análise</h3>
             <p className="text-sm text-center text-yellow-700 mt-2">
               Existem {despesas.filter(d => d.status === 'pendente' || d.status === 'analise').length} lançamentos aguardando análise.
             </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Resolver Pendências
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Lista de Despesas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Detalhamento de Despesas</CardTitle>
            <CardDescription>Lançamentos registrados no período.</CardDescription>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Lançamento de Despesa</DialogTitle>
                <DialogDescription>
                  Registre uma nova despesa para a prestação de contas e anexe a nota fiscal.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSalvarDespesa}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input
                      id="fornecedor"
                      value={novaDespesa.fornecedor}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, fornecedor: e.target.value })}
                      placeholder="Nome da empresa ou prestador"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select 
                      value={novaDespesa.categoria} 
                      onValueChange={(v) => setNovaDespesa({ ...novaDespesa, categoria: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Divulgação da Atividade Parlamentar">Divulgação</SelectItem>
                        <SelectItem value="Locação de Imóvel">Locação de Imóvel</SelectItem>
                        <SelectItem value="Combustíveis e Lubrificantes">Combustíveis</SelectItem>
                        <SelectItem value="Consultoria Técnica">Consultoria Técnica</SelectItem>
                        <SelectItem value="Passagens Aéreas">Passagens Aéreas</SelectItem>
                        <SelectItem value="Material de Consumo">Material de Consumo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="valor">Valor (R$)</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={novaDespesa.valor}
                        onChange={(e) => setNovaDespesa({ ...novaDespesa, valor: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="data">Data</Label>
                      <Input
                        id="data"
                        type="date"
                        value={novaDespesa.data}
                        onChange={(e) => setNovaDespesa({ ...novaDespesa, data: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="arquivo">Comprovante / Nota Fiscal</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="arquivo" 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: PDF, JPG, PNG.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {saving ? 'Enviando...' : 'Salvar e Anexar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </CardHeader>
        <CardContent>
          {despesas.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Nenhuma despesa registrada para este período.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell>{new Date(despesa.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{despesa.fornecedor}</span>
                        {despesa.comprovante_url && (
                          <a 
                            href={despesa.comprovante_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            <Paperclip className="h-3 w-3" />
                            Ver Nota Fiscal
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {despesa.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`
                          ${despesa.status === 'aprovado' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' : ''}
                          ${despesa.status === 'rejeitado' ? 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' : ''}
                          ${despesa.status === 'analise' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200' : ''}
                          ${despesa.status === 'pendente' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200' : ''}
                        `}
                        variant="outline"
                      >
                        {despesa.status === 'aprovado' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {despesa.status === 'rejeitado' && <AlertTriangle className="mr-1 h-3 w-3" />}
                        {despesa.status === 'aprovado' ? 'Regular' :
                         despesa.status === 'rejeitado' ? 'Glosa' :
                         despesa.status === 'analise' ? 'Em Análise' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(despesa.valor)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          {despesa.comprovante_url && (
                            <DropdownMenuItem asChild>
                              <a href={despesa.comprovante_url} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> Visualizar Nota
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>Editar Lançamento</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => handleDelete(despesa.id)}>
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}