// FILE: lib/pusher-client.ts (OPTIMIZED)

import PusherClient from 'pusher-js';

// 1. Get the key and cluster from public environment variables
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY!;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

if (!PUSHER_KEY || !PUSHER_CLUSTER) {
  throw new Error('NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER are not set');
}

// 2. Export the configured client instance
export const pusherClient = new PusherClient(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  
  // --- THIS IS THE CRITICAL MISSING PIECE ---
  // We tell Pusher to use our API route for authorizing private channels.
  // It will automatically make a POST request to this endpoint.
  authEndpoint: '/api/pusher/auth',
  // --- END OF FIX ---
});