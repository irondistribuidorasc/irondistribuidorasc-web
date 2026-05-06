# Relatório de Auditoria de Segurança

**Data:** 2026-05-04  
**Escopo:** Auth, autorização, CSRF, rate limit, tokens, uploads, CSP  
**Base:** `docs/audit/2026-05-04-audit-plan.md`

---

## Resumo Executivo

| Categoria | Status | Observação |
|-----------|--------|------------|
| Dependências vulneráveis | **OK** | `pnpm audit --audit-level=high --prod` sem vulnerabilidades conhecidas |
| Auth e autorização | **OK** | Rotas admin e rotas sensíveis verificam sessão/role |
| CSRF e rate limit | **OK** | Mutações críticas aplicam `validateCsrfOrigin` e `withRateLimit` |
| Tokens de reset | **OK** | Tokens são persistidos como hash em `passwordResetToken` |
| Upload de imagem | **P2** | Segurança depende de policy do Supabase fora do repositório |
| CSP | **OK** | Política por request com nonce já está aplicada no proxy |

## Evidências Verificadas

- `app/api/orders/create/route.ts` usa rate limit e validação CSRF antes da criação do pedido.
- `app/api/admin/products/route.ts`, `app/api/admin/products/[id]/route.ts`, `app/api/admin/products/bulk/route.ts`, `app/api/admin/users/route.ts` e `app/api/admin/orders/[id]/payment/route.ts` aplicam CSRF e check de `role === "ADMIN"` nas mutações.
- `app/api/admin/orders/[id]/route.ts` e `app/api/admin/finance/route.ts` bloqueiam acesso sem sessão admin.
- `app/api/auth/forgot-password/route.ts` e `app/api/auth/reset-password/route.ts` continuam cobertos por rate limit.

## Riscos Ainda Abertos

1. Upload direto de imagem ainda depende de policy externa do bucket.
2. A política de deleção/anonymização de conta já foi decidida no plano, mas ainda deve ser validada operacionalmente com testes de regressão.
3. Hardening adicional de CSP e integrações externas segue como trabalho de manutenção, não como bloqueio.

## Conclusão

Não há CVE conhecido bloqueando a base no momento, mas a postura de segurança ainda não está fechada em nível de hardening. O próximo passo seguro é tratar os itens P2 acima depois que a base de build, quality gate e testes críticos estiver consolidada.
