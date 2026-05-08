'use client';

import { useState, useEffect } from 'react';
import { SecaoHomeDTO } from '../lib/dto';

export function useHomeSecoesViewModel() {
  const [secoes, setSecoes] = useState<SecaoHomeDTO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSecoes() {
      try {
        setCarregando(true);
        const response = await fetch('/api/home/secoes');
        if (!response.ok) {
          throw new Error('Falha ao buscar as seções da home.');
        }
        const data: SecaoHomeDTO[] = await response.json();
        setSecoes(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
        setErro(errorMessage);
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    fetchSecoes();
  }, []); // Empty dependency array means this runs once on mount

  return { secoes, carregando, erro };
}
