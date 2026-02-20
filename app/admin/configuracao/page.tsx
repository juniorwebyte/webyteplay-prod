"use client"

import AdminConfiguracao from "@/components/admin/admin-configuracao"
import AdminLayout from "@/components/admin/admin-layout"

export default function ConfiguracaoPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white animated-text">Definições</h1>
        </div>
        <AdminConfiguracao />
      </div>
    </AdminLayout>
  )
}
