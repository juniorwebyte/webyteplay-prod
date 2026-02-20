/**
 * Eventos de sincronização para manter consistência entre:
 * - Admin e página pública
 * - Abas do navegador (via StorageEvent)
 * - Componentes que dependem dos mesmos dados
 *
 * Ao modificar dados em qualquer store, dispare o evento correspondente.
 * Componentes que precisam reagir devem escutar esses eventos.
 */

export const SYNC_EVENTS = {
  CAMPANHAS: "campanhas-updated",
  PEDIDOS: "pedidos-updated",
  COTAS_PREMIADAS: "cotas-premiadas-premiacoes-updated",
  LOJA: "loja-updated",
  CLIENTES: "clientes-updated",
} as const

export type SyncEventName = (typeof SYNC_EVENTS)[keyof typeof SYNC_EVENTS]

/** Dispara evento de sincronização (mesma aba). Use após salvar dados. */
export function dispatchSync(eventName: SyncEventName): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(eventName))
  }
}

/**
 * Para sincronização entre abas: componentes devem escutar também o evento "storage"
 * e verificar e.key === "campanhas" | "pedidos" | etc. para recarregar dados.
 */
