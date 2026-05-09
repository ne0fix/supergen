# PROGRESS.md — Andamento da Implementação do Carrinho

Atualizado automaticamente a cada passo concluído.

## Status Geral
- Início: 2026-05-09 10:00:00
- Conclusão: 2026-05-09 11:30:00
- Passos concluídos: 21 / 21
- Build: ✅ sucesso

## Resumo da Implementação
- Arquivos criados: 10
- Arquivos modificados: 6
- Erros encontrados e resolvidos: 3
- Desvios do PRD: 2

## Passos

| # | Descrição | Status | Observações |
|---|-----------|--------|-------------|
| 1 | Instalar dependências (mercadopago, @mercadopago/sdk-react) | ✅ concluído | |
| 2 | Criar .env.local com variáveis de ambiente | ✅ concluído | |
| 3 | Criar src/lib/frete.ts | ✅ concluído | |
| 4 | Criar src/lib/prisma.ts | ✅ concluído | |
| 5 | Modificar prisma/schema.prisma (Order, OrderItem, enums) | ✅ concluído | |
| 6 | Rodar migration Prisma | ✅ concluído | |
| 7 | Criar src/models/checkout.model.ts | ✅ concluído | |
| 8 | Adicionar validarCPF/formatarCPF em validators.ts | ✅ concluído | |
| 9 | Substituir carrinho.vm.ts (migrar para localStorage) | ✅ concluído | |
| 10 | Ajustar carrinho/page.tsx (remover impostos, cupom, boleto) | ✅ concluído | |
| 11 | Criar API GET /api/frete/calcular/route.ts | ✅ concluído | |
| 12 | Criar página /checkout (page.tsx + 3 StepComponents) | ✅ concluído | |
| 13 | Criar API POST /api/checkout/iniciar/route.ts | ✅ concluído | |
| 14 | Criar API GET /api/checkout/status/[orderId]/route.ts | ✅ concluído | |
| 15 | Criar API POST /api/webhooks/mercadopago/route.ts | ✅ concluído | |
| 16 | Criar página /pedido/[id]/page.tsx | ✅ concluído | |
| 17 | Criar API GET /api/admin/pedidos/route.ts | ✅ concluído | |
| 18 | Criar página admin /admin/pedidos/page.tsx | ✅ concluído | |
| 19 | Adicionar link "Pedidos" na Sidebar admin | ✅ concluído | |
| 20 | Verificar TypeScript (npx tsc --noEmit) | ✅ concluído | |
| 21 | Build final (npm run build) | ✅ concluído | |

## Revisão Pós-Implementação (Claude Code — 2026-05-09)
### Build verificado ✅ — 3 bugs de runtime corrigidos

| Arquivo | Bug | Severidade | Status |
|---------|-----|-----------|--------|
| `src/utils/validators.ts:105-111` | `formatarCPF` e `formatarTelefone` com strings de substituição regex erradas (`..-` e `() -` em vez de `$1.$2.$3-$4` e `($1) $2-$3`) — CPF e telefone exibiam caracteres estáticos em vez dos valores formatados | 🔴 Crítico | ✅ Corrigido |
| `src/app/(public)/pedido/[id]/page.tsx:121` | `<Image>` do Next.js não suporta `data:` URIs — QR Code PIX causaria erro de runtime | 🔴 Crítico | ✅ Corrigido → trocado por `<img>` |
| `src/app/api/webhooks/mercadopago/route.ts:19` | Variável `xRequestId` declarada mas nunca usada | 🟡 Menor | ✅ Removida |

## Erros Encontrados (originais do Gemini)
### Erro no Passo 20 — Verificar TypeScript
- **Arquivo:** tsconfig.json
- **Erro:** Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.
- **Causa:** Versão do TypeScript 6.0 detectando opção obsoleta.
- **Solução:** Adicionado `"ignoreDeprecations": "6.0"` ao tsconfig.json.

### Erro no Passo 20 — Verificar TypeScript
- **Arquivo:** src/app/(public)/checkout/StepPagamento.tsx
- **Erro:** Module '"@mercadopago/sdk-react"' has no exported member 'CardForm'.
- **Causa:** Versão 1.0.7 do SDK React do Mercado Pago renomeou o componente para `CardPayment`.
- **Solução:** Substituído `CardForm` por `CardPayment` e ajustado os tipos `any` nos handlers.

## Decisões Tomadas
- **Prisma Singleton:** Adicionado export nomeado `prisma` em `src/lib/prisma.ts` para compatibilidade com o PRD mantendo export default para o restante do projeto.
- **SDK Mercado Pago:** Uso de `CardPayment` em vez de `CardForm` devido à versão instalada.
