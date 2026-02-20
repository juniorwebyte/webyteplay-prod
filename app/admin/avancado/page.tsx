import Header from "@/components/header"
import Footer from "@/components/footer"
import ParticlesContainer from "@/components/particles-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GestaoAvancadaRifas from "@/components/admin/avancado/gestao-avancada-rifas"
import ConfiguracoesAvancadas from "@/components/admin/avancado/configuracoes-avancadas"
import NotificacoesInteligentes from "@/components/admin/avancado/notificacoes-inteligentes"
import IntegracoesComunicacao from "@/components/admin/avancado/integracoes-comunicacao"
import CadastroSeguranca from "@/components/admin/avancado/cadastro-seguranca"

export default function AdminAvancadoPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <Header />

      <div className="flex-grow container mx-auto px-4 py-8 z-10 relative">
        <h1 className="text-4xl font-bold text-center mb-8 animated-text">Funcionalidades Administrativas Avançadas</h1>

        <Tabs defaultValue="gestao-rifas" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="gestao-rifas">Gestão de Rifas</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
            <TabsTrigger value="cadastro">Cadastro e Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="gestao-rifas">
            <GestaoAvancadaRifas />
          </TabsContent>

          <TabsContent value="configuracoes">
            <ConfiguracoesAvancadas />
          </TabsContent>

          <TabsContent value="notificacoes">
            <NotificacoesInteligentes />
          </TabsContent>

          <TabsContent value="integracoes">
            <IntegracoesComunicacao />
          </TabsContent>

          <TabsContent value="cadastro">
            <CadastroSeguranca />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </main>
  )
}
