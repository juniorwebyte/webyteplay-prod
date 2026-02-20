/**
 * Hook para busca de endereço pelo CEP via ViaCEP
 */

export interface EnderecoCep {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  erro?: boolean
}

export async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  const limpo = cep.replace(/\D/g, "")
  if (limpo.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`)
    const data = (await res.json()) as EnderecoCep & { erro?: boolean }
    if (data.erro) return null
    return data
  } catch {
    return null
  }
}
