"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, TrendingUp, DollarSign, Package, ShoppingCart, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { formatarValor } from "@/lib/formatadores"
import { listarProdutos, listarProdutosAtivos, getConfigLoja } from "@/lib/loja-store"
import {
  faturamentoLoja,
  totalVendasLoja,
  vendasPorPeriodo,
  listarVendasLojaPagas,
} from "@/lib/vendas-loja-store"

export default function LojaDashboardGeralPage() {
  const [produtos, setProdutos] = useState(0)
  const [ativos, setAtivos] = useState(0)
  const [faturamento, setFaturamento] = useState(0)
  const [vendas, setVendas] = useState(0)
  const [hoje, setHoje] = useState({ total: 0, valor: 0 })
  const [semana, setSemana] = useState({ total: 0, valor: 0 })

  const carregar = () => {
    const prods = listarProdutos()
    setProdutos(prods.length)
    setAtivos(listarProdutosAtivos().length)
    setFaturamento(faturamentoLoja())
    setVendas(totalVendasLoja())
    setHoje(vendasPorPeriodo(1))
    setSemana(vendasPorPeriodo(7))
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("loja-updated", h)
    window.addEventListener("pedidos-updated", h)
    return () => {
      window.removeEventListener("loja-updated", h)
      window.removeEventListener("pedidos-updated", h)
    }
  }, [])

  const config = getConfigLoja()
  const ultimasVendas = listarVendasLojaPagas().slice(-5).reverse()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8 text-[#FFB800]" />
          Dashboard Geral
        </h1>
        <p className="text-gray-400 mt-1">Visão geral da sua Loja Virtual</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#171923] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{formatarValor(faturamento)}</p>
            <p className="text-xs text-gray-500 mt-1">Vendas da loja (giros, caixas)</p>
          </CardContent>
        </Card>

        <Card className="bg-[#171923] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{vendas}</p>
            <p className="text-xs text-gray-500 mt-1">Pedidos pagos</p>
          </CardContent>
        </Card>

        <Card className="bg-[#171923] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Produtos Cadastrados</CardTitle>
            <Package className="h-4 w-4 text-[#FFB800]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{produtos}</p>
            <p className="text-xs text-gray-500 mt-1">{ativos} ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-[#171923] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Status da Loja</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{config.habilitarLoja ? "Ativa" : "Inativa"}</p>
            <p className="text-xs text-gray-500 mt-1">{config.titulo}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-[#171923] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Vendas Hoje</CardTitle>
            <CardDescription>Últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#FFB800]">{formatarValor(hoje.valor)}</p>
            <p className="text-gray-400">{hoje.total} pedido(s)</p>
          </CardContent>
        </Card>

        <Card className="bg-[#171923] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Vendas Últimos 7 Dias</CardTitle>
            <CardDescription>Esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#FFB800]">{formatarValor(semana.valor)}</p>
            <p className="text-gray-400">{semana.total} pedido(s)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#171923] border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Últimas Vendas</CardTitle>
              <CardDescription>Pedidos mais recentes da loja</CardDescription>
            </div>
            <Link href="/admin/loja/vendas">
              <span className="text-sm text-[#FFB800] hover:underline flex items-center gap-1">
                Ver todas <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {ultimasVendas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma venda registrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {ultimasVendas.map((v) => (
                <div
                  key={v.id}
                  className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
                >
                  <div>
                    <p className="text-white font-medium">{v.campanhaTitulo}</p>
                    <p className="text-xs text-gray-500">{v.nomeComprador}</p>
                  </div>
                  <span className="text-green-400 font-bold">{formatarValor(v.valorTotal)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
