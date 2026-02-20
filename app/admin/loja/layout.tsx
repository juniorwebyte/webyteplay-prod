"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import AdminLayout from "@/components/admin/admin-layout"
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Megaphone,
  Package,
  Truck,
  FileBarChart,
  Store,
  Gift,
  ShoppingCart,
  Users,
  CreditCard,
  ShieldCheck,
  Settings,
  Star,
  Smartphone,
  Sparkles,
} from "lucide-react"

const MENU_ITENS = [
  { href: "/admin/loja", label: "Dashboard Geral", icon: LayoutDashboard },
  { href: "/admin/loja/clientes", label: "Clientes", icon: Users },
  { href: "/admin/loja/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/admin/loja/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/admin/loja/vendas", label: "Dashboard de Vendas", icon: TrendingUp },
  { href: "/admin/loja/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/loja/estoque", label: "Dashboard de Estoque", icon: Package },
  { href: "/admin/loja/logistica", label: "Frete e Logística", icon: Truck },
  { href: "/admin/loja/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/admin/loja/produtos", label: "Produtos", icon: Store },
  { href: "/admin/loja/caixas", label: "Caixas Premiadas", icon: Gift },
  { href: "/admin/loja/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/loja/experiencia", label: "Experiência do Usuário", icon: Star },
  { href: "/admin/loja/mobile", label: "Mobile / Omnichannel", icon: Smartphone },
  { href: "/admin/loja/avancado", label: "Avançado", icon: Sparkles },
  { href: "/admin/loja/usuarios", label: "Usuários e Permissões", icon: ShieldCheck },
  { href: "/admin/loja/configuracoes", label: "Configurações Gerais", icon: Settings },
]

export default function LojaAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AdminLayout>
      <div className="flex min-h-screen">
        <aside className="w-56 shrink-0 border-r border-gray-800 bg-[#0f1117] p-4">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Store className="h-5 w-5 text-[#FFB800]" />
            Loja Virtual
          </h2>
          <nav className="space-y-1">
            {MENU_ITENS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin/loja" && pathname?.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-[#FFB800]/20 text-[#FFB800] font-medium"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </AdminLayout>
  )
}
