// Funções auxiliares para relatórios da Loja Virtual
// Agrega dados das stores existentes

import { listarPedidos } from "./gateway-store"
import { listarVendasLojaPagas, vendasPorPeriodo, faturamentoLoja } from "./vendas-loja-store"
import { listarProdutos } from "./loja-store"
import { listarClientesLoja, listarClientesVIP } from "./clientes-loja-store"
import { listarMovimentos, fluxoCaixaPorPeriodo, totalTaxasGateway } from "./financeiro-loja-store"
import { listarEstornos } from "./financeiro-loja-store"
import { listarLogsTransacoes } from "./pagamentos-loja-store"
import { listarCupons, listarCampanhas, listarBanners } from "./marketing-loja-store"

export function relatorioVendas(dias: number) {
  const { total, valor } = vendasPorPeriodo(dias)
  const vendas = listarVendasLojaPagas()
  const pedidos = listarPedidos()
  const totalPedidos = pedidos.filter((p) => (p as { tipoEspecial?: string }).tipoEspecial === "produto_loja").length
  const convertidos = vendas.filter((v) => (v as { tipoEspecial?: string }).tipoEspecial === "produto_loja").length
  return {
    vendasPeriodo: total,
    valorPeriodo: valor,
    ticketMedio: total > 0 ? valor / total : 0,
    totalPedidos,
    pedidosConvertidos: convertidos,
    taxaConversao: totalPedidos > 0 ? (convertidos / totalPedidos) * 100 : 0,
  }
}

export function relatorioProdutos() {
  const produtos = listarProdutos()
  const vendas = listarVendasLojaPagas()
  const porProduto: Record<string, { nome: string; quantidade: number; valor: number }> = {}
  vendas.forEach((v) => {
    const titulo = v.campanhaTitulo || "Produto"
    if (!porProduto[titulo]) porProduto[titulo] = { nome: titulo, quantidade: 0, valor: 0 }
    porProduto[titulo].quantidade += v.quantidade || 1
    porProduto[titulo].valor += v.valorTotal
  })
  const ranking = Object.values(porProduto).sort((a, b) => b.valor - a.valor)
  return {
    totalProdutos: produtos.length,
    ativos: produtos.filter((p) => p.ativo).length,
    destaque: produtos.filter((p) => p.destaque).length,
    rankingVendas: ranking.slice(0, 20),
  }
}

export function relatorioConversao(dias: number) {
  const pedidos = listarPedidos()
  const vendas = listarVendasLojaPagas().filter((v) => new Date(v.pagoEm || v.criadoEm) >= new Date(Date.now() - dias * 24 * 60 * 60 * 1000))
  const lojaPedidos = pedidos.filter((p) => (p as { tipoEspecial?: string }).tipoEspecial === "produto_loja")
  const pagos = lojaPedidos.filter((p) => p.status === "pago")
  const pendentes = lojaPedidos.filter((p) => p.status === "pendente" || p.status === "aguardando")
  const expirados = lojaPedidos.filter((p) => p.status === "expirado")
  return {
    totalCriados: lojaPedidos.length,
    pagos: pagos.length,
    pendentes: pendentes.length,
    expirados: expirados.length,
    taxaPagamento: lojaPedidos.length > 0 ? (pagos.length / lojaPedidos.length) * 100 : 0,
    valorConvertido: pagos.reduce((s, p) => s + p.valorTotal, 0),
  }
}

export function relatorioCarrinhoAbandonado() {
  // Dados de carrinho abandonado requerem tracking de sessão - placeholder
  return {
    totalAbandonos: 0,
    valorPerdido: 0,
    ticketMedioAbandono: 0,
    mensagem: "Implemente o tracking de carrinho abandonado para habilitar este relatório.",
  }
}

export function relatorioClientes() {
  const clientes = listarClientesLoja()
  const vendas = listarVendasLojaPagas()
  const compradores = new Set(vendas.map((v) => v.emailComprador)).size
  const vips = listarClientesVIP()
  return {
    totalClientes: clientes.length,
    compradoresUnicos: compradores,
    novosClientes: clientes.filter((c) => c.dataCadastro && new Date(c.dataCadastro) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
    vips: vips.length,
  }
}

export function relatorioFinanceiro(dataInicio: string, dataFim: string) {
  const fluxo = fluxoCaixaPorPeriodo(dataInicio, dataFim)
  const movimentos = listarMovimentos({ dataInicio: dataInicio + "T00:00:00", dataFim: dataFim + "T23:59:59" })
  const estornos = listarEstornos()
  const taxas = totalTaxasGateway()
  return {
    recebimentos: fluxo.recebimentos,
    pagamentos: fluxo.pagamentos,
    saldo: fluxo.saldo,
    taxasGateway: taxas,
    totalEstornos: estornos.reduce((s, e) => s + e.valor, 0),
    movimentos: movimentos.length,
  }
}

export function relatorioEstoque() {
  const produtos = listarProdutos()
  const baixo: Array<{ nome: string; estoque: number; minimo?: number }> = []
  produtos.forEach((p) => {
    const est = (p as { estoque?: number }).estoque ?? 0
    const min = (p as { estoqueMinimo?: number }).estoqueMinimo ?? 5
    if (est <= min && min > 0) baixo.push({ nome: p.nome, estoque: est, minimo: min })
  })
  return {
    totalProdutos: produtos.length,
    comEstoque: produtos.filter((p) => ((p as { estoque?: number }).estoque ?? 0) > 0).length,
    semEstoque: produtos.filter((p) => ((p as { estoque?: number }).estoque ?? 0) <= 0).length,
    alertasEstoqueBaixo: baixo,
  }
}

export function relatorioMarketing() {
  const cupons = listarCupons()
  const campanhas = listarCampanhas()
  const banners = listarBanners()
  return {
    cuponsAtivos: cupons.filter((c) => c.ativo).length,
    cuponsTotalUsos: cupons.reduce((s, c) => s + c.usado, 0),
    campanhasAtivas: campanhas.filter((c) => c.ativo).length,
    bannersAtivos: banners.filter((b) => b.ativo).length,
  }
}

export function relatorioTaxas(dataInicio?: string, dataFim?: string) {
  const taxas = totalTaxasGateway()
  const logs = listarLogsTransacoes()
  const filtrados = dataInicio && dataFim
    ? logs.filter((l) => l.criadoEm >= dataInicio && l.criadoEm <= dataFim)
    : logs
  return {
    totalTaxasGateway: taxas,
    transacoesPeriodo: filtrados.length,
    porTipo: {
      pagamento: filtrados.filter((l) => l.tipo === "pagamento").length,
      estorno: filtrados.filter((l) => l.tipo === "estorno").length,
      falha: filtrados.filter((l) => l.tipo === "falha").length,
    },
  }
}
