import { NextRequest, NextResponse } from 'next/server';
import { calcularFretePorUF } from '@/src/lib/frete';

export async function GET(req: NextRequest) {
  const cep = req.nextUrl.searchParams.get('cep')?.replace(/\D/g, '');
  const subtotalParam = req.nextUrl.searchParams.get('subtotal');

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
  }

  const viaCepRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    next: { revalidate: 3600 },
  });

  if (!viaCepRes.ok) {
    return NextResponse.json({ error: 'Erro ao consultar CEP' }, { status: 502 });
  }

  const dados = await viaCepRes.json();

  if (dados.erro) {
    return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 });
  }

  const subtotal = subtotalParam ? parseFloat(subtotalParam) : 0;
  const limiteFreteGratis = parseFloat(process.env.FRETE_GRATIS_ACIMA ?? '200');
  const freteGratis = subtotal >= limiteFreteGratis;
  const frete = freteGratis ? 0 : calcularFretePorUF(dados.uf ?? '');

  return NextResponse.json({
    logradouro: dados.logradouro ?? '',
    bairro: dados.bairro ?? '',
    cidade: dados.localidade ?? '',
    uf: dados.uf ?? '',
    frete,
    freteGratis,
  });
}
