import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Loading from "@/components/loading"
import ParticlesContainer from "@/components/particles-container"
import DetalheRifa from "@/components/detalhe-rifa"

export default async function DetalheRifaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <Header />

      <div className="flex-grow container mx-auto px-4 py-8 z-10 relative">
        <Suspense fallback={<Loading />}>
          <DetalheRifa id={id} />
        </Suspense>
      </div>

      <Footer />
    </main>
  )
}
