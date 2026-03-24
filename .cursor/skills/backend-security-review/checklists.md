# Checklists de Seguranca - Referencia Detalhada

Exemplos de codigo vulneravel vs. seguro para cada categoria do review.

---

## 1. Autenticacao e Autorizacao

### Sessao ausente em API route

```typescript
// VULNERAVEL - sem verificacao de sessao
export async function GET(req: Request) {
  const users = await prisma.user.findMany();
  return Response.json(users);
}

// SEGURO - verifica sessao antes de processar
export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Nao autorizado" }, { status: 401 });
  }
  const users = await prisma.user.findMany();
  return Response.json(users);
}
```

### RBAC ausente em rota admin

```typescript
// VULNERAVEL - verifica sessao mas nao role
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Nao autorizado" }, { status: 401 });
  await prisma.user.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}

// SEGURO - verifica sessao E role
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Nao autorizado" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }
  await prisma.user.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}
```

### IDOR - Insecure Direct Object Reference

```typescript
// VULNERAVEL - usa ID do request sem verificar ownership
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Nao autorizado" }, { status: 401 });
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  return Response.json(order);
}

// SEGURO - filtra por userId da sessao
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Nao autorizado" }, { status: 401 });
  const order = await prisma.order.findUnique({
    where: { id: params.id, userId: session.user.id },
  });
  if (!order) return Response.json({ error: "Nao encontrado" }, { status: 404 });
  return Response.json(order);
}
```

### Mass assignment - campo role

```typescript
// VULNERAVEL - aceita qualquer campo do body
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: body,
  });
  return Response.json(user);
}

// SEGURO - seleciona apenas campos permitidos
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Nao autorizado" }, { status: 401 });
  const body = await req.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Dados invalidos" }, { status: 400 });
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone },
  });
  return Response.json(user);
}
```

---

## 2. Validacao de Input

### Falta de validacao Zod

```typescript
// VULNERAVEL - confia no body sem validar
export async function POST(req: Request) {
  const body = await req.json();
  const product = await prisma.product.create({ data: body });
  return Response.json(product);
}

// SEGURO - valida com Zod antes de processar
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const product = await prisma.product.create({ data: parsed.data });
  return Response.json(product);
}
```

### Parametro de URL nao validado

```typescript
// VULNERAVEL - usa params.id direto sem validar formato
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  return Response.json(order);
}

// SEGURO - valida formato do ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const idSchema = z.string().cuid();
  const result = idSchema.safeParse(params.id);
  if (!result.success) {
    return Response.json({ error: "ID invalido" }, { status: 400 });
  }
  const order = await prisma.order.findUnique({ where: { id: result.data } });
  if (!order) return Response.json({ error: "Nao encontrado" }, { status: 404 });
  return Response.json(order);
}
```

---

## 3. API Routes e Server Actions

### Leak de stack trace

```typescript
// VULNERAVEL - expoe erro interno ao cliente
export async function POST(req: Request) {
  try {
    const result = await processOrder(req);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

// SEGURO - mensagem generica + log interno
export async function POST(req: Request) {
  try {
    const result = await processOrder(req);
    return Response.json(result);
  } catch (error) {
    console.error("Erro ao processar pedido:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
```

### Server action sem sessao

```typescript
// VULNERAVEL - server action sem verificar autenticacao
"use server";
export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}

// SEGURO - verifica sessao e permissao
"use server";
export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado");
  }
  await prisma.product.delete({ where: { id } });
}
```

### Rate limiting ausente

```typescript
// VULNERAVEL - endpoint sensivel sem rate limit
export async function POST(req: Request) {
  const { email } = await req.json();
  await sendResetEmail(email);
  return Response.json({ success: true });
}

// SEGURO - com rate limiting
export async function POST(req: Request) {
  const rateLimitResult = await withRateLimit(req, "forgotPassword");
  if (!rateLimitResult.success) {
    return Response.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429 }
    );
  }
  const { email } = await req.json();
  await sendResetEmail(email);
  return Response.json({ success: true });
}
```

---

## 4. Banco de Dados

### SQL injection via raw query

```typescript
// VULNERAVEL - interpolacao direta na query
const users = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE name = '${name}'
`;

// SEGURO - parametro via tagged template literal do Prisma
const users = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE name = ${name}
`;
```

### Dados sensiveis expostos

```typescript
// VULNERAVEL - retorna todos os campos incluindo password
export async function GET(req: Request) {
  const users = await prisma.user.findMany();
  return Response.json(users);
}

// SEGURO - select explicito sem campos sensiveis
export async function GET(req: Request) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  return Response.json(users);
}
```

### Query sem paginacao

```typescript
// VULNERAVEL - retorna todos os registros (DoS potencial)
const orders = await prisma.order.findMany({
  where: { status: "PENDING" },
});

// SEGURO - com paginacao
const page = Number(searchParams.get("page")) || 1;
const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
const orders = await prisma.order.findMany({
  where: { status: "PENDING" },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: "desc" },
});
```

---

## 5. Dependencias e Configuracao

### Secret hardcoded

```typescript
// VULNERAVEL - secret no codigo fonte
const secret = "minha-chave-super-secreta-123";
jwt.sign(payload, secret);

// SEGURO - via variavel de ambiente
const secret = process.env.NEXTAUTH_SECRET!;
jwt.sign(payload, secret);
```

### Headers de seguranca - checklist

Verificar presenca em `next.config.ts`:

| Header | Valor esperado | Risco se ausente |
|--------|---------------|-----------------|
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Downgrade HTTPS |
| `Content-Security-Policy` | Restritivo ao dominio | XSS, injection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Leak de URLs |
| `Permissions-Policy` | Restritivo | Acesso indevido a APIs do browser |

### Verificar CVEs

```bash
pnpm audit
```

---

## 6. Protecao de Dados

### Hashing de senha

```typescript
// VULNERAVEL - senha em plaintext
await prisma.user.create({
  data: { email, password: rawPassword },
});

// SEGURO - hash com bcrypt
import bcrypt from "bcryptjs";
const hashedPassword = await bcrypt.hash(rawPassword, 12);
await prisma.user.create({
  data: { email, password: hashedPassword },
});
```

### Token sem expiracao

```typescript
// VULNERAVEL - token sem expiracao
await prisma.user.update({
  where: { email },
  data: { resetToken: crypto.randomUUID() },
});

// SEGURO - token com expiracao
await prisma.user.update({
  where: { email },
  data: {
    resetToken: crypto.randomUUID(),
    resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hora
  },
});
```

### Dados sensiveis em logs

```typescript
// VULNERAVEL - loga dados sensiveis
console.log("Login attempt:", { email, password });
console.log("User data:", JSON.stringify(user));

// SEGURO - loga apenas o necessario
console.log("Login attempt for:", email);
console.log("User login:", { id: user.id, email: user.email });
```

### LGPD - Verificacoes

- Endpoint `GET /api/account/export` existe e retorna todos os dados do usuario?
- Endpoint `DELETE /api/account/delete` existe e remove todos os dados?
- Dados relacionados (pedidos, notificacoes) sao removidos em cascata ou anonimizados?
- Usuario recebe confirmacao da exclusao?
