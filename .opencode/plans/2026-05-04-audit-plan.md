# Plano de Auditoria: Segurança, Dependências, Performance e Qualidade

| Item | Valor |
|------|-------|
| Data | 2026-05-04 |
| Tipo | Spec-Driven Development (SDD) — plano de execução |
| Base | `docs/system-pillars.md`, `docs/superpowers/reports/2026-05-01-system-gap-audit-report.md` |
| Responsável | A definir |

---

## 1. Objetivo

Executar auditoria técnica no projeto Iron Distribuidora SC para identificar, priorizar e documentar riscos de segurança, vulnerabilidades em dependências, gargalos de performance e falhas de cobertura de testes — gerando um relatório acionável com fixes classificados por severidade.

## 2. Escopo

| Incluído | Excluído |
|----------|----------|
| Segurança: auth, autorização, middleware, headers HTTP, rate limiting, validação de inputs, CSP, tokens, LGPD | Infraestrutura de hospedagem (Vercel, Supabase console) |
| Dependências: vulnerabilidades conhecidas, compatibilidade React 19 + Next.js 16, lockfile | Código de terceiros |
| Performance: queries Prisma, bundle size, imagens, cache | Testes de carga/stress |
| Qualidade: cobertura de testes (unit + integração), testes em API routes, branch coverage gaps | Refatoração arquitetural sem justificativa de risco |

## 3. Critérios de Sucesso

1. Todo achado de segurança classificado como P0/P1 possui evidência de código e reprodução.
2. Relatório de `pnpm audit` ou equivalente documentado com plano de mitigação.
3. Lista de queries N+1 e oportunidades de otimização identificadas.
4. Gap de cobertura em API routes mapeado; testes de integração propostos para fluxos críticos (checkout, auth, admin).
5. Decisões de negócio pendentes listadas com impacto e opções.
6. Ambiente de build/teste restaurado e executando com sucesso (baseline).

## 4. Fases

### Fase 1 — Segurança (P0/P1)

**Duração estimada:** 2–3 dias  
**Pré-requisito:** ambiente restaurado (ver Fase 2, item 0)

| # | Tema | O que auditar | Base de evidência |
|---|------|---------------|-------------------|
| 1.1 | ~~Middleware inativo~~ | ~~`proxy.ts` não executa por não ser `middleware.ts`~~. **Correção:** `proxy.ts` é a convenção do Next.js 16; o middleware está ativo (confirmado pelo build). | `proxy.ts` executa como `Proxy (Middleware)` no build |
| 1.2 | Rate limiting incompleto | `POST /api/orders/create`, endpoints admin (`/api/admin/*`) e server actions sem rate limit. | `src/lib/rate-limit.ts` aplicação atual; rotas auditadas |
| 1.3 | Headers deprecated/duplicados | `X-XSS-Protection` presente; CSP em `next.config.ts` vs dinâmico conflitante. | `next.config.ts`; `proxy.ts` (se reativado) |
| 1.4 | CSRF | APIs customizadas (`/api/orders/create`, `/api/admin/*`) não verificam `Origin`/`Referer`. | Rotas POST/PUT/PATCH auditadas |
| 1.5 | Validação de PII | `phone`, `docNumber`, `postalCode` aceitam strings livres sem regex/formato. | `src/lib/schemas.ts`; `prisma/schema.prisma` |
| 1.6 | Tokens de reset de senha | `VerificationToken` armazena token em texto puro (GAP-010). | `app/api/auth/forgot-password/route.ts`; `reset-password/route.ts` |
| 1.7 | Upload de imagem | `ImageUpload.tsx` faz upload direto do browser; segurança depende de policy Supabase não versionada (GAP-011). | `src/components/admin/ImageUpload.tsx`; `src/lib/supabase.ts` |
| 1.8 | CSP inline scripts | `script-src` usa `unsafe-inline` em produção por JSON-LD (GAP-013). | `next.config.ts`; `app/layout.tsx`; `app/produtos/[id]/page.tsx` |
| 1.9 | LGPD / account deletion | `onDelete: Cascade` em `Order.user` apaga histórico transacional (GAP-007). | `prisma/schema.prisma`; `app/api/account/delete/route.ts` |
| 1.10 | Vazamento de preços B2B | Preço enviado para não aprovados via RSC, JSON-LD e server action (GAP-001). | `app/produtos/page.tsx`; `app/produtos/[id]/page.tsx`; `app/actions/search-products.ts` |
| 1.11 | Pedido manual admin | Confia no preço do cliente, não valida estoque, não baixa estoque (GAP-002, GAP-003). | `app/actions/admin-order-creation.ts` |
| 1.12 | Transição de status de pedido | Baixa de estoque não atômica; permite oversell e dupla baixa (GAP-004). | `app/api/admin/orders/[id]/route.ts` |

**Entregável:** Relatório de segurança com reprodução, severidade (P0/P1/P2) e fix proposto por item.

---

### Fase 2 — Dependências e Baseline

**Duração estimada:** 0.5–1 dia

| # | Tema | O que auditar |
|---|------|---------------|
| 2.0 | Restaurar ambiente | Resolver `pnpm-lock.yaml` mismatch; rodar `pnpm install`; validar `pnpm lint`, `pnpm test:run`, `pnpm test:coverage`, `pnpm build` (GAP-008). |
| 2.1 | Vulnerabilidades | Rodar `pnpm audit` e documentar CVEs com severidade e caminho de upgrade. |
| 2.2 | Compatibilidade React 19 | Verificar warnings de depreciação, breaking changes em `next-auth`, `@heroui/react`, `framer-motion` sob React 19. |
| 2.3 | Outdated packages | `pnpm outdated` para identificar pacotes major versions atrás. |

**Entregável:** Relatório de dependências + PR de fix do lockfile/ambiente.

---

### Fase 3 — Performance

**Duração estimada:** 1–2 dias

| # | Tema | O que auditar |
|---|------|---------------|
| 3.1 | Queries Prisma | Buscar N+1 em catálogo (`Product` + filtros), pedidos (`Order` + `items` + `user`), admin listagens. |
| 3.2 | Bundle size | `pnpm build` com `@next/bundle-analyzer` ou `ANALYZE=true`; identificar bundles pesados. |
| 3.3 | Imagens | Verificar `next/image` usage, formatos (WebP/AVIF), lazy loading, tamanhos responsivos. |
| 3.4 | Cache | Verificar `revalidate`, `fetch` cache, e se páginas de catálogo usam SSR desnecessário. |

**Entregável:** Relatório de performance com métricas antes/depois e recomendações priorizadas.

---

### Fase 4 — Qualidade e Testes

**Duração estimada:** 2–3 dias

| # | Tema | O que auditar |
|---|------|---------------|
| 4.1 | Cobertura API routes | `app/api/**/*.ts` não está no coverage config. Mapear quais rotas críticas não têm testes. |
| 4.2 | Branch coverage fraca | `CartContext.tsx` (65.78%), `rate-limit.ts` (78.57%), `checkout-validation.ts` (75%). Identificar branches não testadas. |
| 4.3 | Testes de integração | Propor testes end-to-end para: registro → login → checkout → order; admin cria pedido; importa CSV. |
| 4.4 | Testes de segurança | Verificar se rate limit, auth redirects, e admin guards têm testes (hoje excluídos por serem integration). |
| 4.5 | Testes de schema | Garantir que `productSchema`, `createOrderSchema` e schemas de importação cobrem casos de borda (negativos, vazios, tipos errados). |

**Entregável:** Plano de testes faltantes + implementação de testes críticos (mínimo 3 suites de integração).

---

## 5. Ordem de Execução Sugerida

1. **Fase 2.0 primeiro** — sem ambiente restaurado, não é possível validar builds nem rodar testes.
2. **Fase 1** — segurança é o risco mais alto; alguns itens (middleware, rate limit) são quick wins.
3. **Fase 3** — performance impacta diretamente a conversão de vendas.
4. **Fase 4** — cobertura de testes aumenta confiança para deploys futuros.
5. **Fase 2.1–2.3** — pode rodar em paralelo com Fase 1.

## 6. Decisões de Negócio Pendentes

Estas decisões bloqueiam ou impactam a severidade de alguns achados:

| ID | Decisão | Impacto nos achados |
|----|---------|---------------------|
| D-01 | Preço B2B deve ser totalmente privado (inclusive SEO/JSON-LD)? | GAP-001 |
| D-02 | Pedido `PENDING` reserva estoque ou apenas `CONFIRMED` baixa? | GAP-004 |
| D-03 | Esgotado na confirmação: bloquear, permitir parcial ou status especial? | GAP-004 |
| D-04 | Cancelamento admin de pedido confirmado devolve estoque? | GAP-009 |
| D-05 | Financeiro diário considera pedido criado, confirmado, entregue ou pago? | GAP-005 |
| D-06 | Conta excluída apaga pedidos ou anonimiza cliente mantendo transações? | GAP-007 |

**Recomendação:** agendar reunião de 30 min para decidir D-01 a D-06 antes de iniciar Fase 1.

## 7. Riscos do Próprio Plano

| Risco | Mitigação |
|-------|-----------|
| Auditoria gera muitos achados e paralisa desenvolvimento | Time-box de 1 semana; priorizar apenas P0/P1 |
| Fixes de segurança quebram funcionalidade existente | Criar testes de regressão antes de alterar auth/estoque |
| Decisões de negócio não respondidas a tempo | Levantar D-01 a D-06 no primeiro dia; usar defaults conservadores se necessário |
| Ambiente não restaura (lockfile corrompido) | Preparar plano B: recriar lockfile a partir do `package.json` com version pinning |

## 8. Entregáveis Finais

1. `docs/audit/2026-05-04-security-report.md` — achados de segurança com severidade e fix
2. `docs/audit/2026-05-04-dependencies-report.md` — vulnerabilidades e compatibilidade
3. `docs/audit/2026-05-04-performance-report.md` — queries, bundle e imagens
4. `docs/audit/2026-05-04-test-gap-report.md` — cobertura e testes propostos
5. PRs com fixes de P0/P1 e restauração de ambiente

---

## 9. Checklist de Aprovação do Plano

- [ ] Plano revisado e aprovado
- [ ] Decisões D-01 a D-06 agendadas/completadas
- [ ] Responsável alocado
- [ ] Time-box definido (sugerido: 1 sprint / 1 semana)
