import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Watchlist from '@/lib/db/Watchlist';
import Auction from '@/lib/db/Auction';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const existing = await Watchlist.findOne({
            user: payload.userId,
            auction: id,
        });

        if (existing) {
            return NextResponse.json({ message: 'Already in watchlist' });
        }

        await Watchlist.create({ user: payload.userId, auction: id });
        await Auction.findByIdAndUpdate(id, { $inc: { watchCount: 1 } });

        return NextResponse.json({ message: 'Added to watchlist' }, { status: 201 });
    } catch (error) {
        console.error('Add to watchlist error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const deleted = await Watchlist.findOneAndDelete({
            user: payload.userId,
            auction: id,
        });

        if (deleted) {
            await Auction.findByIdAndUpdate(id, { $inc: { watchCount: -1 } });
        }

        return NextResponse.json({ message: 'Removed from watchlist' });
    } catch (error) {
        console.error('Remove from watchlist error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
