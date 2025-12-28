import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Auction from '@/lib/db/Auction';
import { getTokenFromRequest } from '@/lib/middleware/auth';

const EDIT_BUFFER_MINUTES = 30;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const auction = await Auction.findByIdAndUpdate(
            id,
            { $inc: { viewCount: 1 } },
            { new: true }
        )
            .populate('seller', 'username avatar rating totalReviews')
            .populate('category', 'name slug parent')
            .populate('winner', 'username avatar');

        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        return NextResponse.json({ auction });
    } catch (error) {
        console.error('Get auction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
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
        const body = await request.json();

        const auction = await Auction.findById(id);
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        if (auction.seller.toString() !== payload.userId && payload.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const now = new Date();
        const startTime = new Date(auction.startTime);
        const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60);

        if (auction.status === 'ended') {
            return NextResponse.json({ error: 'Cannot edit ended auction' }, { status: 400 });
        }

        if (auction.status === 'active') {
            if (auction.totalBids > 0) {
                return NextResponse.json(
                    { error: 'Cannot edit auction with active bids' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: 'Cannot edit live auction. Cancel it first if no bids exist.' },
                { status: 400 }
            );
        }

        if (auction.status === 'scheduled' && minutesUntilStart < EDIT_BUFFER_MINUTES) {
            return NextResponse.json(
                { error: `Cannot edit within ${EDIT_BUFFER_MINUTES} minutes of start time` },
                { status: 400 }
            );
        }

        const allowedFields = [
            'title', 'description', 'condition', 'images', 'category',
            'startingPrice', 'bidIncrement', 'startTime', 'endTime'
        ];

        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (updates.startTime) {
            const newStart = new Date(updates.startTime as string);
            const bufferTime = new Date(now.getTime() + EDIT_BUFFER_MINUTES * 60 * 1000);
            if (newStart < bufferTime) {
                return NextResponse.json(
                    { error: `Start time must be at least ${EDIT_BUFFER_MINUTES} minutes from now` },
                    { status: 400 }
                );
            }
        }

        if (updates.endTime && updates.startTime) {
            const start = new Date(updates.startTime as string);
            const end = new Date(updates.endTime as string);
            if (end <= start) {
                return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
            }
        }

        if (updates.startingPrice !== undefined) {
            updates.currentPrice = updates.startingPrice;
        }

        const updated = await Auction.findByIdAndUpdate(id, updates, { new: true });
        return NextResponse.json({ message: 'Auction updated', auction: updated });
    } catch (error) {
        console.error('Update auction error:', error);
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

        const auction = await Auction.findById(id);
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        if (auction.seller.toString() !== payload.userId && payload.role !== 'admin') {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        if (auction.status === 'active' && auction.totalBids > 0) {
            return NextResponse.json(
                { error: 'Cannot delete auction with active bids' },
                { status: 400 }
            );
        }

        await Auction.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Auction deleted' });
    } catch (error) {
        console.error('Delete auction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
