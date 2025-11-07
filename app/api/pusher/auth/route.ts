import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get socket_id and channel_name from the request body
    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    // 3. Verify the user is allowed to subscribe to this channel
    // We only allow a user to subscribe to their own channel
    const expectedChannelName = `private-user-${user.userId}`;
    if (channelName !== expectedChannelName) {
      console.warn(`[Pusher Auth] Forbidden: User ${user.userId} tried to access ${channelName}`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Authorize the subscription
    const authResponse = pusherServer.authenticate(socketId, channelName);

    return NextResponse.json(authResponse);

  } catch (error: any) {
    console.error('Pusher Auth Error:', error.message);
    return NextResponse.json({ error: 'Pusher auth failed' }, { status: 500 });
  }
}