# Relatório de Auditoria de Performance

**Data:** 2026-05-04  
**Escopo:** Prisma queries, bundle size, imagens, cache/ISR  
**Base:** `docs/audit/2026-05-04-audit-plan.md`

---

## Resumo Executivo

| Categoria | Severidade | Principais Achados |
|-----------|------------|-------------------|
| Prisma Queries | **P1** | Over-fetching generalizado, missing indexes críticos, duplicação de queries |
| Bundle Size | **P1** | 3.5 MB JS+CSS, import de dados estáticos no client, CSS 250 KB |
| Imagens | **P2** | Logo PNG 960 KB, favicons 1.6 MB, sem AVIF |
| Cache/ISR | **P1** | App inteiro forçado em dynamic rendering, zero ISR, zero cache em APIs |

**Impacto no usuário:**
- TTFB alto em todas as páginas por falta de cache e static rendering
- Busca no catálogo faz full table scan (sem índices GIN)
- Bundle inicial pesado prejudica LCP e INP em mobile

---

## 1. Prisma Queries

### 1.1 Over-fetching Generalizado

**Severidade:** P1

Múltiplas queries buscam todas as colunas quando apenas um subconjunto é necessário:

| Arquivo | Query | Colunas não usadas buscadas |
|---------|-------|----------------------------|
| `app/produtos/page.tsx:91` | `db.product.findMany()` | `description`, `tags`, `restockDate` |
| `app/produtos/[id]/page.tsx:27,55` | `db.product.findUnique()` | `tags`, `restockDate`, `minStockThreshold`, `stockQuantity`, `popularity` |
| `app/api/admin/orders/route.ts:60` | `db.order.findMany({ include: { items: true } })` | Todas colunas de `OrderItem` quando apenas `productName`, `quantity`, `price` são usadas na listagem |
| `app/api/admin/products/route.ts:187` | `db.product.findMany()` | Todas colunas na listagem admin |

**Fix:** Adicionar `select` em todas as queries, especialmente em listagens.

### 1.2 Missing Database Indexes

**Severidade:** P1

Todas as buscas com `ILIKE '%term%'` fazem full table scan porque não há índices GIN:

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

**Fix:** Criar migration com `pg_trgm` extension + índices GIN; adicionar B-tree indexes no schema.

### 1.3 Query Duplicada

**Severidade:** P2

`app/produtos/[id]/page.tsx` faz `db.product.findUnique()` duas vezes na mesma request:
- Linha 27: `generateMetadata`
- Linha 55: componente da página

Next.js App Router **não deduplica** automaticamente entre `generateMetadata` e o page component.

**Fix:** Wrappar em `React.cache`:
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

**Fix:** Usar database sequence ou `cuid`/`uuid` para eliminar a race condition. Se sequencial for requisito de negócio, usar `SELECT FOR UPDATE` ou sequence nativa do PostgreSQL.

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

**Severidade:** P1

`app/HomePageClient.tsx` importa o array inteiro de `src/data/products.ts` (470 linhas) para o client bundle. Esse arquivo é dados estáticos de produtos.

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

### 3.1 Logo PNG Grande

**Severidade:** P2

`public/logo-iron.png`: **960 KB** (PNG). Referenciado em Header, Footer, HomePageClient.

**Fix:** Converter para WebP/AVIF; target < 100 KB. Next.js resize ajuda, mas o source é excessivo.

### 3.2 Favicons

**Severidade:** P3

`public/favicons/icons/`: **1.6 MB** total. Muitos tamanhos/formatos legados podem ser redundantes.

**Fix:** Revisar e remover favicons não essenciais.

### 3.3 Formato AVIF

**Severidade:** P2

`next.config.ts` não especifica `formats`. Default é apenas WebP.

**Fix:** Adicionar:
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

**Severidade:** P1

Nenhuma página usa ISR (`export const revalidate = N` ou `generateStaticParams`).

Páginas que deveriam ser estáticas:
- `/produtos/[id]` — dados de produto mudam pouco; ideal para ISR com `revalidate = 3600`
- `/sitemap.xml` — fetcha todos os produtos a cada request do crawler
- `/termos-de-uso`, `/politica-de-privacidade`, `/garantia` — conteúdo estático

**Fix:**
- `/produtos/[id]`: remover `force-dynamic`, adicionar `generateStaticParams` + `revalidate = 3600`
- `/sitemap.xml`: adicionar `revalidate = 86400`
- Páginas legais: deixar como static default

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

Nenhum uso de `React.cache` ou `unstable_cache` para deduplicar queries Prisma dentro de uma request.

**Fix:** Wrappar queries frequentes em `React.cache` para deduplicação intra-request.

---

## 5. Recomendações Priorizadas

| Prioridade | Ação | Impacto |
|------------|------|---------|
| **P0** | Remover `headers()` de `app/layout.tsx` (ou ativar middleware) para restaurar static rendering | TTFB reduzido em todas as páginas |
| **P0** | Adicionar `pg_trgm` GIN indexes para busca textual | Full table scan → index scan |
| **P1** | Adicionar `select` em todas as queries de listagem | Reduz payload DB e network |
| **P1** | Implementar ISR em `/produtos/[id]` e `/sitemap.xml` | Elimina DB hit em cada request |
| **P1** | Resolver race condition em `orderNumber` | Consistência de dados |
| **P1** | Remover import de `products.ts` do client bundle | Reduz JS inicial |
| **P2** | Instalar `@next/bundle-analyzer` e auditar bundles | Identifica bloat exato |
| **P2** | Adicionar `next/dynamic` para componentes pesados | Reduz JS inicial |
| **P2** | Otimizar `logo-iron.png` e favicons | Reduz assets estáticos |
| **P2** | Adicionar `formats: ['image/avif', 'image/webp']` | Melhor compressão de imagens |
| **P2** | Consolidar raw queries em `admin/products/route.ts` | Manutenibilidade |
| **P2** | Implementar Redis cache para catálogo | Reduz carga no DB |

---

## 6. Decisões de Negócio Pendentes (Performance)

| ID | Decisão | Impacto |
|----|---------|---------|
| D-PERF-01 | Aceitar staleness de quantos segundos no catálogo? | Define `revalidate` de ISR e cache Redis |
| D-PERF-02 | Quais APIs admin podem ter cache? | Define `Cache-Control` em read-only routes |
| D-PERF-03 | Ordem sequencial de `orderNumber` é requisito de negócio? | Define se usa sequence PostgreSQL ou UUID |
