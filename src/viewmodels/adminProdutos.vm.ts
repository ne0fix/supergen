'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProdutoAdminDTO } from '@/src/lib/dto';

interface UseAdminProdutosReturn {
    produtos: ProdutoAdminDTO[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    } | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    toggleEstoque: (id: string, emEstoque: boolean) => Promise<void>;
    deleteProduto: (id: string) => Promise<void>;
}

export function useAdminProdutos(): UseAdminProdutosReturn {
    const searchParams = useSearchParams();
    const [produtos, setProdutos] = useState<ProdutoAdminDTO[]>([]);
    const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const searchParamsStr = searchParams.toString();

    const fetchProdutos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/produtos?${searchParamsStr}`);
            if (!response.ok) {
                throw new Error('Falha ao buscar produtos do admin.');
            }
            const data = await response.json();
            setProdutos(data.data);
            setPagination({
                page: data.page,
                limit: data.limit,
                total: data.total,
                totalPages: data.totalPages,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido ao buscar produtos.');
        } finally {
            setLoading(false);
        }
    }, [searchParamsStr]);

    useEffect(() => {
        fetchProdutos();
    }, [fetchProdutos]);

    const toggleEstoque = async (id: string, emEstoque: boolean) => {
        // Optimistic update
        setProdutos(produtos.map(p => p.id === id ? { ...p, emEstoque } : p));
        try {
            await fetch(`/api/admin/produtos/${id}/estoque`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emEstoque }),
            });
        } catch (error) {
            // Revert on error
            setProdutos(produtos.map(p => p.id === id ? { ...p, emEstoque: !emEstoque } : p));
            console.error("Falha ao atualizar estoque:", error);
        }
    };

    const deleteProduto = async (id: string) => {
        // Optimistic update
        const originalProdutos = [...produtos];
        setProdutos(originalProdutos.filter(p => p.id !== id));
        try {
            const res = await fetch(`/api/admin/produtos/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Falha ao deletar produto.');
            }
        } catch (error) {
            // Revert on error
            setProdutos(originalProdutos);
            console.error("Falha ao deletar produto:", error);
        }
    };

    return { produtos, pagination, loading, error, refetch: fetchProdutos, toggleEstoque, deleteProduto };
}
