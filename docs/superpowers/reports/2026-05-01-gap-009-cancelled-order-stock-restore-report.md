# GAP-009 - Cancelled Order Stock Restore Report

Data: 2026-05-01

Spec: `docs/superpowers/specs/2026-05-01-gap-009-cancelled-order-stock-restore.md`

## Resultado

GAP-009 foi corrigido no fluxo administrativo de alteracao de status do pedido.

`PATCH /api/admin/orders/[id]` agora restaura estoque quando um pedido sai de status com baixa aplicada para `CANCELLED`. A restauracao usa claim atomico da transicao de status dentro da mesma transacao, evitando restauracao duplicada em chamadas repetidas ou concorrentes.

## Alteracoes Tecnicas

- `src/lib/admin-order-items.ts` passou a centralizar:
  - `shouldRestoreStockForStatusTransition`;
  - `buildStockRestorationsForOrderItems`.
- `app/api/admin/orders/[id]/route.ts` passou a:
  - calcular se a transicao deve deduzir ou restaurar estoque;
  - aplicar claim atomico para transicoes com efeito em estoque;
  - incrementar `stockQuantity` e marcar `inStock = true` ao cancelar pedido com baixa aplicada;
  - preservar a notificacao apenas quando o status realmente muda.
- `src/lib/__tests__/adminOrderItems.test.ts` ganhou cobertura para regras de restauracao.

## Regra Aplicada

Restaura estoque quando:

- `CONFIRMED -> CANCELLED`;
- `PROCESSING -> CANCELLED`;
- `SHIPPED -> CANCELLED`;
- `DELIVERED -> CANCELLED`.

Nao restaura estoque quando:

- `PENDING -> CANCELLED`;
- pedido ja esta `CANCELLED`;
- transicao nao termina em `CANCELLED`.

## Validacoes Executadas

| Comando | Resultado |
| --- | --- |
| `pnpm vitest run src/lib/__tests__/adminOrderItems.test.ts` | Passou: 12 testes |
| `pnpm lint` | Passou com 1 warning preexistente em `ProductForm.tsx` |
| `pnpm test:run` | Passou: 23 arquivos, 230 testes |
| `pnpm test:coverage` | Passou: 23 arquivos, 230 testes, cobertura geral 96.82% statements e 91.11% branches |
| `pnpm build` com variaveis placeholder nao secretas | Passou |
| `git diff --check` | Passou |

## Proximo Passo Recomendado

Atacar GAP-010: tokens de reset de senha persistidos em texto puro devem ser substituidos por armazenamento com hash e comparacao segura.
