# Autenticação e Cadastro Rápido

## Visão Geral
Implementamos autenticação com NextAuth utilizando provedor de credenciais (e-mail/senha) e Google OAuth, persistindo os dados em Postgres via Prisma/Supabase. O objetivo principal é reduzir o tempo de checkout salvando dados essenciais do cliente.

## Stack e Dependências
- `next-auth` + `@auth/prisma-adapter`
- `prisma` / `@prisma/client`
- `bcrypt` para hash de senhas
- Banco Postgres gerenciado (recomendado: Supabase)

## Estrutura de Arquivos
- `prisma/schema.prisma`: modelos `User`, `Account`, `Session`, `VerificationToken` com campos extras (telefone, documento, endereço básico).
- `src/lib/prisma.ts`: singleton do Prisma Client.
- `src/lib/auth.ts`: configuração NextAuth (providers, callbacks, tipagem).
- `app/api/auth/[...nextauth]/route.ts`: handler NextAuth.
- `app/api/register/route.ts`: endpoint de cadastro manual (nome, e-mail, senha, telefone/doc opcionais).
- `types/next-auth.d.ts`: extensão de tipos para Session e JWT.
- `app/providers.tsx`: inclui `SessionProvider` no layout.

## Variáveis de Ambiente
Adicionar em `.env.local`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE" # Para conexões diretas (ex: migrações)
NEXTAUTH_URL="http://localhost:3000" # ajustar em produção
NEXTAUTH_SECRET="chave-secreta"
GOOGLE_CLIENT_ID="..." # Opcional, apenas se usar Google OAuth
GOOGLE_CLIENT_SECRET="..." # Opcional, apenas se usar Google OAuth
```

**Nota sobre DIRECT_URL**: Em ambientes de connection pooling (como Supabase com Supavisor), use `DIRECT_URL` para migrações e `DATABASE_URL` para queries da aplicação. Se não usar pooling, ambas podem ter o mesmo valor.

## Passos de Setup
1. Criar banco no Supabase (ou Postgres equivalente) e copiar `DATABASE_URL` completa.
2. Rodar `pnpm prisma migrate dev` para criar tabelas.
3. Executar `pnpm prisma generate` se alterar o schema.
4. Iniciar dev server com `pnpm dev`.

## Fluxo de Cadastro/Login
1. Usuário acessa modal/página de Login:
   - Opção "Continuar com Google" → dados preenchidos automaticamente.
   - Ou formulário minimalista (nome, e-mail, telefone opcional, senha).
2. Endpoint `POST /api/register` cria usuário com senha hasheada.
3. Após login, dados ficam disponíveis via `useSession()` para autofill do checkout.
4. Campos adicionais (endereço, preferências) podem ser preenchidos em uma tela "Complete seus dados" para acelerar compras futuras.

## Reutilização de Dados no Checkout
- `CartContext` continua responsável pelo carrinho.
- Ao autenticar, salvar dados de entrega no modelo `User` (campos `addressLine1`, `city`, `state`, etc.) para pré-preencher formulários.
- Futuramente, adicionar endpoints para atualizar perfil/endereços e conectar com criação de pedidos.

## Testes e Verificações
- `pnpm lint` precisa passar (há ajustes pendentes em `src/lib/prisma.ts`).
- `pnpm build` valida tipagens.
- Testar manualmente fluxos: cadastro manual, login com senha, login com Google, persistência de sessão e autofill no checkout.

## Próximos Passos Sugeridos
1. Criar UI/UX de login (modal/tab) integrando `signIn()`/`signOut()` do NextAuth.
2. Conectar dados de endereço/cliente com carrinho e futuros pedidos.
3. Implementar rate limiting nos endpoints críticos (Upstash/Vercel Edge).
