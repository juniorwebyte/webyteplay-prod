import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import RifasAtivas from "@/components/rifas-ativas"
import RifasDestaque from "@/components/rifas-destaque"
import ComoFunciona from "@/components/como-funciona"
import UltimosGanhadores from "@/components/ultimos-ganhadores"
import Loading from "@/components/loading"
import ParticlesContainer from "@/components/particles-container"
import HomeContent from "@/components/home-content"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <Header />

      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10 relative max-w-7xl">
        <HomeContent />
      </div>

      <Footer />
    </main>
  )
}
