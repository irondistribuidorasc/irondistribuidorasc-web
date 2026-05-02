# GAP-012 - Alinhamento da validação do checkout com a API

## Objetivo

Impedir que o cliente avance no checkout com dados incompletos que a API de criação de pedido já rejeita, eliminando o erro tardio após a confirmação do pedido.

## Escopo

- Revisar a validação client-side do checkout em `src/components/carrinho/CarrinhoCheckout.tsx`.
- Centralizar a regra de prontidão do checkout em helper puro e testável.
- Exigir na UI os mesmos campos obrigatórios do payload `customer` aceito por `createOrderCustomerSchema`, considerando que o e-mail vem da sessão autenticada.
- Preservar a exigência atual de forma de pagamento no checkout.
- Atualizar a documentação de execução do gap.

## Fora de Escopo

- Alterar o contrato público de `POST /api/orders/create`.
- Mudar máscaras, normalização de endereço ou validações formais de telefone/CEP além da obrigatoriedade já exigida pela API.
- Redesenhar o formulário de carrinho.
- Adicionar persistência nova para dados do cliente.

## Critérios de Sucesso

- O botão de finalizar pedido só fica habilitado quando houver itens e os campos obrigatórios estiverem preenchidos: nome, telefone, endereço, cidade, UF válida, CEP e forma de pagamento.
- O botão "Salvar dados" não fecha a edição quando faltarem campos obrigatórios do checkout.
- Os campos telefone, endereço e CEP exibem erro quando o usuário tenta salvar/finalizar sem preenchê-los.
- A mensagem geral do checkout lista os campos obrigatórios pendentes de forma coerente.
- Testes unitários cobrem o helper de validação, incluindo o caso que originou o gap.
- `pnpm lint`, `pnpm test:run`, `pnpm test:coverage`, `pnpm build` e `git diff --check` passam.

## Impactos

- Reduz fricção no checkout: o usuário corrige dados antes de abrir o modal de confirmação.
- Diminui chamadas à API que já seriam rejeitadas por payload incompleto.
- Mantém a API como última linha de defesa, sem afrouxar validação server-side.
