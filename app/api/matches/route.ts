import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';
import { verifyToken } from '@/lib/auth';

// GET /api/matches - Get user's matches
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const createdMatches = await Match.find({ 
      createdBy: user.userId 
    }).sort({ createdAt: -1 });
    
    const joinedMatches = await Match.find({ 
      viewers: user.userId 
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        created: createdMatches,
        joined: joinedMatches
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

// POST /api/matches - Create new match
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const matchData = await request.json();

    const match = await Match.create({
      ...matchData,
      createdBy: user.userId,
      admins: [user.userId],
      scorers: [user.userId]
    });

    return NextResponse.json({
      success: true,
      data: match
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}