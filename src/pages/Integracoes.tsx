
import { useState } from 'react'
import { MessageCircle, CreditCard, Link as LinkIcon, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default function Integracoes() {
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)
  const [loadingWa, setLoadingWa] = useState(false)
  const [loadingStripe, setLoadingStripe] = useState(false)

  const handleConnectWhatsApp = () => {
    setLoadingWa(true)
    // Simulating connection delay
    setTimeout(() => {
      setWhatsappConnected(true)
      setLoadingWa(false)
    }, 2000)
  }

  const handleDisconnectWhatsApp = () => {
    if (confirm('Tem certeza que deseja desconectar? O bot parará de responder.')) {
      setWhatsappConnected(false)
    }
  }

  const handleConnectStripe = () => {
    setLoadingStripe(true)
    setTimeout(() => {
      setStripeConnected(true)
      setLoadingStripe(false)
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
        <p className="text-muted-foreground">
          Conecte seu gabinete a ferramentas externas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* WhatsApp Card */}
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <MessageCircle className="h-6 w-6" />
                WhatsApp (Evolution API)
              </CardTitle>
              <Badge variant={whatsappConnected ? 'default' : 'secondary'} className={whatsappConnected ? 'bg-green-600' : ''}>
                {whatsappConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            <CardDescription>
              Conecte seu número para enviar ofícios e responder eleitores automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {whatsappConnected ? (
              <div className="bg-green-50 p-4 rounded-md border border-green-100 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Instância Online</p>
                  <p className="text-xs text-green-600 mt-1">
                    Número conectado: (61) 99999-8888<br />
                    Webhook: Ativo<br />
                    Bateria: 85%
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Requer Servidor Externo</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Para usar o WhatsApp, você precisa configurar uma instância da Evolution API e inserir a URL abaixo.
                  </p>
                </div>
              </div>
            )}

            {!whatsappConnected && (
              <div className="grid gap-2">
                <Label>URL da API (Evolution)</Label>
                <Input placeholder="https://api.seugabinete.com.br" />
                <Label>API Key</Label>
                <Input type="password" placeholder="••••••••••••••••" />
              </div>
            )}
          </CardContent>
          <CardFooter>
            {whatsappConnected ? (
              <Button variant="destructive" className="w-full" onClick={handleDisconnectWhatsApp}>
                Desconectar WhatsApp
              </Button>
            ) : (
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleConnectWhatsApp} disabled={loadingWa}>
                {loadingWa ? 'Conectando...' : 'Conectar Instância'}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Stripe Card */}
        <Card className="border-indigo-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <CreditCard className="h-6 w-6" />
                Stripe (Pagamentos)
              </CardTitle>
              <Badge variant={stripeConnected ? 'default' : 'secondary'} className={stripeConnected ? 'bg-indigo-600' : ''}>
                {stripeConnected ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <CardDescription>
              Gerencie a assinatura do software e cobranças automáticas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stripeConnected ? (
               <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-indigo-800">Conta Vinculada</p>
                      <p className="text-xs text-indigo-600 mt-1">
                        ID do Cliente: cus_N7s89d7f98<br />
                        Próxima fatura: 25/12/2025
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                     <div className="flex justify-between py-2 border-b">
                        <span>Plano Atual</span>
                        <span className="font-bold">Pro Mensal (R$ 1.520,00)</span>
                     </div>
                     <div className="flex justify-between py-2 border-b">
                        <span>Status</span>
                        <span className="text-green-600 font-bold">Em dia</span>
                     </div>
                  </div>
               </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-sm text-gray-600 mb-2">
                  Ao conectar, você será redirecionado para o portal do cliente Stripe para gerenciar seus cartões e faturas.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
             {stripeConnected ? (
               <Button variant="outline" className="w-full">
                 <LinkIcon className="mr-2 h-4 w-4" /> Acessar Portal do Cliente
               </Button>
             ) : (
               <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleConnectStripe} disabled={loadingStripe}>
                 {loadingStripe ? 'Redirecionando...' : 'Configurar Assinatura'}
               </Button>
             )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
