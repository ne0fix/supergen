'use client';

import { useState, useEffect } from 'react';
import { Categoria } from '../models/produto.model';
import { ProdutoAPI } from '../services/api/produto.api';

export function useCategoriasViewModel() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategorias() {
      try {
        setCarregando(true);
        const data = await ProdutoAPI.listarCategorias();
        setCategorias(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
        setErro(errorMessage);
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    fetchCategorias();
  }, []);

  return { categorias, carregando, erro };
}
