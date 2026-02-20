"use client"

import type React from "react"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Plus, ArrowLeft, X, CheckCircle2, Loader2 } from "lucide-react"
import AdminLayout from "@/components/admin/admin-layout"
import {
  salvarCampanha,
  atualizarCampanha,
  buscarCampanha,
  compressImageForCampaign,
  type CotaPremiadaItem,
  type PacotePromocional,
  type PremioRoletaBox,
} from "@/lib/campanhas-store"

// Interface para o tipo de desconto
interface Desconto {
  id: number
  quantidadeCotas: string
  valorDesconto: string
}

function NovaCampanhaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const isEditMode = !!editId
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("dados")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [descontos, setDescontos] = useState<Desconto[]>([])
  const [proximoIdDesconto, setProximoIdDesconto] = useState(1)
  const [cotasPremiadasLista, setCotasPremiadasLista] = useState<CotaPremiadaItem[]>([])
  const [pacotesRoleta, setPacotesRoleta] = useState<PacotePromocional[]>([])
  const [pacotesBox, setPacotesBox] = useState<PacotePromocional[]>([])
  const [premiosRoleta, setPremiosRoleta] = useState<PremioRoletaBox[]>([])
  const [premiosBox, setPremiosBox] = useState<PremioRoletaBox[]>([])
  const [cotasBloqueadas, setCotasBloqueadas] = useState<number[]>([])

  // Refs para inputs de arquivo
  const imagemPrincipalRef = useRef<HTMLInputElement>(null)
  const imagensGaleriaRef = useRef<HTMLInputElement>(null)

  // Estados para previews de imagens
  const [imagemPrincipalPreview, setImagemPrincipalPreview] = useState<string | null>(null)
  const [imagensAdicionaisPreview, setImagensAdicionaisPreview] = useState<string[]>([])

  // Estados para cada seção do formulário
  const [formData, setFormData] = useState({
    // Dados
    titulo: "",
    subtitulo: "",
    descricao: "",
    tipoCampanha: "automatico",
    valorCotas: [
      { numero: 1, valor: "10" },
      { numero: 2, valor: "20" },
      { numero: 3, valor: "50" },
      { numero: 4, valor: "100" },
      { numero: 5, valor: "200" },
      { numero: 6, valor: "300" },
    ],
    dataInicio: "",
    campanhaPrivada: false,
    destaque: false,
    quantidadeNumeros: "50",
    valorPorCota: "10.00",
    tempoParaPagamento: "Selecione",
    quantidadeLimiteCompra: "0",
    quantidadeMinima: "1",
    quantidadeMaximaCompra: "500",
    statusExibicao: "adquira",
    statusCampanha: "Ativo",

    // Imagens
    imagemPrincipal: null,
    imagensAdicionais: [],

    // Descontos
    habilitarDesconto: false,

    // Ranking
    habilitarRanking: false,
    mostrarNomes: false,
    tipoRanking: "total",
    quantidadeCompradores: "",
    mensagemPromocao: "",

    // Barra de Progresso
    exibirBarraProgresso: false,

    // Ganhador
    habilitarGanhador: false,
    nomeGanhador: "",
    numeroSorteado: "",

    // Cotas Premiadas
    cotasPremiadas: false,
    cotasPremiadas1: "123456",
    cotasPremiadas2: "7654321",
    habilitarMaiorMenorCota: false,
    habilitarMaiorMenorCotaDiaria: false,
    habilitarRoleta: false,
    habilitarBox: false,
    habilitarBloqueioCotas: false,
    roletaValorGiro: 5,
    boxValorAbertura: 10,
  })

  // Verificar autenticação
  useEffect(() => {
    const adminData = localStorage.getItem("admin")

    if (!adminData) {
      router.push("/admin")
      return
    }

    try {
      const admin = JSON.parse(adminData)
      if (!admin || !admin.isAdmin) {
        router.push("/admin")
        return
      }

      // Verificar se o login expirou (24 horas)
      const loginTime = admin.loginTime || 0
      const currentTime = new Date().getTime()
      const hoursPassed = (currentTime - loginTime) / (1000 * 60 * 60)

      if (hoursPassed > 24) {
        localStorage.removeItem("admin")
        router.push("/admin")
        return
      }

      setIsLoading(false)

      // Se modo edição, carregar dados da campanha
      if (editId) {
        const campanha = buscarCampanha(editId)
        if (campanha) {
          setFormData({
            titulo: campanha.titulo || "",
            subtitulo: campanha.subtitulo || "",
            descricao: campanha.descricao || "",
            tipoCampanha: campanha.tipoCampanha || "automatico",
            valorCotas: campanha.valorCotas || [
              { numero: 1, valor: "10" },
              { numero: 2, valor: "20" },
              { numero: 3, valor: "50" },
              { numero: 4, valor: "100" },
              { numero: 5, valor: "200" },
              { numero: 6, valor: "300" },
            ],
            dataInicio: campanha.dataInicio || "",
            campanhaPrivada: campanha.campanhaPrivada || false,
            destaque: campanha.destaque || false,
            quantidadeNumeros: campanha.quantidadeNumeros || "50",
            valorPorCota: campanha.valorPorCota || "10.00",
            tempoParaPagamento: campanha.tempoParaPagamento || "Selecione",
            quantidadeLimiteCompra: campanha.quantidadeLimiteCompra || "0",
            quantidadeMinima: campanha.quantidadeMinima || "1",
            quantidadeMaximaCompra: campanha.quantidadeMaximaCompra || "500",
            statusExibicao: campanha.statusExibicao || "adquira",
            statusCampanha: campanha.statusCampanha || "Ativo",
            imagemPrincipal: campanha.imagemPrincipal as any,
            imagensAdicionais: (campanha.imagensAdicionais || []) as any,
            habilitarDesconto: campanha.habilitarDesconto || false,
            habilitarRanking: campanha.habilitarRanking || false,
            mostrarNomes: campanha.mostrarNomes || false,
            tipoRanking: campanha.tipoRanking || "total",
            quantidadeCompradores: campanha.quantidadeCompradores || "",
            mensagemPromocao: campanha.mensagemPromocao || "",
            exibirBarraProgresso: campanha.exibirBarraProgresso || false,
            habilitarGanhador: campanha.habilitarGanhador || false,
            nomeGanhador: campanha.nomeGanhador || "",
            numeroSorteado: campanha.numeroSorteado || "",
            cotasPremiadas: campanha.cotasPremiadas || false,
            cotasPremiadas1: campanha.cotasPremiadas1 || "",
            cotasPremiadas2: campanha.cotasPremiadas2 || "",
            habilitarMaiorMenorCota: campanha.habilitarMaiorMenorCota || false,
            habilitarMaiorMenorCotaDiaria: campanha.habilitarMaiorMenorCotaDiaria || false,
            habilitarRoleta: campanha.habilitarRoleta || false,
            habilitarBox: campanha.habilitarBox || false,
            habilitarBloqueioCotas: campanha.habilitarBloqueioCotas || false,
            roletaValorGiro: campanha.roletaValorGiro ?? 5,
            boxValorAbertura: campanha.boxValorAbertura ?? 10,
          })
          const listaCotas = campanha.cotasPremiadasLista
          if (Array.isArray(listaCotas) && listaCotas.length > 0) {
            setCotasPremiadasLista(listaCotas)
          } else if (campanha.cotasPremiadas1?.trim()) {
            const nums = campanha.cotasPremiadas1
              .split(/[^0-9]+/)
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => Number(s))
              .filter((n) => Number.isFinite(n) && n > 0)
            const premioPadrao = campanha.cotasPremiadas2 || "Cota premiada"
            setCotasPremiadasLista(
              nums.map((numero, i) => ({
                id: `cota-${Date.now()}-${i}`,
                numero,
                premio: premioPadrao,
              }))
            )
          }
          setImagemPrincipalPreview(campanha.imagemPrincipal || null)
          setImagensAdicionaisPreview(campanha.imagensAdicionais && campanha.imagensAdicionais.length > 0 ? campanha.imagensAdicionais : [])
          if (campanha.descontos && campanha.descontos.length > 0) {
            setDescontos(campanha.descontos)
            setProximoIdDesconto(Math.max(...campanha.descontos.map((d: any) => d.id)) + 1)
          }
          if (campanha.roletasConfig?.[0]?.pacotes) {
            setPacotesRoleta(campanha.roletasConfig[0].pacotes)
          }
          if (campanha.roletasConfig?.[0]?.premios?.length) {
            setPremiosRoleta(campanha.roletasConfig[0].premios!)
          }
          if (campanha.boxsConfig?.[0]?.pacotes) {
            setPacotesBox(campanha.boxsConfig[0].pacotes)
          }
          if (campanha.boxsConfig?.[0]?.premios?.length) {
            setPremiosBox(campanha.boxsConfig[0].premios!)
          }
          if (Array.isArray(campanha.cotasBloqueadas) && campanha.cotasBloqueadas.length > 0) {
            setCotasBloqueadas(campanha.cotasBloqueadas)
          }
        }
      }
    } catch (error) {
      localStorage.removeItem("admin")
      router.push("/admin")
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))

    // Se desabilitar os descontos, limpar a lista de descontos
    if (name === "habilitarDesconto" && !checked) {
      setDescontos([])
      setProximoIdDesconto(1)
    }

    // Se habilitar os descontos e não houver nenhum, adicionar o primeiro
    if (name === "habilitarDesconto" && checked && descontos.length === 0) {
      adicionarDesconto()
    }
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDescontoChange = (id: number, field: keyof Desconto, value: string) => {
    setDescontos(descontos.map((desconto) => (desconto.id === id ? { ...desconto, [field]: value } : desconto)))
  }

  const adicionarDesconto = () => {
    // Adicionar novo desconto com valores padrão
    const novoDesconto: Desconto = {
      id: proximoIdDesconto,
      quantidadeCotas:
        proximoIdDesconto === 1 ? "10" : proximoIdDesconto === 2 ? "20" : proximoIdDesconto === 3 ? "30" : "40",
      valorDesconto:
        proximoIdDesconto === 1 ? "1.00" : proximoIdDesconto === 2 ? "2.00" : proximoIdDesconto === 3 ? "3.00" : "4.00",
    }

    setDescontos([...descontos, novoDesconto])
    setProximoIdDesconto(proximoIdDesconto + 1)
  }

  const removerDesconto = (id: number) => {
    setDescontos(descontos.filter((desconto) => desconto.id !== id))
  }

  const adicionarCotaPremiada = () => {
    setCotasPremiadasLista((prev) => [
      ...prev,
      {
        id: `cota-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        numero: prev.length > 0 ? Math.max(...prev.map((c) => c.numero)) + 1 : 1,
        premio: "Cota premiada",
      },
    ])
  }

  const removerCotaPremiada = (id: string) => {
    setCotasPremiadasLista((prev) => prev.filter((c) => c.id !== id))
  }

  const atualizarCotaPremiada = (id: string, field: "numero" | "premio", value: number | string) => {
    setCotasPremiadasLista((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const adicionarPacoteRoleta = () => {
    setPacotesRoleta((prev) => [
      ...prev,
      {
        id: `pacote-roleta-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        quantidade: prev.length > 0 ? Math.max(...prev.map((p) => p.quantidade)) + 1 : 5,
        valor: prev.length > 0 ? Math.max(...prev.map((p) => p.valor)) + 5 : 10,
        label: "",
      },
    ])
  }

  const removerPacoteRoleta = (id: string) => {
    setPacotesRoleta((prev) => prev.filter((p) => p.id !== id))
  }

  const atualizarPacoteRoleta = (id: string, field: "quantidade" | "valor" | "label", value: number | string) => {
    setPacotesRoleta((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  const adicionarPacoteBox = () => {
    setPacotesBox((prev) => [
      ...prev,
      {
        id: `pacote-box-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        quantidade: prev.length > 0 ? Math.max(...prev.map((p) => p.quantidade)) + 1 : 3,
        valor: prev.length > 0 ? Math.max(...prev.map((p) => p.valor)) + 5 : 10,
        label: "",
      },
    ])
  }

  const removerPacoteBox = (id: string) => {
    setPacotesBox((prev) => prev.filter((p) => p.id !== id))
  }

  const atualizarPacoteBox = (id: string, field: "quantidade" | "valor" | "label", value: number | string) => {
    setPacotesBox((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  const adicionarPremioRoleta = () => {
    setPremiosRoleta((prev) => [
      ...prev,
      {
        id: `premio-roleta-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        nome: prev.length === 0 ? "1 Número Grátis" : `Prêmio ${prev.length + 1}`,
        probabilidade: prev.length === 0 ? 30 : 10,
        icone: "🎫",
        daCotaParaSorteio: prev.length === 0,
      },
    ])
  }

  const removerPremioRoleta = (id: string) => {
    setPremiosRoleta((prev) => prev.filter((p) => p.id !== id))
  }

  const atualizarPremioRoleta = (id: string, field: keyof PremioRoletaBox, value: string | number | boolean | undefined) => {
    setPremiosRoleta((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  const adicionarPremioBox = () => {
    setPremiosBox((prev) => [
      ...prev,
      {
        id: `premio-box-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        nome: prev.length === 0 ? "1 Número Grátis" : `Prêmio ${prev.length + 1}`,
        probabilidade: prev.length === 0 ? 30 : 10,
        icone: "🎫",
        daCotaParaSorteio: prev.length === 0,
      },
    ])
  }

  const removerPremioBox = (id: string) => {
    setPremiosBox((prev) => prev.filter((p) => p.id !== id))
  }

  const atualizarPremioBox = (id: string, field: keyof PremioRoletaBox, value: string | number | boolean | undefined) => {
    setPremiosBox((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  const adicionarCotaBloqueada = (numero: number) => {
    const n = Math.floor(Number(numero))
    if (n >= 1 && !cotasBloqueadas.includes(n)) {
      setCotasBloqueadas((prev) => [...prev, n].sort((a, b) => a - b))
    }
  }

  const removerCotaBloqueada = (numero: number) => {
    setCotasBloqueadas((prev) => prev.filter((n) => n !== numero))
  }

  const inputCotaBloqueadaRef = useRef<HTMLInputElement>(null)

  // Handler para imagem principal
  const handleImagemPrincipal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await compressImageForCampaign(file)
      setImagemPrincipalPreview(base64)
      setFormData((prev) => ({ ...prev, imagemPrincipal: base64 as any }))
      e.target.value = ""
    } catch (err) {
      console.error("Erro ao processar imagem:", err)
    }
  }

  // Handler para galeria de imagens (comprime para nao estourar localStorage)
  const handleImagensGaleria = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    try {
      const novasImagens: string[] = []
      for (let i = 0; i < files.length; i++) {
        const base64 = await compressImageForCampaign(files[i])
        novasImagens.push(base64)
      }
      setImagensAdicionaisPreview((prev) => [...prev, ...novasImagens])
      setFormData((prev) => ({
        ...prev,
        imagensAdicionais: [...(prev.imagensAdicionais as any), ...novasImagens],
      }))
    } catch (err) {
      console.error("Erro ao processar imagens:", err)
    }
  }

  const removerImagemPrincipal = () => {
    setImagemPrincipalPreview(null)
    setFormData((prev) => ({ ...prev, imagemPrincipal: null }))
    if (imagemPrincipalRef.current) imagemPrincipalRef.current.value = ""
  }

  const removerImagemGaleria = (index: number) => {
    setImagensAdicionaisPreview((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      imagensAdicionais: (prev.imagensAdicionais as any).filter((_: any, i: number) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const isFazendinha = formData.tipoCampanha === "fazendinha" || formData.tipoCampanha === "fazendinhaMetade"
      const quantidadeNumeros = isFazendinha ? "100" : formData.quantidadeNumeros
      const tempoParaPagamento =
        !formData.tempoParaPagamento || formData.tempoParaPagamento === "Selecione"
          ? "15min"
          : formData.tempoParaPagamento

      const campanhaData = {
        titulo: formData.titulo,
        subtitulo: formData.subtitulo,
        descricao: formData.descricao,
        tipoCampanha: formData.tipoCampanha,
        valorCotas: formData.valorCotas,
        dataInicio: formData.dataInicio,
        campanhaPrivada: formData.campanhaPrivada,
        destaque: formData.destaque,
        quantidadeNumeros,
        valorPorCota: formData.valorPorCota,
        tempoParaPagamento,
        quantidadeLimiteCompra: formData.quantidadeLimiteCompra,
        quantidadeMinima: formData.quantidadeMinima,
        quantidadeMaximaCompra: formData.quantidadeMaximaCompra,
        statusExibicao: formData.statusExibicao,
        statusCampanha: formData.statusCampanha,
        imagemPrincipal: imagemPrincipalPreview,
        imagensAdicionais: imagensAdicionaisPreview,
        habilitarDesconto: formData.habilitarDesconto,
        descontos: descontos,
        habilitarRanking: formData.habilitarRanking,
        mostrarNomes: formData.mostrarNomes,
        tipoRanking: formData.tipoRanking,
        quantidadeCompradores: formData.quantidadeCompradores,
        mensagemPromocao: formData.mensagemPromocao,
        exibirBarraProgresso: formData.exibirBarraProgresso,
        habilitarGanhador: formData.habilitarGanhador,
        nomeGanhador: formData.nomeGanhador,
        numeroSorteado: formData.numeroSorteado,
        cotasPremiadas: formData.cotasPremiadas,
        cotasPremiadas1: formData.cotasPremiadas1,
        cotasPremiadas2: formData.cotasPremiadas2,
        cotasPremiadasLista: cotasPremiadasLista,
        habilitarMaiorMenorCota: formData.habilitarMaiorMenorCota,
        habilitarMaiorMenorCotaDiaria: formData.habilitarMaiorMenorCotaDiaria,
        habilitarRoleta: formData.habilitarRoleta,
        habilitarBox: formData.habilitarBox,
        habilitarBloqueioCotas: formData.habilitarBloqueioCotas,
        cotasBloqueadas: formData.habilitarBloqueioCotas ? cotasBloqueadas : [],
        roletaValorGiro: Number(formData.roletaValorGiro) || 5,
        boxValorAbertura: Number(formData.boxValorAbertura) || 10,
        roletasConfig: formData.habilitarRoleta
          ? [
              {
                id: `roleta-${Date.now()}`,
                nome: "Roleta da Campanha",
                valorGiro: Number(formData.roletaValorGiro) || 5,
                moeda: "reais" as const,
                pacotes: pacotesRoleta,
                premios: premiosRoleta.length > 0 ? premiosRoleta : undefined,
              },
            ]
          : undefined,
        boxsConfig: formData.habilitarBox
          ? [
              {
                id: `box-${Date.now()}`,
                nome: "Box da Campanha",
                valorAbertura: Number(formData.boxValorAbertura) || 10,
                moeda: "reais" as const,
                pacotes: pacotesBox,
                premios: premiosBox.length > 0 ? premiosBox : undefined,
              },
            ]
          : undefined,
      }

      if (isEditMode && editId) {
        atualizarCampanha(editId, campanhaData)
      } else {
        salvarCampanha(campanhaData)
      }

      setSaveSuccess(true)
      setTimeout(() => {
        router.push("/admin/campanhas")
      }, 1500)
    } catch (err) {
      console.error("Erro ao salvar campanha:", err)
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB800]"></div>
        </div>
      </AdminLayout>
    )
  }

  let conteudoSalvarAba: React.ReactNode = "Salvar Campanha"
  if (isSaving) {
    conteudoSalvarAba = (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Salvando...
      </>
    )
  } else if (saveSuccess) {
    conteudoSalvarAba = (
      <>
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Campanha Salva!
      </>
    )
  }

  let conteudoSalvarGlobal: React.ReactNode = "Salvar Campanha"
  if (isSaving) {
    conteudoSalvarGlobal = (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Salvando campanha...
      </>
    )
  } else if (saveSuccess) {
    conteudoSalvarGlobal = (
      <>
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Campanha salva com sucesso!
      </>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="mr-2 text-white hover:text-[#FFB800] hover:bg-transparent"
              onClick={() => router.push("/admin/campanhas")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white animated-text">{isEditMode ? "Editar campanha" : "Nova campanha"}</h1>
          </div>
        </div>

        <div className="bg-[#171923] rounded-lg shadow-lg p-6 mb-6 border border-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0F1117] opacity-50"></div>

          <div className="relative z-10">
            <Tabs defaultValue="dados" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-7 mb-6 bg-[#0F1117] border border-gray-800">
                <TabsTrigger value="dados" className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black">
                  Dados
                </TabsTrigger>
                <TabsTrigger
                  value="imagens"
                  className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black"
                >
                  Imagens
                </TabsTrigger>
                <TabsTrigger
                  value="descontos"
                  className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black"
                >
                  Descontos
                </TabsTrigger>
                <TabsTrigger
                  value="ranking"
                  className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black"
                >
                  Ranking de compradores
                </TabsTrigger>
                <TabsTrigger value="barra" className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black">
                  Barra de progresso
                </TabsTrigger>
                <TabsTrigger
                  value="ganhador"
                  className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black"
                >
                  Ganhador
                </TabsTrigger>
                <TabsTrigger value="cotas" className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-black">
                  Cotas premiadas
                </TabsTrigger>
              </TabsList>

              {/* Tab Dados */}
              <TabsContent value="dados" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo" className="text-white mb-2 block">
                      Título
                    </Label>
                    <Input
                      id="titulo"
                      name="titulo"
                      placeholder="Nome da campanha"
                      className="bg-[#0F1117] border-gray-700 text-white"
                      value={formData.titulo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitulo" className="text-white mb-2 block">
                      Subtítulo
                    </Label>
                    <Input
                      id="subtitulo"
                      name="subtitulo"
                      placeholder="Ex: CAMPANHA 31 RIFAS"
                      className="bg-[#0F1117] border-gray-700 text-white"
                      value={formData.subtitulo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao" className="text-white mb-2 block">
                    Descrição (opcional para descrever melhor a campanha)
                  </Label>
                  <div className="bg-[#0F1117] border border-gray-700 rounded-md mb-2">
                    <div className="flex flex-wrap gap-1 p-1 border-b border-gray-700">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">Bold</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">Italic</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <line x1="19" x2="10" y1="4" y2="4"></line>
                          <line x1="14" x2="5" y1="20" y2="20"></line>
                          <line x1="15" x2="9" y1="4" y2="20"></line>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">Underline</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                          <line x1="4" x2="20" y1="21" y2="21"></line>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">Link</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">Image</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <path d="m21 15-5-5L5 21"></path>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">Code</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">Heading</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M6 12h12"></path>
                          <path d="M6 20h12"></path>
                          <path d="M6 4h12"></path>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">List</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <line x1="8" x2="21" y1="6" y2="6"></line>
                          <line x1="8" x2="21" y1="12" y2="12"></line>
                          <line x1="8" x2="21" y1="18" y2="18"></line>
                          <line x1="3" x2="3.01" y1="6" y2="6"></line>
                          <line x1="3" x2="3.01" y1="12" y2="12"></line>
                          <line x1="3" x2="3.01" y1="18" y2="18"></line>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">Numbered list</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <line x1="10" x2="21" y1="6" y2="6"></line>
                          <line x1="10" x2="21" y1="12" y2="12"></line>
                          <line x1="10" x2="21" y1="18" y2="18"></line>
                          <path d="M4 6h1v4"></path>
                          <path d="M4 10h2"></path>
                          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">Quote</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                        <span className="sr-only">Expand</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 8V5h3"></path>
                          <path d="M21 8V5h-3"></path>
                          <path d="M3 16v3h3"></path>
                          <path d="M21 16v3h-3"></path>
                        </svg>
                      </Button>
                    </div>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      className="min-h-[100px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#0F1117] text-white"
                      placeholder="Descreva sua campanha aqui..."
                      value={formData.descricao}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tipoCampanha" className="text-white mb-2 block">
                    Tipo de Campanha
                  </Label>
                  <Select
                    value={formData.tipoCampanha}
                    onValueChange={(value) => handleRadioChange("tipoCampanha", value)}
                  >
                    <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                      <SelectValue placeholder="Selecione o tipo de campanha" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#171923] border-gray-700 text-white">
                      <SelectItem value="automatico">Automático</SelectItem>
                      <SelectItem value="numeros">Números</SelectItem>
                      <SelectItem value="fazendinha">Fazendinha</SelectItem>
                      <SelectItem value="fazendinhaMetade">Fazendinha Metade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.tipoCampanha === "automatico" && (
                  <div className="grid grid-cols-6 gap-4">
                    {formData.valorCotas.map((cota, index) => (
                      <div key={index}>
                        <Label htmlFor={`valorCota${index + 1}`} className="text-white mb-2 block">
                          Valor opção {index + 1}
                        </Label>
                        <div className="flex">
                          <Input
                            id={`valorCota${index + 1}`}
                            name={`valorCota${index + 1}`}
                            value={cota.valor}
                            onChange={(e) => {
                              const newValorCotas = [...formData.valorCotas]
                              newValorCotas[index].valor = e.target.value
                              setFormData((prev) => ({ ...prev, valorCotas: newValorCotas }))
                            }}
                            className="bg-[#0F1117] border-gray-700 text-white"
                          />
                          <div className="ml-2 flex items-center">
                            <Input type="checkbox" className="h-4 w-4" checked={true} readOnly />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInicio" className="text-white mb-2 block">
                      Data e hora da campanha
                    </Label>
                    <Input
                      id="dataInicio"
                      name="dataInicio"
                      type="datetime-local"
                      className="bg-[#0F1117] border-gray-700 text-white [color-scheme:dark]"
                      value={formData.dataInicio}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="campanhaPrivada" className="text-white">
                        Campanha privada?
                      </Label>
                      <div className="flex space-x-2">
                        <Button
                          variant={formData.campanhaPrivada ? "outline" : "default"}
                          className={`${formData.campanhaPrivada ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                          onClick={() => handleSwitchChange("campanhaPrivada", false)}
                        >
                          NÃO
                        </Button>
                        <Button
                          variant={!formData.campanhaPrivada ? "outline" : "default"}
                          className={`${!formData.campanhaPrivada ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                          onClick={() => handleSwitchChange("campanhaPrivada", true)}
                        >
                          SIM
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label htmlFor="destaque" className="text-white">
                        Destaque?
                      </Label>
                      <div className="flex space-x-2">
                        <Button
                          variant={formData.destaque ? "outline" : "default"}
                          className={`${formData.destaque ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                          onClick={() => handleSwitchChange("destaque", false)}
                        >
                          NÃO
                        </Button>
                        <Button
                          variant={!formData.destaque ? "outline" : "default"}
                          className={`${!formData.destaque ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                          onClick={() => handleSwitchChange("destaque", true)}
                        >
                          SIM
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.tipoCampanha !== "fazendinha" && formData.tipoCampanha !== "fazendinhaMetade" && (
                    <div>
                      <Label htmlFor="quantidadeNumeros" className="text-white mb-2 block">
                        Quantidade de números
                      </Label>
                      <Select
                        defaultValue={formData.quantidadeNumeros}
                        onValueChange={(value) => handleRadioChange("quantidadeNumeros", value)}
                      >
                        <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                          <SelectValue placeholder="Selecione a quantidade" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#171923] border-gray-700 text-white max-h-60 overflow-y-auto">
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="500">500</SelectItem>
                          <SelectItem value="1000">1.000</SelectItem>
                          <SelectItem value="5000">5.000</SelectItem>
                          <SelectItem value="10000">10.000</SelectItem>
                          <SelectItem value="50000">50.000</SelectItem>
                          <SelectItem value="100000">100.000</SelectItem>
                          <SelectItem value="500000">500.000</SelectItem>
                          <SelectItem value="1000000">1.000.000</SelectItem>
                          <SelectItem value="5000000">5.000.000</SelectItem>
                          <SelectItem value="10000000">10.000.000</SelectItem>
                          <SelectItem value="15000000">15.000.000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="valorPorCota" className="text-white mb-2 block">
                      Valor por cota
                    </Label>
                    <Input
                      id="valorPorCota"
                      name="valorPorCota"
                      placeholder="10.00"
                      className="bg-[#0F1117] border-gray-700 text-white"
                      value={formData.valorPorCota}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tempoParaPagamento" className="text-white mb-2 block">
                      Tempo para pagamento
                    </Label>
                    <Select
                      defaultValue={formData.tempoParaPagamento}
                      onValueChange={(value) => handleRadioChange("tempoParaPagamento", value)}
                    >
                      <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#171923] border-gray-700 text-white">
                        <SelectItem value="15min">15 minutos</SelectItem>
                        <SelectItem value="30min">30 minutos</SelectItem>
                        <SelectItem value="1h">1 hora</SelectItem>
                        <SelectItem value="2h">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.tipoCampanha === "automatico" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="quantidadeLimiteCompra" className="text-white mb-2 block">
                          Quantidade limite de compras por usuário
                        </Label>
                        <Input
                          id="quantidadeLimiteCompra"
                          name="quantidadeLimiteCompra"
                          placeholder="0"
                          className="bg-[#0F1117] border-gray-700 text-white"
                          value={formData.quantidadeLimiteCompra}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="quantidadeMinima" className="text-white mb-2 block">
                          Quantidade mínima de números comprados por vez
                        </Label>
                        <Input
                          id="quantidadeMinima"
                          name="quantidadeMinima"
                          placeholder="1"
                          className="bg-[#0F1117] border-gray-700 text-white"
                          value={formData.quantidadeMinima || "1"}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="quantidadeMaximaCompra" className="text-white mb-2 block">
                          Quantidade máxima de números comprados por vez
                        </Label>
                        <Input
                          id="quantidadeMaximaCompra"
                          name="quantidadeMaximaCompra"
                          placeholder="500"
                          className="bg-[#0F1117] border-gray-700 text-white"
                          value={formData.quantidadeMaximaCompra}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="statusExibicao" className="text-white mb-2 block">
                          Status de exibição
                        </Label>
                        <Select
                          defaultValue={formData.statusExibicao || "adquira"}
                          onValueChange={(value) => handleRadioChange("statusExibicao", value)}
                        >
                          <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                            <SelectValue placeholder="Selecione o status de exibição" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#171923] border-gray-700 text-white">
                            <SelectItem value="adquira">Adquira já!</SelectItem>
                            <SelectItem value="acabando">Corre que está acabando!</SelectItem>
                            <SelectItem value="aguarde">Aguarde a campanha!</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                            <SelectItem value="embreve">Em breve!</SelectItem>
                            <SelectItem value="sorteio">Aguarde o sorteio!</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="statusCampanha" className="text-white mb-2 block">
                          Status da campanha
                        </Label>
                        <Select
                          defaultValue={formData.statusCampanha}
                          onValueChange={(value) => handleRadioChange("statusCampanha", value)}
                        >
                          <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                            <SelectValue placeholder="Selecione o status da campanha" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#171923] border-gray-700 text-white">
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Pausado">Pausado</SelectItem>
                            <SelectItem value="Finalizado">Finalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {formData.tipoCampanha === "numeros" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="statusExibicao" className="text-white mb-2 block">
                        Status de exibição
                      </Label>
                      <Select
                        defaultValue={formData.statusExibicao || "adquira"}
                        onValueChange={(value) => handleRadioChange("statusExibicao", value)}
                      >
                        <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                          <SelectValue placeholder="Selecione o status de exibição" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#171923] border-gray-700 text-white">
                          <SelectItem value="adquira">Adquira já!</SelectItem>
                          <SelectItem value="acabando">Corre que está acabando!</SelectItem>
                          <SelectItem value="aguarde">Aguarde a campanha!</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="embreve">Em breve!</SelectItem>
                          <SelectItem value="sorteio">Aguarde o sorteio!</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="statusCampanha" className="text-white mb-2 block">
                        Status da campanha
                      </Label>
                      <Select
                        defaultValue={formData.statusCampanha}
                        onValueChange={(value) => handleRadioChange("statusCampanha", value)}
                      >
                        <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                          <SelectValue placeholder="Selecione o status da campanha" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#171923] border-gray-700 text-white">
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Pausado">Pausado</SelectItem>
                          <SelectItem value="Finalizado">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {(formData.tipoCampanha === "fazendinha" || formData.tipoCampanha === "fazendinhaMetade") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="statusExibicao" className="text-white mb-2 block">
                        Status de exibição
                      </Label>
                      <Select
                        value={formData.statusExibicao || "adquira"}
                        onValueChange={(value) => handleRadioChange("statusExibicao", value)}
                      >
                        <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                          <SelectValue placeholder="Selecione o status de exibição" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#171923] border-gray-700 text-white">
                          <SelectItem value="adquira">Adquira já!</SelectItem>
                          <SelectItem value="acabando">Corre que está acabando!</SelectItem>
                          <SelectItem value="aguarde">Aguarde a campanha!</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="embreve">Em breve!</SelectItem>
                          <SelectItem value="sorteio">Aguarde o sorteio!</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="statusCampanha" className="text-white mb-2 block">
                        Status da campanha
                      </Label>
                      <Select
                        value={formData.statusCampanha}
                        onValueChange={(value) => handleRadioChange("statusCampanha", value)}
                      >
                        <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                          <SelectValue placeholder="Selecione o status da campanha" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#171923] border-gray-700 text-white">
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Pausado">Pausado</SelectItem>
                          <SelectItem value="Finalizado">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    className="bg-[#FFB800] hover:bg-[#FFA500] text-black"
                    onClick={() => setActiveTab("imagens")}
                  >
                    Salvar
                  </Button>
                </div>
              </TabsContent>

              {/* Tab Imagens */}
              <TabsContent value="imagens" className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Imagem principal</Label>
                  <p className="text-xs text-gray-400 mb-2">Tamanho recomendado: 500x500px. Formatos: JPG, PNG, GIF ou WebP.</p>
                  <input
                    ref={imagemPrincipalRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImagemPrincipal}
                  />
                  {imagemPrincipalPreview ? (
                    <div className="relative rounded-md overflow-hidden border border-gray-600 bg-[#0F1117]">
                      <img
                        src={imagemPrincipalPreview}
                        alt="Preview principal"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removerImagemPrincipal}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border border-dashed border-gray-600 rounded-md p-6 flex flex-col items-center justify-center bg-[#0F1117] cursor-pointer hover:bg-[#1A1E2A] transition-colors"
                      onClick={() => imagemPrincipalRef.current?.click()}
                    >
                      <div className="bg-[#FFB800] rounded-full p-2 mb-2">
                        <ImageIcon className="h-6 w-6 text-black" />
                      </div>
                      <p className="text-sm text-gray-400">Clique para adicionar imagem</p>
                      <p className="text-xs text-gray-500">JPG, GIF, PNG ou WebP</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-white mb-2 block">Galeria de imagens</Label>
                  <p className="text-xs text-gray-400 mb-2">Tamanho recomendado: 350x350px. Formatos: JPG, PNG, GIF ou WebP.</p>
                  <input
                    ref={imagensGaleriaRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleImagensGaleria}
                  />
                  {imagensAdicionaisPreview.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {imagensAdicionaisPreview.map((img, index) => (
                        <div key={index} className="relative rounded-md overflow-hidden border border-gray-600 bg-[#0F1117]">
                          <img
                            src={img}
                            alt={`Galeria ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removerImagemGaleria(index)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className="border border-dashed border-gray-600 rounded-md p-6 flex flex-col items-center justify-center bg-[#0F1117] cursor-pointer hover:bg-[#1A1E2A] transition-colors"
                    onClick={() => imagensGaleriaRef.current?.click()}
                  >
                    <div className="bg-[#FFB800] rounded-full p-2 mb-2">
                      <ImageIcon className="h-6 w-6 text-black" />
                    </div>
                    <p className="text-sm text-gray-400">Clique para adicionar imagens</p>
                    <p className="text-xs text-gray-500">JPG, GIF, PNG ou WebP - Selecione multiplas</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-[#FFB800] hover:bg-[#FFA500] text-black"
                    onClick={() => setActiveTab("descontos")}
                  >
                    Continuar
                  </Button>
                </div>
              </TabsContent>

              {/* Tab Descontos */}
              <TabsContent value="descontos" className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Utilizar descontos nessa campanha?</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={formData.habilitarDesconto ? "outline" : "default"}
                      className={`${formData.habilitarDesconto ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarDesconto", false)}
                    >
                      NÃO
                    </Button>
                    <Button
                      variant={!formData.habilitarDesconto ? "outline" : "default"}
                      className={`${formData.habilitarDesconto ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarDesconto", true)}
                    >
                      SIM
                    </Button>
                  </div>
                </div>

                {formData.habilitarDesconto && (
                  <>
                    {descontos.length < 100 && (
                      <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black mb-4" onClick={adicionarDesconto}>
                        Adicionar desconto
                      </Button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {descontos.map((desconto) => (
                        <div key={desconto.id} className="bg-[#0F1117] border border-gray-700 rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium flex items-center">
                              <span className="flex items-center justify-center bg-[#FFB800] text-black rounded-full w-5 h-5 text-xs mr-2">
                                {desconto.id}
                              </span>
                              Desconto
                            </span>
                          </div>
                          <div className="mb-4">
                            <Label className="text-white text-sm mb-1 block">Quantidade de cotas:</Label>
                            <Input
                              placeholder={`${desconto.id * 10}`}
                              className="bg-[#0F1117] border-gray-700 text-white mb-2"
                              value={desconto.quantidadeCotas}
                              onChange={(e) => handleDescontoChange(desconto.id, "quantidadeCotas", e.target.value)}
                            />
                          </div>
                          <div className="mb-4">
                            <Label className="text-white text-sm mb-1 block">Valor do desconto:</Label>
                            <Input
                              placeholder={`${desconto.id}.00`}
                              className="bg-[#0F1117] border-gray-700 text-white"
                              value={desconto.valorDesconto}
                              onChange={(e) => handleDescontoChange(desconto.id, "valorDesconto", e.target.value)}
                            />
                          </div>
                          <Button
                            variant="outline"
                            className="w-full border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800] hover:text-black"
                            onClick={() => removerDesconto(desconto.id)}
                          >
                            Remover desconto
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <Button
                    className="bg-[#FFB800] hover:bg-[#FFA500] text-black"
                    onClick={() => setActiveTab("ranking")}
                  >
                    Salvar
                  </Button>
                </div>
              </TabsContent>

              {/* Tab Ranking */}
              <TabsContent value="ranking" className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Habilitar ranking?</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={formData.habilitarRanking ? "outline" : "default"}
                      className={`${formData.habilitarRanking ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarRanking", false)}
                    >
                      NÃO
                    </Button>
                    <Button
                      variant={!formData.habilitarRanking ? "outline" : "default"}
                      className={`${!formData.habilitarRanking ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarRanking", true)}
                    >
                      SIM
                    </Button>
                  </div>
                </div>

                {formData.habilitarRanking && (
                  <>
                    <div>
                      <Label className="text-white mb-2 block">Mostrar nomes de últimos compradores?</Label>
                      <div className="flex space-x-2">
                        <Button
                          variant={formData.mostrarNomes ? "outline" : "default"}
                          className={`${formData.mostrarNomes ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                          onClick={() => handleSwitchChange("mostrarNomes", false)}
                        >
                          NÃO
                        </Button>
                        <Button
                          variant={!formData.mostrarNomes ? "outline" : "default"}
                          className={`${!formData.mostrarNomes ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                          onClick={() => handleSwitchChange("mostrarNomes", true)}
                        >
                          SIM
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tipoRanking" className="text-white mb-2 block">
                        Tipo de Ranking
                      </Label>
                      <Select
                        defaultValue={formData.tipoRanking}
                        onValueChange={(value) => handleRadioChange("tipoRanking", value)}
                      >
                        <SelectTrigger className="bg-[#0F1117] border-gray-700 text-white">
                          <SelectValue placeholder="Total" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#171923] border-gray-700 text-white">
                          <SelectItem value="total">Total</SelectItem>
                          <SelectItem value="diario">Diário</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantidadeCompradores" className="text-white mb-2 block">
                        Deseja mostrar quantos compradores?
                      </Label>
                      <Input
                        id="quantidadeCompradores"
                        name="quantidadeCompradores"
                        placeholder="10"
                        className="bg-[#0F1117] border-gray-700 text-white"
                        value={formData.quantidadeCompradores}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="mensagemPromocao" className="text-white mb-2 block">
                        Mensagem na promoção do ranking *
                      </Label>
                      <Input
                        id="mensagemPromocao"
                        name="mensagemPromocao"
                        placeholder="Quem comprar mais cotas, ganha um iPhone 15"
                        className="bg-[#0F1117] border-gray-700 text-white"
                        value={formData.mensagemPromocao}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => setActiveTab("barra")}>
                    Salvar
                  </Button>
                </div>
              </TabsContent>

              {/* Tab Barra de Progresso */}
              <TabsContent value="barra" className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Exibir barra de progresso?</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={formData.exibirBarraProgresso ? "outline" : "default"}
                      className={`${formData.exibirBarraProgresso ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("exibirBarraProgresso", false)}
                    >
                      NÃO
                    </Button>
                    <Button
                      variant={!formData.exibirBarraProgresso ? "outline" : "default"}
                      className={`${!formData.exibirBarraProgresso ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("exibirBarraProgresso", true)}
                    >
                      SIM
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-[#FFB800] hover:bg-[#FFA500] text-black"
                    onClick={() => setActiveTab("ganhador")}
                  >
                    Salvar
                  </Button>
                </div>
              </TabsContent>

              {/* Tab Ganhador */}
              <TabsContent value="ganhador" className="space-y-4">
                <div>
                  <Button
                    className="bg-[#FFB800] hover:bg-[#FFA500] text-black mb-4"
                    onClick={() => handleSwitchChange("habilitarGanhador", true)}
                  >
                    Habilitar ganhador
                  </Button>

                  {formData.habilitarGanhador && (
                    <>
                      <div>
                        <Label htmlFor="nomeGanhador" className="text-white mb-2 block">
                          Informe o ganhador - 1º prêmio
                        </Label>
                        <Input
                          id="nomeGanhador"
                          name="nomeGanhador"
                          placeholder="Telefone do ganhador"
                          className="bg-[#0F1117] border-gray-700 text-white mb-4"
                          value={formData.nomeGanhador}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="numeroSorteado" className="text-white mb-2 block">
                          Informe/Selecione o número - 1º prêmio
                        </Label>
                        <Input
                          id="numeroSorteado"
                          name="numeroSorteado"
                          placeholder="Número do grupo sorteado"
                          className="bg-[#0F1117] border-gray-700 text-white"
                          value={formData.numeroSorteado}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => setActiveTab("cotas")}>
                    Salvar
                  </Button>
                </div>
              </TabsContent>

              {/* Tab Cotas Premiadas */}
              <TabsContent value="cotas" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2 block">Habilitar Cotas Premiadas</Label>
                    <div className="flex space-x-2 mb-4">
                      <Button
                        variant={formData.cotasPremiadas ? "outline" : "default"}
                        className={`${formData.cotasPremiadas ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                        onClick={() => handleSwitchChange("cotasPremiadas", false)}
                      >
                        NÃO
                      </Button>
                      <Button
                        variant={!formData.cotasPremiadas ? "outline" : "default"}
                        className={`${!formData.cotasPremiadas ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                        onClick={() => handleSwitchChange("cotasPremiadas", true)}
                      >
                        SIM
                      </Button>
                    </div>
                  </div>
                  {formData.cotasPremiadas ? (
                    <div>
                      <Label className="text-white mb-2 block">Cotas Premiadas</Label>
                      <p className="text-gray-400 text-sm mb-3">
                        Adicione cada cota premiada individualmente. Para cada cota, defina o número e o prêmio
                        específico.
                      </p>
                      <Button
                        type="button"
                        className="bg-[#FFB800] hover:bg-[#FFA500] text-black mb-4"
                        onClick={adicionarCotaPremiada}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar cota premiada
                      </Button>

                      {cotasPremiadasLista.length === 0 ? (
                        <div className="border border-dashed border-gray-600 rounded-lg p-6 text-center text-gray-400">
                          Nenhuma cota premiada cadastrada. Clique em &quot;Adicionar cota premiada&quot; para começar.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {cotasPremiadasLista.map((cota) => (
                            <div
                              key={cota.id}
                              className="flex flex-wrap items-center gap-3 bg-[#0F1117] border border-gray-700 rounded-lg p-3"
                            >
                              <div className="flex-1 min-w-[120px]">
                                <Label className="text-gray-400 text-xs">Número</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  className="bg-black/30 border-gray-700 text-white mt-1"
                                  value={cota.numero}
                                  onChange={(e) =>
                                    atualizarCotaPremiada(cota.id, "numero", parseInt(e.target.value, 10) || 1)
                                  }
                                />
                              </div>
                              <div className="flex-[2] min-w-[180px]">
                                <Label className="text-gray-400 text-xs">Prêmio</Label>
                                <Input
                                  className="bg-black/30 border-gray-700 text-white mt-1"
                                  placeholder="Ex: R$ 100,00 em PIX"
                                  value={cota.premio}
                                  onChange={(e) => atualizarCotaPremiada(cota.id, "premio", e.target.value)}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="mt-6 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                onClick={() => removerCotaPremiada(cota.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                <div>
                  <Label className="text-white mb-2 block">Habilitar bloqueio de cotas?</Label>
                  <p className="text-gray-400 text-sm mb-2">
                    Cotas bloqueadas nunca são vendidas nem sorteadas. Libere quando atingir margem de lucro.
                  </p>
                  <div className="flex space-x-2 mb-4">
                    <Button
                      variant={formData.habilitarBloqueioCotas ? "outline" : "default"}
                      className={`${formData.habilitarBloqueioCotas ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarBloqueioCotas", false)}
                    >
                      NÃO
                    </Button>
                    <Button
                      variant={!formData.habilitarBloqueioCotas ? "outline" : "default"}
                      className={`${!formData.habilitarBloqueioCotas ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarBloqueioCotas", true)}
                    >
                      SIM
                    </Button>
                  </div>
                  {formData.habilitarBloqueioCotas ? (
                    <div className="mt-4 space-y-2">
                      <Label className="text-gray-400 text-sm">Cotas bloqueadas (nunca vendidas/sorteadas)</Label>
                      <div className="flex gap-2 flex-wrap">
                        <Input
                          ref={inputCotaBloqueadaRef}
                          type="number"
                          min={1}
                          placeholder="Número da cota"
                          className="bg-[#0F1117] border-gray-700 text-white w-32"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              const v = (e.target as HTMLInputElement).value
                              adicionarCotaBloqueada(parseInt(v, 10))
                              ;(e.target as HTMLInputElement).value = ""
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#FFB800] hover:bg-[#FFA500] text-black"
                          onClick={() => {
                            const input = inputCotaBloqueadaRef.current
                            if (input) {
                              adicionarCotaBloqueada(parseInt(input.value, 10))
                              input.value = ""
                            }
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                      {cotasBloqueadas.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {cotasBloqueadas.map((n) => (
                            <span
                              key={n}
                              className="inline-flex items-center gap-1 bg-red-500/20 border border-red-500/50 rounded px-2 py-1 text-sm text-red-300"
                            >
                              {n}
                              <button
                                type="button"
                                onClick={() => removerCotaBloqueada(n)}
                                className="hover:bg-red-500/30 rounded p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Nenhuma cota bloqueada. Adicione os números que não devem ser vendidos nem sorteados.</p>
                      )}
                    </div>
                  ) : null}
                </div>

                <div>
                  <Label className="text-white mb-2 block">Habilitar Maior/Menor Cota?</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={formData.habilitarMaiorMenorCota ? "outline" : "default"}
                      className={`${formData.habilitarMaiorMenorCota ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarMaiorMenorCota", false)}
                    >
                      NÃO
                    </Button>
                    <Button
                      variant={!formData.habilitarMaiorMenorCota ? "outline" : "default"}
                      className={`${!formData.habilitarMaiorMenorCota ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarMaiorMenorCota", true)}
                    >
                      SIM
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Maior/Menor Cota Diária?</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={formData.habilitarMaiorMenorCotaDiaria ? "outline" : "default"}
                      className={`${formData.habilitarMaiorMenorCotaDiaria ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarMaiorMenorCotaDiaria", false)}
                    >
                      NÃO
                    </Button>
                    <Button
                      variant={!formData.habilitarMaiorMenorCotaDiaria ? "outline" : "default"}
                      className={`${!formData.habilitarMaiorMenorCotaDiaria ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarMaiorMenorCotaDiaria", true)}
                    >
                      SIM
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Habilitar Roleta?</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={formData.habilitarRoleta ? "outline" : "default"}
                      className={`${formData.habilitarRoleta ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarRoleta", false)}
                    >
                      NÃO
                    </Button>
                    <Button
                      variant={!formData.habilitarRoleta ? "outline" : "default"}
                      className={`${!formData.habilitarRoleta ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarRoleta", true)}
                    >
                      SIM
                    </Button>
                  </div>
                  {formData.habilitarRoleta ? (
                    <div className="mt-4 space-y-3">
                      <div>
                        <Label className="text-gray-400 text-sm">Valor por giro (R$)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          name="roletaValorGiro"
                          className="bg-[#0F1117] border-gray-700 text-white mt-1 w-32"
                          value={formData.roletaValorGiro}
                          onChange={(e) => setFormData((p) => ({ ...p, roletaValorGiro: Number(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm mb-2 block">Pacotes Promocionais (ex: 5 giros por R$10)</Label>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#FFB800] hover:bg-[#FFA500] text-black mb-2"
                          onClick={adicionarPacoteRoleta}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar pacote
                        </Button>
                        {pacotesRoleta.length === 0 ? (
                          <p className="text-xs text-gray-500">Nenhum pacote cadastrado</p>
                        ) : (
                          <div className="space-y-2">
                            {pacotesRoleta.map((pacote) => (
                              <div
                                key={pacote.id}
                                className="flex flex-wrap items-center gap-2 bg-[#0F1117] border border-gray-700 rounded p-2"
                              >
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="Quantidade"
                                  className="bg-black/30 border-gray-700 text-white w-24 text-sm"
                                  value={pacote.quantidade}
                                  onChange={(e) =>
                                    atualizarPacoteRoleta(pacote.id, "quantidade", parseInt(e.target.value, 10) || 1)
                                  }
                                />
                                <span className="text-gray-400 text-sm">giros por</span>
                                <Input
                                  type="number"
                                  min={0}
                                  step={0.5}
                                  placeholder="Valor"
                                  className="bg-black/30 border-gray-700 text-white w-24 text-sm"
                                  value={pacote.valor}
                                  onChange={(e) =>
                                    atualizarPacoteRoleta(pacote.id, "valor", parseFloat(e.target.value) || 0)
                                  }
                                />
                                <span className="text-gray-400 text-sm">R$</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  onClick={() => removerPacoteRoleta(pacote.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm mb-2 block">Prêmios da roleta (nome, probabilidade %, ícone)</Label>
                        <p className="text-xs text-gray-500 mb-2">Marque &quot;Dá cota para sorteio&quot; para prêmios que dão uma cota aleatória ao cliente. Se a cota vencedora do sorteio for a dele, ganha prêmio principal + este.</p>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#FFB800] hover:bg-[#FFA500] text-black mb-2"
                          onClick={adicionarPremioRoleta}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar prêmio
                        </Button>
                        {premiosRoleta.length === 0 ? (
                          <p className="text-xs text-gray-500">Nenhum prêmio. Use os padrões ou adicione.</p>
                        ) : (
                          <div className="space-y-2">
                            {premiosRoleta.map((p) => (
                              <div
                                key={p.id}
                                className="flex flex-wrap items-center gap-2 bg-[#0F1117] border border-gray-700 rounded p-2"
                              >
                                <Input
                                  placeholder="Nome"
                                  className="bg-black/30 border-gray-700 text-white w-32 text-sm"
                                  value={p.nome}
                                  onChange={(e) => atualizarPremioRoleta(p.id, "nome", e.target.value)}
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="%"
                                  className="bg-black/30 border-gray-700 text-white w-16 text-sm"
                                  value={p.probabilidade}
                                  onChange={(e) => atualizarPremioRoleta(p.id, "probabilidade", parseInt(e.target.value, 10) || 0)}
                                />
                                <Input
                                  placeholder="Ícone"
                                  className="bg-black/30 border-gray-700 text-white w-12 text-sm"
                                  value={p.icone || ""}
                                  onChange={(e) => atualizarPremioRoleta(p.id, "icone", e.target.value)}
                                />
                                <label className="flex items-center gap-1 text-xs text-gray-400">
                                  <input
                                    type="checkbox"
                                    checked={!!p.daCotaParaSorteio}
                                    onChange={(e) => atualizarPremioRoleta(p.id, "daCotaParaSorteio", e.target.checked)}
                                  />
                                  Dá cota para sorteio
                                </label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  onClick={() => removerPremioRoleta(p.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <Label className="text-white mb-2 block">Habilitar Box?</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={formData.habilitarBox ? "outline" : "default"}
                      className={`${formData.habilitarBox ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarBox", false)}
                    >
                      NÃO
                    </Button>
                    <Button
                      variant={!formData.habilitarBox ? "outline" : "default"}
                      className={`${!formData.habilitarBox ? "bg-transparent text-white border-gray-700" : "bg-[#FFB800] text-black"} h-8 px-3`}
                      onClick={() => handleSwitchChange("habilitarBox", true)}
                    >
                      SIM
                    </Button>
                  </div>
                  {formData.habilitarBox ? (
                    <div className="mt-4 space-y-3">
                      <div>
                        <Label className="text-gray-400 text-sm">Valor por abertura (R$)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          name="boxValorAbertura"
                          className="bg-[#0F1117] border-gray-700 text-white mt-1 w-32"
                          value={formData.boxValorAbertura}
                          onChange={(e) => setFormData((p) => ({ ...p, boxValorAbertura: Number(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm mb-2 block">Pacotes Promocionais (ex: 3 aberturas por R$10)</Label>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#FFB800] hover:bg-[#FFA500] text-black mb-2"
                          onClick={adicionarPacoteBox}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar pacote
                        </Button>
                        {pacotesBox.length === 0 ? (
                          <p className="text-xs text-gray-500">Nenhum pacote cadastrado</p>
                        ) : (
                          <div className="space-y-2">
                            {pacotesBox.map((pacote) => (
                              <div
                                key={pacote.id}
                                className="flex flex-wrap items-center gap-2 bg-[#0F1117] border border-gray-700 rounded p-2"
                              >
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="Quantidade"
                                  className="bg-black/30 border-gray-700 text-white w-24 text-sm"
                                  value={pacote.quantidade}
                                  onChange={(e) =>
                                    atualizarPacoteBox(pacote.id, "quantidade", parseInt(e.target.value, 10) || 1)
                                  }
                                />
                                <span className="text-gray-400 text-sm">aberturas por</span>
                                <Input
                                  type="number"
                                  min={0}
                                  step={0.5}
                                  placeholder="Valor"
                                  className="bg-black/30 border-gray-700 text-white w-24 text-sm"
                                  value={pacote.valor}
                                  onChange={(e) =>
                                    atualizarPacoteBox(pacote.id, "valor", parseFloat(e.target.value) || 0)
                                  }
                                />
                                <span className="text-gray-400 text-sm">R$</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  onClick={() => removerPacoteBox(pacote.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm mb-2 block">Prêmios do box (nome, probabilidade %, ícone)</Label>
                        <p className="text-xs text-gray-500 mb-2">Marque &quot;Dá cota para sorteio&quot; para prêmios que dão uma cota aleatória ao cliente. Se a cota vencedora do sorteio for a dele, ganha prêmio principal + este.</p>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#FFB800] hover:bg-[#FFA500] text-black mb-2"
                          onClick={adicionarPremioBox}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar prêmio
                        </Button>
                        {premiosBox.length === 0 ? (
                          <p className="text-xs text-gray-500">Nenhum prêmio. Use os padrões ou adicione.</p>
                        ) : (
                          <div className="space-y-2">
                            {premiosBox.map((p) => (
                              <div
                                key={p.id}
                                className="flex flex-wrap items-center gap-2 bg-[#0F1117] border border-gray-700 rounded p-2"
                              >
                                <Input
                                  placeholder="Nome"
                                  className="bg-black/30 border-gray-700 text-white w-32 text-sm"
                                  value={p.nome}
                                  onChange={(e) => atualizarPremioBox(p.id, "nome", e.target.value)}
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="%"
                                  className="bg-black/30 border-gray-700 text-white w-16 text-sm"
                                  value={p.probabilidade}
                                  onChange={(e) => atualizarPremioBox(p.id, "probabilidade", parseInt(e.target.value, 10) || 0)}
                                />
                                <Input
                                  placeholder="Ícone"
                                  className="bg-black/30 border-gray-700 text-white w-12 text-sm"
                                  value={p.icone || ""}
                                  onChange={(e) => atualizarPremioBox(p.id, "icone", e.target.value)}
                                />
                                <label className="flex items-center gap-1 text-xs text-gray-400">
                                  <input
                                    type="checkbox"
                                    checked={!!p.daCotaParaSorteio}
                                    onChange={(e) => atualizarPremioBox(p.id, "daCotaParaSorteio", e.target.checked)}
                                  />
                                  Dá cota para sorteio
                                </label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  onClick={() => removerPremioBox(p.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-[#FFB800] hover:bg-[#FFA500] text-black"
                    onClick={handleSubmit}
                    disabled={isSaving || saveSuccess}
                  >
                    {conteudoSalvarAba}
                  </Button>
                </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Botao global de salvar campanha */}
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-700">
              <Button
                variant="outline"
                className="mr-3 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => router.push("/admin/campanhas")}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#FFB800] hover:bg-[#FFA500] text-black min-w-[200px]"
                onClick={handleSubmit}
                disabled={isSaving || saveSuccess}
              >
                {conteudoSalvarGlobal}
              </Button>
            </div>
          </div>
        </div>

        {/* Toast de sucesso */}
        {saveSuccess && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="h-5 w-5" />
            <span>{isEditMode ? "Campanha atualizada com sucesso!" : "Campanha criada com sucesso!"} Redirecionando...</span>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function NovaCampanhaPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
      <NovaCampanhaContent />
    </Suspense>
  )
}
