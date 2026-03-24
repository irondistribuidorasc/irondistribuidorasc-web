---
name: backend-security-review
description: Executa review de seguranca no backend Next.js analisando API routes, server actions, autenticacao, acesso a banco de dados, dependencias e headers. Classifica achados como Critica, Sugestao ou Bom ter. Usar quando o usuario pedir review de seguranca, auditoria de codigo backend, ou analise de vulnerabilidades.
---

# Backend Security Review

Review sistematico de seguranca para backend Next.js (App Router) com Prisma, NextAuth e Zod.

## Classificacao de achados

| Nivel | Icone | Significado |
|-------|-------|-------------|
| Critica | `[CRITICA]` | Vulnerabilidade exploravel. Corrigir antes de producao. |
| Sugestao | `[SUGESTAO]` | Melhoria recomendada para fortalecer seguranca. |
| Bom ter | `[BOM TER]` | Endurecimento adicional, boas praticas opcionais. |

## Workflow

Copie este checklist e atualize o progresso:

```
Progresso do Review:
- [ ] 1. Mapear superficie de ataque
- [ ] 2. Autenticacao e autorizacao
- [ ] 3. Validacao de input
- [ ] 4. API routes e server actions
- [ ] 5. Banco de dados
- [ ] 6. Dependencias e configuracao
- [ ] 7. Protecao de dados
- [ ] 8. Gerar relatorio
```

### Passo 1: Mapear superficie de ataque

Antes de revisar, mapeie todos os endpoints e server actions:

1. Liste todas as API routes em `app/api/`
2. Liste todas as server actions em `app/actions/` (arquivos com `"use server"`)
3. Identifique o middleware em `middleware.ts`
4. Classifique cada endpoint como: publico, autenticado, ou admin

```
Mapa de endpoints:
| Rota | Tipo | Acesso | Rate Limit | Validacao |
|------|------|--------|------------|-----------|
| ...  | ...  | ...    | ...        | ...       |
```

### Passo 2: Autenticacao e autorizacao

Para cada endpoint autenticado/admin, verifique:

**Sessao:**
- Chama `auth()` ou `getServerSession(authOptions)` no inicio?
- Retorna 401 se sessao nula?

**RBAC:**
- Rotas admin verificam `session.user.role === "ADMIN"`?
- Verificacao ocorre antes de qualquer logica de negocio?

**Ownership (IDOR):**
- Queries filtram por `userId` do token, nao do request body?
- Usuario nao consegue acessar recurso de outro usuario via ID na URL?

**Escalacao de privilegios:**
- Endpoints de update/patch de usuario permitem alterar o campo `role`?
- Campos sensiveis sao protegidos contra mass assignment?

### Passo 3: Validacao de input

Para cada endpoint que recebe dados (POST, PUT, PATCH, query params):

**Zod:**
- Usa `schema.safeParse()` antes de processar?
- Schema cobre todos os campos recebidos?
- Tipos sao estritos (nao usa `z.any()` ou `z.unknown()` sem refinar)?

**Sanitizacao:**
- Dados de usuario sao sanitizados antes de salvar no banco?
- Campos de texto livre sao tratados contra XSS ao renderizar?

**Parametros de URL:**
- IDs em params sao validados (formato UUID, numerico, etc.)?
- Query strings sao validadas e tipadas?

### Passo 4: API routes e server actions

**Rate limiting:**
- Endpoints sensiveis (login, register, forgot-password, export, delete) usam `withRateLimit()`?
- Limites sao adequados ao tipo de operacao?

**Respostas:**
- Erros retornam mensagens genericas ao cliente (sem stack traces)?
- Responses nao expoe dados internos (IDs de sistema, estrutura do banco)?
- Status codes HTTP sao corretos (401 vs 403 vs 404)?

**Server Actions:**
- Validam sessao antes de executar?
- Validam input com Zod?
- Nao expoe dados sensiveis no retorno?

### Passo 5: Banco de dados

**Prisma queries:**
- Usa `$queryRaw`/`$executeRaw`? Se sim, parametros sao interpolados via template literal do Prisma (tagged template)?
- `select` ou `include` limitam campos retornados (nao retorna senha, tokens)?
- Queries de listagem usam paginacao?

**Transacoes:**
- Operacoes multi-tabela usam `prisma.$transaction()`?
- Deletes em cascata estao corretos no schema?

**Dados sensiveis:**
- Campos como `password`, `resetToken` sao excluidos de queries de leitura?
- Relacoes nao vazam dados de outros usuarios?

### Passo 6: Dependencias e configuracao

**Secrets:**
- `.env` e `.env.local` estao no `.gitignore`?
- Nenhum secret hardcoded no codigo fonte?
- `NEXTAUTH_SECRET` esta definido e e forte?

**Headers de seguranca** (verificar em `next.config.ts`):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` com `max-age` alto
- `Content-Security-Policy` configurado
- `Referrer-Policy` restritivo

**CORS:**
- Apenas origens confiáveis permitidas?
- Nao usa `Access-Control-Allow-Origin: *` em producao?

**Dependencias:**
- Execute `pnpm audit` para verificar CVEs conhecidas
- Dependencias desatualizadas com patches de seguranca pendentes?

### Passo 7: Protecao de dados

**Senhas:**
- Hashing com bcrypt/argon2 (nunca plaintext)?
- Salt unico por senha?
- Comparacao via `bcrypt.compare()` (timing-safe)?

**Tokens:**
- Reset tokens tem expiracao?
- Tokens sao invalidados apos uso?
- JWT `NEXTAUTH_SECRET` e robusto?

**LGPD:**
- Existe endpoint de export de dados do usuario?
- Existe endpoint de delete de conta?
- Dados sao realmente removidos (nao apenas soft delete parcial)?

**Logs:**
- Logs nao contem senhas, tokens, ou dados pessoais?
- Erros logados nao expoe PII?

### Passo 8: Gerar relatorio

Apresente os achados no formato abaixo, agrupados por nivel:

```markdown
## Relatorio de Seguranca do Backend

**Data:** [data do review]
**Escopo:** [endpoints revisados]

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
