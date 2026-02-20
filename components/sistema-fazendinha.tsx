"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { BICHOS } from "@/lib/jogo-do-bicho"

const animaisData = BICHOS.map((b) => ({
  id: b.id,
  nome: b.nome,
  numeros: b.numeros,
  disponivel: true,
  imagem: "/placeholder.svg?height=80&width=80",
}))

export default function SistemaFazendinha() {
  const [tipoJogo, setTipoJogo] = useState("bichoInteiro")
  const [quantidade, setQuantidade] = useState(1)
  const [selecionados, setSelecionados] = useState<number[]>([])

  const handleSelecionar = (id: number) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((item) => item !== id))
    } else {
      setSelecionados([...selecionados, id])
    }
  }

  const valorUnitario = tipoJogo === "bichoInteiro" ? 5 : 2.5
  const valorTotal = valorUnitario * selecionados.length * quantidade

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jogo do Bicho - Fazendinha</CardTitle>
        <CardDescription>
          Escolha seus bichos favoritos e concorra a prêmios incríveis! Sorteio dia 30/04/2025.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="bichoInteiro" onValueChange={setTipoJogo}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bichoInteiro">Bicho Inteiro (R$ 5,00)</TabsTrigger>
            <TabsTrigger value="meioBicho">Meio Bicho (R$ 2,50)</TabsTrigger>
          </TabsList>
          <TabsContent value="bichoInteiro" className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              No jogo de Bicho Inteiro, você concorre com todos os 4 números do grupo escolhido.
            </p>
          </TabsContent>
          <TabsContent value="meioBicho" className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              No jogo de Meio Bicho, você concorre com 2 números do grupo escolhido, sorteados aleatoriamente.
            </p>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animaisData.map((animal) => (
            <div
              key={animal.id}
              className={`border rounded-md p-2 text-center cursor-pointer transition-all ${
                selecionados.includes(animal.id)
                  ? "border-primary bg-primary/10"
                  : animal.disponivel
                    ? "hover:border-primary"
                    : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => animal.disponivel && handleSelecionar(animal.id)}
            >
              <div className="relative">
                <img src={animal.imagem || "/placeholder.svg"} alt={animal.nome} className="mx-auto mb-2" />
                {!animal.disponivel && (
                  <Badge variant="secondary" className="absolute top-0 right-0">
                    Esgotado
                  </Badge>
                )}
              </div>
              <p className="font-medium text-sm">{animal.nome}</p>
              <p className="text-xs text-muted-foreground">{animal.numeros}</p>
            </div>
          ))}
        </div>

        <div className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="font-medium">Resumo do Pedido</p>
            <Badge variant="outline">{selecionados.length} bichos selecionados</Badge>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Unitário</Label>
                <p className="h-10 flex items-center font-medium">R$ {valorUnitario.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <p className="font-medium">Valor Total</p>
              <p className="font-bold text-lg">R$ {valorTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={selecionados.length === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" /> Comprar Agora
        </Button>
      </CardFooter>
    </Card>
  )
}
