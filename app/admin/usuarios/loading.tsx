"use client"

import { Loader2 } from "lucide-react"

export default function Loading() {
  // Renderizar partículas
  const renderParticles = () => {
    const particles = []
    for (let i = 0; i < 20; i++) {
      const left = Math.random() * 100
      const top = Math.random() * 100
      const size = Math.random() * 3 + 1
      const delay = Math.random() * 5
      const duration = Math.random() * 10 + 5
      const isGreen = Math.random() > 0.7

      particles.push(
        <div
          key={i}
          className={`particle ${isGreen ? "green" : ""}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />,
      )
    }
    return particles
  }

  return (
    <div className="flex h-screen bg-[#0F1117] relative">
      <div className="particles absolute inset-0 pointer-events-none">{renderParticles()}</div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FFB800] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white animated-text">Carregando Usuários...</h2>
          <p className="text-gray-400 mt-2">Aguarde enquanto preparamos seus dados</p>
        </div>
      </div>

      <style jsx>{`
        .particles {
          z-index: 1;
        }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #9c27b0;
          border-radius: 50%;
          box-shadow: 0 0 10px #9c27b0, 0 0 20px #9c27b0;
          animation: float 6s ease-in-out infinite;
        }
        
        .particle.green {
          background: #00ff00;
          box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  )
}
