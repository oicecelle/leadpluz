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
    const planStatus = request.cookies.get('plan-status')?.value || 'active';
    const isAdmin = request.cookies.get('is-admin')?.value === 'true';

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
