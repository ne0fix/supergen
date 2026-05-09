'use client';

import { useState, useEffect, useCallback } from 'react';
import { SecaoHomeDTO } from '../lib/dto';

export function useHomeSecoesViewModel() {
  const [secoes, setSecoes] = useState<SecaoHomeDTO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const fetchSecoes = useCallback(async () => {
    try {
      setCarregando(true);
      const response = await fetch('/api/home/secoes', { cache: 'no-store' });
      if (!response.ok) throw new Error('Falha ao buscar as seções da home.');
      const data: SecaoHomeDTO[] = await response.json();
      setSecoes(data);
      setErro(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    fetchSecoes();
  }, [fetchSecoes]);

  // Re-busca ao retornar para a aba
  useEffect(() => {
    const onFocus = () => fetchSecoes();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchSecoes]);

  return { secoes, carregando, erro };
}
