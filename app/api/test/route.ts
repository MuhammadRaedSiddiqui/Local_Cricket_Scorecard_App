import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    routes: {
      matches: '/api/matches',
      matchById: '/api/matches/[id]',
      score: '/api/matches/[id]/score'
    }
  });
}