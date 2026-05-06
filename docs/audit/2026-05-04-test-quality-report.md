# Relatório de Auditoria de Qualidade e Testes

**Data:** 2026-05-04  
**Escopo:** Cobertura de testes, branch coverage, testes de integração, testes de segurança  
**Base:** `docs/audit/2026-05-04-audit-plan.md`

---

## Resumo Executivo

| Categoria | Severidade | Principais Achados |
|-----------|------------|-------------------|
| API Routes | **P1** | Rotas críticas agora têm testes dedicados, incluindo upload admin, mas `app/api/` ainda fica fora do gate global |
| Branch Coverage | **P2** | Branch coverage em 90.92%, ainda com alguns ramos residuais em `rate-limit`, `schemas` e `CartContext` |
| Integração | **P1** | Fluxos end-to-end ainda não existem |
| Schema Tests | **P2** | Schemas críticos já ganharam cobertura, incluindo pedido e lote, mas integrações de pedido/admin continuam relevantes |
| Segurança | **P1** | Guards principais cobertos; falta cobertura de fluxo completo e regressão de integração |

---

## 1. API Routes — Cobertura Direcionada

**Severidade:** P1

`vitest.config.mts` linha 27:
```ts
include: ["src/{lib,hooks,contexts,data}/**/*.{ts,tsx}"],
```

Isso **exclui explicitamente** `app/api/` do coverage global. Ainda assim, já existem testes dedicados para rotas críticas de auth, checkout e backoffice:

- `POST /api/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/orders/create`
- `GET /api/orders`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/orders`
- `GET /api/admin/users`
- `PATCH /api/admin/users`
- `GET /api/admin/finance`
- `POST /api/admin/products/image`

---

## 2. Branch Coverage — Gaps Específicos

### 2.1 `src/contexts/CartContext.tsx` — 65.78% branches

| Linha | Código Não Coberto | Por quê |
|-------|-------------------|---------|
| 131 | `default: return state;` em `cartReducer` | Nenhum teste dispatcha action type inválido |
| 151 | `if (hasAutoFilledRef.current) return;` | Só o path `false` é executado |
| 170-173 | `if (Object.keys(updates).length > 0)` | Só o path `true` é executado |
| 197 | `updateCustomer: (updates) => dispatch(...)` | Istanbul marca como não executado (sourcemap issue) |

**Fix:** Adicionar teste que:
- Dispatcha action desconhecida no reducer
- Seta `hasAutoFilledRef.current = true` e re-renderiza
- Chama `updateCustomer` com objeto vazio

### 2.2 `src/lib/rate-limit.ts` — 78.57% branches

| Linha | Código Não Coberto | Por quê |
|-------|-------------------|---------|
| 77-80 | `cleanupInMemoryStore()` — loop que deleta entries expiradas | Nenhum teste cria entry expirada |
| 95-97 | `inMemoryRateLimit()` — branch `inMemoryStore.size >= MAX_IN_MEMORY_ENTRIES` | Nenhum teste enche o store até 10.000 entries |
| 150 | `checkRateLimit()` — happy path com Redis funcionando | Testes mockam Redis indisponível; nunca mockam sucesso |

**Fix:**
- Seed `inMemoryStore` com entry expirada e chamar `cleanupInMemoryStore()`
- Preencher `inMemoryStore` até `MAX_IN_MEMORY_ENTRIES`
- Mockar `Ratelimit.limit()` retornando `{ success: true, ... }`

### 2.3 `src/lib/checkout-validation.ts` — 75% branches

| Linha | Código Não Coberto | Por quê |
|-------|-------------------|---------|
| 94 | `formatFieldList(fields)` — branch `if (fields.length <= 1)` | Todos os testes passam múltiplos campos (length 3) |

**Fix:** Testar com exatamente 1 campo faltante.

### 2.4 `src/lib/csp.ts` — 50% functions

| Linha | Código Não Coberto | Por quê |
|-------|-------------------|---------|
| 10 | `createCspNonce()` | Nenhum teste chama essa função |

**Fix:** Testar `createCspNonce()` retornando string base64 não-vazia.

### 2.5 `src/lib/schemas.ts` — 75% functions

| Linha | Código Não Coberto | Por quê |
|-------|-------------------|---------|
| 104 | `restockDate` refine function em `productSchema` | Nenhum teste passa `restockDate` válido ou inválido |

**Fix:** Testar `productSchema.safeParse({ ..., restockDate: "not-a-date" })`.

---

## 3. Testes de Integração — Ainda Ausentes

**Severidade:** P1

Ainda não há fluxo completo cobrindo:

| Fluxo | Status | Impacto |
|-------|--------|---------|
| Registro → Login → Checkout → Confirmação de pedido | ❌ Sem teste | Quebra no checkout só descoberta em produção |
| Admin: Login → Criar produto → Editar produto → Deletar | ❌ Sem teste | CRUD admin sem regressão |
| Admin: Criar pedido manual → Confirmar → Cancelar | ❌ Sem teste | Ciclo de vida do pedido não testado |
| Importação CSV de produtos | ❌ Sem teste | Validação de importação não testada end-to-end |
| Upload de imagem | ✅ Com teste | Rota de upload coberta por teste de rota |

---

## 4. Schema Validation Tests — Mais Cobertos, Mas Não Fechados

### 4.1 Schemas sem testes

`src/lib/__tests__/schemas.test.ts` já cobre `loginSchema`, `registerSchema`, `forgotPasswordSchema`, `resetPasswordSchema` e `productSchema`. Ainda valem testes mais finos para payloads de pedido e backoffice:

`src/lib/__tests__/schemas.test.ts` também cobre agora:

- `createOrderSchema`
- `createOrderItemSchema`
- `createOrderCustomerSchema`
- `bulkUpdateSchema`
- `bulkUpdateItemSchema`
- `orderFeedbackSchema`

### 4.2 `productSchema` — casos de borda não cobertos

`src/lib/__tests__/productImport.test.ts` cobre importação CSV, mas `productSchema` direto não é testado para:

- `stockQuantity` negativo
- `minStockThreshold` negativo
- `price` negativo
- `popularity` negativo
- String vazia em campos obrigatórios (`code`, `name`, `brand`, `model`)
- `restockDate` inválido ("not-a-date")
- `imageUrl` com tipo errado
- `paymentMethod` com valor fora do enum

---

## 5. Testes de Segurança — Zero

**Severidade:** P1

| Cenário | Status | Risco |
|---------|--------|-------|
| Chamada a API protegida sem session | ❌ Sem teste | Auth bypass não detectado em regressão |
| Chamada a admin API com role USER | ❌ Sem teste | Elevation of privilege não detectado |
| Rate limit retorna 429 | ❌ Sem teste | Spam proteção pode quebrar silenciosamente |
| Rate limit fallback quando Redis off | ✅ Testado | Coberto em `rate-limit.test.ts` |
| CSRF protection | ❌ Sem teste | Não existe implementação para testar |

---

## 6. Recomendações Priorizadas

### P0 — Testes Críticos (criar agora)

| # | Teste | Arquivo |
|---|-------|---------|
| 1 | `POST /api/orders/create` — happy path com mocked auth + products + order create | `app/api/orders/create/__tests__/route.test.ts` |
| 2 | `POST /api/orders/create` — 401 sem session | `app/api/orders/create/__tests__/route.test.ts` |
| 3 | `POST /api/admin/products` — 403 quando role != ADMIN | `app/api/admin/products/__tests__/route.test.ts` |
| 4 | `createOrderSchema` — validação completa (items, customer, payment) | `src/lib/__tests__/orderSchemas.test.ts` |
| 5 | `createOrderCustomerSchema` — validação de campos obrigatórios | `src/lib/__tests__/orderSchemas.test.ts` |

### P1 — Branch Coverage

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `CartContext.tsx` | Testar action inválida, autofill ref, updateCustomer vazio |
| 2 | `rate-limit.ts` | Testar cleanup de entry expirada, store cheio, Redis happy path |
| 3 | `checkout-validation.ts` | Testar com 1 campo faltante |
| 4 | `csp.ts` | Testar `createCspNonce()` |
| 5 | `schemas.ts` | Testar `restockDate` inválido em `productSchema` |

### P2 — Integração

| # | Fluxo | Abordagem |
|---|-------|-----------|
| 1 | Registro → Login → Checkout | Teste de integração com banco em memória (SQLite) ou mockado |
| 2 | Admin CRUD produto | Testar POST/GET/PATCH/DELETE com session admin |
| 3 | Admin ciclo de pedido | Criar → Confirmar → Cancelar, verificar estoque |
| 4 | Upload de imagem | ✅ Testado na rota `POST /api/admin/products/image` |

### P2 — Incluir API routes no coverage

Considerar adicionar `app/api/` ao `include` do vitest.config.mts, ou criar suite separada de testes de integração para rotas.

---

## 7. Métricas Atuais

| Métrica | Valor | Threshold | Status |
|---------|-------|-----------|--------|
| Test files | 40 | — | ✅ |
| Tests | 324 | — | ✅ |
| Stmts | 97.21% | 90% | ✅ |
| Branch | 90.92% | 90% | ✅ (borderline) |
| Funcs | 97.39% | 90% | ✅ |
| Lines | 98.11% | 90% | ✅ |
| API routes tested | Parcial | — | ✅ |
| Integration tests | 0 | — | ❌ |
| Security tests | Parcial | — | ✅ |

---

## 8. Riscos Identificados

1. **Borderline branch coverage (90.92%)** — próximo de quebrar o gate. Qualquer novo código com branches não testadas pode falhar o pre-push.
2. **API routes sem testes** — mudanças em auth, checkout ou admin podem introduzir regressões silenciosas.
3. **Rate limit happy path não testado** — se o limiter do Redis quebrar em produção, só descobriremos quando for atacado.
4. **Schema de checkout não testado** — validação de pedido pode aceitar dados inválidos sem quebrar testes.
