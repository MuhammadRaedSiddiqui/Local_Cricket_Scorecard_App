import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';
import { verifyToken } from '@/lib/auth';
import { ScoringService } from '@/services/scoring.service';
import { pusherServer } from '@/lib/pusher'; // For real-time updates

interface Params {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const match = await Match.findById(params.id);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Check if user is admin or scorer
    const isAuthorized = 
      match.admins.includes(user.userId) || 
      match.scorers.includes(user.userId);
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const scoreUpdate = await request.json();
    
    // Process score update
    const updatedMatch = await ScoringService.processDelivery(match, scoreUpdate);
    
    // Send real-time update via Pusher (alternative to Socket.io for Next.js)
    await pusherServer.trigger(`match-${params.id}`, 'score-update', {
      match: updatedMatch,
      update: scoreUpdate
    });

    return NextResponse.json({
      success: true,
      data: updatedMatch
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update score' },
      { status: 500 }
    );
  }
}