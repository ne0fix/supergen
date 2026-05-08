import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { CategoriaUpdateSchema } from '@/src/utils/validators';

// PUT /api/admin/categorias/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = CategoriaUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(categoria);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/admin/categorias/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const totalProdutos = await prisma.produto.count({
      where: { categoriaId: id, ativo: true },
    });

    if (totalProdutos > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: ${totalProdutos} produto(s) ativo(s) nesta categoria.` },
        { status: 409 },
      );
    }

    await prisma.categoria.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
