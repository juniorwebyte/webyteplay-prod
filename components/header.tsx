"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, ShoppingCart } from "lucide-react"
import { useTheme } from "next-themes"
import UserDropdown from "@/components/auth/user-dropdown"
import { listarPedidos, type Pedido } from "@/lib/gateway-store"
import { totalItensCarrinho } from "@/lib/carrinho-loja-store"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [itensCarrinho, setItensCarrinho] = useState(0)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const navItens = [
    { href: "/", label: "Início", match: (p: string) => p === "/" },
    { href: "/rifas", label: "Rifas", match: (p: string) => p.startsWith("/rifas") },
    { href: "/ganhadores", label: "Ganhadores", match: (p: string) => p.startsWith("/ganhadores") },
    { href: "/como-funciona", label: "Como Funciona", match: (p: string) => p.startsWith("/como-funciona") },
    { href: "/contato", label: "Contato", match: (p: string) => p.startsWith("/contato") },
    { href: "/gamificacao", label: "Loja Virtual", match: (p: string) => p.startsWith("/gamificacao") },
    { href: "/minhas-cotas", label: "Minhas Cotas", match: (p: string) => p.startsWith("/minhas-cotas") },
  ]

  useEffect(() => {
    const atualizarContador = () => {
      try {
        const lojaCount = totalItensCarrinho()
        const pedidosCount = listarPedidos().filter((p: Pedido) => p.status === "pendente").length
        setItensCarrinho(pathname?.startsWith("/gamificacao") ? lojaCount : pedidosCount)
      } catch {
        setItensCarrinho(0)
      }
    }

    atualizarContador()
    const h = () => atualizarContador()
    window.addEventListener("pedidos-updated", h)
    window.addEventListener("carrinho-loja-updated", h)
    return () => {
      window.removeEventListener("pedidos-updated", h)
      window.removeEventListener("carrinho-loja-updated", h)
    }
  }, [pathname])

  const handleCarrinhoClick = () => {
    router.push(pathname?.startsWith("/gamificacao") ? "/gamificacao?tab=loja" : "/minhas-cotas")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                {navItens.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-lg font-medium transition-colors ${
                      item.match(pathname || "") ? "text-primary font-semibold" : "hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/webyte.png" alt="WebytePlay Logo" width={120} height={40} className="glow" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItens.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                item.match(pathname || "") ? "text-primary font-semibold underline underline-offset-4" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:flex w-40 lg:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar rifas..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline" size="icon" className="relative" onClick={handleCarrinhoClick}>
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {itensCarrinho}
            </span>
            <span className="sr-only">Carrinho</span>
          </Button>

          <UserDropdown />

          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            )}
            <span className="sr-only">Alternar tema</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
