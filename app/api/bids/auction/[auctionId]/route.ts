import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Bid from '@/lib/db/Bid';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ auctionId: string }> }
) {
    try {
        await connectDB();
        const { auctionId } = await params;

        const bids = await Bid.find({ auction: auctionId })
            .populate('bidder', 'username avatar')
            .sort('-amount')
            .limit(50);

        return NextResponse.json({ bids });
    } catch (error) {
        console.error('Get bid history error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
