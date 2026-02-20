import type { Metadata } from "next"
import ParticlesContainer from "@/components/particles-container"
import LoginForm from "@/components/auth/login-form"
import Header from "@/components/header"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Login | WebytePlay",
  description: "Faça login para acessar sua conta e gerenciar suas rifas",
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <ParticlesContainer />

        <div className="z-10 w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Acesse sua conta
            </h1>
            <p className="mt-4 text-lg text-gray-300">Entre para visualizar suas cotas e participar de sorteios</p>
          </div>

          <LoginForm />
        </div>
      </div>
      <Footer />
    </>
  )
}
