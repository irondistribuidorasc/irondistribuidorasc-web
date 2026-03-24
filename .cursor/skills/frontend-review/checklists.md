# Checklists de Frontend - Referencia Detalhada

Exemplos de codigo vulneravel vs. seguro para cada categoria do review.

---

## 1. Seguranca Client-Side

### XSS via dangerouslySetInnerHTML

```tsx
// VULNERAVEL - renderiza HTML sem sanitizar
function Comment({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

// SEGURO - sanitiza antes de renderizar
import DOMPurify from "dompurify";

function Comment({ content }: { content: string }) {
  const clean = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// MELHOR - renderiza como texto quando HTML nao e necessario
function Comment({ content }: { content: string }) {
  return <p>{content}</p>;
}
```

### XSS via URL dinamica

```tsx
// VULNERAVEL - href aceita qualquer protocolo
function UserLink({ url }: { url: string }) {
  return <a href={url}>Perfil</a>;
}
// Ataque: url = "javascript:alert(document.cookie)"

// SEGURO - valida protocolo antes de renderizar
function UserLink({ url }: { url: string }) {
  const isValidUrl = /^https?:\/\//.test(url);
  return isValidUrl ? <a href={url}>Perfil</a> : <span>Link invalido</span>;
}
```

### Exposicao de dados em Client Component

```tsx
// VULNERAVEL - dados sensiveis passados para client component
// page.tsx (Server Component)
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
});
return <ProfileClient user={user} />; // inclui password, resetToken

// SEGURO - filtra campos antes de passar ao client
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { id: true, name: true, email: true, phone: true },
});
return <ProfileClient user={user} />;
```

### Console.log em producao

```tsx
// VULNERAVEL - loga dados sensiveis
console.log("User session:", session);
console.log("Order data:", orderWithPayment);

// SEGURO - remover logs ou usar condicional
if (process.env.NODE_ENV === "development") {
  console.log("Debug:", { orderId: order.id });
}
```

### Variaveis de ambiente expostas

```env
# VULNERAVEL - secret acessivel no browser
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=eyJhbGci...
NEXT_PUBLIC_DATABASE_URL=postgresql://...

# SEGURO - apenas chaves publicas com prefixo NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...  # sem prefixo = server-only
```

---

## 2. Autenticacao no Frontend

### Flash de conteudo protegido

```tsx
// VULNERAVEL - mostra conteudo antes de verificar auth
"use client";
export default function AdminPage() {
  const { data: session } = useSession();
  if (!session) redirect("/login");
  return <AdminDashboard />;  // flash antes do redirect
}

// SEGURO - mostra loading ate confirmar auth
"use client";
export default function AdminPage() {
  const { data: session, status } = useSession();
  if (status === "loading") return <LoadingSkeleton />;
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
    return null;
  }
  return <AdminDashboard />;
}
```

### Open redirect

```tsx
// VULNERAVEL - redirect sem validar destino
const callbackUrl = searchParams.get("callbackUrl");
router.push(callbackUrl || "/");
// Ataque: ?callbackUrl=https://evil.com

// SEGURO - valida que URL e interna
const callbackUrl = searchParams.get("callbackUrl");
const isInternal = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//");
router.push(isInternal ? callbackUrl : "/");
```

---

## 3. Validacao e Formularios

### Formulario sem validacao Zod

```tsx
// VULNERAVEL - estado local sem validacao
"use client";
function ContactForm() {
  const [email, setEmail] = useState("");
  const handleSubmit = async () => {
    await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };
  return <input value={email} onChange={(e) => setEmail(e.target.value)} />;
}

// SEGURO - react-hook-form + Zod
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({ email: z.string().email("Email invalido") });

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data: z.infer<typeof schema>) => {
    await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} aria-invalid={!!errors.email} />
      {errors.email && <span role="alert">{errors.email.message}</span>}
    </form>
  );
}
```

### Double-submit

```tsx
// VULNERAVEL - permite multiplos clicks
<Button onClick={handleSubmit}>Enviar</Button>

// SEGURO - desabilita durante submissao
<Button onClick={handleSubmit} isLoading={isSubmitting} isDisabled={isSubmitting}>
  Enviar
</Button>
```

---

## 4. Acessibilidade (a11y)

### Botao de icone sem label

```tsx
// VULNERAVEL - leitor de tela nao sabe o que o botao faz
<button onClick={onClose}>
  <XMarkIcon className="h-5 w-5" />
</button>

// SEGURO - aria-label descritivo
<button onClick={onClose} aria-label="Fechar modal">
  <XMarkIcon className="h-5 w-5" />
</button>
```

### Imagem sem alt

```tsx
// VULNERAVEL - leitor de tela ignora conteudo da imagem
<Image src={product.image} width={200} height={200} />

// SEGURO - alt descritivo
<Image src={product.image} width={200} height={200} alt={product.name} />

// SEGURO - imagem decorativa
<Image src="/bg-pattern.png" width={200} height={200} alt="" aria-hidden="true" />
```

### Formulario sem associacao label-input

```tsx
// VULNERAVEL - input sem label associado
<span>Email</span>
<input type="email" />

// SEGURO - label com htmlFor
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ALTERNATIVA - aria-label quando label visual nao existe
<input type="email" aria-label="Email" placeholder="seu@email.com" />
```

### Modal sem trap de foco

```tsx
// VULNERAVEL - foco escapa do modal
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50">
      <div>{children}</div>
    </div>
  );
}

// SEGURO - usa componente Hero UI que gerencia foco automaticamente
import { Modal, ModalContent } from "@heroui/react";

function MyModal({ children, isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>{children}</ModalContent>
    </Modal>
  );
}
```

### Hierarquia de headings

```tsx
// VULNERAVEL - pula niveis de heading
<h1>Produtos</h1>
<h3>Telas</h3>      {/* pulou h2 */}
<h5>iPhone 15</h5>  {/* pulou h4 */}

// SEGURO - hierarquia sequencial
<h1>Produtos</h1>
<h2>Telas</h2>
<h3>iPhone 15</h3>
```

### Foco visivel ausente

```tsx
// VULNERAVEL - remove outline sem alternativa
<button className="outline-none" onClick={handleClick}>
  Acao
</button>

// SEGURO - foco visivel com ring
<button className="focus:outline-none focus:ring-2 focus:ring-brand-500" onClick={handleClick}>
  Acao
</button>
```

---

## 5. Performance

### img nativo vs next/image

```tsx
// VULNERAVEL - sem otimizacao de imagem
<img src={product.imageUrl} />

// SEGURO - otimizacao automatica
import Image from "next/image";
<Image src={product.imageUrl} width={400} height={400} alt={product.name} />
```

### Import estatico de biblioteca pesada

```tsx
// VULNERAVEL - carrega toda a biblioteca no bundle principal
import { Chart } from "chart.js";

// SEGURO - dynamic import
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("./Chart"), { ssr: false });
```

### "use client" no nivel errado

```tsx
// VULNERAVEL - "use client" no topo da pagina, toda a arvore vira client
// app/admin/page.tsx
"use client";
export default function AdminPage() {
  return (
    <div>
      <Header />           {/* poderia ser server */}
      <ProductList />      {/* precisa ser client */}
      <Footer />           {/* poderia ser server */}
    </div>
  );
}

// SEGURO - "use client" apenas nos componentes que precisam
// app/admin/page.tsx (Server Component)
export default function AdminPage() {
  return (
    <div>
      <Header />
      <ProductListClient />  {/* apenas este e client */}
      <Footer />
    </div>
  );
}
```

### Context provider causando re-render

```tsx
// VULNERAVEL - valor do context muda a cada render
function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  return (
    <CartContext.Provider value={{ items, setItems, total: items.reduce(...) }}>
      {children}
    </CartContext.Provider>
  );
}

// SEGURO - memoiza o valor do context
function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const value = useMemo(
    () => ({ items, setItems, total: items.reduce(...) }),
    [items]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

---

## 6. Padroes e Consistencia

### Cor hardcoded vs token

```tsx
// VULNERAVEL - quebra no tema dark
<p className="text-gray-800">Texto</p>
<div className="bg-white border border-gray-200">Card</div>

// SEGURO - usa tokens que funcionam em ambos os temas
<p className="text-foreground">Texto</p>
<div className="bg-content1 border border-divider">Card</div>
```

### Feedback inconsistente

```tsx
// VULNERAVEL - alert() em vez de toast
const handleDelete = async () => {
  await fetch(`/api/products/${id}`, { method: "DELETE" });
  alert("Produto removido!");
};

// SEGURO - Sonner para feedback consistente
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

### Estado vazio sem tratamento

```tsx
// VULNERAVEL - lista vazia sem feedback
function OrdersList({ orders }) {
  return (
    <ul>
      {orders.map((o) => <OrderCard key={o.id} order={o} />)}
    </ul>
  );
}

// SEGURO - estado vazio com mensagem
function OrdersList({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-default-500">
        <p>Voce ainda nao tem pedidos.</p>
      </div>
    );
  }
  return (
    <ul>
      {orders.map((o) => <OrderCard key={o.id} order={o} />)}
    </ul>
  );
}
```

### Erro de rede sem tratamento

```tsx
// VULNERAVEL - erro silencioso ou crash
const loadOrders = async () => {
  const res = await fetch("/api/orders");
  const data = await res.json();
  setOrders(data);
};

// SEGURO - tratamento de erro com feedback
const loadOrders = async () => {
  try {
    const res = await fetch("/api/orders");
    if (!res.ok) throw new Error("Falha ao carregar pedidos");
    const data = await res.json();
    setOrders(data);
  } catch {
    toast.error("Erro ao carregar pedidos. Tente novamente.");
  }
};
```
