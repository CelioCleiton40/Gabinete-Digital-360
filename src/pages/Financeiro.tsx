
import { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingUp, TrendingDown, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Transacao {
  id: string
  descricao: string
  valor: number
  tipo: 'receita' | 'despesa'
  categoria: string
  data: string
  mandato_id: string
  created_at?: string
}

export default function Financeiro() {
  const { user } = useAuth()
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)
  const [mandatoId, setMandatoId] = useState<string | null>(null)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [novaTransacao, setNovaTransacao] = useState({
    descricao: '',
    valor: '',
    tipo: 'despesa',
    categoria: 'Outros',
    data: new Date().toISOString().split('T')[0]
  })

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
        setLoading(false)
        return
      }

      setMandatoId(userData.mandato_id)

      // 2. Fetch Transacoes Financeiras
      // Note: We are assuming a table 'transacoes_financeiras' exists or we use 'despesas' for expenses?
      // Since Financeiro is broader (receitas/despesas) than PrestacaoContas (cota parlamentar),
      // we should probably use a separate table 'transacoes_financeiras'.
      // If it fails, we catch the error.
      const { data: transacoesData, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('mandato_id', userData.mandato_id)
        .order('data', { ascending: false })

      if (error) {
        // If table doesn't exist, we might just return empty for now to avoid crashing
        console.warn('Tabela transacoes_financeiras pode não existir ainda.', error)
        setTransacoes([])
      } else {
        setTransacoes(transacoesData as Transacao[])
      }

    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cálculos de Resumo
  const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, curr) => acc + curr.valor, 0)
  const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, curr) => acc + curr.valor, 0)
  const saldo = totalReceitas - totalDespesas

  const handleAddTransacao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mandatoId) return

    try {
      setSaving(true)

      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .insert({
          mandato_id: mandatoId,
          descricao: novaTransacao.descricao,
          valor: parseFloat(novaTransacao.valor),
          tipo: novaTransacao.tipo,
          categoria: novaTransacao.categoria,
          data: novaTransacao.data
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setTransacoes([data as Transacao, ...transacoes])
        setIsDialogOpen(false)
        setNovaTransacao({ 
          descricao: '', 
          valor: '', 
          tipo: 'despesa', 
          categoria: 'Outros',
          data: new Date().toISOString().split('T')[0]
        })
      }

    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      alert('Erro ao salvar. Verifique se a tabela "transacoes_financeiras" existe.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return

    try {
      const { error } = await supabase
        .from('transacoes_financeiras')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTransacoes(transacoes.filter(t => t.id !== id))
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  // Dados para o Gráfico
  const chartData = [
    { name: 'Receitas', valor: totalReceitas },
    { name: 'Despesas', valor: totalDespesas },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados financeiros...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestão Financeira</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Movimentação</DialogTitle>
              <DialogDescription>
                Adicione uma receita ou despesa ao controle do gabinete.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTransacao}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select 
                    value={novaTransacao.tipo} 
                    onValueChange={(v) => setNovaTransacao({...novaTransacao, tipo: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita (Entrada)</SelectItem>
                      <SelectItem value="despesa">Despesa (Saída)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input 
                    id="descricao" 
                    value={novaTransacao.descricao}
                    onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                    placeholder="Ex: Aluguel, Doação, Salário..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="valor">Valor (R$)</Label>
                      <Input 
                        id="valor" 
                        type="number" 
                        step="0.01" 
                        value={novaTransacao.valor}
                        onChange={(e) => setNovaTransacao({...novaTransacao, valor: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="data">Data</Label>
                      <Input 
                        id="data" 
                        type="date"
                        value={novaTransacao.data}
                        onChange={(e) => setNovaTransacao({...novaTransacao, data: e.target.value})}
                        required
                      />
                    </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select 
                    value={novaTransacao.categoria} 
                    onValueChange={(v) => setNovaTransacao({...novaTransacao, categoria: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Verba Indenizatória">Verba Indenizatória</SelectItem>
                      <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="Material de Consumo">Material de Consumo</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Divulgação">Divulgação</SelectItem>
                      <SelectItem value="Pessoal">Pessoal</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </div>
            <p className="text-xs text-muted-foreground">Disponível para uso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</div>
            <p className="text-xs text-muted-foreground">+0% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Mês)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</div>
            <p className="text-xs text-muted-foreground">23% da verba utilizada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Gráfico */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Receitas vs Despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="valor" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Transações */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
            <CardDescription>Histórico recente do caixa.</CardDescription>
          </CardHeader>
          <CardContent>
            {transacoes.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    Nenhuma transação registrada.
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transacoes.map((transacao) => (
                    <TableRow key={transacao.id}>
                        <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${transacao.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'}`} />
                            {transacao.descricao}
                        </div>
                        </TableCell>
                        <TableCell>
                        <Badge variant="outline">{transacao.categoria}</Badge>
                        </TableCell>
                        <TableCell>{new Date(transacao.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className={`text-right font-medium ${transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {transacao.tipo === 'despesa' ? '-' : '+'} {formatCurrency(transacao.valor)}
                        </TableCell>
                        <TableCell>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                onClick={() => handleDelete(transacao.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
