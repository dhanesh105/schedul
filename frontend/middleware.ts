import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/appointments',
  '/schedules',
  '/doctors/new',
  '/patients',
  '/leaves'
];

// Define routes that should redirect authenticated users away
const authRoutes = [
  '/login',
  '/register',
  '/register/doctor',
  '/register/patient'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/doctors',
  '/unauthorized'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication token from cookies
  const authToken = request.cookies.get('schedula_auth_token')?.value;
  const userRole = request.cookies.get('schedula_user_role')?.value;

  console.log('🔍 Middleware - Path:', pathname);
  console.log('🔍 Middleware - Auth Token:', authToken ? 'Present' : 'Not Present');
  console.log('🔍 Middleware - User Role:', userRole);

  // Check if user is authenticated
  const isAuthenticated = !!authToken;

  // Handle authentication routes (login, register)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      console.log('✅ Authenticated user trying to access auth route, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow unauthenticated users to access auth routes
    console.log('👤 Unauthenticated user accessing auth route, allowing');
    return NextResponse.next();
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      console.log('❌ Unauthenticated user trying to access protected route, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based access control
    if (pathname.startsWith('/doctors/new') && userRole !== 'ADMIN') {
      console.log('❌ Non-admin user trying to create doctor, redirecting to unauthorized');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (pathname.startsWith('/schedules') && userRole !== 'DOCTOR') {
      console.log('❌ Non-doctor user trying to access schedules, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/patients') && userRole !== 'DOCTOR') {
      console.log('❌ Non-doctor user trying to access patients, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/leaves') && userRole !== 'DOCTOR') {
      console.log('❌ Non-doctor user trying to access leaves, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.log('✅ Authenticated user accessing protected route, allowing');
    return NextResponse.next();
  }

  // Handle public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    console.log('🌐 Public route accessed, allowing');
    return NextResponse.next();
  }

  // Handle dynamic routes like /doctors/[id], /appointments/[id], etc.
  if (pathname.match(/^\/doctors\/[^\/]+$/) ||
      pathname.match(/^\/appointments\/[^\/]+$/) ||
      pathname.match(/^\/schedules\/[^\/]+$/)) {

    if (pathname.startsWith('/appointments/') && !isAuthenticated) {
      console.log('❌ Unauthenticated user trying to access appointment details, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/schedules/') && userRole !== 'DOCTOR') {
      console.log('❌ Non-doctor user trying to access schedule details, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.log('🔗 Dynamic route accessed, allowing');
    return NextResponse.next();
  }

  // Default: allow access
  console.log('🔄 Default case, allowing access');
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|json|css|txt)$).*)',
    // Explicitly include auth routes to ensure middleware runs
    '/login',
    '/register/:path*',
    '/dashboard',
    '/profile',
    '/appointments/:path*',
    '/schedules/:path*',
    '/doctors/:path*',
    '/patients/:path*',
    '/leaves/:path*'
  ],
};
