# IDENTIDADE VISUAL v1.0 - DESIGN SYSTEM SPEC

## IRON DISTRIBUIDORA SC

**PEÇAS DE QUALIDADE. GARANTIA REAL. PARCERIA VERDADEIRA.**

### ESTE DOCUMENTO É O GUIA VISUAL DA MARCA IRON.

Aqui você encontrará as diretrizes visuais da Iron Distribuidora SC traduzidas em código, cor e tipografia. Este guia serve como documentação base para garantir consistência entre o modo Light (padrão) e Dark (alternativo), mantendo a identidade forte e confiável que caracteriza a marca.

---

## 01. O QUE É ISSO?

### DEBRIEFING & PROPÓSITO

A Iron Distribuidora SC nasce com o propósito de ser a parceira confiável do lojista de assistência técnica de celulares em Santa Catarina. O nome "IRON" (ferro em inglês) carrega a força, solidez e durabilidade que representam a qualidade das peças e a garantia oferecida.

Enquanto o mercado foca em preço baixo sem compromisso, nós focamos na **relação de confiança**. A Iron é o ponto de encontro entre a qualidade de produtos homologados e o atendimento ágil que o lojista precisa.

### PILARES DA MARCA

- **QUALIDADE:** Peças homologadas com garantia de 1 ano não é diferencial, é obrigação.
- **AGILIDADE:** Logística própria e atendimento via WhatsApp em tempo real.
- **PARCERIA:** Relacionamento de longo prazo com nossos lojistas.

---

## 02. QUEM SOMOS?

### ARQUÉTIPOS DA MARCA

#### O FORNECEDOR CONFIÁVEL
Representa a solidez, a garantia e a segurança. O lojista pode contar com a Iron para nunca ficar sem peças. Na marca, ele se manifesta através de um design limpo, vermelho marcante e comunicação direta.

> "Sua loja nunca para quando você tem a Iron como parceira."

#### O PARCEIRO REGIONAL
Representa a proximidade e o conhecimento da região. A Iron conhece as necessidades dos lojistas de Itapema, Tijucas, Porto Belo e São João Batista. Entregas diárias e atendimento personalizado.

> "Entendemos seu negócio porque estamos do seu lado."

---

## 03. TIPOGRAFIA

### A VOZ DO SISTEMA
A escolha tipográfica reflete a clareza e profissionalismo da Iron: legibilidade máxima e hierarquia clara.

#### SANS SERIF (Principal)
- **Família:** Inter
- **Uso:** Títulos, textos corridos e UI. Moderna, geométrica e altamente legível.
- **Pesos:**
  - **Extra Bold (800):** Títulos principais e hero sections.
  - **Bold (700):** Subtítulos e CTAs.
  - **Semibold (600):** Ênfases e labels.
  - **Medium (500):** Subtítulos secundários.
  - **Regular (400):** Corpo de texto e descrições.

#### HIERARQUIA TIPOGRÁFICA

| Elemento | Tamanho | Peso | Uso |
| :--- | :--- | :--- | :--- |
| **H1** | 4xl - 6xl | Extra Bold | Hero section, títulos principais |
| **H2** | 3xl - 4xl | Bold | Títulos de seção |
| **H3** | xl - 2xl | Bold | Subtítulos, cards |
| **Body** | base - lg | Regular | Texto corrido |
| **Small** | sm - xs | Regular/Medium | Labels, metadados |

---

## 04. CORES

### SISTEMA DUAL: LIGHT & DARK
A Iron Distribuidora opera em dois modos. O Light Mode é nosso habitat natural (clareza, confiança, profissionalismo). O Dark Mode é nossa alternativa para ambientes de baixa luminosidade.

#### A. BRAND (Vermelho Iron)
A cor primária da marca que representa força, energia e urgência.

| Token | Hex | Uso |
| :--- | :--- | :--- |
| `brand-50` | `#FFE5E6` | Backgrounds sutis, hover states |
| `brand-100` | `#FFCCCE` | Backgrounds secundários |
| `brand-200` | `#FF999E` | Borders ativos |
| `brand-300` | `#FF666D` | Estados hover leves |
| `brand-400` | `#FF333D` | Ícones secundários |
| `brand-500` | `#DC0714` | **Primary - CTA, links, badges** |
| `brand-600` | `#B0060F` | Hover em CTAs |
| `brand-700` | `#84040B` | Pressed states |
| `brand-800` | `#580308` | Texto sobre fundos claros |
| `brand-900` | `#2C0104` | Texto de máximo contraste |

#### B. LIGHT MODE (Padrão)
- **Background:** `Pure White #FFFFFF`
- **Surface:** `Neutral 50 #FAFAFA`
- **Border:** `Neutral 200 #E5E5E5`
- **Text Primary:** `Neutral 900 #171717`
- **Text Secondary:** `Neutral 500 #737373`

#### C. DARK MODE (Alternativo)
- **Background:** `Neutral 950 #0A0A0A`
- **Surface:** `Neutral 900 #171717`
- **Border:** `Neutral 800 #262626`
- **Text Primary:** `Neutral 50 #FAFAFA`
- **Text Secondary:** `Neutral 400 #A3A3A3`

---

## 05. DESIGN TOKENS & SYSTEM

Especificações técnicas para garantir a consistência da engenharia visual.

### 5.1. PALETA SEMÂNTICA (STATUS)
Cores funcionais para feedback e estados do sistema.

| Status | Cor | Hex | Uso |
| :--- | :--- | :--- | :--- |
| **SUCCESS** | Verde | `#22C55E` | Pedidos confirmados, entregas realizadas, estoque ok |
| **ERROR** | Vermelho | `#EF4444` | Erros de formulário, estoque zerado, falhas |
| **WARNING** | Amarelo | `#EAB308` | Estoque baixo, garantia próxima do vencimento |
| **INFO** | Azul | `#3B82F6` | Links informativos, status de processamento |

### 5.1.1. REGRAS DE USO SEMÂNTICO
- **Primary (Brand):** use `brand-500` para CTAs, links e estados ativos.
- **Danger/Error:** use `#EF4444` apenas para erros e ações destrutivas.
- **Acentos decorativos:** cores fora da paleta (ex.: violeta) são permitidas apenas em fundos/blur/gradientes sem função semântica. Não usar em texto, ícones de ação ou estados.

### 5.2. GEOMETRIA & BORDERS
Visual limpo e profissional. Cards e botões com cantos levemente arredondados.

- **Border Radius:**
  - `sm: 4px` (Tags, badges, inputs pequenos)
  - `md: 8px` (Botões padrão, inputs)
  - `lg: 12px` (Cards, modais)
  - `xl: 16px` (Cards destacados)
  - `2xl: 24px` (Hero cards, containers principais)
  - `3xl: 32px` (Elementos especiais, imagens de produto)
  - `full: 9999px` (Avatares, badges circulares, pills)

- **Borders:**
  - Espessura padrão: `1px` sólida.
  - Usamos bordas sutis para separar conteúdo: `border-slate-100` (light) / `border-slate-800` (dark).

### 5.3. ESPAÇAMENTO (GRID 4px)
Ritmo vertical e horizontal baseado em múltiplos de 4.

| Token | Valor | Uso |
| :--- | :--- | :--- |
| `xs` | 4px | Gap mínimo, padding interno de badges |
| `sm` | 8px | Gap entre elementos inline |
| `md` | 16px | Padding de cards, gap de grid |
| `lg` | 24px | Padding de seções |
| `xl` | 32px | Gap entre seções |
| `2xl` | 64px | Padding vertical de seções principais (py-24) |

### 5.4. SOMBRAS & ELEVAÇÃO
Sistema de elevação para hierarquia visual.

```css
/* Sombras utilizadas */
shadow-sm    /* Cards em repouso */
shadow-md    /* Cards em hover */
shadow-lg    /* Modais, dropdowns */
shadow-xl    /* Hero elements */
shadow-2xl   /* Elementos de destaque máximo */
```

### 5.5. ICONOGRAFIA
- **Biblioteca:** Heroicons (Outline style)
- **Tamanhos:** `h-5 w-5` (inline), `h-6 w-6` (padrão), `h-8 w-8` (destaque)
- **Cor:** Herda do texto ou usa `text-brand-600` para ênfase

### 5.6. UX WRITING (TOM DE VOZ)
Comunicação direta, profissional e orientada à ação.

| Contexto | **Evitar** | **Usar (Iron)** |
| :--- | :--- | :--- |
| **Erro** | "Oops! Algo deu errado :(" | "Erro ao processar. Tente novamente." |
| **Sucesso** | "Oba! Deu tudo certo!" | "Pedido confirmado com sucesso." |
| **Botão** | "Clique aqui para ver" | "Ver catálogo completo" |
| **Vazio** | "Nada por aqui ainda..." | "Nenhum produto encontrado. Ajuste os filtros." |
| **CTA Principal** | "Comprar agora!" | "Fazer pedido de peças" |
| **Garantia** | "Temos garantia!" | "Garantia de 1 ano" |

---

## 06. SÍMBOLO & LOGO

### LÓGICA DE CONSTRUÇÃO
O logotipo da Iron Distribuidora SC utiliza uma combinação de símbolo circular (representando peças/componentes) com tipografia bold.

#### ELEMENTOS DO LOGO
- **Símbolo:** Logo circular com gradiente brand (brand-500 a brand-600)
- **Tipografia:** "IRON DISTRIBUIDORA SC" em fonte Inter, peso semibold a bold
- **Variações:** Logo completo (símbolo + texto) ou apenas símbolo para espaços reduzidos

#### ÁREA DE PROTEÇÃO
Manter distância mínima equivalente à altura do símbolo em todas as direções.

#### APLICAÇÕES
- **Favicon:** Símbolo em versão simplificada (16x16, 32x32)
- **Header:** Símbolo + nome completo
- **Rodapé:** Logo completo com tagline opcional
- **Mobile:** Apenas símbolo quando necessário

---

## 07. COMPONENTES UI

### BIBLIOTECA BASE
- **Framework:** Hero UI (baseado em React Aria + Tailwind)
- **Customização:** Tema personalizado com cores brand

### BOTÕES

#### Primary (CTA)
```jsx
<Button className="bg-brand-600 text-white hover:bg-brand-700 font-semibold">
  Fazer pedido de peças
</Button>
```

#### Secondary (Bordered)
```jsx
<Button variant="bordered" className="border-slate-200 text-slate-700 hover:bg-brand-50">
  Solicitar garantia
</Button>
```

### CARDS
```jsx
<Card className="border border-slate-100 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
  {/* conteúdo */}
</Card>
```

### BADGES
```jsx
<span className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-600">
  Garantia 1 ano
</span>
```

---

## 08. ANIMAÇÕES

### MICRO-INTERAÇÕES
A Iron utiliza animações sutis para feedback visual.

#### BLOB (Background)
```css
@keyframes blob {
  0%: { transform: translate(0px, 0px) scale(1) }
  33%: { transform: translate(30px, -50px) scale(1.1) }
  66%: { transform: translate(-20px, 20px) scale(0.9) }
  100%: { transform: translate(0px, 0px) scale(1) }
}
animation: blob 7s infinite;
```

#### FLOAT (Elementos decorativos)
```css
@keyframes float {
  0%, 100%: { transform: translateY(0) }
  50%: { transform: translateY(-20px) }
}
animation: float 6s ease-in-out infinite;
```

#### SHIMMER (Texto destacado)
```css
@keyframes shimmer {
  0%: { background-position: 200% 0 }
  100%: { background-position: -200% 0 }
}
animation: shimmer 8s linear infinite;
```

#### HOVER STATES
- Cards: `hover:-translate-y-1` com transição suave
- Botões: `hover:scale-105` para CTAs principais
- Links: Mudança de cor com `transition-colors`

---

## 09. APLICAÇÕES

### UI EM CONTEXTO

#### 1. Hero Section (Light Mode)
```
┌────────────────────────────────────────────────────────────┐
│  [Logo]  IRON DISTRIBUIDORA SC                             │
│                                                            │
│  Peças para celular com                                    │
│  ████ garantia de 1 ano ████                              │
│                                                            │
│  Peças prontas para envio atacado, atendimento ágil        │
│  via WhatsApp e cobertura em Itapema, Tijucas e região.    │
│                                                            │
│  [████ Fazer pedido ████]  [Solicitar garantia]            │
│                                                            │
│  📱 WhatsApp: (48) 99114-7117                              │
│     Atendimento exclusivo para lojistas                    │
└────────────────────────────────────────────────────────────┘
```

#### 2. Card de Produto
```
┌────────────────────────────────┐
│  ┌──────────────────────────┐  │
│  │      [Imagem Peça]       │  │
│  └──────────────────────────┘  │
│                                │
│  Tela iPhone 13 Pro            │
│  ★★★★★ Premium                 │
│                                │
│  R$ 189,90                     │
│  [████ Adicionar ████]         │
└────────────────────────────────┘
```

#### 3. Status de Pedido
```
┌─────────────────────────────────────────────┐
│  Pedido #1234                               │
│                                             │
│  ● Confirmado    ○ Em separação    ○ Entregue │
│  ━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                             │
│  Status: Aguardando separação               │
│  Previsão: Hoje, até 18h                    │
└─────────────────────────────────────────────┘
```

---

## 10. ÁREA DE COBERTURA

### REGIÕES ATENDIDAS
A Iron Distribuidora SC atende com logística própria as seguintes cidades:

- **Itapema** - Entregas diárias
- **Tijucas** - Entregas diárias
- **Porto Belo** - Entregas diárias
- **São João Batista** - Entregas diárias
- **Balneário Camboriú** - Entregas programadas
- **Bombinhas** - Entregas programadas

### CONTATO
- **WhatsApp:** (48) 99114-7117
- **Site:** irondistribuidorasc.com.br
- **Horário:** Segunda a Sexta, 08h às 18h

---

## 11. DIRETRIZES DE ACESSIBILIDADE

### CONTRASTE
- Manter ratio mínimo de 4.5:1 para texto normal
- Manter ratio mínimo de 3:1 para texto grande e elementos interativos
- Testar em ambos os modos (light e dark)

### FOCO
- Indicadores de foco visíveis em todos os elementos interativos
- Navegação por teclado suportada em toda a aplicação

### TAMANHOS
- Inputs com mínimo de 16px de fonte (evitar zoom no iOS)
- Áreas de toque com mínimo de 44x44px em mobile

---

© 2024 Iron Distribuidora SC -- Peças de qualidade com garantia real.
