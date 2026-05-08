import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { produtoToDTO } from '@/src/lib/dto';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const produto = await prisma.produto.findFirst({
      where: {
        id: id,
        ativo: true,
      },
      include: {
        categoria: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!produto) {
      return new NextResponse('Produto não encontrado', { status: 404 });
    }

    const produtoDTO = produtoToDTO(produto);

    return NextResponse.json(produtoDTO);
  } catch (error) {
    console.error(`Erro ao buscar produto com id: ${params.id}`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
