"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { adminLogout } from "@/lib/auth-utils"
import { LogOut } from "lucide-react"

export default function AdminHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const router = useRouter()

  const handleLogout = () => {
    adminLogout()
    router.push("/admin")
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-gray-400">{subtitle}</p>
      </div>
      <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </div>
  )
}
