"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Gift, Sparkles, Ticket, Info, ShoppingCart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import confetti from "canvas-confetti"
import { listarCaixasAtivas, type CaixaLoja } from "@/lib/caixas-loja-store"

function getRaridadeColor(raridade: string) {
  switch (raridade) {
    case "comum":
      return "bg-gray-500"
    case "incomum":
      return "bg-green-500"
    case "raro":
      return "bg-blue-500"
    case "épico":
      return "bg-purple-500"
    case "lendário":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

export default function CaixaPremiada() {
  const [caixasData, setCaixasData] = useState<CaixaLoja[]>([])
  const [selectedCaixa, setSelectedCaixa] = useState<CaixaLoja | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [showPrizeDialog, setShowPrizeDialog] = useState(false)
  const [currentPrize, setCurrentPrize] = useState<any>(null)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [caixaInfo, setCaixaInfo] = useState<CaixaLoja | null>(null)
  const [mensagemErro, setMensagemErro] = useState<string | null>(null)

  useEffect(() => {
    setCaixasData(listarCaixasAtivas())
    const h = () => setCaixasData(listarCaixasAtivas())
    window.addEventListener("loja-updated", h)
    return () => window.removeEventListener("loja-updated", h)
  }, [])

  const openCaixa = (caixa: CaixaLoja) => {
    // Impede que caixas pagas sejam abertas sem fluxo de pagamento
    if ((caixa.moeda === "tickets" || caixa.moeda === "reais") && caixa.preco > 0) {
      setMensagemErro("Caixas pagas: adicione ao carrinho na Loja Virtual e finalize o pagamento.")
      return
    }

    setSelectedCaixa(caixa)
    setIsOpening(true)

    // Animação de abertura (mais rápida e responsiva)
    setTimeout(() => {
      // Determinar o prêmio com base nas probabilidades
      const randomValue = Math.random() * 100
      let cumulativeProbability = 0
      let selectedPrize = caixa.premios[caixa.premios.length - 1]

      for (const prize of caixa.premios) {
        cumulativeProbability += prize.probabilidade
        if (randomValue <= cumulativeProbability) {
          selectedPrize = prize
          break
        }
      }

      setCurrentPrize(selectedPrize)
      setIsOpening(false)
      setShowPrizeDialog(true)

      // Efeito de confete para prêmios bons
      if (selectedPrize.nome !== "Sem Prêmio") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }, 1200)
  }

  const showInfo = (caixa: CaixaLoja) => {
    setCaixaInfo(caixa)
    setShowInfoDialog(true)
  }

  if (caixasData.length === 0) {
    return (
      <Card className="bg-[#171923] border-gray-800">
        <CardContent className="py-16 text-center">
          <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma caixa configurada</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Configure as caixas premiadas no painel admin em Loja Virtual → Produtos e Configurações.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="gratis">Gratuitas</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="especiais">Especiais</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {caixasData.map((caixa) => (
              <Card key={caixa.id} className="overflow-hidden hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle>{caixa.nome}</CardTitle>
                    <Badge className={`${getRaridadeColor(caixa.raridade)}`}>{caixa.raridade}</Badge>
                  </div>
                  <CardDescription>{caixa.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative mb-4 flex justify-center">
                    <img
                      src={caixa.imagem || "/placeholder.svg"}
                      alt={caixa.nome}
                      className="h-40 w-40 object-contain transition-transform hover:scale-105"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => showInfo(caixa)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-bold mr-1">{caixa.preco}</span>
                      {caixa.moeda === "tickets" ? (
                        <Ticket className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Badge variant="outline">Grátis</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{caixa.premios.length} prêmios possíveis</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={caixa.moeda === "gratis" ? "default" : "outline"}
                    disabled={(caixa.moeda === "tickets" || caixa.moeda === "reais") && caixa.preco > 0}
                    onClick={() => openCaixa(caixa)}
                  >
                      {caixa.moeda === "gratis" ? (
                      <>
                        <Gift className="mr-2 h-4 w-4" /> Abrir Grátis
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Comprar na Loja
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gratis" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {caixasData
              .filter((caixa) => caixa.moeda === "gratis" || (caixa.preco === 0))
              .map((caixa) => (
                <Card key={caixa.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{caixa.nome}</CardTitle>
                      <Badge className={`${getRaridadeColor(caixa.raridade)}`}>{caixa.raridade}</Badge>
                    </div>
                    <CardDescription>{caixa.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="relative mb-4 flex justify-center">
                      <img
                        src={caixa.imagem || "/placeholder.svg"}
                        alt={caixa.nome}
                        className="h-40 w-40 object-contain transition-transform hover:scale-105"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => showInfo(caixa)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Grátis</Badge>
                      <div className="text-xs text-muted-foreground">{caixa.premios.length} prêmios possíveis</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => openCaixa(caixa)}>
                      <Gift className="mr-2 h-4 w-4" /> Abrir Caixa Grátis
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="premium" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {caixasData
              .filter((caixa) => (caixa.moeda === "tickets" || caixa.moeda === "reais") && caixa.preco > 0)
              .map((caixa) => (
                <Card key={caixa.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{caixa.nome}</CardTitle>
                      <Badge className={`${getRaridadeColor(caixa.raridade)}`}>{caixa.raridade}</Badge>
                    </div>
                    <CardDescription>{caixa.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="relative mb-4 flex justify-center">
                      <img
                        src={caixa.imagem || "/placeholder.svg"}
                        alt={caixa.nome}
                        className="h-40 w-40 object-contain transition-transform hover:scale-105"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => showInfo(caixa)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-bold mr-1">{caixa.preco}</span>
                        <Ticket className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div className="text-xs text-muted-foreground">{caixa.premios.length} prêmios possíveis</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={true}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> Comprar (em breve)
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="especiais" className="pt-6">
          <div className="flex flex-col items-center justify-center p-12 border rounded-md border-gray-800">
            <Package className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-white">Caixas Especiais</h3>
            <p className="text-gray-400 text-center max-w-md">
              Configure caixas especiais no painel admin.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de abertura de caixa */}
      <Dialog open={showPrizeDialog} onOpenChange={setShowPrizeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Você ganhou um prêmio!</DialogTitle>
            <DialogDescription className="text-center">
              {selectedCaixa && `Da caixa ${selectedCaixa.nome} você recebeu:`}
            </DialogDescription>
          </DialogHeader>
          {currentPrize && (
            <div className="flex flex-col items-center py-6">
              <div className="text-6xl mb-4 animate-bounce">{currentPrize.icone}</div>
              <h3 className="text-2xl font-bold mb-2">{currentPrize.nome}</h3>
              <Badge className={`${getRaridadeColor(currentPrize.raridade)}`}>{currentPrize.raridade}</Badge>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowPrizeDialog(false)}>
              <Sparkles className="mr-2 h-4 w-4" /> Receber Prêmio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de informações da caixa */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{caixaInfo?.nome}</DialogTitle>
            <DialogDescription>{caixaInfo?.descricao}</DialogDescription>
          </DialogHeader>
          {caixaInfo && (
            <div className="py-4">
              <h3 className="font-medium mb-2">Prêmios Possíveis:</h3>
              <ul className="space-y-2">
                {caixaInfo.premios.map((premio, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="text-lg">{premio.icone}</div>
                    <span>{premio.nome}</span>
                    <Badge className={`ml-auto ${getRaridadeColor(premio.raridade)}`}>{premio.raridade}</Badge>
                    <Badge variant="outline">{premio.probabilidade}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInfoDialog(false)}>
              Fechar
            </Button>
            {caixaInfo && (
              <Button
                onClick={() => {
                  setShowInfoDialog(false)
                  openCaixa(caixaInfo)
                }}
              >
                Abrir Caixa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
