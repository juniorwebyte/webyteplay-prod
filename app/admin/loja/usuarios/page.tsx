"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  UserPlus,
  Shield,
  Lock,
  Activity,
  FileCheck,
  History,
  Plus,
  Pencil,
  Trash2,
  Save,
} from "lucide-react"
import {
  listarUsuariosAdmin,
  salvarUsuarioAdmin,
  excluirUsuarioAdmin,
  listarPerfisPermissao,
  salvarPerfilPermissao,
  getPermissoesDisponiveis,
  listarLogsAtividade,
  listarAuditoria,
  listarHistoricoAlteracoes,
  type UsuarioAdmin,
  type PerfilPermissao,
} from "@/lib/usuarios-permissoes-loja-store"

export default function LojaUsuariosPage() {
  const [abaAtiva, setAbaAtiva] = useState("lista")
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [perfis, setPerfis] = useState<PerfilPermissao[]>([])
  const [logs, setLogs] = useState<ReturnType<typeof listarLogsAtividade>>([])
  const [auditoria, setAuditoria] = useState<ReturnType<typeof listarAuditoria>>([])
  const [historico, setHistorico] = useState<ReturnType<typeof listarHistoricoAlteracoes>>([])
  const [dialogUsuarioOpen, setDialogUsuarioOpen] = useState(false)
  const [dialogPerfilOpen, setDialogPerfilOpen] = useState(false)
  const [editUsuario, setEditUsuario] = useState<UsuarioAdmin | null>(null)
  const [editPerfil, setEditPerfil] = useState<PerfilPermissao | null>(null)
  const [formUsuario, setFormUsuario] = useState({ nome: "", email: "", senha: "", perfilId: "", ativo: true })
  const [formPerfil, setFormPerfil] = useState({ nome: "", descricao: "", permissoes: [] as string[], ativo: true })
  const [filtroLogModulo, setFiltroLogModulo] = useState("todos")
  const [filtroAudEntidade, setFiltroAudEntidade] = useState("todos")

  const permissoesDisponiveis = getPermissoesDisponiveis()

  const carregar = () => {
    setUsuarios(listarUsuariosAdmin())
    setPerfis(listarPerfisPermissao())
    setLogs(listarLogsAtividade(filtroLogModulo !== "todos" ? { modulo: filtroLogModulo } : undefined))
    setAuditoria(listarAuditoria(filtroAudEntidade !== "todos" ? { entidade: filtroAudEntidade } : undefined))
    setHistorico(listarHistoricoAlteracoes())
  }

  useEffect(() => {
    carregar()
    const h = () => carregar()
    window.addEventListener("usuarios-permissoes-loja-updated", h)
    return () => window.removeEventListener("usuarios-permissoes-loja-updated", h)
  }, [filtroLogModulo, filtroAudEntidade])

  const abrirCriarUsuario = () => {
    setEditUsuario(null)
    setFormUsuario({ nome: "", email: "", senha: "", perfilId: perfis[0]?.id || "", ativo: true })
    setDialogUsuarioOpen(true)
  }

  const abrirEditarUsuario = (u: UsuarioAdmin) => {
    setEditUsuario(u)
    setFormUsuario({ nome: u.nome, email: u.email, senha: "", perfilId: u.perfilId, ativo: u.ativo })
    setDialogUsuarioOpen(true)
  }

  const salvarUsuario = () => {
    if (editUsuario) {
      salvarUsuarioAdmin({ ...editUsuario, nome: formUsuario.nome, email: formUsuario.email, perfilId: formUsuario.perfilId, ativo: formUsuario.ativo })
    } else {
      salvarUsuarioAdmin({ nome: formUsuario.nome, email: formUsuario.email, perfilId: formUsuario.perfilId, ativo: formUsuario.ativo })
    }
    setDialogUsuarioOpen(false)
    carregar()
  }

  const salvarPerfil = () => {
    if (editPerfil) {
      salvarPerfilPermissao({ ...editPerfil, nome: formPerfil.nome, descricao: formPerfil.descricao, permissoes: formPerfil.permissoes, ativo: formPerfil.ativo })
    } else {
      salvarPerfilPermissao(formPerfil)
    }
    setDialogPerfilOpen(false)
    carregar()
  }

  const togglePermissaoPerfil = (permId: string) => {
    if (formPerfil.permissoes.includes(permId)) {
      setFormPerfil({ ...formPerfil, permissoes: formPerfil.permissoes.filter((p) => p !== permId) })
    } else {
      setFormPerfil({ ...formPerfil, permissoes: [...formPerfil.permissoes, permId] })
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Users className="h-8 w-8 text-[#FFB800]" />
        Usuários e Permissões
      </h1>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="flex flex-wrap gap-1 mb-6 bg-[#171923] border border-gray-800">
          <TabsTrigger value="lista">Lista de Usuários</TabsTrigger>
          <TabsTrigger value="criar">Criar Usuário</TabsTrigger>
          <TabsTrigger value="perfis">Perfis de Permissão</TabsTrigger>
          <TabsTrigger value="controle">Controle de Acesso</TabsTrigger>
          <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Alterações</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Lista de Usuários Admin</CardTitle>
                <CardDescription>Usuários com acesso ao painel da Loja Virtual.</CardDescription>
              </div>
              <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={abrirCriarUsuario}>
                <UserPlus className="h-4 w-4 mr-2" /> Novo usuário
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">E-mail</TableHead>
                    <TableHead className="text-gray-300">Perfil</TableHead>
                    <TableHead className="text-gray-300">Último acesso</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-white">{u.nome}</TableCell>
                      <TableCell className="text-gray-400">{u.email}</TableCell>
                      <TableCell className="text-gray-400">{perfis.find((p) => p.id === u.perfilId)?.nome || u.perfilId}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{u.ultimoAcesso ? new Date(u.ultimoAcesso).toLocaleString("pt-BR") : "—"}</TableCell>
                      <TableCell><Badge className={u.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{u.ativo ? "Ativo" : "Inativo"}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => abrirEditarUsuario(u)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-400" onClick={() => { excluirUsuarioAdmin(u.id); carregar(); }}><Trash2 className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {usuarios.length === 0 && <p className="text-gray-500 py-4">Nenhum usuário cadastrado. Use a aba Criar Usuário.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criar">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><UserPlus className="h-5 w-5" /> Criar Usuário Admin</CardTitle>
              <CardDescription>Preencha os dados e associe a um perfil de permissão.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={abrirCriarUsuario}>
                <Plus className="h-4 w-4 mr-2" /> Abrir formulário
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perfis">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2"><Shield className="h-5 w-5" /> Perfis de Permissão</CardTitle>
                <CardDescription>Defina perfis e permissões por módulo.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setEditPerfil(null); setFormPerfil({ nome: "", descricao: "", permissoes: [], ativo: true }); setDialogPerfilOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Novo perfil
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">Permissões</TableHead>
                    <TableHead className="text-gray-300">Ativo</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perfis.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-white">{p.nome}</TableCell>
                      <TableCell className="text-gray-400">{p.permissoes.length} permissão(ões)</TableCell>
                      <TableCell><Badge className={p.ativo ? "bg-green-500/20" : "bg-gray-500/20"}>{p.ativo ? "Sim" : "Não"}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => { setEditPerfil(p); setFormPerfil({ nome: p.nome, descricao: p.descricao || "", permissoes: p.permissoes, ativo: p.ativo }); setDialogPerfilOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {perfis.length === 0 && <p className="text-gray-500 py-4">Nenhum perfil. Crie um perfil para atribuir aos usuários.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controle">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Lock className="h-5 w-5" /> Controle de Acesso</CardTitle>
              <CardDescription>Permissões disponíveis por categoria. Atribua via Perfis.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Geral", "Produtos", "Pedidos", "Clientes", "Financeiro", "Config", "Usuários"].map((cat) => (
                  <div key={cat}>
                    <p className="text-[#FFB800] font-medium mb-2">{cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {permissoesDisponiveis.filter((p) => p.categoria === cat).map((p) => (
                        <Badge key={p.id} variant="outline" className="text-gray-300">{p.nome}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Activity className="h-5 w-5" /> Logs de Atividade</CardTitle>
              <CardDescription>Registro de ações no painel.</CardDescription>
              <div className="pt-2">
                <Select value={filtroLogModulo} onValueChange={setFiltroLogModulo}>
                  <SelectTrigger className="w-48 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os módulos</SelectItem>
                    <SelectItem value="produtos">Produtos</SelectItem>
                    <SelectItem value="pedidos">Pedidos</SelectItem>
                    <SelectItem value="clientes">Clientes</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="config">Configurações</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-gray-300">Usuário</TableHead>
                    <TableHead className="text-gray-300">Ação</TableHead>
                    <TableHead className="text-gray-300">Módulo</TableHead>
                    <TableHead className="text-gray-300">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.slice(0, 100).map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-gray-500 text-sm">{new Date(l.criadoEm).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-white">{l.usuarioNome}</TableCell>
                      <TableCell className="text-gray-400">{l.acao}</TableCell>
                      <TableCell><Badge variant="outline">{l.modulo}</Badge></TableCell>
                      <TableCell className="text-gray-500 text-sm truncate max-w-[200px]">{l.detalhes || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {logs.length === 0 && <p className="text-gray-500 py-4">Nenhum log registrado.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auditoria">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><FileCheck className="h-5 w-5" /> Auditoria</CardTitle>
              <CardDescription>Alterações em entidades (criar, editar, excluir).</CardDescription>
              <div className="pt-2">
                <Select value={filtroAudEntidade} onValueChange={setFiltroAudEntidade}>
                  <SelectTrigger className="w-48 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="produto">Produto</SelectItem>
                    <SelectItem value="pedido">Pedido</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="config">Configuração</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-gray-300">Usuário</TableHead>
                    <TableHead className="text-gray-300">Entidade</TableHead>
                    <TableHead className="text-gray-300">ID</TableHead>
                    <TableHead className="text-gray-300">Operação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditoria.slice(0, 100).map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-gray-500 text-sm">{new Date(a.criadoEm).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-white">{a.usuarioNome}</TableCell>
                      <TableCell className="text-gray-400">{a.entidade}</TableCell>
                      <TableCell className="font-mono text-gray-500 text-sm">{a.entidadeId}</TableCell>
                      <TableCell><Badge variant="outline">{a.operacao}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {auditoria.length === 0 && <p className="text-gray-500 py-4">Nenhum registro de auditoria.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card className="bg-[#171923] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><History className="h-5 w-5" /> Histórico de Alterações</CardTitle>
              <CardDescription>Mudanças por campo (antes/depois).</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Data</TableHead>
                    <TableHead className="text-gray-300">Entidade</TableHead>
                    <TableHead className="text-gray-300">Campo</TableHead>
                    <TableHead className="text-gray-300">De → Para</TableHead>
                    <TableHead className="text-gray-300">Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historico.slice(0, 100).map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="text-gray-500 text-sm">{new Date(h.criadoEm).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="text-gray-400">{h.entidade} #{h.entidadeId}</TableCell>
                      <TableCell className="text-white">{h.campo}</TableCell>
                      <TableCell className="text-gray-400 text-sm truncate max-w-[200px]">{h.valorAnterior} → {h.valorNovo}</TableCell>
                      <TableCell className="text-gray-500">{h.usuarioNome}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {historico.length === 0 && <p className="text-gray-500 py-4">Nenhuma alteração registrada.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogUsuarioOpen} onOpenChange={setDialogUsuarioOpen}>
        <DialogContent className="bg-[#171923] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">{editUsuario ? "Editar" : "Novo"} usuário admin</DialogTitle>
            <DialogDescription>Dados e perfil de acesso.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Nome</Label><Input value={formUsuario.nome} onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">E-mail</Label><Input type="email" value={formUsuario.email} onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} className="bg-background" /></div>
            {!editUsuario && <div><Label className="text-gray-400">Senha (opcional)</Label><Input type="password" value={formUsuario.senha} onChange={(e) => setFormUsuario({ ...formUsuario, senha: e.target.value })} className="bg-background" placeholder="Deixe em branco para definir depois" /></div>}
            <div><Label className="text-gray-400">Perfil</Label>
              <Select value={formUsuario.perfilId || "nenhum"} onValueChange={(v) => setFormUsuario({ ...formUsuario, perfilId: v === "nenhum" ? "" : v })}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum" disabled>Selecione um perfil</SelectItem>
                  {perfis.map((p) => (<SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={formUsuario.ativo} onCheckedChange={(v) => setFormUsuario({ ...formUsuario, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogUsuarioOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarUsuario(); toast.success("Usuário salvo!"); }} disabled={!formUsuario.nome || !formUsuario.email || !formUsuario.perfilId || formUsuario.perfilId === "nenhum"}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogPerfilOpen} onOpenChange={setDialogPerfilOpen} className="max-w-2xl">
        <DialogContent className="bg-[#171923] border-gray-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editPerfil ? "Editar" : "Novo"} perfil de permissão</DialogTitle>
            <DialogDescription>Marque as permissões que este perfil terá.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-400">Nome</Label><Input value={formPerfil.nome} onChange={(e) => setFormPerfil({ ...formPerfil, nome: e.target.value })} className="bg-background" /></div>
            <div><Label className="text-gray-400">Descrição</Label><Input value={formPerfil.descricao} onChange={(e) => setFormPerfil({ ...formPerfil, descricao: e.target.value })} className="bg-background" /></div>
            <div>
              <Label className="text-gray-400">Permissões</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                {permissoesDisponiveis.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={formPerfil.permissoes.includes(p.id)} onChange={() => togglePermissaoPerfil(p.id)} className="rounded border-gray-600" />
                    {p.nome} ({p.categoria})
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={formPerfil.ativo} onCheckedChange={(v) => setFormPerfil({ ...formPerfil, ativo: v })} /><Label className="text-gray-400">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPerfilOpen(false)}>Cancelar</Button>
            <Button className="bg-[#FFB800] hover:bg-[#FFA500] text-black" onClick={() => { salvarPerfil(); toast.success("Perfil salvo!"); }} disabled={!formPerfil.nome}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
