# GAP-007 - Account Deletion Retention Report

Data: 2026-05-01

Spec: `docs/superpowers/specs/2026-05-01-gap-007-account-deletion-retention.md`

## Resultado

GAP-007 foi corrigido sem alterar schema ou migrations.

`DELETE /api/account/delete` nao executa mais `db.user.delete`. A rota agora remove credenciais e sessoes, anonimiza o usuario e os snapshots pessoais dos pedidos dentro de uma transacao, preservando pedidos, itens, totais, status, forma de pagamento, numero do pedido e feedbacks.

## Alteracoes Tecnicas

- Criado `src/lib/account-deletion.ts` para centralizar:
  - email anonimo estavel por `userId`;
  - payload de anonimizacao do usuario;
  - payload de anonimizacao dos dados pessoais copiados nos pedidos;
  - operacao transacional de remocao de acesso e anonimizacao.
- `app/api/account/delete/route.ts` passou a:
  - manter confirmacao textual, senha e rate limit;
  - executar `anonymizeAccountForDeletion` em `db.$transaction`;
  - nao acionar cascade de `User -> Order`.
- `src/components/account/ProfileForm.tsx` passou a comunicar que pedidos existentes ficam mantidos de forma anonimizada.
- `src/lib/__tests__/accountDeletion.test.ts` cobre os contratos de anonimizacao e garante que a operacao nao chama delete fisico de usuario.

## Regra Aplicada

Ao excluir a conta:

- `Account`, `Session` e `Notification` do usuario sao removidos.
- `VerificationToken` associado ao email antigo e removido.
- `User` permanece com dados pessoais anonimizados e acesso desativado.
- `Order` permanece com snapshots pessoais anonimizados.
- `OrderItem` e `OrderFeedback` permanecem preservados.

## Validacoes Executadas

| Comando | Resultado |
| --- | --- |
| `pnpm vitest run src/lib/__tests__/accountDeletion.test.ts` | Passou: 4 testes |
| `pnpm lint` | Passou com 1 warning preexistente em `ProductForm.tsx` |
| `pnpm test:run` | Passou: 23 arquivos, 227 testes |
| `pnpm test:coverage` | Passou: 23 arquivos, 227 testes, cobertura geral 96.77% statements e 91.02% branches |
| `pnpm build` com variaveis placeholder nao secretas | Passou |
| `git diff --check` | Passou |

## Proximo Passo Recomendado

Atacar GAP-009: cancelamento de pedido confirmado deve restaurar estoque quando o pedido ja teve baixa aplicada.
