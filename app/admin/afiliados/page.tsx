"use client"
import AdminLayout from "@/components/admin/admin-layout"
import AdminAfiliados from "@/components/admin/admin-afiliados"

export default function AfiliadosPage() {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-white">Afiliados</h1>
        <AdminAfiliados />
      </div>
    </AdminLayout>
  )
}
