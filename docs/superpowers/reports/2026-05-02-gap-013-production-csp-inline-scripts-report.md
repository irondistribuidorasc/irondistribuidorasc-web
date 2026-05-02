# GAP-013 - Production CSP Inline Scripts Report

Data: 2026-05-02

Spec: `docs/superpowers/specs/2026-05-02-gap-013-production-csp-inline-scripts.md`

Referencia: `https://nextjs.org/docs/app/guides/content-security-policy`

## Resultado

GAP-013 foi corrigido.

O `script-src` de producao nao usa mais `unsafe-inline`. A politica CSP passou a ser gerada por request em `proxy.ts`, com nonce unico e imprevisivel, e os scripts inline legitimos de JSON-LD recebem esse nonce durante a renderizacao.

## Alteracoes Tecnicas

- Criado `src/lib/csp.ts` para centralizar:
  - nome dos headers CSP e nonce;
  - geracao de nonce;
  - montagem da politica CSP.
- Criado `proxy.ts` e removido `middleware.ts`, migrando para a convencao atual do Next.js 16.
- A logica de protecao de rotas foi preservada no proxy:
  - admin exige `role === "ADMIN"`;
  - checkout aprovado continua redirecionando usuario nao aprovado;
  - rotas privadas continuam exigindo token.
- `next.config.ts` deixou de emitir CSP estatico para evitar header duplicado e remover a excecao antiga de `script-src`.
- `app/layout.tsx` e `app/produtos/[id]/page.tsx` leem `x-nonce` via `headers()` e aplicam `nonce` aos scripts JSON-LD.
- Criado `src/lib/__tests__/csp.test.ts` cobrindo a regra de producao e desenvolvimento.

## Regra Aplicada

- Producao:
  - `script-src` contem `'nonce-...'`;
  - `script-src` contem `'strict-dynamic'`;
  - `script-src` nao contem `'unsafe-inline'`;
  - `script-src` nao contem `'unsafe-eval'`.
- Desenvolvimento:
  - `script-src` mantem `'unsafe-eval'` para compatibilidade com debugging do React/Next.
- `style-src 'unsafe-inline'` permanece como excecao documentada de compatibilidade visual e nao foi tratado neste gap.

## Tradeoff Tecnico

Nonce-based CSP exige renderizacao dinamica no App Router. O build confirmou esse efeito: as rotas da aplicacao passaram a aparecer como dinamicas, enquanto assets estaticos como `robots.txt` seguem estaticos.

## Validacoes Executadas

| Comando | Resultado |
| --- | --- |
| `pnpm vitest run src/lib/__tests__/csp.test.ts` antes da implementacao | Falhou como esperado por helper inexistente |
| `pnpm vitest run src/lib/__tests__/csp.test.ts` depois da implementacao | Passou: 3 testes |
| `pnpm lint` | Passou com 1 warning preexistente em `ProductForm.tsx` |
| `pnpm test:run` | Passou: 28 arquivos, 248 testes |
| `pnpm test:coverage` | Passou: 28 arquivos, 248 testes, cobertura geral 96.61% statements e 90.82% branches |
| `pnpm build` com variaveis placeholder nao secretas | Passou |

## Proximo Passo Recomendado

Revisar se `style-src 'unsafe-inline'` pode ser removido com nonce ou hashes sem quebrar HeroUI/Tailwind/Next, e validar CSP em navegador real contra um deploy de staging.
