import {
  Produto,
  Categoria,
  Tag,
  ProdutoTag,
  Secao,
  SecaoItem,
} from '@prisma/client';

// DTOs DE CONTRATO (use estes tipos em todas as rotas)

// Produto retornado pelo BFF público
export interface ProdutoPublicoDTO {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoOriginal: number | null;
  imagem: string;
  categoria: string;
  quantidadePacote: string;
  emEstoque: boolean;
  avaliacao: number;
  numAvaliacoes: number;
  tags: string[];
}

// Seção da home com produtos resolvidos
export interface SecaoHomeDTO {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  ordem: number;
  produtos: ProdutoPublicoDTO[];
  filtroCategoriaId: string | null;
  filtroTag: string | null;
}

// Produto com campos admin
export interface ProdutoAdminDTO extends ProdutoPublicoDTO {
  ativo: boolean;
  categoriaId: string;
  criadoEm: string;
  atualizadoEm: string;
}

// Seção com configuração admin completa
export interface SecaoAdminDTO {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  ordem: number;
  ativo: boolean;
  maxItens: number;
  modoSelecao: 'AUTOMATICO' | 'MANUAL';
  filtroCategoriaId: string | null;
  filtroTag: string | null;
  itens: Array<{ produtoId: string; ordem: number; produto: ProdutoPublicoDTO }>;
  produtosPrevia: ProdutoPublicoDTO[];
}

// Type for Prisma's product model with relations needed for the DTO
export type PrismaProdutoCompleto = Produto & {
  categoria: Categoria;
  tags: (ProdutoTag & { tag: Tag })[];
};

// Type for Prisma's Secao with all relations for admin DTO
export type PrismaSecaoCompleta = Secao & {
  itens: (SecaoItem & { produto: PrismaProdutoCompleto })[];
};

/**
 * Converts a Prisma Produto object (with relations) to a public-facing DTO.
 * @param produto The complete Prisma product object.
 * @returns A product DTO safe to be sent to the client.
 */
export function produtoToDTO(produto: PrismaProdutoCompleto): ProdutoPublicoDTO {
  return {
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao,
    preco: produto.preco.toNumber(),
    precoOriginal: produto.precoOriginal?.toNumber() ?? null,
    imagem: produto.imagem,
    categoria: produto.categoria.nome,
    quantidadePacote: produto.quantidadePacote,
    emEstoque: produto.emEstoque,
    avaliacao: produto.avaliacao,
    numAvaliacoes: produto.numAvaliacoes,
    tags: produto.tags.map((produtoTag) => produtoTag.tag.label),
  };
}

/**
 * Converts a Prisma Secao object and a list of product DTOs into a home section DTO.
 * @param secao The Prisma section object.
 * @param produtos An array of product DTOs to be included in the section.
 * @returns A section DTO for the homepage.
 */
export function secaoToDTO(secao: Secao, produtos: ProdutoPublicoDTO[]): SecaoHomeDTO {
  return {
    id: secao.id,
    slug: secao.slug,
    titulo: secao.titulo,
    subtitulo: secao.subtitulo ?? null,
    ordem: secao.ordem,
    produtos,
    filtroCategoriaId: secao.filtroCategoriaId ?? null,
    filtroTag: secao.filtroTag ?? null,
  };
}

export function secaoToAdminDTO(
  secao: PrismaSecaoCompleta,
  produtosPrevia: ProdutoPublicoDTO[],
): SecaoAdminDTO {
  return {
    id: secao.id,
    slug: secao.slug,
    titulo: secao.titulo,
    subtitulo: secao.subtitulo ?? null,
    ordem: secao.ordem,
    ativo: secao.ativo,
    maxItens: secao.maxItens,
    modoSelecao: secao.modoSelecao,
    filtroCategoriaId: secao.filtroCategoriaId ?? null,
    filtroTag: secao.filtroTag ?? null,
    itens: secao.itens.map((item) => ({
      produtoId: item.produtoId,
      ordem: item.ordem,
      produto: produtoToDTO(item.produto),
    })),
    produtosPrevia,
  };
}

/**
 * Converts a Prisma Produto object (with relations) to an admin-facing DTO.
 * @param produto The complete Prisma product object.
 * @returns An admin product DTO with additional fields.
 */
export function produtoToAdminDTO(produto: PrismaProdutoCompleto): ProdutoAdminDTO {
  const publicDTO = produtoToDTO(produto);
  return {
    ...publicDTO,
    ativo: produto.ativo,
    categoriaId: produto.categoriaId,
    criadoEm: produto.criadoEm.toISOString(),
    atualizadoEm: produto.atualizadoEm.toISOString(),
  };
}
