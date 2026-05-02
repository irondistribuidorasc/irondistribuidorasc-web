# GAP-004 - Order Status Stock Transition Report

Data: 2026-05-01

Spec: `docs/superpowers/specs/2026-05-01-gap-004-order-status-stock-transition.md`

## Resultado

GAP-004 foi corrigido na rota administrativa de transicao de status.

`PATCH /api/admin/orders/[id]` agora decide baixa de estoque pela transicao de status, usa uma atualizacao atomica do pedido para evitar dupla baixa concorrente e bloqueia confirmacao/status ativo quando o estoque nao e suficiente.

## Alteracoes Tecnicas

- `src/lib/admin-order-items.ts` agora tambem centraliza:
  - `shouldDeductStockForStatusTransition`;
  - validacao de baixas de estoque a partir dos itens de um pedido existente.
- `app/api/admin/orders/[id]/route.ts` passou a:
  - ler pedido, itens e usuario dentro da transacao;
  - deduzir estoque somente quando a transicao sai de status sem baixa para status com baixa;
  - aplicar `order.updateMany` com status esperado como claim atomico antes da baixa;
  - usar `product.updateMany` com guarda `stockQuantity >= quantity`;
  - remover clamp silencioso para zero;
  - retornar `409` para estoque insuficiente, conflito de status ou produto ausente;
  - evitar notificacao quando a chamada concorrente/idempotente nao muda status.

## Regra Aplicada

Status que representam estoque ja baixado:

- `CONFIRMED`;
- `PROCESSING`;
- `SHIPPED`;
- `DELIVERED`.

Baixa ocorre apenas em transicao de status sem baixa para status com baixa. Exemplos:

- `PENDING -> CONFIRMED`: baixa estoque.
- `PENDING -> PROCESSING`: baixa estoque.
- `CONFIRMED -> PROCESSING`: nao baixa novamente.
- `DELIVERED -> CANCELLED`: nao reverte estoque nesta etapa.

## Validacoes Executadas

| Comando | Resultado |
| --- | --- |
| `pnpm vitest run src/lib/__tests__/adminOrderItems.test.ts` | Passou: 9 testes |
| `pnpm lint` | Passou com 1 warning preexistente em `ProductForm.tsx` |
| `pnpm test:run` | Passou: 21 arquivos, 209 testes |
| `pnpm test:coverage` | Passou: 21 arquivos, 209 testes, cobertura geral 96.92% statements e 91.4% branches |
| `pnpm build` com variaveis placeholder nao secretas | Passou |

## Observacoes

- Reversao de estoque em cancelamento permanece fora desta etapa e pertence ao GAP-009.
- Esta correcao nao cria trilha de auditoria dedicada de status.
- O build continua exigindo `DATABASE_URL` e `DIRECT_URL`; para validacao local foram usados placeholders nao secretos.

## Proximo Passo Recomendado

Atacar GAP-005: definir e corrigir a regra de financeiro diario para nao somar pedidos ainda nao finalizados/pagos indevidamente.
