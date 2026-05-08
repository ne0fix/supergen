import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { OrdemItensSchema } from '@/src/utils/validators';

// PUT /api/admin/secoes/[id]/ordem
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: secaoId } = await params;
    const body = await req.json();
    const validation = OrdemItensSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Formato inválido.' }, { status: 400 });
    }

    await prisma.$transaction(
      validation.data.map(({ produtoId, ordem }) =>
        prisma.secaoItem.update({
          where: { secaoId_produtoId: { secaoId, produtoId } },
          data: { ordem },
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao reordenar itens:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
