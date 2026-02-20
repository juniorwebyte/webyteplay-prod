import type { Metadata } from "next"
import ParticlesContainer from "@/components/particles-container"
import MinhasCotas from "@/components/auth/minhas-cotas"
import Header from "@/components/header"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Minhas Cotas | WebytePlay",
  description: "Visualize suas cotas e acompanhe seus sorteios",
}

export default function MinhasCotasPage() {
  return (
    <>
      <Header />
      <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ParticlesContainer />

        <div className="z-10 container mx-auto mt-16 mb-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Minhas Cotas
            </h1>
            <p className="mt-4 text-lg text-gray-300">Acompanhe suas participações e cotas premiadas</p>
          </div>

          <MinhasCotas />
        </div>
      </div>
      <Footer />
    </>
  )
}
