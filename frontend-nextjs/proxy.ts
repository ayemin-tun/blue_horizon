import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract authentication tokens and user roles from cookie persistence layers
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // ─── 1. ADMIN ROUTES GUARD ──────────────────────────────────────────────
  // Secures all application control endpoints beginning with the '/admin' prefix
  if (pathname.startsWith('/admin')) {
    // Redirect unauthenticated clients directly back to the session portal
    if (!token) {
      return NextResponse.redirect(new URL('/login?alert_action=unauthorized', request.url));
    }
    // Block certified users lacking explicit admin authorization levels
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/?alert_action=forbidden', request.url));
    }
  }

  // ─── 2. AGENT ROUTES GUARD ──────────────────────────────────────────────
  // Secures corporate agent operations, dashboards, and discrete booking indices
  if (pathname.startsWith('/agent')) {
    // Intercept anonymous traffic and redirect to authentication screen
    if (!token) {
      return NextResponse.redirect(new URL('/login?alert_action=unauthorized', request.url));
    }
    // Enforce role separation; prevent other roles (e.g., admin) from executing agent actions
    if (role !== 'agent') {
      return NextResponse.redirect(new URL('/?alert_action=forbidden', request.url));
    }
  }

  // ─── 3. AUTHENTICATION REVERSE-GUARD ────────────────────────────────────
  // Prevents active sessions from retroactively accessing registration or login workflows
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      return NextResponse.redirect(new URL('/?alert_action=already_logged_in', request.url));
    }
  }

  // Fallthrough case permits compliant sessions to pass safely to upstream page routers
  return NextResponse.next();
}

// ─── ROUTE INTERCEPTION CONFIGURATION ──────────────────────────────────────
export const config = {
  // Registers active route matching targets to route through this middleware engine
  matcher: [
    '/admin/:path*', // Captures all sub-routes nested within the admin domain
    '/agent/:path*', // Captures all sub-routes nested within the agent profile scopes
    '/login',
    '/register'
  ],
};