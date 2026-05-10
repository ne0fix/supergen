import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  try {
    const body = await req.json();
    const { statusCliente } = body;

    if (!statusCliente) {
      return NextResponse.json({ error: 'Status ausente' }, { status: 400 });
    }

    const pedido = await prisma.order.update({
      where: { id },
      data: { statusCliente },
    });

    return NextResponse.json(pedido);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}