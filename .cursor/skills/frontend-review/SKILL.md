---
name: frontend-review
description: Executa review completo do frontend Next.js analisando seguranca (XSS, exposicao de dados, auth client-side) e qualidade (acessibilidade, performance, padroes de componentes, UX). Classifica achados como Critica, Sugestao ou Bom ter. Usar quando o usuario pedir review de frontend, auditoria de UI, analise de acessibilidade ou verificacao de seguranca client-side.
---

# Frontend Review

Review sistematico de seguranca e qualidade para frontend Next.js (App Router) com React 19, Hero UI, react-hook-form, Zod e Tailwind.

## Classificacao de achados

| Nivel | Icone | Significado |
|-------|-------|-------------|
| Critica | `[CRITICA]` | Vulnerabilidade exploravel ou problema grave de acessibilidade/UX. Corrigir antes de producao. |
| Sugestao | `[SUGESTAO]` | Melhoria recomendada para fortalecer seguranca ou qualidade. |
| Bom ter | `[BOM TER]` | Endurecimento adicional, boas praticas opcionais. |

## Workflow

Copie este checklist e atualize o progresso:

```
Progresso do Review:
- [ ] 1. Mapear componentes e paginas
- [ ] 2. Seguranca client-side
- [ ] 3. Autenticacao e autorizacao no frontend
- [ ] 4. Validacao e formularios
- [ ] 5. Acessibilidade (a11y)
- [ ] 6. Performance
- [ ] 7. Padroes e consistencia
- [ ] 8. Gerar relatorio
```

### Passo 1: Mapear componentes e paginas

Antes de revisar, faca o inventario do frontend:

1. Liste todas as paginas em `app/` (arquivos `page.tsx`)
2. Liste todos os componentes em `src/components/`
3. Identifique contexts em `src/contexts/` e hooks em `src/hooks/`
4. Classifique cada componente como: Server Component ou Client Component (`"use client"`)

```
Mapa do frontend:
| Arquivo | Tipo | Client/Server | Usa sessao | Recebe input |
|---------|------|---------------|------------|--------------|
| ...     | ...  | ...           | ...        | ...          |
```

### Passo 2: Seguranca client-side

**XSS:**
- Usa `dangerouslySetInnerHTML`? Se sim, o conteudo e sanitizado (ex: DOMPurify)?
- Dados do usuario sao renderizados sem escape em atributos HTML?
- URLs dinamicas em `href` ou `src` sao validadas (prevenir `javascript:` protocol)?

**Exposicao de dados:**
- Client Components recebem dados sensiveis via props (senhas, tokens, secrets)?
- Dados do servidor sao passados para o cliente sem filtrar campos sensiveis?
- `console.log` com dados sensiveis em codigo de producao?
- Variaveis `NEXT_PUBLIC_` contem secrets que deveriam ser server-only?

**Armazenamento:**
- Tokens ou dados sensiveis salvos em `localStorage`/`sessionStorage`?
- Cookies sensiveis usam flags `httpOnly`, `secure`, `sameSite`?

### Passo 3: Autenticacao e autorizacao no frontend

**Protecao de rotas:**
- Middleware (`middleware.ts`) cobre todas as rotas protegidas?
- Rotas admin verificam role antes de renderizar conteudo?
- Paginas protegidas mostram conteudo antes de redirecionar (flash)?

**useSession:**
- Componentes protegidos verificam `status === "authenticated"` antes de renderizar?
- Estado `loading` da sessao e tratado (skeleton/spinner)?
- Dados do usuario (`session.user`) sao tipados corretamente?

**Redirecionamentos:**
- URLs de redirect sao validadas (prevenir open redirect)?
- Callback URLs do login sao restritas ao dominio da aplicacao?

### Passo 4: Validacao e formularios

**Zod + react-hook-form:**
- Todos os formularios usam `zodResolver` com schema definido?
- Formularios com estado local (`useState`) deveriam usar react-hook-form?
- Schemas do frontend sao consistentes com os do backend (`src/lib/schemas.ts`)?

**UX do formulario:**
- Mensagens de erro sao claras e acessiveis (`aria-invalid`, `aria-describedby`)?
- Botao de submit desabilita durante submissao (prevenir double-submit)?
- Estado de loading visivel durante operacoes assincronas?
- Campos obrigatorios estao marcados visualmente?

**Sanitizacao:**
- Inputs de texto livre sao limitados em tamanho (maxLength)?
- Inputs numericos usam `type="number"` ou mascara adequada?
- Campos de email usam `type="email"` para validacao nativa?

### Passo 5: Acessibilidade (a11y)

Referencia: `docs/Brand_Book_Iron.md` (contraste 4.5:1, toque 44x44px)

**Semantica HTML:**
- Usa elementos semanticos (`nav`, `main`, `section`, `article`, `aside`)?
- Headings seguem hierarquia (`h1` > `h2` > `h3`, sem pular niveis)?
- Listas usam `ul`/`ol` + `li`?

**ARIA:**
- Botoes de icone tem `aria-label` descritivo?
- Modais usam `role="dialog"` e `aria-modal="true"`?
- Estados dinamicos usam `aria-live` para anunciar mudancas?
- Formularios associam labels aos inputs (`htmlFor` ou `aria-labelledby`)?

**Interacao:**
- Todos os elementos interativos sao acessiveis por teclado (Tab, Enter, Escape)?
- Foco visivel em todos os elementos interativos (`focus:ring` ou equivalente)?
- Areas de toque tem minimo 44x44px em mobile?
- Trap de foco em modais e drawers?

**Visual:**
- Contraste de texto atende 4.5:1 (AA) para texto normal e 3:1 para texto grande?
- Informacao nao e transmitida apenas por cor (usar icone/texto tambem)?
- Imagens tem `alt` descritivo (ou `alt=""` se decorativa)?

### Passo 6: Performance

**Imagens:**
- Usa `next/image` em vez de `<img>` nativo?
- Imagens acima do fold usam `priority`?
- Imagens abaixo do fold usam lazy loading (padrao do next/image)?
- Formatos modernos (WebP/AVIF) via `next/image`?

**Bundle:**
- Componentes pesados usam `dynamic()` com `ssr: false` quando apropriado?
- Bibliotecas grandes sao importadas seletivamente (tree-shaking)?
- `"use client"` esta no nivel mais baixo possivel da arvore?

**Renderizacao:**
- Listas grandes usam virtualizacao?
- `useMemo`/`useCallback` em calculos ou callbacks caros passados como props?
- Context providers nao causam re-render desnecessario em toda a arvore?
- Suspense boundaries com fallbacks adequados?

**Data fetching:**
- Server Components buscam dados no servidor (evitar fetch no cliente quando possivel)?
- Requests duplicados entre componentes?
- Cache e revalidacao configurados (`revalidate`, `cache`)?

### Passo 7: Padroes e consistencia

**Brand Book** (`docs/Brand_Book_Iron.md`):
- Cores usam tokens do design system (`brand-500`, `success`, `error`)?
- Tipografia segue hierarquia definida (Inter, pesos corretos)?
- Espacamento segue grid de 4px?
- Componentes seguem padroes definidos (botoes, cards, badges)?

**Tema light/dark:**
- Todos os componentes funcionam em ambos os temas?
- Cores hardcoded que quebram no tema alternativo?
- Usa classes Tailwind de tema (`dark:`) ou variaveis CSS?

**Feedback ao usuario:**
- Acoes assincronas mostram loading state?
- Sucesso/erro usa Sonner (`toast.success`, `toast.error`) consistentemente?
- Estados vazios tem mensagem/ilustracao adequada?
- Erros de rede sao tratados com mensagem amigavel?

**Componentes:**
- Usa componentes do Hero UI em vez de implementacoes customizadas?
- Props sao tipadas com TypeScript (interfaces/types)?
- Componentes reutilizaveis estao em `src/components/`?

### Passo 8: Gerar relatorio

Apresente os achados no formato abaixo, agrupados por nivel:

```markdown
## Relatorio de Review do Frontend

**Data:** [data do review]
**Escopo:** [componentes/paginas revisados]

### [CRITICA]
- **`arquivo:linha`** Descricao do problema
  Recomendacao de correcao

### [SUGESTAO]
- **`arquivo:linha`** Descricao do problema
  Recomendacao de correcao

### [BOM TER]
- **`arquivo:linha`** Descricao do problema
  Recomendacao de correcao

### Resumo
| Nivel | Quantidade |
|-------|------------|
| Critica | X |
| Sugestao | X |
| Bom ter | X |
```

Se nenhum achado em uma categoria, indique "Nenhum achado".

## Referencia detalhada

Para checklists detalhados com exemplos de codigo vulneravel vs. seguro, consulte [checklists.md](checklists.md).
