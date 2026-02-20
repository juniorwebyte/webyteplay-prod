"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Clock, Trophy, Share2, Heart, AlertCircle, Check, Gift } from "lucide-react"
import SelecionarCotas from "@/components/selecionar-cotas"
import RoletaCampanha from "@/components/gamificacao/roleta-campanha"
import BoxCampanha from "@/components/gamificacao/box-campanha"
import { buscarCampanha } from "@/lib/campanhas-store"
import { formatarValor } from "@/lib/formatadores"

interface DetalheRifaProps {
  id: string
}

function formatarData(dataStr: string): string {
  if (!dataStr) return ""
  try {
    const d = new Date(dataStr)
    if (isNaN(d.getTime())) return ""
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
  } catch {
    return ""
  }
}

export default function DetalheRifa({ id }: DetalheRifaProps) {
  const [rifa, setRifa] = useState<any>(null)
  const [campanha, setCampanha] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("detalhes")
  const [liked, setLiked] = useState(false)
  const [shared, setShared] = useState(false)
  /** Índice da imagem exibida na área principal (0 = principal, 1+ = galeria) */
  const [imagemPrincipalIndex, setImagemPrincipalIndex] = useState(0)

  const carregarRifa = useCallback(() => {
    try {
      const camp = buscarCampanha(id)
      if (camp) {
        setCampanha(camp)
        setRifa({
          id: camp.id,
          titulo: camp.titulo,
          subtitulo: camp.subtitulo,
          descricao: camp.descricao,
          preco: parseFloat(camp.valorPorCota) || 0,
          totalCotas: parseInt(camp.quantidadeNumeros) || 0,
          cotasVendidas: camp.cotasVendidas || 0,
          imagem: camp.imagemPrincipal ?? undefined,
          imagensAdicionais: Array.isArray(camp.imagensAdicionais) ? camp.imagensAdicionais : [],
          dataFim: camp.dataInicio || "",
          habilitarGanhador: camp.habilitarGanhador,
          nomeGanhador: camp.nomeGanhador,
          numeroSorteado: camp.numeroSorteado,
          exibirBarraProgresso: camp.exibirBarraProgresso,
          tipoCampanha: camp.tipoCampanha || "",
        })
      }
    } catch (err) {
      console.error("Erro ao carregar rifa:", err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    setImagemPrincipalIndex(0)
  }, [id])

  useEffect(() => {
    carregarRifa()
    const handleUpdate = () => carregarRifa()
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "campanhas" || e.key === "pedidos" || e.key === "cotas-ganhas-roleta-box") carregarRifa()
    }
    window.addEventListener("campanhas-updated", handleUpdate)
    window.addEventListener("pedidos-updated", handleUpdate)
    window.addEventListener("cotas-ganhas-roleta-box-updated", handleUpdate)
    window.addEventListener("storage", handleStorage)
    const timer = setTimeout(carregarRifa, 500)
    return () => {
      window.removeEventListener("campanhas-updated", handleUpdate)
      window.removeEventListener("pedidos-updated", handleUpdate)
      window.removeEventListener("cotas-ganhas-roleta-box-updated", handleUpdate)
      window.removeEventListener("storage", handleStorage)
      clearTimeout(timer)
    }
  }, [carregarRifa])

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = rifa?.titulo || "Confira esta rifa!"
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      } catch {}
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!rifa) {
    return (
      <div className="text-center py-20 bg-black/20 rounded-lg border border-purple-500/20">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Rifa nao encontrada</h2>
        <p className="text-gray-300 mb-6">A rifa que voce esta procurando nao existe ou foi removida.</p>
        <Link href="/rifas">
          <Button
            variant="default"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Ver outras rifas
          </Button>
        </Link>
      </div>
    )
  }

  const progressPercent = rifa.totalCotas > 0 ? Math.round((rifa.cotasVendidas / rifa.totalCotas) * 100) : 0

  const todasImagens: string[] = [
    ...(rifa.imagem && typeof rifa.imagem === "string" && rifa.imagem.length > 0 ? [rifa.imagem] : []),
    ...(Array.isArray(rifa.imagensAdicionais) ? rifa.imagensAdicionais.filter((u: unknown) => typeof u === "string" && u.length > 0) : []),
  ]
  const temGaleria = todasImagens.length > 0
  const indiceSeguro = Math.min(imagemPrincipalIndex, Math.max(0, todasImagens.length - 1))
  const imagemPrincipalUrl = temGaleria ? todasImagens[indiceSeguro] : (rifa.imagem || "")

  return (
    <div className="w-full max-w-6xl mx-auto px-4 space-y-10">
      {/* ========== SEÇÃO 1: Imagem principal + galeria (slideshow ao clicar) ========== */}
      <section className="rounded-2xl overflow-hidden border border-[#FFB800]/10 bg-black/30 shadow-xl">
        <div className="relative aspect-video max-h-[420px] w-full bg-gradient-to-br from-[#1a1a2e] via-purple-900/20 to-black flex items-center justify-center">
          {imagemPrincipalUrl ? (
            <img
              key={imagemPrincipalUrl}
              src={imagemPrincipalUrl}
              alt={rifa.titulo}
              className="w-full h-full object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement
                if (fallback) fallback.classList.remove("hidden")
              }}
            />
          ) : null}
          <div
            className={`absolute inset-0 flex items-center justify-center ${imagemPrincipalUrl ? "hidden" : ""}`}
          >
            <span className="text-gray-500">Sem imagem</span>
          </div>
        </div>
        {temGaleria && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 border-t border-[#FFB800]/10 bg-black/20">
            {todasImagens.map((img: string, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setImagemPrincipalIndex(i)}
                className={`aspect-video max-h-24 rounded-lg overflow-hidden bg-black/40 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#FFB800]/50 ${
                  i === indiceSeguro
                    ? "border-[#FFB800] ring-2 ring-[#FFB800]/50"
                    : "border-[#FFB800]/10 hover:border-[#FFB800]/40"
                }`}
              >
                <img
                  src={img}
                  alt={`Imagem ${i + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = "none"
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ========== SEÇÃO 2: Título, barra de progresso, preço e formulário ========== */}
      <section className="max-w-2xl mx-auto">
        <Card className="bg-black/50 border-[#FFB800]/20 shadow-xl backdrop-blur-sm">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white leading-tight">{rifa.titulo}</h1>
              {rifa.subtitulo && <p className="text-gray-400 text-sm">{rifa.subtitulo}</p>}
            </div>

            {rifa.exibirBarraProgresso && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Progresso de venda</span>
                  <span className="font-semibold text-[#FFB800]">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
              </div>
            )}

            {rifa.dataFim && formatarData(rifa.dataFim) && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Sorteio: {formatarData(rifa.dataFim)}</span>
              </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <Badge variant="outline" className="border-[#FFB800] text-[#FFB800] text-base px-4 py-1.5">
                {formatarValor(rifa.preco)}/cota
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full transition-colors ${liked ? "bg-red-500/20 border-red-500 text-red-500" : ""}`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full transition-colors ${shared ? "bg-green-500/20 border-green-500 text-green-500" : ""}`}
                  onClick={handleShare}
                >
                  {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <SelecionarCotas
            valorPorCota={rifa.preco}
            valorCotas={campanha?.valorCotas}
            titulo={rifa.titulo}
            subtitulo={rifa.subtitulo}
            dataInicio={rifa.dataFim}
            campanhaId={rifa.id}
            tipoCampanha={rifa.tipoCampanha || "automatico"}
            totalCotas={rifa.totalCotas || 0}
          />
        </div>
      </section>

      {/* ========== SEÇÃO 3: Roleta e Caixa ========== */}
      {(campanha?.habilitarRoleta || campanha?.habilitarBox) && (
        <section className={`grid gap-6 ${campanha?.habilitarRoleta && campanha?.habilitarBox ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
          {campanha.habilitarRoleta && <RoletaCampanha campanha={campanha} />}
          {campanha.habilitarBox && <BoxCampanha campanha={campanha} />}
        </section>
      )}

      {/* ========== SEÇÃO 4: Cotas Premiadas ========== */}
      {(campanha?.cotasPremiadas && campanha?.cotasPremiadasLista?.length) || (campanha?.cotasPremiadas && campanha?.cotasPremiadas1?.trim()) ? (
        <section>
          {campanha?.cotasPremiadas && campanha?.cotasPremiadasLista?.length ? (
            <Card className="bg-black/40 border-[#FFB800]/20">
              <CardContent className="p-5">
                <h3 className="font-bold text-[#FFB800] flex items-center gap-2 mb-3">
                  <Gift className="h-5 w-5" /> Cotas Premiadas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {campanha.cotasPremiadasLista.map((c) => (
                    <Badge
                      key={c.id}
                      variant="outline"
                      className="border-[#FFB800]/50 text-[#FFB800] px-3 py-1"
                    >
                      Nº {c.numero}: {c.premio}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : campanha?.cotasPremiadas && campanha?.cotasPremiadas1?.trim() ? (
            <Card className="bg-black/40 border-[#FFB800]/20">
              <CardContent className="p-5">
                <h3 className="font-bold text-[#FFB800] flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5" /> Cotas Premiadas
                </h3>
                <p className="text-gray-400 text-sm">
                  Números: {campanha.cotasPremiadas1} — Prêmio: {campanha.cotasPremiadas2 || "Cota premiada"}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </section>
      ) : null}

      {rifa.tipoCampanha === "numeros" && rifa.totalCotas > 0 && (
        <div className="p-4 rounded-xl bg-black/40 border border-[#FFB800]/20 max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-1">Campanha de Números</h2>
          <p className="text-gray-400 text-sm">
            Números de 1 a {rifa.totalCotas} disponíveis. Escolha os seus no formulário acima.
          </p>
        </div>
      )}

      {(rifa.tipoCampanha === "fazendinha" || rifa.tipoCampanha === "fazendinhaMetade") && (
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 max-w-4xl mx-auto">
          <p className="text-gray-400 text-sm text-center">
            Escolha os bichos e números no bloco de participação acima.
          </p>
        </div>
      )}

      {/* ========== SEÇÃO 5: Abas Detalhes / Prêmios / Ganhadores ========== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-[#FFB800]/10">
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="premios">Premios</TabsTrigger>
          <TabsTrigger value="ganhadores">Ganhadores</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="p-4 sm:p-6 bg-black/40 rounded-lg border border-purple-500/20">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Descricao</h2>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {rifa.descricao || "Nenhuma descricao disponivel para esta rifa."}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="premios" className="p-4 sm:p-6 bg-black/40 rounded-lg border border-purple-500/20">
          <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-white">Prêmios</h2>
            {campanha?.cotasPremiadas && campanha?.cotasPremiadasLista?.length ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#FFB800]">Cotas Premiadas (prêmio instantâneo ao comprar)</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {campanha.cotasPremiadasLista.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 p-3 rounded-lg bg-[#FFB800]/5 border border-[#FFB800]/20"
                    >
                      <span className="font-mono font-bold text-[#FFB800]">#{c.numero}</span>
                      <span className="text-gray-300">{c.premio}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : campanha?.cotasPremiadas && campanha?.cotasPremiadas1?.trim() ? (
              <div className="p-4 rounded-lg bg-[#FFB800]/5 border border-[#FFB800]/20">
                <h3 className="font-semibold text-[#FFB800] mb-2">Cotas Premiadas</h3>
                <p className="text-gray-300">
                  Números: {campanha.cotasPremiadas1} — Prêmio: {campanha.cotasPremiadas2 || "Cota premiada"}
                </p>
              </div>
            ) : null}
            {(!campanha?.cotasPremiadas || (!campanha?.cotasPremiadasLista?.length && !campanha?.cotasPremiadas1?.trim())) && (
              <div className="text-center py-10">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-300">Nenhum prêmio cadastrado para esta rifa.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ganhadores" className="p-4 sm:p-6 bg-black/40 rounded-lg border border-purple-500/20">
          <div className="space-y-4 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-white">Ganhadores</h2>
            {rifa.habilitarGanhador && rifa.nomeGanhador ? (
              <div className="text-center py-10">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">{rifa.nomeGanhador}</p>
                <p className="text-gray-400">Numero sorteado: {rifa.numeroSorteado}</p>
              </div>
            ) : (
              <div className="text-center py-10">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <p className="text-gray-300">Nenhum ganhador registrado para esta rifa.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
