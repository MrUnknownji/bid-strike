import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Auction from '@/lib/db/Auction';
import { getTokenFromRequest } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status') || '';
        const search = searchParams.get('search') || '';

        const query: Record<string, unknown> = {};
        if (status) query.status = status;
        if (search) query.$text = { $search: search };

        const total = await Auction.countDocuments(query);
        const auctions = await Auction.find(query)
            .populate('seller', 'username')
            .populate('category', 'name')
            .select('title currentPrice status isFeatured startTime endTime createdAt images')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            auctions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin get auctions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();
        const { auctionId, action } = body;

        if (!auctionId || !action) {
            return NextResponse.json({ error: 'Auction ID and action are required' }, { status: 400 });
        }

        let update = {};
        switch (action) {
            case 'feature':
                update = { isFeatured: true };
                break;
            case 'unfeature':
                update = { isFeatured: false };
                break;
            case 'cancel':
                update = { status: 'cancelled' };
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const auction = await Auction.findByIdAndUpdate(auctionId, update, { new: true })
            .select('title status isFeatured');

        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Auction updated', auction });
    } catch (error) {
        console.error('Admin update auction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();
        const { searchParams } = new URL(request.url);
        const auctionId = searchParams.get('id');

        if (!auctionId) {
            return NextResponse.json({ error: 'Auction ID is required' }, { status: 400 });
        }

        const auction = await Auction.findByIdAndDelete(auctionId);
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Auction deleted' });
    } catch (error) {
        console.error('Admin delete auction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
