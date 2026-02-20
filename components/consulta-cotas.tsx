"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, QrCode } from "lucide-react"
import {
  buscarPremiacoesPorNumero,
  buscarPremiacoesPorTelefone,
  type PremiacaoCotaPremiada,
} from "@/lib/cotas-premiadas-store"
import { buscarCampanha } from "@/lib/campanhas-store"

export default function ConsultaCotas() {
  const [searchType, setSearchType] = useState("telefone")
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState<PremiacaoCotaPremiada[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const h = () => {
      if (hasSearched && searchValue.trim()) {
        handleSearch()
      }
    }
    window.addEventListener("cotas-premiadas-premiacoes-updated", h)
    return () => window.removeEventListener("cotas-premiadas-premiacoes-updated", h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSearched, searchType, searchValue])

  const handleSearch = () => {
    if (!searchValue.trim()) return

    let results: PremiacaoCotaPremiada[] = []
    if (searchType === "telefone") {
      results = buscarPremiacoesPorTelefone(searchValue)
    } else if (searchType === "numero") {
      results = buscarPremiacoesPorNumero(searchValue)
    }

    setSearchResults(results)
    setHasSearched(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consulta de Cotas Premiadas</CardTitle>
        <CardDescription>Verifique se você foi premiado com uma cota instantânea.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="search-type">Buscar por</Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger id="search-type">
                  <SelectValue placeholder="Tipo de busca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="numero">Número da Cota</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="search-value">
                {searchType === "telefone" ? "Digite seu telefone" : "Digite o número da cota"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="search-value"
                  placeholder={searchType === "telefone" ? "Ex: (11) 98765-4321" : "Ex: 123456"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" /> Buscar
                </Button>
              </div>
            </div>
          </div>

          {hasSearched && (
            <div className="mt-6">
              {searchResults.length > 0 ? (
                <>
                  <h3 className="text-lg font-medium mb-4">Resultados da Busca</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Rifa</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Prêmio</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((cota) => (
                        <TableRow key={cota.id}>
                          <TableCell>{cota.numeroPremiado ?? "—"}</TableCell>
                        <TableCell>{cota.nome}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {buscarCampanha(cota.campanhaId)?.titulo || cota.campanhaId}
                        </TableCell>
                          <TableCell>{new Date(cota.criadoEm).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>{cota.premio}</TableCell>
                          <TableCell>
                            <Badge variant={cota.status === "pago" ? "default" : "secondary"}>
                              {cota.status === "pago" ? "Pago" : "Pendente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {cota.status === "pendente" && (
                              <Button variant="outline" size="sm">
                                <QrCode className="mr-2 h-4 w-4" /> Pagar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="text-center p-6 border rounded-md">
                  <p className="text-muted-foreground">Nenhuma cota premiada encontrada para a busca realizada.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground text-center">
          As cotas premiadas são sorteadas instantaneamente no momento da compra. Consulte regularmente para verificar
          se você foi premiado!
        </p>
      </CardFooter>
    </Card>
  )
}
