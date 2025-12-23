
import { useState, useEffect } from 'react'
import { Sparkles, Download, Copy, Check, Wand2, Save, Clock, FileText, Trash2 } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import OficioDocument from '@/components/OficioPDF'
import { supabase } from '@/lib/supabase'
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

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

interface DocumentoSaved {
  id: string
  titulo: string
  tipo: string
  conteudo: string
  created_at: string
}

export default function Documentos() {
  const { user } = useAuth()
  const [mandato, setMandato] = useState<Mandato | null>(null)
  const [loading, setLoading] = useState(true)
  const [historico, setHistorico] = useState<DocumentoSaved[]>([])
  
  // Document State
  const [tipoDoc, setTipoDoc] = useState('oficio')
  const [destinatario, setDestinatario] = useState('')
  const [assunto, setAssunto] = useState('')
  const [topicos, setTopicos] = useState('')
  const [conteudoGerado, setConteudoGerado] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      fetchMandatoAndHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchMandatoAndHistory = async () => {
    try {
      setLoading(true)
      const { data: userData } = await supabase
        .from('usuarios')
        .select('mandato_id')
        .eq('id', user?.id)
        .single()

      if (!userData) return

      // Fetch Mandato
      const { data: mandatoData } = await supabase
        .from('mandatos')
        .select('*')
        .eq('id', userData.mandato_id)
        .single()

      setMandato(mandatoData)

      // Fetch History
      fetchHistory(userData.mandato_id)

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async (mandatoId: string) => {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('mandato_id', mandatoId)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Tabela documentos pode não existir ainda.', error)
      } else {
        setHistorico(data as DocumentoSaved[])
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
    }
  }

  const handleGenerateAI = () => {
    if (!assunto || !topicos) {
      alert('Por favor, preencha o assunto e os tópicos para a IA trabalhar.')
      return
    }

    setIsGenerating(true)

    // Simulação de chamada para API de IA (ex: OpenAI / Gemini)
    setTimeout(() => {
      let texto = ''

      if (tipoDoc === 'oficio') {
        texto = `Venho, por meio deste, solicitar a Vossa Senhoria providências urgentes em relação a ${assunto}. \n\nA demanda se justifica pelos seguintes motivos:\n\n` +
        topicos.split(',').map(t => `- ${t.trim()};`).join('\n') +
        `\n\nRessalto que tal medida é de suma importância para o bem-estar da comunidade local e para a manutenção da ordem pública. A falta de ação pode acarretar prejuízos irreparáveis aos munícipes.\n\nConto com a colaboração deste órgão para uma solução célere.`
      } else if (tipoDoc === 'mocao') {
        texto = `A CÂMARA MUNICIPAL, por iniciativa do vereador ${mandato?.nome_parlamentar || 'subscrevente'}, APROVA a presente MOÇÃO DE ${assunto.toUpperCase()} a ser encaminhada a ${destinatario}.\n\nJUSTIFICATIVA:\n\n` +
        `Considerando que ${topicos};\n\n` +
        `Considerando a relevância dos serviços prestados à comunidade;\n\n` +
        `Esta Casa Legislativa não poderia deixar de prestar esta justa homenagem, reconhecendo o valor e a dedicação demonstrados.`
      } else if (tipoDoc === 'projeto_lei') {
        texto = `EMENTA: Dispõe sobre ${assunto} e dá outras providências.\n\n` +
        `Art. 1º Fica instituído no âmbito do município a obrigatoriedade de ${topicos.split(',')[0] || '...'}.\n\n` +
        `Art. 2º O Poder Executivo regulamentará esta Lei no prazo de 90 (noventa) dias.\n\n` +
        `Art. 3º Esta Lei entra em vigor na data de sua publicação.\n\n` +
        `JUSTIFICATIVA:\n\n` +
        `O presente projeto visa atender aos anseios da população no que tange a ${assunto}. A medida se faz necessária para garantir direitos fundamentais e promover o desenvolvimento social.`
      }

      setConteudoGerado(texto)
      setIsGenerating(false)
    }, 2000)
  }

  const handleSave = async () => {
    if (!mandato || !conteudoGerado) return
    
    try {
      setIsSaving(true)
      const { data, error } = await supabase
        .from('documentos')
        .insert({
          mandato_id: mandato.id,
          titulo: assunto,
          tipo: tipoDoc,
          conteudo: conteudoGerado,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setHistorico([data as DocumentoSaved, ...historico])
        alert('Documento salvo no histórico com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao salvar documento:', error)
      alert('Erro ao salvar. Verifique se a tabela "documentos" existe.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento do histórico?')) return

    try {
      const { error } = await supabase
        .from('documentos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setHistorico(historico.filter(d => d.id !== id))
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(conteudoGerado)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLoadFromHistory = (doc: DocumentoSaved) => {
    setAssunto(doc.titulo)
    setTipoDoc(doc.tipo)
    setConteudoGerado(doc.conteudo)
    // We don't restore destinatario/topicos as they are not saved in this simple schema, 
    // but the generated content is fully restored.
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Wand2 className="h-8 w-8 text-purple-600" />
          Redator Inteligente
        </h1>
        <p className="text-muted-foreground">
          Crie ofícios, moções e projetos de lei em segundos com Inteligência Artificial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lado Esquerdo: Configuração */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Parâmetros do Documento</CardTitle>
            <CardDescription>Defina o contexto para a IA gerar o texto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de Documento</Label>
              <Select value={tipoDoc} onValueChange={setTipoDoc}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oficio">Ofício de Solicitação</SelectItem>
                  <SelectItem value="mocao">Moção (Aplauso/Repúdio)</SelectItem>
                  <SelectItem value="projeto_lei">Projeto de Lei (Minuta)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="destinatario">Destinatário</Label>
              <Input 
                id="destinatario" 
                placeholder="Ex: Secretário de Obras, Prefeito..." 
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assunto">Assunto Principal</Label>
              <Input 
                id="assunto" 
                placeholder="Ex: Reforma da Praça Central" 
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="topicos">Pontos Chave (Contexto)</Label>
              <Textarea 
                id="topicos" 
                placeholder="Liste os pontos principais separados por vírgula. Ex: Iluminação precária, bancos quebrados, falta de segurança..." 
                className="h-32"
                value={topicos}
                onChange={(e) => setTopicos(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
              onClick={handleGenerateAI}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" /> Gerando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Gerar Documento
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Lado Direito: Resultado e Editor */}
        <div className="space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Editor de Texto</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCopy} title="Copiar Texto">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[400px]">
              <Textarea 
                className="h-full min-h-[400px] resize-none font-mono text-sm leading-relaxed p-4"
                value={conteudoGerado}
                onChange={(e) => setConteudoGerado(e.target.value)}
                placeholder="O texto gerado pela IA aparecerá aqui para revisão..."
              />
            </CardContent>
            <CardFooter className="bg-gray-50 rounded-b-lg border-t p-4 flex justify-between items-center gap-2">
              <Button 
                variant="secondary" 
                disabled={isSaving || !conteudoGerado} 
                onClick={handleSave}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar no Histórico'}
              </Button>
              
              {mandato && conteudoGerado && (
                <PDFDownloadLink
                  document={
                    <OficioDocument 
                      numeroOficio="000" 
                      ano={new Date().getFullYear().toString()}
                      destinatario={destinatario || "A Quem Interessar Possa"}
                      assunto={assunto || "Assunto do Documento"}
                      texto={conteudoGerado}
                      mandato={mandato}
                    />
                  }
                  fileName={`documento_${tipoDoc}.pdf`}
                  className="flex-1"
                >
                  {({ loading }) => (
                    <Button variant="default" disabled={loading} className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      {loading ? '...' : 'Baixar PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Histórico de Documentos */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
          <Clock className="h-6 w-6 text-gray-600" />
          Histórico de Documentos
        </h2>
        
        <Card>
          <CardContent className="p-0">
            {historico.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum documento salvo no histórico.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Título / Assunto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historico.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          {doc.titulo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.tipo === 'projeto_lei' ? 'Projeto de Lei' : doc.tipo.charAt(0).toUpperCase() + doc.tipo.slice(1)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleLoadFromHistory(doc)}
                            title="Carregar no Editor"
                          >
                            Abrir
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                            onClick={() => handleDelete(doc.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
