"use client"

import { useState, useEffect } from 'react'

interface Configuracao {
  nomeSite: string
  emailContato: string
  telefone: string
  whatsapp: string
  moeda: string
  fusoHorario: string
  descricao: string
  redesSociais: {
    facebook: string
    instagram: string
    twitter: string
    youtube: string
  }
  maxNumeros: string
  tempoReserva: string
  numerosAleatorios: boolean
  exibirAposPagamento: boolean
  logo: string
  favicon: string
  cores: {
    primaria: string
    secundaria: string
    fundo: string
  }
  temaEscuro: boolean
  alternarTema: boolean
  animacoes: boolean
  efeitosNeon: boolean
  textoRodape: string
  exibirDesenvolvedor: boolean
  emailRemetente: string
  nomeRemetente: string
  smtp: {
    host: string
    porta: string
    usuario: string
    senha: string
    ssl: boolean
  }
  modelosEmail: {
    boasVindas: string
    compra: string
    pagamento: string
    premiacao: string
  }
  limites: {
    maxRifas: string
    maxPremios: string
    maxCotas: string
    maxImagens: string
  }
  cache: {
    ativo: boolean
    tempo: string
    compressao: boolean
    lazyLoading: boolean
  }
  seguranca: {
    captcha: boolean
    verificacaoEmail: boolean
    verificacaoTelefone: boolean
    autenticacaoDoisFatores: boolean
  }
  manutencao: {
    modo: boolean
    mensagem: string
  }
  backup: {
    automatico: boolean
    frequencia: string
  }
}

const DEFAULT_CONFIG: Configuracao = {
  nomeSite: "WebytePlay Rifas",
  emailContato: "juniorwci70@gmail.com",
  telefone: "(11) 98480-1839",
  whatsapp: "(11) 98480-1839",
  moeda: "BRL",
  fusoHorario: "America/Sao_Paulo",
  descricao: "Plataforma de rifas com prêmios via PIX, cotas premiadas instantâneas e sorteios justos.",
  redesSociais: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: ""
  },
  maxNumeros: "1000",
  tempoReserva: "15",
  numerosAleatorios: true,
  exibirAposPagamento: true,
  logo: "/images/webyte.png",
  favicon: "/favicon.ico",
  cores: {
    primaria: "#FFB800",
    secundaria: "#00B5D8",
    fundo: "#0F0F23"
  },
  temaEscuro: true,
  alternarTema: false,
  animacoes: true,
  efeitosNeon: true,
  textoRodape: "© 2026 WebytePlay - Todos os direitos reservados.",
  exibirDesenvolvedor: true,
  emailRemetente: "noreply@webyteplay.com",
  nomeRemetente: "WebytePlay",
  smtp: {
    host: "",
    porta: "587",
    usuario: "",
    senha: "",
    ssl: true
  },
  modelosEmail: {
    boasVindas: "Bem-vindo ao WebytePlay!",
    compra: "Obrigado pela sua compra!",
    pagamento: "Seu pagamento foi confirmado!",
    premiacao: "Parabéns! Você ganhou!"
  },
  limites: {
    maxRifas: "10",
    maxPremios: "5",
    maxCotas: "1000",
    maxImagens: "10"
  },
  cache: {
    ativo: true,
    tempo: "3600",
    compressao: true,
    lazyLoading: true
  },
  seguranca: {
    captcha: false,
    verificacaoEmail: false,
    verificacaoTelefone: false,
    autenticacaoDoisFatores: false
  },
  manutencao: {
    modo: false,
    mensagem: "Sistema em manutenção. Volte em breve!"
  },
  backup: {
    automatico: true,
    frequencia: "daily"
  }
}

export function useConfiguracoes() {
  const [config, setConfig] = useState<Configuracao>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carregar configurações do localStorage
    const loadConfig = () => {
      try {
        const saved = localStorage.getItem("configuracoes")
        if (saved) {
          const parsedConfig = JSON.parse(saved)
          setConfig({ ...DEFAULT_CONFIG, ...parsedConfig })
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()

    // Escutar mudanças nas configurações
    const handleConfigUpdate = () => {
      loadConfig()
    }

    window.addEventListener("configuracoes-updated", handleConfigUpdate)
    window.addEventListener("storage", (e) => {
      if (e.key === "configuracoes") {
        handleConfigUpdate()
      }
    })

    return () => {
      window.removeEventListener("configuracoes-updated", handleConfigUpdate)
    }
  }, [])

  return { config, loading }
}

export type { Configuracao }