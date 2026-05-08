import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { produtoToAdminDTO } from '@/src/lib/dto';
import { ProdutoUpdateSchema } from '@/src/utils/validators';
import { Prisma } from '@prisma/client';

// GET /api/admin/produtos/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: params.id },
      include: {
        categoria: true,
        tags: { include: { tag: true } },
      },
    });

    if (!produto) {
      return new NextResponse('Produto não encontrado', { status: 404 });
    }

    return NextResponse.json(produtoToAdminDTO(produto));
  } catch (error) {
    console.error(`Erro ao buscar produto ${params.id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


// PUT /api/admin/produtos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validation = ProdutoUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Dados inválidos.', details: validation.error.flatten() }, { status: 400 });
        }
        
        const { tags, ...data } = validation.data;

        const updatedProduto = await prisma.$transaction(async (tx) => {
            if (tags) {
                // Disconnect all existing tags for this product before connecting new ones.
                await tx.produtoTag.deleteMany({
                    where: { produtoId: params.id },
                });
            }

            const product = await tx.produto.update({
                where: { id: params.id },
                data: {
                    ...data,
                    ...(tags && {
                        tags: {
                            create: tags.map((tagId: string) => ({
                                tag: { connect: { id: tagId } },
                            })),
                        },
                    }),
                },
                include: {
                    categoria: true,
                    tags: { include: { tag: true } },
                },
            });
            return product;
        });

        return NextResponse.json(produtoToAdminDTO(updatedProduto));

    } catch (error) {
        console.error(`Erro ao atualizar produto ${params.id}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
             if (error.code === 'P2025') { // Record to update not found
                 return new NextResponse('Produto não encontrado para atualização', { status: 404 });
            }
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}


// DELETE /api/admin/produtos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
        // Soft delete
        await prisma.produto.update({
            where: { id: params.id },
            data: { ativo: false },
        });

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error(`Erro ao deletar produto ${params.id}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
             if (error.code === 'P2025') { // Record to delete not found
                 return new NextResponse('Produto não encontrado para deletar', { status: 404 });
            }
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
