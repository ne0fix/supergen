'use client';
import { useState, useEffect } from 'react';

interface Admin {
    id: string;
    email: string;
    nome: string;
}

export function useAdmin() {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAdmin() {
            try {
                setLoading(true);
                const res = await fetch('/api/auth/me');
                if (!res.ok) {
                    throw new Error('Não autenticado');
                }
                const data = await res.json();
                setAdmin(data.admin);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar dados do admin');
            } finally {
                setLoading(false);
            }
        }
        fetchAdmin();
    }, []);

    return { admin, loading, error };
}
