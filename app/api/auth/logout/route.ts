import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Clear the auth cookie (TC005)
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  // Clear the auth cookie
  response.cookies.set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  // Note: JWT tokens are stateless, so we can't invalidate them server-side
  // Client must clear localStorage and the expired cookie will prevent reuse
  // For production, consider implementing token blacklisting or shorter expiration

  return response;
}