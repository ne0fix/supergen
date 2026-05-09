'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ProdutoForm from '@/src/components/admin/ProdutoForm';
import { ProdutoFormData, ProdutoUpdateSchema } from '@/src/utils/validators';
import { useAdminProduto } from '@/src/viewmodels/adminProduto.vm';
import { ProdutoFormSkeleton } from '@/src/components/ui/Skeleton';
import { z } from 'zod';

function EditProdutoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { produto, loading, error: fetchError } = useAdminProduto(id);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (data: ProdutoFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);
        
        // Use the update schema for partial data
        const validatedData = ProdutoUpdateSchema.parse(data);

        try {
            const response = await fetch(`/api/admin/produtos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validatedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao atualizar o produto.');
            }

            router.push('/admin/produtos');
            router.refresh();

        } catch (err) {
            if (err instanceof z.ZodError) {
                setSubmitError("Erro de validação. Verifique os campos.");
            } else {
                setSubmitError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) return <ProdutoFormSkeleton />;
    if (fetchError) return <p className="text-red-500 bg-red-100 p-4 rounded-md">Erro: {fetchError}</p>;
    if (!produto) return <p>Produto não encontrado.</p>;

    // Map the DTO to the form data shape
    const formDefaultValues: Partial<ProdutoFormData> = {
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        precoOriginal: produto.precoOriginal,
        imagem: produto.imagem,
        imagens: produto.imagens ?? [],
        quantidadePacote: produto.quantidadePacote,
        categoriaId: produto.categoriaId,
        emEstoque: produto.emEstoque,
        tags: produto.tags,
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Editar Produto: {produto.nome}</h1>
            {submitError && <p className="text-red-500 bg-red-100 p-4 rounded-md">{submitError}</p>}
            <ProdutoForm 
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                defaultValues={formDefaultValues}
            />
        </div>
    );
}

export default EditProdutoPage;
