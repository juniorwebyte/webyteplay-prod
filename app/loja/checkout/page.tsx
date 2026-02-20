"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import ParticlesContainer from "@/components/particles-container"
import CheckoutCarrinho from "@/components/loja/checkout-carrinho"

export default function CheckoutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8 z-10 relative">
        <CheckoutCarrinho />
      </div>
      <Footer />
    </main>
  )
}
