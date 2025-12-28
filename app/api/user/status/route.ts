import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import User from '@/lib/db/User';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload) {
            return NextResponse.json({ liked: false, watching: false });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const auctionId = searchParams.get('auctionId');

        if (!auctionId) {
            return NextResponse.json({ error: 'Auction ID required' }, { status: 400 });
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return NextResponse.json({ liked: false, watching: false });
        }

        const likedArray = user.likedAuctions || [];
        const watchlistArray = user.watchlist || [];

        const liked = likedArray.some(
            (id: { toString: () => string }) => id.toString() === auctionId
        );
        const watching = watchlistArray.some(
            (id: { toString: () => string }) => id.toString() === auctionId
        );

        return NextResponse.json({ liked, watching });
    } catch (error) {
        console.error('Check status error:', error);
        return NextResponse.json({ liked: false, watching: false });
    }
}
