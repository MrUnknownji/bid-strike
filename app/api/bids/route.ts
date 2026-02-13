import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/database';
import Bid from '@/lib/db/Bid';
import Auction from '@/lib/db/Auction';
import { getTokenFromRequest } from '@/lib/middleware/auth';
import { notifyOutbid } from '@/lib/services/notificationService';

async function processAutoBids(auctionId: string, currentBidderId: string, newPrice: number, bidIncrement: number) {
    const autoBids = await Bid.find({
        auction: auctionId,
        bidder: { $ne: currentBidderId },
        maxAutoBidAmount: { $exists: true, $gt: newPrice },
    }).sort('-maxAutoBidAmount');

    if (autoBids.length === 0) return null;

    const topAutoBid = autoBids[0];
    const autoBidAmount = Math.min(
        topAutoBid.maxAutoBidAmount as number,
        newPrice + bidIncrement
    );

    if (autoBidAmount <= newPrice) return null;

    await Bid.updateMany(
        { auction: auctionId, isWinning: true },
        { isWinning: false }
    );

    const newBid = await Bid.create({
        auction: auctionId,
        bidder: topAutoBid.bidder,
        amount: autoBidAmount,
        isAutoBid: true,
        maxAutoBidAmount: topAutoBid.maxAutoBidAmount,
        isWinning: true,
    });

    await Auction.findByIdAndUpdate(auctionId, {
        currentPrice: autoBidAmount,
        $inc: { totalBids: 1 },
    });

    notifyOutbid(
        currentBidderId,
        auctionId,
        'Auction',
        autoBidAmount
    ).catch(() => {});

    return newBid;
}

export async function POST(request: NextRequest) {
    try {
        const payload = getTokenFromRequest(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();
        const { auctionId, amount, maxAutoBidAmount } = body;

        if (!auctionId || !amount) {
            return NextResponse.json(
                { error: 'Auction ID and amount are required' },
                { status: 400 }
            );
        }

        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        if (auction.status !== 'active') {
            return NextResponse.json({ error: 'Auction is not active' }, { status: 400 });
        }

        if (new Date() > auction.endTime) {
            return NextResponse.json({ error: 'Auction has ended' }, { status: 400 });
        }

        if (auction.seller.toString() === payload.userId) {
            return NextResponse.json(
                { error: 'Cannot bid on your own auction' },
                { status: 400 }
            );
        }

        const minBid = auction.currentPrice + auction.bidIncrement;
        if (amount < minBid) {
            return NextResponse.json(
                { error: `Minimum bid is ${minBid}` },
                { status: 400 }
            );
        }

        if (maxAutoBidAmount && maxAutoBidAmount < amount) {
            return NextResponse.json(
                { error: 'Max auto-bid must be greater than or equal to bid amount' },
                { status: 400 }
            );
        }

        // Optimization: Find and update the previous winner in one atomic operation
        // This reduces DB round trips and improves performance
        const previousWinner = await Bid.findOneAndUpdate(
            { auction: auctionId, isWinning: true },
            { isWinning: false },
            { sort: { amount: -1 } }
        );
        const previousBidderId = previousWinner?.bidder?.toString();

        const bid = await Bid.create({
            auction: auctionId,
            bidder: payload.userId,
            amount,
            isAutoBid: false,
            maxAutoBidAmount: maxAutoBidAmount || undefined,
            isWinning: true,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        });

        await Auction.findByIdAndUpdate(auctionId, {
            currentPrice: amount,
            $inc: { totalBids: 1 },
        });

        if (previousBidderId && previousBidderId !== payload.userId) {
            notifyOutbid(previousBidderId, auctionId, auction.title, amount).catch(() => {});
        }

        const autoBidResult = await processAutoBids(
            auctionId,
            payload.userId,
            amount,
            auction.bidIncrement
        );

        if (autoBidResult) {
            return NextResponse.json({
                message: 'Bid placed, but you were outbid by auto-bid!',
                bid,
                outbid: true,
                currentPrice: autoBidResult.amount,
            }, { status: 201 });
        }

        return NextResponse.json({ message: 'Bid placed successfully', bid }, { status: 201 });
    } catch (error) {
        console.error('Place bid error:', error);
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

        const bids = await Bid.find({ bidder: payload.userId })
            .populate('auction', 'title images currentPrice endTime status')
            .sort('-createdAt')
            .limit(50);

        return NextResponse.json({ bids });
    } catch (error) {
        console.error('Get my bids error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
