import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const status = url.searchParams.get('status') ?? undefined;
  const PAGE_SIZE = 20;

  const where = status ? { status: status as any } : {};

  const [total, pedidos] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        status: true,
        compradorNome: true,
        compradorEmail: true,
        total: true,
        metodoPagamento: true,
        entregaTipo: true,
        criadoEm: true,
        pagoEm: true,
      },
    }),
  ]);

  return NextResponse.json({
    pedidos: pedidos.map(p => ({
      ...p,
      total: parseFloat(p.total.toString()),
    })),
    total,
    pages: Math.ceil(total / PAGE_SIZE),
    page,
  });
}
