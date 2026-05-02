# GAP-013 - CSP de producao sem `unsafe-inline` em scripts

## Objetivo

Endurecer a Content Security Policy de producao removendo `unsafe-inline` de `script-src` sem quebrar os scripts inline legitimos usados para JSON-LD e runtime do Next.js.

## Escopo

- Mover a politica CSP para uma construcao por request com nonce.
- Migrar a convencao `middleware.ts` para `proxy.ts`, mantendo as regras atuais de acesso.
- Aplicar nonce aos scripts JSON-LD em `app/layout.tsx` e `app/produtos/[id]/page.tsx`.
- Remover o header CSP estatico de `next.config.ts` para evitar politica duplicada e manter os demais headers de seguranca.
- Cobrir por teste unitario que `script-src` de producao nao contem `unsafe-inline` e inclui nonce.

## Fora de Escopo

- Remover `unsafe-inline` de `style-src`.
- Alterar regras de autenticacao/autorizacao de rotas.
- Adotar SRI experimental do Next.js.
- Validar CSP em navegador real contra ambiente publicado.

## Criterios de Sucesso

- `script-src` em producao contem `nonce-...` e nao contem `unsafe-inline`.
- `unsafe-eval` continua restrito ao ambiente de desenvolvimento.
- As rotas protegidas continuam redirecionando usuario sem permissao conforme a regra anterior.
- JSON-LD inline recebe o nonce da request.
- `pnpm lint`, `pnpm test:run`, `pnpm test:coverage`, `pnpm build` e `git diff --check` passam.

## Impactos

- A aplicacao passa a depender de renderizacao dinamica para nonce em paginas com App Router, conforme documentacao oficial do Next.js.
- Reduz a superficie de XSS ao impedir scripts inline sem nonce em producao.
- Mantem `style-src 'unsafe-inline'` como excecao explicita para compatibilidade visual, fora do GAP atual.
