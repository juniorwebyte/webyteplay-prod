// Store para funcionalidades Avançadas da Loja Virtual

export interface ConfigAssinatura {
  habilitado: boolean
  ciclos: Array<{ nome: string; dias: number; ativo: boolean }>
  cobrancaAutomatica: boolean
  lembreteRenovacao: number // dias antes
}

export interface ConfigDropshipping {
  habilitado: boolean
  fornecedores: Array<{ id: string; nome: string; apiUrl?: string; ativo: boolean }>
  markupPadrao: number
}

export interface ConfigMultiVendedor {
  habilitado: boolean
  comissaoPadrao: number
  aprovarVendedorAntesVenda: boolean
}

export interface ConfigMultiLoja {
  habilitado: boolean
  lojas: Array<{ id: string; nome: string; dominio?: string; ativo: boolean }>
}

export interface ConfigMultiArmazem {
  habilitado: boolean
  armazens: Array<{ id: string; nome: string; cep?: string; ativo: boolean }>
}

export interface ConfigRecomendacao {
  habilitado: boolean
  criterio: "vistos" | "comprados" | "categoria" | "mix"
  maxItens: number
}

export interface ConfigPrecoDinamico {
  habilitado: boolean
  regras: Array<{ tipo: "estoque" | "demanda" | "horario"; ajustePercentual: number; condicao: string }>
}

export interface ConfigABTeste {
  habilitado: boolean
  testes: Array<{ id: string; nome: string; variante: string; trafegoPercentual: number; ativo: boolean }>
}

export interface ConfigPontos {
  habilitado: boolean
  pontosPorReal: number
  valorPorPonto: number // em R$ para conversão
  validadeDias: number
  minPontosResgate: number
}

const ASSINATURA_KEY = "loja-avancado-assinatura"
const DROPSHIPPING_KEY = "loja-avancado-dropshipping"
const MULTI_VENDEDOR_KEY = "loja-avancado-multivendedor"
const MULTI_LOJA_KEY = "loja-avancado-multiloja"
const MULTI_ARMAZEM_KEY = "loja-avancado-multiarmazem"
const RECOMENDACAO_KEY = "loja-avancado-recomendacao"
const PRECO_DINAMICO_KEY = "loja-avancado-preco"
const AB_TESTE_KEY = "loja-avancado-abteste"
const PONTOS_KEY = "loja-avancado-pontos"

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
  window.dispatchEvent(new Event("avancado-loja-updated"))
}

const DEFAULT_ASSINATURA: ConfigAssinatura = { habilitado: false, ciclos: [{ nome: "Mensal", dias: 30, ativo: true }], cobrancaAutomatica: true, lembreteRenovacao: 3 }
const DEFAULT_DROPSHIPPING: ConfigDropshipping = { habilitado: false, fornecedores: [], markupPadrao: 15 }
const DEFAULT_MULTI_VENDEDOR: ConfigMultiVendedor = { habilitado: false, comissaoPadrao: 10, aprovarVendedorAntesVenda: true }
const DEFAULT_MULTI_LOJA: ConfigMultiLoja = { habilitado: false, lojas: [] }
const DEFAULT_MULTI_ARMAZEM: ConfigMultiArmazem = { habilitado: false, armazens: [] }
const DEFAULT_RECOMENDACAO: ConfigRecomendacao = { habilitado: false, criterio: "mix", maxItens: 8 }
const DEFAULT_PRECO: ConfigPrecoDinamico = { habilitado: false, regras: [] }
const DEFAULT_AB: ConfigABTeste = { habilitado: false, testes: [] }
const DEFAULT_PONTOS: ConfigPontos = { habilitado: false, pontosPorReal: 1, valorPorPonto: 0.01, validadeDias: 365, minPontosResgate: 100 }

export function getConfigAssinatura(): ConfigAssinatura {
  return { ...DEFAULT_ASSINATURA, ...getStorage<Partial<ConfigAssinatura>>(ASSINATURA_KEY, {}) }
}
export function salvarConfigAssinatura(p: Partial<ConfigAssinatura>): ConfigAssinatura {
  const cur = getConfigAssinatura()
  const updated = { ...cur, ...p }
  setStorage(ASSINATURA_KEY, updated)
  return updated
}

export function getConfigDropshipping(): ConfigDropshipping {
  return { ...DEFAULT_DROPSHIPPING, ...getStorage<Partial<ConfigDropshipping>>(DROPSHIPPING_KEY, {}) }
}
export function salvarConfigDropshipping(p: Partial<ConfigDropshipping>): ConfigDropshipping {
  const cur = getConfigDropshipping()
  const updated = { ...cur, ...p }
  setStorage(DROPSHIPPING_KEY, updated)
  return updated
}

export function getConfigMultiVendedor(): ConfigMultiVendedor {
  return { ...DEFAULT_MULTI_VENDEDOR, ...getStorage<Partial<ConfigMultiVendedor>>(MULTI_VENDEDOR_KEY, {}) }
}
export function salvarConfigMultiVendedor(p: Partial<ConfigMultiVendedor>): ConfigMultiVendedor {
  const cur = getConfigMultiVendedor()
  const updated = { ...cur, ...p }
  setStorage(MULTI_VENDEDOR_KEY, updated)
  return updated
}

export function getConfigMultiLoja(): ConfigMultiLoja {
  return { ...DEFAULT_MULTI_LOJA, ...getStorage<Partial<ConfigMultiLoja>>(MULTI_LOJA_KEY, {}) }
}
export function salvarConfigMultiLoja(p: Partial<ConfigMultiLoja>): ConfigMultiLoja {
  const cur = getConfigMultiLoja()
  const updated = { ...cur, ...p }
  setStorage(MULTI_LOJA_KEY, updated)
  return updated
}

export function getConfigMultiArmazem(): ConfigMultiArmazem {
  return { ...DEFAULT_MULTI_ARMAZEM, ...getStorage<Partial<ConfigMultiArmazem>>(MULTI_ARMAZEM_KEY, {}) }
}
export function salvarConfigMultiArmazem(p: Partial<ConfigMultiArmazem>): ConfigMultiArmazem {
  const cur = getConfigMultiArmazem()
  const updated = { ...cur, ...p }
  setStorage(MULTI_ARMAZEM_KEY, updated)
  return updated
}

export function getConfigRecomendacao(): ConfigRecomendacao {
  return { ...DEFAULT_RECOMENDACAO, ...getStorage<Partial<ConfigRecomendacao>>(RECOMENDACAO_KEY, {}) }
}
export function salvarConfigRecomendacao(p: Partial<ConfigRecomendacao>): ConfigRecomendacao {
  const cur = getConfigRecomendacao()
  const updated = { ...cur, ...p }
  setStorage(RECOMENDACAO_KEY, updated)
  return updated
}

export function getConfigPrecoDinamico(): ConfigPrecoDinamico {
  return { ...DEFAULT_PRECO, ...getStorage<Partial<ConfigPrecoDinamico>>(PRECO_DINAMICO_KEY, {}) }
}
export function salvarConfigPrecoDinamico(p: Partial<ConfigPrecoDinamico>): ConfigPrecoDinamico {
  const cur = getConfigPrecoDinamico()
  const updated = { ...cur, ...p }
  setStorage(PRECO_DINAMICO_KEY, updated)
  return updated
}

export function getConfigABTeste(): ConfigABTeste {
  return { ...DEFAULT_AB, ...getStorage<Partial<ConfigABTeste>>(AB_TESTE_KEY, {}) }
}
export function salvarConfigABTeste(p: Partial<ConfigABTeste>): ConfigABTeste {
  const cur = getConfigABTeste()
  const updated = { ...cur, ...p }
  setStorage(AB_TESTE_KEY, updated)
  return updated
}

export function getConfigPontos(): ConfigPontos {
  return { ...DEFAULT_PONTOS, ...getStorage<Partial<ConfigPontos>>(PONTOS_KEY, {}) }
}
export function salvarConfigPontos(p: Partial<ConfigPontos>): ConfigPontos {
  const cur = getConfigPontos()
  const updated = { ...cur, ...p }
  setStorage(PONTOS_KEY, updated)
  return updated
}
