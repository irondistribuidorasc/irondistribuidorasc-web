# Decisões de Negócio — Auditoria de Segurança

Data: 2026-05-04  
Contexto: Iron Distribuidora SC (e-commerce B2B)

---

## D-01 — Privacidade de Preços B2B (GAP-001)

**Decisão:** Preços são totalmente privados. Não aparecem em JSON-LD, RSC payload, server actions ou API para usuários não aprovados.

**Justificativa profissional:**
- Preços de atacado são propriedade comercial sensível
- JSON-LD exposto permite scraping por concorrentes e aggregators
- O usuário (cliente B2B aprovado) precisa confiar que seus preços negociados são exclusivos
- SEO funciona sem price: usar schema `Offer` com `availability` e descrição; ou omitir `offers` para visitantes

**Implementação:** DTO público de produto sem `price`; JSON-LD condicional; `searchProducts` protegida.

---

## D-02 — Reserva de Estoque em PENDING (GAP-004)

**Decisão:** Apenas `CONFIRMED` baixa estoque. `PENDING` não reserva.

**Justificativa profissional:**
- `PENDING` pode ser carrinho abandonado, spam, ou falha de pagamento
- Reservar estoque bloqueia venda real para clientes aprovados
- Penaliza o usuário final (cliente B2B real) que tenta comprar item "indisponível"
- Estoque disponível deve refletir estoque real, não estoque + esperanças

**Implementação:** Verificação de estoque apenas no momento da confirmação; nenhuma alteração em `PENDING`.

---

## D-03 — Política de Esgotamento na Confirmação (GAP-004)

**Decisão:** BLOQUEAR confirmação quando estoque insuficiente.

**Justificativa profissional:**
- Transparência gera confiança: cliente espera receber exatamente o que pediu
- Vender sem estoque = insatisfação, chargeback, perda de reputação
- O software deve proteger o usuário (admin) de decisões operacionalmente ruins
- Se necessário, criar fluxo explícito de "backorder" com aviso e consentimento do cliente

**Implementação:** Transação atômica que verifica `stockQuantity >= quantity` antes de atualizar status; rollback se insuficiente.

---

## D-04 — Devolução de Estoque no Cancelamento (GAP-009)

**Decisão:** Cancelamento de pedido `CONFIRMED` (ou superior) devolve estoque automaticamente.

**Justificativa profissional:**
- Estoque é ativo real do negócio
- Pedido cancelado = mercadoria disponível para próxima venda
- Divergência manual é risco operacional e fonte de erro humano
- O software deve manter consistência de inventário sem intervenção manual

**Implementação:** Reversão idempotente do mesmo valor deduzido; guarda para não devolver duas vezes.

---

## D-05 — Base do Financeiro Diário (GAP-005)

**Decisão:** Financeiro diário considera apenas pedidos `CONFIRMED` (ou `DELIVERED` se houver pagamento posterior).

**Justificativa profissional:**
- `PENDING` não é venda — é intenção de compra
- `CONFIRMED` é o momento que o negócio assumiu obrigação de entregar e o cliente de pagar
- Relatório financeiro deve representar receita comprometida, não projeção
- Usuário (admin) toma decisões de compra/reabastecimento baseado nesse número; inflar distorce operação

**Implementação:** Filtro `status IN ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]` ou similar; documentar regra.

---

## D-06 — Política de Exclusão de Conta (GAP-007)

**Decisão:** Conta excluída é ANONIMIZADA. Pedidos e transações são PRESERVADOS com dados minimizados.

**Justificativa profissional:**
- LGPD (art. 16) permite anonimização como alternativa quando há obrigação legal de reter
- No Brasil: 5 anos para fins fiscais (Código Tributário Nacional)
- Apagar pedidos destrói: histórico financeiro, comprovação fiscal, garantia, rastreabilidade de produto
- Usuário (admin) precisa de dados para atender garantia/troca mesmo após cliente sair
- Cliente tem direito ao esquecimento (dados pessoais removidos) sem prejudicar obrigações do negócio

**Implementação:** Remover `Account`, `Session`, `Notification`, tokens; anonimizar `User` (nome genérico, email hash, remover endereço/telefone/CPF); preservar `Order`, `OrderItem`, `OrderFeedback` com `customerName` genérico.

---

## Resumo Executivo

| ID | Decisão | Valor entregue ao usuário |
|----|---------|---------------------------|
| D-01 | Preço privado | Confiança na exclusividade comercial |
| D-02 | Só confirmed baixa estoque | Estoque real, não bloqueado por intenções |
| D-03 | Bloquear se esgotado | Confiabilidade de entrega |
| D-04 | Devolver estoque no cancelamento | Precisão de inventário |
| D-05 | Financeiro por confirmed | Decisões baseadas em receita real |
| D-06 | Anonimizar, preservar transações | Compliance fiscal + garantia |

Todas as decisões priorizam **consistência operacional**, **transparência com o cliente final** e **proteção do negócio contra riscos fiscais e reputacionais**.
