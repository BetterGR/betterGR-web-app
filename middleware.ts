import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname === '/callback';
  const isApiPath = request.nextUrl.pathname.startsWith('/api');
  const isPublicPath = request.nextUrl.pathname.startsWith('/_next') || 
                      request.nextUrl.pathname.startsWith('/favicon.ico');
  
  // Always allow public paths and API routes
  if (isAuthPage || isApiPath || isPublicPath) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('auth_data')?.value;

  // If no auth cookie, redirect to callback which will handle Keycloak login
  if (!authCookie) {
    const response = NextResponse.redirect(new URL('/callback', request.url));
    response.headers.set('Clear-Auth-State', 'true');
    return response;
  }

  try {
    // Parse the auth data
    const authData = JSON.parse(authCookie);
    
    // Check if token is expired
    if (authData.expires_at < Date.now()) {
      // If we have a refresh token, let the client handle the refresh
      if (authData.refresh_token) {
        const response = NextResponse.next();
        response.headers.set('Token-Expired', 'true');
        return response;
      }
      
      // If no refresh token, redirect to callback
      const response = NextResponse.redirect(new URL('/callback', request.url));
      response.cookies.delete('auth_data');
      response.headers.set('Clear-Auth-State', 'true');
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    // If there's any error parsing the cookie or it's invalid, redirect to callback
    const response = NextResponse.redirect(new URL('/callback', request.url));
    response.cookies.delete('auth_data');
    response.headers.set('Clear-Auth-State', 'true');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};