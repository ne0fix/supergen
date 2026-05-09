import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import MercadoPagoConfig, { Payment } from 'mercadopago';
import { createHmac } from 'crypto';

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});
const mpPayment = new Payment(mpClient);

function validarAssinatura(req: NextRequest, rawBody: string): boolean {
  const webhookSecret = process.env.MP_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('MP_WEBHOOK_SECRET não configurado — pulando validação (não usar em produção)');
    return true; // em desenvolvimento sem secret configurado
  }

  const xSignature = req.headers.get('x-signature') ?? '';

  // Extrai ts e v1 do header x-signature: "ts=1234,v1=abcd"
  const parts = Object.fromEntries(
    xSignature.split(',').map(part => part.split('=')).filter(p => p.length === 2)
  );
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  // Extrai data.id do body para compor the template
  let dataId = '';
  try {
    const parsed = JSON.parse(rawBody);
    dataId = parsed?.data?.id ?? '';
  } catch { return false; }

  // Template: "id:{data.id};request-date:{ts};"
  const template = `id:${dataId};request-date:${ts};`;
  const hmac = createHmac('sha256', webhookSecret).update(template).digest('hex');

  return hmac === v1;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Valida assinatura
  if (!validarAssinatura(req, rawBody)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }

  let notification: { type: string; data: { id: string } };
  try {
    notification = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  // Só processar eventos de pagamento
  if (notification.type !== 'payment') {
    return NextResponse.json({ received: true });
  }

  const mpPaymentId = String(notification.data.id);

  // Consultar status real no MP (não confiar no payload do webhook)
  let pagamento: Awaited<ReturnType<typeof mpPayment.get>>;
  try {
    pagamento = await mpPayment.get({ id: mpPaymentId });
  } catch (err) {
    console.error('Erro ao consultar MP:', err);
    return NextResponse.json({ error: 'Erro ao consultar pagamento' }, { status: 502 });
  }

  const orderId = pagamento.external_reference;
  if (!orderId) {
    return NextResponse.json({ received: true }); // pagamento não relacionado a esta loja
  }

  // Buscar order e verificar idempotência
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true },
  });

  if (!order) return NextResponse.json({ received: true });

  // Não reprocessar pedidos já finalizados
  if (order.status === 'PAID' || order.status === 'CANCELLED') {
    return NextResponse.json({ received: true });
  }

  // Mapear status MP → OrderStatus
  const novoStatus = (() => {
    switch (pagamento.status) {
      case 'approved': return 'PAID';
      case 'rejected':
      case 'cancelled': return 'FAILED';
      case 'in_process':
      case 'pending': return 'PROCESSING';
      default: return null;
    }
  })();

  if (!novoStatus) return NextResponse.json({ received: true });

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: novoStatus,
      mpStatus: pagamento.status ?? null,
      mpPaymentId,
      pagoEm: novoStatus === 'PAID' ? new Date() : undefined,
    },
  });

  return NextResponse.json({ received: true });
}
