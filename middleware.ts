import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isApiPath = request.nextUrl.pathname.startsWith('/api');
  const authToken = request.cookies.get('auth_data')?.value;

  // Allow API routes and static assets to pass through
  if (isApiPath || request.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // If user is not authenticated and not on login page, redirect to login
  if (!authToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and on login page, redirect to home
  if (authToken && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};