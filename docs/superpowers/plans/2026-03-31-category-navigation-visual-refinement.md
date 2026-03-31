# Category Navigation Visual Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a navegacao de categorias do header em uma barra de chips responsiva, com melhor hierarquia visual em desktop e mobile, sem alterar comportamento de rotas.

**Architecture:** O trabalho fica concentrado no componente `CategoryNavigation` e no wrapper do `Header`. Primeiro, garantir por teste a estrutura acessivel e os links corretos. Depois, aplicar o refinamento visual mobile-first e ajustar o container do header para suportar scroll horizontal em telas pequenas e layout organizado em telas maiores.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Vitest, React Testing Library

---

### Task 1: Cobertura de navegacao e acessibilidade

**Files:**
- Modify: `src/components/layout/__tests__/CategoryNavigation.test.tsx`
- Modify: `src/components/layout/CategoryNavigation.tsx`

- [x] **Step 1: Write the failing test**

Adicionar testes para verificar:
- o `nav` com `aria-label` de categorias;
- `aria-current="page"` no link ativo;
- os `href`s esperados continuam iguais;
- a composicao acessivel da faixa responsiva, sem acoplar os testes a classes cosmeticas especificas.

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm test:run src/components/layout/__tests__/CategoryNavigation.test.tsx`
Expected: FAIL por ausencia de `aria-label`, `aria-current` e/ou nova estrutura acessivel esperada.

- [x] **Step 3: Write minimal implementation**

Implementar no `CategoryNavigation`:
- container mobile-first com scroll horizontal e wrap em desktop;
- links com aparencia de chip, area clicavel maior e estados ativo/inativo;
- atributos de acessibilidade preservando a logica atual de rotas.

- [x] **Step 4: Run test to verify it passes**

Run: `pnpm test:run src/components/layout/__tests__/CategoryNavigation.test.tsx`
Expected: PASS

### Task 2: Ajuste do container no header

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Create or Modify: `src/components/layout/__tests__/Header.test.tsx`
- Verify against: `docs/superpowers/specs/2026-03-31-category-navigation-visual-refinement-design.md`

- [x] **Step 1: Write the failing test**

Adicionar ou expandir teste para garantir a composicao do header com:
- faixa de categorias visivel abaixo do header no mobile;
- separacao visual de `Administração` no desktop sem misturar o item com os chips.
- Usar render do `Header` ou fixture equivalente, com asserts baseados em regioes/roles/texto e nao em classes cosmeticas ou snapshot.

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm test:run src/components/layout/__tests__/Header.test.tsx`
Expected: FAIL antes do ajuste do `Header`.

- [x] **Step 3: Write minimal implementation**

No `Header`:
- ajustar a faixa inferior para permitir a nova composicao responsiva;
- exibir a faixa de chips tambem no mobile, logo abaixo do header principal;
- manter `Administração` separado visualmente das categorias no desktop;
- evitar regressao no desktop atual.

- [x] **Step 4: Run test to verify it passes**

Run: `pnpm test:run src/components/layout/__tests__/Header.test.tsx`
Expected: PASS

### Task 3: Verificacao final

**Files:**
- Verify: `src/components/layout/CategoryNavigation.tsx`
- Verify: `src/components/layout/Header.tsx`
- Verify: `src/components/layout/__tests__/CategoryNavigation.test.tsx`

- [x] **Step 1: Run focused lint/diagnostics**

Run: `pnpm lint`
Expected: no errors introduced by the change

- [x] **Step 2: Run focused build verification**

Run: `pnpm build`
Expected: build and typecheck pass

- [x] **Step 3: Review against spec**

Confirmar manualmente:
- chips ativos/inativos com hierarquia clara;
- mobile compacto e rolavel;
- desktop organizado;
- `Administração` visualmente separado;
- sem violacao do Brand Book ou regras de acessibilidade.
