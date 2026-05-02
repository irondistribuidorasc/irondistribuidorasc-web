# Auditoria End-to-End de Gaps Criticos do Sistema

## Objetivo

Analisar o sistema Iron Distribuidora SC do inicio ao fim para identificar gaps tecnicos, funcionais, operacionais, de seguranca e de consistencia que precisem ser corrigidos, com prioridade nos gaps criticos e necessarios para confiabilidade do negocio.

Esta spec define a fase de auditoria. Ela nao autoriza implementacao automatica de correcoes; os achados devem ser classificados, evidenciados e convertidos em planos de correcao separados quando necessario.

## Contexto

O sistema atual e uma aplicacao Next.js para e-commerce B2B com:

- cadastro, login e aprovacao de clientes;
- catalogo de produtos, precos e estoque;
- carrinho, checkout e pedidos com apoio do WhatsApp;
- backoffice administrativo para usuarios, produtos, pedidos, financeiro e feedbacks;
- notificacoes, avaliacoes e fluxo assistido de garantia/troca;
- base tecnica com NextAuth, Prisma, PostgreSQL, Zod, HeroUI, Tailwind e Vitest.

Documento base dos pilares atuais: `docs/system-pillars.md`.

## Problema Atual

O sistema ja possui diversos dominios conectados entre si, mas ainda nao existe uma auditoria consolidada que responda, com evidencia:

- quais fluxos estao realmente prontos para operacao;
- quais regras de negocio estao incompletas, duplicadas ou divergentes;
- quais riscos podem gerar perda de pedido, erro de estoque, acesso indevido, falha financeira ou atendimento inconsistente;
- quais gaps sao criticos e precisam virar correcao antes de evolucoes maiores.

Sem essa visao, futuras melhorias podem corrigir sintomas locais e deixar problemas estruturais ativos.

## Escopo

A auditoria deve cobrir os pilares tecnicos atuais:

1. Identidade, autenticacao e aprovacao B2B.
2. Catalogo, precificacao e estoque.
3. Carrinho, checkout e pedidos.
4. Backoffice operacional.
5. Pos-venda, notificacoes, feedback e garantia.
6. Fundacao tecnica transversal.

Para cada pilar, a analise deve cobrir:

- modelos Prisma e migrations relevantes;
- rotas web e APIs;
- validacoes Zod e validacoes manuais;
- permissoes e guardas de acesso;
- estados, transicoes e efeitos colaterais;
- testes existentes e lacunas de cobertura;
- riscos de concorrencia, duplicidade e inconsistencia;
- impacto operacional e financeiro;
- aderencia ao Brand Book quando houver UI relevante.

## Fora de Escopo

- Implementar correcoes durante a auditoria.
- Redesenhar produto, marca ou arquitetura sem evidencia de gap.
- Fazer refatoracoes esteticas.
- Migrar stack, trocar bibliotecas ou reestruturar pastas.
- Corrigir todos os achados automaticamente.
- Validar producao real sem aprovacao explicita e credenciais adequadas.

## Severidade dos Achados

Cada gap deve ser classificado assim:

| Severidade | Definicao | Exemplos |
| --- | --- | --- |
| P0 Critico | Pode causar perda de dinheiro, vazamento de dados, acesso indevido, quebra completa de checkout/pedido ou corrupcao de estoque. | Pedido criado com preco manipulado, admin bypass, estoque negativo sem controle, dados sensiveis expostos. |
| P1 Necessario | Afeta fluxo principal ou operacao diaria, mas tem contorno manual razoavel. | Falha de notificacao importante, status inconsistente, validacao incompleta que gera retrabalho. |
| P2 Importante | Reduz confiabilidade, manutencao ou qualidade, mas nao bloqueia operacao central. | Duplicacao de regra, teste ausente em fluxo secundario, UX confusa em admin. |
| P3 Melhoria | Ajuste desejavel sem risco operacional relevante imediato. | Texto, organizacao documental, pequena melhoria ergonomica. |

Padrao conservador: se houver duvida entre duas severidades, classificar na maior e registrar a incerteza.

## Metodo de Auditoria

### 1. Inventario do sistema

Mapear fontes de verdade:

- `prisma/schema.prisma`;
- `app/` para paginas, layouts, actions e APIs;
- `src/lib/` para auth, Prisma, schemas, rate limit, WhatsApp, Supabase e utilitarios;
- `src/components/`, `src/contexts/`, `src/hooks/` para UI e estado cliente;
- `src/**/__tests__/` e arquivos `*.test.ts(x)` para cobertura;
- `docs/`, `AGENTS.md`, `.cursor/rules/` e `.cursor/skills/` para contratos locais.

Saida esperada: lista de fluxos e donos tecnicos por pilar.

### 2. Analise de fluxo end-to-end

Percorrer os fluxos principais como usuario real e como admin:

- cadastro manual;
- login por credenciais;
- usuario pendente;
- aprovacao por admin;
- catalogo e filtros;
- carrinho;
- checkout;
- criacao de pedido;
- acompanhamento de pedido;
- alteracao de status pelo admin;
- deducao de estoque;
- pagamento/financeiro;
- notificacoes;
- feedback apos entrega;
- garantia/troca via WhatsApp;
- exclusao/exportacao de conta.

Saida esperada: matriz `fluxo -> entradas -> permissoes -> dados gravados -> efeitos colaterais -> gaps`.

### 3. Analise de regras e dados

Verificar consistencia entre regras de negocio e persistencia:

- `approved` controla todos os pontos que deveria controlar?
- `role` e validado em todos os endpoints admin?
- preco sempre vem do banco em fluxos de pedido?
- estoque e validado, reservado, deduzido e eventualmente revertido de forma consistente?
- status de pedido tem transicoes validas e efeitos previsiveis?
- financeiro deriva dos pedidos corretos?
- notificacoes sao criadas para eventos importantes?
- feedback e limitado ao cliente correto e ao status correto?
- garantia/troca precisa ou nao de persistencia propria?

Saida esperada: achados com referencia a arquivos e linhas.

### 4. Analise de seguranca e privacidade

Revisar riscos minimos:

- autenticacao e autorizacao server-side;
- callback/redirect seguro;
- rate limiting em rotas sensiveis;
- exposicao de dados de cliente, documento, endereco e loja;
- validacao de input e output;
- upload/importacao de produtos;
- queries raw e protecao contra injection;
- logs sem segredos ou dados excessivos;
- exportacao/exclusao de conta.

Saida esperada: lista de gaps P0/P1 de seguranca e privacidade, se existirem.

### 5. Analise de qualidade e testes

Verificar:

- cobertura existente por pilar;
- testes de happy path e failure path;
- testes para permissoes;
- testes para estoque, pedido, status, notificacao e financeiro;
- `pnpm lint`;
- `pnpm test:run`;
- `pnpm test:coverage`;
- `pnpm build`.

Saida esperada: mapa de cobertura e comandos executados, com falhas reproduziveis.

### 6. Analise operacional

Avaliar riscos de operacao real:

- fluxo manual dependente de WhatsApp;
- pedido minimo e regras comerciais;
- fechamento financeiro diario;
- baixa de estoque;
- atendimento de garantia/troca;
- recuperacao de falhas;
- rastreabilidade de acoes administrativas;
- dados necessarios para suporte ao cliente.

Saida esperada: gaps operacionais classificados por severidade.

## Pilares e Perguntas de Auditoria

### Pilar 1: Identidade, autenticacao e aprovacao B2B

- Cadastro cria usuario com dados suficientes e seguros?
- Login por senha e Google respeita o estado `approved`?
- Usuario pendente nao acessa preco, carrinho, checkout ou dados restritos indevidamente?
- Admin consegue aprovar e editar usuarios sem expor dados excessivos?
- Sessao JWT reflete mudancas relevantes sem ficar obsoleta de forma perigosa?
- Exportacao e exclusao de conta preservam privacidade e integridade referencial?

### Pilar 2: Catalogo, precificacao e estoque

- Produtos tem validacao suficiente para codigo, categoria, marca, modelo, preco e estoque?
- Preco exibido e preco usado no pedido tem a mesma fonte de verdade?
- Produtos fora de estoque nao podem ser comprados indevidamente?
- Estoque baixo e calculado de forma consistente em todos os lugares?
- Importacao em lote protege contra dados invalidos e carga excessiva?
- Imagens e assets externos seguem configuracao segura?

### Pilar 3: Carrinho, checkout e pedidos

- Carrinho nao permite quantidade invalida, item inexistente ou preco manipulado?
- Criacao de pedido e atomica o suficiente para evitar inconsistencia?
- Numero sequencial de pedido e seguro contra concorrencia?
- Estoque deveria ser reservado no pedido pendente ou deduzido apenas na confirmacao?
- Mudancas de status duplicadas podem deduzir estoque mais de uma vez?
- Cancelamento reverte ou nao reverte estoque de forma intencional?
- WhatsApp e canal auxiliar ou parte obrigatoria do estado do pedido?

### Pilar 4: Backoffice operacional

- Todas as APIs admin validam `ADMIN` server-side?
- A UI admin nao mostra estado enganoso quando API falha?
- Alteracoes manuais de pedido, pagamento, usuario e estoque possuem rastreabilidade suficiente?
- Financeiro calcula por data e status corretos para o negocio?
- Impressao de pedido contem dados necessarios sem expor demais?
- Filtros e paginacao funcionam sem quebrar com volume maior?

### Pilar 5: Pos-venda, notificacoes, feedback e garantia

- Notificacoes cobrem eventos importantes sem duplicacao indevida?
- Cliente so ve notificacoes proprias?
- Feedback so e permitido para pedido entregue e pertencente ao cliente?
- Garantia/troca precisa ser rastreada no banco em vez de apenas WhatsApp?
- Existe prazo, status ou SLA para garantia?
- Comentarios e feedbacks seguem privacidade e moderacao esperadas?

### Pilar 6: Fundacao tecnica transversal

- Schemas Zod cobrem todas as entradas criticas?
- Existem validacoes manuais que deveriam ser centralizadas?
- Logs sao uteis sem vazar informacao sensivel?
- Rate limit cobre rotas de auth, cadastro, pedidos e importacoes?
- Migrations e schema estao coerentes?
- Testes cobrem os fluxos de maior risco?
- Build, lint e coverage estao verdes?

## Entregaveis da Auditoria

A auditoria deve produzir um documento em `docs/superpowers/reports/` com:

1. Resumo executivo.
2. Lista de achados P0/P1 primeiro.
3. Tabela completa de achados.
4. Evidencia por achado: arquivo, linha, rota, comando ou comportamento reproduzido.
5. Impacto tecnico e impacto de negocio.
6. Recomendacao de correcao em alto nivel.
7. Ordem sugerida de ataque.
8. Gaps que exigem decisao de negocio antes de implementar.
9. Comandos de validacao executados e resultados.
10. Itens explicitamente fora de escopo.

Formato minimo de achado:

```md
### [P1] Titulo curto do gap

- Pilar: Carrinho, checkout e pedidos
- Evidencia: `app/api/orders/create/route.ts:42`
- Impacto: descreva o risco concreto.
- Reproducao/validacao: comando, rota ou passo manual.
- Recomendacao: correcao em alto nivel, sem implementar ainda.
- Decisao necessaria: sim/nao; detalhe se houver.
```

## Criterios de Sucesso

- Todos os pilares de `docs/system-pillars.md` foram revisados.
- Todo achado P0/P1 possui evidencia concreta.
- Nao ha achados baseados apenas em opiniao ou hipotese sem indicacao de incerteza.
- O relatorio diferencia bug, risco, gap de teste, gap operacional e decisao de negocio.
- O relatorio deixa claro o que deve ser corrigido agora, o que pode virar backlog e o que precisa de decisao do dono do negocio.
- Nenhuma correcao e implementada durante a fase de auditoria sem aprovacao posterior.

## Validacao Necessaria

Durante a auditoria, executar quando o ambiente permitir:

```bash
pnpm lint
pnpm test:run
pnpm test:coverage
pnpm build
```

Quando uma falha impedir a sequencia, registrar:

- comando executado;
- erro relevante;
- se a falha e preexistente ou descoberta pela auditoria;
- pilar impactado;
- severidade preliminar.

## Proximo Passo Depois da Spec

Criar um plano de execucao separado para a auditoria, com checklist por pilar e sem implementacao de correcoes. Depois que o relatorio for aprovado, criar planos de correcao separados para os achados P0/P1.
