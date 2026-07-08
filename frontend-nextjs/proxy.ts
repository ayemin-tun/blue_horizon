import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // middleware logic for damin route
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?alert_action=unauthorized', request.url));
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/?alert_action=forbidden', request.url));
    }
  }

  // middleware logic for login/register
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      return NextResponse.redirect(new URL('/?alert_action=already_logged_in', request.url));
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*','/login','/register'],
};