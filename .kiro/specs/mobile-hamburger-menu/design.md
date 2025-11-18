# Design Document

## Overview

Este documento descreve o design técnico para implementação de um menu hamburger responsivo na aplicação IRON DISTRIBUIDORA SC. A solução substituirá os botões de navegação inline mobile existentes por um menu lateral colapsável, melhorando a usabilidade e a estética da interface em dispositivos móveis.

A implementação utilizará React hooks para gerenciamento de estado, Framer Motion para animações suaves, HeroUI para componentes base, e Tailwind CSS para estilização, mantendo consistência com a arquitetura existente do projeto.

## Architecture

### Component Structure

```
Header (existing)
├── Logo & Brand
├── Desktop Navigation (md:flex)
├── Mobile Hamburger Button (md:hidden) [NEW]
└── Right Actions (Theme, Auth, Cart)

MobileMenu (new component)
├── Overlay (backdrop)
└── Sidebar Panel
    ├── Close Button
    ├── User Info (if authenticated)
    ├── Navigation Links
    └── Auth Button
```

### State Management

O estado do menu será gerenciado localmente no componente Header usando `useState`:

```typescript
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
```

Este estado será passado como prop para o componente MobileMenu, seguindo o padrão de "lifting state up" do React.

### Responsive Behavior

- **Mobile (< 768px)**: Exibe ícone hamburger, oculta navegação horizontal
- **Desktop (≥ 768px)**: Oculta ícone hamburger, exibe navegação horizontal

Utilizaremos as classes utilitárias do Tailwind (`md:hidden`, `md:flex`) para controlar a visibilidade.

## Components and Interfaces

### MobileMenu Component

**Location**: `src/components/layout/MobileMenu.tsx`

**Props Interface**:
```typescript
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string | null;
  userEmail?: string | null;
  isAuthenticated: boolean;
  currentPath: string;
}
```

**Responsibilities**:
- Renderizar overlay e sidebar
- Gerenciar animações de entrada/saída
- Implementar focus trap quando aberto
- Lidar com eventos de teclado (Escape)
- Renderizar links de navegação
- Exibir informações do usuário autenticado
- Renderizar botão de autenticação apropriado

### Header Component Updates

**Location**: `src/components/layout/Header.tsx` (existing)

**Changes**:
1. Adicionar estado `isMobileMenuOpen`
2. Adicionar botão hamburger com ícone do Heroicons
3. Remover botões de navegação inline mobile existentes
4. Integrar componente MobileMenu
5. Passar props necessárias para MobileMenu

### HamburgerIcon Component

**Implementation**: Usar `Bars3Icon` e `XMarkIcon` do `@heroicons/react/24/outline`

**Behavior**: Transição animada entre os dois ícones baseada no estado `isOpen`

## Data Models

Não há novos modelos de dados. O componente utilizará dados existentes:

- `session` do NextAuth (user name, email)
- `pathname` do Next.js router
- Estado local para controle de abertura/fechamento

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN o viewport é menor que 768px, THE Sistema SHALL exibir um ícone hamburger no Header
  Thoughts: Este é um comportamento de renderização condicional baseado no tamanho da tela. Podemos testar isso verificando que o ícone hamburger está presente quando renderizamos em um viewport mobile e ausente em desktop.
  Testable: yes - example

1.2 WHEN o viewport é igual ou maior que 768px, THE Sistema SHALL ocultar o ícone hamburger e exibir a navegação horizontal padrão
  Thoughts: Este é o comportamento inverso do 1.1. É redundante testar ambos separadamente, pois são faces da mesma moeda.
  Testable: redundant with 1.1

1.3 WHEN o usuário clica no ícone hamburger, THE Sistema SHALL abrir o Menu Mobile
  Thoughts: Este é um teste de interação específico. Podemos simular o clique e verificar que o estado muda e o menu aparece.
  Testable: yes - example

1.4 WHEN o Menu Mobile está aberto, THE Sistema SHALL transformar o ícone hamburger em um ícone de fechar (X)
  Thoughts: Este é um teste de renderização condicional baseado no estado. Podemos verificar que quando isOpen=true, o ícone X é renderizado.
  Testable: yes - example

1.5 WHEN o usuário clica no ícone de fechar, THE Sistema SHALL fechar o Menu Mobile
  Thoughts: Este é o inverso de 1.3, testando o fechamento. É importante testar ambos os fluxos.
  Testable: yes - example

2.1 WHEN o Menu Mobile está aberto, THE Sistema SHALL exibir links para Produtos, Carrinho e Garantia
  Thoughts: Este é um teste de conteúdo do menu. Podemos verificar que todos os links esperados estão presentes quando o menu está aberto.
  Testable: yes - example

2.2 WHEN o usuário está autenticado, THE Sistema SHALL exibir o nome do usuário no Menu Mobile
  Thoughts: Este é um teste de renderização condicional. Podemos passar diferentes estados de autenticação e verificar a presença do nome.
  Testable: yes - example

2.3 WHEN o usuário está autenticado, THE Sistema SHALL exibir um botão de Sair no Menu Mobile
  Thoughts: Similar a 2.2, teste de renderização condicional baseado em autenticação.
  Testable: yes - example

2.4 WHEN o usuário não está autenticado, THE Sistema SHALL exibir um botão de Entrar no Menu Mobile
  Thoughts: Este é o caso oposto de 2.3. Ambos são importantes para testar.
  Testable: yes - example

2.5 WHEN o usuário clica em qualquer link de navegação, THE Sistema SHALL fechar o Menu Mobile e navegar para a página correspondente
  Thoughts: Este é um teste de comportamento que deve se aplicar a todos os links. Podemos testar com um link específico como exemplo.
  Testable: yes - example

3.1 WHEN o Menu Mobile abre, THE Sistema SHALL animar a entrada do painel lateral da direita para a esquerda
  Thoughts: Este é um teste de animação visual. É difícil testar animações em testes unitários, mas podemos verificar que as classes/props de animação estão presentes.
  Testable: no

3.2 WHEN o Menu Mobile fecha, THE Sistema SHALL animar a saída do painel lateral da esquerda para a direita
  Thoughts: Similar a 3.1, teste de animação visual.
  Testable: no

3.3 WHEN o Menu Mobile abre, THE Sistema SHALL animar o fade-in do Overlay
  Thoughts: Teste de animação visual.
  Testable: no

3.4 WHEN o Menu Mobile fecha, THE Sistema SHALL animar o fade-out do Overlay
  Thoughts: Teste de animação visual.
  Testable: no

3.5 WHEN o ícone hamburger transforma em ícone de fechar, THE Sistema SHALL animar a transição suavemente
  Thoughts: Teste de animação visual.
  Testable: no

4.1 WHEN o Menu Mobile está aberto e o usuário clica no Overlay, THE Sistema SHALL fechar o Menu Mobile
  Thoughts: Este é um teste de interação específico. Podemos simular o clique no overlay e verificar que onClose é chamado.
  Testable: yes - example

4.2 WHEN o Menu Mobile está aberto e o usuário pressiona a tecla Escape, THE Sistema SHALL fechar o Menu Mobile
  Thoughts: Este é um teste de evento de teclado. Podemos simular o evento e verificar o comportamento.
  Testable: yes - example

4.3 WHEN o Menu Mobile está fechando, THE Sistema SHALL remover o Overlay da tela
  Thoughts: Este é um comportamento implícito quando isOpen=false. É redundante com o teste de fechamento.
  Testable: redundant

4.4 WHEN o Menu Mobile está aberto, THE Sistema SHALL prevenir scroll do conteúdo principal
  Thoughts: Este é um teste de efeito colateral no DOM. Podemos verificar que a classe ou estilo apropriado é aplicado ao body.
  Testable: yes - example

5.1 WHEN o ícone hamburger é renderizado, THE Sistema SHALL incluir um atributo aria-label descritivo
  Thoughts: Este é um teste de acessibilidade. Podemos verificar a presença do atributo.
  Testable: yes - example

5.2 WHEN o Menu Mobile abre, THE Sistema SHALL mover o foco para o primeiro item de navegação
  Thoughts: Este é um teste de gerenciamento de foco. Podemos verificar que o elemento correto recebe foco.
  Testable: yes - example

5.3 WHEN o usuário navega com Tab dentro do Menu Mobile, THE Sistema SHALL manter o foco dentro do menu (focus trap)
  Thoughts: Este é um teste de comportamento de foco complexo. Podemos simular navegação por Tab e verificar que o foco não escapa.
  Testable: yes - example

5.4 WHEN o Menu Mobile fecha, THE Sistema SHALL retornar o foco para o ícone hamburger
  Thoughts: Este é um teste de restauração de foco. Podemos verificar que após fechar, o foco volta ao botão correto.
  Testable: yes - example

5.5 WHEN o Menu Mobile está aberto, THE Sistema SHALL incluir atributos ARIA apropriados para indicar o estado do menu
  Thoughts: Este é um teste de acessibilidade. Podemos verificar a presença de atributos como aria-expanded, role, etc.
  Testable: yes - example

6.1 THE Sistema SHALL criar um componente separado chamado MobileMenu em `src/components/layout/MobileMenu.tsx`
  Thoughts: Este é um requisito de estrutura de código, não um comportamento testável.
  Testable: no

6.2 THE Sistema SHALL utilizar hooks do React para gerenciar o estado de abertura/fechamento do menu
  Thoughts: Este é um requisito de implementação, não um comportamento testável.
  Testable: no

6.3 THE Sistema SHALL utilizar Tailwind CSS para estilização seguindo os padrões do projeto
  Thoughts: Este é um requisito de implementação, não um comportamento testável.
  Testable: no

6.4 THE Sistema SHALL manter compatibilidade com o tema claro e escuro existente
  Thoughts: Este é um comportamento testável. Podemos renderizar o componente em ambos os temas e verificar que as classes apropriadas são aplicadas.
  Testable: yes - example

6.5 THE Sistema SHALL remover os botões de navegação inline mobile do Header quando o menu hamburger for implementado
  Thoughts: Este é um requisito de refatoração, não um comportamento testável.
  Testable: no

### Property Reflection

Após revisar todos os critérios de aceitação testáveis, identificamos que a maioria são testes de exemplo específicos (verificação de renderização, interação, acessibilidade) e não propriedades universais. Não há propriedades que se apliquem a "todos" os casos ou que possam ser generalizadas com quantificação universal.

Os testes de animação (3.1-3.5) não são testáveis em testes unitários convencionais. Os requisitos de estrutura de código (6.1-6.3, 6.5) não são comportamentos testáveis.

Portanto, não há propriedades universais a serem definidas para este componente. A validação será feita através de testes de exemplo específicos e testes manuais de UI.

## Error Handling

### Edge Cases

1. **Menu aberto durante redimensionamento**: Se o usuário redimensionar a janela de mobile para desktop com o menu aberto, o menu deve fechar automaticamente
2. **Múltiplos cliques rápidos**: Debounce ou prevenção de múltiplas aberturas/fechamentos simultâneos
3. **Navegação programática**: Se a rota mudar programaticamente, o menu deve fechar
4. **Session loading**: Exibir estado de carregamento apropriado para informações do usuário

### Error States

- **Falha ao carregar session**: Tratar graciosamente, exibir botão de login
- **Navegação falha**: Não impedir fechamento do menu mesmo se navegação falhar

## Testing Strategy

### Unit Testing

Utilizaremos **Jest** e **React Testing Library** para testes unitários, seguindo os padrões do Next.js.

**Test File**: `src/components/layout/__tests__/MobileMenu.test.tsx`

**Test Cases**:
1. Renderização condicional baseada em `isOpen`
2. Clique no overlay chama `onClose`
3. Pressionar Escape chama `onClose`
4. Links de navegação são renderizados corretamente
5. Informações do usuário autenticado são exibidas
6. Botão de autenticação correto é exibido (Login vs Logout)
7. Atributos de acessibilidade estão presentes
8. Tema claro/escuro aplica classes corretas
9. Clique em link de navegação chama `onClose`

**Test File**: `src/components/layout/__tests__/Header.test.tsx`

**Test Cases**:
1. Ícone hamburger é exibido em mobile
2. Ícone hamburger é ocultado em desktop
3. Clique no hamburger abre o menu
4. Estado do ícone muda quando menu abre/fecha
5. Botões de navegação inline mobile foram removidos

### Integration Testing

Testes de integração verificarão:
1. Fluxo completo de abrir menu → clicar em link → navegar → menu fecha
2. Interação entre Header e MobileMenu
3. Comportamento com diferentes estados de autenticação

### Manual Testing Checklist

- [ ] Animações são suaves em diferentes dispositivos
- [ ] Menu funciona em diferentes tamanhos de tela mobile
- [ ] Transição mobile ↔ desktop funciona corretamente
- [ ] Focus trap funciona corretamente
- [ ] Scroll é prevenido quando menu está aberto
- [ ] Tema claro/escuro funciona corretamente
- [ ] Acessibilidade com screen readers

## Implementation Notes

### Animation Configuration

Usar Framer Motion com as seguintes configurações:

```typescript
// Sidebar animation
const sidebarVariants = {
  closed: { x: '100%' },
  open: { x: 0 }
};

// Overlay animation
const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 }
};

// Transition config
const transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30
};
```

### Focus Management

Implementar focus trap usando `useEffect`:

```typescript
useEffect(() => {
  if (isOpen) {
    // Store current focus
    const previousFocus = document.activeElement;
    
    // Move focus to first menu item
    firstMenuItemRef.current?.focus();
    
    // Setup focus trap
    const handleTab = (e: KeyboardEvent) => {
      // Trap focus logic
    };
    
    document.addEventListener('keydown', handleTab);
    
    return () => {
      document.removeEventListener('keydown', handleTab);
      // Restore focus
      (previousFocus as HTMLElement)?.focus();
    };
  }
}, [isOpen]);
```

### Body Scroll Lock

```typescript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);
```

### Responsive Behavior

Fechar menu automaticamente quando viewport muda para desktop:

```typescript
useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth >= 768 && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [isMobileMenuOpen]);
```

### Accessibility Attributes

```typescript
// Hamburger button
<button
  aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
  aria-expanded={isOpen}
  aria-controls="mobile-menu"
>

// Menu container
<nav
  id="mobile-menu"
  role="navigation"
  aria-label="Menu de navegação mobile"
>
```

## Dependencies

- **React**: Hooks (useState, useEffect, useRef)
- **Next.js**: Link, usePathname
- **NextAuth**: useSession, signOut
- **Framer Motion**: AnimatePresence, motion components
- **Heroicons**: Bars3Icon, XMarkIcon
- **HeroUI**: Button component
- **Tailwind CSS**: Utility classes

## Performance Considerations

1. **Lazy rendering**: Renderizar conteúdo do menu apenas quando `isOpen` é true
2. **Event listener cleanup**: Garantir que todos os event listeners sejam removidos
3. **Animation performance**: Usar `transform` e `opacity` para animações (GPU-accelerated)
4. **Debounce resize**: Considerar debounce no resize listener se houver problemas de performance

## Browser Compatibility

- Suporte para navegadores modernos (Chrome, Firefox, Safari, Edge)
- Framer Motion requer suporte a ES6+
- Tailwind CSS funciona em todos os navegadores modernos
- Focus trap pode precisar de polyfill para navegadores muito antigos (não é o caso do target)
