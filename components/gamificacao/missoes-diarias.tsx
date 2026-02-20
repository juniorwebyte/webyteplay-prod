"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, Calendar, Trophy, RefreshCw } from "lucide-react"

// Dados simulados das missões diárias
const missoesDiarias = [
  {
    id: 1,
    titulo: "Compre 2 rifas hoje",
    descricao: "Compre pelo menos 2 rifas hoje e ganhe uma recompensa",
    progresso: 1,
    objetivo: 2,
    recompensa: "1 Número Grátis",
    iconeRecompensa: "🎫",
    concluida: false,
    tipo: "diaria",
  },
  {
    id: 2,
    titulo: "Gire a roleta premiada",
    descricao: "Gire a roleta premiada 1 vez hoje",
    progresso: 1,
    objetivo: 1,
    recompensa: "5 Pontos VIP",
    iconeRecompensa: "⭐",
    concluida: true,
    tipo: "diaria",
  },
  {
    id: 3,
    titulo: "Abra uma caixa premiada",
    descricao: "Abra pelo menos 1 caixa premiada hoje",
    progresso: 0,
    objetivo: 1,
    recompensa: "10% de Cashback",
    iconeRecompensa: "💰",
    concluida: false,
    tipo: "diaria",
  },
  {
    id: 4,
    titulo: "Compartilhe uma rifa",
    descricao: "Compartilhe uma rifa nas redes sociais",
    progresso: 0,
    objetivo: 1,
    recompensa: "3 Pontos VIP",
    iconeRecompensa: "⭐",
    concluida: false,
    tipo: "diaria",
  },
]

// Dados simulados das missões semanais
const missoesSemanais = [
  {
    id: 5,
    titulo: "Compre 10 rifas esta semana",
    descricao: "Compre pelo menos 10 rifas esta semana",
    progresso: 5,
    objetivo: 10,
    recompensa: "5 Números Grátis",
    iconeRecompensa: "🎫",
    concluida: false,
    tipo: "semanal",
  },
  {
    id: 6,
    titulo: "Convide 3 amigos",
    descricao: "Convide 3 amigos para a plataforma",
    progresso: 1,
    objetivo: 3,
    recompensa: "1 Ticket para Roleta",
    iconeRecompensa: "🎟️",
    concluida: false,
    tipo: "semanal",
  },
  {
    id: 7,
    titulo: "Participe de 5 rifas diferentes",
    descricao: "Participe de pelo menos 5 rifas diferentes esta semana",
    progresso: 3,
    objetivo: 5,
    recompensa: "20 Pontos VIP",
    iconeRecompensa: "⭐",
    concluida: false,
    tipo: "semanal",
  },
]

// Dados simulados das conquistas
const conquistas = [
  {
    id: 8,
    titulo: "Primeira Vitória",
    descricao: "Ganhe sua primeira rifa",
    progresso: 1,
    objetivo: 1,
    recompensa: "Título: Sortudo",
    iconeRecompensa: "🏆",
    concluida: true,
    tipo: "conquista",
  },
  {
    id: 9,
    titulo: "Colecionador",
    descricao: "Ganhe 5 rifas diferentes",
    progresso: 2,
    objetivo: 5,
    recompensa: "Título: Colecionador",
    iconeRecompensa: "🏆",
    concluida: false,
    tipo: "conquista",
  },
  {
    id: 10,
    titulo: "Grande Apostador",
    descricao: "Compre 100 rifas no total",
    progresso: 45,
    objetivo: 100,
    recompensa: "Título: Grande Apostador",
    iconeRecompensa: "🏆",
    concluida: false,
    tipo: "conquista",
  },
  {
    id: 11,
    titulo: "VIP Dedicado",
    descricao: "Alcance o nível VIP Ouro",
    progresso: 1,
    objetivo: 1,
    recompensa: "Caixa Lendária",
    iconeRecompensa: "📦",
    concluida: false,
    tipo: "conquista",
  },
  {
    id: 12,
    titulo: "Rei da Roleta",
    descricao: "Gire a roleta premiada 50 vezes",
    progresso: 12,
    objetivo: 50,
    recompensa: "Título: Rei da Roleta",
    iconeRecompensa: "🏆",
    concluida: false,
    tipo: "conquista",
  },
]

export default function MissoesDiarias() {
  const [missoes, setMissoes] = useState({
    diarias: missoesDiarias,
    semanais: missoesSemanais,
    conquistas: conquistas,
  })

  // Calcular progresso geral
  const calcularProgresso = (lista: typeof missoesDiarias) => {
    const total = lista.length
    const concluidas = lista.filter((missao) => missao.concluida).length
    return Math.floor((concluidas / total) * 100)
  }

  // Simular conclusão de missão
  const concluirMissao = (id: number, tipo: "diarias" | "semanais" | "conquistas") => {
    setMissoes((prev) => {
      const novaLista = [...prev[tipo]]
      const index = novaLista.findIndex((missao) => missao.id === id)
      if (index !== -1) {
        novaLista[index] = { ...novaLista[index], concluida: true, progresso: novaLista[index].objetivo }
      }
      return { ...prev, [tipo]: novaLista }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Missões Diárias
              </CardTitle>
              <Badge variant="outline">
                {missoes.diarias.filter((m) => m.concluida).length}/{missoes.diarias.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={calcularProgresso(missoes.diarias)} className="h-2 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Conclua missões diárias para ganhar recompensas exclusivas!
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Redefine em 12:00:00</span>
              </div>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Missões Semanais
              </CardTitle>
              <Badge variant="outline">
                {missoes.semanais.filter((m) => m.concluida).length}/{missoes.semanais.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={calcularProgresso(missoes.semanais)} className="h-2 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Missões semanais oferecem recompensas maiores. Não perca!
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Redefine em 5 dias</span>
              </div>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Conquistas
              </CardTitle>
              <Badge variant="outline">
                {missoes.conquistas.filter((m) => m.concluida).length}/{missoes.conquistas.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={calcularProgresso(missoes.conquistas)} className="h-2 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Conquistas desbloqueiam títulos exclusivos e recompensas especiais!
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Permanentes</span>
              </div>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="diarias">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diarias">Missões Diárias</TabsTrigger>
          <TabsTrigger value="semanais">Missões Semanais</TabsTrigger>
          <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="diarias" className="pt-6">
          <div className="space-y-4">
            {missoes.diarias.map((missao) => (
              <Card key={missao.id} className={missao.concluida ? "bg-primary/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        missao.concluida ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      {missao.concluida ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{missao.titulo}</h3>
                        <div className="flex items-center gap-1">
                          <div className="text-lg">{missao.iconeRecompensa}</div>
                          <span className="text-sm">{missao.recompensa}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{missao.descricao}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Progress value={(missao.progresso / missao.objetivo) * 100} className="h-2 w-24" />
                          <span className="text-xs">
                            {missao.progresso}/{missao.objetivo}
                          </span>
                        </div>
                        {missao.concluida ? (
                          <Button variant="outline" size="sm" disabled>
                            Concluída
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => concluirMissao(missao.id, "diarias")}
                            disabled={missao.progresso < missao.objetivo}
                          >
                            {missao.progresso >= missao.objetivo ? "Coletar" : "Em Progresso"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="semanais" className="pt-6">
          <div className="space-y-4">
            {missoes.semanais.map((missao) => (
              <Card key={missao.id} className={missao.concluida ? "bg-primary/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        missao.concluida ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      {missao.concluida ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{missao.titulo}</h3>
                        <div className="flex items-center gap-1">
                          <div className="text-lg">{missao.iconeRecompensa}</div>
                          <span className="text-sm">{missao.recompensa}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{missao.descricao}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Progress value={(missao.progresso / missao.objetivo) * 100} className="h-2 w-24" />
                          <span className="text-xs">
                            {missao.progresso}/{missao.objetivo}
                          </span>
                        </div>
                        {missao.concluida ? (
                          <Button variant="outline" size="sm" disabled>
                            Concluída
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => concluirMissao(missao.id, "semanais")}
                            disabled={missao.progresso < missao.objetivo}
                          >
                            {missao.progresso >= missao.objetivo ? "Coletar" : "Em Progresso"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conquistas" className="pt-6">
          <div className="space-y-4">
            {missoes.conquistas.map((missao) => (
              <Card key={missao.id} className={missao.concluida ? "bg-primary/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        missao.concluida ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      {missao.concluida ? (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Trophy className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{missao.titulo}</h3>
                        <div className="flex items-center gap-1">
                          <div className="text-lg">{missao.iconeRecompensa}</div>
                          <span className="text-sm">{missao.recompensa}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{missao.descricao}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Progress value={(missao.progresso / missao.objetivo) * 100} className="h-2 w-24" />
                          <span className="text-xs">
                            {missao.progresso}/{missao.objetivo}
                          </span>
                        </div>
                        {missao.concluida ? (
                          <Badge variant="outline" className="bg-primary/10">
                            Conquistado
                          </Badge>
                        ) : (
                          <Badge variant="outline">Em Progresso</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
