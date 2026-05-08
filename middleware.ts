import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './src/lib/auth';

const ADMIN_PATH = '/admin';
const API_ADMIN_PATH = '/api/admin';
const LOGIN_PATH = '/admin/login';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The matcher in `config` ensures this middleware only runs on specified paths,
  // but we still need to explicitly allow access to the login page.
  if (pathname === LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin-token')?.value;
  const adminPayload = token ? verifyJWT(token) : null;

  if (!adminPayload) {
    const isApiRoute = pathname.startsWith(API_ADMIN_PATH);
    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ message: 'Não autorizado' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const loginUrl = new URL(LOGIN_PATH, req.url);
    const response = NextResponse.redirect(loginUrl);

    // Clear the invalid/expired cookie if it exists
    if (token) {
        response.cookies.set('admin-token', '', { maxAge: 0, path: '/' });
    }
    return response;
  }
  
  // If token is valid, attach adminId to the request headers for backend use
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('X-Admin-Id', adminPayload.adminId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
