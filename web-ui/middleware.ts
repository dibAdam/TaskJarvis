import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/tasks',
  '/workspaces',
  '/analytics',
  '/assistant'
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

// Public routes that don't require authentication
const publicRoutes = ['/', '/landing'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip middleware for API routes, static files, etc.
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('session')?.value;
  const session = await decrypt(cookie);

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => path === route);

  // Create response
  const response = NextResponse.next();

  // Add session info to request headers for Server Components to access
  if (session) {
    response.headers.set('x-user-id', String(session.userId));
    response.headers.set('x-user-email', session.email);
    response.headers.set('x-user-authenticated', 'true');
  } else {
    response.headers.set('x-user-authenticated', 'false');
  }

  // Redirect to /login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', req.nextUrl);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to /dashboard if accessing auth routes with active session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};