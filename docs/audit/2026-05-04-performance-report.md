# Relatório de Auditoria de Performance

**Data:** 2026-05-04  
**Escopo:** Prisma queries, bundle size, imagens, cache/ISR  
**Base:** `docs/audit/2026-05-04-audit-plan.md`

---

## Resumo Executivo

| Categoria | Severidade | Principais Achados |
|-----------|------------|-------------------|
| Prisma Queries | **P1** | Over-fetching nos pontos mais críticos foi reduzido, índices de busca e sequence de pedido já entraram |
| Bundle Size | **P2** | CSS ainda grande e alguns componentes pesados continuam no client |
| Imagens | **P2** | Logo principal foi trocado para WebP; favicons ainda podem ser enxugados |
| Cache/ISR | **P2** | `produtos/[id]` e `sitemap` já têm fallback/revalidate, mas o layout ainda força dynamic rendering |

**Impacto no usuário:**
- TTFB alto em todas as páginas por falta de cache e static rendering
- A busca pesada já foi aliviada em staging com `pg_trgm` e índices GIN, mas ainda há consultas/admins que podem ser refinadas
- Bundle inicial pesado prejudica LCP e INP em mobile

---

## 1. Prisma Queries

### 1.1 Over-fetching Reduzido nos Pontos Críticos

**Severidade:** P1

As queries mais visíveis já foram enxugadas com `select` explícito no catálogo e no detalhe de produto. Ainda restam pontos de listagem/admin que podem ser revisados depois:

| Arquivo | Query | Colunas não usadas buscadas |
|---------|-------|----------------------------|
| `app/api/admin/orders/route.ts:60` | `db.order.findMany({ include: { items: true } })` | Todas colunas de `OrderItem` quando apenas `productName`, `quantity`, `price` são usadas na listagem |
| `app/api/admin/products/route.ts:187` | `db.product.findMany()` | Todas colunas na listagem admin |

**Fix:** Adicionar `select` em todas as queries, especialmente em listagens.

### 1.2 Missing Database Indexes

**Severidade:** P1

Antes da migration, todas as buscas com `ILIKE '%term%'` faziam full table scan porque não havia índices GIN. O estado atual em staging já inclui a migration com `pg_trgm` extension e índices GIN:

| Modelo | Coluna(s) | Uso | Índice Recomendado |
|--------|-----------|-----|-------------------|
| Product | `name`, `code`, `model` | Busca catálogo/admin (`ILIKE '%term%'`) | `pg_trgm` GIN index |
| Product | `category`, `brand` | Filtro equality | B-tree `@@index([category])`, `@@index([brand])` |
| Product | `popularity`, `price`, `createdAt` | Ordenação | B-tree individual |
| Order | `createdAt` | `findFirst({ orderBy: createdAt desc })` para gerar orderNumber | B-tree |
| Order | `status` | Filtro admin | B-tree |
| Order | `customerName`, `customerEmail`, `customerPhone` | Busca admin (`ILIKE`) | `pg_trgm` GIN |
| Order | `userId`, `createdAt` | Listagem "meus pedidos" | Composite B-tree |
| User | `role`, `updatedAt` | `getRecentUsers` | Composite B-tree |
| User | `name`, `storeName` | Busca admin | `pg_trgm` GIN |
| Product | `stockQuantity`, `minStockThreshold` | Raw query `stockQuantity <= minStockThreshold` | Expression index ou coluna computada |

**Status:** a migration com `pg_trgm` extension + índices GIN já foi aplicada em staging, junto com os `@@index` no schema.

### 1.3 Query Duplicada

**Severidade:** P2

`app/produtos/[id]/page.tsx` faz `db.product.findUnique()` duas vezes na mesma request:
- Linha 27: `generateMetadata`
- Linha 55: componente da página

Next.js App Router **não deduplica** automaticamente entre `generateMetadata` e o page component.

**Status:** a página de produto já usa `React.cache`:
```ts
const getProduct = React.cache((id: string) => db.product.findUnique({...}));
```

### 1.4 Raw Query Explosion

**Severidade:** P2

`app/api/admin/products/route.ts` tem 8 branches `$queryRaw` quase idênticas para combinações de filtros `lowStock` + `search` + `category`. Alta carga de manutenção e risco de inconsistência.

**Fix:** Consolidar em uma única query builder dinâmica com parâmetros condicionais.

### 1.5 Race Condition em orderNumber

**Severidade:** P1

`app/api/orders/create/route.ts` linha 110-117:
1. Lê último `orderNumber` (não atômico)
2. Incrementa
3. Insere (retry em P2002)

Duas requests concorrentes podem ler o mesmo `lastOrder` antes de qualquer inserir.

**Status:** a criação de pedido já migrou para sequence PostgreSQL atômica.

### 1.6 Transaction Ineficiente

**Severidade:** P2

`app/api/admin/orders/[id]/route.ts` fetcha o mesmo order até 3 vezes dentro de uma transaction:
- Linha 59-72: `findUnique` para ler
- Linha 99-111: `findUnique` para verificar conflito
- Linha 189-201: `findUnique` para refresh

**Fix:** Armazenar o primeiro resultado em variável e reutilizar.

---

## 2. Bundle Size

### 2.1 Build Output

| Métrica | Valor |
|---------|-------|
| Total build | 46 MB |
| JS + CSS assets | 3.5 MB |
| Maior chunk JS | 275 KB |
| CSS chunk | 250 KB |

### 2.2 Import de Dados Estáticos no Client

**Severidade:** P2

O `HomePageClient` ainda puxa componentes pesados e depende de HeroUI/framer-motion, mas o logo grande foi trocado para WebP e não há mais referência ao PNG de 960 KB.

**Fix:** Fetchar do servidor ou passar apenas o subset necessário via props do RSC.

### 2.3 CSS Tailwind

**Severidade:** P2

CSS chunk de 250 KB é grande para utility-first. Pode indicar:
- Purging insuficiente (muitas classes não usadas)
- Import do CSS do HeroUI inteiro sem tree-shaking

**Fix:** Verificar `tailwind.config.ts` content array; auditar se todas as páginas/routes estão listadas.

### 2.4 Code Splitting

**Severidade:** P2

Zero uso de `next/dynamic`. Componentes pesados carregam no bundle inicial:
- `MobileMenu.tsx` (importa `framer-motion`)
- `ScrollAnimation.tsx` (importa `framer-motion`)
- FAQ Accordion do HeroUI

**Fix:** Wrappar com `next/dynamic` + `ssr: false`:
```ts
const MobileMenu = dynamic(() => import('@/components/layout/MobileMenu'), { ssr: false });
```

### 2.5 HeroUI Import

**Severidade:** P2

30 arquivos importam de `@heroui/react`. O CSS é monolítico (250 KB). A tree-shaking de JS funciona, mas o CSS não.

**Fix:** Considerar migração para pacotes granulares (`@heroui/button`, `@heroui/card`) se o bundle analyzer confirmar bloat.

---

## 3. Imagens

### 3.1 Logo Principal

**Status:** resolvido

`public/logo-iron.webp`: **53 KB**. As referências de runtime e seed/template foram migradas para o formato menor.

### 3.2 Favicons

**Severidade:** P3

`public/favicons/icons/`: **1.6 MB** total. Muitos tamanhos/formatos legados podem ser redundantes.

**Fix:** Revisar e remover favicons não essenciais.

### 3.3 Formato AVIF

**Status:** resolvido

`next.config.ts` agora entrega:
```ts
images: {
  formats: ['image/avif', 'image/webp'],
  // ...existing remotePatterns
}
```

### 3.4 next/image Usage

✅ **Positivo:** Todo uso de imagens no projeto usa `next/image`. Nenhum `<img>` plain em produção. Lazy loading padrão funciona. `priority` usado corretamente no LCP da página de produto. `sizes` presente.

---

## 4. Cache e Static Rendering

### 4.1 App Inteiro Forçado em Dynamic

**Severidade:** P1

`app/layout.tsx` chama `headers()` para ler `x-nonce`. Isso força **todo o aplicativo** em dynamic rendering. Nenhuma página pode ser estática.

O middleware `proxy.ts` está ativo (convenção do Next.js 16). A chamada a `headers()` obtém o nonce injetado pelo middleware, então é funcional. O trade-off de dynamic rendering é aceito e documentado em GAP-013.

### 4.2 Zero ISR

**Severidade:** P2

`/produtos/[id]` agora usa `revalidate = 300` e `generateStaticParams` com fallback quando o banco não responde. `sitemap.xml` também passa a falhar de forma segura se o banco estiver fora.

Ainda sobra o `headers()` no layout, que mantém o app dinâmico por causa do nonce do CSP.

### 4.3 API Routes sem Cache Headers

**Severidade:** P2

Zero API routes definem `Cache-Control`. Todas as respostas usam default `private, no-cache`.

Routes que poderiam beneficiar:
- `GET /api/admin/products` — short cache (60s) se admin aceitar staleness
- `GET /api/orders` — user order history raramente muda

**Fix:** Adicionar `Cache-Control: private, max-age=60` em read-only APIs.

### 4.4 Redis Subutilizado

**Severidade:** P2

Redis configurado (`src/lib/redis.ts`) mas **usado apenas para rate limiting**. Oportunidades:
- Cache de catálogo de produtos (TTL 5 min)
- Cache de resultados de busca
- Cache de sessão

**Fix:** Implementar `unstable_cache` ou cache custom com Redis para queries frequentes.

### 4.5 Deduplicação de Prisma

**Severidade:** P2

O caso mais visível já foi tratado com `React.cache` na página de produto. Ainda assim, outras queries Prisma repetidas na mesma request podem se beneficiar de cache local.

**Fix:** Wrappar queries frequentes em `React.cache` para deduplicação intra-request.

---

## 5. Recomendações Priorizadas

| Prioridade | Ação | Impacto |
|------------|------|---------|
| **P0** | Remover `headers()` de `app/layout.tsx` (ou ativar middleware) para restaurar static rendering | TTFB reduzido em todas as páginas |
| **P1** | Refinar `select` em listagens admin remanescentes | Reduz payload DB e network |
| **P2** | Manter ISR/fallback em `/produtos/[id]` e `/sitemap.xml` | Evita regressão de build |
| **P2** | Continuar reduzindo import do client bundle | Reduz JS inicial |
| **P2** | Instalar `@next/bundle-analyzer` e auditar bundles | Identifica bloat exato |
| **P2** | Adicionar `next/dynamic` para componentes pesados | Reduz JS inicial |
| **P2** | Otimizar `logo-iron.webp` e favicons | Reduz assets estáticos |
| **P2** | Adicionar `formats: ['image/avif', 'image/webp']` | Melhor compressão de imagens |
| **P2** | Consolidar raw queries em `admin/products/route.ts` | Manutenibilidade |
| **P2** | Implementar Redis cache para catálogo | Reduz carga no DB |

---

## 6. Decisões de Negócio Pendentes (Performance)

| ID | Decisão | Impacto |
|----|---------|---------|
| D-PERF-01 | Aceitar staleness de quantos segundos no catálogo? | Define `revalidate` de ISR e cache Redis |
| D-PERF-02 | Quais APIs admin podem ter cache? | Define `Cache-Control` em read-only routes |
