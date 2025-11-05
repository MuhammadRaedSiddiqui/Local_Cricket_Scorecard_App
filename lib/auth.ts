import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface UserToken {
  userId: string;
  email: string;
}

export async function verifyToken(request: NextRequest): Promise<UserToken | null> {
  try {
    // Check both Authorization header and cookies (TC012)
    const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader || cookieToken;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserToken;
    return decoded;
  } catch (error) {
    return null;
  }
}