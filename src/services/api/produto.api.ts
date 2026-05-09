import { Produto, Categoria } from '../../models/produto.model';

const API_BASE_URL = '/api';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`A chamada à API falhou: ${response.statusText}`);
  }
  return response.json();
}

export const ProdutoAPI = {
  async listarProdutos(params?: { categoria?: string; tag?: string; emEstoque?: boolean }): Promise<Produto[]> {
    const searchParams = new URLSearchParams();
    if (params?.categoria) searchParams.set('categoria', params.categoria);
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.emEstoque !== undefined) searchParams.set('emEstoque', String(params.emEstoque));
    
    const queryString = searchParams.toString();
    return fetchAPI<Produto[]>(`/produtos${queryString ? `?${queryString}` : ''}`);
  },
  
  async obterProduto(id: string): Promise<Produto | null> {
    try {
      return await fetchAPI<Produto>(`/produtos/${id}`);
    } catch (error) {
      console.error(`Erro ao obter produto ${id}:`, error);
      return null;
    }
  },

  async listarCategorias(): Promise<Categoria[]> {
    return fetchAPI<Categoria[]>('/categorias');
  },

  async buscarProdutos(query: string): Promise<Produto[]> {
    return fetchAPI<Produto[]>(`/produtos?q=${encodeURIComponent(query)}`);
  },

  async listarRelacionados(categoriaId: string, excludeId: string, limit = 5): Promise<Produto[]> {
    return fetchAPI<Produto[]>(
      `/produtos?categoria=${encodeURIComponent(categoriaId)}&limit=${limit}&exclude=${excludeId}`
    );
  },
};
