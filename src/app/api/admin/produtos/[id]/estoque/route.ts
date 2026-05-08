import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { EstoqueUpdateSchema } from '@/src/utils/validators';
import { Prisma } from '@prisma/client';

// PATCH /api/admin/produtos/[id]/estoque
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = EstoqueUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Dados inválidos.', details: validation.error.flatten() }, { status: 400 });
    }

    const { emEstoque } = validation.data;

    const updatedProduto = await prisma.produto.update({
      where: { id: params.id },
      data: { emEstoque },
    });

    return NextResponse.json({ id: updatedProduto.id, emEstoque: updatedProduto.emEstoque });

  } catch (error) {
    console.error(`Erro ao atualizar estoque do produto ${params.id}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') { // Record to update not found
        return new NextResponse('Produto não encontrado para atualização', { status: 404 });
      }
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
