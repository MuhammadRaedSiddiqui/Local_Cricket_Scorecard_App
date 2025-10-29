import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';

interface Params {
  params: { id: string }
}

// GET /api/matches/[id] - Get match by ID or code
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Check if it's a 6-character code or MongoDB ID
    let match;
    if (id.length === 6) {
      match = await Match.findOne({ matchCode: id.toUpperCase() })
        .populate('createdBy', 'name email');
    } else {
      match = await Match.findById(id)
        .populate('createdBy', 'name email');
    }

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: match
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    );
  }
}