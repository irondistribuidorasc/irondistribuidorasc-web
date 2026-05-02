# GAP-010 - Hash de Tokens de Reset de Senha

## Objetivo

Corrigir o fluxo de recuperacao de senha para nao persistir tokens de reset em texto puro no banco.

## Contexto

A auditoria encontrou que `POST /api/auth/forgot-password` gera um token aleatorio e salva esse mesmo valor em `VerificationToken.token`. `POST /api/auth/reset-password` recebe o token do link e busca diretamente pelo valor em texto puro.

Se a tabela for exposta, um atacante poderia usar tokens ainda validos para redefinir senha de usuarios.

## Escopo

- Centralizar geracao e hash de token de reset.
- Enviar ao usuario apenas o token puro no link.
- Persistir em `VerificationToken.token` apenas o hash SHA-256 do token.
- Buscar e deletar tokens usando o hash, nao o token puro.
- Remover tokens anteriores do mesmo email antes de criar um novo token.
- Manter expiracao atual de 1 hora.
- Manter schema Prisma atual, sem migration.

## Fora de Escopo

- Trocar provedor de email.
- Alterar UI de recuperacao ou redefinicao de senha.
- Criar tabela separada para reset tokens.
- Implementar MFA.
- Criar rotacao de segredo global.

## Regra Aplicada

- Token puro: valor aleatorio enviado apenas no link de reset.
- Token persistido: `sha256(token puro)` em hexadecimal.
- Reset: token recebido e hasheado antes da consulta ao banco.
- Uso ou expiracao: delecao pelo hash armazenado.

## Criterios de Sucesso

- Novo token gerado tem valor puro e hash diferentes.
- O banco recebe apenas o hash.
- O link de reset continua usando o token puro.
- `reset-password` nao consulta `VerificationToken` pelo token puro.
- Token expirado e removido pelo hash.
- Token usado e removido pelo hash.
- Lint, testes, coverage e build continuam passando.

## Plano de Validacao

1. Adicionar testes unitarios para geracao/hash de reset token.
2. Alterar `forgot-password` para salvar hash e enviar token puro.
3. Alterar `reset-password` para consultar e deletar por hash.
4. Rodar teste focado.
5. Rodar `pnpm lint`, `pnpm test:run`, `pnpm test:coverage` e `pnpm build` com env placeholder.
