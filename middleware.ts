import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function runs on the edge and doesn't have access to localStorage directly
// Instead, we'll check for the auth token in the Authorization header
export function middleware(request: NextRequest) {
  const isStaffPath = request.nextUrl.pathname.startsWith('/staff');
  const authHeader = request.headers.get('Authorization');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Don't redirect if already on login page
  if (isLoginPage) {
    return NextResponse.next();
  }

  // If no auth header, redirect to login
  if (!authHeader) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Parse the JWT token
    const token = authHeader.replace('Bearer ', '');
    const tokenData = JSON.parse(atob(token.split('.')[1]));

    // Check if token is expired
    if (tokenData.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Staff routes protection
    if (isStaffPath) {
      const userRoles = tokenData.realm_access?.roles || [];
      if (!userRoles.includes('staff')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};