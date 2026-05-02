# System Gap Audit Execution Plan

> **Modo de trabalho:** auditoria somente. Nao implementar correcoes neste plano. Achados devem ser evidenciados, classificados e registrados no relatorio.

**Spec:** `docs/superpowers/specs/2026-05-01-system-gap-audit.md`

**Documento base:** `docs/system-pillars.md`

**Relatorio esperado:** `docs/superpowers/reports/2026-05-01-system-gap-audit-report.md`

**Goal:** executar uma auditoria end-to-end do sistema Iron Distribuidora SC para identificar gaps criticos e necessarios, priorizando riscos de pedido, estoque, permissao, dados sensiveis, financeiro, operacao e testes.

**Architecture:** a auditoria percorre primeiro as fontes de verdade, depois cada pilar do sistema, depois os fluxos end-to-end e por fim a validacao automatizada. A saida e um relatorio com achados classificados por severidade, evidencia e ordem sugerida de ataque.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma 6, PostgreSQL, NextAuth.js 4, Zod, Tailwind CSS, HeroUI, Vitest, React Testing Library.

---

## Regras de Execucao

- [ ] Nao alterar codigo de aplicacao durante a auditoria.
- [ ] Nao corrigir testes durante a auditoria.
- [ ] Nao editar migrations, schema ou dados reais.
- [ ] Nao tocar em producao sem aprovacao explicita.
- [ ] Registrar qualquer bloqueio com comando, erro e impacto.
- [ ] Classificar achados com severidade `P0`, `P1`, `P2` ou `P3`.
- [ ] Para achados P0/P1, incluir evidencia concreta com arquivo, linha, rota, comando ou passo reproduzivel.
- [ ] Separar bug confirmado, risco tecnico, gap de teste, gap operacional e decisao de negocio.
- [ ] Se houver duvida de severidade, usar a maior e registrar a incerteza.

## Formato do Relatorio

Criar `docs/superpowers/reports/2026-05-01-system-gap-audit-report.md` com:

- [ ] Resumo executivo.
- [ ] Achados P0/P1 no topo.
- [ ] Tabela completa de achados.
- [ ] Evidencia por achado.
- [ ] Impacto tecnico.
- [ ] Impacto de negocio.
- [ ] Recomendacao de correcao em alto nivel.
- [ ] Ordem sugerida de ataque.
- [ ] Decisoes de negocio pendentes.
- [ ] Comandos executados e resultados.
- [ ] Itens fora de escopo.

Template de achado:

```md
### [P1] Titulo curto do gap

- Pilar: Carrinho, checkout e pedidos
- Tipo: bug confirmado | risco tecnico | gap de teste | gap operacional | decisao de negocio
- Evidencia: `arquivo:linha`, rota, comando ou passo manual
- Impacto tecnico: risco concreto no sistema
- Impacto de negocio: efeito para cliente, admin, financeiro ou operacao
- Reproducao/validacao: como confirmar
- Recomendacao: correcao em alto nivel
- Decisao necessaria: sim/nao; detalhe se houver
```

---

## Task 1: Preparacao e Inventario

**Files:**

- Read: `README.md`
- Read: `AGENTS.md`
- Read: `docs/system-pillars.md`
- Read: `docs/superpowers/specs/2026-05-01-system-gap-audit.md`
- Read: `prisma/schema.prisma`
- Read: `src/lib/auth.ts`
- Read: `src/lib/schemas.ts`

- [ ] **Step 1: Confirmar escopo**

Validar que a auditoria segue a spec e cobre todos os seis pilares.

- [ ] **Step 2: Inventariar rotas e modulos**

Run:

```bash
rtk rg --files app src prisma docs
```

Registrar no relatorio os principais donos tecnicos por dominio.

- [ ] **Step 3: Inventariar modelos e migrations**

Ler `prisma/schema.prisma` e listar entidades, enums e relacoes relevantes:

- `User`
- `Product`
- `Order`
- `OrderItem`
- `Notification`
- `OrderFeedback`
- `Role`
- `OrderStatus`
- `PaymentMethod`

- [ ] **Step 4: Criar esqueleto do relatorio**

Criar `docs/superpowers/reports/2026-05-01-system-gap-audit-report.md` com secoes vazias para os entregaveis.

Expected: relatorio criado sem achados ainda.

## Task 2: Pilar 1 - Identidade, Autenticacao e Aprovacao B2B

**Files:**

- Read: `src/lib/auth.ts`
- Read: `app/api/register/route.ts`
- Read: `app/api/auth/[...nextauth]/route.ts`
- Read: `app/api/auth/forgot-password/route.ts`
- Read: `app/api/auth/reset-password/route.ts`
- Read: `app/api/profile/route.ts`
- Read: `app/api/user/route.ts`
- Read: `app/api/admin/users/route.ts`
- Read: `app/login/page.tsx`
- Read: `app/minha-conta/page.tsx`
- Read: `app/conta-pendente/page.tsx`
- Read: `app/api/account/export/route.ts`
- Read: `app/api/account/delete/route.ts`

- [ ] **Step 1: Auditar cadastro e login**

Verificar validacao, hash de senha, rate limit, mensagens de erro, Google OAuth e populacao da sessao.

- [ ] **Step 2: Auditar aprovacao B2B**

Confirmar onde `approved` e exigido e onde apenas e exibido.

- [ ] **Step 3: Auditar permissoes admin**

Confirmar se endpoints de usuarios validam `ADMIN` server-side.

- [ ] **Step 4: Auditar privacidade de perfil**

Revisar exposicao de documento, endereco, telefone, loja e dados de conta.

- [ ] **Step 5: Registrar gaps**

Registrar qualquer achado no relatorio com severidade.

## Task 3: Pilar 2 - Catalogo, Precificacao e Estoque

**Files:**

- Read: `app/produtos/page.tsx`
- Read: `app/produtos/[id]/page.tsx`
- Read: `src/components/produtos/`
- Read: `src/lib/productUtils.ts`
- Read: `src/lib/productImport.ts`
- Read: `src/lib/validateProducts.ts`
- Read: `src/data/products.ts`
- Read: `app/api/admin/products/route.ts`
- Read: `app/api/admin/products/[id]/route.ts`
- Read: `app/api/admin/products/bulk/route.ts`
- Read: `app/api/admin/products/import/route.ts`
- Read: `src/components/admin/ProductForm.tsx`
- Read: `src/components/admin/ProductList.tsx`
- Read: `src/components/admin/StockManager.tsx`

- [ ] **Step 1: Auditar fonte de verdade de preco**

Confirmar onde preco e exibido, enviado pelo cliente e recalculado no servidor.

- [ ] **Step 2: Auditar estoque**

Confirmar consistencia entre `stockQuantity`, `inStock`, `minStockThreshold` e filtros de estoque baixo.

- [ ] **Step 3: Auditar admin de produto**

Verificar criacao, edicao, exclusao, bulk update e importacao.

- [ ] **Step 4: Auditar validacao de produto**

Comparar `productSchema`, importacao e validacoes manuais.

- [ ] **Step 5: Registrar gaps**

Registrar qualquer achado no relatorio com severidade.

## Task 4: Pilar 3 - Carrinho, Checkout e Pedidos

**Files:**

- Read: `src/contexts/CartContext.tsx`
- Read: `src/components/cart/CartDrawer.tsx`
- Read: `src/components/carrinho/CarrinhoCheckout.tsx`
- Read: `app/carrinho/page.tsx`
- Read: `app/api/orders/create/route.ts`
- Read: `app/api/orders/route.ts`
- Read: `app/api/orders/[id]/route.ts`
- Read: `app/api/orders/[id]/cancel/route.ts`
- Read: `app/api/admin/orders/route.ts`
- Read: `app/api/admin/orders/[id]/route.ts`
- Read: `app/api/admin/orders/[id]/payment/route.ts`
- Read: `app/actions/admin-order-creation.ts`
- Read: `src/lib/whatsapp.ts`

- [ ] **Step 1: Auditar carrinho**

Verificar quantidade, item inexistente, usuario nao aprovado, persistencia local e exibicao de preco.

- [ ] **Step 2: Auditar criacao de pedido**

Confirmar autenticacao, aprovacao, validacao Zod, recalculo de preco, validacao de estoque e geracao de numero sequencial.

- [ ] **Step 3: Auditar status e estoque**

Confirmar quando estoque e deduzido, se ha risco de deducao duplicada e se cancelamento reverte estoque.

- [ ] **Step 4: Auditar pedido admin**

Verificar criacao manual, cliente avulso, produto popular, estoque e pagamento.

- [ ] **Step 5: Auditar WhatsApp**

Confirmar se WhatsApp e apenas comunicacao ou se afeta estado transacional.

- [ ] **Step 6: Registrar gaps**

Registrar qualquer achado no relatorio com severidade.

## Task 5: Pilar 4 - Backoffice Operacional

**Files:**

- Read: `app/admin/page.tsx`
- Read: `app/admin/layout.tsx`
- Read: `app/admin/pedidos/`
- Read: `app/admin/products/page.tsx`
- Read: `app/admin/usuarios/page.tsx`
- Read: `app/admin/financeiro/page.tsx`
- Read: `app/admin/feedbacks/`
- Read: `src/components/admin/`
- Read: `app/api/admin/finance/route.ts`
- Read: `app/api/admin/notifications/route.ts`

- [ ] **Step 1: Auditar guarda admin**

Confirmar protecao em UI e servidor para cada area.

- [ ] **Step 2: Auditar consistencia operacional**

Verificar se telas admin mostram estados corretos, erros e filtros.

- [ ] **Step 3: Auditar financeiro**

Confirmar se o resumo diario considera status, data, pagamento e cancelamento conforme esperado.

- [ ] **Step 4: Auditar rastreabilidade**

Verificar se acoes admin criticas deixam historico suficiente.

- [ ] **Step 5: Registrar gaps**

Registrar qualquer achado no relatorio com severidade.

## Task 6: Pilar 5 - Pos-venda, Notificacoes, Feedback e Garantia

**Files:**

- Read: `src/contexts/NotificationContext.tsx`
- Read: `src/components/layout/CustomerNotificationBell.tsx`
- Read: `app/api/notifications/route.ts`
- Read: `app/api/notifications/[id]/read/route.ts`
- Read: `app/api/admin/notifications/route.ts`
- Read: `src/components/feedback/`
- Read: `app/api/orders/[id]/feedback/route.ts`
- Read: `app/api/admin/feedbacks/route.ts`
- Read: `app/garantia/page.tsx`
- Read: `src/components/garantia/GarantiaWizard.tsx`
- Read: `src/lib/whatsapp.ts`

- [ ] **Step 1: Auditar notificacoes**

Confirmar ownership, limite, leitura, eventos geradores e gaps de evento.

- [ ] **Step 2: Auditar feedback**

Confirmar ownership, status `DELIVERED`, upsert, comentario e painel admin.

- [ ] **Step 3: Auditar garantia/troca**

Confirmar se e apenas fluxo WhatsApp e registrar se ha gap de persistencia, SLA, anexos ou status.

- [ ] **Step 4: Registrar gaps**

Registrar qualquer achado no relatorio com severidade.

## Task 7: Pilar 6 - Fundacao Tecnica Transversal

**Files:**

- Read: `src/lib/schemas.ts`
- Read: `src/lib/schemas/`
- Read: `src/lib/rate-limit.ts`
- Read: `src/lib/redis.ts`
- Read: `src/lib/logger.ts`
- Read: `src/lib/prisma.ts`
- Read: `src/lib/supabase.ts`
- Read: `next.config.ts`
- Read: `.cursor/rules/`
- Read: `.cursor/skills/`
- Read: `vitest.config.mts`
- Read: `vitest.setup.ts`

- [ ] **Step 1: Auditar validacao**

Comparar schemas Zod com entradas criticas de APIs e forms.

- [ ] **Step 2: Auditar seguranca transversal**

Revisar rate limit, logs, CSP/configuracao, upload/storage e queries raw.

- [ ] **Step 3: Auditar testes**

Mapear cobertura por pilar e gaps de testes em fluxos criticos.

- [ ] **Step 4: Auditar docs e regras locais**

Confirmar aderencia a `AGENTS.md`, Brand Book, rules e skills.

- [ ] **Step 5: Registrar gaps**

Registrar qualquer achado no relatorio com severidade.

## Task 8: Validacao Automatizada

**Files:**

- Verify: `package.json`
- Verify: `vitest.config.mts`
- Verify: `eslint.config.mjs`
- Verify: `tsconfig.json`

- [ ] **Step 1: Rodar lint**

Run:

```bash
pnpm lint
```

Registrar resultado no relatorio.

- [ ] **Step 2: Rodar testes**

Run:

```bash
pnpm test:run
```

Registrar resultado no relatorio.

- [ ] **Step 3: Rodar coverage**

Run:

```bash
pnpm test:coverage
```

Registrar resultado no relatorio.

- [ ] **Step 4: Rodar build**

Run:

```bash
pnpm build
```

Registrar resultado no relatorio.

- [ ] **Step 5: Classificar falhas**

Para cada falha, registrar se e:

- preexistente;
- bloqueio da auditoria;
- achado P0/P1/P2/P3;
- dependencia de ambiente.

## Task 9: Sintese, Priorizacao e Proximos Planos

**Files:**

- Modify: `docs/superpowers/reports/2026-05-01-system-gap-audit-report.md`

- [ ] **Step 1: Consolidar achados**

Organizar achados por severidade, pilar e tipo.

- [ ] **Step 2: Priorizar P0/P1**

Listar ordem sugerida de ataque para gaps criticos e necessarios.

- [ ] **Step 3: Separar decisoes de negocio**

Marcar itens que dependem de decisao, por exemplo:

- reserva de estoque no pedido pendente;
- garantia/troca persistida no banco;
- pedido minimo;
- regra de visibilidade de preco para usuario nao aprovado;
- financeiro por data de pedido ou data de pagamento.

- [ ] **Step 4: Criar recomendacao de planos futuros**

Propor planos separados para corrigir P0/P1, sem implementar ainda.

- [ ] **Step 5: Revisao final do relatorio**

Garantir que todo achado tem evidencia e que nenhuma correcao foi misturada na auditoria.

## Definition of Done

- [ ] Relatorio criado em `docs/superpowers/reports/2026-05-01-system-gap-audit-report.md`.
- [ ] Todos os seis pilares foram analisados.
- [ ] Todos os fluxos centrais foram rastreados.
- [ ] Validacoes automaticas foram executadas ou bloqueios foram registrados.
- [ ] Achados P0/P1 estao no topo do relatorio.
- [ ] Cada achado P0/P1 tem evidencia concreta.
- [ ] Itens que exigem decisao de negocio estao separados.
- [ ] Nenhuma correcao de codigo foi feita durante a auditoria.
