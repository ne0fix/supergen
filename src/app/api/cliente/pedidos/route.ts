import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function GET(req: NextRequest) {
  const clienteId = req.headers.get('X-Cliente-Id');
  if (!clienteId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const status = searchParams.get('status');
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const where = {
      clienteId,
      ...(status ? { statusCliente: status as any } : {}),
    };

    const [pedidosRaw, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const pedidos = pedidosRaw.map(p => {
      const statusClienteEfetivo = (() => {
        if (p.status === 'PAID' && (p.statusCliente === 'PEDIDO_REALIZADO' || p.statusCliente === 'PAGAMENTO_PROCESSANDO')) {
          return 'EM_SEPARACAO';
        }
        if ((p.status === 'FAILED' || p.status === 'CANCELLED') && p.statusCliente === 'PEDIDO_REALIZADO') {
          return 'CANCELADO';
        }
        return p.statusCliente;
      })();
      return {
        id: p.id,
        numero: p.id.slice(-8).toUpperCase(),
        total: parseFloat(p.total.toString()),
        metodoPagamento: p.metodoPagamento,
        statusCliente: statusClienteEfetivo,
        criadoEm: p.criadoEm,
        itens: p._count.items,
      };
    });

    return NextResponse.json({
      pedidos,
      total,
      page,
      pages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error('Erro ao listar pedidos do cliente:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
