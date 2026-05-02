# GAP-010 - Password Reset Token Hash Report

Data: 2026-05-01

Spec: `docs/superpowers/specs/2026-05-01-gap-010-password-reset-token-hash.md`

## Resultado

GAP-010 foi corrigido sem migration de banco.

O fluxo de recuperacao de senha continua enviando um token puro no link para o usuario, mas `VerificationToken.token` agora armazena apenas o hash SHA-256 desse token. A redefinicao de senha hasheia o token recebido antes de consultar ou deletar o registro.

## Alteracoes Tecnicas

- Criado `src/lib/password-reset-tokens.ts` para centralizar:
  - geracao de token aleatorio;
  - hash SHA-256 do token.
- `app/api/auth/forgot-password/route.ts` passou a:
  - gerar token puro e hash;
  - remover tokens anteriores do mesmo email antes de criar um novo;
  - persistir apenas `hashedToken`;
  - manter o token puro apenas no link enviado ao usuario.
- `app/api/auth/reset-password/route.ts` passou a:
  - validar que `token` e `newPassword` sao strings;
  - consultar `VerificationToken` por hash;
  - deletar token expirado ou usado pelo hash.
- `src/lib/__tests__/passwordResetTokens.test.ts` cobre geracao e hashing.

## Regra Aplicada

- Token puro: enviado apenas no link de redefinicao.
- Token persistido: `sha256(token puro)` em hexadecimal.
- Consulta: `sha256(token recebido)`.
- Delecao: hash armazenado.

## Observacao Operacional

Tokens antigos que ja estavam salvos em texto puro antes desta mudanca nao serao encontrados pelo novo fluxo. O usuario deve solicitar um novo link de recuperacao se tentar usar um link antigo.

## Validacoes Executadas

| Comando | Resultado |
| --- | --- |
| `pnpm vitest run src/lib/__tests__/passwordResetTokens.test.ts` | Passou: 3 testes |
| `pnpm lint` | Passou com 1 warning preexistente em `ProductForm.tsx` |
| `pnpm test:run` | Passou: 24 arquivos, 233 testes |
| `pnpm test:coverage` | Passou: 24 arquivos, 233 testes, cobertura geral 96.84% statements e 91.11% branches |
| `pnpm build` com variaveis placeholder nao secretas | Passou |
| `git diff --check` | Passou |

## Proximo Passo Recomendado

Atacar GAP-011: versionar/documentar politicas de upload Supabase para que permissoes de imagem nao dependam apenas de configuracao externa invisivel no repo.
