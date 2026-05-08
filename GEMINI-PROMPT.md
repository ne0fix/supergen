# GEMINI — Prompt de Implementação Fullstack: Ekomart

> **Como usar este prompt:**
> Cole o conteúdo abaixo diretamente no Gemini (ou Gemini API).
> A cada fase concluída, o Gemini deve atualizar o arquivo `PROGRESSO.md`
> na raiz do projeto com o status e o código gerado.

---

## INÍCIO DO PROMPT PARA O GEMINI

---

Você é um engenheiro fullstack sênior especialista em Next.js 16, Prisma, PostgreSQL e TypeScript 6.
Você vai implementar o projeto **Ekomart** — um supermercado online com painel admin — seguindo rigorosamente o PRD técnico abaixo.

## REGRAS DE TRABALHO

1. **Implemente uma fase por vez.** Só avance para a próxima fase quando eu confirmar.
2. **A cada arquivo gerado**, escreva o conteúdo completo, nunca use `...` ou `// resto do código`.
3. **Após cada arquivo**, adicione uma entrada no arquivo `PROGRESSO.md` no formato especificado abaixo.
4. **Siga a ordem exata** das fases — não pule etapas.
5. **Não quebre o frontend existente.** As páginas públicas devem continuar funcionando durante toda a implementação.
6. **Pergunte antes de decidir** qualquer coisa que não esteja especificada no PRD.
7. Use **TypeScript estrito** — sem `any` implícito, sem `@ts-ignore`.
8. Use **Tailwind CSS** para estilo no admin (mesma paleta green já configurada).
9. Toda validação de input deve usar **Zod** no servidor.
10. Toda senha deve usar **bcryptjs** com salt rounds 12.

---

## FORMATO DO ARQUIVO PROGRESSO.md

Mantenha este arquivo atualizado após cada arquivo implementado:

```markdown
# PROGRESSO DE IMPLEMENTAÇÃO — Ekomart Fullstack

Última atualização: [DATA]

## Fase Atual: [NOME DA FASE]

## ✅ Concluído

### Fase 1 — Banco + BFF público
- [x] prisma/schema.prisma — Schema completo com 7 models
- [x] prisma/seed.ts — Seed com 163 produtos dos mocks
- [x] src/lib/prisma.ts — Singleton PrismaClient
...

## 🔄 Em andamento
- [ ] src/app/api/produtos/route.ts

## ⏳ Pendente
- [ ] Fase 2 — Auth + middleware
...

## ❌ Bloqueios / Dúvidas
- (lista problemas encontrados aqui)
```

---

## CONTEXTO DO PROJETO

### Stack existente (NÃO alterar sem avisar)
- Next.js 16.2.6 com App Router + Turbopack
- React 19.2.6
- TypeScript 6.0.3 (strict mode)
- Tailwind CSS 4.2.4 com paleta green custom (green-600 = #008641)
- Lucide React 1.14.0
- @hookform/resolvers 5.2.2 (react-hook-form já disponível)

### Stack a adicionar (instale na ordem)
```bash
# Fase 1
npm install prisma @prisma/client
npm install -D prisma

# Fase 2
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# Fase 3
npm install zod

# Fase 4
npm install @vercel/blob

# Fase 5
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Modelos TypeScript existentes (preservar estes contratos)

```typescript
// src/models/produto.model.ts — NÃO MODIFICAR
export interface Produto {
  id: string
  nome: string
  descricao: string
  preco: number
  precoOriginal?: number
  imagem: string
  categoria: string
  subcategoria?: string
  emEstoque: boolean
  quantidadePacote: string
  avaliacao: number
  numAvaliacoes: number
  tags: string[]
}

export interface Categoria {
  id: string
  nome: string
  icone: string
}

export interface ItemCarrinho {
  produto: Produto
  quantidade: number
}
```

### Estrutura de pastas atual
```
src/
  app/
    page.tsx              ← home (filtra mocks hardcoded)
    layout.tsx
    produtos/page.tsx
    produto/[id]/page.tsx
    carrinho/page.tsx
    globals.css
  components/
    Header.tsx
    Footer.tsx
    ProdutoCard.tsx
    HeroTexto.tsx
  models/produto.model.ts
  mocks/produtos.mock.ts   ← 163 produtos estáticos
  services/api/produto.api.ts
  viewmodels/produtos.vm.ts
  viewmodels/carrinho.vm.ts
  utils/formatadores.ts
next.config.ts
package.json
```

---

## VARIÁVEIS DE AMBIENTE

Crie `.env.local` com estas variáveis (substitua pelos valores reais):

```env
DATABASE_URL="postgresql://USER:PASS@HOST:5432/ekomart?sslmode=require"
JWT_SECRET="GERE_UMA_STRING_ALEATORIA_DE_NO_MINIMO_32_CHARS"
BLOB_READ_WRITE_TOKEN="TOKEN_DO_VERCEL_BLOB"
ADMIN_EMAIL_SEED="admin@genonline.com"
ADMIN_SENHA_SEED="Admin@2026!"
```

Crie também `.env.example` com as chaves sem valores.

---

## SCHEMA DO BANCO (Prisma)

O schema a implementar em `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  senhaHash    String
  nome         String
  criadoEm    DateTime @default(now())
  atualizadoEm DateTime @updatedAt
}

model Categoria {
  id       String    @id
  nome     String
  icone    String
  ordem    Int       @default(0)
  ativo    Boolean   @default(true)
  produtos Produto[]
  criadoEm    DateTime @default(now())
  atualizadoEm DateTime @updatedAt
}

model Produto {
  id               String   @id @default(cuid())
  nome             String
  descricao        String   @db.Text
  preco            Decimal  @db.Decimal(10, 2)
  precoOriginal    Decimal? @db.Decimal(10, 2)
  imagem           String
  quantidadePacote String
  emEstoque        Boolean  @default(true)
  avaliacao        Float    @default(0)
  numAvaliacoes    Int      @default(0)
  ativo            Boolean  @default(true)
  categoriaId      String
  categoria        Categoria  @relation(fields: [categoriaId], references: [id])
  tags             ProdutoTag[]
  secaoItems       SecaoItem[]
  criadoEm    DateTime @default(now())
  atualizadoEm DateTime @updatedAt
  @@index([categoriaId])
  @@index([emEstoque])
  @@index([ativo])
}

model Tag {
  id       String       @id
  label    String
  produtos ProdutoTag[]
}

model ProdutoTag {
  produtoId String
  tagId     String
  produto   Produto @relation(fields: [produtoId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id])
  @@id([produtoId, tagId])
}

model Secao {
  id                String      @id @default(cuid())
  slug              String      @unique
  titulo            String
  subtitulo         String?
  ordem             Int         @default(0)
  ativo             Boolean     @default(true)
  maxItens          Int         @default(8)
  filtroCategoriaId String?
  filtroTag         String?
  modoSelecao       ModoSelecao @default(AUTOMATICO)
  itens             SecaoItem[]
  criadoEm    DateTime @default(now())
  atualizadoEm DateTime @updatedAt
}

enum ModoSelecao {
  AUTOMATICO
  MANUAL
}

model SecaoItem {
  id        String  @id @default(cuid())
  secaoId   String
  produtoId String
  ordem     Int     @default(0)
  secao     Secao   @relation(fields: [secaoId], references: [id], onDelete: Cascade)
  produto   Produto @relation(fields: [produtoId], references: [id], onDelete: Cascade)
  @@unique([secaoId, produtoId])
  @@index([secaoId])
}
```

---

## DTOs DE CONTRATO (use estes tipos em todas as rotas)

```typescript
// Produto retornado pelo BFF público
export interface ProdutoPublicoDTO {
  id: string
  nome: string
  descricao: string
  preco: number
  precoOriginal: number | null
  imagem: string
  categoria: string
  quantidadePacote: string
  emEstoque: boolean
  avaliacao: number
  numAvaliacoes: number
  tags: string[]
}

// Seção da home com produtos resolvidos
export interface SecaoHomeDTO {
  id: string
  slug: string
  titulo: string
  subtitulo: string | null
  ordem: number
  produtos: ProdutoPublicoDTO[]
}

// Produto com campos admin
export interface ProdutoAdminDTO extends ProdutoPublicoDTO {
  ativo: boolean
  categoriaId: string
  criadoEm: string
  atualizadoEm: string
}

// Seção com configuração admin completa
export interface SecaoAdminDTO {
  id: string
  slug: string
  titulo: string
  subtitulo: string | null
  ordem: number
  ativo: boolean
  maxItens: number
  modoSelecao: 'AUTOMATICO' | 'MANUAL'
  filtroCategoriaId: string | null
  filtroTag: string | null
  itens: Array<{ produtoId: string; ordem: number; produto: ProdutoPublicoDTO }>
  produtosPrevia: ProdutoPublicoDTO[]
}
```

---

## FASE 1 — Banco + BFF Público

**Objetivo:** frontend existente passa a consumir dados do PostgreSQL.
**Critério de conclusão:** todas as páginas públicas funcionam com dados do banco.

### Arquivos a criar nesta fase (nesta ordem):

#### 1. `prisma/schema.prisma`
Schema completo conforme especificado acima.

#### 2. `.env.local` e `.env.example`
Variáveis de ambiente.

#### 3. `prisma/seed.ts`
Seed que:
- Upserta as 7 categorias: `hortifruti, frios-e-embutidos, congelados, higiene-e-beleza, limpeza, pet-shop, utilidades`
- Upserta as tags: `desconto, fresco, organico, sem-gluten, sem-lactose`
- Upserta todos os 163 produtos dos mocks (importando de `src/mocks/produtos.mock.ts`)
- Para cada produto, cria as ProdutoTag correspondentes
- Upserta 2 seções iniciais da home:
  - `{ slug: 'ofertas-do-dia', titulo: '🔥 Ofertas do Dia', subtitulo: 'Aproveite as melhores ofertas de hoje', ordem: 0, modoSelecao: 'AUTOMATICO', filtroTag: 'desconto', maxItens: 8 }`
  - `{ slug: 'frios-embutidos', titulo: '🧀 Frios e Embutidos', subtitulo: 'Frango, salsicha, linguiça e mais', ordem: 1, modoSelecao: 'AUTOMATICO', filtroCategoriaId: 'frios-e-embutidos', maxItens: 8 }`
- Cria admin default com bcrypt hash da senha

#### 4. `src/lib/prisma.ts`
Singleton PrismaClient com prevenção de múltiplas instâncias em hot-reload do Next.js (usar `globalThis`).

#### 5. `src/lib/dto.ts`
Funções helpers para converter Prisma models → DTOs públicos:
- `produtoToDTO(prismaProduct): ProdutoPublicoDTO`
- `secaoToDTO(prismaSecao, produtos): SecaoHomeDTO`

#### 6. `src/app/api/produtos/route.ts`
`GET /api/produtos`
- Query params: `?categoria=`, `?tag=`, `?q=` (busca), `?emEstoque=`
- Retorna apenas produtos com `ativo: true`
- Ordena por `criadoEm DESC`

#### 7. `src/app/api/produtos/[id]/route.ts`
`GET /api/produtos/[id]`
- Retorna produto com `ativo: true`
- 404 se não encontrado

#### 8. `src/app/api/categorias/route.ts`
`GET /api/categorias`
- Retorna categorias com `ativo: true` ordenadas por `ordem ASC`

#### 9. `src/app/api/home/secoes/route.ts`
`GET /api/home/secoes`
- Lógica de resolução:
  - Para cada seção com `ativo: true`, ordena por `ordem ASC`
  - Se `modoSelecao === 'AUTOMATICO'`: query produtos filtrando por `filtroCategoriaId` e/ou `filtroTag`, limit `maxItens`
  - Se `modoSelecao === 'MANUAL'`: busca SecaoItem ordenados por `ordem ASC`, limit `maxItens`
- Serializa com `produtoToDTO`

#### 10. `src/services/api/produto.api.ts` (ATUALIZAR)
Substituir retorno dos mocks por chamadas fetch:
- `listarProdutos()` → `fetch('/api/produtos')`
- `obterProduto(id)` → `fetch('/api/produtos/' + id)`
- `listarCategorias()` → `fetch('/api/categorias')`
- `buscarProdutos(q)` → `fetch('/api/produtos?q=' + q)`
- Manter a mesma assinatura de tipos para não quebrar os ViewModels

#### 11. `src/viewmodels/home.vm.ts` (NOVO)
Hook `useHomeSecoesViewModel()`:
- Faz fetch para `/api/home/secoes`
- Retorna `{ secoes: SecaoHomeDTO[], carregando: boolean, erro: string | null }`

#### 12. `src/app/page.tsx` (ATUALIZAR)
- Substituir filtros hardcoded por `useHomeSecoesViewModel()`
- Renderizar seções dinamicamente a partir do array retornado
- Manter visual idêntico ao atual

### Comandos a executar após criar os arquivos:
```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
# Testar: GET /api/produtos, /api/categorias, /api/home/secoes
```

---

## FASE 2 — Auth + Middleware

**Objetivo:** login admin funcional e todas as rotas admin protegidas.

### Arquivos a criar:

#### 1. `src/lib/auth.ts`
Funções:
- `signJWT(payload: { adminId: string; email: string }): string` — usa `jsonwebtoken`, expira em `8h`
- `verifyJWT(token: string): { adminId: string; email: string } | null`
- `getAdminFromRequest(req: Request): { adminId: string; email: string } | null` — lê do cookie `admin-token`

#### 2. `src/lib/password.ts`
- `hashPassword(plain: string): Promise<string>` — bcryptjs, rounds 12
- `comparePassword(plain: string, hash: string): Promise<boolean>`

#### 3. `src/lib/rateLimit.ts`
Rate limiter in-memory simples:
- `checkRateLimit(ip: string): boolean` — permite até 5 tentativas por IP em janela de 15 minutos
- Limpa automaticamente entradas antigas

#### 4. `src/app/api/auth/login/route.ts`
`POST /api/auth/login`
- Body: `{ email: string; senha: string }` (validar com Zod)
- Checa rate limit pelo IP (header `x-forwarded-for`)
- Busca admin no banco por email
- Compara senha com bcrypt
- Se OK: gera JWT, seta cookie `admin-token` httpOnly Secure SameSite=Strict MaxAge=28800
- Retorna `{ admin: { id, email, nome } }`
- Erros: 401 credenciais inválidas, 429 rate limit

#### 5. `src/app/api/auth/logout/route.ts`
`POST /api/auth/logout`
- Apaga cookie `admin-token` (MaxAge=0)
- Retorna `{ ok: true }`

#### 6. `src/app/api/auth/me/route.ts`
`GET /api/auth/me`
- Lê JWT do cookie
- Retorna dados do admin logado ou 401

#### 7. `middleware.ts` (raiz do projeto)
```
Rotas protegidas: /admin/* (exceto /admin/login) e /api/admin/*
Lógica:
  1. Ler cookie admin-token
  2. verifyJWT(token)
  3. Se inválido:
     - /admin/** → redirect /admin/login
     - /api/admin/** → Response JSON 401
  4. Se válido: NextResponse.next() com header X-Admin-Id
```
Usar `NextRequest` e `NextResponse` do `next/server`.

#### 8. `src/app/admin/login/page.tsx`
Formulário com:
- Campo email (type="email")
- Campo senha (type="password")
- Botão "Entrar"
- Mensagem de erro se credenciais inválidas
- Usa `react-hook-form` + Zod para validação client-side
- Chama `POST /api/auth/login` e redireciona para `/admin/dashboard` em caso de sucesso
- Visual: centralizado, card branco, logo Ekomart, paleta green

---

## FASE 3 — CRUD Admin de Produtos

**Objetivo:** operador gerencia produtos via painel.

### Arquivos a criar:

#### 1. `src/utils/validators.ts`
Schemas Zod:
- `LoginSchema` — `{ email: z.string().email(), senha: z.string().min(6) }`
- `ProdutoCreateSchema` — todos os campos obrigatórios do produto
- `ProdutoUpdateSchema` — igual ao Create mas tudo opcional (partial)
- `CategoriaCreateSchema` — `{ id, nome, icone, ordem? }`
- `SecaoUpdateSchema` — campos editáveis da seção

#### 2. BFF admin de produtos:

`src/app/api/admin/produtos/route.ts`
- `GET`: lista com paginação `?page=1&limit=20`, filtros `?categoria=&q=&emEstoque=&ativo=`
- `POST`: cria produto (valida com ProdutoCreateSchema)

`src/app/api/admin/produtos/[id]/route.ts`
- `GET`: retorna ProdutoAdminDTO
- `PUT`: atualiza (valida com ProdutoUpdateSchema)
- `DELETE`: soft delete (ativo: false)

`src/app/api/admin/produtos/[id]/estoque/route.ts`
- `PATCH`: toggle `emEstoque`
- Body: `{ emEstoque: boolean }`

#### 3. Layout admin: `src/app/admin/layout.tsx`
- Sidebar esquerda + área de conteúdo
- Usa componentes AdminSidebar e AdminTopBar
- Aplica classe de fundo neutro ao body da área admin

#### 4. `src/components/admin/AdminSidebar.tsx`
Links de navegação:
- Dashboard (`/admin/dashboard`) — ícone LayoutDashboard
- Produtos (`/admin/produtos`) — ícone Package
- Categorias (`/admin/categorias`) — ícone Tag
- Seções da Home (`/admin/secoes`) — ícone LayoutList
- Separador + link "Ver site" (`/`) — ícone ExternalLink
Marca link ativo com fundo green-100 e texto green-700.

#### 5. `src/components/admin/AdminTopBar.tsx`
- Breadcrumb baseado na rota atual
- Nome do admin logado (lê de `/api/auth/me`)
- Botão logout (chama `POST /api/auth/logout` + redirect `/admin/login`)

#### 6. `src/app/admin/dashboard/page.tsx`
Cards de métricas (Server Component que busca via Prisma diretamente):
- Total de produtos ativos
- Produtos sem estoque (emEstoque: false)
- Categorias ativas
- Seções da home ativas
Tabela: últimos 5 produtos atualizados (nome, categoria, preço, data).

#### 7. `src/components/admin/ui/DataTable.tsx`
Componente genérico:
- Props: `columns`, `data`, `pagination`, `onPageChange`
- Coluna com render customizável
- Linha de loading skeleton

#### 8. `src/components/admin/ui/Toggle.tsx`
Switch acessível com ARIA:
- Props: `checked`, `onChange`, `disabled`, `label`
- Visual: pill verde quando ativo

#### 9. `src/components/admin/ui/ConfirmDialog.tsx`
Modal de confirmação:
- Props: `open`, `onConfirm`, `onCancel`, `titulo`, `mensagem`, `labelConfirmar`
- Botão de confirmação em vermelho (ação destructiva)

#### 10. `src/components/admin/ui/Badge.tsx`
Badge colorido:
- Props: `variant: 'categoria' | 'tag' | 'estoque' | 'ativo'`, `label`
- Cores: verde (ativo/estoque), amarelo (tag), azul (categoria), vermelho (inativo)

#### 11. `src/app/admin/produtos/page.tsx`
- DataTable com colunas: miniatura, nome, categoria, preço (com strike), toggle estoque, tags, ações (editar/excluir)
- Filtros: busca por nome, select de categoria, select de estoque
- Paginação server-side (20 por página)
- Toggle de estoque faz PATCH inline sem recarregar a página
- Botão "+ Novo Produto" → `/admin/produtos/novo`
- Botão excluir abre ConfirmDialog

#### 12. `src/components/admin/TagSelector.tsx`
Multi-select de chips:
- Tags disponíveis: `desconto, fresco, organico, sem-gluten, sem-lactose`
- Chip clicável: toggle seleção com visual preenchido/outline
- Props: `value: string[]`, `onChange: (tags: string[]) => void`

#### 13. `src/components/admin/ProdutoForm.tsx`
Formulário unificado (criar e editar):
- Usa `react-hook-form` + `ProdutoCreateSchema` (Zod)
- Campos: nome, descrição (textarea), categoria (select), quantidade pacote, preço, preço original, emEstoque (Toggle), tags (TagSelector), imagem (ImageUpload placeholder — implementado na Fase 4)
- Botões: Salvar, Cancelar
- Exibe erros de validação inline

#### 14. `src/app/admin/produtos/novo/page.tsx`
- Renderiza ProdutoForm no modo criação
- Chama `POST /api/admin/produtos` ao submeter
- Redireciona para `/admin/produtos` em caso de sucesso

#### 15. `src/app/admin/produtos/[id]/page.tsx`
- Busca produto via `GET /api/admin/produtos/[id]`
- Renderiza ProdutoForm pré-preenchido
- Chama `PUT /api/admin/produtos/[id]` ao submeter
- Botão "Excluir Produto" → ConfirmDialog → DELETE → redirect

---

## FASE 4 — Upload de Imagem

**Objetivo:** admin substitui foto de produto via painel.

### Arquivos a criar:

#### 1. `src/lib/blob.ts`
- `uploadImage(file: File, filename: string): Promise<string>` — usa `@vercel/blob`, retorna URL pública
- Configura `access: 'public'`

#### 2. `src/app/api/admin/upload/route.ts`
`POST /api/admin/upload`
- Recebe `multipart/form-data` com campo `imagem`
- Valida MIME: aceita apenas `image/webp`, `image/jpeg`, `image/png`
- Valida tamanho: máximo 2 MB
- Chama `blob.uploadImage()`
- Retorna `{ url: string }`
- Erros: 400 tipo inválido, 400 arquivo grande demais, 500 falha no upload

#### 3. `src/components/admin/ImageUpload.tsx`
- Área de drag-and-drop com borda pontilhada
- Preview da imagem atual (se existir) ou placeholder com ícone ImagePlus
- Ao selecionar arquivo: valida client-side (tipo + tamanho)
- Faz POST para `/api/admin/upload` com feedback de loading
- Ao concluir: chama `onChange(url)` com a URL retornada
- Botão "remover" (X) limpa o campo
- Props: `value: string | null`, `onChange: (url: string | null) => void`

#### 4. Atualizar `src/components/admin/ProdutoForm.tsx`
- Substituir o placeholder de imagem por `<ImageUpload />`
- Campo `imagem` do form recebe a URL retornada pelo upload

#### 5. Atualizar `next.config.ts`
- Adicionar domínio `public.blob.vercel-storage.com` em `images.remotePatterns`
- Remover `unoptimized: true` (agora que Blob serve as imagens otimizadas)

---

## FASE 5 — Categorias + Seções Admin

**Objetivo:** admin configura home e categorias via painel.

### Arquivos a criar:

#### BFF admin de categorias:

`src/app/api/admin/categorias/route.ts`
- `GET`: lista todas, inclusive inativas, ordenadas por `ordem`
- `POST`: cria categoria (valida CategoriaCreateSchema)

`src/app/api/admin/categorias/[id]/route.ts`
- `PUT`: atualiza nome, icone, ordem, ativo
- `DELETE`: só permite se categoria não tiver produtos ativos (retorna 409 se tiver)

#### BFF admin de seções:

`src/app/api/admin/secoes/route.ts`
- `GET`: lista seções com `itens` e `produtosPrevia` (prévia dos produtos que seriam exibidos)
- `POST`: cria nova seção

`src/app/api/admin/secoes/[id]/route.ts`
- `GET`: retorna SecaoAdminDTO completo
- `PUT`: atualiza config da seção
- `DELETE`: apaga seção e seus SecaoItems (cascade)

`src/app/api/admin/secoes/[id]/toggle/route.ts`
- `PATCH`: alterna `ativo`

`src/app/api/admin/secoes/[id]/itens/route.ts`
- `POST`: adiciona produto à seção (modo Manual)
- Body: `{ produtoId: string }`
- Valida que produto existe e não está duplicado

`src/app/api/admin/secoes/[id]/itens/[produtoId]/route.ts`
- `DELETE`: remove produto da seção

`src/app/api/admin/secoes/[id]/ordem/route.ts`
- `PUT`: reordena produtos da seção
- Body: `Array<{ produtoId: string; ordem: number }>`
- Usa `prisma.$transaction` para atualizar todos de uma vez

#### Componentes:

`src/components/admin/ui/DragList.tsx`
- Wrapper sobre `@dnd-kit/sortable`
- Props: `items: Array<{ id: string }>`, `onReorder: (newOrder: string[]) => void`, `renderItem: (item) => ReactNode`
- Emite `onReorder` com os IDs na nova ordem após drag

`src/components/admin/SecaoCard.tsx`
Card de configuração de seção:
- Cabeçalho: handle de drag + título + toggle ativo
- Campos editáveis: título, subtítulo, maxItens
- Radio: modo Automático / Manual
- Modo Automático: selects de categoria e tag
- Modo Manual: barra de busca de produtos + DragList dos itens selecionados
- Prévia: grid 4 colunas das fotos dos produtos que serão exibidos

`src/components/admin/SecaoPreviaProdutos.tsx`
- Grid de miniaturas dos produtos da prévia
- Exibe nome abreviado + preço
- "Nenhum produto" quando filtro não retorna resultados

#### Páginas:

`src/app/admin/categorias/page.tsx`
- Tabela inline editável (sem página separada)
- Cada linha: ícone emoji (input), nome (input), ordem (input number), ativo (Toggle), salvar (botão check), excluir
- Botão "+ Nova Categoria" adiciona linha nova no topo
- Salvar chama PUT/POST conforme categoria existe ou não

`src/app/admin/secoes/page.tsx`
- DragList de SecaoCard (drag-and-drop para reordenar seções)
- Botão "+ Nova Seção" cria seção vazia com título padrão
- Cada card auto-salva ao perder foco (debounce 800ms)

---

## FASE 6 — Finalização + Deploy

**Objetivo:** remover mocks, deploy em produção, testes finais.

### Arquivos a criar/atualizar:

#### 1. Remover dependência dos mocks no frontend
- `src/services/api/produto.api.ts` já foi atualizado na Fase 1
- `src/app/page.tsx` já foi atualizado na Fase 1
- `src/mocks/produtos.mock.ts` → manter apenas para o seed (não importar no frontend)
- Verificar que nenhum arquivo fora de `prisma/seed.ts` importa de `src/mocks/`

#### 2. Cache HTTP nas rotas públicas
Adicionar headers `Cache-Control` nas rotas públicas:
- `/api/home/secoes` → `s-maxage=60, stale-while-revalidate=300`
- `/api/produtos` → `s-maxage=30, stale-while-revalidate=120`
- `/api/categorias` → `s-maxage=300, stale-while-revalidate=600`

#### 3. `src/app/admin/dashboard/page.tsx` — métricas finais
Adicionar seção "Links rápidos":
- "Ver site" abre nova aba
- "Ir para produtos" navega para /admin/produtos

#### 4. Smoke test checklist
Antes de cada deploy verificar:
- [ ] GET /api/produtos retorna dados do banco
- [ ] GET /api/home/secoes retorna seções configuradas
- [ ] Login admin funciona e cria cookie
- [ ] Acesso a /admin/produtos sem login redireciona para /admin/login
- [ ] CRUD de produto funciona end-to-end
- [ ] Upload de imagem retorna URL pública acessível
- [ ] Páginas públicas (/, /produtos, /produto/id, /carrinho) funcionam normalmente

---

## INSTRUÇÕES FINAIS PARA O GEMINI

1. **Comece pela Fase 1.** Gere os arquivos na ordem listada acima.
2. Após cada arquivo, escreva sua entrada no `PROGRESSO.md`.
3. Ao terminar todos os arquivos de uma fase, escreva um resumo:
   ```
   ## ✅ Fase [N] concluída
   Arquivos criados: X
   Dependências instaladas: Y
   Próxima fase: [NOME]
   Aguardando confirmação para prosseguir.
   ```
4. **Aguarde confirmação** antes de avançar para a próxima fase.
5. Se encontrar ambiguidade no PRD, descreva o problema e proponha 2 opções antes de decidir.
6. Se um arquivo exceder o contexto da resposta, divida em partes numeradas e avise.
7. Ao final de todas as fases, gere um `PROGRESSO.md` com status `✅ 100% concluído`.

---

**Comece agora pela Fase 1 — arquivo 1: `prisma/schema.prisma`**

---

## FIM DO PROMPT PARA O GEMINI
