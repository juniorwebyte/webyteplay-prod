"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { formatarValor, formatarCPF } from "@/lib/formatadores"
import { listarVendasLojaPagas } from "@/lib/vendas-loja-store"

export default function LojaVendasPage() {
  const [vendas, setVendas] = useState<ReturnType<typeof listarVendasLojaPagas>>([])

  const carregar = () => setVendas(listarVendasLojaPagas())

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("pedidos-updated", h)
    return () => window.removeEventListener("pedidos-updated", h)
  }, [])

  const total = vendas.reduce((s, v) => s + v.valorTotal, 0)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <TrendingUp className="h-8 w-8 text-[#FFB800]" />
        Dashboard de Vendas
      </h1>
      <p className="text-gray-400 mb-8">Histórico de vendas da Loja Virtual</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-[#171923] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Total de Vendas</CardTitle>
            <CardDescription>Pedidos pagos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#FFB800]">{vendas.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#171923] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Faturamento</CardTitle>
            <CardDescription>Valor total</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{formatarValor(total)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#171923] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Todas as Vendas</CardTitle>
          <CardDescription>Giros e caixas vendidos</CardDescription>
        </CardHeader>
        <CardContent>
          {vendas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma venda registrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Data</TableHead>
                  <TableHead className="text-gray-300">Produto</TableHead>
                  <TableHead className="text-gray-300">Cliente</TableHead>
                  <TableHead className="text-gray-300">CPF</TableHead>
                  <TableHead className="text-gray-300">Valor</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.slice().reverse().map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="text-gray-400 text-sm">
                      {new Date(v.pagoEm || v.criadoEm).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-white">{v.campanhaTitulo}</TableCell>
                    <TableCell className="text-gray-300">{v.nomeComprador}</TableCell>
                    <TableCell className="text-gray-400 font-mono text-xs">{formatarCPF(v.cpfComprador)}</TableCell>
                    <TableCell className="text-green-400 font-bold">{formatarValor(v.valorTotal)}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-400">Pago</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
