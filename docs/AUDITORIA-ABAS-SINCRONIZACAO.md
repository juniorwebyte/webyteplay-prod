# Auditoria – Abas e Sincronização Front / Painel Admin

## Resumo

Este documento descreve as abas do projeto, as fontes de dados e os eventos de sincronização entre o front (site) e o painel admin, após as correções aplicadas.

---

## 1. Painel Admin – Menu lateral (admin-sidebar)

| Rota | Label | Sincronização |
|------|--------|----------------|
| `/admin/dashboard` | Dashboard | **Ajustado:** `campanhas-updated`, `pedidos-updated`, `afiliados-updated`, `storage` (campanhas, pedidos, afiliados). Abas: Rifas (campanhas), Pagamentos (pedidos), Integrações, Afiliados, Relatórios (dados reais), Configuração. |
| `/admin/campanhas` | Campanhas | `campanhas-updated`. Lista e CRUD de campanhas. |
| `/admin/maior-menor` | Maior e Menor | Dados locais (apostas/config). |
| `/admin/pedidos` | Pedidos | `pedidos-updated`, `storage` (pedidos). Lista pedidos. |
| `/admin/relatorios` | Relatórios | **Ajustado:** `pedidos-updated`, `campanhas-updated`, `storage`. Dashboard com Vendas Totais, Rifas Vendidas e Ticket Médio reais. |
| `/admin/ranking` | Ranking | **Ajustado:** `clientes-updated`, `afiliados-updated`, `campanhas-updated`, `storage`. Abas Compradores, Afiliados e Rifas com dados reais. |
| `/admin/clientes` | Clientes | `clientes-updated`, `pedidos-updated`. |
| `/admin/afiliados` | Afiliados | `afiliados-updated`. |
| `/admin/sorteio` | Sorteio | **Ajustado:** `sorteios-updated` e `campanhas-updated` + `storage` (campanhas). Lista de campanhas no “Agendar” sempre atualizada. |
| `/admin/loja` | Loja Virtual | `loja-updated`. |
| `/admin/usuarios` | Usuários | Dados locais. |
| `/admin/webytepay` | WebytePay | `pedidos-updated`, `webytepay-updated`. |
| `/admin/gateway` | Gateway de pagamento | `pedidos-updated`. |
| `/admin/configuracao` | Configuração | Dados locais (config). |
| `/admin/logs` | Logs | Dados locais. |
| `/admin/cotas-premiadas` | Cotas Premiadas | Dados locais. |

---

## 2. Eventos globais (window) e quem dispara

| Evento | Disparado em | Quem escuta |
|--------|----------------|-------------|
| `campanhas-updated` | `campanhas-store`: salvar, atualizar, excluir, clonar | Dashboard, Campanhas, Sorteio, Relatórios, Ranking, detalhe-rifa, rifas-ativas, rifas-destaque, admin-rifas, admin-dashboard |
| `pedidos-updated` | `gateway-store`: criar pedido, confirmar pagamento, etc. | Pedidos, Gateway, WebytePay, Clientes, SelecionarCotas (após pago) |
| `clientes-updated` | `gateway-store`: registrarCliente | Clientes, Ranking |
| `afiliados-updated` | `gateway-store`: criar/atualizar afiliado, venda | Admin-afiliados, Ranking |
| `sorteios-updated` | `sorteios-store`: agendar, realizar | Admin Sorteio |
| `loja-updated` | `loja-store`: alterações na loja | Admin Loja, Loja Virtual (front) |
| `webytepay-updated` | `webytepay-store` | WebytePay |
| `gateway-updated` | `gateway-store`: salvar config | (uso conforme necessário) |
| `links-pagamento-updated` | `links-pagamento-store` | (uso conforme necessário) |

---

## 3. Abas por página

### 3.1 Admin – Dashboard (`/admin/dashboard`)

- **Abas:** Rifas, Pagamentos, Integrações, Afiliados, Relatórios, Configuração.
- **Sincronização:** 
  - **Rifas:** Lista campanhas com `campanhas-updated` e `storage` (campanhas).
  - **Pagamentos:** Componente `AdminPagamentos` usa `listarPedidos()` e escuta `pedidos-updated` e `storage` (pedidos). Filtros por status (Todos, Aprovados, Pendentes, Expirados) e busca.
  - **Integrações:** Componente `AdminIntegracoes` (configurações de Analytics, Facebook, WhatsApp).
  - **Afiliados:** Componente `AdminAfiliados` já sincronizado com `afiliados-updated`.
  - **Relatórios:** Componente `AdminRelatorios` com dados reais (Vendas Totais, Rifas Vendidas, Ticket Médio) via `pedidos-updated` e `storage` (pedidos).
  - **Configuração:** Componente `AdminConfiguracao` (dados de config local).

### 3.2 Admin – Nova/Editar Campanha (`/admin/campanhas/new`)

- **Abas:** Dados, Imagens, Descontos, Ranking, Barra de progresso, Ganhador, Cotas.
- **Comportamento:** Formulário único; ao salvar dispara `campanhas-updated`. Select de tipo de campanha controlado por `value` para refletir edição (ex.: Fazendinha Metade).

### 3.3 Admin – Sorteio (`/admin/sorteio`)

- **Abas:** Próximos, Realizados, Configurações.
- **Sincronização:** Lista de campanhas em estado local atualizada por `campanhas-updated` e `storage` (campanhas), para o dropdown “Agendar” e dados do sorteio.

### 3.4 Admin – Relatórios (`/admin/relatorios`)

- **Abas:** Dashboard, Relatórios, Exportação.
- **Sincronização:** Dashboard usa pedidos pagos e campanhas; escuta `pedidos-updated`, `campanhas-updated` e `storage`. Exibe Vendas Totais, Rifas Vendidas e Ticket Médio reais.

### 3.5 Admin – Ranking (`/admin/ranking`)

- **Abas:** Compradores, Afiliados, Rifas.
- **Sincronização:** Dados de clientes, afiliados e campanhas; escuta `clientes-updated`, `afiliados-updated`, `campanhas-updated` e `storage`. Top 3 e tabelas com dados reais.

### 3.6 Front – Detalhe da rifa (`/rifas/[id]`)

- **Abas:** Detalhes, Prêmios, Ganhadores.
- **Sincronização:** `campanhas-updated` e `storage` (campanhas) para refletir alterações da campanha.

### 3.7 Outras telas com abas

- **WebytePay:** Visão Geral, Transações, Links de Pagamento, Configurações – sincronizadas com stores e `pedidos-updated` / `webytepay-updated`.
- **Clientes:** Listar / Detalhes – `clientes-updated`, `pedidos-updated`.
- **Admin Avançado:** Gestão de Rifas, Configurações, Notificações, Integrações, Cadastro e Segurança – dados de config/gestão.
- **Gamificação, Como Funciona, Contato, etc.:** Conteúdo estático ou dados locais específicos.

---

## 4. Front – Sincronização com o painel

- **Rifas ativas / Destaque:** Leituras em `listarCampanhasAtivas()` e `listarCampanhasDestaque()`; escutam `campanhas-updated` e `storage`. Ao criar/editar/remover campanha no admin, as listas do site atualizam (na mesma aba ou em outra aba via `storage`).
- **Detalhe da rifa:** Mesma campanha por id; atualiza com `campanhas-updated` e `storage`.
- **Minhas Cotas:** Consulta por CPF/telefone em `buscarPedidosPorCpf` / `buscarPedidosPorTelefone` (dados já persistidos); não exige listener contínuo.
- **Loja Virtual (front):** Escuta `loja-updated` para refletir mudanças feitas no admin da loja.

---

## 5. Boas práticas aplicadas

1. **Selects controlados:** Onde o valor vem de dados carregados (ex.: tipo de campanha, status), uso de `value` + `onValueChange` para evitar dessincronia ao editar.
2. **Listeners de eventos:** Páginas que exibem listas ou totais derivados de campanhas, pedidos, clientes ou afiliados passaram a escutar os eventos correspondentes e, quando faz sentido, o `storage`.
3. **Storage:** Uso de `storage` para refletir mudanças feitas em outra aba (ex.: admin em uma aba, site em outra).
4. **Dados reais em Relatórios e Ranking:** Substituição de valores fixos/zerados por cálculos a partir de `listarPedidos()`, `listarCampanhas()`, `listarClientes()`, `listarAfiliados()`.

---

## 6. Como validar a sincronização

1. **Campanhas:** Criar/editar/excluir campanha no admin e verificar atualização em Dashboard, lista de Campanhas, Sorteio (dropdown Agendar), Relatórios, Ranking (aba Rifas) e no front (rifas ativas, destaque e página da rifa).
2. **Pedidos:** Simular pagamento (ou marcar pedido como pago) e verificar Pedidos, Gateway, WebytePay, Clientes, Relatórios (totais) e Ranking (compradores).
3. **Clientes/Afiliados:** Registrar cliente ou criar/atualizar afiliado e verificar Clientes e Ranking (Compradores / Afiliados).
4. **Sorteio:** Agendar/realizar sorteio e conferir abas Próximos/Realizados; alterar campanhas e conferir lista no Agendar.
5. **Loja:** Alterar itens ou config da loja no admin e conferir a Loja Virtual no front.

Com essas alterações, as abas do projeto estão alinhadas às fontes de dados e aos eventos de atualização, mantendo front e painel admin sincronizados.
