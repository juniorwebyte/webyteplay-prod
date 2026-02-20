"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Minus, Plus, Shuffle, Hash } from "lucide-react"
import PagamentoPix from "@/components/pagamento-pix"
import { criarPedido, obterGatewayConfig, adicionarPedidoLocal, listarPedidos, type Pedido } from "@/lib/gateway-store"
import { atualizarCampanha, buscarCampanha, type Campanha } from "@/lib/campanhas-store"
import { isTipoNumerosManuais } from "@/lib/tipos-campanha"
import { BICHOS, BICHOS_ICONS, dezenaParaNumero } from "@/lib/jogo-do-bicho"
import { formatarCPF, formatarTelefone, formatarValor } from "@/lib/formatadores"

interface SelecionarCotasProps {
  valorPorCota?: number
  valorCotas?: { numero: number; valor: string }[]
  titulo?: string
  subtitulo?: string
  dataInicio?: string
  campanhaId?: string
  /** Tipo da campanha: automatico, numeros, fazendinha, fazendinhaMetade */
  tipoCampanha?: string
  /** Total de números disponíveis (1 a totalCotas). Obrigatório para tipo "numeros". */
  totalCotas?: number
}

function formatarData(dataStr: string): string {
  if (!dataStr) return ""
  try {
    const d = new Date(dataStr)
    if (isNaN(d.getTime())) return ""
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  } catch {
    return ""
  }
}

function validarCPF(cpf: string): boolean {
  const nums = cpf.replace(/\D/g, "")
  if (nums.length !== 11) return false
  if (/^(\d)\1+$/.test(nums)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(nums.charAt(i)) * (10 - i)
  let resto = 11 - (soma % 11)
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(nums.charAt(9))) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(nums.charAt(i)) * (11 - i)
  resto = 11 - (soma % 11)
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(nums.charAt(10))
}

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const MAX_NUMEROS_NA_GRADE = 2000

export default function SelecionarCotas({
  valorPorCota = 0,
  valorCotas,
  titulo,
  subtitulo,
  dataInicio,
  campanhaId,
  tipoCampanha = "automatico",
  totalCotas = 0,
}: SelecionarCotasProps) {
  const escolhaManual = isTipoNumerosManuais(tipoCampanha) && totalCotas > 0
  const isFazendinha = tipoCampanha === "fazendinha"
  const isFazendinhaMetade = tipoCampanha === "fazendinhaMetade"
  const escolhaFazendinha = isFazendinha || isFazendinhaMetade
  const maxNumeros = Math.min(totalCotas, MAX_NUMEROS_NA_GRADE)

  const [quantidade, setQuantidade] = useState(10)
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([])
  const [numeroInput, setNumeroInput] = useState("")
  /** Fazendinha inteiro: ids dos bichos selecionados. */
  const [bichosSelecionados, setBichosSelecionados] = useState<number[]>([])
  /** Fazendinha metade: por bicho, as 2 dezenas escolhidas (ex.: ["01","02"]). */
  const [metadePorBicho, setMetadePorBicho] = useState<Record<number, string[]>>({})
  const [showPayment, setShowPayment] = useState(false)
  const [pedidoAtual, setPedidoAtual] = useState<Pedido | null>(null)
  const [aceitarTermos, setAceitarTermos] = useState(false)
  const [nomeComprador, setNomeComprador] = useState("")
  const [telefoneComprador, setTelefoneComprador] = useState("")
  const [emailComprador, setEmailComprador] = useState("")
  const [cpfComprador, setCpfComprador] = useState("")
  const [erroGateway, setErroGateway] = useState("")
  const [erros, setErros] = useState<Record<string, string>>({})
  const [campanha, setCampanha] = useState<Campanha | null>(null)

  // Buscar campanha para obter configurações
  useEffect(() => {
    if (campanhaId) {
      const camp = buscarCampanha(campanhaId)
      setCampanha(camp || null)
    }
  }, [campanhaId])

  // Reagir a atualizações de pedidos (para cotasVendidas refletir vendas em tempo real)
  const [pedidosVersion, setPedidosVersion] = useState(0)
  useEffect(() => {
    const handler = () => setPedidosVersion((v) => v + 1)
    window.addEventListener("pedidos-updated", handler)
    return () => window.removeEventListener("pedidos-updated", handler)
  }, [])

  // Obter cotas vendidas para tipo "numeros" e fazendinha
  const cotasVendidas = useMemo(() => {
    if (!campanhaId || (!escolhaManual && !escolhaFazendinha)) return new Set<number>()
    void pedidosVersion // dependência para reexecutar quando pedidos mudarem
    const pedidos = listarPedidos()
    const vendidas = new Set<number>()
    pedidos
      .filter((p) => p.campanhaId === campanhaId && p.status === "pago" && Array.isArray(p.numerosEscolhidos))
      .forEach((p) => {
        p.numerosEscolhidos?.forEach((num) => vendidas.add(num))
      })
    return vendidas
  }, [campanhaId, escolhaManual, escolhaFazendinha, pedidosVersion])

  // Cotas bloqueadas pelo admin (nunca vendidas nem sorteadas)
  const cotasBloqueadasSet = useMemo(() => {
    if (!campanha?.habilitarBloqueioCotas || !Array.isArray(campanha.cotasBloqueadas)) return new Set<number>()
    return new Set(campanha.cotasBloqueadas)
  }, [campanha?.habilitarBloqueioCotas, campanha?.cotasBloqueadas])

  // Maior/Menor cota disponível (exclui vendidas e bloqueadas)
  const maiorMenorCota = useMemo(() => {
    if (!escolhaManual || totalCotas === 0) return { maior: null, menor: null }
    const todasCotas = Array.from({ length: totalCotas }, (_, i) => i + 1)
    const disponiveis = todasCotas.filter((n) => !cotasVendidas.has(n) && !cotasBloqueadasSet.has(n))
    if (disponiveis.length === 0) return { maior: null, menor: null }
    return {
      maior: disponiveis.reduce((a, b) => (a > b ? a : b), -Infinity),
      menor: disponiveis.reduce((a, b) => (a < b ? a : b), Infinity),
    }
  }, [escolhaManual, totalCotas, cotasVendidas, cotasBloqueadasSet])

  // Maior/Menor cota vendida hoje
  const maiorMenorCotaHoje = useMemo(() => {
    if (!campanhaId) return { maior: null, menor: null }
    const hoje = new Date().toISOString().split("T")[0]
    const pedidos = listarPedidos()
    const vendidasHoje = new Set<number>()
    pedidos
      .filter(
        (p) =>
          p.campanhaId === campanhaId &&
          p.status === "pago" &&
          p.pagoEm &&
          p.pagoEm.startsWith(hoje) &&
          Array.isArray(p.numerosEscolhidos)
      )
      .forEach((p) => {
        p.numerosEscolhidos?.forEach((num) => vendidasHoje.add(num))
      })
    if (vendidasHoje.size === 0) return { maior: null, menor: null }
    const arr = Array.from(vendidasHoje)
    return {
      maior: arr.reduce((a, b) => (a > b ? a : b), -Infinity),
      menor: arr.reduce((a, b) => (a < b ? a : b), Infinity),
    }
  }, [campanhaId])

  const opcoes = valorCotas && valorCotas.length > 0
    ? valorCotas.map((v) => parseInt(v.valor) || 0).filter((n) => n > 0)
    : [10, 20, 50, 100, 200, 300]

  const handleQuantidadeChange = (value: number) => {
    const max = escolhaManual ? totalCotas : 1000
    if (value >= 1 && value <= max) {
      setQuantidade(value)
      if (escolhaManual && numerosSelecionados.length > value) {
        setNumerosSelecionados((prev) => prev.slice(0, value).sort((a, b) => a - b))
      }
    }
  }

  const toggleNumero = (n: number) => {
    if (!escolhaManual) return
    if (cotasBloqueadasSet.has(n)) {
      setErroGateway(`A cota ${n} está bloqueada e não pode ser vendida.`)
      return
    }
    if (cotasVendidas.has(n)) {
      setErroGateway(`A cota ${n} já foi vendida.`)
      return
    }
    setNumerosSelecionados((prev) => {
      const idx = prev.indexOf(n)
      if (idx >= 0) return prev.filter((_, i) => i !== idx)
      if (prev.length >= quantidade) return prev
      return [...prev, n].sort((a, b) => a - b)
    })
  }

  const adicionarNumeroInput = () => {
    const num = parseInt(numeroInput, 10)
    if (isNaN(num) || num < 1 || num > totalCotas) return
    if (numerosSelecionados.includes(num)) return
    if (numerosSelecionados.length >= quantidade) return
    if (cotasBloqueadasSet.has(num)) {
      setErroGateway(`A cota ${num} está bloqueada e não pode ser vendida.`)
      setNumeroInput("")
      return
    }
    if (cotasVendidas.has(num)) {
      setErroGateway(`A cota ${num} já foi vendida.`)
      setNumeroInput("")
      return
    }
    setNumerosSelecionados((prev) => [...prev, num].sort((a, b) => a - b))
    setNumeroInput("")
  }

  /** Verifica se um bicho inteiro está vendido (qualquer um dos 4 números já vendido). */
  const bichoInteiroVendido = (bichoId: number): boolean => {
    const b = BICHOS.find((x) => x.id === bichoId)
    if (!b) return false
    return b.dezenas.some((d) => cotasVendidas.has(dezenaParaNumero(d)))
  }

  /** Verifica se uma dezena específica já foi vendida (para meio bicho). */
  const dezenaVendida = (dezena: string): boolean => cotasVendidas.has(dezenaParaNumero(dezena))

  const toggleBichoInteiro = (bichoId: number) => {
    if (bichoInteiroVendido(bichoId)) {
      setErroGateway("Este bicho já foi vendido. Escolha outro.")
      return
    }
    setBichosSelecionados((prev) =>
      prev.includes(bichoId) ? prev.filter((id) => id !== bichoId) : [...prev, bichoId].sort((a, b) => a - b)
    )
    setErroGateway("")
  }

  const toggleDezenaMetade = (bichoId: number, dezena: string) => {
    if (dezenaVendida(dezena)) {
      setErroGateway("Este número já foi vendido. Escolha outro.")
      return
    }
    setMetadePorBicho((prev) => {
      const atual = prev[bichoId] || []
      const idx = atual.indexOf(dezena)
      let next: string[]
      if (idx >= 0) {
        next = atual.filter((_, i) => i !== idx)
      } else {
        if (atual.length >= 2) return prev
        next = [...atual, dezena].sort()
      }
      return { ...prev, [bichoId]: next }
    })
    setErroGateway("")
  }

  const quantidadeFazendinha = isFazendinha
    ? bichosSelecionados.length
    : isFazendinhaMetade
      ? Object.values(metadePorBicho).reduce((s, arr) => s + arr.length, 0) >> 1
      : 0

  const numerosEscolhidosFazendinha = (): number[] => {
    if (isFazendinha) {
      return bichosSelecionados.flatMap((id) => {
        const b = BICHOS.find((x) => x.id === id)
        return b ? b.dezenas.map((d) => dezenaParaNumero(d)) : []
      })
    }
    if (isFazendinhaMetade) {
      return Object.values(metadePorBicho).flatMap((arr) => arr.map((d) => dezenaParaNumero(d)))
    }
    return []
  }

  const total = quantidade * valorPorCota

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarTelefone(e.target.value)
    setTelefoneComprador(formatted)
    if (erros.telefone) setErros((prev) => ({ ...prev, telefone: "" }))
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCPF(e.target.value)
    setCpfComprador(formatted)
    if (erros.cpf) setErros((prev) => ({ ...prev, cpf: "" }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailComprador(e.target.value)
    if (erros.email) setErros((prev) => ({ ...prev, email: "" }))
  }

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {}

    if (!nomeComprador.trim()) {
      novosErros.nome = "Informe seu nome"
    }

    const telLimpo = telefoneComprador.replace(/\D/g, "")
    if (telLimpo.length < 10 || telLimpo.length > 11) {
      novosErros.telefone = "Telefone invalido"
    }

    if (!emailComprador.trim()) {
      novosErros.email = "Informe seu e-mail"
    } else if (!validarEmail(emailComprador)) {
      novosErros.email = "E-mail invalido"
    }

    const cpfLimpo = cpfComprador.replace(/\D/g, "")
    if (cpfLimpo.length !== 11) {
      novosErros.cpf = "CPF invalido"
    } else if (!validarCPF(cpfComprador)) {
      novosErros.cpf = "CPF invalido"
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleParticipate = async () => {
    if (!aceitarTermos) return
    setErroGateway("")

    if (!validarFormulario()) return

    if (escolhaManual) {
      if (numerosSelecionados.length !== quantidade) {
        setErroGateway(`Selecione exatamente ${quantidade} número(s) na grade.`)
        return
      }
    }
    if (escolhaFazendinha) {
      if (isFazendinha && bichosSelecionados.length === 0) {
        setErroGateway("Selecione pelo menos um bicho.")
        return
      }
      if (isFazendinhaMetade) {
        const totalDezenas = Object.values(metadePorBicho).reduce((s, arr) => s + arr.length, 0)
        if (totalDezenas < 2 || totalDezenas % 2 !== 0) {
          setErroGateway("Em Meia Fazendinha, selecione 2 números por bicho (clique nos círculos).")
          return
        }
      }
      // Validar que nenhum número escolhido já foi vendido (proteção contra condição de corrida)
      const nums = numerosEscolhidosFazendinha()
      const jaVendido = nums.find((n) => cotasVendidas.has(n))
      if (jaVendido !== undefined) {
        setErroGateway(
          `O número ${jaVendido === 0 ? "00" : String(jaVendido).padStart(2, "0")} já foi vendido. Atualize a página e escolha novamente.`
        )
        return
      }
    }

    const config = obterGatewayConfig()
    if (!config.ativo) {
      setErroGateway("Gateway de pagamento nao esta configurado. Contate o administrador.")
      return
    }

    const numerosParaPedido = escolhaManual
      ? numerosSelecionados
      : escolhaFazendinha
        ? numerosEscolhidosFazendinha()
        : undefined
    const qtdPedido = escolhaFazendinha ? quantidadeFazendinha : quantidade
    const params = {
      campanhaId: campanhaId || "unknown",
      campanhaTitulo: titulo || "Rifa",
      quantidade: qtdPedido,
      valorUnitario: valorPorCota,
      nomeComprador: nomeComprador.trim(),
      telefoneComprador,
      emailComprador: emailComprador.trim(),
      cpfComprador,
      ...(numerosParaPedido && numerosParaPedido.length > 0 ? { numerosEscolhidos: numerosParaPedido } : {}),
    }

    try {
      // OpenPix: detecção automática real via webhook
      if (config.gatewayAtivo === "openpix" && config.openpixAppId) {
        const res = await fetch("/api/pix/openpix/criar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...params,
            openpixAppId: config.openpixAppId,
            tempoExpiracaoMinutos: config.tempoExpiracaoMinutos ?? 15,
            ...(numerosParaPedido && numerosParaPedido.length > 0 ? { numerosEscolhidos: numerosParaPedido } : {}),
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setErroGateway(data?.error || "Erro ao criar cobrança PIX. Verifique a configuração OpenPix.")
          return
        }
        const pedido = data.pedido as Pedido
        adicionarPedidoLocal(pedido)
        setPedidoAtual(pedido)
        setShowPayment(true)
        return
      }

      // Gateway Dinâmico ou outros: geração local + sincronização com servidor (webhook simulado)
      const pedido = criarPedido(params)
      await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      }).catch(() => {})
      setPedidoAtual(pedido)
      setShowPayment(true)
    } catch {
      setErroGateway("Erro ao gerar pagamento. Tente novamente.")
    }
  }

  const handleVoltar = () => {
    setShowPayment(false)
    setPedidoAtual(null)
  }

  const handlePago = (pedidoPago: Pedido) => {
    if (campanhaId) {
      const camp = buscarCampanha(campanhaId)
      if (camp) {
        const qtd = pedidoPago.quantidade || 0
        atualizarCampanha(campanhaId, {
          cotasVendidas: (camp.cotasVendidas || 0) + qtd,
        })
      }
    }
    // Dispatch events so admin panels update in real time
    window.dispatchEvent(new Event("clientes-updated"))
    window.dispatchEvent(new Event("pedidos-updated"))
  }

  if (showPayment && pedidoAtual) {
    return <PagamentoPix pedido={pedidoAtual} onVoltar={handleVoltar} onPago={handlePago} />
  }

  const dataSorteio = dataInicio ? formatarData(dataInicio) : ""

  return (
    <Card className="bg-black/40 border-[#FFB800]/20">
      <CardContent className="p-4 space-y-4">
        <div className="bg-green-600 rounded-t-lg -mt-4 -mx-4 p-4 mb-4">
          <h2 className="text-xl font-bold text-white text-center text-balance">
            {titulo || "Selecione suas cotas"}
          </h2>
          {subtitulo && (
            <p className="text-white text-center text-sm mt-1">{subtitulo}</p>
          )}
          {dataSorteio && (
            <div className="bg-[#FFB800] text-black text-center text-sm font-bold py-1 px-2 rounded mt-2">
              SORTEIO: {dataSorteio}
            </div>
          )}
          {escolhaFazendinha && (
            <div className="bg-[#FFB800] text-black text-center text-sm font-bold py-1 px-2 rounded mt-2">
              POR APENAS {formatarValor(valorPorCota)} {isFazendinhaMetade ? "(meio grupo)" : "(bicho inteiro)"}
            </div>
          )}
        </div>

        {/* Maior/Menor Cota */}
        {campanha?.habilitarMaiorMenorCota && maiorMenorCota.maior !== null && (
          <div className="flex gap-2 justify-center text-xs">
            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
              Maior disponível: <strong>#{maiorMenorCota.maior}</strong>
            </span>
            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
              Menor disponível: <strong>#{maiorMenorCota.menor}</strong>
            </span>
          </div>
        )}
        {campanha?.habilitarMaiorMenorCotaDiaria && maiorMenorCotaHoje.maior !== null && (
          <div className="flex gap-2 justify-center text-xs">
            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
              Maior hoje: <strong>#{maiorMenorCotaHoje.maior}</strong>
            </span>
            <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
              Menor hoje: <strong>#{maiorMenorCotaHoje.menor}</strong>
            </span>
          </div>
        )}

        {escolhaFazendinha && (
          <div className="space-y-3">
            <p className="text-gray-300 text-sm text-center">
              {isFazendinha
                ? "Clique no bicho para selecionar (4 números por bicho)."
                : "Clique em 2 números de cada bicho para escolher o meio grupo."}
            </p>
            <div className="max-h-[320px] overflow-y-auto rounded-lg border border-emerald-500/50 bg-emerald-900/20 p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {BICHOS.map((bicho) => {
                  const selectedInteiro = isFazendinha && bichosSelecionados.includes(bicho.id)
                  const metadeDezenas = (isFazendinhaMetade && metadePorBicho[bicho.id]) || []
                  const bichoVendido = isFazendinha && bichoInteiroVendido(bicho.id)
                  return (
                    <div
                      key={bicho.id}
                      className={`rounded-lg overflow-hidden border-2 transition-all ${
                        bichoVendido
                          ? "border-red-700/60 bg-red-900/30 opacity-60 cursor-not-allowed"
                          : selectedInteiro
                            ? "border-amber-400 bg-amber-500/20"
                            : "border-emerald-600/50 bg-emerald-800/60 hover:border-emerald-500"
                      }`}
                    >
                      <div className="p-2">
                        <div
                          className={`flex flex-col items-center ${bichoVendido ? "cursor-not-allowed" : "cursor-pointer"}`}
                          onClick={() => isFazendinha && !bichoVendido && toggleBichoInteiro(bicho.id)}
                        >
                          <span className="text-3xl mb-1" role="img" aria-label={bicho.nome}>
                            {BICHOS_ICONS[bicho.id] || "🐾"}
                          </span>
                          <p className="text-amber-400 font-bold text-xs uppercase tracking-wide text-center">
                            {bicho.nome}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 mt-2">
                          {bicho.dezenas.map((d) => {
                            if (isFazendinha) {
                              const numVendido = cotasVendidas.has(dezenaParaNumero(d))
                              return (
                                <span
                                  key={d}
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                    numVendido
                                      ? "bg-red-800/60 text-red-300 line-through"
                                      : selectedInteiro
                                        ? "bg-amber-400 text-black"
                                        : "bg-amber-400/30 text-amber-200"
                                  }`}
                                  title={numVendido ? "Já vendido" : ""}
                                >
                                  {d}
                                </span>
                              )
                            }
                            const selected = metadeDezenas.includes(d)
                            const dVendida = dezenaVendida(d)
                            return (
                              <button
                                key={d}
                                type="button"
                                disabled={dVendida}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!dVendida) toggleDezenaMetade(bicho.id, d)
                                }}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                                  dVendida
                                    ? "bg-red-800/60 text-red-300 line-through cursor-not-allowed opacity-60"
                                    : selected
                                      ? "bg-amber-400 text-black"
                                      : "bg-amber-900/60 text-amber-200 hover:bg-amber-800/50"
                                }`}
                                title={dVendida ? "Já vendido" : ""}
                              >
                                {d}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <p className="text-center text-sm text-amber-400">
              {isFazendinha
                ? `${bichosSelecionados.length} bicho(s) = ${formatarValor(bichosSelecionados.length * valorPorCota)}`
                : `${quantidadeFazendinha} meio(s) = ${formatarValor(quantidadeFazendinha * valorPorCota)}`}
            </p>
          </div>
        )}

        {!escolhaFazendinha && (
          escolhaManual ? (
            <div className="flex items-center gap-2 bg-[#1a1a2e] rounded-lg p-3 border border-[#FFB800]/20">
              <Hash className="h-4 w-4 text-[#FFB800] shrink-0" />
              <p className="text-xs text-gray-300">
                Escolha os numeros na grade abaixo. Voce deve selecionar exatamente {quantidade} numero(s).
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#1a1a2e] rounded-lg p-3 border border-[#FFB800]/20">
              <Shuffle className="h-4 w-4 text-[#FFB800] shrink-0" />
              <p className="text-xs text-gray-300">
                Seus numeros serao sorteados automaticamente apos a confirmacao do pagamento.
              </p>
            </div>
          )
        )}

        {/* Dados do comprador */}
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">Seu nome *</Label>
            <Input
              value={nomeComprador}
              onChange={(e) => {
                setNomeComprador(e.target.value)
                if (erros.nome) setErros((prev) => ({ ...prev, nome: "" }))
              }}
              placeholder="Digite seu nome completo"
              className={`bg-black/30 border-gray-700 text-white text-sm ${erros.nome ? "border-red-500" : ""}`}
            />
            {erros.nome && <p className="text-red-400 text-xs">{erros.nome}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">CPF *</Label>
            <Input
              value={cpfComprador}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className={`bg-black/30 border-gray-700 text-white text-sm ${erros.cpf ? "border-red-500" : ""}`}
            />
            {erros.cpf && <p className="text-red-400 text-xs">{erros.cpf}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">E-mail *</Label>
            <Input
              type="email"
              value={emailComprador}
              onChange={handleEmailChange}
              placeholder="seu@email.com"
              className={`bg-black/30 border-gray-700 text-white text-sm ${erros.email ? "border-red-500" : ""}`}
            />
            {erros.email && <p className="text-red-400 text-xs">{erros.email}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">Telefone (WhatsApp) *</Label>
            <Input
              value={telefoneComprador}
              onChange={handleTelefoneChange}
              placeholder="(00) 00000-0000"
              maxLength={15}
              className={`bg-black/30 border-gray-700 text-white text-sm ${erros.telefone ? "border-red-500" : ""}`}
            />
            {erros.telefone && <p className="text-red-400 text-xs">{erros.telefone}</p>}
          </div>
        </div>

        <div>
          {!escolhaFazendinha && (
          <p className="text-sm text-gray-400 mb-2">Escolha a quantidade de cotas:</p>
          )}
          {!escolhaManual && !escolhaFazendinha && (
            <div className="grid grid-cols-3 gap-2">
              {opcoes.map((opt) => (
                <Button
                  key={opt}
                  variant={quantidade === opt ? "default" : "outline"}
                  className={
                    quantidade === opt
                      ? "bg-[#FFB800] hover:bg-[#FFA500] text-black"
                      : "border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800]/10"
                  }
                  onClick={() => setQuantidade(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          )}
          {!escolhaFazendinha && (
          <div className="flex items-center gap-3 mt-4">
            <Label htmlFor="quantidade" className="text-white shrink-0">
              Quantidade:
            </Label>
            <div className="flex-1 flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="rounded-r-none border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800]/10"
                onClick={() => handleQuantidadeChange(quantidade - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantidade"
                type="number"
                value={quantidade}
                onChange={(e) => handleQuantidadeChange(Number.parseInt(e.target.value) || 1)}
                className="rounded-none border-x-0 border-[#FFB800] text-center"
                min={1}
                max={escolhaManual ? totalCotas : 1000}
              />
              <Button
                variant="outline"
                size="icon"
                className="rounded-l-none border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800]/10"
                onClick={() => handleQuantidadeChange(quantidade + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          )}
        </div>

        {escolhaManual && totalCotas > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Numeros disponiveis (1 a {totalCotas}). Selecionados: {numerosSelecionados.length} / {quantidade}
            </p>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-[#FFB800]/30 bg-black/30 p-2">
              <div className="grid grid-cols-10 sm:grid-cols-12 gap-1">
                {Array.from({ length: maxNumeros }, (_, i) => i + 1).map((n) => {
                  const selected = numerosSelecionados.includes(n)
                  const bloqueada = cotasBloqueadasSet.has(n) || cotasVendidas.has(n)
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleNumero(n)}
                      disabled={bloqueada}
                      className={`min-w-[2rem] h-8 rounded text-sm font-medium transition-colors ${
                        bloqueada
                          ? "bg-red-900/50 text-red-400 border border-red-700 cursor-not-allowed opacity-50"
                          : selected
                            ? "bg-[#FFB800] text-black"
                            : "bg-[#1a1a2e] text-gray-300 hover:bg-[#FFB800]/20 border border-gray-700"
                      }`}
                      title={cotasBloqueadasSet.has(n) ? "Cota bloqueada" : cotasVendidas.has(n) ? "Cota já vendida" : ""}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
            </div>
            {totalCotas > MAX_NUMEROS_NA_GRADE && (
              <div className="flex gap-2 items-center flex-wrap">
                <Input
                  type="number"
                  placeholder={`Numero (1-${totalCotas})`}
                  value={numeroInput}
                  onChange={(e) => setNumeroInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), adicionarNumeroInput())}
                  className="w-32 bg-black/30 border-gray-700 text-white"
                  min={1}
                  max={totalCotas}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-[#FFB800] text-[#FFB800]"
                  onClick={adicionarNumeroInput}
                >
                  Adicionar numero
                </Button>
                <span className="text-xs text-gray-500">
                  Para numeros acima de {MAX_NUMEROS_NA_GRADE}, use o campo acima.
                </span>
              </div>
            )}
            {numerosSelecionados.length > 0 && (
              <p className="text-xs text-gray-400">
                Selecionados: {numerosSelecionados.slice(0, 15).join(", ")}
                {numerosSelecionados.length > 15 && ` ... +${numerosSelecionados.length - 15} mais`}
              </p>
            )}
          </div>
        )}

        <div className="text-sm text-gray-400 text-center">
          {escolhaFazendinha
            ? `${quantidadeFazendinha} ${isFazendinhaMetade ? "meio(s)" : "bicho(s)"} x ${formatarValor(valorPorCota)}`
            : `${quantidade} cota${quantidade > 1 ? "s" : ""} x ${formatarValor(valorPorCota)}`}
        </div>

        <div className="bg-[#FFB800] p-3 rounded-lg text-center mt-4">
          <p className="text-black font-bold text-lg">
            TOTAL: {formatarValor(escolhaFazendinha ? quantidadeFazendinha * valorPorCota : total)}
          </p>
        </div>

        {erroGateway && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
            <p className="text-red-400 text-sm">{erroGateway}</p>
          </div>
        )}

        <div className="flex items-start gap-2 mt-4">
          <Checkbox
            id="termos"
            checked={aceitarTermos}
            onCheckedChange={(checked) => setAceitarTermos(checked as boolean)}
          />
          <Label htmlFor="termos" className="text-sm text-gray-300">
            Li e concordo com os{" "}
            <a href="#" className="text-[#FFB800] hover:underline">
              termos e condicoes
            </a>{" "}
            da rifa.
          </Label>
        </div>

        <Button
          className="w-full bg-black text-[#FFB800] border border-[#FFB800] hover:bg-[#FFB800] hover:text-black"
          disabled={!aceitarTermos || (escolhaFazendinha && quantidadeFazendinha === 0)}
          onClick={handleParticipate}
        >
          Participar
        </Button>
      </CardContent>
    </Card>
  )
}
