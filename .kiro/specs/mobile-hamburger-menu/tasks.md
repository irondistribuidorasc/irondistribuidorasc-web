# Implementation Plan

- [x] 1. Criar componente MobileMenu
  - Criar arquivo `src/components/layout/MobileMenu.tsx`
  - Implementar interface MobileMenuProps com todas as props necessárias
  - Implementar estrutura básica do componente com overlay e sidebar
  - Adicionar suporte a tema claro/escuro usando classes Tailwind
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 1.1 Escrever testes unitários para MobileMenu
  - Criar arquivo `src/components/layout/__tests__/MobileMenu.test.tsx`
  - Testar renderização condicional baseada em isOpen
  - Testar que clique no overlay chama onClose
  - Testar que links de navegação são renderizados
  - Testar exibição de informações do usuário autenticado
  - Testar botão de autenticação correto (Login vs Logout)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1_

- [x] 2. Implementar animações com Framer Motion
  - Adicionar AnimatePresence e motion components ao MobileMenu
  - Configurar animação de slide para o sidebar (direita para esquerda)
  - Configurar animação de fade para o overlay
  - Usar configurações de spring para transições suaves
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Implementar gerenciamento de foco e acessibilidade
  - Adicionar atributos ARIA ao menu e botões (aria-label, aria-expanded, role)
  - Implementar focus trap usando useEffect e refs
  - Mover foco para primeiro item quando menu abre
  - Restaurar foco para botão hamburger quando menu fecha
  - Adicionar handler para tecla Escape fechar o menu
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 4.2_

- [ ]* 3.1 Escrever testes de acessibilidade
  - Testar presença de atributos ARIA
  - Testar que Escape fecha o menu
  - Testar gerenciamento de foco (abertura e fechamento)
  - Testar focus trap
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 4.2_

- [x] 4. Implementar prevenção de scroll e comportamento responsivo
  - Adicionar useEffect para bloquear scroll do body quando menu está aberto
  - Adicionar useEffect para fechar menu automaticamente em resize para desktop
  - Garantir cleanup de event listeners
  - _Requirements: 4.4, 1.2_

- [x] 5. Atualizar componente Header
  - Adicionar estado isMobileMenuOpen usando useState
  - Adicionar botão hamburger com ícones Bars3Icon e XMarkIcon do Heroicons
  - Implementar transição de ícone baseada no estado isOpen
  - Adicionar classes Tailwind para exibir hamburger apenas em mobile (md:hidden)
  - Remover botões de navegação inline mobile existentes (Produtos, Carrinho, Garantia)
  - Integrar componente MobileMenu passando todas as props necessárias
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.5_

- [ ]* 5.1 Escrever testes unitários para Header atualizado
  - Testar que ícone hamburger é exibido em mobile
  - Testar que ícone hamburger é ocultado em desktop
  - Testar que clique no hamburger abre o menu
  - Testar que estado do ícone muda quando menu abre/fecha
  - Testar que botões inline mobile foram removidos
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.5_

- [x] 6. Implementar fechamento do menu ao navegar
  - Adicionar handler onClick nos links de navegação do MobileMenu
  - Chamar onClose quando qualquer link é clicado
  - Garantir que navegação ocorre antes do menu fechar
  - _Requirements: 2.5_

- [ ] 7. Checkpoint - Garantir que todos os testes passam
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 8. Testes de integração
  - Criar testes de integração para fluxo completo: abrir menu → clicar link → navegar → menu fecha
  - Testar interação entre Header e MobileMenu
  - Testar comportamento com diferentes estados de autenticação
  - _Requirements: 1.3, 2.5, 2.2, 2.3, 2.4_
