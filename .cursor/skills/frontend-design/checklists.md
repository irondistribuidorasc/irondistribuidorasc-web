# Checklists de Frontend Design - Referencia Detalhada

Exemplos de codigo com design generico vs. design alinhado ao Brand Book da Iron.

---

## 1. Tipografia

### Fonte generica vs. hierarquia Inter

```tsx
// RUIM - fonte generica sem hierarquia definida
<h1 className="text-2xl font-bold">Nossos Produtos</h1>
<p className="text-base">Confira nosso catalogo completo.</p>

// BOM - hierarquia tipografica conforme Brand Book (Inter, pesos corretos)
<h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
  Nossos Produtos
</h1>
<p className="text-lg font-normal text-default-500">
  Confira nosso catalogo completo.
</p>
```

### Pesos incorretos

```tsx
// RUIM - peso unico para tudo, sem contraste visual
<h2 className="font-bold">Telas</h2>
<h3 className="font-bold">iPhone 15</h3>
<span className="font-bold">Em estoque</span>

// BOM - pesos distintos criam hierarquia clara
<h2 className="text-3xl font-bold">Telas</h2>
<h3 className="text-xl font-semibold">iPhone 15</h3>
<span className="text-sm font-medium text-default-500">Em estoque</span>
```

### Tamanhos de texto sem escala

```tsx
// RUIM - tamanhos arbitrarios que nao seguem a escala
<p className="text-[13px]">Descricao do produto</p>
<span className="text-[11px]">Codigo: ABC-123</span>

// BOM - tamanhos da escala Tailwind alinhados ao Brand Book
<p className="text-base">Descricao do produto</p>
<span className="text-xs font-medium text-default-400">Codigo: ABC-123</span>
```

---

## 2. Cores e Tema

### Cor hardcoded vs. token

```tsx
// RUIM - cores hardcoded que quebram no tema dark
<div className="bg-white text-gray-800 border border-gray-200">
  <h3 className="text-black">Produto</h3>
  <p className="text-gray-500">Descricao</p>
</div>

// BOM - tokens semanticos que funcionam em ambos os temas
<div className="bg-content1 text-foreground border border-divider">
  <h3 className="text-foreground">Produto</h3>
  <p className="text-default-500">Descricao</p>
</div>
```

### Cor brand fora do token

```tsx
// RUIM - hex hardcoded da cor brand
<button className="bg-[#DC0714] text-white hover:bg-[#B0060F]">
  Fazer pedido
</button>

// BOM - tokens brand do design system
<button className="bg-brand-600 text-white hover:bg-brand-700 font-semibold">
  Fazer pedido
</button>
```

### Cores semanticas incorretas

```tsx
// RUIM - usa brand para erro, verde generico para sucesso
<span className="text-brand-500">Erro ao processar</span>
<span className="text-green-500">Pedido confirmado</span>

// BOM - cores semanticas do design system
<span className="text-danger">Erro ao processar</span>
<span className="text-success">Pedido confirmado</span>
```

---

## 3. Layout e Espacamento

### Espacamento arbitrario vs. grid 4px

```tsx
// RUIM - valores quebrados que nao seguem multiplos de 4
<div className="p-3 mb-5 gap-3">
  <h2 className="mb-3">Titulo</h2>
  <p className="mt-7">Descricao</p>
</div>

// BOM - espacamento em multiplos de 4px (1=4px, 2=8px, 4=16px, 6=24px, 8=32px)
<div className="p-4 mb-6 gap-4">
  <h2 className="mb-2">Titulo</h2>
  <p className="mt-4">Descricao</p>
</div>
```

### Secao sem ritmo vertical

```tsx
// RUIM - padding inconsistente entre secoes
<section className="py-8">
  <h2>Produtos</h2>
</section>
<section className="py-3">
  <h2>Garantia</h2>
</section>
<section className="py-12">
  <h2>Contato</h2>
</section>

// BOM - ritmo vertical consistente com py-24 (token 2xl = 64px) para secoes principais
<section className="py-16 md:py-24">
  <h2>Produtos</h2>
</section>
<section className="py-16 md:py-24">
  <h2>Garantia</h2>
</section>
<section className="py-16 md:py-24">
  <h2>Contato</h2>
</section>
```

### Grid sem gap consistente

```tsx
// RUIM - grid sem gap ou com gap arbitrario
<div className="grid grid-cols-3 gap-[13px]">
  {products.map((p) => <ProductCard key={p.id} product={p} />)}
</div>

// BOM - grid com gap em multiplo de 4 e colunas responsivas
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {products.map((p) => <ProductCard key={p.id} product={p} />)}
</div>
```

---

## 4. Componentes UI

### Botao manual vs. HeroUI

```tsx
// RUIM - botao manual sem estados acessiveis
<button
  className="bg-red-600 text-white px-4 py-2 rounded"
  onClick={handleSubmit}
>
  Enviar
</button>

// BOM - Button HeroUI com variantes do Brand Book
import { Button } from "@heroui/react";

<Button
  color="primary"
  className="bg-brand-600 text-white hover:bg-brand-700 font-semibold"
  onPress={handleSubmit}
  isLoading={isSubmitting}
>
  Fazer pedido de pecas
</Button>
```

### Card sem padrao visual

```tsx
// RUIM - card sem elevacao, transicao ou suporte dark
<div className="bg-white border rounded-md p-4">
  <h3>Tela iPhone 13</h3>
  <p>R$ 189,90</p>
</div>

// BOM - card conforme Brand Book com hover, sombra e transicao
import { Card, CardBody } from "@heroui/react";

<Card className="border border-divider bg-content1 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
  <CardBody className="p-4">
    <h3 className="text-lg font-semibold text-foreground">Tela iPhone 13</h3>
    <p className="text-xl font-bold text-brand-600">R$ 189,90</p>
  </CardBody>
</Card>
```

### Badge manual vs. padrao Brand Book

```tsx
// RUIM - badge com estilo inconsistente
<span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
  garantia
</span>

// BOM - badge conforme Brand Book (rounded-full, tracking-widest, uppercase)
<span className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-600">
  Garantia 1 ano
</span>
```

---

## 5. Animacoes e Micro-interacoes

### Hover sem transicao

```tsx
// RUIM - mudanca abrupta sem transicao
<Card className="hover:shadow-lg">
  <CardBody>Conteudo</CardBody>
</Card>

// BOM - transicao suave com translate e shadow
<Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300">
  <CardBody>Conteudo</CardBody>
</Card>
```

### Botao CTA sem feedback visual

```tsx
// RUIM - botao estatico sem resposta ao hover
<Button className="bg-brand-600 text-white">
  Fazer pedido
</Button>

// BOM - botao com escala e transicao no hover
<Button className="bg-brand-600 text-white hover:bg-brand-700 hover:scale-105 transition-all duration-200 font-semibold">
  Fazer pedido
</Button>
```

### Animacao decorativa com keyframes

```tsx
// RUIM - elemento decorativo estatico
<div className="absolute w-72 h-72 rounded-full bg-brand-500/10 blur-3xl" />

// BOM - blob animado para atmosfera visual (conforme Brand Book)
<div className="absolute w-72 h-72 rounded-full bg-brand-500/10 blur-3xl animate-blob" />

// Em globals.css (ja definido no projeto):
// @keyframes blob {
//   0%   { transform: translate(0px, 0px) scale(1) }
//   33%  { transform: translate(30px, -50px) scale(1.1) }
//   66%  { transform: translate(-20px, 20px) scale(0.9) }
//   100% { transform: translate(0px, 0px) scale(1) }
// }
```

### Entrada de conteudo sem stagger

```tsx
// RUIM - todos os cards aparecem ao mesmo tempo sem animacao
<div className="grid grid-cols-3 gap-4">
  {products.map((p) => (
    <ProductCard key={p.id} product={p} />
  ))}
</div>

// BOM - entrada escalonada com animation-delay para revelar progressivo
<div className="grid grid-cols-3 gap-4">
  {products.map((p, i) => (
    <ProductCard
      key={p.id}
      product={p}
      className="animate-fade-in-up opacity-0"
      style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}
    />
  ))}
</div>
```

---

## 6. Fundos e Profundidade Visual

### Fundo flat vs. atmosfera

```tsx
// RUIM - fundo solido sem profundidade
<section className="bg-white py-16">
  <h2>Nossos Diferenciais</h2>
</section>

// BOM - fundo com gradiente sutil e textura para atmosfera
<section className="relative overflow-hidden bg-gradient-to-b from-background to-content1 py-16 md:py-24">
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/5 via-transparent to-transparent" />
  <div className="relative z-10">
    <h2>Nossos Diferenciais</h2>
  </div>
</section>
```

### Sombras sem hierarquia

```tsx
// RUIM - mesma sombra para todos os elementos
<Card className="shadow-xl">Produto</Card>
<Dropdown className="shadow-xl">Menu</Dropdown>
<Modal className="shadow-xl">Conteudo</Modal>

// BOM - sombras escalonadas conforme hierarquia de elevacao (Brand Book 5.4)
<Card className="shadow-sm hover:shadow-md">Produto</Card>
<Dropdown className="shadow-lg">Menu</Dropdown>
<Modal className="shadow-xl">Conteudo</Modal>
```

### Hero section sem profundidade

```tsx
// RUIM - hero plano sem elementos visuais
<section className="bg-white py-20 text-center">
  <h1 className="text-3xl font-bold">Iron Distribuidora SC</h1>
  <p>Pecas de qualidade com garantia real</p>
  <button>Fazer pedido</button>
</section>

// BOM - hero com camadas visuais, blobs e gradientes
<section className="relative overflow-hidden bg-background py-16 md:py-24">
  {/* Blobs decorativos */}
  <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl animate-blob" />
  <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brand-500/5 blur-3xl animate-blob animation-delay-2000" />

  <div className="relative z-10 mx-auto max-w-4xl text-center">
    <span className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-600">
      Garantia 1 ano
    </span>
    <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
      Pecas para celular com{" "}
      <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
        garantia real
      </span>
    </h1>
    <p className="mt-4 text-lg text-default-500">
      Pecas prontas para envio atacado, atendimento agil via WhatsApp.
    </p>
    <div className="mt-8 flex items-center justify-center gap-4">
      <Button className="bg-brand-600 text-white hover:bg-brand-700 hover:scale-105 transition-all font-semibold">
        Fazer pedido de pecas
      </Button>
      <Button variant="bordered" className="border-divider text-foreground hover:bg-brand-50">
        Solicitar garantia
      </Button>
    </div>
  </div>
</section>
```

---

## 7. Responsividade e Mobile

### Layout fixo vs. responsivo

```tsx
// RUIM - largura fixa que quebra em mobile
<div className="w-[1200px] mx-auto">
  <div className="grid grid-cols-4 gap-6">
    {products.map((p) => <ProductCard key={p.id} product={p} />)}
  </div>
</div>

// BOM - container responsivo com breakpoints
<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {products.map((p) => <ProductCard key={p.id} product={p} />)}
  </div>
</div>
```

### Area de toque pequena

```tsx
// RUIM - botao de icone pequeno demais para touch (< 44x44px)
<button className="p-1" onClick={onClose}>
  <XMarkIcon className="h-4 w-4" />
</button>

// BOM - area de toque minima 44x44px conforme Brand Book (secao 11)
<button
  className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-default-100 transition-colors"
  onClick={onClose}
  aria-label="Fechar"
>
  <XMarkIcon className="h-5 w-5" />
</button>
```

### Tipografia nao responsiva

```tsx
// RUIM - tamanho fixo que fica enorme ou pequeno dependendo da tela
<h1 className="text-6xl font-extrabold">Pecas de Qualidade</h1>

// BOM - escala tipografica responsiva
<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
  Pecas de Qualidade
</h1>
```

---

## 8. UX Writing e Feedback

### Tom generico vs. tom Iron

```tsx
// RUIM - linguagem informal ou generica
<p className="text-gray-500">Oops! Algo deu errado :(</p>
<Button>Clique aqui para ver</Button>
<p>Nada por aqui ainda...</p>

// BOM - comunicacao direta e profissional conforme Brand Book (secao 5.6)
<p className="text-danger">Erro ao processar. Tente novamente.</p>
<Button>Ver catalogo completo</Button>
<p className="text-default-500">Nenhum produto encontrado. Ajuste os filtros.</p>
```

### Feedback com alert vs. toast

```tsx
// RUIM - alert() nativo quebra a experiencia
const handleDelete = async () => {
  await fetch(`/api/products/${id}`, { method: "DELETE" });
  alert("Produto removido!");
};

// BOM - Sonner para feedback consistente e nao-bloqueante
import { toast } from "sonner";

const handleDelete = async () => {
  try {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    toast.success("Produto removido com sucesso");
  } catch {
    toast.error("Erro ao remover produto");
  }
};
```

### Estado vazio sem orientacao

```tsx
// RUIM - lista vazia sem nenhum feedback
function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <ul>
      {orders.map((o) => <OrderCard key={o.id} order={o} />)}
    </ul>
  );
}

// BOM - estado vazio com mensagem e acao contextual
function OrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <ShoppingBagIcon className="h-12 w-12 text-default-300" />
        <div>
          <p className="text-lg font-semibold text-foreground">
            Nenhum pedido encontrado
          </p>
          <p className="mt-1 text-sm text-default-500">
            Seus pedidos aparecerão aqui apos a confirmacao.
          </p>
        </div>
        <Button
          className="bg-brand-600 text-white hover:bg-brand-700 font-semibold"
          href="/produtos"
          as="a"
        >
          Ver catalogo de pecas
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => <OrderCard key={o.id} order={o} />)}
    </ul>
  );
}
```

### Loading sem skeleton

```tsx
// RUIM - texto generico de loading
function ProductsPage() {
  if (isLoading) return <p>Carregando...</p>;
  return <ProductGrid products={products} />;
}

// BOM - skeleton que preserva o layout e evita layout shift
import { Skeleton } from "@heroui/react";

function ProductsPage() {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border border-divider">
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardBody className="space-y-3 p-4">
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return <ProductGrid products={products} />;
}
```
