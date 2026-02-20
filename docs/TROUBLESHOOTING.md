# 🔧 Guia de Solução de Problemas - WebytePlay

## Problemas Comuns e Soluções

### ❌ Erro: "pnpm command not found"
**Sintomas:** Comando `pnpm` não é reconhecido.

**Solução:**
```bash
npm install -g pnpm
```

### ❌ Erro: "Port 3000 already in use"
**Sintomas:** Aplicação não inicia porque a porta 3000 já está em uso.

**Solução no Linux/Mac:**
```bash
# Encontrar processo usando a porta
lsof -i :3000
# Ou
netstat -tulpn | grep :3000

# Matar o processo
kill -9 PID_DO_PROCESSO
```

**Solução no Windows:**
```cmd
# Encontrar processo
netstat -ano | findstr :3000

# Matar o processo
taskkill /PID PID_DO_PROCESSO /F
```

### ❌ Erro: "Module not found" ou dependências faltando
**Sintomas:** Erros de módulos não encontrados durante build ou execução.

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
pnpm install
```

### ❌ Erro: "useSearchParams() should be wrapped in a suspense boundary"
**Sintomas:** Erro no console sobre useSearchParams.

**Solução:** Já corrigido na versão 2.1.0. Se persistir, envolva o componente em `<Suspense>`.

### ❌ Erro: "Autenticação falhou" no painel admin
**Sintomas:** Não consegue alterar configurações críticas.

**Solução:** Use as credenciais corretas:
- **Usuário:** webytebr
- **Senha:** 99110990

### ❌ Erro: Gateway de pagamento não funciona
**Sintomas:** Pagamentos não são processados.

**Soluções:**
1. Verifique se as chaves de API estão corretas
2. Confirme se o webhook está configurado no painel do gateway
3. Verifique os logs: `logs/application.log`
4. Teste com uma transação de baixo valor

### ❌ Erro: Build falha
**Sintomas:** Comando `pnpm build` falha.

**Solução:**
```bash
# Verificar Node.js versão
node --version  # Deve ser 18+

# Limpar cache
pnpm store prune
rm -rf .next

# Reinstalar dependências
pnpm install

# Tentar build novamente
pnpm build
```

### ❌ Erro: Database connection failed
**Sintomas:** Erro de conexão com banco de dados.

**Solução:**
1. Verifique se PostgreSQL está rodando
2. Confirme a string de conexão em `.env.local`
3. Execute migrações: `pnpm db:migrate`
4. Para desenvolvimento, use LocalStorage (padrão)

### ❌ Erro: Webhook não está sendo chamado
**Sintomas:** Pagamentos não são confirmados automaticamente.

**Solução:**
1. Verifique se a URL do webhook está correta
2. Confirme se o servidor está acessível publicamente
3. Verifique logs do gateway de pagamento
4. Teste o endpoint manualmente: `curl -X POST your-webhook-url`

### ❌ Performance lenta
**Sintomas:** Aplicação lenta ou travando.

**Soluções:**
1. Verifique uso de memória: `top` ou Task Manager
2. Otimize imagens e assets
3. Configure cache adequado
4. Monitore com ferramentas como Vercel Analytics

### ❌ Erro 500 - Internal Server Error
**Sintomas:** Página retorna erro 500.

**Solução:**
1. Verifique logs do servidor
2. Confirme variáveis de ambiente
3. Teste endpoints da API individualmente
4. Verifique conectividade com banco de dados

## 🐛 Como Reportar Bugs

Para reportar bugs, forneça:

1. **Descrição clara** do problema
2. **Passos para reproduzir**
3. **Comportamento esperado vs atual**
4. **Logs de erro** (se aplicável)
5. **Versão do sistema** e ambiente
6. **Capturas de tela** (se visual)

**Contato para suporte:**
- 📧 E-mail: suporte@webytebr.com
- 💬 WhatsApp: (11) 98480-1839
- 📋 Issue no GitHub: [github.com/webytebr/webyteplay/issues](https://github.com/webytebr/webyteplay/issues)

## 📊 Monitoramento

### Logs Importantes
- `logs/application.log` - Logs da aplicação
- `logs/error.log` - Erros específicos
- `.next/server/logs/` - Logs do Next.js

### Ferramentas de Monitoramento
- **Vercel Analytics** - Para aplicações na Vercel
- **Sentry** - Para tracking de erros
- **DataDog** - Para monitoramento avançado

## 🔄 Recuperação de Emergência

Se o sistema parar completamente:

1. **Backup dos dados** (se possível)
2. **Reiniciar aplicação**:
   ```bash
   pnpm restart
   ```
3. **Rollback para versão anterior** (se usando controle de versão)
4. **Restaurar backup** do banco de dados

## 📞 Contato de Emergência

**Horário comercial:** Segunda a Sexta, 9h às 18h
**Plantão:** Sábado, 9h às 12h
**Emergência:** 24/7 para clientes críticos

---

**Última atualização:** Fevereiro 2025
**Versão:** 2.1.0