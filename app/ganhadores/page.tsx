import Header from "@/components/header"
import Footer from "@/components/footer"
import UltimosGanhadores from "@/components/ultimos-ganhadores"
import { Suspense } from "react"
import Loading from "@/components/loading"
import ParticlesContainer from "@/components/particles-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

// Dados simulados de mais ganhadores
const maisGanhadoresData = [
  {
    id: 5,
    nome: "Carlos Mendes",
    premio: "Notebook Gamer",
    data: "2025-03-20",
    valor: 7500,
    numero: "567890",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    nome: "Fernanda Lima",
    premio: "R$ 2.000 em PIX",
    data: "2025-03-15",
    valor: 2000,
    numero: "123789",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    nome: "Roberto Alves",
    premio: "Xbox Series X",
    data: "2025-03-10",
    valor: 4000,
    numero: "456123",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    nome: "Juliana Martins",
    premio: "Smartphone Samsung S23",
    data: "2025-03-05",
    valor: 5500,
    numero: "789456",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 9,
    nome: "Marcos Souza",
    premio: "Viagem para Gramado",
    data: "2025-02-28",
    valor: 6000,
    numero: "234567",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 10,
    nome: "Patrícia Gomes",
    premio: "R$ 1.000 em PIX",
    data: "2025-02-25",
    valor: 1000,
    numero: "890123",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 11,
    nome: "Lucas Ferreira",
    premio: "Apple Watch",
    data: "2025-02-20",
    valor: 3000,
    numero: "345612",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 12,
    nome: "Camila Rocha",
    premio: "Fone de Ouvido Bluetooth",
    data: "2025-02-15",
    valor: 800,
    numero: "678901",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function GanhadoresPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <Header />

      <div className="flex-grow container mx-auto px-4 py-8 z-10 relative">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-8 animated-text">Ganhadores</h1>
          <p className="text-xl text-center mb-8">Conheça as pessoas que já foram premiadas em nossas rifas!</p>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Últimos Ganhadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <UltimosGanhadores />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Histórico de Ganhadores
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-10 bg-black/10 rounded-lg border border-gray-200">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold mb-2">Nenhum ganhador encontrado</h3>
              <p className="text-gray-500">Seja o primeiro a ganhar!</p>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </main>
  )
}
