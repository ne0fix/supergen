import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return new NextResponse(JSON.stringify({ message: 'Nome do arquivo não fornecido.' }), { status: 400 });
  }

  if (!request.body) {
    return new NextResponse(JSON.stringify({ message: 'Nenhum arquivo no corpo da requisição.' }), { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    return NextResponse.json(blob);
    
  } catch (error) {
    console.error('Erro no upload para o Vercel Blob:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    return new NextResponse(JSON.stringify({ message: 'Erro interno ao fazer upload do arquivo.', error: message }), { status: 500 });
  }
}
