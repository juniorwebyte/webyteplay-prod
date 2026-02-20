"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Star, Gift, Ticket, Gem, Zap, ShoppingCart, Minus, Plus } from "lucide-react"
import {
  listarProdutosAtivos,
  getConfigLoja,
  getPontosUsuario,
  descontarPontos,
  type ProdutoLoja,
  type IconeLoja,
} from "@/lib/loja-store"
import {
  adicionarAoCarrinho,
  listarItensCarrinho,
  totalItensCarrinho,
  valorTotalCarrinho,
  removerDoCarrinho,
  type ItemCarrinhoLoja,
  type TipoItemCarrinho,
} from "@/lib/carrinho-loja-store"
import { formatarValor } from "@/lib/formatadores"
import { useRouter } from "next/navigation"

const ICONE_COMPONENT: Record<IconeLoja, React.ComponentType<{ className?: string }>> = {
  Ticket,
  Gift,
  Zap,
  Gem,
  Star,
  ShoppingBag,
}

const TIPO_TO_CARRINHO: Record<string, TipoItemCarrinho> = {
  giro_roleta: "giro_roleta",
  caixa: "caixa",
  cota: "cota",
  desconto: "desconto",
  pack: "pack",
  emblema: "emblema",
  outro: "produto_loja",
}

export default function LojaVirtual() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<ProdutoLoja[]>([])
  const [config, setConfig] = useState(getConfigLoja())
  const [pontosUsuario, setPontosUsuario] = useState(0)
  const [resgatando, setResgatando] = useState<string | null>(null)
  const [carrinho, setCarrinho] = useState<ItemCarrinhoLoja[]>([])
  const [showCarrinho, setShowCarrinho] = useState(false)

  const carregar = () => {
    setProdutos(listarProdutosAtivos())
    setConfig(getConfigLoja())
    setPontosUsuario(getPontosUsuario())
    setCarrinho(listarItensCarrinho())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("loja-updated", h)
    window.addEventListener("carrinho-loja-updated", h)
    return () => {
      window.removeEventListener("loja-updated", h)
      window.removeEventListener("carrinho-loja-updated", h)
    }
  }, [])

  const handleResgatar = (produto: ProdutoLoja) => {
    if (produto.precoReais > 0) return
    if (pontosUsuario < produto.precoPontos) return
    setResgatando(produto.id)
    const ok = descontarPontos(produto.precoPontos)
    if (ok) {
      carregar()
      setResgatando(null)
      toast.success(`Resgatado: ${produto.nome}. Pontos descontados.`)
    } else {
      setResgatando(null)
    }
  }

  const handleAdicionarCarrinho = (produto: ProdutoLoja, quantidade = 1) => {
    if (produto.precoReais <= 0) return
    const tipo = TIPO_TO_CARRINHO[produto.tipoProduto || "outro"] || "produto_loja"
    adicionarAoCarrinho({
      tipo,
      produtoId: produto.id,
      nome: produto.nome,
      quantidade,
      valorUnitario: produto.precoReais,
      campanhaId: produto.campanhaId,
    })
    carregar()
    setShowCarrinho(true)
  }

  if (!config.habilitarLoja) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Loja Virtual temporariamente indisponível.</p>
      </div>
    )
  }

  if (produtos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{config.titulo}</h2>
            <p className="text-gray-400 text-sm">{config.subtitulo}</p>
          </div>
        </div>
        <p className="text-gray-400 text-center py-8">Nenhum item disponível no momento.</p>
      </div>
    )
  }

  const totalCarrinho = totalItensCarrinho()
  const valorCarrinho = valorTotalCarrinho()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{config.titulo}</h2>
          <p className="text-gray-400 text-sm">{config.subtitulo}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FFB800]/20 px-4 py-2 rounded-lg">
            <Star className="h-5 w-5 text-[#FFB800]" />
            <span className="text-[#FFB800] font-bold">{pontosUsuario} pontos</span>
          </div>
          <Button
            variant="outline"
            className="border-[#FFB800]/50 text-[#FFB800] hover:bg-[#FFB800]/10"
            onClick={() => setShowCarrinho(!showCarrinho)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Carrinho ({totalCarrinho})
            {valorCarrinho > 0 && (
              <span className="ml-2 text-green-400 font-semibold">{formatarValor(valorCarrinho)}</span>
            )}
          </Button>
        </div>
      </div>

      {showCarrinho && carrinho.length > 0 && (
        <Card className="bg-[#171923] border-[#FFB800]/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Seu Carrinho</span>
              <Button variant="ghost" size="sm" onClick={() => setShowCarrinho(false)}>Fechar</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {carrinho.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                  <span className="text-white">{item.nome} x {item.quantidade}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#FFB800] font-bold">
                      {item.valorUnitario > 0 ? formatarValor(item.quantidade * item.valorUnitario) : "Pontos"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                      onClick={() => {
                        removerDoCarrinho(item.id)
                        carregar()
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-right font-bold text-white">
              Total: {formatarValor(valorCarrinho)}
            </p>
            <Button
              className="w-full mt-4 bg-[#FFB800] hover:bg-[#FFA500] text-black"
              onClick={() => router.push("/loja/checkout")}
            >
              Finalizar Compra
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {produtos.map((produto) => {
          const Icone = ICONE_COMPONENT[produto.icone] ?? Ticket
          const soPontos = produto.precoReais <= 0
          const temPontosParaResgate = soPontos && pontosUsuario >= produto.precoPontos
          const requerPagamento = produto.precoReais > 0

          return (
            <Card
              key={produto.id}
              className="bg-[#171923] border-gray-800 hover:border-[#FFB800]/50 transition-colors relative overflow-hidden"
            >
              {produto.destaque && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-[#FFB800] text-black text-xs">Destaque</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                {(produto as { imagemUrl?: string }).imagemUrl ? (
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-800 flex items-center justify-center">
                      <img
                        src={(produto as { imagemUrl?: string }).imagemUrl!}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">{produto.nome}</CardTitle>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FFB800]/20 p-2 rounded-lg">
                      <Icone className="h-5 w-5 text-[#FFB800]" />
                    </div>
                    <CardTitle className="text-white text-base">{produto.nome}</CardTitle>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-gray-400 text-sm">{produto.descricao}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {produto.precoPontos > 0 && (
                    <span className="text-[#FFB800] font-bold text-sm flex items-center gap-1">
                      <Star className="h-4 w-4" /> {produto.precoPontos} pts
                    </span>
                  )}
                  {produto.precoReais > 0 && (
                    <span className="text-green-400 font-bold text-sm">
                      {formatarValor(produto.precoReais)}
                    </span>
                  )}
                </div>
                {requerPagamento ? (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAdicionarCarrinho(produto)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" /> Adicionar ao Carrinho
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className={
                      temPontosParaResgate
                        ? "bg-[#FFB800] hover:bg-[#FFA500] text-black"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }
                    disabled={!temPontosParaResgate || resgatando === produto.id}
                    onClick={() => handleResgatar(produto)}
                  >
                    {resgatando === produto.id
                      ? "Resgatando..."
                      : temPontosParaResgate
                        ? "Resgatar"
                        : "Pontos insuficientes"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
