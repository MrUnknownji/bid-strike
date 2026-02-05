import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Auction from '@/lib/db/Auction';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');

        const query: Record<string, unknown> = { seller: payload.userId };

        if (status && status !== 'all') {
            query.status = status;
        }

        const auctions = await Auction.find(query)
            .populate('category', 'name slug')
            .sort('-createdAt')
            .limit(limit);

        return NextResponse.json({ auctions });
    } catch (error) {
        console.error('Get my auctions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
