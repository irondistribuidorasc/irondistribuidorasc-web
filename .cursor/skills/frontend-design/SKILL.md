---
name: frontend-design
description: Cria interfaces production-grade com alta qualidade visual para a Iron Distribuidora SC. Usar ao construir componentes, paginas ou aplicacoes. Gera codigo polido que segue o Brand Book e evita estetica generica de IA.
---

Guia para criacao de interfaces production-grade para a Iron Distribuidora SC. Toda implementacao visual deve respeitar a identidade da marca definida em `docs/Brand_Book_Iron.md`, enquanto explora criatividade em layout, composicao e animacoes.

## Design Thinking

Antes de codificar, analisar o contexto:
- **Proposito**: Que problema essa interface resolve? Quem usa? (lojistas de assistencia tecnica, admin interno)
- **Hierarquia**: Qual e a informacao mais importante da tela? Como guiar o olho do usuario?
- **Diferenciacao**: O que torna essa interface memoravel dentro dos limites da marca?
- **Densidade**: A tela pede respiro visual (hero, landing) ou densidade controlada (admin, catalogo)?

Executar com intencionalidade. Cada decisao visual deve ter um motivo claro.

## Limites do Brand Book (Fixo vs. Livre)

### FIXO — Nao alterar

| Elemento | Regra | Fonte |
|----------|-------|-------|
| **Fonte** | Inter em todos os pesos (400-800) | Brand Book sec. 03 |
| **Cores brand** | Paleta `brand-50` a `brand-900`, primary `#DC0714` | Brand Book sec. 04 |
| **Cores semanticas** | success `#22C55E`, error `#EF4444`, warning `#EAB308`, info `#3B82F6` | Brand Book sec. 5.1 |
| **Tokens de tema** | `bg-content1`, `text-foreground`, `text-default-500`, `border-divider` | Brand Book sec. 04 |
| **Espacamento** | Grid 4px (multiplos de 4: 4, 8, 16, 24, 32, 64) | Brand Book sec. 5.3 |
| **Border radius** | Escala definida: sm 4px, md 8px, lg 12px, xl 16px, 2xl 24px, 3xl 32px, full | Brand Book sec. 5.2 |
| **Iconografia** | Heroicons Outline, tamanhos h-5/h-6/h-8 | Brand Book sec. 5.5 |
| **Tom de voz** | Direto, profissional, orientado a acao. Sem emojis nem linguagem casual | Brand Book sec. 5.6 |
| **Componentes base** | HeroUI (Button, Card, Input, Modal, etc.) | Brand Book sec. 07 |

### LIVRE — Experimentar

| Area | Liberdade |
|------|-----------|
| **Composicao espacial** | Layouts assimetricos, sobreposicoes, fluxo diagonal, grid-breaking, negative space generoso |
| **Animacoes** | Staggered reveals, scroll-triggered animations, hover states criativos, parallax, animacoes de entrada |
| **Fundos e atmosfera** | Gradient meshes, radial gradients, blobs animados, noise textures, camadas de profundidade |
| **Efeitos visuais** | Glassmorphism, grain overlays, sombras dramaticas, transparencias em camadas, backdrop-blur |
| **Hierarquia visual** | Escalas tipograficas ousadas (6xl+ para hero), contrastes fortes de peso, tracking variado |
| **Transicoes** | Easing customizado, duracoes variadas, orquestracao de multiplos elementos |
| **Decoracoes** | Bordas criativas, separadores visuais, elementos geometricos, shapes de fundo |

## Diretrizes de Qualidade Estetica

### Tipografia

Inter e a fonte da Iron, mas a hierarquia tipografica deve ser expressiva:
- H1/Hero: `text-4xl font-extrabold tracking-tight md:text-6xl` — escala responsiva obrigatoria
- H2: `text-3xl font-bold` — contraste claro com H1
- H3: `text-xl font-semibold` — distinguivel do body
- Body: `text-base font-normal` ou `text-lg` — legibilidade maxima
- Small/Meta: `text-sm font-medium text-default-500` — hierarquia sutil

Pesos distintos criam contraste. Nunca usar o mesmo peso para niveis diferentes.

### Cor e Tema

- Brand `brand-500`/`brand-600` como cor dominante com acentos precisos
- Tokens semanticos (`bg-content1`, `text-foreground`, `border-divider`) para compatibilidade light/dark
- Gradientes brand permitidos: `from-brand-500 to-brand-600` para destaques
- Cores decorativas (ex: brand com opacidade `brand-500/10`) permitidas em fundos sem funcao semantica
- Nunca hex hardcoded — sempre tokens

### Motion e Micro-interacoes

Priorizar momentos de alto impacto sobre quantidade:
- **Page load**: Staggered reveals com `animation-delay` criam mais impacto que animacoes dispersas
- **Hover states**: Cards com `hover:-translate-y-1 hover:shadow-md transition-all`, CTAs com `hover:scale-105`
- **Scroll**: Scroll-triggered animations para secoes que entram no viewport
- **Decorativos**: Blobs (`animate-blob`), float (`animate-float`), shimmer (`animate-shimmer`)
- **Feedback**: Transicoes suaves em todos os elementos interativos (`transition-colors`, `transition-shadow`)

Usar Framer Motion para orquestracoes complexas. CSS puro para transicoes simples.

### Composicao Espacial

Ir alem de layouts previsíveis:
- Assimetria intencional em hero sections e landing pages
- Negative space generoso em secoes de destaque (py-16 md:py-24)
- Sobreposicao de elementos decorativos com `absolute` + `z-index`
- Grid responsivo como base (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`)
- Densidade controlada em telas de dados (admin, listas) vs. respiro em telas de marketing

### Fundos e Profundidade Visual

Nunca usar fundos solidos planos em secoes de destaque:
- Gradientes sutis: `bg-gradient-to-b from-background to-content1`
- Radial gradients decorativos: `bg-[radial-gradient(ellipse_at_top,...)]`
- Blobs animados com blur para atmosfera: `rounded-full bg-brand-500/10 blur-3xl animate-blob`
- Sombras escalonadas por hierarquia: `shadow-sm` (cards) < `shadow-md` (hover) < `shadow-lg` (dropdowns) < `shadow-xl` (hero/modais)

## Anti-patterns

Evitar:
- Fundos solidos planos em secoes de destaque (usar gradientes/blobs)
- Mesmo peso tipografico para todos os niveis (criar hierarquia com pesos distintos)
- Espacamento arbitrario (valores como `p-3`, `mb-5`, `gap-[13px]` — usar multiplos de 4)
- Hex hardcoded (`bg-[#DC0714]` — usar tokens `bg-brand-600`)
- Cores que quebram em dark mode (`bg-white`, `text-black` — usar `bg-content1`, `text-foreground`)
- Sombra uniforme em toda a UI (escalar por hierarquia)
- Hover states sem transicao (sempre `transition-all` ou `transition-colors`)
- Estados vazios sem orientacao (sempre mensagem + acao contextual)
- Loading com texto generico (usar Skeleton que preserva layout)
- Alert nativo (usar Sonner: `toast.success/error/warning/info`)
- Botoes manuais sem estados acessiveis (usar HeroUI Button)
- Layouts fixos sem responsividade (mobile-first com breakpoints)

## Referencia detalhada

Para checklists com exemplos de design generico vs. design alinhado ao Brand Book, consulte [checklists.md](checklists.md).
