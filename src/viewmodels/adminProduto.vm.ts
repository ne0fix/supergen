'use client';
import { useState, useEffect } from 'react';
import { ProdutoAdminDTO } from '@/src/lib/dto';

export function useAdminProduto(id: string) {
    const [produto, setProduto] = useState<ProdutoAdminDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError('ID do produto não fornecido.');
            return;
        };
        
        async function fetchProduto() {
            try {
                setLoading(true);
                const res = await fetch(`/api/admin/produtos/${id}`);
                if (!res.ok) {
                    throw new Error('Produto não encontrado ou falha na requisição.');
                }
                const data = await res.json();
                setProduto(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar dados do produto');
            } finally {
                setLoading(false);
            }
        }
        fetchProduto();
    }, [id]);

    return { produto, loading, error };
}
