# WebytePlay - Sistema de Rifas Online

## 📋 Descrição

WebytePlay é uma plataforma completa de rifas online desenvolvida com Next.js, TypeScript e Tailwind CSS. O sistema permite a criação, gerenciamento e venda de rifas digitais com integração a múltiplos gateways de pagamento.

## 🚀 Funcionalidades

- ✅ **Sistema de Rifas**: Criação e gerenciamento de campanhas de rifas
- ✅ **Pagamentos Integrados**: Suporte a PIX, cartão de crédito e múltiplos gateways
- ✅ **Painel Administrativo**: Interface completa para gerenciamento
- ✅ **Gamificação**: Sistema de pontos, ranking e recompensas
- ✅ **Loja Virtual**: Venda de produtos digitais
- ✅ **Relatórios**: Análises detalhadas de vendas e performance
- ✅ **API REST**: Integração com sistemas externos
- ✅ **Responsivo**: Compatível com desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: LocalStorage (desenvolvimento) / PostgreSQL (produção)
- **Pagamentos**: PIX, Asaas, Mercado Pago, OpenPix
- **Deploy**: Vercel, Docker

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- pnpm ou npm
- Conta em gateway de pagamento (opcional)

### Instalação Local

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/webyteplay.git
   cd webyteplay
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   # ou
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```

   Edite o `.env.local` com suas configurações:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DATABASE_URL=postgresql://user:password@localhost:5432/webyteplay
   ```

4. **Execute as migrações (se aplicável)**
   ```bash
   pnpm db:migrate
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   pnpm dev
   # ou
   npm run dev
   ```

6. **Acesse a aplicação**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin

### Configuração de Produção

1. **Build da aplicação**
   ```bash
   pnpm build
   ```

2. **Inicie o servidor**
   ```bash
   pnpm start
   ```

## 🔧 Configurações Importantes

### Gateway de Pagamento

O sistema vem pré-configurado com uma chave PIX padrão. Para alterar configurações críticas:

1. Acesse o painel administrativo
2. Vá para **Gateway** ou **WebytePay**
3. Digite as credenciais de administrador:
   - **Usuário**: webytebr
   - **Senha**: 99110990

### Chave PIX Padrão

A chave PIX padrão configurada é: `4041f9dc-23a6-44fc-9c0e-2213d8f28515`

## 📚 Documentação da API

### Endpoints Principais

#### Rifas
- `GET /api/rifas` - Listar rifas ativas
- `POST /api/rifas` - Criar nova rifa
- `GET /api/rifas/[id]` - Detalhes da rifa

#### Pagamentos
- `POST /api/pix` - Gerar cobrança PIX
- `GET /api/pix/[txid]` - Status do pagamento

#### Admin
- `GET /api/admin/rifas` - Gerenciar rifas
- `POST /api/admin/gateway` - Configurar gateway

### Autenticação

Para endpoints administrativos, utilize Basic Auth ou JWT tokens.

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte seu repositório**
   ```bash
   vercel --prod
   ```

2. **Configure variáveis de ambiente**
   - Acesse o dashboard do Vercel
   - Adicione as variáveis em Settings > Environment Variables

### Docker

1. **Build da imagem**
   ```bash
   docker build -t webyteplay .
   ```

2. **Execute o container**
   ```bash
   docker run -p 3000:3000 webyteplay
   ```

### Servidor Tradicional

1. **Instale Node.js no servidor**
2. **Clone e configure**
3. **Use PM2 para gerenciamento**
   ```bash
   npm install -g pm2
   pm2 start npm --name "webyteplay" -- start
   ```

## 📊 Monitoramento

- **Logs**: Verifique `logs/` para arquivos de log
- **Performance**: Monitore com Vercel Analytics
- **Erros**: Configure Sentry para tracking de erros

## 🔒 Segurança

- Autenticação obrigatória para alterações críticas
- Validação de entrada em todas as APIs
- Rate limiting implementado
- Dados sensíveis criptografados

## 📞 Suporte

- **E-mail**: suporte@webyteplay.com
- **WhatsApp**: (11) 98480-1839
- **Documentação**: [docs.webyteplay.com](https://docs.webyteplay.com)

## 📝 Licença

Este projeto é propriedade da Webyte Desenvolvimentos.

## 🏆 Changelog

### v2.1.0 (2025-02-19)
- ✅ Implementação de autenticação para configurações críticas
- ✅ Configuração de chave PIX padrão
- ✅ Correções de bugs e melhorias de performance
- ✅ Documentação completa
- ✅ Preparação para deploy

### v2.0.0 (2025-01-15)
- ✅ Lançamento inicial do sistema de rifas
- ✅ Integração com múltiplos gateways
- ✅ Painel administrativo completo
- ✅ Sistema de gamificação

---

Desenvolvido com ❤️ pela [Webyte Desenvolvimentos](https://webytebr.com)