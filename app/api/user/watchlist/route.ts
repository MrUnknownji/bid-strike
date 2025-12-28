import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import User from '@/lib/db/User';
import { getTokenFromRequest } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();
        const { auctionId } = body;

        if (!auctionId) {
            return NextResponse.json({ error: 'Auction ID required' }, { status: 400 });
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const auctionObjectId = new mongoose.Types.ObjectId(auctionId);
        const watchlistArray: mongoose.Types.ObjectId[] = user.watchlist || [];

        const existingIndex = watchlistArray.findIndex(
            (id) => id.toString() === auctionId
        );

        let watching: boolean;
        if (existingIndex > -1) {
            watchlistArray.splice(existingIndex, 1);
            watching = false;
        } else {
            watchlistArray.push(auctionObjectId);
            watching = true;
        }

        await User.findByIdAndUpdate(payload.userId, { watchlist: watchlistArray });

        return NextResponse.json({ watching, watchlistCount: watchlistArray.length });
    } catch (error) {
        console.error('Watchlist toggle error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(payload.userId)
            .populate({
                path: 'watchlist',
                select: 'title images currentPrice endTime status totalBids',
                model: 'Auction',
            });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const auctions = user.watchlist || [];
        return NextResponse.json({ auctions });
    } catch (error) {
        console.error('Get watchlist error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
