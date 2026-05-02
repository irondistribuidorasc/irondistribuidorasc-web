# System Gap Audit Report

Data: 2026-05-01

Spec: `docs/superpowers/specs/2026-05-01-system-gap-audit.md`

Plano: `docs/superpowers/plans/2026-05-01-system-gap-audit.md`

Documento base: `docs/system-pillars.md`

## Resumo Executivo

A auditoria encontrou **nenhum P0 confirmado**, mas encontrou **8 achados P1** que devem ser tratados antes de evolucoes maiores do sistema. Os riscos mais importantes estao concentrados em:

- confidencialidade de precos B2B;
- integridade financeira de pedidos criados pelo admin;
- consistencia de estoque nas transicoes de status;
- fechamento financeiro diario;
- importacao de produtos;
- delecao de conta apagando historico transacional;
- tooling bloqueando lint, testes, coverage e build.

A leitura confirmou que a base de autorizacao server-side existe nas principais APIs admin e APIs de pedido. O maior problema nao e ausencia total de auth; e divergencia entre regras de negocio, dados enviados ao cliente, efeitos colaterais de estoque e validacoes operacionais.

## Achados P0/P1

| ID | Sev | Pilar | Tipo | Titulo |
| --- | --- | --- | --- | --- |
| GAP-001 | P1 | Catalogo, precificacao e estoque | risco tecnico / negocio | Precos B2B sao enviados/publicados para usuarios nao aprovados |
| GAP-002 | P1 | Carrinho, checkout e pedidos | bug confirmado | Pedido manual admin confia no preco vindo do cliente |
| GAP-003 | P1 | Carrinho, checkout e pedidos | bug confirmado | Pedido manual admin nao valida nem baixa estoque |
| GAP-004 | P1 | Carrinho, checkout e pedidos | risco tecnico | Confirmacao de pedido pode gerar baixa duplicada ou oversell |
| GAP-005 | P1 | Backoffice operacional | gap operacional | Financeiro diario soma pedidos ainda nao concluido/pagos |
| GAP-006 | P1 | Catalogo, precificacao e estoque | bug confirmado | Importacao CSV aceita valores negativos de preco/estoque |
| GAP-007 | P1 | Identidade e dados | gap operacional / decisao de negocio | Exclusao de conta apaga pedidos e historico financeiro por cascade |
| GAP-008 | P1 | Fundacao tecnica | tooling | Validacoes automaticas estao bloqueadas por dependencias ausentes/lock mismatch |

## Achados Detalhados

### [P1] GAP-001 - Precos B2B sao enviados/publicados para usuarios nao aprovados

- Pilar: Catalogo, precificacao e estoque
- Tipo: risco tecnico / negocio
- Evidencia:
  - `app/produtos/page.tsx:87-115` busca produtos no servidor e inclui `price: p.price` no objeto enviado para o componente client.
  - `src/components/produtos/ProductCard.tsx:24-27` calcula permissao para ver preco, e `src/components/produtos/ProductCard.tsx:96-114` apenas esconde visualmente o preco.
  - `app/produtos/[id]/page.tsx:75-80` publica `offers.price` no JSON-LD da pagina de produto.
  - `app/actions/search-products.ts:15-35` nao valida sessao e retorna `price` no resultado da server action.
  - `src/components/layout/GlobalSearch.tsx:141-146` so renderiza preco para usuario aprovado, mas o dado ja veio no retorno.
- Impacto tecnico: a regra "preco apenas para cliente aprovado" existe na UI, mas nao na fronteira de dados. O preco pode aparecer no payload RSC, JSON-LD ou resposta da server action.
- Impacto de negocio: vazamento de tabela/precificacao de atacado para visitantes, usuarios pendentes ou concorrentes.
- Reproducao/validacao: abrir uma pagina de produto sem login e inspecionar HTML/RSC/JSON-LD; ou chamar a server action de busca a partir do client bundle.
- Recomendacao: criar uma representacao publica de produto sem `price` para usuarios nao aprovados; condicionar JSON-LD `offers.price`; proteger `searchProducts` com `auth()` ou remover `price` quando nao aprovado.
- Decisao necessaria: confirmar se algum preco pode ser publico para SEO. Se nao, tratar como correcao prioritaria.

### [P1] GAP-002 - Pedido manual admin confia no preco vindo do cliente

- Pilar: Carrinho, checkout e pedidos
- Tipo: bug confirmado
- Evidencia:
  - `app/actions/admin-order-creation.ts:10-14` aceita `price` no schema do item.
  - `app/actions/admin-order-creation.ts:251-277` busca produtos, mas calcula `itemTotal` com `item.price` e salva `price: item.price`.
  - Em contraste, o fluxo de cliente recalcula preco pelo banco em `app/api/orders/create/route.ts:41-56` e `app/api/orders/create/route.ts:95-106`.
- Impacto tecnico: um cliente/browser/admin UI modificado pode enviar preco diferente do cadastrado no produto para pedido manual.
- Impacto de negocio: pedido com total errado, margem incorreta e inconsistencia entre catalogo, pedido e financeiro.
- Reproducao/validacao: chamar `createAdminOrder` com `items[].price` diferente do produto no banco e observar pedido criado com o valor enviado.
- Recomendacao: remover `price` do input confiavel, buscar preco oficial no banco e calcular total somente no servidor.
- Decisao necessaria: nao.

### [P1] GAP-003 - Pedido manual admin nao valida nem baixa estoque

- Pilar: Carrinho, checkout e pedidos
- Tipo: bug confirmado
- Evidencia:
  - `app/actions/admin-order-creation.ts:251-277` apenas prepara itens; nao compara `quantity` com `product.stockQuantity`.
  - `app/actions/admin-order-creation.ts:307-327` cria pedido com qualquer `status`, inclusive `CONFIRMED`, sem atualizar estoque.
  - `app/actions/admin-order-creation.ts:120-139` so lista produtos com estoque, mas isso nao substitui validacao no ato de criar o pedido.
- Impacto tecnico: pedido manual pode ser criado com quantidade maior que o estoque ou ja confirmado sem baixa de inventario.
- Impacto de negocio: estoque exibido acima do real, risco de vender item indisponivel e divergencia entre pedidos manuais e pedidos de cliente.
- Reproducao/validacao: criar pedido admin com quantidade acima do estoque ou status `CONFIRMED`; verificar que `Product.stockQuantity` nao e alterado.
- Recomendacao: validar estoque dentro da transacao de criacao; se status inicial for `CONFIRMED`, aplicar a mesma rotina centralizada de baixa de estoque usada em status.
- Decisao necessaria: definir se pedido manual confirmado deve baixar estoque imediatamente.

### [P1] GAP-004 - Confirmacao de pedido pode gerar baixa duplicada ou oversell

- Pilar: Carrinho, checkout e pedidos
- Tipo: risco tecnico
- Evidencia:
  - `app/api/admin/orders/[id]/route.ts:45-60` le `existingOrder` fora da transacao e decide baixa com base nesse snapshot.
  - `app/api/admin/orders/[id]/route.ts:66-95` le estoque atual e atualiza para `Math.max(0, stockQuantity - quantity)`.
  - `app/api/admin/orders/[id]/route.ts:80-86` apenas loga estoque insuficiente e continua.
  - `app/api/admin/orders/[id]/route.ts:99-123` atualiza status e cria notificacao sem registrar uma transicao idempotente.
- Impacto tecnico: duas chamadas concorrentes para confirmar o mesmo pedido podem passar pela mesma condicao e baixar estoque duas vezes. Alem disso, estoque insuficiente nao bloqueia a confirmacao.
- Impacto de negocio: estoque incorreto, oversell silencioso e pedido confirmado sem disponibilidade real.
- Reproducao/validacao: disparar duas requisicoes `PATCH /api/admin/orders/:id` para `CONFIRMED` em paralelo; ou confirmar pedido cujo item excede o estoque atual.
- Recomendacao: mover leitura do pedido para dentro da transacao com guarda idempotente; validar estoque antes de atualizar; bloquear confirmacao quando insuficiente; centralizar transicoes de status e efeitos colaterais.
- Decisao necessaria: definir politica para estoque insuficiente: bloquear, permitir parcial ou permitir com status especial.

### [P1] GAP-005 - Financeiro diario soma pedidos ainda nao concluido/pagos

- Pilar: Backoffice operacional
- Tipo: gap operacional
- Evidencia:
  - `app/api/admin/finance/route.ts:22-30` filtra apenas por `createdAt` e `status.not = "CANCELLED"`.
  - `app/api/admin/finance/route.ts:56-73` soma todos esses pedidos por forma de pagamento.
  - Nao ha modelo de pagamento, data de pagamento ou status financeiro separado em `prisma/schema.prisma:99-148`.
- Impacto tecnico: pedidos `PENDING`, `CONFIRMED`, `PROCESSING` e `SHIPPED` entram no total diario como se fossem venda/caixa.
- Impacto de negocio: fechamento de caixa e resumo diario podem ficar inflados, principalmente se pedidos pendentes forem cancelados depois.
- Reproducao/validacao: criar pedido `PENDING` com data de hoje e consultar `/api/admin/finance`; o total inclui o pedido.
- Recomendacao: alinhar regra financeira: por status entregue, confirmado, pago ou data de pagamento. Se pagamento for relevante, adicionar estado/data de pagamento ou ledger.
- Decisao necessaria: sim. Definir o que a Iron considera "venda do dia" e "fechamento de caixa".

### [P1] GAP-006 - Importacao CSV aceita valores negativos de preco/estoque

- Pilar: Catalogo, precificacao e estoque
- Tipo: bug confirmado
- Evidencia:
  - `app/api/admin/products/import/route.ts:132-138` valida apenas `Number.isNaN(price)`, nao `price >= 0`.
  - `app/api/admin/products/import/route.ts:153-159` usa `parseInt` para `stockQuantity`, `minStockThreshold` e `popularity` sem validar `Number.isNaN` nem valores negativos.
  - `src/lib/schemas.ts:88-110` ja possui `productSchema` com `nonnegative`, mas a importacao nao reutiliza esse schema.
- Impacto tecnico: importacao pode inserir produto com preco negativo, estoque negativo, limite negativo ou popularidade invalida.
- Impacto de negocio: catalogo, ordenacao, financeiro e pedidos podem operar com valores impossiveis.
- Reproducao/validacao: importar CSV com `price=-10` ou `stockQuantity=-5`; a rota prepara `productsToUpsert` sem rejeitar a linha.
- Recomendacao: validar cada linha importada com o mesmo `productSchema` ou schema dedicado equivalente; rejeitar negativos e parse invalido antes do upsert.
- Decisao necessaria: nao.

### [P1] GAP-007 - Exclusao de conta apaga pedidos e historico financeiro por cascade

- Pilar: Identidade e dados
- Tipo: gap operacional / decisao de negocio
- Evidencia:
  - `prisma/schema.prisma:99-102` define `Order.user` com `onDelete: Cascade`.
  - `prisma/schema.prisma:151-154` define `OrderItem.order` com `onDelete: Cascade`.
  - `app/api/account/delete/route.ts:99-103` executa `db.user.delete`, acionando cascade.
  - `app/api/account/delete/route.ts:110-115` informa que todos os dados foram excluidos permanentemente.
- Impacto tecnico: ao excluir uma conta, pedidos, itens, notificacoes e sessoes relacionados podem ser removidos da base.
- Impacto de negocio: historico de vendas, comprovacao fiscal/operacional, garantia, feedback e fechamento financeiro podem perder rastreabilidade.
- Reproducao/validacao: excluir conta com pedidos; consultar pedidos/admin/financeiro depois.
- Recomendacao: separar anonimizar cliente de apagar transacoes. Preservar pedidos e itens com dados minimizados quando houver obrigacao operacional/legal.
- Decisao necessaria: sim. Definir politica LGPD/contabil: o que deve ser apagado, anonimizado ou retido por obrigacao legal.

### [P1] GAP-008 - Validacoes automaticas estao bloqueadas por dependencias ausentes/lock mismatch

- Pilar: Fundacao tecnica transversal
- Tipo: tooling
- Evidencia:
  - `pnpm lint` falhou com `eslint: command not found` e aviso de `node_modules missing`.
  - `pnpm test:run` falhou com `vitest: command not found`.
  - `pnpm test:coverage` falhou com `vitest: command not found`.
  - `pnpm build` falhou com `dotenv: command not found`.
  - `pnpm install --frozen-lockfile` falhou com `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`.
  - `package.json:9-10` declara override `tmp: >=0.2.4`; `pnpm-lock.yaml:7-8` tambem registra override, mas o pnpm local ainda reportou mismatch.
- Impacto tecnico: lint, testes, coverage e build nao conseguem ser verificados no checkout atual.
- Impacto de negocio: qualquer correcao futura fica sem baseline confiavel ate o ambiente de dependencias ser recuperado.
- Reproducao/validacao: executar os comandos listados acima no workspace atual.
- Recomendacao: resolver primeiro a instalacao reproducivel (`pnpm install --frozen-lockfile`). Se necessario, atualizar lockfile em commit isolado e depois rodar a suite completa.
- Decisao necessaria: nao, mas deve ser um pre-requisito antes de implementar fixes.

## Achados P2

| ID | Sev | Pilar | Tipo | Titulo |
| --- | --- | --- | --- | --- |
| GAP-009 | P2 | Carrinho, checkout e pedidos | gap operacional | Cancelamento nao reverte estoque para pedidos ja confirmados |
| GAP-010 | P2 | Fundacao tecnica | seguranca | Tokens de reset de senha sao persistidos em texto puro |
| GAP-011 | P2 | Fundacao tecnica | seguranca | Upload de imagem depende de politica Supabase nao visivel no repo |
| GAP-012 | P2 | Carrinho, checkout e pedidos | UX / validacao | UI do checkout permite avancar sem campos que a API exige |
| GAP-013 | P2 | Fundacao tecnica | seguranca | CSP de producao ainda usa `unsafe-inline` em `script-src` |

### [P2] GAP-009 - Cancelamento nao reverte estoque para pedidos ja confirmados

- Evidencia:
  - `app/api/orders/[id]/cancel/route.ts:35-44` permite ao cliente cancelar apenas `PENDING`.
  - `app/api/admin/orders/[id]/route.ts:31-42` permite admin mover qualquer pedido para `CANCELLED`.
  - A baixa de estoque so existe quando o novo status e `CONFIRMED` em `app/api/admin/orders/[id]/route.ts:57-97`.
- Impacto: pedido confirmado e depois cancelado por admin nao devolve estoque. Pode ser intencional, mas precisa regra explicita.
- Recomendacao: modelar transicoes permitidas e efeito de reversao quando aplicavel.
- Decisao necessaria: sim.

### [P2] GAP-010 - Tokens de reset de senha sao persistidos em texto puro

- Evidencia:
  - `app/api/auth/forgot-password/route.ts:49-60` gera token e salva o token diretamente em `VerificationToken`.
  - `app/api/auth/reset-password/route.ts:37-67` busca e deleta pelo token em texto puro.
- Impacto: se a tabela vazar, tokens ainda validos podem ser usados para redefinir senhas.
- Recomendacao: salvar hash do token e comparar hash no reset; invalidar tokens antigos do mesmo usuario ao criar novo.

### [P2] GAP-011 - Upload de imagem depende de politica Supabase nao visivel no repo

- Evidencia:
  - `src/lib/supabase.ts:3-12` cria client com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `src/components/admin/ImageUpload.tsx:91-101` faz upload direto do browser para bucket `products`.
- Impacto: a seguranca real depende das policies do bucket no Supabase, que nao estao versionadas aqui. Se o bucket aceitar `insert` anonimo amplo, qualquer usuario com a chave publica pode fazer upload.
- Recomendacao: versionar/verificar policy do bucket ou intermediar upload por rota server-side admin com validacao de tipo/tamanho.
- Decisao necessaria: verificar policy real do Supabase.

### [P2] GAP-012 - UI do checkout permite avancar sem campos que a API exige

- Evidencia:
  - `src/components/carrinho/CarrinhoCheckout.tsx:104-113` considera validos apenas nome, cidade, UF e pagamento.
  - `src/lib/schemas.ts:69-79` exige telefone, endereco e CEP no schema da API.
- Impacto: usuario pode abrir confirmacao e so descobrir campos faltantes no erro da API.
- Recomendacao: alinhar validacao client com `createOrderCustomerSchema` ou extrair schema compartilhado.

### [P2] GAP-013 - CSP de producao ainda usa `unsafe-inline` em `script-src`

- Evidencia:
  - `next.config.ts:7-9` usa `script-src 'self' 'unsafe-inline' ...` tambem fora de dev.
  - `app/layout.tsx:185-188` e `app/produtos/[id]/page.tsx:95-98` usam scripts inline JSON-LD.
- Impacto: CSP perde parte da protecao contra XSS. Pode ser aceitavel temporariamente por JSON-LD/Next, mas deve ser documentado e endurecido.
- Recomendacao: usar nonce/hash para scripts inline quando viavel, ou documentar explicitamente a excecao.

## Mapa por Pilar

| Pilar | Estado da auditoria | Principais riscos |
| --- | --- | --- |
| Identidade, autenticacao e aprovacao B2B | Revisado | cascade de delecao, token reset em texto puro, sessao carrega dados sensiveis mas APIs principais autenticam |
| Catalogo, precificacao e estoque | Revisado | vazamento de preco, importacao sem validacao equivalente ao schema |
| Carrinho, checkout e pedidos | Revisado | preco admin manipulavel, estoque nao atomico, pedido manual sem baixa/validacao |
| Backoffice operacional | Revisado | financeiro soma pedidos nao finalizados, acoes criticas sem trilha de auditoria dedicada |
| Pos-venda, notificacoes, feedback e garantia | Revisado | garantia sem persistencia e notificacoes basicas; sem P1 confirmado aqui |
| Fundacao tecnica transversal | Revisado | validacoes bloqueadas por ambiente, CSP inline, upload depende de policy externa |

## Ordem Sugerida de Ataque

1. Resolver tooling de dependencias e restaurar baseline: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm test:run`, `pnpm test:coverage`, `pnpm build`.
2. Corrigir vazamento de precos B2B: DTO publico sem preco, JSON-LD condicional, search action protegida.
3. Centralizar calculo de pedido e preco oficial para cliente e admin.
4. Centralizar transicoes de pedido/estoque em operacao idempotente e transacional.
5. Definir e corrigir regra financeira diaria.
6. Validar importacao CSV com schema forte.
7. Definir politica de delecao/anonimizacao de conta e preservacao de historico transacional.
8. Endurecer reset token, upload de imagem e CSP.

## Decisoes de Negocio Pendentes

- Preco B2B deve ser totalmente privado, inclusive SEO/JSON-LD?
- Pedido `PENDING` deve reservar estoque ou apenas pedido `CONFIRMED` baixa estoque?
- O que acontece quando estoque e insuficiente na confirmacao?
- Cancelamento admin de pedido confirmado deve devolver estoque?
- Financeiro diario considera pedido criado, confirmado, entregue ou pago?
- Conta excluida deve apagar pedidos ou anonimizar cliente mantendo transacoes?
- Garantia/troca precisa virar entidade persistida com status, anexos e SLA?

## Comandos de Validacao Executados

| Comando | Resultado |
| --- | --- |
| `pnpm lint` | Falhou: `eslint: command not found`; `node_modules` ausente |
| `pnpm install --frozen-lockfile` | Falhou: `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` |
| `pnpm test:run` | Falhou: `vitest: command not found`; `node_modules` ausente |
| `pnpm test:coverage` | Falhou: `vitest: command not found`; `node_modules` ausente |
| `pnpm build` | Falhou: `dotenv: command not found`; `node_modules` ausente |

## Itens Fora de Escopo Nesta Auditoria

- Nenhuma correcao foi implementada.
- Nenhuma migracao foi criada.
- Nenhuma validacao em producao foi executada.
- Nenhum segredo ou dado real foi solicitado.
- Nenhum ajuste de lockfile foi feito, porque o plano era auditoria sem correcao.
