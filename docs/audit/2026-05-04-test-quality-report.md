# Relatório de Auditoria de Qualidade e Testes

**Data:** 2026-05-04  
**Escopo:** Cobertura de testes, branch coverage, testes de integração, testes de segurança  
**Base:** `docs/audit/2026-05-04-audit-plan.md`

---

## Resumo Executivo

| Categoria | Severidade | Principais Achados |
|-----------|------------|-------------------|
| API Routes | **P1** | 30 rotas, **zero testes**. Coverage config exclui `app/api/` |
| Branch Coverage | **P2** | 5 arquivos com branches não cobertas (CartContext, rate-limit, checkout-validation, csp, schemas) |
| Integração | **P1** | Zero testes end-to-end (registro → login → checkout → pedido) |
| Schema Tests | **P2** | `createOrderSchema`, `bulkUpdateSchema`, `orderFeedbackSchema` sem testes |
| Segurança | **P1** | Auth bypass, admin guards, rate limit happy path não testados |

---

## 1. API Routes — Zero Cobertura

**Severidade:** P1

`vitest.config.mts` linha 27:
```ts
include: ["src/{lib,hooks,contexts,data}/**/*.{ts,tsx}"],
```

Isso **exclui explicitamente** `app/api/` do coverage. Além disso, **não existe nenhum arquivo de teste** sob `app/api/`.

**30 API routes completamente sem testes.** Rotas críticas:

| Categoria | Rota | Risco sem teste |
|-----------|------|----------------|
| Auth | `POST /api/register` | Validação de input, hash de senha |
| Auth | `POST /api/auth/forgot-password` | Rate limit, envio de email |
| Auth | `POST /api/auth/reset-password` | Validação de token |
| Checkout | `POST /api/orders/create` | Cálculo de preço, validação de estoque, criação atômica |
| Orders | `GET /api/orders` | Listagem com ownership |
| Orders | `GET /api/orders/[id]` | Ownership check |
| Orders | `PATCH /api/orders/[id]/cancel` | Transição de status |
| Admin | `GET /api/admin/products` | Listagem, filtros, search |
| Admin | `POST /api/admin/products` | CRUD com auth admin |
| Admin | `POST /api/admin/products/import` | Validação de CSV |
| Admin | `POST /api/admin/products/image` | Upload, validação MIME |
| Admin | `GET /api/admin/orders` | Listagem com include |
| Admin | `PATCH /api/admin/orders/[id]` | Transição de status + estoque |
| Admin | `GET /api/admin/users` | Listagem de usuários |
| Admin | `GET /api/admin/finance` | Cálculo financeiro |

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

## 3. Testes de Integração — Zero

**Severidade:** P1

Nenhum teste cobre fluxos completos:

| Fluxo | Status | Impacto |
|-------|--------|---------|
| Registro → Login → Checkout → Confirmação de pedido | ❌ Sem teste | Quebra no checkout só descoberta em produção |
| Admin: Login → Criar produto → Editar produto → Deletar | ❌ Sem teste | CRUD admin sem regressão |
| Admin: Criar pedido manual → Confirmar → Cancelar | ❌ Sem teste | Ciclo de vida do pedido não testado |
| Importação CSV de produtos | ❌ Sem teste | Validação de importação não testada end-to-end |
| Upload de imagem | ❌ Sem teste | Rota de upload não testada |

---

## 4. Schema Validation Tests — Incompletos

### 4.1 Schemas sem testes

`src/lib/__tests__/schemas.test.ts` cobre apenas `loginSchema` e `registerSchema`. **Faltam testes para:**

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
| 4 | Upload de imagem | Testar rota com FormData mockado |

### P2 — Incluir API routes no coverage

Considerar adicionar `app/api/` ao `include` do vitest.config.mts, ou criar suite separada de testes de integração para rotas.

---

## 7. Métricas Atuais

| Métrica | Valor | Threshold | Status |
|---------|-------|-----------|--------|
| Test files | 28 | — | ✅ |
| Tests | 248 | — | ✅ |
| Stmts | 96.61% | 90% | ✅ |
| Branch | 90.82% | 90% | ✅ (borderline) |
| Funcs | 97.07% | 90% | ✅ |
| Lines | 97.14% | 90% | ✅ |
| API routes tested | 0/30 | — | ❌ |
| Integration tests | 0 | — | ❌ |
| Security tests | 0 | — | ❌ |

---

## 8. Riscos Identificados

1. **Borderline branch coverage (90.82%)** — próximo de quebrar o gate. Qualquer novo código com branches não testadas pode falhar o pre-push.
2. **API routes sem testes** — mudanças em auth, checkout ou admin podem introduzir regressões silenciosas.
3. **Rate limit happy path não testado** — se o limiter do Redis quebrar em produção, só descobriremos quando for atacado.
4. **Schema de checkout não testado** — validação de pedido pode aceitar dados inválidos sem quebrar testes.
