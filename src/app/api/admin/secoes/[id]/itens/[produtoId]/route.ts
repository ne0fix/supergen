import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// DELETE /api/admin/secoes/[id]/itens/[produtoId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> },
) {
  try {
    const { id: secaoId, produtoId } = await params;

    await prisma.secaoItem.delete({
      where: { secaoId_produtoId: { secaoId, produtoId } },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao remover item da seção:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
