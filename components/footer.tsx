"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube, Github } from "lucide-react"
import { useConfiguracoes } from "@/hooks/use-configuracoes"

export default function Footer() {
  const { config, loading } = useConfiguracoes()

  useEffect(() => {
    // Script para criar partículas animadas
    const particlesContainer = document.getElementById("particles")
    if (particlesContainer) {
      const particleCount = 100

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div")
        particle.className = Math.random() > 0.5 ? "particle" : "particle green"
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`
        particle.style.animationDuration = `${Math.random() * 4 + 2}s`
        particlesContainer.appendChild(particle)
      }
    }
  }, [])

  return (
    <footer className="galaxy-footer mt-auto">
      {/* Efeitos de Fundo */}
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="clouds"></div>
      <div className="particles" id="particles"></div>

      {/* Conteúdo do Rodapé */}
      <div className="footer-content">
        <div className="flex justify-center items-center gap-8 mb-6">
          <Image src="/images/webyte.png" alt="WebytePlay Logo" width={150} height={50} className="glow" />
          <Image src="/images/kovr.png" alt="Kovr Logo" width={70} height={70} className="glow" />
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <Link href="/" className="text-white hover:text-primary transition-colors">
            Início
          </Link>
          <Link href="/rifas" className="text-white hover:text-primary transition-colors">
            Rifas
          </Link>
          <Link href="/ganhadores" className="text-white hover:text-primary transition-colors">
            Ganhadores
          </Link>
          <Link href="/como-funciona" className="text-white hover:text-primary transition-colors">
            Como Funciona
          </Link>
          <Link href="/contato" className="text-white hover:text-primary transition-colors">
            Contato
          </Link>
          <Link href="/gamificacao" className="text-white hover:text-primary transition-colors">
            Loja Virtual
          </Link>
          <Link href="/minhas-cotas" className="text-white hover:text-primary transition-colors">
            Minhas Cotas
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-accent font-bold mb-4">Contato</h4>
            <p className="animated-text">
              <a
                href={`https://wa.me/${(() => {
                  const d = (config.telefone || config.whatsapp || "").replace(/\D/g, "")
                  return d.startsWith("55") ? d : "55" + d
                })()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                📱 {config.telefone || config.whatsapp}
              </a>
              <br />{" "}
              <a href={`mailto:${config.emailContato}`} className="hover:text-primary transition-colors">
                📧 {config.emailContato}
              </a>
            </p>
          </div>

          <div>
            <h4 className="text-accent font-bold mb-4">Sobre Nós</h4>
            <p>{config.descricao}</p>
          </div>

          <div>
            <h4 className="text-accent font-bold mb-4">Redes Sociais</h4>
            <div className="flex justify-center gap-4">
              <Link
                href="https://github.com/juniorwebyte/webyteplay"
                target="_blank"
                className="text-white hover:text-primary transition-transform hover:scale-110"
              >
                <Github className="w-6 h-6" />
                <span className="sr-only">GitHub</span>
              </Link>
              {config.redesSociais.facebook && (
                <Link
                  href={config.redesSociais.facebook}
                  target="_blank"
                  className="text-white hover:text-primary transition-transform hover:scale-110"
                >
                  <Facebook className="w-6 h-6" />
                  <span className="sr-only">Facebook</span>
                </Link>
              )}
              {config.redesSociais.instagram && (
                <Link
                  href={config.redesSociais.instagram}
                  target="_blank"
                  className="text-white hover:text-primary transition-transform hover:scale-110"
                >
                  <Instagram className="w-6 h-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
              )}
              {config.redesSociais.twitter && (
                <Link
                  href={config.redesSociais.twitter}
                  target="_blank"
                  className="text-white hover:text-primary transition-transform hover:scale-110"
                >
                  <Twitter className="w-6 h-6" />
                  <span className="sr-only">Twitter</span>
                </Link>
              )}
              {config.redesSociais.youtube && (
                <Link
                  href={config.redesSociais.youtube}
                  target="_blank"
                  className="text-white hover:text-primary transition-transform hover:scale-110"
                >
                  <Youtube className="w-6 h-6" />
                  <span className="sr-only">YouTube</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <p className="animated-text mb-2">{config.textoRodape}</p>
        {config.exibirDesenvolvedor && (
          <p>
            Desenvolvido com <span className="text-red-500">❤</span> por{" "}
            <a
              href="https://webytehub.com/"
              title="Webyte Hub | Tecnologia Laravel e Desenvolvimento Web"
              target="_blank"
              className="developer-link"
              rel="noreferrer"
            >
              Webyte Hub | Tecnologia Laravel e Desenvolvimento Web
            </a>
          </p>
        )}
      </div>
    </footer>
  )
}
