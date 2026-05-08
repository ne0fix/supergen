import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ ok: true });

    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro no logout:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
