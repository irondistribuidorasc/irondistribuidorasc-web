# GAP-002/GAP-003 - Pedido Manual Admin com Preco Oficial e Estoque

## Objetivo

Garantir que pedidos manuais criados pelo admin usem sempre o preco oficial do banco e validem/baixem estoque no servidor quando o status inicial exigir reserva/baixa.

## Contexto

A auditoria encontrou dois gaps acoplados:

- GAP-002: `createAdminOrder` aceitava `items[].price` e calculava total com valor enviado pelo cliente.
- GAP-003: pedido manual admin podia ser criado com quantidade maior que o estoque ou com status `CONFIRMED` sem reduzir estoque.

Como ambos pertencem ao mesmo fluxo de criacao de pedido, a correcao deve ser transacional e server-side.

## Escopo

- Ignorar qualquer `price` enviado pelo client em `createAdminOrder`.
- Buscar produtos dentro da transacao de criacao do pedido.
- Calcular `Order.total`, `OrderItem.price` e `OrderItem.total` com o preco oficial do banco.
- Validar existencia de todos os produtos.
- Validar estoque no servidor quando o status inicial representar pedido ativo.
- Baixar estoque no servidor para status inicial ativo.
- Atualizar `inStock` quando a baixa zerar o estoque conhecido.
- Manter a UI admin atual funcionando, mesmo se ela ainda enviar `price`.

## Fora de Escopo

- Corrigir transicoes posteriores de status em `app/api/admin/orders/[id]/route.ts` (GAP-004).
- Modelar reserva de estoque para pedido `PENDING`.
- Reverter estoque em cancelamento (GAP-009).
- Alterar schema Prisma.
- Redesenhar a tela admin.

## Regra de Status

Nesta etapa, a baixa de estoque deve ocorrer para status inicial:

- `CONFIRMED`;
- `PROCESSING`;
- `SHIPPED`;
- `DELIVERED`.

Status `PENDING` e `CANCELLED` nao baixam estoque nesta etapa.

## Criterios de Sucesso

- Um `price` manipulado no input nao altera o total nem o preco gravado.
- Pedido admin com status ativo falha se qualquer item exceder o estoque.
- Pedido admin com status ativo baixa o estoque dos itens.
- Pedido admin `PENDING` continua sem baixar estoque.
- Lint, testes, coverage e build continuam passando.

## Plano de Validacao

1. Adicionar testes unitarios para preparacao de itens de pedido admin.
2. Rodar teste focado.
3. Rodar `pnpm lint`, `pnpm test:run`, `pnpm test:coverage` e `pnpm build` com env placeholder.
