"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Package } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ParticlesContainer from "@/components/particles-container"

export default function SucessoPage() {
  const searchParams = useSearchParams()
  const pedidoId = searchParams.get("id") || ""

  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>
      <Header />
      <div className="flex-grow container mx-auto px-4 py-16 z-10 relative flex items-center justify-center">
        <Card className="bg-[#171923] border-gray-800 max-w-md w-full text-center">
          <CardContent className="py-12 px-8">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-2">Compra realizada com sucesso!</h1>
            <p className="text-gray-400 mb-6">
              Obrigado por comprar conosco. Seu pedido foi confirmado.
            </p>
            {pedidoId && (
              <p className="text-[#FFB800] font-mono font-bold text-lg mb-6">Pedido #{pedidoId}</p>
            )}
            <p className="text-gray-500 text-sm mb-8">
              Você receberá um e-mail de confirmação em breve. Acompanhe o status do pedido no painel.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="bg-[#FFB800] hover:bg-[#FFA500] text-black">
                <Link href="/gamificacao?tab=loja">
                  <Package className="h-4 w-4 mr-2" /> Continuar comprando
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Voltar ao início</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </main>
  )
}
