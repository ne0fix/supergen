import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/src/lib/prisma';

const AddItemSchema = z.object({ produtoId: z.string().min(1) });

// POST /api/admin/secoes/[id]/itens
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: secaoId } = await params;
    const body = await req.json();
    const validation = AddItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'produtoId é obrigatório.' }, { status: 400 });
    }

    const { produtoId } = validation.data;

    const produto = await prisma.produto.findUnique({ where: { id: produtoId, ativo: true } });
    if (!produto) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });

    const existente = await prisma.secaoItem.findUnique({
      where: { secaoId_produtoId: { secaoId, produtoId } },
    });
    if (existente) {
      return NextResponse.json({ error: 'Produto já está nesta seção.' }, { status: 409 });
    }

    const ultimaOrdem = await prisma.secaoItem.count({ where: { secaoId } });

    const item = await prisma.secaoItem.create({
      data: { secaoId, produtoId, ordem: ultimaOrdem },
      include: { produto: { include: { categoria: true, tags: { include: { tag: true } } } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar item à seção:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
