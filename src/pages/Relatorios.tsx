
import { useState } from 'react'
import { FileBarChart, Download, Users, FileText, DollarSign, Filter } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import RelatorioDocument from '@/components/RelatorioPDF'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function Relatorios() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [tipoRelatorio, setTipoRelatorio] = useState('eleitores')
  const [filtro, setFiltro] = useState('todos')
  const [reportData, setReportData] = useState<{ colunas: string[], dados: any[][] } | null>(null)

  const handleGenerateReport = async () => {
    setLoading(true)
    setReportData(null)

    try {
      // Get mandato_id
      const { data: userData } = await supabase
        .from('usuarios')
        .select('mandato_id, nome')
        .eq('id', user?.id)
        .single()

      if (!userData) return

      let colunas: string[] = []
      let dados: any[][] = []

      if (tipoRelatorio === 'eleitores') {
        let query = supabase
          .from('eleitores')
          .select('nome, whatsapp, bairro, cidade')
          .eq('mandato_id', userData.mandato_id)
        
        if (filtro !== 'todos') {
          // Mock filter logic just for demo
          // query = query.eq('bairro', filtro) 
        }

        const { data } = await query
        
        colunas = ['Nome', 'WhatsApp', 'Bairro', 'Cidade']
        dados = data?.map(d => [d.nome, d.whatsapp, d.bairro || '-', d.cidade || '-']) || []

      } else if (tipoRelatorio === 'demandas') {
        const { data } = await supabase
          .from('demandas')
          .select('titulo, categoria, status, prioridade')
          .eq('mandato_id', userData.mandato_id)

        colunas = ['Título', 'Categoria', 'Status', 'Prioridade']
        dados = data?.map(d => [d.titulo, d.categoria, d.status, d.prioridade]) || []
      
      } else if (tipoRelatorio === 'financeiro') {
        const { data } = await supabase
          .from('transacoes_financeiras')
          .select('descricao, tipo, categoria, valor, data')
          .eq('mandato_id', userData.mandato_id)
          .order('data', { ascending: false })

        colunas = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor (R$)']
        dados = data?.map(d => [
          new Date(d.data).toLocaleDateString('pt-BR'),
          d.descricao,
          d.tipo,
          d.categoria,
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor)
        ]) || []
      }

      setReportData({ colunas, dados })

    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileBarChart className="h-8 w-8 text-blue-600" />
          Relatórios Gerenciais
        </h1>
        <p className="text-muted-foreground">
          Exporte dados detalhados do seu mandato para análise e controle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Configuração do Relatório */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Novo Relatório</CardTitle>
            <CardDescription>Selecione os dados que deseja exportar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de Dados</Label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eleitores">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Base de Eleitores
                    </div>
                  </SelectItem>
                  <SelectItem value="demandas">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Demandas e Solicitações
                    </div>
                  </SelectItem>
                  <SelectItem value="financeiro">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Prestação de Contas
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="filtro">Filtro (Período/Status)</Label>
              <Select value={filtro} onValueChange={setFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Registros</SelectItem>
                  <SelectItem value="mes_atual">Mês Atual (Simulado)</SelectItem>
                  <SelectItem value="ano_atual">Ano Atual (Simulado)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleGenerateReport} 
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Gerar Pré-visualização'}
            </Button>
          </CardFooter>
        </Card>

        {/* Pré-visualização e Download */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pré-visualização</CardTitle>
              <CardDescription>
                {reportData 
                  ? `Relatório de ${tipoRelatorio.charAt(0).toUpperCase() + tipoRelatorio.slice(1)} gerado com sucesso.` 
                  : 'Gere um relatório para visualizar os dados aqui.'}
              </CardDescription>
            </div>
            {reportData && (
              <PDFDownloadLink
                document={
                  <RelatorioDocument
                    titulo={`Relatório de ${tipoRelatorio.charAt(0).toUpperCase() + tipoRelatorio.slice(1)}`}
                    subtitulo={`Gerado em ${new Date().toLocaleDateString('pt-BR')} - Filtro: ${filtro}`}
                    colunas={reportData.colunas}
                    dados={reportData.dados}
                    usuario={user?.email || 'Usuário'}
                  />
                }
                fileName={`relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.pdf`}
              >
                {({ loading }) => (
                  <Button variant="outline" disabled={loading} className="gap-2 border-green-600 text-green-700 hover:bg-green-50">
                    <Download className="h-4 w-4" />
                    {loading ? 'Gerando PDF...' : 'Baixar PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </CardHeader>
          <CardContent className="min-h-[300px] max-h-[500px] overflow-auto border rounded-md bg-gray-50 p-0">
            {reportData ? (
              <div className="w-full">
                <div className="flex bg-gray-200 sticky top-0 font-semibold text-sm border-b">
                  {reportData.colunas.map((col, i) => (
                    <div key={i} className="flex-1 p-3 min-w-[150px]">{col}</div>
                  ))}
                </div>
                {reportData.dados.length > 0 ? (
                  reportData.dados.map((row, i) => (
                    <div key={i} className="flex border-b bg-white hover:bg-gray-50 text-sm">
                      {row.map((cell: any, j: number) => (
                        <div key={j} className="flex-1 p-3 min-w-[150px] truncate">{cell}</div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum dado encontrado para este filtro.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
                <Filter className="h-10 w-10 opacity-20" />
                <p>Selecione as opções e clique em gerar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
