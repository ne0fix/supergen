export { proxy as middleware } from './src/proxy';

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/cliente/:path*',
    '/api/cliente/:path*',
    '/cadastro',
  ],
};
