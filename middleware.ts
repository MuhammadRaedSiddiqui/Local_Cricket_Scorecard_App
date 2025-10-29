import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
]

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/matches',
  '/profile',
  '/settings',
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )

  // If it's a protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }

  // If user is logged in and tries to access login/register, redirect to dashboard
  if (token && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need protection
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}