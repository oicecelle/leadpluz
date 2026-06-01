import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value;
  const path = request.nextUrl.pathname;

  // Protect /dashboard and /admin routes
  const isDashboardRoute = path.startsWith('/dashboard');
  const isAdminRoute = path.startsWith('/admin');

  if (!token && (isDashboardRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    const planStatus = request.cookies.get('plan-status')?.value || 'inactive';
    const isAdmin = request.cookies.get('is-admin')?.value === 'true';

    // Users with inactive plans should only be allowed on /planos (or config/billing)
    if (isDashboardRoute && planStatus !== 'active' && planStatus !== 'trial' && path !== '/dashboard/planos' && !path.startsWith('/dashboard/config')) {
      return NextResponse.redirect(new URL('/planos', request.url));
    }

    // Protect admin routes
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard/leads', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
