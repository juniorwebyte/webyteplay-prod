import AdminLayout from "@/components/admin/admin-layout"
import AdminLogs from "@/components/admin/admin-logs"

export default function LogsPage() {
  return (
    <AdminLayout>
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Logs do Sistema</h1>
            <p className="text-gray-400 mt-1">Visualize e analise os logs de atividades do sistema</p>
          </div>
          {/* Botão de sair removido intencionalmente */}
        </div>
      </div>
      <main className="flex-1 p-6 overflow-auto">
        <AdminLogs />
      </main>
    </AdminLayout>
  )
}
