/**
 * Jogo do Bicho - Tabela oficial dos 25 bichos com dezenas exatas.
 * Cada bicho tem 4 dezenas (últimos 2 dígitos): 00 a 99.
 * Referência: tabela tradicional do Jogo do Bicho.
 */

export interface Bicho {
  id: number
  nome: string
  /** Dezenas do grupo (2 dígitos): "01" a "04" etc. */
  dezenas: [string, string, string, string]
  /** Representação para exibição: "01-02-03-04" */
  numeros: string
}

/** 25 bichos na ordem oficial. Dezenas 00-99 (00 = centena). */
export const BICHOS: Bicho[] = [
  { id: 1, nome: "Avestruz", dezenas: ["01", "02", "03", "04"], numeros: "01-02-03-04" },
  { id: 2, nome: "Águia", dezenas: ["05", "06", "07", "08"], numeros: "05-06-07-08" },
  { id: 3, nome: "Burro", dezenas: ["09", "10", "11", "12"], numeros: "09-10-11-12" },
  { id: 4, nome: "Borboleta", dezenas: ["13", "14", "15", "16"], numeros: "13-14-15-16" },
  { id: 5, nome: "Cachorro", dezenas: ["17", "18", "19", "20"], numeros: "17-18-19-20" },
  { id: 6, nome: "Cabra", dezenas: ["21", "22", "23", "24"], numeros: "21-22-23-24" },
  { id: 7, nome: "Carneiro", dezenas: ["25", "26", "27", "28"], numeros: "25-26-27-28" },
  { id: 8, nome: "Camelo", dezenas: ["29", "30", "31", "32"], numeros: "29-30-31-32" },
  { id: 9, nome: "Cobra", dezenas: ["33", "34", "35", "36"], numeros: "33-34-35-36" },
  { id: 10, nome: "Coelho", dezenas: ["37", "38", "39", "40"], numeros: "37-38-39-40" },
  { id: 11, nome: "Cavalo", dezenas: ["41", "42", "43", "44"], numeros: "41-42-43-44" },
  { id: 12, nome: "Elefante", dezenas: ["45", "46", "47", "48"], numeros: "45-46-47-48" },
  { id: 13, nome: "Galo", dezenas: ["49", "50", "51", "52"], numeros: "49-50-51-52" },
  { id: 14, nome: "Gato", dezenas: ["53", "54", "55", "56"], numeros: "53-54-55-56" },
  { id: 15, nome: "Jacaré", dezenas: ["57", "58", "59", "60"], numeros: "57-58-59-60" },
  { id: 16, nome: "Leão", dezenas: ["61", "62", "63", "64"], numeros: "61-62-63-64" },
  { id: 17, nome: "Macaco", dezenas: ["65", "66", "67", "68"], numeros: "65-66-67-68" },
  { id: 18, nome: "Porco", dezenas: ["69", "70", "71", "72"], numeros: "69-70-71-72" },
  { id: 19, nome: "Pavão", dezenas: ["73", "74", "75", "76"], numeros: "73-74-75-76" },
  { id: 20, nome: "Peru", dezenas: ["77", "78", "79", "80"], numeros: "77-78-79-80" },
  { id: 21, nome: "Touro", dezenas: ["81", "82", "83", "84"], numeros: "81-82-83-84" },
  { id: 22, nome: "Tigre", dezenas: ["85", "86", "87", "88"], numeros: "85-86-87-88" },
  { id: 23, nome: "Urso", dezenas: ["89", "90", "91", "92"], numeros: "89-90-91-92" },
  { id: 24, nome: "Veado", dezenas: ["93", "94", "95", "96"], numeros: "93-94-95-96" },
  { id: 25, nome: "Vaca", dezenas: ["97", "98", "99", "00"], numeros: "97-98-99-00" },
]

/** Normaliza número para dezena (2 dígitos): 1 -> "01", 100 -> "00" */
export function dezena(n: number): string {
  const d = Math.abs(Math.floor(n)) % 100
  return d.toString().padStart(2, "0")
}

/** Retorna o bicho correspondente a um número (usa os 2 últimos dígitos). */
export function bichoPorNumero(numero: number): Bicho {
  const dz = dezena(numero)
  const b = BICHOS.find((x) => x.dezenas.includes(dz))
  return b ?? BICHOS[0]
}

/** Ícone (emoji) para cada bicho, na ordem do id 1-25. */
export const BICHOS_ICONS: Record<number, string> = {
  1: "🦩",
  2: "🦅",
  3: "🫏",
  4: "🦋",
  5: "🐕",
  6: "🐐",
  7: "🐑",
  8: "🐪",
  9: "🐍",
  10: "🐰",
  11: "🐴",
  12: "🐘",
  13: "🐓",
  14: "🐱",
  15: "🐊",
  16: "🦁",
  17: "🐵",
  18: "🐷",
  19: "🦚",
  20: "🦃",
  21: "🐂",
  22: "🐅",
  23: "🐻",
  24: "🦌",
  25: "🐄",
}

/** Retorna o bicho por id (1-25). */
export function bichoPorId(id: number): Bicho | undefined {
  return BICHOS.find((x) => x.id === id)
}

/** Converte dezena "01"-"99","00" para número (0-99). */
export function dezenaParaNumero(d: string): number {
  if (d === "00") return 0
  return parseInt(d, 10) || 0
}

/** Converte número 0-99 para dezena "00"-"99". */
export function numeroParaDezena(n: number): string {
  const v = Math.abs(Math.floor(n)) % 100
  return v.toString().padStart(2, "0")
}

/** Meio bicho: 2 dezenas do grupo sorteadas aleatoriamente. */
export function dezenasMeioBicho(bichoId: number): [string, string] {
  const b = bichoPorId(bichoId)
  if (!b) return ["01", "02"]
  const [a, b2, c, d] = b.dezenas
  const idx = Math.random() < 0.5 ? [0, 1] : [2, 3]
  const arr = [a, b2, c, d]
  return [arr[idx[0]], arr[idx[1]]]
}
