"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Flag,
  ArrowDownUp,
  ShoppingCart,
  BarChart2,
  TrendingUp,
  Users,
  UserPlus,
  Gift,
  Store,
  User,
  CreditCard,
  Wallet,
  Settings,
  FileText,
  Award,
  LifeBuoy,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/admin/loja") return pathname === path || pathname?.startsWith("/admin/loja/")
    return pathname === path
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Flag, label: "Campanhas", path: "/admin/campanhas" },
    { icon: ArrowDownUp, label: "Maior e Menor", path: "/admin/maior-menor" },
    { icon: ShoppingCart, label: "Pedidos", path: "/admin/pedidos" },
    { icon: BarChart2, label: "Relatórios", path: "/admin/relatorios" },
    { icon: TrendingUp, label: "Ranking", path: "/admin/ranking" },
    { icon: Users, label: "Clientes", path: "/admin/clientes" },
    { icon: UserPlus, label: "Afiliados", path: "/admin/afiliados" },
    { icon: Gift, label: "Sorteio", path: "/admin/sorteio" },
    { icon: Store, label: "Loja Virtual", path: "/admin/loja" },
    { icon: User, label: "Usuários", path: "/admin/usuarios" },
    { icon: Wallet, label: "WebytePay", path: "/admin/webytepay" },
    { icon: CreditCard, label: "Gateway de pagamento", path: "/admin/gateway" },
    { icon: Settings, label: "Configuração", path: "/admin/configuracao" },
    { icon: FileText, label: "Logs", path: "/admin/logs" },
    { icon: Award, label: "Cotas Premiadas", path: "/admin/cotas-premiadas" },
  ]

  return (
    <div className="w-64 bg-[#171923] border-r border-gray-800 h-screen overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">WebytePlay</h1>
      </div>

      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                isActive(item.path) ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        <Button className="w-full bg-[#FFB800] hover:bg-[#FFA500] text-black font-medium flex items-center justify-center">
          <LifeBuoy className="mr-2 h-4 w-4" />
          Suporte
        </Button>
        <div className="mt-4 text-xs text-gray-500">Versão 5.0.0</div>
      </div>
    </div>
  )
}
