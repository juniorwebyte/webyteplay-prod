"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ParticlesContainer from "@/components/particles-container"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Mail, MessageSquare, Phone, MapPin, Clock, AlertCircle } from "lucide-react"
import { formatarTelefone } from "@/lib/formatadores"
import { useConfiguracoes } from "@/hooks/use-configuracoes"

const EMAIL_CONTATO = "juniorwci70@gmail.com"
const WHATSAPP_NUMERO = "5511984801839" // 55=BR, 11=DDD, 984801839

export default function ContatoPage() {
  const { config } = useConfiguracoes()
  const [formState, setFormState] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: "",
  })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    if (params.get("success") === "1") {
      setFormSubmitted(true)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "telefone") {
      setFormState((prev) => ({ ...prev, [name]: formatarTelefone(value) }))
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }))
    }
    setFormError("")
  }

  const handleAssuntoChange = (value: string) => {
    setFormState((prev) => ({ ...prev, assunto: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setIsSubmitting(true)

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${EMAIL_CONTATO}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `[WebytePlay] ${formState.assunto || "Contato"}: ${formState.nome}`,
          _replyto: formState.email,
          _captcha: "false",
          nome: formState.nome,
          email: formState.email,
          telefone: formState.telefone || "—",
          assunto: formState.assunto || "Contato",
          mensagem: formState.mensagem,
        }),
      })

      if (!res.ok) throw new Error("Falha ao enviar")

      setFormSubmitted(true)
      setFormState({ nome: "", email: "", telefone: "", assunto: "", mensagem: "" })
    } catch {
      setFormError("Não foi possível enviar. Tente pelo WhatsApp ou envie um e-mail diretamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const emailContato = config?.emailContato || EMAIL_CONTATO
  const whatsappFormatado = config?.whatsapp || "(11) 98480-1839"
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMERO}`

  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <Header />

      <div className="flex-grow container mx-auto px-4 py-8 z-10 relative max-w-6xl">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-4 animated-text">Entre em Contato</h1>
          <p className="text-xl text-center mb-12 text-muted-foreground">
            Estamos aqui para ajudar! Envie sua mensagem ou use o WhatsApp para atendimento imediato.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="formulario" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="formulario">Formulário de Contato</TabsTrigger>
                  <TabsTrigger value="faq">Perguntas Frequentes</TabsTrigger>
                </TabsList>

                <TabsContent value="formulario">
                  <Card>
                    <CardHeader>
                      <CardTitle>Envie sua Mensagem</CardTitle>
                      <CardDescription>
                        Preencha o formulário e responderemos em até 24h. Ou use o WhatsApp para resposta imediata.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {formSubmitted ? (
                        <Alert className="bg-primary/10 border-primary">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <AlertTitle>Mensagem enviada com sucesso!</AlertTitle>
                          <AlertDescription>
                            Agradecemos seu contato. Responderemos em até 24 horas úteis no e-mail informado.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <form id="form-contato" onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="nome">Nome Completo *</Label>
                              <Input
                                id="nome"
                                name="nome"
                                placeholder="Digite seu nome completo"
                                value={formState.nome}
                                onChange={handleChange}
                                required
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">E-mail *</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={formState.email}
                                onChange={handleChange}
                                required
                                className="bg-background"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                              <Input
                                id="telefone"
                                name="telefone"
                                placeholder="(00) 00000-0000"
                                value={formState.telefone}
                                onChange={handleChange}
                                maxLength={15}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="assunto">Assunto</Label>
                              <Select value={formState.assunto} onValueChange={handleAssuntoChange}>
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Selecione o assunto" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="duvida">Dúvida sobre Rifas</SelectItem>
                                  <SelectItem value="pagamento">Problemas com Pagamento</SelectItem>
                                  <SelectItem value="premio">Informações sobre Prêmios</SelectItem>
                                  <SelectItem value="sugestao">Sugestões</SelectItem>
                                  <SelectItem value="outro">Outro Assunto</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="mensagem">Mensagem *</Label>
                            <Textarea
                              id="mensagem"
                              name="mensagem"
                              placeholder="Digite sua mensagem..."
                              rows={5}
                              value={formState.mensagem}
                              onChange={handleChange}
                              required
                              className="bg-background resize-none"
                            />
                          </div>

                          {formError && (
                            <Alert variant="destructive">
                              <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                          )}
                        </form>
                      )}
                    </CardContent>
                    {!formSubmitted && (
                      <CardFooter className="flex flex-col gap-3">
                        <Button
                          type="submit"
                          form="form-contato"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          As mensagens serão enviadas para {EMAIL_CONTATO}. Na primeira vez, confirme o e-mail de ativação do FormSubmit.
                        </p>
                      </CardFooter>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="faq">
                  <Card>
                    <CardHeader>
                      <CardTitle>Perguntas Frequentes</CardTitle>
                      <CardDescription>Dúvidas mais comuns sobre atendimento</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-primary shrink-0" /> Qual o prazo de resposta?
                        </h3>
                        <p className="text-muted-foreground">
                          Respondemos em até 24 horas úteis. Para urgências, use o WhatsApp.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-primary shrink-0" /> Não recebi confirmação do pagamento
                        </h3>
                        <p className="text-muted-foreground">
                          A confirmação pode levar até 15 minutos. Se após esse período não receber, entre em contato
                          pelo WhatsApp enviando o comprovante.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" /> WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-muted-foreground">Atendimento rápido:</p>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex" title="Chamar no WhatsApp">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40 active:scale-95">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </span>
                  </a>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" /> E-mail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-muted-foreground">Atendimento:</p>
                  <a href={`mailto:${emailContato}`} className="font-bold text-primary hover:underline break-all">
                    {emailContato}
                  </a>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Horário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold">Seg-Sex: 09:00 às 18:00</p>
                  <p className="font-bold">Sáb: 09:00 às 13:00</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3">
                    Av. Paulista, 1000 - Bela Vista
                    <br />
                    São Paulo - SP, 01310-100
                  </p>
                  <div className="w-full h-48 rounded-lg overflow-hidden border">
                    <iframe
                      title="Mapa - Av. Paulista"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.373703683599!2d-46.65502292375482!3d-23.561459678815353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%201000%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: 192 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="block"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
