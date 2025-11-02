import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

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
      match = await Match.findOne({ matchCode: id.toUpperCase() });
    } else {
      match = await Match.findById(id);
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
    console.error('Get match error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    );
  }
}


// DELETE - Remove match
export async function DELETE(request: NextRequest, { params }: Params) {
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

    // Check if user is the creator (only creator can delete)
    if (match.createdBy.toString() !== user.userId) {
      return NextResponse.json({ 
        error: 'Forbidden: Only match creator can delete' 
      }, { status: 403 });
    }

    // Delete the match
    await Match.findByIdAndDelete(params.id);

    // Remove match from user's created matches
    await User.findByIdAndUpdate(user.userId, {
      $pull: { createdMatches: params.id }
    });

    console.log('✅ Match deleted:', params.id);

    return NextResponse.json({
      success: true,
      message: 'Match deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Delete match error:', error);
    return NextResponse.json(
      { error: 'Failed to delete match', details: error.message },
      { status: 500 }
    );
  }
}