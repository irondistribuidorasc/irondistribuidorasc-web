# Pilares Tecnicos do Sistema

Atualizado em: 2026-05-01

## Spec da documentacao

**Objetivo:** registrar os pilares tecnicos atuais da plataforma Iron Distribuidora SC para apoiar revisoes futuras de gaps, riscos e prioridades de evolucao.

**Escopo:** mapear dominios funcionais, modelos de dados, superficies de UI/API, regras atuais e pontos de auditoria futura. Esta documentacao descreve o estado observado no repositorio, nao uma visao desejada.

**Fora de escopo:** propor arquitetura nova, corrigir gaps, redefinir regras de negocio ou documentar detalhes completos de implementacao de cada endpoint.

**Criterios de sucesso:**

- Cada pilar precisa ter dono tecnico claro: dados, telas, APIs e regras atuais.
- Cada pilar precisa listar pontos que devem ser revisados antes de evolucoes maiores.
- A documentacao deve diferenciar funcionalidade persistida no banco de fluxos assistidos por WhatsApp/UI.

## Visao geral

O sistema e uma aplicacao web full-stack para e-commerce B2B. O fluxo central e:

1. Cliente se cadastra.
2. Admin aprova o cliente.
3. Cliente aprovado acessa catalogo, monta carrinho e cria pedido.
4. Pedido fica registrado no banco e a conversa operacional segue pelo WhatsApp.
5. Admin acompanha pedidos, usuarios, produtos, estoque, financeiro diario e feedbacks.

Stack principal:

- Next.js 16 App Router e React 19.
- TypeScript em modo strict.
- Tailwind CSS e HeroUI.
- NextAuth.js 4.
- PostgreSQL com Prisma 6.
- Vitest e React Testing Library.

Fontes tecnicas principais:

| Area | Fonte |
| --- | --- |
| Visao do produto | `README.md` |
| Contrato de IA e workflow | `AGENTS.md`, `.cursor/rules/`, `.cursor/skills/` |
| Identidade visual | `docs/Brand_Book_Iron.md` |
| Autenticacao | `docs/authentication.md`, `src/lib/auth.ts` |
| Dados | `prisma/schema.prisma`, `prisma/migrations/` |
| Validacao | `src/lib/schemas.ts`, `src/lib/schemas/` |
| Rotas web e API | `app/` |
| Componentes e estado cliente | `src/components/`, `src/contexts/`, `src/hooks/` |

## Pilar 1: Identidade, autenticacao e aprovacao B2B

### Papel no sistema

Controla quem pode acessar funcionalidades sensiveis e separa o usuario comum do administrador. No modelo B2B atual, cadastro nao equivale a liberacao comercial: o cliente precisa estar aprovado para visualizar/operar a jornada completa de compra.

### Dados principais

- `User`: identidade, contato, documento, endereco, dados da loja, `role` e `approved`.
- `Account`, `Session`, `VerificationToken`: suporte NextAuth.
- `Role`: `USER` ou `ADMIN`.

### Superficies atuais

- UI publica: `app/login/page.tsx`, `app/recuperar-senha/page.tsx`, `app/redefinir-senha/page.tsx`, `app/conta-pendente/page.tsx`.
- Area do cliente: `app/minha-conta/page.tsx`, `src/components/account/ProfileForm.tsx`.
- Admin de usuarios: `app/admin/usuarios/page.tsx`.
- APIs: `app/api/register/route.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts`, `app/api/profile/route.ts`, `app/api/user/route.ts`, `app/api/admin/users/route.ts`.
- Base de auth: `src/lib/auth.ts`.

### Regras observadas

- Login por credenciais com senha hasheada e Google OAuth opcional.
- Sessao usa JWT e carrega `id`, `role`, `approved` e dados de perfil.
- Rate limit e aplicado no fluxo de credenciais quando Redis/configuracao permitem.
- Admin lista, filtra, aprova e edita usuarios.
- Ao aprovar usuario, o sistema cria notificacao de conta aprovada.

### Pontos de auditoria futura

- Confirmar se todas as rotas protegidas validam permissao no servidor, nao apenas na UI.
- Confirmar consistencia entre `approved` no JWT e o estado mais recente no banco apos mudancas administrativas.
- Revisar fluxo de Google OAuth para usuarios ainda nao aprovados.
- Revisar se dados sensiveis de cliente/loja sao minimizados em respostas de API e sessao.
- Validar politica de exclusao/exportacao de conta contra LGPD e regras internas.

## Pilar 2: Catalogo, precificacao e estoque

### Papel no sistema

Representa o inventario comercial da distribuidora. E o ponto de entrada para busca, comparacao, escolha de itens e controle operacional de disponibilidade.

### Dados principais

- `Product`: codigo unico, nome, marca, categoria, modelo, imagem, estoque, data de reposicao, preco, descricao, tags, estoque minimo e popularidade.

### Superficies atuais

- Catalogo publico/cliente: `app/produtos/page.tsx`, `app/produtos/[id]/page.tsx`.
- Home e navegacao por categoria: `app/HomePageClient.tsx`, `src/components/layout/CategoryNavigation.tsx`.
- Componentes de catalogo: `src/components/produtos/`.
- Admin de produtos: `app/admin/products/page.tsx`, `src/components/admin/ProductForm.tsx`, `src/components/admin/ProductList.tsx`, `src/components/admin/StockManager.tsx`, `src/components/admin/ProductImport.tsx`.
- APIs: `app/api/admin/products/route.ts`, `app/api/admin/products/[id]/route.ts`, `app/api/admin/products/bulk/route.ts`, `app/api/admin/products/import/route.ts`.
- Utilitarios: `src/lib/productUtils.ts`, `src/lib/productImport.ts`, `src/lib/validateProducts.ts`, `src/data/products.ts`.

### Regras observadas

- Produto tem codigo unico.
- Categoria passa por validacao de dominio.
- Estoque baixo considera `stockQuantity <= minStockThreshold`.
- `inStock` deriva de `stockQuantity > 0` em criacao/atualizacao relevante.
- Admin pode criar, editar, excluir, importar e atualizar produtos em lote.
- Busca e filtros consideram nome, codigo, modelo, marca, categoria e estoque baixo.

### Pontos de auditoria futura

- Confirmar se preco deve aparecer para usuarios nao aprovados ou apenas clientes aprovados.
- Revisar se `inStock` e `stockQuantity` podem ficar divergentes em algum fluxo.
- Revisar concorrencia entre criacao de pedido e alteracao de estoque.
- Avaliar se importacao de produtos tem validacao suficiente para volume, duplicidade, imagem e categorias.
- Revisar se a query de estoque baixo deve ser centralizada para evitar divergencia entre API e UI.

## Pilar 3: Carrinho, checkout e pedidos

### Papel no sistema

Transforma catalogo em pedido registrado. O sistema calcula o pedido com base no preco oficial do banco, valida estoque e salva snapshot dos dados do cliente no momento da compra.

### Dados principais

- `Order`: usuario, numero unico, status, total, forma de pagamento, dados do cliente, endereco, notas e flag de WhatsApp.
- `OrderItem`: item do pedido com produto, codigo, nome, quantidade, preco e total.
- `OrderStatus`: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- `PaymentMethod`: `PIX`, `CREDIT_CARD`, `DEBIT_CARD`, `CASH`, `OTHER`.

### Superficies atuais

- Carrinho: `app/carrinho/page.tsx`, `src/contexts/CartContext.tsx`, `src/components/cart/CartDrawer.tsx`, `src/components/carrinho/CarrinhoCheckout.tsx`.
- Historico do cliente: `app/meus-pedidos/page.tsx`, `src/components/pedido/`.
- Confirmacao: `app/(pages)/pedido-confirmado/[orderId]/page.tsx`, `src/components/order/OrderConfirmationContent.tsx`.
- Admin de pedidos: `app/admin/pedidos/page.tsx`, `app/admin/pedidos/[id]/page.tsx`, `app/admin/pedidos/novo/page.tsx`, `app/admin/pedidos/[id]/print/page.tsx`.
- APIs: `app/api/orders/create/route.ts`, `app/api/orders/route.ts`, `app/api/orders/[id]/route.ts`, `app/api/orders/[id]/cancel/route.ts`, `app/api/admin/orders/route.ts`, `app/api/admin/orders/[id]/route.ts`, `app/api/admin/orders/[id]/payment/route.ts`.
- Server actions admin: `app/actions/admin-order-creation.ts`.
- Validacao de checkout: `src/lib/checkout-validation.ts`.
- WhatsApp: `src/lib/whatsapp.ts`.

### Regras observadas

- Usuario precisa estar autenticado e aprovado para criar pedido pelo checkout.
- Checkout exige nome, telefone, endereco, cidade, UF valida, CEP e forma de pagamento antes de abrir a confirmacao.
- API de criacao recalcula precos pelo banco, nao confia no preco enviado pelo cliente.
- API valida estoque antes de criar o pedido.
- Numero do pedido e sequencial a partir do ultimo pedido, com tentativas em caso de colisao.
- Status inicial do pedido do cliente e `PENDING`.
- Ao confirmar pedido no admin, estoque e deduzido em transacao.
- Atualizacao de status gera notificacao para o cliente.
- Admin pode criar pedido manualmente e cadastrar cliente avulso aprovado.

### Pontos de auditoria futura

- Revisar se pedido deveria reservar estoque no `PENDING` ou somente deduzir no `CONFIRMED`.
- Revisar concorrencia do numero sequencial de pedido em alto volume.
- Confirmar se a criacao de pedido e deducao de estoque cobrem todos os caminhos: cliente, admin, cancelamento e mudancas repetidas de status.
- Revisar reversao de estoque quando pedido confirmado e depois cancelado.
- Confirmar se o WhatsApp e apenas canal de atendimento ou se precisa de webhook/status rastreavel.
- Revisar limites de quantidade, pedido minimo e regras comerciais B2B.

## Pilar 4: Backoffice operacional

### Papel no sistema

Centraliza a operacao interna da distribuidora. O admin gerencia pedidos, usuarios, produtos, estoque, financeiro e feedbacks.

### Superficies atuais

- Dashboard admin: `app/admin/page.tsx`.
- Layout admin: `app/admin/layout.tsx`, `src/components/admin/AdminBottomNav.tsx`.
- Pedidos: `app/admin/pedidos/`, `src/components/admin/AdminOrdersTable.tsx`, `src/components/admin/OrderStatusSelector.tsx`, `src/components/admin/PaymentMethodSelector.tsx`.
- Usuarios: `app/admin/usuarios/page.tsx`.
- Produtos/estoque: `app/admin/products/page.tsx`, `src/components/admin/ProductList.tsx`, `src/components/admin/StockManager.tsx`.
- Financeiro: `app/admin/financeiro/page.tsx`, `app/api/admin/finance/route.ts`.
- Feedbacks: `app/admin/feedbacks/`, `app/api/admin/feedbacks/route.ts`.
- Notificacoes admin: `src/components/admin/NotificationBell.tsx`, `app/api/admin/notifications/route.ts`.

### Regras observadas

- Acesso admin depende de `session.user.role === "ADMIN"`.
- Dashboard lista atalhos para pedidos, usuarios, produtos, financeiro e avaliacoes.
- Financeiro atual calcula resumo diario a partir de pedidos nao cancelados.
- Notificacoes admin cobrem pedidos pendentes e estoque baixo.
- Impressao de pedido existe em rota dedicada.

### Pontos de auditoria futura

- Confirmar se todo endpoint admin valida `ADMIN` no servidor.
- Revisar consistencia entre guardas client-side e server-side.
- Avaliar se financeiro precisa considerar data de pagamento/status em vez de apenas `createdAt`.
- Revisar permissoes granulares caso exista mais de um perfil administrativo no futuro.
- Revisar trilha de auditoria para alteracoes manuais de pedido, usuario, estoque e pagamento.

## Pilar 5: Pos-venda, notificacoes, feedback e garantia

### Papel no sistema

Mantem relacionamento apos o pedido: comunica mudancas, coleta feedback e auxilia solicitacoes de garantia/troca. Parte desse pilar e persistida; garantia/troca hoje e um fluxo guiado para WhatsApp.

### Dados principais

- `Notification`: notificacoes por usuario, com titulo, mensagem, link e estado de leitura.
- `OrderFeedback`: avaliacao de pedido entregue, com nota e comentario.
- Garantia/troca: nao ha modelo dedicado no Prisma no estado atual.

### Superficies atuais

- Notificacoes cliente: `src/components/layout/CustomerNotificationBell.tsx`, `src/contexts/NotificationContext.tsx`.
- APIs de notificacao: `app/api/notifications/route.ts`, `app/api/notifications/[id]/read/route.ts`.
- Feedback cliente: `src/components/feedback/`, `app/api/orders/[id]/feedback/route.ts`.
- Feedback admin: `app/admin/feedbacks/`, `app/api/admin/feedbacks/route.ts`.
- Garantia/troca: `app/garantia/page.tsx`, `src/components/garantia/GarantiaWizard.tsx`, `src/lib/whatsapp.ts`.

### Regras observadas

- Cliente recebe notificacao quando conta e aprovada.
- Cliente recebe notificacao quando pedido muda de status.
- Cliente so pode avaliar pedido proprio.
- Feedback so pode ser enviado quando pedido esta `DELIVERED`.
- Admin ve feedbacks com filtros, paginacao, media e distribuicao de notas.
- Garantia/troca gera mensagem estruturada para WhatsApp, sem persistencia interna.

### Pontos de auditoria futura

- Decidir se garantia/troca precisa virar entidade persistida com status, anexos e historico.
- Revisar retencao e volume de notificacoes, hoje a API do cliente retorna as ultimas 20.
- Confirmar se notificacoes criticas precisam de email, push ou WhatsApp alem do app.
- Revisar moderacao/privacidade de comentarios de feedback.
- Avaliar se feedback deveria ser bloqueado apos prazo ou permitir edicao indefinida.

## Pilar 6: Fundacao tecnica transversal

### Papel no sistema

Define padroes que sustentam os pilares de negocio: validacao, seguranca, qualidade, identidade visual, integracoes e manutencao.

### Componentes atuais

- Validacao com Zod em `src/lib/schemas.ts` e `src/lib/schemas/`.
- Prisma singleton em `src/lib/prisma.ts`.
- Logger em `src/lib/logger.ts`.
- Rate limit em `src/lib/rate-limit.ts` e Redis opcional em `src/lib/redis.ts`.
- CSP com nonce por request em `proxy.ts` e `src/lib/csp.ts`.
- Supabase Storage para imagens de produto via `app/api/admin/products/image/route.ts`, `src/lib/supabase-admin.ts` e policy versionada em `supabase/migrations/`.
- WhatsApp via URL em `src/lib/whatsapp.ts`.
- Testes unitarios e componentes em `src/**/__tests__/` e `*.test.ts(x)`.
- Regras de projeto em `.cursor/rules/`.
- Skills/checklists em `.cursor/skills/`.
- Brand book em `docs/Brand_Book_Iron.md`.

### Regras observadas

- APIs devem validar entrada antes de escrever no banco.
- Erros internos sao logados e respostas ao cliente tendem a ser genericas.
- Projeto usa path alias `@/*`.
- UI deve respeitar HeroUI, Tailwind, Inter e identidade da Iron.
- Workflow do projeto exige Spec-Driven Development antes de implementacoes.
- `script-src` de producao nao permite `unsafe-inline`; scripts inline legitimos precisam de nonce.
- `style-src 'unsafe-inline'` permanece como excecao explicita de compatibilidade visual.

### Pontos de auditoria futura

- Revisar cobertura real contra o minimo esperado de `pnpm test:coverage`.
- Confirmar se todos os endpoints usam schemas centralizados em vez de validacao manual.
- Revisar politicas de CSP, headers, nonce e dominios externos quando novas integracoes forem adicionadas.
- Avaliar observabilidade de producao: logs estruturados, alertas, health checks e metricas.
- Revisar estrategia de migrations, seed, ambientes e rollback.

## Mapa rapido por dominio

| Dominio | Persistido? | Principal dono tecnico | Observacao |
| --- | --- | --- | --- |
| Usuarios e aprovacao | Sim | `User`, NextAuth, `app/api/admin/users` | Base do modelo B2B |
| Catalogo e estoque | Sim | `Product`, `app/api/admin/products` | Base comercial e operacional |
| Carrinho | Cliente/local | `CartContext`, componentes de carrinho | Estado antes de virar pedido |
| Pedidos | Sim | `Order`, `OrderItem`, APIs de orders | Centro transacional |
| Financeiro | Derivado | `Order`, `app/api/admin/finance` | Resumo diario, sem ledger proprio |
| Notificacoes | Sim | `Notification` | Comunicacao in-app |
| Feedback | Sim | `OrderFeedback` | Vinculado a pedido entregue |
| Garantia/troca | Nao | `GarantiaWizard`, WhatsApp | Fluxo assistido, sem status interno |
| Marca/design system | Documental/UI | `Brand_Book_Iron`, HeroUI/Tailwind | Restricao transversal de experiencia |

## Checklist para revisar gaps por pilar

Use esta lista antes de alterar qualquer pilar:

1. Qual regra de negocio esta sendo alterada?
2. Quais modelos Prisma sao afetados?
3. Quais rotas web e APIs expoem ou alteram esse dado?
4. A permissao e validada no servidor?
5. O schema Zod cobre a entrada?
6. Existe concorrencia, duplicidade ou risco de inconsistencia?
7. O fluxo precisa de notificacao, auditoria ou historico?
8. O comportamento atual esta coberto por teste?
9. A mudanca impacta WhatsApp, financeiro, estoque ou aprovacao de cliente?
10. A UI segue o Brand Book e os componentes/padroes existentes?
