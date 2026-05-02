# GAP-007 - Exclusao de Conta sem Perda de Historico Operacional

## Objetivo

Corrigir a exclusao de conta para remover dados pessoais e credenciais do usuario sem apagar pedidos, itens, totais, status, formas de pagamento e feedbacks necessarios para auditoria operacional e financeira.

## Contexto

A auditoria encontrou que `DELETE /api/account/delete` executava `db.user.delete`. Como `Order.user` esta configurado com `onDelete: Cascade`, a exclusao do usuario apagava pedidos e, por consequencia, itens e feedbacks.

Isso cria risco de perda de historico de vendas, fechamento financeiro, comprovacao operacional e pos-venda.

## Escopo

- Substituir a exclusao fisica do usuario por anonimizacao transacional.
- Apagar credenciais de login, contas OAuth e sessoes.
- Apagar notificacoes in-app do usuario.
- Remover token de verificacao/reset associado ao email antigo.
- Anonimizar dados pessoais no perfil do usuario.
- Anonimizar snapshots pessoais em pedidos ja existentes.
- Preservar pedidos, itens, totais, status, metodo de pagamento, numero do pedido e feedbacks.
- Manter confirmacao textual, senha e rate limit existentes.

## Fora de Escopo

- Criar nova tabela de auditoria.
- Alterar o schema Prisma ou migrations.
- Modelar retencao fiscal por prazo legal.
- Criar fluxo de restauracao de conta.
- Alterar telas administrativas.

## Regra Aplicada

Ao excluir a conta:

- `User` permanece para preservar integridade dos pedidos.
- Dados pessoais e acesso do `User` sao anonimizados.
- `Account` e `Session` sao removidos para encerrar acesso.
- `Notification` e tokens por email sao removidos.
- Dados pessoais copiados em `Order` sao anonimizados.
- `Order`, `OrderItem` e `OrderFeedback` nao sao deletados.

## Criterios de Sucesso

- A rota nao chama mais `db.user.delete`.
- Pedidos do usuario continuam existindo apos exclusao da conta.
- Itens dos pedidos continuam existindo.
- Feedback do pedido continua existindo.
- Email original do usuario deixa de ocupar o indice unico, permitindo novo cadastro futuro.
- Dados pessoais do usuario e dos snapshots dos pedidos sao substituidos por valores anonimizados.
- Sessoes e contas OAuth sao removidas.
- Lint, testes, coverage e build continuam passando.

## Plano de Validacao

1. Adicionar testes unitarios para os payloads de anonimizacao.
2. Adicionar teste unitario para a operacao transacional nao chamar delete fisico.
3. Alterar `DELETE /api/account/delete` para usar anonimizacao.
4. Rodar teste focado.
5. Rodar `pnpm lint`, `pnpm test:run`, `pnpm test:coverage` e `pnpm build` com env placeholder.
