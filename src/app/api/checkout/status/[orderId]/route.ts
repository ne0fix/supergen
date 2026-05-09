import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      total: true,
      metodoPagamento: true,
      mpPaymentId: true,
      mpQrCode: true,
      mpQrCodeBase64: true,
      compradorEmail: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    total: parseFloat(order.total.toString()),
    metodo: order.metodoPagamento,
    mpPaymentId: order.mpPaymentId,
    qrCode: order.mpQrCode,
    qrCodeBase64: order.mpQrCodeBase64,
  });
}
