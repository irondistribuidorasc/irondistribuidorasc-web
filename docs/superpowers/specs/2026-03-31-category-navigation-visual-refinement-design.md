# Refinamento Visual da Navegacao de Categorias

## Objetivo
Melhorar a navegacao de categorias exibida no header de produtos para aumentar hierarquia visual, conforto de leitura e area clicavel, mantendo a interface compacta e consistente com a marca Iron em desktop e mobile.

## Problema Atual
- Os links aparecem como texto solto com pouca separacao visual.
- Quando a quantidade de categorias cresce, a leitura fica cansativa e o bloco perde hierarquia.
- No mobile, a experiencia equivalente e fraca ou inexistente para acesso rapido por categoria.
- O link de administracao disputa atencao com as categorias por estar no mesmo plano visual.

## Direcao A Aprovada
Aplicar uma navegacao em formato de chips/pills:
- Estado ativo com destaque mais forte.
- Estado inativo com contorno sutil e hover claro.
- Area clicavel maior para melhorar usabilidade.
- Container responsivo com scroll horizontal no mobile e wrap organizado no desktop.
- No mobile, a faixa de categorias passa a aparecer como uma segunda linha logo abaixo do header principal.
- Link `Administração` mantido separado das categorias por espaco e divisor visual no desktop.

## Escopo
- Refinar `src/components/layout/CategoryNavigation.tsx`.
- Ajustar a faixa inferior do header em `src/components/layout/Header.tsx` para suportar a nova composicao responsiva.
- Atualizar testes de navegacao em `src/components/layout/__tests__/CategoryNavigation.test.tsx`.

## Fora de Escopo
- Reorganizar categorias por grupos.
- Introduzir dropdown "mais categorias".
- Alterar o fluxo do menu hamburger.
- Mudar nomenclaturas ou slugs de categorias.

## Criterios de Sucesso
- As categorias passam a ter aparencia de chips com contraste e hierarquia melhores.
- O estado ativo fica imediatamente reconhecivel.
- No mobile, a navegacao continua compacta e navegavel por scroll horizontal.
- O componente preserva acessibilidade com `aria-label`, `aria-current`, foco visivel e area de toque confortavel.
- O refinamento usa tokens e principios do Brand Book, sem hex solto nem espacamentos arbitrarios.
- Os chips seguem linguagem visual consistente com o Brand Book: pill radius, cores brand para ativo, bordas neutras e superfícies compatíveis com light/dark.

## Impactos e Dependencias
- O comportamento de links e filtros por querystring deve permanecer identico.
- O header nao deve perder o link administrativo.
- Os testes existentes de links por slug devem continuar validos.
- O mobile passa a ganhar uma nova faixa visivel de acesso rapido a categorias, sem alterar o fluxo do menu hamburger.

## Avaliacao de Regras e Principios Antes da Implementacao
- **Brand Book / Frontend Brand:** compativel. A proposta usa tokens do tema, espacamento em multiplos de 4, contraste maior e alvos melhores.
- **Acessibilidade:** melhora esperada com estados ativos mais claros, foco visivel e area de toque maior.
- **Legibilidade / Manutenibilidade:** compativel. A mudanca fica concentrada em arquivos pequenos e com responsabilidade clara.
- **Padrões de componente:** compativel. O refinamento pode ser feito com `Link` + Tailwind, mantendo o padrao ja usado no header sem introduzir dependencia visual desnecessaria.
- **Risco funcional:** baixo, porque a navegacao continua baseada nos mesmos `href`s e parametros.

## Validacao Pos-Implementacao Necessaria
- Confirmar que desktop e mobile continuam navegando para os mesmos destinos.
- Confirmar que o estado ativo funciona para `Todos Produtos` e categorias especificas.
- Confirmar que o foco de teclado permanece visivel e que a faixa mobile continua utilizavel com overflow horizontal.
- Rodar testes do componente, lint e build para garantir ausencia de regressao estrutural.
