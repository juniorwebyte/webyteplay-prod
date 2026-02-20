/**
 * Formatadores centralizados para CPF, CNPJ, CEP, Telefone e Valores.
 * Use em inputs e exibição em todo o projeto (front e admin).
 */

/** Formata CPF: 000.000.000-00 */
export function formatarCPF(valor: string): string {
  const nums = (valor || "").replace(/\D/g, "").substring(0, 11)
  if (nums.length <= 3) return nums
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`
}

/** Formata CNPJ: 00.000.000/0001-00 */
export function formatarCNPJ(valor: string): string {
  const nums = (valor || "").replace(/\D/g, "").substring(0, 14)
  if (nums.length <= 2) return nums
  if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`
  if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`
  if (nums.length <= 12)
    return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`
}

/** Formata CPF ou CNPJ conforme o tamanho (11 = CPF, 14 = CNPJ) */
export function formatarCPFouCNPJ(valor: string): string {
  const nums = (valor || "").replace(/\D/g, "")
  if (nums.length <= 11) return formatarCPF(valor)
  return formatarCNPJ(valor)
}

/** Formata CEP: 00000-000 */
export function formatarCEP(valor: string): string {
  const nums = (valor || "").replace(/\D/g, "").substring(0, 8)
  if (nums.length <= 5) return nums
  return `${nums.slice(0, 5)}-${nums.slice(5)}`
}

/** Formata telefone: (00) 00000-0000 ou (00) 0000-0000 */
export function formatarTelefone(valor: string): string {
  const nums = (valor || "").replace(/\D/g, "").substring(0, 11)
  if (nums.length <= 2) return nums.length > 0 ? `(${nums}` : ""
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
}

/** Formata valor em reais: R$ 1.234,56 */
export function formatarValor(valor: number | string): string {
  const n = typeof valor === "string" ? parseFloat(valor.replace(/\D/g, "").replace(",", ".")) || 0 : Number(valor)
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Formata valor para input (aceita string e retorna formatada) */
export function formatarValorInput(valor: string): string {
  let nums = (valor || "").replace(/\D/g, "")
  if (nums.length === 0) return ""
  if (nums.startsWith("0") && nums.length > 1) nums = nums.replace(/^0+/, "") || "0"
  const inteiros = nums.slice(0, -2) || "0"
  const centavos = nums.slice(-2).padStart(2, "0")
  const formatado = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `R$ ${formatado},${centavos}`
}

/** Remove formatação e retorna apenas números */
export function limparNumeros(valor: string): string {
  return (valor || "").replace(/\D/g, "")
}
