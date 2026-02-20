import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Gift, Award, CreditCard } from "lucide-react"

export default function ComoFunciona() {
  const steps = [
    {
      icon: <ShoppingCart className="w-10 h-10 text-primary" />,
      title: "Escolha sua Rifa",
      description: "Navegue pelas rifas disponíveis e escolha a que mais lhe interessa.",
    },
    {
      icon: <CreditCard className="w-10 h-10 text-primary" />,
      title: "Compre seus Números",
      description: "Selecione quantos números deseja e efetue o pagamento via PIX.",
    },
    {
      icon: <Gift className="w-10 h-10 text-primary" />,
      title: "Concorra a Prêmios Instantâneos",
      description: "Algumas rifas oferecem prêmios instantâneos. Você pode ganhar na hora!",
    },
    {
      icon: <Award className="w-10 h-10 text-primary" />,
      title: "Aguarde o Sorteio",
      description: "Se não ganhar instantaneamente, aguarde o sorteio final para saber se foi premiado.",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {steps.map((step, index) => (
        <Card key={index} className="text-center hover:shadow-lg transition-all">
          <CardHeader>
            <div className="mx-auto mb-4">{step.icon}</div>
            <CardTitle>Passo {index + 1}</CardTitle>
            <CardTitle>{step.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{step.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
