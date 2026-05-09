# Prompt para Gemini Pro — Implementação do Fluxo de Compras Ekomart

## Instruções de uso
Cole este prompt integralmente no Gemini Pro. Ele é autossuficiente.

---

## PROMPT

Você é um engenheiro de software sênior especializado em Next.js 16 App Router, Prisma 5 e integrações de pagamento com Mercado Pago.

Sua missão é implementar completamente o fluxo de compras do projeto **Ekomart**, seguindo um PRD detalhado já existente no repositório.

---

### 1. ANTES DE ESCREVER QUALQUER CÓDIGO

**Leia obrigatoriamente, nesta ordem:**

1. `/home/projetasaude/Vídeos/ekomart/CART.md` — PRD completo com todas as especificações
2. `/home/projetasaude/Vídeos/ekomart/prisma/schema.prisma` — schema atual do banco
3. `/home/projetasaude/Vídeos/ekomart/src/viewmodels/carrinho.vm.ts` — implementação atual do carrinho
4. `/home/projetasaude/Vídeos/ekomart/src/app/(public)/carrinho/page.tsx` — página do carrinho
5. `/home/projetasaude/Vídeos/ekomart/src/models/produto.model.ts` — tipos existentes
6. `/home/projetasaude/Vídeos/ekomart/src/proxy.ts` — middleware de autenticação
7. `/home/projetasaude/Vídeos/ekomart/src/utils/validators.ts` — validadores existentes
8. `/home/projetasaude/Vídeos/ekomart/src/utils/formatadores.ts` — formatadores existentes
9. `/home/projetasaude/Vídeos/ekomart/package.json` — dependências instaladas

Só avance para implementação depois de ter lido todos os arquivos acima.

---

### 2. ARQUIVO DE PROGRESSO

**Crie imediatamente** o arquivo `/home/projetasaude/Vídeos/ekomart/PROGRESS.md` com este conteúdo inicial:

```markdown
# PROGRESS.md — Andamento da Implementação do Carrinho

Atualizado automaticamente a cada passo concluído.

## Status Geral
- Início: [data/hora atual]
- Conclusão: pendente
- Passos concluídos: 0 / 21

## Passos

| # | Descrição | Status | Observações |
|---|-----------|--------|-------------|
| 1 | Instalar dependências (mercadopago, @mercadopago/sdk-react) | ⏳ pendente | |
| 2 | Criar .env.local com variáveis de ambiente | ⏳ pendente | |
| 3 | Criar src/lib/frete.ts | ⏳ pendente | |
| 4 | Criar src/lib/prisma.ts | ⏳ pendente | |
| 5 | Modificar prisma/schema.prisma (Order, OrderItem, enums) | ⏳ pendente | |
| 6 | Rodar migration Prisma | ⏳ pendente | |
| 7 | Criar src/models/checkout.model.ts | ⏳ pendente | |
| 8 | Adicionar validarCPF/formatarCPF em validators.ts | ⏳ pendente | |
| 9 | Substituir carrinho.vm.ts (migrar para localStorage) | ⏳ pendente | |
| 10 | Ajustar carrinho/page.tsx (remover impostos, cupom, boleto) | ⏳ pendente | |
| 11 | Criar API GET /api/frete/calcular/route.ts | ⏳ pendente | |
| 12 | Criar página /checkout (page.tsx + 3 StepComponents) | ⏳ pendente | |
| 13 | Criar API POST /api/checkout/iniciar/route.ts | ⏳ pendente | |
| 14 | Criar API GET /api/checkout/status/[orderId]/route.ts | ⏳ pendente | |
| 15 | Criar API POST /api/webhooks/mercadopago/route.ts | ⏳ pendente | |
| 16 | Criar página /pedido/[id]/page.tsx | ⏳ pendente | |
| 17 | Criar API GET /api/admin/pedidos/route.ts | ⏳ pendente | |
| 18 | Criar página admin /admin/pedidos/page.tsx | ⏳ pendente | |
| 19 | Adicionar link "Pedidos" na Sidebar admin | ⏳ pendente | |
| 20 | Verificar TypeScript (npx tsc --noEmit) | ⏳ pendente | |
| 21 | Build final (npm run build) | ⏳ pendente | |

## Erros Encontrados
_Nenhum até o momento._

## Decisões Tomadas
_Registrar aqui qualquer desvio do PRD e o motivo._
```

**Após cada passo concluído**, atualize a linha correspondente no PROGRESS.md:
- ✅ concluído — quando o arquivo foi criado/modificado com sucesso
- ❌ erro — quando falhou (registrar o erro na seção "Erros Encontrados")
- ⚠️ parcial — quando concluído com adaptações (registrar em "Decisões Tomadas")

---

### 3. REGRAS INEGOCIÁVEIS

Estas regras têm precedência sobre qualquer padrão genérico:

1. **O middleware chama-se `src/proxy.ts`** e exporta `proxy`, não `middleware`. Nunca criar `middleware.ts`.

2. **`params` em Route Handlers é uma Promise no Next.js 16.** Sempre usar `await params` antes de acessar propriedades:
   ```typescript
   // CORRETO
   const { id } = await params;
   // ERRADO
   const { id } = params;
   ```

3. **Valores `Decimal` do Prisma não são números.** Sempre converter:
   ```typescript
   parseFloat(produto.preco.toString())
   ```

4. **Nunca confiar em preços vindos do frontend.** A API `/api/checkout/iniciar` sempre busca preços do banco.

5. **Nunca alterar `src/proxy.ts`** — o webhook `/api/webhooks/mercadopago` já está fora do matcher protegido.

6. **Não criar comentários explicando o que o código faz.** Apenas comentários com o "porquê" quando não for óbvio.

7. **Não adicionar `impostos` ao cálculo do pedido.** O total é apenas `subtotal + frete`.

8. **Usar o cliente Prisma singleton** de `src/lib/prisma.ts`, não instanciar `new PrismaClient()` diretamente em cada arquivo.

9. **O campo `frete` foi renomeado para `freteEstimado`** no hook `useCarrinhoViewModel`. Atualizar todos os componentes que o desestruturavam.

10. **Não inventar estruturas de dados.** Seguir exatamente os types definidos em `src/models/checkout.model.ts` conforme o PRD.

---

### 4. ORDEM DE EXECUÇÃO

Siga a **Seção 23 do CART.md** rigorosamente. Não pule etapas, não reordene.

Para cada passo:
1. Execute a ação (criar arquivo, modificar, rodar comando)
2. Verifique se funcionou (sem erros de sintaxe, imports corretos)
3. Atualize o PROGRESS.md imediatamente
4. Só então avance para o próximo passo

---

### 5. TRATAMENTO DE ERROS

Se encontrar um erro em qualquer passo:

1. **Registre no PROGRESS.md** na seção "Erros Encontrados":
   ```markdown
   ### Erro no Passo N — [nome do passo]
   - **Arquivo:** caminho/do/arquivo.ts
   - **Erro:** mensagem de erro completa
   - **Causa:** explicação do que causou
   - **Solução:** o que foi feito para resolver
   ```

2. **Tente resolver** antes de avançar. Um passo com erro pode bloquear todos os seguintes.

3. Se o erro for na migration Prisma, verifique o schema e corrija antes de rodar novamente.

4. Se o erro for de TypeScript no build final (passo 20/21), corrija todos os erros antes de marcar como concluído.

---

### 6. VERIFICAÇÕES OBRIGATÓRIAS POR ARQUIVO

#### Ao criar Route Handlers (API routes):
- [ ] Importa `NextRequest` e `NextResponse` de `next/server`
- [ ] Para rotas com `[param]`, usa `await params`
- [ ] Não expõe dados sensíveis (senhaHash, cpf completo em listagens, etc.)
- [ ] Retorna JSON com status HTTP correto (200, 400, 404, 409, 502)

#### Ao criar Client Components:
- [ ] Tem `'use client'` na primeira linha
- [ ] Não importa módulos Node.js (crypto, fs, etc.)
- [ ] Usa `useRouter` de `next/navigation` (não de `next/router`)

#### Ao criar Server Components ou API routes:
- [ ] Não tem `'use client'`
- [ ] Pode importar `prisma` de `@/src/lib/prisma`

#### Ao modificar o schema.prisma:
- [ ] Adicionou relação `orderItems OrderItem[]` no model `Produto`
- [ ] Todos os enums estão antes dos models que os usam
- [ ] Rodou `npx prisma migrate dev --name add_orders`
- [ ] Rodou `npx prisma generate`

---

### 7. ESTRUTURA DE ARQUIVOS A CRIAR

```
src/
  lib/
    frete.ts                              ← NOVO
    prisma.ts                             ← NOVO (ou verificar se existe)
  models/
    checkout.model.ts                     ← NOVO
  utils/
    validators.ts                         ← MODIFICAR (adicionar CPF)
  viewmodels/
    carrinho.vm.ts                        ← SUBSTITUIR COMPLETAMENTE
  app/
    (public)/
      carrinho/
        page.tsx                          ← MODIFICAR
      checkout/
        page.tsx                          ← NOVO
        StepDados.tsx                     ← NOVO
        StepEntrega.tsx                   ← NOVO
        StepPagamento.tsx                 ← NOVO
      pedido/
        [id]/
          page.tsx                        ← NOVO
    api/
      frete/
        calcular/
          route.ts                        ← NOVO
      checkout/
        iniciar/
          route.ts                        ← NOVO
        status/
          [orderId]/
            route.ts                      ← NOVO
      webhooks/
        mercadopago/
          route.ts                        ← NOVO
      admin/
        pedidos/
          route.ts                        ← NOVO
    admin/
      (protected)/
        pedidos/
          page.tsx                        ← NOVO
prisma/
  schema.prisma                           ← MODIFICAR
```

---

### 8. VARIÁVEIS DE AMBIENTE

O arquivo `.env.local` deve ser criado na raiz do projeto com:

```bash
# Banco (já existe — não sobrescrever)
# DATABASE_URL já está configurado

# Mercado Pago Sandbox
MP_ACCESS_TOKEN="TEST-4312985170785669-050912-8ebe07a9399202ec56dbe501c005bc43-2901116807"
NEXT_PUBLIC_MP_PUBLIC_KEY="TEST-39f27907-c949-4388-9047-ac41eef92490"
MP_WEBHOOK_SECRET=""

# Frete
FRETE_GRATIS_ACIMA="200"
NEXT_PUBLIC_FRETE_GRATIS_ACIMA="200"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Loja
NEXT_PUBLIC_LOJA_ENDERECO="Rua Example, 100 — São Paulo, SP"
NEXT_PUBLIC_LOJA_HORARIO="Seg–Sex 8h–20h · Sáb 8h–18h"
```

> **Atenção:** Se `.env.local` já existir com `DATABASE_URL` e `JWT_SECRET`, **acrescentar** as novas variáveis ao arquivo existente — não sobrescrever.

---

### 9. CRITÉRIO DE CONCLUSÃO

A implementação só está concluída quando:

- [ ] Todos os 21 passos do PROGRESS.md estão com ✅
- [ ] `npx tsc --noEmit` roda sem erros
- [ ] `npm run build` completa sem erros
- [ ] PROGRESS.md está atualizado com status final e horário de conclusão
- [ ] Seção "Erros Encontrados" documenta todos os problemas que surgiram e como foram resolvidos
- [ ] Seção "Decisões Tomadas" documenta qualquer desvio do PRD original

---

### 10. ATUALIZAÇÃO FINAL DO PROGRESS.md

Ao concluir todos os passos, atualizar o cabeçalho do PROGRESS.md:

```markdown
## Status Geral
- Início: [hora de início]
- Conclusão: [data/hora de conclusão]
- Passos concluídos: 21 / 21
- Build: ✅ sucesso
```

E adicionar uma seção de resumo:

```markdown
## Resumo da Implementação
- Arquivos criados: N
- Arquivos modificados: N
- Erros encontrados e resolvidos: N
- Desvios do PRD: N
```

---

**Comece agora lendo o CART.md.**
