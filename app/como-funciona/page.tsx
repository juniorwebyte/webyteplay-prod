import Header from "@/components/header"
import Footer from "@/components/footer"
import ParticlesContainer from "@/components/particles-container"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShoppingCart, Gift, Award, CreditCard, Shield, CheckCircle, Info, AlertTriangle } from "lucide-react"

export default function ComoFuncionaPage() {
  const steps = [
    {
      icon: <ShoppingCart className="w-16 h-16 text-primary" />,
      title: "Escolha sua Rifa",
      description:
        "Navegue pelo nosso catálogo de rifas disponíveis. Temos diversas categorias como tecnologia, dinheiro, viagens e muito mais. Escolha a que mais lhe interessa e clique para ver os detalhes.",
    },
    {
      icon: <CreditCard className="w-16 h-16 text-primary" />,
      title: "Compre seus Números",
      description:
        "Selecione quantos números deseja comprar. Quanto mais números, maiores suas chances! Efetue o pagamento via PIX de forma rápida e segura. Após a confirmação do pagamento, seus números serão atribuídos automaticamente.",
    },
    {
      icon: <Gift className="w-16 h-16 text-primary" />,
      title: "Concorra a Prêmios Instantâneos",
      description:
        "Algumas rifas oferecem prêmios instantâneos. Ao comprar um número, você pode ser sorteado na hora e receber um prêmio imediatamente via PIX. É uma chance extra de ganhar, além do sorteio principal!",
    },
    {
      icon: <Award className="w-16 h-16 text-primary" />,
      title: "Aguarde o Sorteio",
      description:
        "Se não ganhar instantaneamente, aguarde o sorteio final. Todos os sorteios são realizados ao vivo e transmitidos em nossas redes sociais. Os resultados ficam disponíveis no site logo após o sorteio. Boa sorte!",
    },
  ]

  const faqs = [
    {
      question: "Como sei se ganhei um prêmio?",
      answer:
        "Você receberá uma notificação por e-mail e SMS caso seja um dos ganhadores. Além disso, todos os resultados são publicados na seção 'Ganhadores' do nosso site e em nossas redes sociais.",
    },
    {
      question: "Quanto tempo leva para receber o prêmio?",
      answer:
        "Prêmios em dinheiro via PIX são enviados em até 24 horas após o sorteio. Produtos físicos são enviados em até 7 dias úteis. Viagens e outros prêmios especiais têm prazos específicos informados na descrição da rifa.",
    },
    {
      question: "Posso escolher meus números?",
      answer:
        "Sim! Ao comprar uma rifa, você pode escolher seus números favoritos entre os disponíveis ou optar por números aleatórios gerados pelo sistema.",
    },
    {
      question: "Como funciona o prêmio instantâneo?",
      answer:
        "Algumas rifas oferecem prêmios instantâneos. Ao comprar um número, o sistema verifica automaticamente se você foi sorteado. Se for, o prêmio é enviado imediatamente para o PIX cadastrado.",
    },
    {
      question: "Posso cancelar minha compra?",
      answer:
        "Cancelamentos podem ser solicitados em até 24 horas após a compra, desde que o sorteio ainda não tenha ocorrido. Entre em contato com nosso suporte para solicitar o cancelamento.",
    },
    {
      question: "Como é feito o sorteio?",
      answer:
        "Utilizamos a Loteria Federal como base para nossos sorteios, garantindo total transparência e imparcialidade. Os sorteios são transmitidos ao vivo em nossas redes sociais.",
    },
    {
      question: "Preciso pagar alguma taxa para receber o prêmio?",
      answer:
        "Não! Todos os impostos e taxas já estão inclusos. Você receberá o prêmio integral, sem nenhum custo adicional.",
    },
    {
      question: "Posso participar de qualquer lugar do Brasil?",
      answer:
        "Sim! Nossas rifas estão disponíveis para participantes de todo o Brasil. Prêmios em dinheiro são enviados via PIX e produtos físicos são enviados pelos Correios para qualquer endereço no território nacional.",
    },
  ]

  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <Header />

      <div className="flex-grow container mx-auto px-4 py-8 z-10 relative">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-4 animated-text">Como Funciona</h1>
          <p className="text-xl text-center mb-12">
            Entenda como participar das rifas e concorrer a prêmios incríveis!
          </p>

          <Tabs defaultValue="processo" className="mb-12">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="processo">Processo</TabsTrigger>
              <TabsTrigger value="faq">Perguntas Frequentes</TabsTrigger>
              <TabsTrigger value="termos">Termos e Segurança</TabsTrigger>
            </TabsList>

            <TabsContent value="processo">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {steps.map((step, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all overflow-hidden border-t-4 border-primary"
                  >
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">{step.icon}</div>
                      <div>
                        <CardTitle className="text-2xl">Passo {index + 1}</CardTitle>
                        <CardTitle>{step.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{step.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert className="bg-accent/10 border-accent">
                <Info className="h-5 w-5 text-accent" />
                <AlertTitle>Dica importante</AlertTitle>
                <AlertDescription>
                  Quanto mais números você comprar, maiores são suas chances de ganhar! Aproveite os pacotes com
                  descontos especiais.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Perguntas Frequentes</CardTitle>
                  <CardDescription>Encontre respostas para as dúvidas mais comuns sobre nossas rifas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="termos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-primary" />
                      <CardTitle>Segurança e Transparência</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Todos os sorteios são baseados na Loteria Federal, garantindo total imparcialidade nos
                          resultados.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Transmitimos os sorteios ao vivo em nossas redes sociais para que todos possam acompanhar.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Utilizamos tecnologia de criptografia avançada para proteger seus dados pessoais e
                          financeiros.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Todos os pagamentos são processados por gateways seguros e confiáveis, com confirmação
                          instantânea.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                      <CardTitle>Termos e Condições</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Para participar, é necessário ser maior de 18 anos e fornecer dados válidos para contato.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          O prazo para reclamação de prêmios é de 30 dias após a data do sorteio. Após esse período, o
                          prêmio será considerado não reclamado.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Nos reservamos o direito de alterar a data do sorteio em caso de força maior, com aviso prévio
                          a todos os participantes.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          Ao participar, você concorda em ter seu nome e imagem divulgados em caso de premiação.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Política de Privacidade</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p>
                    A WebytePlay valoriza a privacidade de seus usuários e se compromete a proteger os dados pessoais
                    fornecidos durante o uso de nossa plataforma. Esta política de privacidade descreve como coletamos,
                    usamos e protegemos suas informações.
                  </p>

                  <h3>Informações Coletadas</h3>
                  <p>
                    Coletamos informações como nome, e-mail, telefone, CPF e dados de pagamento necessários para
                    processar sua participação nas rifas e entregar os prêmios aos ganhadores.
                  </p>

                  <h3>Uso das Informações</h3>
                  <p>
                    Utilizamos suas informações para processar compras, enviar confirmações, notificar sobre resultados
                    de sorteios, entregar prêmios e fornecer suporte ao cliente. Também podemos usar seus dados para
                    melhorar nossos serviços e enviar comunicações de marketing, sempre com opção de cancelamento.
                  </p>

                  <h3>Proteção de Dados</h3>
                  <p>
                    Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra
                    acesso não autorizado, alteração, divulgação ou destruição. Todos os dados de pagamento são
                    criptografados e processados por gateways de pagamento seguros.
                  </p>

                  <h3>Seus Direitos</h3>
                  <p>
                    Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento. Para
                    exercer esses direitos, entre em contato conosco através dos canais disponíveis na página de
                    contato.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <Footer />
    </main>
  )
}
