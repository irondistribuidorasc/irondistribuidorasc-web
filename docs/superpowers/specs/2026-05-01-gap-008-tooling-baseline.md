# GAP-008 - Restaurar Tooling e Baseline de Validacao

## Objetivo

Restaurar a instalacao reproduzivel de dependencias e a capacidade de executar a suite minima de qualidade do projeto: lint, testes, coverage e build.

## Contexto

A auditoria end-to-end registrou o GAP-008 como P1 porque o checkout atual nao consegue validar alteracoes:

- `pnpm lint` falha por `eslint: command not found`;
- `pnpm test:run` e `pnpm test:coverage` falham por `vitest: command not found`;
- `pnpm build` falha por `dotenv: command not found`;
- `pnpm install --frozen-lockfile` falha com `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`.

Sem baseline verde, as correcoes dos gaps de negocio ficam sem prova tecnica confiavel.

## Escopo

- Diagnosticar a divergencia entre `package.json`, `pnpm-lock.yaml`, versao de Node e configuracao local do pnpm.
- Corrigir o minimo necessario para `pnpm install --frozen-lockfile` funcionar.
- Instalar dependencias sem alterar regras de negocio.
- Rodar:
  - `pnpm lint`;
  - `pnpm test:run`;
  - `pnpm test:coverage`;
  - `pnpm build`.
- Registrar qualquer falha residual com evidencia objetiva.

## Fora de Escopo

- Corrigir os gaps de negocio GAP-001 a GAP-007.
- Atualizar frameworks ou dependencias sem necessidade direta para restaurar o baseline.
- Alterar migrations, schema Prisma ou regras de produto.
- Ajustar UI.
- Corrigir testes quebrados que revelem bug funcional fora do tooling, salvo se forem falhas triviais de ambiente.

## Criterios de Sucesso

- `pnpm install --frozen-lockfile` conclui com sucesso no ambiente do projeto.
- `node_modules` e binarios locais ficam disponiveis.
- Os quatro comandos de validacao executam ate o fim ou suas falhas ficam classificadas como novo gap separado.
- Qualquer alteracao em lockfile/config e pequena, explicavel e isolada.

## Riscos

- Atualizar lockfile pode gerar diff grande se a versao de pnpm/Node estiver diferente da usada originalmente.
- Scripts `postinstall` podem depender de variaveis `.env` locais para `prisma generate`.
- O build pode revelar erros preexistentes que estavam ocultos pela falta de dependencias.

## Plano de Validacao

1. Confirmar versoes efetivas de Node e pnpm.
2. Testar instalacao congelada no Node esperado pelo projeto.
3. Se ainda falhar, atualizar lockfile com `pnpm install --no-frozen-lockfile` e revisar diff.
4. Reexecutar `pnpm install --frozen-lockfile`.
5. Rodar lint, testes, coverage e build.
