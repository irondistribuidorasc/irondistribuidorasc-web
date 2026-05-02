# GAP-002/GAP-003 - Admin Order Pricing and Stock Report

Data: 2026-05-01

Spec: `docs/superpowers/specs/2026-05-01-gap-002-003-admin-order-pricing-stock.md`

## Resultado

GAP-002 e GAP-003 foram corrigidos no fluxo de criacao manual de pedido admin.

`createAdminOrder` agora ignora o `price` enviado pelo cliente, busca os produtos dentro da transacao, calcula itens e total com o preco oficial do banco e aplica validacao/baixa de estoque no servidor quando o status inicial representa pedido ativo.

## Alteracoes Tecnicas

- Criado `src/lib/admin-order-items.ts` para centralizar:
  - regra de status inicial que baixa estoque;
  - calculo de itens com preco oficial;
  - validacao de existencia de produto;
  - validacao de estoque para pedidos ativos;
  - geracao da lista de baixas de estoque.
- `app/actions/admin-order-creation.ts` passou a:
  - aceitar `items[].price` apenas como compatibilidade temporaria, sem confiar nele;
  - buscar usuario e produtos dentro da transacao;
  - criar `Order` e `OrderItem` com valores oficiais;
  - baixar estoque via `updateMany` com guarda `stockQuantity >= quantity`;
  - marcar `inStock` como `false` quando a baixa zera o estoque conhecido.

## Regra Aplicada

Baixa de estoque para status inicial:

- `CONFIRMED`;
- `PROCESSING`;
- `SHIPPED`;
- `DELIVERED`.

Sem baixa nesta etapa:

- `PENDING`;
- `CANCELLED`.

## Validacoes Executadas

| Comando | Resultado |
| --- | --- |
| `pnpm vitest run src/lib/__tests__/adminOrderItems.test.ts` | Passou: 6 testes |
| `pnpm lint` | Passou com 1 warning preexistente em `ProductForm.tsx` |
| `pnpm test:run` | Passou: 21 arquivos, 206 testes |
| `pnpm test:coverage` | Passou: 21 arquivos, 206 testes, cobertura geral 97.05% statements e 91.59% branches |
| `pnpm build` com variaveis placeholder nao secretas | Passou |

## Observacoes

- O client admin ainda envia `price` no payload, mas o servidor nao usa esse valor para calculo ou persistencia.
- Transicoes posteriores de status continuam fora desta etapa e pertencem ao GAP-004.
- Reversao de estoque em cancelamento continua fora desta etapa e pertence ao GAP-009.
- O build continua exigindo `DATABASE_URL` e `DIRECT_URL`; para validacao local foram usados placeholders nao secretos.

## Proximo Passo Recomendado

Atacar GAP-004: centralizar transicoes de status e baixa de estoque para evitar dupla baixa, oversell e confirmacao com estoque insuficiente.
