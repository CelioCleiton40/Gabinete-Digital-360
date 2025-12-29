
import { useState } from 'react'
import { 
  MessageCircle, 
  CreditCard, 
  Link as LinkIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  Calendar, 
  Database,
  Facebook,
  Settings,
  Plug
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

export default function Integracoes() {
  const { toast } = useToast()

  // State
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)
  const [emailConnected, setEmailConnected] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)

  // Loading States
  const [loadingWa, setLoadingWa] = useState(false)
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingCalendar, setLoadingCalendar] = useState(false)

  // WhatsApp Handler
  const handleConnectWhatsApp = () => {
    setLoadingWa(true)
    setTimeout(() => {
      setWhatsappConnected(true)
      setLoadingWa(false)
      toast({
        title: "WhatsApp Conectado",
        description: "A instância da Evolution API foi vinculada com sucesso.",
        variant: "default",
      })
    }, 2000)
  }

  const handleDisconnectWhatsApp = () => {
    setWhatsappConnected(false)
    toast({
      title: "WhatsApp Desconectado",
      description: "O bot não responderá mais mensagens.",
      variant: "destructive",
    })
  }

  // Stripe Handler
  const handleConnectStripe = () => {
    setLoadingStripe(true)
    setTimeout(() => {
      setStripeConnected(true)
      setLoadingStripe(false)
      toast({
        title: "Stripe Conectado",
        description: "Assinatura vinculada com sucesso.",
      })
    }, 1500)
  }

  // Email Handler
  const handleConnectEmail = () => {
    setLoadingEmail(true)
    setTimeout(() => {
      setEmailConnected(true)
      setLoadingEmail(false)
      toast({
        title: "SMTP Configurado",
        description: "Agora você pode enviar newsletters pelo sistema.",
      })
    }, 1000)
  }

  // Calendar Handler
  const handleConnectCalendar = () => {
    setLoadingCalendar(true)
    setTimeout(() => {
      setCalendarConnected(true)
      setLoadingCalendar(false)
      toast({
        title: "Google Calendar Sincronizado",
        description: "Sua agenda pública foi importada.",
      })
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Central de Integrações</h1>
        <p className="text-muted-foreground">
          Conecte ferramentas externas para turbinar a produtividade do seu gabinete.
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* Seção: Comunicação */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Comunicação & Marketing
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* WhatsApp Card */}
            <Card className={`border-l-4 ${whatsappConnected ? 'border-l-green-500' : 'border-l-gray-300'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    WhatsApp API
                  </CardTitle>
                  <Badge variant={whatsappConnected ? 'default' : 'secondary'} className={whatsappConnected ? 'bg-green-600' : ''}>
                    {whatsappConnected ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Automação de respostas e envio de ofícios.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                 {whatsappConnected ? (
                    <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      (61) 99999-8888
                    </div>
                 ) : (
                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Requer Evolution API
                    </div>
                 )}
              </CardContent>
              <CardFooter>
                 <Dialog>
                    <DialogTrigger asChild>
                       <Button variant={whatsappConnected ? "outline" : "default"} className="w-full h-8 text-xs">
                          {whatsappConnected ? 'Gerenciar Conexão' : 'Conectar'}
                       </Button>
                    </DialogTrigger>
                    <DialogContent>
                       <DialogHeader>
                          <DialogTitle>Configuração WhatsApp</DialogTitle>
                          <DialogDescription>Insira os dados da sua instância Evolution API.</DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                             <Label>URL da API</Label>
                             <Input placeholder="https://api.seugabinete.com.br" defaultValue={whatsappConnected ? "https://api.seugabinete.com.br" : ""} />
                          </div>
                          <div className="grid gap-2">
                             <Label>API Key (Global)</Label>
                             <Input type="password" placeholder="••••••••••••" defaultValue={whatsappConnected ? "123456" : ""} />
                          </div>
                       </div>
                       <DialogFooter>
                          {whatsappConnected ? (
                             <Button variant="destructive" onClick={handleDisconnectWhatsApp}>Desconectar</Button>
                          ) : (
                             <Button onClick={handleConnectWhatsApp} disabled={loadingWa}>
                                {loadingWa ? 'Verificando...' : 'Salvar e Conectar'}
                             </Button>
                          )}
                       </DialogFooter>
                    </DialogContent>
                 </Dialog>
              </CardFooter>
            </Card>

            {/* Email Marketing Card */}
            <Card className={`border-l-4 ${emailConnected ? 'border-l-blue-500' : 'border-l-gray-300'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-5 w-5 text-blue-600" />
                    E-mail (SMTP)
                  </CardTitle>
                  <Badge variant={emailConnected ? 'default' : 'secondary'} className={emailConnected ? 'bg-blue-600' : ''}>
                    {emailConnected ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Envio de newsletters e comunicados oficiais.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                 {emailConnected ? (
                    <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-100 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      smtp.sendgrid.net
                    </div>
                 ) : (
                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Não configurado
                    </div>
                 )}
              </CardContent>
              <CardFooter>
                 <Dialog>
                    <DialogTrigger asChild>
                       <Button variant={emailConnected ? "outline" : "default"} className="w-full h-8 text-xs">
                          {emailConnected ? 'Configurações' : 'Configurar SMTP'}
                       </Button>
                    </DialogTrigger>
                    <DialogContent>
                       <DialogHeader>
                          <DialogTitle>Configuração de E-mail</DialogTitle>
                          <DialogDescription>Configure o servidor SMTP para envios.</DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label>Host</Label>
                                <Input placeholder="smtp.exemplo.com" />
                             </div>
                             <div className="grid gap-2">
                                <Label>Porta</Label>
                                <Input placeholder="587" />
                             </div>
                          </div>
                          <div className="grid gap-2">
                             <Label>Usuário</Label>
                             <Input placeholder="email@dominio.com" />
                          </div>
                          <div className="grid gap-2">
                             <Label>Senha</Label>
                             <Input type="password" placeholder="••••••••" />
                          </div>
                       </div>
                       <DialogFooter>
                          <Button onClick={handleConnectEmail} disabled={loadingEmail}>
                             {loadingEmail ? 'Testando Conexão...' : 'Salvar Configuração'}
                          </Button>
                       </DialogFooter>
                    </DialogContent>
                 </Dialog>
              </CardFooter>
            </Card>

            {/* Social Media Placeholder */}
            <Card className="border-l-4 border-l-gray-300 opacity-75">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base text-gray-500">
                    <Facebook className="h-5 w-5" />
                    Meta Business
                  </CardTitle>
                  <Badge variant="outline">Em Breve</Badge>
                </div>
                <CardDescription className="text-xs">
                  Integração com Facebook e Instagram.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                 <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                    <Plug className="h-4 w-4" />
                    Aguardando API v18.0
                 </div>
              </CardContent>
              <CardFooter>
                 <Button variant="ghost" disabled className="w-full h-8 text-xs">Indisponível</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Seção: Gestão */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-700" />
            Gestão & Produtividade
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             
             {/* Stripe Card */}
             <Card className={`border-l-4 ${stripeConnected ? 'border-l-indigo-500' : 'border-l-gray-300'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    Stripe
                  </CardTitle>
                  <Badge variant={stripeConnected ? 'default' : 'secondary'} className={stripeConnected ? 'bg-indigo-600' : ''}>
                    {stripeConnected ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Gestão da assinatura do software.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                 {stripeConnected ? (
                    <div className="text-xs text-indigo-700 bg-indigo-50 p-2 rounded border border-indigo-100 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Plano Pro (Em dia)
                    </div>
                 ) : (
                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Pagamento pendente
                    </div>
                 )}
              </CardContent>
              <CardFooter>
                 {stripeConnected ? (
                   <Button variant="outline" className="w-full h-8 text-xs">
                     <LinkIcon className="mr-2 h-3 w-3" /> Portal do Cliente
                   </Button>
                 ) : (
                   <Button className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={handleConnectStripe} disabled={loadingStripe}>
                     {loadingStripe ? 'Conectando...' : 'Assinar Agora'}
                   </Button>
                 )}
              </CardFooter>
            </Card>

            {/* Google Calendar Card */}
            <Card className={`border-l-4 ${calendarConnected ? 'border-l-orange-500' : 'border-l-gray-300'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Google Agenda
                  </CardTitle>
                  <Badge variant={calendarConnected ? 'default' : 'secondary'} className={calendarConnected ? 'bg-orange-600' : ''}>
                    {calendarConnected ? 'Sincronizado' : 'Offline'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Sincronização de eventos e reuniões.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                 {calendarConnected ? (
                    <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded border border-orange-100 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      gabinete@gmail.com
                    </div>
                 ) : (
                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Não vinculado
                    </div>
                 )}
              </CardContent>
              <CardFooter>
                 {calendarConnected ? (
                    <Button variant="outline" className="w-full h-8 text-xs" onClick={() => setCalendarConnected(false)}>
                       Desvincular Conta
                    </Button>
                 ) : (
                    <Button variant="outline" className="w-full h-8 text-xs" onClick={handleConnectCalendar} disabled={loadingCalendar}>
                       <img src="https://www.google.com/favicon.ico" className="w-3 h-3 mr-2" alt="Google" />
                       {loadingCalendar ? 'Autenticando...' : 'Entrar com Google'}
                    </Button>
                 )}
              </CardFooter>
            </Card>

            {/* Gov Data Placeholder */}
            <Card className="border-l-4 border-l-gray-300 opacity-75">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base text-gray-500">
                    <Database className="h-5 w-5" />
                    Dados Abertos (Gov)
                  </CardTitle>
                  <Badge variant="outline">Em Breve</Badge>
                </div>
                <CardDescription className="text-xs">
                  Importação automática de tramitações.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                 <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                    <Plug className="h-4 w-4" />
                    Integração Câmara/Senado
                 </div>
              </CardContent>
              <CardFooter>
                 <Button variant="ghost" disabled className="w-full h-8 text-xs">Indisponível</Button>
              </CardFooter>
            </Card>

          </div>
        </div>

      </div>
    </div>
  )
}
