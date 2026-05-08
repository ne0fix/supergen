# PRD — Painel Administrativo Ekomart
**Versão:** 1.0  
**Data:** 2026-05-08  
**Stack:** Next.js 16 · BFF (API Routes) · Prisma · PostgreSQL

---

## 1. Contexto e Objetivo

O Ekomart é um supermercado online (genonline.vercel.app) cujos dados de produto vivem hoje em mocks TypeScript estáticos. Toda alteração de preço, foto ou estoque exige deploy de código. O objetivo deste projeto é:

1. Migrar os dados para um banco PostgreSQL via Prisma.
2. Criar uma camada BFF (API Routes do Next.js) que sirva os dados ao frontend existente sem quebrar a interface atual.
3. Entregar um painel admin protegido por autenticação onde operadores do supermercado gerenciam produtos, categorias e a curadoria das seções da home page — sem precisar de um desenvolvedor.

---

## 2. Escopo

### In scope
- CRUD completo de Produtos
- CRUD de Categorias (id, nome, ícone emoji)
- Upload e troca de foto de produto (armazenamento em bucket público — ex.: Vercel Blob ou S3)
- Configuração das **Seções da Home** (quais produtos aparecem em "Ofertas do Dia", "Frios e Embutidos" etc., com controle de ordem e limite de cards)
- Controle de estoque (emEstoque toggle)
- Controle de desconto (preço original + preço atual = badge de desconto)
- Controle de tags por produto (`fresco`, `desconto`, etc.)
- Autenticação de administrador (email + senha, sem OAuth externo)
- Dashboard com métricas básicas (total de produtos, produtos sem estoque, categorias ativas)

### Out of scope (v1)
- Gestão de pedidos / carrinho persisted
- Relatórios de vendas
- Multi-tenant / multi-loja
- App mobile admin
- Controle de estoque numérico (apenas booleano emEstoque)

---

## 3. Personas

| Persona | Descrição | Frequência de uso |
|---|---|---|
| **Operador de loja** | Atualiza preços e estoque diariamente | Diário |
| **Gerente de marketing** | Define seções da home, cria ofertas | 2–3x semana |
| **Dev / implantador** | Cria categorias, configura banco | Raramente |

---

## 4. User Stories

### 4.1 Produtos
- `US-01` Como operador, quero listar todos os produtos com filtro por categoria e busca por nome.
- `US-02` Como operador, quero criar um produto novo preenchendo nome, descrição, preço, preço original, categoria, quantidade do pacote, tags e foto.
- `US-03` Como operador, quero editar qualquer campo de um produto existente e salvar.
- `US-04` Como operador, quero trocar a foto de um produto fazendo upload de uma nova imagem (webp/jpg/png até 2 MB).
- `US-05` Como operador, quero ativar/desativar o estoque de um produto com um toggle diretamente da listagem.
- `US-06` Como operador, quero excluir um produto com confirmação.
- `US-07` Como gerente, quero marcar um produto como "em desconto" informando o preço original, e o frontend exibe o badge automaticamente.

### 4.2 Categorias
- `US-08` Como admin, quero listar as categorias com nome e ícone.
- `US-09` Como admin, quero criar e editar categorias (slug-id, nome, ícone emoji).
- `US-10` Como admin, quero reordenar categorias (drag-and-drop ou campo de ordem) — a home exibe na ordem configurada.

### 4.3 Seções da Home
- `US-11` Como gerente, quero ver todas as seções configuráveis da home ("Ofertas do Dia", "Frios e Embutidos").
- `US-12` Como gerente, quero alterar o título e subtítulo de cada seção.
- `US-13` Como gerente, quero definir quais produtos aparecem em cada seção escolhendo por categoria, tag ou produto específico, com limite de quantidade de cards (ex: 8).
- `US-14` Como gerente, quero ativar/desativar uma seção sem apagar sua configuração.
- `US-15` Como gerente, quero reordenar as seções da home.

### 4.4 Autenticação
- `US-16` Como admin, quero fazer login com email e senha.
- `US-17` Como admin, quero que minha sessão expire após 8 horas de inatividade.
- `US-18` Como dev, quero proteger todas as rotas `/admin/**` e `/api/admin/**` com middleware de autenticação.

---

## 5. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js 16 (App Router)               │
│                                                         │
│  ┌──────────────┐      ┌──────────────────────────────┐ │
│  │  Frontend    │      │  BFF — API Routes            │ │
│  │  /app        │      │  /app/api/                   │ │
│  │              │      │                              │ │
│  │  /           │◄────►│  /api/produtos          GET  │ │
│  │  /produtos   │      │  /api/produtos/[id]  GET/PUT │ │
│  │  /produto/id │      │  /api/categorias        GET  │ │
│  │              │      │  /api/home/secoes       GET  │ │
│  │  /admin/**   │◄────►│  /api/admin/produtos   CRUD  │ │
│  │  (protegido) │      │  /api/admin/categorias CRUD  │ │
│  │              │      │  /api/admin/secoes      CRUD  │ │
│  │              │      │  /api/admin/upload      POST  │ │
│  │              │      │  /api/auth/login        POST  │ │
│  │              │      │  /api/auth/logout       POST  │ │
│  └──────────────┘      └──────────┬───────────────────┘ │
└─────────────────────────────────────────────────────────┘
                                    │ Prisma Client
                         ┌──────────▼──────────┐
                         │    PostgreSQL        │
                         │  (Supabase / Neon)  │
                         └─────────────────────┘
                                    
                         ┌─────────────────────┐
                         │  Vercel Blob / S3   │
                         │  (imagens upload)   │
                         └─────────────────────┘
```

### Camadas

| Camada | Responsabilidade |
|---|---|
| **Frontend** | React / Tailwind — consome os endpoints BFF. Nenhuma lógica de negócio. |
| **BFF (API Routes)** | Valida auth, aplica regras de negócio, formata resposta. Única porta de entrada ao banco. |
| **Prisma** | ORM — migrations, type-safety, queries. |
| **PostgreSQL** | Persistência. Recomendado: Neon (serverless) ou Supabase free tier. |

---

## 6. Schema do Banco de Dados (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Administradores ───────────────────────────────────────

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  senhaHash    String
  nome         String
  criadoEm    DateTime @default(now())
  atualizadoEm DateTime @updatedAt
}

// ─── Categorias ────────────────────────────────────────────

model Categoria {
  id       String    @id              // slug: "hortifruti", "congelados"
  nome     String
  icone    String                     // emoji: "🥦"
  ordem    Int       @default(0)
  ativo    Boolean   @default(true)
  produtos Produto[]

  criadoEm    DateTime @default(now())
  atualizadoEm DateTime @updatedAt
}

// ─── Produtos ──────────────────────────────────────────────

model Produto {
  id               String   @id @default(cuid())
  nome             String
  descricao        String   @db.Text
  preco            Decimal  @db.Decimal(10, 2)
  precoOriginal    Decimal? @db.Decimal(10, 2)
  imagem           String                          // URL pública
  quantidadePacote String                          // "500g", "por kg"
  emEstoque        Boolean  @default(true)
  avaliacao        Float    @default(0)
  numAvaliacoes    Int      @default(0)
  ativo            Boolean  @default(true)

  categoriaId  String
  categoria    Categoria  @relation(fields: [categoriaId], references: [id])

  tags         ProdutoTag[]
  secaoItems   SecaoItem[]

  criadoEm    DateTime @default(now())
  atualizadoEm DateTime @updatedAt

  @@index([categoriaId])
  @@index([emEstoque])
}

// ─── Tags ──────────────────────────────────────────────────

model Tag {
  id       String       @id    // "desconto", "fresco", "organico"
  label    String              // "Desconto", "Fresco"
  produtos ProdutoTag[]
}

model ProdutoTag {
  produtoId String
  tagId     String
  produto   Produto @relation(fields: [produtoId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id])

  @@id([produtoId, tagId])
}

// ─── Seções da Home ────────────────────────────────────────

model Secao {
  id         String      @id @default(cuid())
  slug       String      @unique   // "ofertas-do-dia", "frios-embutidos"
  titulo     String                // "🔥 Ofertas do Dia"
  subtitulo  String?               // "Aproveite as melhores ofertas"
  ordem      Int         @default(0)
  ativo      Boolean     @default(true)
  maxItens   Int         @default(8)

  // Filtro automático OU seleção manual
  filtroCategoriaId String?        // se preenchido, carrega produtos desta categoria
  filtroTag         String?        // se preenchido, filtra por tag
  modoSelecao       ModoSelecao   @default(AUTOMATICO)

  itens      SecaoItem[]

  criadoEm    DateTime @default(now())
  atualizadoEm DateTime @updatedAt
}

enum ModoSelecao {
  AUTOMATICO  // usa filtroCategoriaId + filtroTag
  MANUAL      // usa SecaoItem selecionados pelo admin
}

model SecaoItem {
  id        String  @id @default(cuid())
  secaoId   String
  produtoId String
  ordem     Int     @default(0)

  secao   Secao   @relation(fields: [secaoId], references: [id], onDelete: Cascade)
  produto Produto @relation(fields: [produtoId], references: [id], onDelete: Cascade)

  @@unique([secaoId, produtoId])
  @@index([secaoId])
}
```

### Dados iniciais (seed)

O seed (`prisma/seed.ts`) migra todos os `mockProdutos` e `mockCategorias` para o banco, preservando os mesmos slugs/IDs, e cria as seções:

| Slug | Título | Modo | Filtro |
|---|---|---|---|
| `ofertas-do-dia` | 🔥 Ofertas do Dia | AUTOMATICO | tag: `desconto` |
| `frios-embutidos` | 🧀 Frios e Embutidos | AUTOMATICO | categoria: `frios-e-embutidos` |

---

## 7. BFF — Endpoints da API

### 7.1 Endpoints públicos (consumidos pelo frontend)

```
GET  /api/produtos              → lista todos ativos, suporta ?categoria=&tag=&q=
GET  /api/produtos/[id]         → detalhe de um produto
GET  /api/categorias            → lista categorias ativas ordenadas
GET  /api/home/secoes           → seções ativas + produtos de cada uma
```

**Response GET /api/home/secoes**
```json
[
  {
    "id": "...",
    "slug": "ofertas-do-dia",
    "titulo": "🔥 Ofertas do Dia",
    "subtitulo": "Aproveite as melhores ofertas de hoje",
    "ordem": 0,
    "produtos": [
      {
        "id": "...",
        "nome": "Iogurte Nestlé Morango",
        "preco": 3.49,
        "precoOriginal": null,
        "imagem": "https://...",
        "categoria": "frios-e-embutidos",
        "emEstoque": true,
        "avaliacao": 4.6,
        "numAvaliacoes": 198,
        "tags": ["desconto"],
        "quantidadePacote": "170g"
      }
    ]
  }
]
```

### 7.2 Autenticação

```
POST /api/auth/login            → { email, senha } → { token, admin }
POST /api/auth/logout           → invalida sessão
GET  /api/auth/me               → retorna admin logado
```

Implementação: **JWT httpOnly cookie** (não localStorage).  
Expiração: 8h. Renovação automática nos primeiros 30min antes de expirar.

### 7.3 Endpoints admin (requerem JWT válido)

#### Produtos
```
GET    /api/admin/produtos               → lista com paginação (?page=&limit=&categoria=&q=)
GET    /api/admin/produtos/[id]          → detalhe completo
POST   /api/admin/produtos               → criar produto
PUT    /api/admin/produtos/[id]          → atualizar produto
PATCH  /api/admin/produtos/[id]/estoque  → toggle emEstoque
DELETE /api/admin/produtos/[id]          → soft delete (ativo: false)
```

**Body POST/PUT /api/admin/produtos**
```json
{
  "nome": "Iogurte Nestlé Morango",
  "descricao": "Iogurte cremoso...",
  "preco": 3.49,
  "precoOriginal": 4.49,
  "imagem": "https://blob.vercel-storage.com/...",
  "categoriaId": "frios-e-embutidos",
  "quantidadePacote": "170g",
  "emEstoque": true,
  "tags": ["desconto"]
}
```

#### Categorias
```
GET    /api/admin/categorias             → lista todas
POST   /api/admin/categorias            → criar
PUT    /api/admin/categorias/[id]        → atualizar nome/ícone/ordem
DELETE /api/admin/categorias/[id]        → só se não tiver produtos
```

#### Seções da Home
```
GET    /api/admin/secoes                 → lista seções com config e itens
POST   /api/admin/secoes                 → criar nova seção
PUT    /api/admin/secoes/[id]            → atualizar título/subtítulo/config/ordem
PATCH  /api/admin/secoes/[id]/toggle    → ativar/desativar
DELETE /api/admin/secoes/[id]            → remover seção
POST   /api/admin/secoes/[id]/itens     → adicionar produto manual
DELETE /api/admin/secoes/[id]/itens/[pid] → remover produto manual
PUT    /api/admin/secoes/[id]/ordem-itens → reordenar produtos (body: [{ produtoId, ordem }])
```

#### Upload de imagem
```
POST   /api/admin/upload                 → multipart/form-data, campo: "imagem"
                                           retorna: { url: "https://..." }
```

Constraints: max 2 MB · formatos: webp, jpg, png · redimensionar para 800×800 px.

---

## 8. Painel Admin — Telas e Fluxos

### 8.1 Layout geral

```
/admin                    → redireciona para /admin/dashboard
/admin/login              → página pública de login
/admin/dashboard          → visão geral
/admin/produtos           → listagem de produtos
/admin/produtos/novo      → formulário de criação
/admin/produtos/[id]      → formulário de edição
/admin/categorias         → listagem + edição inline
/admin/secoes             → configurador de seções da home
```

Todas as rotas `/admin/**` (exceto `/admin/login`) são protegidas por middleware que verifica o JWT cookie. Redirect para `/admin/login` se inválido.

### 8.2 Dashboard `/admin/dashboard`

Cards de métricas:
- Total de produtos ativos
- Produtos sem estoque
- Categorias ativas
- Seções da home ativas

Lista rápida: últimos 5 produtos atualizados.

### 8.3 Listagem de Produtos `/admin/produtos`

| Coluna | Tipo |
|---|---|
| Miniatura | Imagem 48×48 |
| Nome | Texto com link para edição |
| Categoria | Badge colorido |
| Preço | R$ com strike se tiver precoOriginal |
| Estoque | Toggle on/off (PATCH inline) |
| Tags | Chips: `desconto`, `fresco` |
| Ações | Editar · Excluir |

Filtros: categoria · estoque · tag · busca por nome  
Paginação: 20 itens por página

### 8.4 Formulário de Produto `/admin/produtos/novo` e `/admin/produtos/[id]`

**Campos:**

| Campo | Controle | Validação |
|---|---|---|
| Nome | Input text | obrigatório, max 120 chars |
| Descrição | Textarea | obrigatório, max 600 chars |
| Categoria | Select (categorias do banco) | obrigatório |
| Quantidade do pacote | Input text | ex: "500g", "por kg" |
| Preço atual | Input number | obrigatório, > 0 |
| Preço original | Input number | opcional; se preenchido, gera badge desconto |
| Em estoque | Toggle | padrão: true |
| Tags | Multi-select chips | valores: desconto, fresco, organico, sem-gluten |
| Foto | Upload area + preview | jpg/webp/png ≤ 2 MB |

**Fluxo de upload de foto:**
1. Admin arrasta ou clica na área de upload.
2. Frontend envia `POST /api/admin/upload` com o arquivo.
3. API salva no Vercel Blob e retorna a URL pública.
4. URL é armazenada no campo `imagem` do formulário.
5. Preview é exibido imediatamente.

**Botões:** Salvar · Cancelar · (em edição) Excluir produto

### 8.5 Categorias `/admin/categorias`

Tabela inline editável:

| Campo | Controle |
|---|---|
| Ícone | Input de emoji (picker simples) |
| Nome | Input text |
| Ordem | Input number (define ordem na home) |
| Ativo | Toggle |
| Ações | Salvar inline · Excluir (bloqueado se tiver produtos) |

Botão "+ Nova categoria" abre linha nova na tabela.

### 8.6 Configurador de Seções `/admin/secoes`

Lista de seções em cards arrastáveis (drag-and-drop para reordenar).

**Por seção, o admin configura:**

```
┌────────────────────────────────────────────────────────┐
│  ⠿  🔥 Ofertas do Dia                    [Ativo ●]   │
│                                                        │
│  Título:     [ 🔥 Ofertas do Dia          ]            │
│  Subtítulo:  [ Aproveite as melhores...   ]            │
│  Máx. cards: [ 8  ]                                    │
│                                                        │
│  Modo de seleção:  ● Automático  ○ Manual              │
│                                                        │
│  — Automático ─────────────────────────────────────── │
│  Categoria: [ frios-e-embutidos ▼ ]                    │
│  Tag:       [ desconto           ▼ ]  (opcional)       │
│                                                        │
│  — Prévia dos produtos ──────────────────────────────  │
│  [foto] Iogurte Nestlé  R$ 3,49  [remover]            │
│  [foto] Margarina Becel R$ 12,99 [remover]            │
│  ...                                                   │
│                                [+ Adicionar manual]    │
└────────────────────────────────────────────────────────┘
```

**Modo Manual:** exibe campo de busca para selecionar produtos específicos e reordenar via drag-and-drop dentro da seção.

**Botão "+ Nova seção"** cria uma seção vazia para o admin configurar.

---

## 9. Autenticação e Segurança

### Fluxo de login
1. Admin acessa `/admin/login`.
2. Envia email + senha via `POST /api/auth/login`.
3. API verifica email no banco, compara bcrypt hash.
4. Em caso de sucesso: gera JWT assinado com `JWT_SECRET`, seta cookie `httpOnly; Secure; SameSite=Strict; Max-Age=28800`.
5. Redirect para `/admin/dashboard`.

### Middleware de proteção
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isApiAdmin = request.nextUrl.pathname.startsWith('/api/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if ((isAdminRoute || isApiAdmin) && !isLoginPage) {
    if (!token || !verificarJWT(token)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
}
```

### Regras de segurança
- Senhas armazenadas com bcrypt (salt rounds: 12).
- Todas as respostas da API admin incluem header `X-Content-Type-Options: nosniff`.
- Rate limit no endpoint de login: 5 tentativas por IP em 15 minutos.
- Inputs sanitizados antes de persistir (sem injeção SQL via Prisma).
- Upload: validação de MIME type no servidor, não só extensão.

---

## 10. Integração com o Frontend Existente

O frontend atual consome `ProdutoAPI` (mock). A migração é feita em duas etapas sem quebrar a UI:

### Etapa 1 — BFF pronto, frontend ainda usa mock
O banco e BFF ficam operacionais. O admin já funciona.

### Etapa 2 — Frontend aponta para BFF
Atualizar `src/services/api/produto.api.ts`:

```typescript
// antes
async listarProdutos(): Promise<Produto[]> {
  return [...mockProdutos];
}

// depois
async listarProdutos(): Promise<Produto[]> {
  const res = await fetch('/api/produtos');
  if (!res.ok) throw new Error('Erro ao buscar produtos');
  return res.json();
}
```

A home page deixa de usar filtros hardcoded e passa a consumir `/api/home/secoes`, que retorna exatamente os produtos configurados pelo admin para cada seção.

```typescript
// src/app/page.tsx — após migração
const { secoes } = useHomeSecoesViewModel(); // consome /api/home/secoes
```

---

## 11. Variáveis de Ambiente

```env
# .env.local
DATABASE_URL="postgresql://user:pass@host:5432/ekomart"
JWT_SECRET="string-aleatoria-minimo-32-chars"
BLOB_READ_WRITE_TOKEN="vercel-blob-token"   # ou AWS S3 credentials
ADMIN_EMAIL_SEED="admin@genonline.com"
ADMIN_SENHA_SEED="senha-forte-inicial"
```

---

## 12. Plano de Implementação

### Fase 1 — Banco e BFF base (3–4 dias)
- [ ] Configurar PostgreSQL (Neon serverless recomendado)
- [ ] Criar `prisma/schema.prisma` conforme seção 6
- [ ] Rodar `prisma migrate dev`
- [ ] Criar `prisma/seed.ts` — migrar todos os mocks para o banco
- [ ] Implementar endpoints públicos: `/api/produtos`, `/api/categorias`, `/api/home/secoes`
- [ ] Testar com o frontend existente apontando para BFF

### Fase 2 — Auth e admin CRUD de produtos (3–4 dias)
- [ ] Implementar `POST /api/auth/login` + JWT cookie
- [ ] Middleware de proteção de rotas
- [ ] Tela `/admin/login`
- [ ] Endpoints CRUD `/api/admin/produtos`
- [ ] Tela `/admin/produtos` — listagem + toggle de estoque
- [ ] Tela `/admin/produtos/[id]` — formulário completo

### Fase 3 — Upload de imagem (1–2 dias)
- [ ] Integrar Vercel Blob (ou S3)
- [ ] Endpoint `POST /api/admin/upload`
- [ ] Upload area com preview no formulário de produto

### Fase 4 — Categorias e Seções (2–3 dias)
- [ ] Endpoints CRUD de categorias
- [ ] Tela `/admin/categorias`
- [ ] Endpoints CRUD de seções
- [ ] Tela `/admin/secoes` com configurador e drag-and-drop

### Fase 5 — Dashboard e polish (1–2 dias)
- [ ] `/admin/dashboard` com métricas
- [ ] Atualizar frontend para consumir `/api/home/secoes`
- [ ] Remover mocks estáticos do código
- [ ] Testes E2E dos fluxos críticos

**Total estimado: 10–15 dias de desenvolvimento**

---

## 13. Decisões Técnicas

| Decisão | Escolha | Justificativa |
|---|---|---|
| ORM | Prisma | Type-safety, migrations, ótima DX com Next.js |
| Banco | PostgreSQL (Neon) | Serverless, free tier, SSL nativo |
| Auth | JWT httpOnly cookie | Simples, seguro, sem dependência de provider |
| Upload | Vercel Blob | Mesmo provider do deploy, integração nativa |
| Drag-and-drop | `@dnd-kit/core` | Leve, acessível, funciona com SSR |
| Formulários admin | `react-hook-form` + `zod` | Validação type-safe, já é dependência via `@hookform/resolvers` |
| UI admin | Tailwind + Radix UI (headless) | Consistente com o frontend existente |

---

## 14. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Migração de dados mock incompleta | Baixa | Seed script com validação de todos os IDs |
| Imagem sem fallback no frontend | Média | `onError` já implementado no `ProdutoCard` |
| JWT expirado em sessão longa | Média | Renovação automática no middleware |
| Banco indisponível em produção | Baixa | Connection pooling via PgBouncer (Neon built-in) |
| Upload de arquivo malicioso | Média | Validação de MIME no servidor + tamanho máximo |
