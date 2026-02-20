"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ShoppingBag, Gift, Zap, Gem, Star, Ticket } from "lucide-react"
import { listarProdutosAtivos, getConfigLoja, type ProdutoLoja, type IconeLoja } from "@/lib/loja-store"
import { adicionarAoCarrinho } from "@/lib/carrinho-loja-store"
import { formatarValor } from "@/lib/formatadores"
import { useRouter } from "next/navigation"

const ICONE_MAP: Record<IconeLoja, React.ComponentType<{ className?: string }>> = {
  Ticket,
  Gift,
  Zap,
  Gem,
  Star,
  ShoppingBag,
}

const TIPO_CARRINHO: Record<string, string> = {
  giro_roleta: "giro_roleta",
  caixa: "caixa",
  cota: "cota",
  desconto: "desconto",
  pack: "pack",
  emblema: "emblema",
  outro: "produto_loja",
}

export default function ProdutosHome() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<ProdutoLoja[]>([])

  useEffect(() => {
    setProdutos(listarProdutosAtivos().filter((p) => p.precoReais > 0))
    const h = () => setProdutos(listarProdutosAtivos().filter((p) => p.precoReais > 0))
    window.addEventListener("loja-updated", h)
    return () => window.removeEventListener("loja-updated", h)
  }, [])

  const config = getConfigLoja()
  if (!config.habilitarLoja || produtos.length === 0) return null

  const handleAdicionar = (p: ProdutoLoja) => {
    const tipo = TIPO_CARRINHO[p.tipoProduto || "outro"] || "produto_loja"
    adicionarAoCarrinho({
      tipo: tipo as any,
      produtoId: p.id,
      nome: p.nome,
      quantidade: 1,
      valorUnitario: p.precoReais,
      campanhaId: p.campanhaId,
    })
    router.push("/loja/checkout")
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {produtos.slice(0, 8).map((p) => {
        const Icone = ICONE_MAP[p.icone] || ShoppingBag
        return (
          <Card
            key={p.id}
            className="bg-[#171923] border-gray-800 hover:border-[#FFB800]/50 transition-colors overflow-hidden"
          >
            {p.destaque && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-[#FFB800] text-black text-xs">Destaque</Badge>
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                {(p as { imagemUrl?: string }).imagemUrl ? (
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-800">
                    <img src={(p as { imagemUrl?: string }).imagemUrl!} alt={p.nome} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="bg-[#FFB800]/20 p-2 rounded-lg shrink-0">
                    <Icone className="h-5 w-5 text-[#FFB800]" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white">{p.nome}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mt-1">{p.descricao}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xl font-bold text-[#FFB800]">{formatarValor(p.precoReais)}</p>
            </CardContent>
            <CardFooter className="pt-0 flex gap-2">
              <Button
                className="flex-1 bg-[#FFB800] hover:bg-[#FFA500] text-black"
                onClick={() => handleAdicionar(p)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" /> Comprar
              </Button>
              <Button variant="outline" asChild>
                <Link href="/gamificacao?tab=loja">Ver</Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
