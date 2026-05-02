# GAP-001 - Privacidade de Precos B2B

## Objetivo

Garantir que precos B2B sejam enviados ao cliente, publicados em metadados estruturados ou usados em acoes de busca apenas quando o usuario autenticado estiver aprovado para comprar.

## Contexto

A auditoria encontrou que a UI esconde precos para visitantes e usuarios pendentes, mas o servidor ainda envia `price` para componentes client, JSON-LD e busca global. Isso viola a regra comercial de preco privado para cliente aprovado.

## Escopo

- Criar uma representacao publica de produto com `price` opcional.
- Remover `price` do payload client para visitantes e usuarios nao aprovados.
- Remover `offers.price` do JSON-LD de produto quando o usuario nao puder ver preco.
- Proteger a busca global para retornar `price` apenas para usuario aprovado.
- Impedir adicao ao carrinho quando o produto recebido pelo client nao tiver preco.
- Manter a busca/admin de pedido manual fora deste ajuste, porque ela pertence ao fluxo admin e sera revisada nos GAP-002/GAP-003.

## Fora de Escopo

- Corrigir calculo de preco em pedido manual admin.
- Corrigir baixa de estoque.
- Alterar regra financeira.
- Criar migracoes ou alterar schema Prisma.
- Redesenhar UI.

## Criterios de Sucesso

- Visitante e usuario pendente nao recebem `price` na listagem de produtos.
- Visitante e usuario pendente nao recebem `offers.price` no JSON-LD de detalhe de produto.
- `searchProducts` nao retorna `price` para visitante ou usuario pendente.
- Usuario autenticado e aprovado continua recebendo `price` e consegue adicionar item ao carrinho.
- Lint, testes e build continuam passando.

## Plano de Validacao

1. Adicionar testes para sanitizacao de produto e resultado de busca.
2. Rodar testes focados.
3. Rodar `pnpm lint`, `pnpm test:run`, `pnpm test:coverage` e `pnpm build` com env placeholder.
