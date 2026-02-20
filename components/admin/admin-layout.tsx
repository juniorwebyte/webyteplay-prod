import type React from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import ParticlesContainer from "@/components/particles-container"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background com partículas */}
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
      </div>

      <div className="flex flex-1 z-10 relative">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
