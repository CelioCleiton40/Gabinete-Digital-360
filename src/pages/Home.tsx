
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Users, FileText, Activity, MapPin, PieChart as PieChartIcon, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import MapaEleitoral from '@/components/MapaEleitoral'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Eleitor {
  id: string
  bairro: string | null
  cidade: string | null
}

interface Demanda {
  id: string
  categoria: string
  status: string
  created_at: string
}

export default function Home() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Filtro
  const [selectedCity, setSelectedCity] = useState<string>('todas')
  const [availableCities, setAvailableCities] = useState<string[]>([])

  // Raw Data
  const [rawEleitores, setRawEleitores] = useState<Eleitor[]>([])
  const [rawDemandas, setRawDemandas] = useState<Demanda[]>([])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  useEffect(() => {
    async function loadData() {
      if (!user) return

      try {
        setLoading(true)
        // Get mandato_id
        const { data: userData } = await supabase
          .from('usuarios')
          .select('mandato_id')
          .eq('id', user.id)
          .single()

        if (!userData) return
        const mandatoId = userData.mandato_id

        // Fetch ALL Eleitores
        const { data: eleitoresData } = await supabase
          .from('eleitores')
          .select('id, bairro, cidade')
          .eq('mandato_id', mandatoId)

        if (eleitoresData) {
          setRawEleitores(eleitoresData)
          // Extract unique cities
          const cities = Array.from(new Set(eleitoresData.map(e => e.cidade).filter(Boolean))) as string[]
          setAvailableCities(cities.sort())
        }

        // Fetch ALL Demandas
        const { data: demandasData } = await supabase
          .from('demandas')
          .select('id, categoria, status, created_at')
          .eq('mandato_id', mandatoId)
        
        if (demandasData) {
          setRawDemandas(demandasData)
        }

      } catch (error) {
        console.error('Erro ao carregar dados', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Computed Stats based on Filter
  const filteredEleitores = useMemo(() => {
    if (selectedCity === 'todas') return rawEleitores
    return rawEleitores.filter(e => e.cidade === selectedCity)
  }, [rawEleitores, selectedCity])

  // Demandas Filter (Assumindo que não filtramos demandas por cidade pois elas não têm cidade direta no objeto simples, 
  // mas vamos manter o total global ou tentar uma aproximação se necessário. 
  // O prompt pede "dados específicos de cada localidade". Como demandas não tem vínculo direto fácil aqui sem join, 
  // vamos focar em filtrar os ELEITORES que é o foco principal do mapa e gráficos de bairro.
  // Os KPIs de demandas continuarão globais para não confundir, ou poderíamos filtrar se tivéssemos o vínculo carregado.)
  
  // Stats Calculation
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    // KPIs de Demandas continuam globais (ou filtrados se implementarmos a lógica de vínculo)
    // Para MVP, vamos manter globais pois o filtro é explicitamente para "visualizar dados de cada localidade" (foco em eleitores/mapa)
    const demandasAbertas = rawDemandas.filter(d => d.status === 'aberto').length
    const atendimentosHoje = rawDemandas.filter(d => d.created_at.startsWith(today)).length

    return {
      totalEleitores: filteredEleitores.length,
      totalDemandas: rawDemandas.length, // Global
      demandasAbertas, // Global
      atendimentosHoje // Global
    }
  }, [filteredEleitores, rawDemandas])

  const chartData = useMemo(() => {
    const categoryCount = rawDemandas.reduce((acc: Record<string, number>, curr) => {
      acc[curr.categoria] = (acc[curr.categoria] || 0) + 1
      return acc
    }, {})

    return Object.keys(categoryCount).map(key => ({
      name: key,
      value: categoryCount[key]
    }))
  }, [rawDemandas])

  const bairroData = useMemo(() => {
    const bairroCount = filteredEleitores.reduce((acc: Record<string, number>, curr) => {
      const bairro = curr.bairro || 'Não informado'
      acc[bairro] = (acc[bairro] || 0) + 1
      return acc
    }, {})

    return Object.keys(bairroCount)
      .map(key => ({ name: key, value: bairroCount[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [filteredEleitores])

  return (
    <div className="space-y-6">
      {/* Decorative Strip - aligned with Login/Register theme */}
      <div className="w-full h-1.5 flex rounded-full overflow-hidden shadow-sm mb-6">
        <div className="w-1/3 bg-green-600 h-full"></div>
        <div className="w-1/3 bg-yellow-400 h-full"></div>
        <div className="w-1/3 bg-blue-800 h-full"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu mandato em tempo real.</p>
        </div>
        
        {/* City Filter */}
        <div className="flex items-center gap-2 bg-white p-2 px-4 rounded-xl border border-blue-100 shadow-sm">
          <Filter className="h-4 w-4 text-blue-800" />
          <span className="text-sm font-bold text-blue-900">Filtrar por Cidade:</span>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[180px] h-9 border-blue-200 focus:ring-green-500">
              <SelectValue placeholder="Todas as cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Cidades</SelectItem>
              {availableCities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-t-4 border-green-600 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-blue-900">Total de Cidadãos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-800">{loading ? '...' : stats.totalEleitores}</div>
            <p className="text-xs text-gray-500 font-medium">
              {selectedCity !== 'todas' ? `Em ${selectedCity}` : 'Cadastrados na base'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-blue-800 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-blue-900">Total de Demandas</CardTitle>
            <FileText className="h-4 w-4 text-blue-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-800">{loading ? '...' : stats.totalDemandas}</div>
            <p className="text-xs text-gray-500 font-medium">Registradas no sistema</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-yellow-400 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-blue-900">Demandas Abertas</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-800">{loading ? '...' : stats.demandasAbertas}</div>
            <p className="text-xs text-gray-500 font-medium">Aguardando ação</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-blue-600 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-blue-900">Atendimentos Hoje</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-800">{loading ? '...' : stats.atendimentosHoje}</div>
            <p className="text-xs text-gray-500 font-medium">Demandas criadas hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa Interativo */}
      <div className="grid gap-4 md:grid-cols-4">
        <MapaEleitoral eleitores={filteredEleitores} />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        
        {/* Chart: Demandas por Categoria */}
        <Card className="col-span-1 border-t-4 border-blue-800 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 font-bold">
              <PieChartIcon className="h-5 w-5 text-blue-800" />
              Demandas por Categoria
            </CardTitle>
            <CardDescription>Distribuição dos tipos de solicitações (Geral).</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
            </div>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
              {chartData.map((entry, index) => (
                 <div key={entry.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name}
                 </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart: Top Bairros */}
        <Card className="col-span-1 border-t-4 border-green-600 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 font-bold">
              <MapPin className="h-5 w-5 text-green-600" />
              Top 5 Bairros com Cidadãos
            </CardTitle>
            <CardDescription>
              {selectedCity !== 'todas' ? `Bairros de ${selectedCity} com mais cidadãos.` : 'Onde está sua base eleitoral.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
            {bairroData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bairroData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sem dados suficientes para esta seleção.
              </div>
            )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
