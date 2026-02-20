import AdminLayout from "@/components/admin/admin-layout"
import AdminCotasPremiadas from "@/components/admin/admin-cotas-premiadas"

export default function CotasPremiadasPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">Cotas Premiadas</h1>
        <AdminCotasPremiadas />
      </div>
    </AdminLayout>
  )
}
