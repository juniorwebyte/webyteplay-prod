import Header from "@/components/header"
import Footer from "@/components/footer"
import ParticlesContainer from "@/components/particles-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ConsultaCotas from "@/components/consulta-cotas"
import PagamentoPix from "@/components/pagamento-pix"
import SistemaFazendinha from "@/components/sistema-fazendinha"

export default function SistemaPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <Header />

      <div className="flex-grow container mx-auto px-4 py-8 z-10 relative">
        <h1 className="text-4xl font-bold text-center mb-8 animated-text">Sistema de Rifas</h1>

        <Tabs defaultValue="consulta" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="consulta">Consulta de Cotas Premiadas</TabsTrigger>
            <TabsTrigger value="pagamento">Pagamento PIX</TabsTrigger>
            <TabsTrigger value="fazendinha">Sistema de Fazendinha</TabsTrigger>
          </TabsList>

          <TabsContent value="consulta">
            <ConsultaCotas />
          </TabsContent>

          <TabsContent value="pagamento">
            <PagamentoPix />
          </TabsContent>

          <TabsContent value="fazendinha">
            <SistemaFazendinha />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </main>
  )
}
