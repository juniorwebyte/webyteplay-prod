"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Download, Filter, RefreshCw, Search } from "lucide-react"

// Dados de exemplo para os logs
const logsData = []

export default function AdminLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("todos")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [logs, setLogs] = useState(logsData)

  // Função para filtrar os logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = levelFilter === "todos" || log.level === levelFilter

    const matchesDate =
      !date ||
      (log.timestamp.getDate() === date.getDate() &&
        log.timestamp.getMonth() === date.getMonth() &&
        log.timestamp.getFullYear() === date.getFullYear())

    return matchesSearch && matchesLevel && matchesDate
  })

  // Função para exportar logs
  const exportLogs = (format: string) => {
    let content = ""

    if (format === "csv") {
      content = "ID,Data,Hora,Nível,Usuário,Ação,IP,Detalhes\n"
      filteredLogs.forEach((log) => {
        const date = format(log.timestamp, "dd/MM/yyyy")
        const time = format(log.timestamp, "HH:mm:ss")
        content += `${log.id},${date},${time},${log.level},${log.user},${log.action},${log.ip},"${log.details}"\n`
      })
    } else if (format === "json") {
      content = JSON.stringify(filteredLogs, null, 2)
    }

    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `logs-sistema-${format(new Date(), "dd-MM-yyyy")}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Função para limpar os filtros
  const clearFilters = () => {
    setSearchTerm("")
    setLevelFilter("todos")
    setDate(undefined)
  }

  // Função para atualizar os logs
  const refreshLogs = () => {
    // Em um cenário real, aqui faria uma chamada à API para buscar os logs mais recentes
    // Por enquanto, apenas reordenamos os logs existentes
    setLogs([...logs].sort(() => Math.random() - 0.5))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Logs do Sistema</h2>
            <p className="text-purple-300/80 mt-1">
              Visualize e analise os registros de atividades e eventos do sistema
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar logs..."
                className="pl-10 bg-[#161A25] border-purple-500/30 focus:border-purple-500/50 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="bg-[#161A25] border-purple-500/30 text-white">
                <SelectValue placeholder="Todos os níveis" />
              </SelectTrigger>
              <SelectContent className="bg-[#161A25] border-purple-500/30 text-white">
                <SelectItem value="todos">Todos os níveis</SelectItem>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="warning">Alerta</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-[#161A25] border-purple-500/30 text-white hover:bg-purple-500/20"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : "Filtrar por data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#161A25] border-purple-500/30">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                  className="rounded-md border border-purple-500/30"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="bg-[#161A25] border-purple-500/30 text-white hover:bg-purple-500/20"
            >
              <Filter className="mr-2 h-4 w-4" />
              Limpar filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshLogs}
              className="bg-[#161A25] border-purple-500/30 text-white hover:bg-purple-500/20"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportLogs("csv")}
              className="bg-[#161A25] border-purple-500/30 text-white hover:bg-purple-500/20"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportLogs("json")}
              className="bg-[#161A25] border-purple-500/30 text-white hover:bg-purple-500/20"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar JSON
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-purple-500/20">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-purple-900/30">
                <TableHead className="text-purple-300">ID</TableHead>
                <TableHead className="text-purple-300">Data/Hora</TableHead>
                <TableHead className="text-purple-300">Nível</TableHead>
                <TableHead className="text-purple-300">Usuário</TableHead>
                <TableHead className="text-purple-300">Ação</TableHead>
                <TableHead className="text-purple-300">IP</TableHead>
                <TableHead className="text-purple-300">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#161A25]/50">
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-300">
                  Nenhum log encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="bg-[#161A25] px-4 py-3 border-t border-purple-500/20 text-xs text-gray-400">
          Exibindo {filteredLogs.length} de {logs.length} logs
        </div>
      </div>
    </div>
  )
}
