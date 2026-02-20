#!/bin/bash

# Script de Deploy para WebytePlay
# Versão: 2.1.0

echo "🚀 Iniciando deploy do WebytePlay..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm não encontrado. Instale o pnpm primeiro."
    echo "npm install -g pnpm"
    exit 1
fi

echo "✅ Verificações iniciais OK"

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install --frozen-lockfile

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas"

# Verificar variáveis de ambiente
if [ ! -f ".env.local" ]; then
    echo "⚠️  Arquivo .env.local não encontrado. Copiando .env.example..."
    cp .env.example .env.local
    echo "📝 Configure o arquivo .env.local com suas credenciais"
fi

# Build da aplicação
echo "🔨 Executando build..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build"
    exit 1
fi

echo "✅ Build concluído"

# Verificar se é deploy local ou produção
read -p "🤔 Este é um deploy para produção? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Deploy para produção"

    # Verificar se Vercel CLI está instalado
    if command -v vercel &> /dev/null; then
        echo "📤 Fazendo deploy no Vercel..."
        vercel --prod
    else
        echo "⚠️  Vercel CLI não encontrado. Instalando..."
        npm install -g vercel
        vercel login
        vercel --prod
    fi
else
    echo "🏠 Deploy local"
    echo "🚀 Iniciando servidor..."
    pnpm start
fi

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure os gateways de pagamento no painel admin"
echo "2. Teste a aplicação thoroughly"
echo "3. Configure webhooks nos gateways"
echo "4. Monitore os logs da aplicação"
echo ""
echo "📞 Suporte: suporte@webytebr.com | (11) 98480-1839"