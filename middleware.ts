import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Run on the Edge
export const runtime = 'experimental-edge'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/matches',
  '/profile',
  '/settings',
]

// Routes hidden from authenticated users
const publicOnlyRoutes = [
  '/login',
  '/register',
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('auth-token')?.value

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => path.startsWith(route))

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from public-only routes
  if (token && isPublicOnlyRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// More specific matcher; skip API and static assets
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}