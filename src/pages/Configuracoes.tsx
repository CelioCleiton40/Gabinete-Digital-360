
import { useEffect, useState } from 'react'
import { Save, Building2, CreditCard, Database } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Mandato {
  id: string
  nome_parlamentar: string
  cargo: string
  municipio_estado: string
  status_assinatura: string
  config_identidade: {
    cor_primaria?: string
    logo_url?: string
  }
}

export default function Configuracoes() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [mandato, setMandato] = useState<Mandato | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form State
  const [nomeParlamentar, setNomeParlamentar] = useState('')
  const [cargo, setCargo] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [corPrimaria, setCorPrimaria] = useState('#000000')

  useEffect(() => {
    if (user) {
      fetchConfig()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      // 1. Get Mandato ID from User
      const { data: userData } = await supabase
        .from('usuarios')
        .select('mandato_id')
        .eq('id', user?.id)
        .single()

      if (!userData) return

      // 2. Get Mandato Data
      const { data: mandatoData, error } = await supabase
        .from('mandatos')
        .select('*')
        .eq('id', userData.mandato_id)
        .single()

      if (error) throw error

      setMandato(mandatoData)
      
      // Init Form
      setNomeParlamentar(mandatoData.nome_parlamentar)
      setCargo(mandatoData.cargo)
      setMunicipio(mandatoData.municipio_estado)
      setCorPrimaria(mandatoData.config_identidade?.cor_primaria || '#1e3a8a') // Default Blue

    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mandato) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('mandatos')
        .update({
          nome_parlamentar: nomeParlamentar,
          cargo: cargo,
          municipio_estado: municipio,
          config_identidade: {
            ...mandato.config_identidade,
            cor_primaria: corPrimaria
          }
        })
        .eq('id', mandato.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar as alterações.' })
    } finally {
      setSaving(false)
    }
  }

  const handleSeedDatabase = async () => {
    if (!mandato) return
    if (!confirm('Isso irá gerar dados fictícios (Eleitores e Demandas) no seu mandato. Deseja continuar?')) return

    setSeeding(true)
    setMessage(null)

    try {
      const bairros = ['Centro', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste', 'Jardim das Flores']
      const categorias = ['Saúde', 'Infraestrutura', 'Educação', 'Segurança', 'Assistência Social']
      const prioridades = ['baixa', 'media', 'alta']
      const statusList = ['aberto', 'em_tramite', 'concluido']

      // 1. Criar Eleitores
      const eleitoresParaCriar = Array.from({ length: 20 }).map((_, i) => ({
        mandato_id: mandato.id,
        nome: `Eleitor Teste ${i + 1}`,
        email: `eleitor${i + 1}@teste.com`,
        telefone: `(11) 99999-${String(i).padStart(4, '0')}`,
        bairro: bairros[Math.floor(Math.random() * bairros.length)],
        data_nascimento: '1990-01-01',
      }))

      const { data: eleitoresCriados, error: erroEleitor } = await supabase
        .from('eleitores')
        .insert(eleitoresParaCriar)
        .select()

      if (erroEleitor) throw erroEleitor

      // 2. Criar Demandas
      const demandasParaCriar = Array.from({ length: 30 }).map((_, i) => {
        const eleitor = eleitoresCriados && eleitoresCriados.length > 0 
          ? eleitoresCriados[Math.floor(Math.random() * eleitoresCriados.length)]
          : null
        
        return {
          mandato_id: mandato.id,
          titulo: `Demanda Teste ${i + 1}`,
          descricao: `Descrição automática da demanda gerada para testes de visualização.`,
          categoria: categorias[Math.floor(Math.random() * categorias.length)],
          prioridade: prioridades[Math.floor(Math.random() * prioridades.length)],
          status: statusList[Math.floor(Math.random() * statusList.length)],
          eleitor_id: eleitor ? eleitor.id : null
        }
      })

      const { error: erroDemanda } = await supabase
        .from('demandas')
        .insert(demandasParaCriar)

      if (erroDemanda) throw erroDemanda

      // 3. Criar Despesas (Prestação de Contas)
      const despesasParaCriar = [
        { mandato_id: mandato.id, categoria: 'Divulgação da Atividade Parlamentar', valor: 12500.00, status: 'aprovado', data: '2023-10-05', fornecedor: 'Gráfica Express' },
        { mandato_id: mandato.id, categoria: 'Locação de Imóvel', valor: 3500.00, status: 'aprovado', data: '2023-10-10', fornecedor: 'Imobiliária Central' },
        { mandato_id: mandato.id, categoria: 'Combustíveis e Lubrificantes', valor: 4200.50, status: 'pendente', data: '2023-10-15', fornecedor: 'Posto Shell' },
        { mandato_id: mandato.id, categoria: 'Consultoria Técnica', valor: 8000.00, status: 'analise', data: '2023-10-20', fornecedor: 'Consultoria Jurídica Silva' },
        { mandato_id: mandato.id, categoria: 'Passagens Aéreas', valor: 2300.00, status: 'rejeitado', data: '2023-10-22', fornecedor: 'Gol Linhas Aéreas', motivo: 'Fora do prazo' },
      ]

      const { error: erroDespesa } = await supabase
        .from('despesas')
        .insert(despesasParaCriar)
      
      if (erroDespesa) throw erroDespesa

      // 4. Criar Transações Financeiras (Gestão Financeira)
      const transacoesParaCriar = [
        { mandato_id: mandato.id, descricao: 'Verba de Gabinete Mensal', valor: 25000, tipo: 'receita', categoria: 'Verba Indenizatória', data: '2023-10-01' },
        { mandato_id: mandato.id, descricao: 'Aluguel Escritório Político', valor: 3500, tipo: 'despesa', categoria: 'Infraestrutura', data: '2023-10-05' },
        { mandato_id: mandato.id, descricao: 'Material de Escritório', valor: 450.50, tipo: 'despesa', categoria: 'Material de Consumo', data: '2023-10-07' },
        { mandato_id: mandato.id, descricao: 'Combustível', valor: 1200, tipo: 'despesa', categoria: 'Transporte', data: '2023-10-10' },
        { mandato_id: mandato.id, descricao: 'Serviços de Impressão', valor: 890, tipo: 'despesa', categoria: 'Divulgação', data: '2023-10-15' },
      ]

      const { error: erroTransacao } = await supabase
        .from('transacoes_financeiras')
        .insert(transacoesParaCriar)

      if (erroTransacao) throw erroTransacao

      // 5. Criar Documentos (Histórico)
      const documentosParaCriar = [
        { 
          mandato_id: mandato.id, 
          titulo: 'Solicitação de Reforma da Praça', 
          tipo: 'oficio', 
          conteudo: 'Venho por meio deste solicitar a reforma da praça central...', 
          created_at: new Date().toISOString() 
        },
        { 
          mandato_id: mandato.id, 
          titulo: 'Moção de Aplauso aos Professores', 
          tipo: 'mocao', 
          conteudo: 'A Câmara Municipal aprova moção de aplauso aos professores da rede pública...', 
          created_at: new Date(Date.now() - 86400000).toISOString() // Ontem
        },
      ]

      const { error: erroDocumento } = await supabase
        .from('documentos')
        .insert(documentosParaCriar)

      if (erroDocumento) {
        console.warn('Tabela documentos pode não existir ou erro ao inserir:', erroDocumento)
        // Não lançar erro aqui para não invalidar o sucesso dos anteriores se a tabela não existir
      }

      setMessage({ type: 'success', text: 'Dados gerados com sucesso! Vá para o Dashboard.' })

    } catch (error) {
      console.error('Erro ao gerar dados:', error)
      setMessage({ type: 'error', text: 'Erro ao gerar dados fictícios.' })
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-2 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-900">Configurações</h1>
        <p className="text-gray-600 text-lg">
          Gerencie os dados do seu mandato e assinatura.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Identidade do Mandato */}
        <Card className="shadow-lg border-t-4 border-blue-600">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-blue-900">
              <Building2 className="h-5 w-5 text-blue-600" />
              Identidade do Mandato
            </CardTitle>
            <CardDescription className="text-gray-500">
              Essas informações aparecerão nos ofícios e documentos gerados.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-2">
                <Label htmlFor="nome" className="text-blue-900 font-semibold">Nome do Parlamentar</Label>
                <Input
                  id="nome"
                  value={nomeParlamentar}
                  onChange={(e) => setNomeParlamentar(e.target.value)}
                  placeholder="Ex: Vereador João da Silva"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="cargo" className="text-blue-900 font-semibold">Cargo</Label>
                  <Select value={cargo} onValueChange={setCargo}>
                    <SelectTrigger className="h-11 border-gray-300 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vereador">Vereador</SelectItem>
                      <SelectItem value="prefeito">Prefeito</SelectItem>
                      <SelectItem value="deputado_estadual">Deputado Estadual</SelectItem>
                      <SelectItem value="deputado_federal">Deputado Federal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="municipio" className="text-blue-900 font-semibold">Município/Estado</Label>
                  <Input
                    id="municipio"
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    placeholder="Ex: São Paulo - SP"
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cor" className="text-blue-900 font-semibold">Cor Principal (Identidade Visual)</Label>
                <div className="flex gap-3 items-center">
                  <div className="p-1 border rounded-md bg-white shadow-sm">
                    <Input
                      id="cor"
                      type="color"
                      className="w-16 h-10 p-0 border-0 cursor-pointer"
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                    />
                  </div>
                  <Input
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    placeholder="#000000"
                    className="w-36 font-mono h-11 uppercase"
                  />
                  <div className="text-xs text-gray-500 ml-2">
                    Essa cor será usada no cabeçalho dos PDFs gerados.
                  </div>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-lg border text-sm flex items-center gap-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end p-6 bg-gray-50 border-t border-gray-100 rounded-b-xl">
              <Button type="submit" disabled={saving} className="bg-blue-800 hover:bg-blue-900 text-white font-bold h-11 px-8 shadow-sm transition-all hover:scale-[1.02]">
                {saving ? (
                  'Salvando...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Dados de Teste */}
        <Card className="shadow-md border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Database className="h-5 w-5" />
              Dados de Demonstração
            </CardTitle>
            <CardDescription className="text-blue-600/80">
              Use esta ferramenta para popular o sistema com dados fictícios e testar o Dashboard.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0 pb-6">
            <Button 
              variant="secondary" 
              onClick={handleSeedDatabase} 
              disabled={seeding} 
              className="bg-white text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-sm font-medium"
            >
              {seeding ? 'Gerando...' : 'Gerar Dados Fictícios (Seed)'}
            </Button>
          </CardFooter>
        </Card>

        {/* Assinatura e Cobrança */}
        <Card className="shadow-md">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <CreditCard className="h-5 w-5 text-gray-600" />
              Plano e Assinatura
            </CardTitle>
            <CardDescription>
              Gerencie sua assinatura do Gabinete Digital 360.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 border rounded-xl bg-gray-50/80">
              <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <p className="font-semibold text-gray-700 mb-1">Status da Assinatura</p>
                <Badge variant={mandato?.status_assinatura === 'ativo' ? 'default' : 'destructive'} className="px-3 py-1 text-sm">
                  {mandato?.status_assinatura.toUpperCase()}
                </Badge>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Plano Mensal</p>
                <p className="text-3xl font-extrabold text-gray-900">R$ 1.520,00<span className="text-base font-normal text-gray-500">/mês</span></p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex justify-end">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">Gerenciar no Stripe</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
