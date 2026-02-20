"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ParticlesContainer from "@/components/particles-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RoletaPremiada from "@/components/gamificacao/roleta-premiada"
import CaixaPremiada from "@/components/gamificacao/caixa-premiada"
import RankingUsuarios from "@/components/gamificacao/ranking-usuarios"
import SistemaVIP from "@/components/gamificacao/sistema-vip"
import MissoesDiarias from "@/components/gamificacao/missoes-diarias"
import LojaVirtual from "@/components/gamificacao/loja-virtual"
import EventosTematicos from "@/components/gamificacao/eventos-tematicos"

function GamificacaoContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("roleta")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["roleta", "caixa", "ranking", "vip", "missoes", "loja", "eventos"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <Header />

      <div className="flex-grow container mx-auto px-4 py-8 z-10 relative">
        <h1 className="text-4xl font-bold text-center mb-8 animated-text">Loja Virtual e Recompensas</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-7 mb-8">
            <TabsTrigger value="roleta">Roleta Premiada</TabsTrigger>
            <TabsTrigger value="caixa">Caixa Premiada</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="vip">Sistema VIP</TabsTrigger>
            <TabsTrigger value="missoes">Missões Diárias</TabsTrigger>
            <TabsTrigger value="loja">Loja Virtual</TabsTrigger>
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
          </TabsList>

          <TabsContent value="roleta">
            <RoletaPremiada />
          </TabsContent>

          <TabsContent value="caixa">
            <CaixaPremiada />
          </TabsContent>

          <TabsContent value="ranking">
            <RankingUsuarios />
          </TabsContent>

          <TabsContent value="vip">
            <SistemaVIP />
          </TabsContent>

          <TabsContent value="missoes">
            <MissoesDiarias />
          </TabsContent>

          <TabsContent value="loja">
            <LojaVirtual />
          </TabsContent>

          <TabsContent value="eventos">
            <EventosTematicos />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </main>
  )
}

export default function GamificacaoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <GamificacaoContent />
    </Suspense>
  )
}
