---
name: api-route-checklist
description: Checklist para criar ou alterar API Routes e Server Actions com auth, Zod, respostas seguras e rate limit. Usar ao trabalhar em app/api, app/actions ou quando o usuario pedir revisao de endpoint.
---

# API Route e Server Action — Checklist

Use ao criar ou modificar rotas em `app/api/**` ou actions em `app/actions/**`.

## Progresso

```
- [ ] Autenticacao e autorizacao
- [ ] Validacao de entrada (Zod)
- [ ] Logica de negocio e erros
- [ ] Resposta JSON e status HTTP
- [ ] Rate limit (se publico ou sensivel)
- [ ] Logging sem dados sensiveis
```

## 1. Autenticacao e autorizacao

- Obter sessao com o padrao do projeto (`getServerSession` / `auth()` conforme `src/lib/auth.ts`).
- Rotas **admin**: garantir `role === "ADMIN"` antes de qualquer operacao.
- Se o fluxo exige usuario aprovado, alinhar com `middleware.ts` e modelo de `User`.

## 2. Validacao de entrada

- Validar body, query e params com **Zod** (schemas em `src/lib/schemas.ts` ou modulos em `src/lib/schemas/`).
- Rejeitar input invalido com **400** e mensagem segura (sem detalhes internos).

## 3. Logica e erros

- Usar **Prisma** via cliente em `src/lib/prisma.ts`; transacoes quando houver multiplas escritas.
- Capturar erros esperados; nao vazar stack trace ou SQL ao cliente.

## 4. Resposta

- Manter formato JSON consistente com o restante do projeto.
- Status HTTP corretos (401, 403, 404, 422, 500 conforme o caso).

## 5. Rate limit

- Para endpoints publicos ou abusaveis, usar `src/lib/rate-limit.ts` quando ja existir padrao semelhante.

## 6. Logging

- Preferir `src/lib/logger.ts` em vez de `console.log` para erros operacionais.

## Referencias

- Regra: `.cursor/rules/20-api-auth.mdc`
- Seguranca: `.cursor/skills/backend-security-review/SKILL.md`
- Qualidade: `.cursor/rules/00-core-project.mdc` (lint/build/test antes de concluir)
