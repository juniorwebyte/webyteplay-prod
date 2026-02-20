/**
 * Tipos de campanha conforme o mercado (rifas, sorteios, jogo do bicho).
 * Use estes valores em tipoCampanha e na UI para manter consistência.
 */

export const TIPOS_CAMPANHA = {
  /** Números sorteados automaticamente após confirmação do pagamento. */
  AUTOMATICO: "automatico",
  /** Usuário escolhe manualmente os números na grade (1 a quantidadeNumeros). */
  NUMEROS: "numeros",
  /** Jogo do Bicho: bicho inteiro (4 dezenas por animal). Usuário escolhe bichos. */
  FAZENDINHA: "fazendinha",
  /** Jogo do Bicho: meio bicho (2 dezenas por animal). Usuário escolhe bichos. */
  FAZENDINHA_METADE: "fazendinhaMetade",
} as const

export type TipoCampanha = (typeof TIPOS_CAMPANHA)[keyof typeof TIPOS_CAMPANHA]

export interface ConfigTipoCampanha {
  valor: TipoCampanha
  label: string
  descricao: string
  /** Na tela de participação: exibir grade de números para escolha manual */
  escolhaManualNumeros: boolean
  /** Na tela de participação: exibir grade de bichos (Jogo do Bicho) */
  escolhaBichos: boolean
  /** Após pagamento: números gerados aleatoriamente pelo sistema */
  numerosAutomaticos: boolean
  /** Quantidade de números da campanha (ex.: 100 para jogo do bicho 00-99) */
  quantidadeNumerosSugerida?: number
}

export const CONFIG_TIPOS_CAMPANHA: Record<TipoCampanha, ConfigTipoCampanha> = {
  [TIPOS_CAMPANHA.AUTOMATICO]: {
    valor: "automatico",
    label: "Automático",
    descricao: "Números sorteados automaticamente após a confirmação do pagamento.",
    escolhaManualNumeros: false,
    escolhaBichos: false,
    numerosAutomaticos: true,
  },
  [TIPOS_CAMPANHA.NUMEROS]: {
    valor: "numeros",
    label: "Números",
    descricao: "O participante escolhe manualmente os números na grade (ex.: 1 a 1000).",
    escolhaManualNumeros: true,
    escolhaBichos: false,
    numerosAutomaticos: false,
  },
  [TIPOS_CAMPANHA.FAZENDINHA]: {
    valor: "fazendinha",
    label: "Fazendinha",
    descricao: "Jogo do Bicho: bicho inteiro (4 números por animal). O participante escolhe os bichos.",
    escolhaManualNumeros: false,
    escolhaBichos: true,
    numerosAutomaticos: false,
    quantidadeNumerosSugerida: 100,
  },
  [TIPOS_CAMPANHA.FAZENDINHA_METADE]: {
    valor: "fazendinhaMetade",
    label: "Fazendinha Metade",
    descricao: "Jogo do Bicho: meio bicho (2 números por animal). O participante escolhe os bichos.",
    escolhaManualNumeros: false,
    escolhaBichos: true,
    numerosAutomaticos: false,
    quantidadeNumerosSugerida: 100,
  },
}

export function getConfigTipoCampanha(tipo: string): ConfigTipoCampanha | undefined {
  return CONFIG_TIPOS_CAMPANHA[tipo as TipoCampanha]
}

export function isTipoFazendinha(tipo: string): boolean {
  return tipo === TIPOS_CAMPANHA.FAZENDINHA || tipo === TIPOS_CAMPANHA.FAZENDINHA_METADE
}

export function isTipoNumerosManuais(tipo: string): boolean {
  return tipo === TIPOS_CAMPANHA.NUMEROS
}
