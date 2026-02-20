import Header from "@/components/header"
import Footer from "@/components/footer"
import RifasAtivas from "@/components/rifas-ativas"
import { Suspense } from "react"
import Loading from "@/components/loading"
import ParticlesContainer from "@/components/particles-container"

export default function RifasPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <Header />

      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10 relative max-w-7xl">
        <section className="mb-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 animated-text">Todas as Rifas</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha entre nossas rifas e concorra a prêmios incríveis!
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Suspense fallback={<Loading />}>
              <RifasAtivas />
            </Suspense>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
